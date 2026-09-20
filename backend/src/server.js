const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");

// Gọi file kết nối DB (data.js)
const dbPromise = require("./data");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "uniportal-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 giờ
  }),
);

// Cấu hình thư mục tĩnh public
const publicPath = path.join(__dirname, "../../public");
app.use(express.static(publicPath));

// Mở file login.html khi truy cập đường dẫn gốc '/'
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "ui/login_ui/login.html"));
});

// Hàm hỗ trợ đồng bộ dữ liệu sinh viên mẫu nếu chưa có trong MySQL
async function ensureStudentExists(db, username) {
  const [svRows] = await db.execute("SELECT * FROM sinhvien WHERE Username = ?", [username]);
  if (svRows.length === 0) {
    const defaultMsv = "28A4042280";
    const defaultName = "Nguyễn Thành Trung";
    const defaultClass = "K28CNTTA";
    const defaultFaculty = "CNTT";

    try {
      await db.execute(
        "INSERT INTO sinhvien (MSV, Ten, Khoa, Lop, Username) VALUES (?, ?, ?, ?, ?)",
        [defaultMsv, defaultName, defaultFaculty, defaultClass, username]
      );
    } catch (e) {
      console.warn("Lưu ý khi tạo sinh viên mẫu:", e.message);
    }

    return {
      MSV: defaultMsv,
      Ten: defaultName,
      Khoa: defaultFaculty,
      Lop: defaultClass,
      Username: username,
    };
  }
  return svRows[0];
}

// Hàm khởi tạo và đồng bộ các cột cho chương trình đào tạo & tra cứu
async function initCurriculumData(db) {
  try {
    const [cols] = await db.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hocphan'
    `);
    const colNames = cols.map((c) => c.COLUMN_NAME);

    if (!colNames.includes("LoaiMon")) {
      await db.execute("ALTER TABLE hocphan ADD COLUMN LoaiMon VARCHAR(50) DEFAULT 'Bắt buộc'");
    }
    if (!colNames.includes("Khoa")) {
      await db.execute("ALTER TABLE hocphan ADD COLUMN Khoa VARCHAR(100) DEFAULT 'Khoa Công nghệ thông tin'");
    }
    if (!colNames.includes("SoTiet_LT")) {
      await db.execute("ALTER TABLE hocphan ADD COLUMN SoTiet_LT INT DEFAULT 30");
    }
    if (!colNames.includes("SoTiet_TH")) {
      await db.execute("ALTER TABLE hocphan ADD COLUMN SoTiet_TH INT DEFAULT 15");
    }
    if (!colNames.includes("HPTienQuyet")) {
      await db.execute("ALTER TABLE hocphan ADD COLUMN HPTienQuyet VARCHAR(255) DEFAULT 'Không'");
    }
    if (!colNames.includes("HocKy")) {
      await db.execute("ALTER TABLE hocphan ADD COLUMN HocKy INT DEFAULT 1");
    }

    const sampleCourses = [
      ["THML01", "Triết học Mác-Lênin", 3, "Bắt buộc", "Khoa Lý luận chính trị", 45, 0, "Không", 1],
      ["TRR01", "Toán rời rạc", 3, "Bắt buộc", "Khoa Công nghệ thông tin", 30, 15, "Không", 1],
      ["KTVM01", "Kinh tế vi mô", 3, "Bắt buộc", "Khoa Kinh tế", 45, 0, "Không", 1],
      ["LTNC01", "Lập trình nâng cao C++", 3, "Bắt buộc", "Khoa Công nghệ thông tin", 30, 15, "Tin học đại cương", 2],
      ["XSTK01", "Xác suất & Thống kê", 3, "Bắt buộc", "Khoa Toán ứng dụng", 30, 15, "Toán cao cấp", 2],
      ["CSDL01", "Cơ sở dữ liệu", 3, "Bắt buộc", "Khoa Công nghệ thông tin", 30, 15, "Toán rời rạc", 3],
      ["CTDL01", "Cấu trúc dữ liệu và giải thuật", 3, "Bắt buộc", "Khoa Công nghệ thông tin", 30, 15, "Lập trình nâng cao C++", 3],
      ["MMT01", "Mạng máy tính", 3, "Tự chọn", "Khoa Công nghệ thông tin", 30, 15, "Kiến trúc máy tính", 4],
    ];

    for (const c of sampleCourses) {
      await db.execute(
        `
        INSERT INTO hocphan (Ma_HP, Ten_HP, STC, LoaiMon, Khoa, SoTiet_LT, SoTiet_TH, HPTienQuyet, HocKy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          LoaiMon = VALUES(LoaiMon),
          Khoa = VALUES(Khoa),
          SoTiet_LT = VALUES(SoTiet_LT),
          SoTiet_TH = VALUES(SoTiet_TH),
          HPTienQuyet = VALUES(HPTienQuyet),
          HocKy = VALUES(HocKy)
      `,
        c
      );
    }
  } catch (err) {
    console.warn("Lưu ý khi khởi tạo dữ liệu CTĐT:", err.message);
  }
}

// Hàm khởi tạo Role và Tài khoản Admin mặc định nếu chưa có
async function initAdminAccount(db) {
  try {
    // 1. Đảm bảo role 2 admin tồn tại
    await db.execute(
      "INSERT INTO role (Role_ID, Quyen) VALUES (2, 'admin') ON DUPLICATE KEY UPDATE Quyen = 'admin'"
    );

    // 2. Đảm bảo tài khoản admin tồn tại (mật khẩu 123456)
    const adminHash = "$2b$10$rf6jejjzwHLSe/G8ROxVJ.2zcSrYBuGVzDLY8j8Aps69Bp4mP.6sC";
    const [existAdmin] = await db.execute("SELECT * FROM account WHERE Username = 'admin'");
    if (existAdmin.length === 0) {
      await db.execute(
        "INSERT INTO account (Username, Password, Role_ID) VALUES ('admin', ?, 2)",
        [adminHash]
      );
      console.log("Đã khởi tạo tài khoản quản trị admin/123456 thành công!");
    }
  } catch (err) {
    console.warn("Lưu ý khi khởi tạo tài khoản Admin:", err.message);
  }
}

// Khởi chạy đồng bộ CTĐT và Admin khi khởi động kết nối
dbPromise.then((db) => {
  initCurriculumData(db);
  initAdminAccount(db);
});

// Middleware kiểm tra quyền Admin
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.roleId !== 2) {
    return res.status(403).json({ success: false, message: "Bạn không có quyền Quản trị viên!" });
  }
  next();
}

// 1. API Đăng nhập (Hỗ trợ phân quyền cả Sinh viên và Admin)
app.post("/api/login", async (req, res) => {
  const { studentId, password } = req.body;

  try {
    const db = await dbPromise;
    const [rows] = await db.execute("SELECT * FROM account WHERE Username = ?", [studentId]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Sai mã tài khoản hoặc tên đăng nhập!" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.Password.trim());

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Sai mật khẩu!" });
    }

    // Phân quyền dựa trên Role_ID
    if (user.Role_ID === 2) {
      // Đăng nhập quyền ADMIN
      req.session.user = {
        username: user.Username,
        roleId: 2,
        roleName: "admin",
        fullName: "Quản trị viên",
      };

      return res.status(200).json({
        success: true,
        message: "Đăng nhập Admin thành công!",
        user: req.session.user,
        redirectUrl: "/ui/admin_ui/admin.html",
      });
    } else {
      // Đăng nhập quyền SINH VIÊN (Role_ID = 1)
      const studentInfo = await ensureStudentExists(db, user.Username);

      req.session.user = {
        username: user.Username,
        roleId: 1,
        roleName: "student",
        msv: studentInfo.MSV,
        fullName: studentInfo.Ten,
        className: studentInfo.Lop,
        faculty: studentInfo.Khoa,
      };

      return res.status(200).json({
        success: true,
        message: "Đăng nhập Sinh viên thành công!",
        user: req.session.user,
        redirectUrl: "/ui/main_ui/main.html",
      });
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi đăng nhập!" });
  }
});

// 2. API Lấy thông tin người dùng hiện tại từ Session
app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Chưa đăng nhập!" });
  }
  res.status(200).json({ success: true, user: req.session.user });
});

// 3. API Đăng xuất
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Không thể đăng xuất!" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ success: true, message: "Đăng xuất thành công!" });
  });
});

// 4. API Lấy danh sách lớp học phần (kèm trạng thái đã đăng ký của sinh viên hiện tại và sĩ số)
app.get("/api/classes", async (req, res) => {
  try {
    const db = await dbPromise;
    const currentMsv = req.session.user ? req.session.user.msv : "";

    const query = `
      SELECT 
          lhp.Ma_LHP AS maLHP,
          hp.Ma_HP AS maHP,
          hp.Ten_HP AS tenHP,
          hp.STC AS tinChi,
          lhp.SoLuong AS soLuongToiDa,
          COUNT(DISTINCT dkhp.MSV) AS daDangKy,
          SUM(CASE WHEN dkhp.MSV = ? THEN 1 ELSE 0 END) AS isRegistered,
          GROUP_CONCAT(
              DISTINCT CONCAT('Thứ ', tgh.Thu, ' (Ca ', tgh.Ca, ', P.', tgh.PhongHoc, ') - GV: ', COALESCE(gv.Ten_GiangVien, 'Chưa xếp')) 
              SEPARATOR '<br>'
          ) AS lichHoc
      FROM lophocphan lhp
      INNER JOIN hocphan hp ON lhp.Ma_HP = hp.Ma_HP
      LEFT JOIN dangkyhocphan dkhp ON lhp.Ma_LHP = dkhp.Ma_LHP
      LEFT JOIN thoigianhoc tgh ON lhp.Ma_LHP = tgh.Ma_LHP
      LEFT JOIN giangvien gv ON tgh.ID_GiangVien = gv.ID_GiangVien
      GROUP BY lhp.Ma_LHP, hp.Ma_HP, hp.Ten_HP, hp.STC, lhp.SoLuong
    `;

    const [rows] = await db.execute(query, [currentMsv]);

    res.status(200).json({
      success: true,
      data: rows.map((r) => ({
        ...r,
        isRegistered: Number(r.isRegistered || 0) > 0,
        isFull: Number(r.daDangKy || 0) >= Number(r.soLuongToiDa || 0),
      })),
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách lớp học phần:", error);
    res.status(500).json({ success: false, message: "Lỗi truy xuất CSDL!" });
  }
});

// 5. API Đăng ký học phần
app.post("/api/register", async (req, res) => {
  if (!req.session.user || !req.session.user.msv) {
    return res.status(401).json({ success: false, message: "Bạn cần đăng nhập để đăng ký môn học!" });
  }

  const msv = req.session.user.msv;
  const { maLHP } = req.body;

  if (!maLHP) {
    return res.status(400).json({ success: false, message: "Vui lòng cung cấp mã lớp học phần!" });
  }

  try {
    const db = await dbPromise;

    // Kiểm tra xem lớp học phần có tồn tại không
    const [lhpRows] = await db.execute(
      `SELECT lhp.*, hp.Ten_HP, hp.STC 
       FROM lophocphan lhp 
       INNER JOIN hocphan hp ON lhp.Ma_HP = hp.Ma_HP 
       WHERE lhp.Ma_LHP = ?`,
      [maLHP]
    );

    if (lhpRows.length === 0) {
      return res.status(404).json({ success: false, message: "Lớp học phần không tồn tại!" });
    }

    const lhp = lhpRows[0];

    // 1. Kiểm tra xem sinh viên đã đăng ký chính lớp này chưa
    const [existClass] = await db.execute(
      "SELECT * FROM dangkyhocphan WHERE MSV = ? AND Ma_LHP = ?",
      [msv, maLHP]
    );
    if (existClass.length > 0) {
      return res.status(400).json({ success: false, message: "Bạn đã đăng ký lớp học phần này rồi!" });
    }

    // 2. Kiểm tra xem sinh viên đã đăng ký một lớp khác của cùng môn học chưa
    const [existHp] = await db.execute(
      `SELECT l.Ma_LHP FROM dangkyhocphan dk 
       INNER JOIN lophocphan l ON dk.Ma_LHP = l.Ma_LHP 
       WHERE dk.MSV = ? AND l.Ma_HP = ?`,
      [msv, lhp.Ma_HP]
    );
    if (existHp.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Bạn đã đăng ký môn "${lhp.Ten_HP}" ở lớp ${existHp[0].Ma_LHP} rồi! Không thể đăng ký thêm lớp khác của cùng môn.`,
      });
    }

    // 3. Kiểm tra sĩ số lớp
    const [countRows] = await db.execute(
      "SELECT COUNT(*) AS total FROM dangkyhocphan WHERE Ma_LHP = ?",
      [maLHP]
    );
    if (Number(countRows[0].total) >= Number(lhp.SoLuong)) {
      return res.status(400).json({ success: false, message: "Lớp học phần này đã hết chỗ!" });
    }

    // 4. Kiểm tra trùng lịch học (cùng Thứ và Ca)
    const [targetSchedules] = await db.execute(
      "SELECT Thu, Ca FROM thoigianhoc WHERE Ma_LHP = ?",
      [maLHP]
    );

    if (targetSchedules.length > 0) {
      const [currentSchedules] = await db.execute(
        `SELECT tgh.Thu, tgh.Ca, hp.Ten_HP, dk.Ma_LHP 
         FROM dangkyhocphan dk 
         INNER JOIN lophocphan l ON dk.Ma_LHP = l.Ma_LHP 
         INNER JOIN hocphan hp ON l.Ma_HP = hp.Ma_HP 
         INNER JOIN thoigianhoc tgh ON dk.Ma_LHP = tgh.Ma_LHP 
         WHERE dk.MSV = ?`,
        [msv]
      );

      for (const target of targetSchedules) {
        const conflict = currentSchedules.find((c) => c.Thu === target.Thu && c.Ca === target.Ca);
        if (conflict) {
          return res.status(400).json({
            success: false,
            message: `Trùng lịch học: Thứ ${conflict.Thu}, Ca ${conflict.Ca} bị trùng với môn "${conflict.Ten_HP}" (${conflict.Ma_LHP})!`,
          });
        }
      }
    }

    // 5. Ghi nhận đăng ký
    await db.execute(
      "INSERT INTO dangkyhocphan (MSV, Ma_LHP, NgayDangKy, TinhTrang) VALUES (?, ?, CURDATE(), 'Thành công')",
      [msv, maLHP]
    );

    res.status(200).json({
      success: true,
      message: `Đăng ký thành công lớp học phần ${maLHP} (${lhp.Ten_HP})!`,
    });
  } catch (error) {
    console.error("Lỗi đăng ký học phần:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng ký môn học!" });
  }
});

// 6. API Xem danh sách các môn đã đăng ký
app.get("/api/my-registrations", async (req, res) => {
  if (!req.session.user || !req.session.user.msv) {
    return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập!" });
  }

  const msv = req.session.user.msv;

  try {
    const db = await dbPromise;
    const query = `
      SELECT 
          dk.Ma_LHP AS maLHP,
          hp.Ten_HP AS tenHP,
          hp.STC AS tinChi,
          dk.TinhTrang AS tinhTrang,
          GROUP_CONCAT(DISTINCT COALESCE(gv.Ten_GiangVien, 'Chưa xếp') SEPARATOR ', ') AS giangVien,
          GROUP_CONCAT(
              DISTINCT CONCAT('Thứ ', tgh.Thu, ' (Ca ', tgh.Ca, ', P.', tgh.PhongHoc, ')') 
              SEPARATOR '<br>'
          ) AS lichHoc
      FROM dangkyhocphan dk
      INNER JOIN lophocphan lhp ON dk.Ma_LHP = lhp.Ma_LHP
      INNER JOIN hocphan hp ON lhp.Ma_HP = hp.Ma_HP
      LEFT JOIN thoigianhoc tgh ON lhp.Ma_LHP = tgh.Ma_LHP
      LEFT JOIN giangvien gv ON tgh.ID_GiangVien = gv.ID_GiangVien
      WHERE dk.MSV = ?
      GROUP BY dk.Ma_LHP, hp.Ten_HP, hp.STC, dk.TinhTrang
    `;

    const [rows] = await db.execute(query, [msv]);

    const totalCredits = rows.reduce((sum, item) => sum + Number(item.tinChi || 0), 0);

    res.status(200).json({
      success: true,
      data: rows,
      totalCredits,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách môn đã đăng ký:", error);
    res.status(500).json({ success: false, message: "Lỗi truy xuất dữ liệu đăng ký!" });
  }
});

// 7. API Hủy môn học đã đăng ký
app.post("/api/cancel-registration", async (req, res) => {
  if (!req.session.user || !req.session.user.msv) {
    return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập!" });
  }

  const msv = req.session.user.msv;
  const { maLHP } = req.body;

  if (!maLHP) {
    return res.status(400).json({ success: false, message: "Vui lòng cung cấp mã lớp học phần muốn hủy!" });
  }

  try {
    const db = await dbPromise;

    const [result] = await db.execute(
      "DELETE FROM dangkyhocphan WHERE MSV = ? AND Ma_LHP = ?",
      [msv, maLHP]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Bạn chưa đăng ký lớp này hoặc lớp không tồn tại!" });
    }

    res.status(200).json({
      success: true,
      message: `Đã hủy môn ${maLHP} thành công!`,
    });
  } catch (error) {
    console.error("Lỗi hủy môn học:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi hủy môn!" });
  }
});

// 8. API Đổi mật khẩu cho người dùng
app.post("/api/change-password", async (req, res) => {
  if (!req.session.user || !req.session.user.username) {
    return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập!" });
  }

  const { oldPassword, newPassword } = req.body;
  const username = req.session.user.username;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới!" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
  }

  try {
    const db = await dbPromise;
    const [rows] = await db.execute("SELECT * FROM account WHERE Username = ?", [username]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Tài khoản không tồn tại!" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.Password.trim());
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác!" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await db.execute("UPDATE account SET Password = ? WHERE Username = ?", [hashedPassword, username]);

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.",
    });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi đổi mật khẩu!" });
  }
});

// 9. API Lấy Chương trình đào tạo (Curriculum)
app.get("/api/curriculum", async (req, res) => {
  try {
    const db = await dbPromise;
    const currentMsv = req.session.user ? req.session.user.msv : "";

    let registeredCourseIds = [];
    let accumulatedCredits = 0;

    if (currentMsv) {
      const [regRows] = await db.execute(
        `
        SELECT DISTINCT l.Ma_HP, hp.STC
        FROM dangkyhocphan dk
        INNER JOIN lophocphan l ON dk.Ma_LHP = l.Ma_LHP
        INNER JOIN hocphan hp ON l.Ma_HP = hp.Ma_HP
        WHERE dk.MSV = ?
      `,
        [currentMsv]
      );

      registeredCourseIds = regRows.map((r) => r.Ma_HP);
      accumulatedCredits = regRows.reduce((sum, r) => sum + Number(r.STC || 0), 0);
    }

    const [courses] = await db.execute(`
      SELECT 
        Ma_HP AS maHP,
        Ten_HP AS tenHP,
        STC AS tinChi,
        COALESCE(LoaiMon, 'Bắt buộc') AS loaiMon,
        COALESCE(Khoa, 'Khoa Công nghệ thông tin') AS khoa,
        COALESCE(SoTiet_LT, 30) AS soTietLT,
        COALESCE(SoTiet_TH, 15) AS soTietTH,
        COALESCE(HPTienQuyet, 'Không') AS tienQuyet,
        COALESCE(HocKy, 1) AS hocKy
      FROM hocphan
      ORDER BY HocKy ASC, Ma_HP ASC
    `);

    const data = courses.map((c) => ({
      ...c,
      status: registeredCourseIds.includes(c.maHP) ? "Đang học" : "Chưa học",
    }));

    res.status(200).json({
      success: true,
      data,
      totalRequiredCredits: 135,
      accumulatedCredits,
      gpa: "0.0",
    });
  } catch (error) {
    console.error("Lỗi lấy chương trình đào tạo:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi tải CTĐT!" });
  }
});

// 10. API Tra cứu học phần (Search Courses)
app.get("/api/courses/search", async (req, res) => {
  try {
    const db = await dbPromise;
    const { courseId, courseName, department } = req.query;

    let sql = `
      SELECT 
        hp.Ma_HP AS maHP,
        hp.Ten_HP AS tenHP,
        hp.STC AS tinChi,
        COALESCE(hp.LoaiMon, 'Bắt buộc') AS loaiMon,
        COALESCE(hp.Khoa, 'Khoa Công nghệ thông tin') AS khoa,
        lhp.Ma_LHP AS maLHP,
        COALESCE(lhp.SoLuong, 0) AS soLuongToiDa,
        COUNT(DISTINCT dkhp.MSV) AS daDangKy,
        GROUP_CONCAT(DISTINCT COALESCE(gv.Ten_GiangVien, 'Chưa xếp') SEPARATOR ', ') AS giangVien,
        GROUP_CONCAT(
          DISTINCT CONCAT('Thứ ', tgh.Thu, ' (Ca ', tgh.Ca, ', P.', tgh.PhongHoc, ')') 
          SEPARATOR '<br>'
        ) AS lichHoc
      FROM hocphan hp
      LEFT JOIN lophocphan lhp ON hp.Ma_HP = lhp.Ma_HP
      LEFT JOIN dangkyhocphan dkhp ON lhp.Ma_LHP = dkhp.Ma_LHP
      LEFT JOIN thoigianhoc tgh ON lhp.Ma_LHP = tgh.Ma_LHP
      LEFT JOIN giangvien gv ON tgh.ID_GiangVien = gv.ID_GiangVien
      WHERE 1 = 1
    `;

    const params = [];

    if (courseId && courseId.trim()) {
      sql += " AND (hp.Ma_HP LIKE ? OR lhp.Ma_LHP LIKE ?)";
      params.push(`%${courseId.trim()}%`, `%${courseId.trim()}%`);
    }

    if (courseName && courseName.trim()) {
      sql += " AND hp.Ten_HP LIKE ?";
      params.push(`%${courseName.trim()}%`);
    }

    if (department && department.trim() && department !== "-- Tất cả các Khoa --") {
      sql += " AND hp.Khoa LIKE ?";
      params.push(`%${department.trim()}%`);
    }

    sql += " GROUP BY hp.Ma_HP, hp.Ten_HP, hp.STC, hp.LoaiMon, hp.Khoa, lhp.Ma_LHP, lhp.SoLuong ORDER BY hp.Ma_HP ASC";

    const [rows] = await db.execute(sql, params);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi tra cứu học phần:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi tra cứu học phần!" });
  }
});

// ==========================================
// CÁC API DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN)
// ==========================================

// 11. API Thống kê tổng quan (Dashboard Stats)
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const db = await dbPromise;
    const [[{ totalCourses }]] = await db.execute("SELECT COUNT(*) AS totalCourses FROM hocphan");
    const [[{ totalClasses }]] = await db.execute("SELECT COUNT(*) AS totalClasses FROM lophocphan");
    const [[{ totalRegistrations }]] = await db.execute("SELECT COUNT(*) AS totalRegistrations FROM dangkyhocphan");
    const [[{ totalStudents }]] = await db.execute("SELECT COUNT(*) AS totalStudents FROM sinhvien");

    res.status(200).json({
      success: true,
      data: { totalCourses, totalClasses, totalRegistrations, totalStudents },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê admin:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy thống kê!" });
  }
});

// 12. API Lấy danh sách môn học cho Admin
app.get("/api/admin/courses", requireAdmin, async (req, res) => {
  try {
    const db = await dbPromise;
    const [courses] = await db.execute("SELECT * FROM hocphan ORDER BY HocKy ASC, Ma_HP ASC");
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("Lỗi lấy môn học:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tải môn học!" });
  }
});

// 13. API Thêm môn học mới
app.post("/api/admin/courses", requireAdmin, async (req, res) => {
  const { maHP, tenHP, tinChi, loaiMon, khoa, soTietLT, soTietTH, tienQuyet, hocKy } = req.body;

  if (!maHP || !tenHP || !tinChi) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ Mã HP, Tên HP và Số TC!" });
  }

  try {
    const db = await dbPromise;
    const [exist] = await db.execute("SELECT * FROM hocphan WHERE Ma_HP = ?", [maHP.trim().toUpperCase()]);
    if (exist.length > 0) {
      return res.status(400).json({ success: false, message: `Mã môn học ${maHP} đã tồn tại!` });
    }

    await db.execute(
      `INSERT INTO hocphan (Ma_HP, Ten_HP, STC, LoaiMon, Khoa, SoTiet_LT, SoTiet_TH, HPTienQuyet, HocKy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        maHP.trim().toUpperCase(),
        tenHP.trim(),
        Number(tinChi),
        loaiMon || "Bắt buộc",
        khoa || "Khoa Công nghệ thông tin",
        Number(soTietLT) || 30,
        Number(soTietTH) || 15,
        tienQuyet || "Không",
        Number(hocKy) || 1,
      ]
    );

    res.status(200).json({ success: true, message: "Thêm môn học mới thành công!" });
  } catch (error) {
    console.error("Lỗi thêm môn học:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi thêm môn học!" });
  }
});

// 14. API Cập nhật môn học
app.put("/api/admin/courses/:maHP", requireAdmin, async (req, res) => {
  const { maHP } = req.params;
  const { tenHP, tinChi, loaiMon, khoa, soTietLT, soTietTH, tienQuyet, hocKy } = req.body;

  try {
    const db = await dbPromise;
    const [result] = await db.execute(
      `UPDATE hocphan 
       SET Ten_HP = ?, STC = ?, LoaiMon = ?, Khoa = ?, SoTiet_LT = ?, SoTiet_TH = ?, HPTienQuyet = ?, HocKy = ?
       WHERE Ma_HP = ?`,
      [
        tenHP.trim(),
        Number(tinChi),
        loaiMon,
        khoa,
        Number(soTietLT),
        Number(soTietTH),
        tienQuyet,
        Number(hocKy),
        maHP,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy môn học cần sửa!" });
    }

    res.status(200).json({ success: true, message: "Cập nhật môn học thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật môn học:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật môn học!" });
  }
});

// 15. API Xóa môn học
app.delete("/api/admin/courses/:maHP", requireAdmin, async (req, res) => {
  const { maHP } = req.params;

  try {
    const db = await dbPromise;

    // Kiểm tra xem có lớp học phần nào đang liên kết với môn học này không
    const [classes] = await db.execute("SELECT * FROM lophocphan WHERE Ma_HP = ?", [maHP]);
    if (classes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa môn học này vì đang có ${classes.length} lớp học phần liên kết! Vui lòng xóa các lớp học phần trước.`,
      });
    }

    const [result] = await db.execute("DELETE FROM hocphan WHERE Ma_HP = ?", [maHP]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy môn học để xóa!" });
    }

    res.status(200).json({ success: true, message: "Xóa môn học thành công!" });
  } catch (error) {
    console.error("Lỗi xóa môn học:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi xóa môn học!" });
  }
});

// 16. API Lấy danh sách lớp học phần cho Admin
app.get("/api/admin/classes", requireAdmin, async (req, res) => {
  try {
    const db = await dbPromise;
    const query = `
      SELECT 
        lhp.Ma_LHP AS maLHP,
        hp.Ma_HP AS maHP,
        hp.Ten_HP AS tenHP,
        hp.STC AS tinChi,
        lhp.SoLuong AS soLuongToiDa,
        lhp.TinhTrang AS tinhTrang,
        COUNT(DISTINCT dkhp.MSV) AS daDangKy,
        COALESCE(gv.Ten_GiangVien, 'Chưa xếp') AS giangVien,
        tgh.ID_GiangVien AS idGiangVien,
        tgh.Thu AS thu,
        tgh.Ca AS ca,
        tgh.PhongHoc AS phongHoc,
        tgh.Tuan AS tuan
      FROM lophocphan lhp
      INNER JOIN hocphan hp ON lhp.Ma_HP = hp.Ma_HP
      LEFT JOIN dangkyhocphan dkhp ON lhp.Ma_LHP = dkhp.Ma_LHP
      LEFT JOIN thoigianhoc tgh ON lhp.Ma_LHP = tgh.Ma_LHP
      LEFT JOIN giangvien gv ON tgh.ID_GiangVien = gv.ID_GiangVien
      GROUP BY lhp.Ma_LHP, hp.Ma_HP, hp.Ten_HP, hp.STC, lhp.SoLuong, lhp.TinhTrang, gv.Ten_GiangVien, tgh.ID_GiangVien, tgh.Thu, tgh.Ca, tgh.PhongHoc, tgh.Tuan
      ORDER BY lhp.Ma_LHP ASC
    `;

    const [rows] = await db.execute(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi lấy danh sách lớp admin:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tải danh sách lớp!" });
  }
});

// 17. API Mở lớp học phần mới
app.post("/api/admin/classes", requireAdmin, async (req, res) => {
  const { maLHP, maHP, soLuong, idGiangVien, thu, ca, phongHoc, tuan } = req.body;

  if (!maLHP || !maHP || !soLuong) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ Mã LHP, chọn Môn học và Sĩ số!" });
  }

  try {
    const db = await dbPromise;

    // Kiểm tra trùng mã LHP
    const [exist] = await db.execute("SELECT * FROM lophocphan WHERE Ma_LHP = ?", [maLHP.trim().toUpperCase()]);
    if (exist.length > 0) {
      return res.status(400).json({ success: false, message: `Mã lớp học phần ${maLHP} đã tồn tại!` });
    }

    // 1. Thêm vào lophocphan
    await db.execute(
      "INSERT INTO lophocphan (Ma_LHP, Ma_HP, SoLuong, TinhTrang) VALUES (?, ?, ?, 'còn mở')",
      [maLHP.trim().toUpperCase(), maHP, Number(soLuong)]
    );

    // 2. Thêm lịch học nếu có
    if (thu && ca) {
      await db.execute(
        "INSERT INTO thoigianhoc (Ma_LHP, Tuan, Thu, Ca, ID_GiangVien, PhongHoc) VALUES (?, ?, ?, ?, ?, ?)",
        [
          maLHP.trim().toUpperCase(),
          tuan || "1-15",
          Number(thu),
          Number(ca),
          idGiangVien || null,
          phongHoc || "Chưa xếp",
        ]
      );
    }

    res.status(200).json({ success: true, message: `Mở lớp học phần ${maLHP} thành công!` });
  } catch (error) {
    console.error("Lỗi mở lớp học phần:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi mở lớp học phần!" });
  }
});

// 18. API Xóa lớp học phần
app.delete("/api/admin/classes/:maLHP", requireAdmin, async (req, res) => {
  const { maLHP } = req.params;

  try {
    const db = await dbPromise;

    // Xóa lịch học và đăng ký liên quan
    await db.execute("DELETE FROM thoigianhoc WHERE Ma_LHP = ?", [maLHP]);
    await db.execute("DELETE FROM dangkyhocphan WHERE Ma_LHP = ?", [maLHP]);

    const [result] = await db.execute("DELETE FROM lophocphan WHERE Ma_LHP = ?", [maLHP]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lớp học phần để xóa!" });
    }

    res.status(200).json({ success: true, message: `Đã xóa lớp học phần ${maLHP} thành công!` });
  } catch (error) {
    console.error("Lỗi xóa lớp học phần:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi xóa lớp học phần!" });
  }
});

// 19. API Lấy danh sách giảng viên (phục vụ chọn giảng viên khi mở lớp)
app.get("/api/admin/lecturers", requireAdmin, async (req, res) => {
  try {
    const db = await dbPromise;
    const [rows] = await db.execute(
      "SELECT ID_GiangVien AS id, Ten_GiangVien AS ten FROM giangvien ORDER BY Ten_GiangVien ASC"
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi lấy giảng viên:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tải giảng viên!" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});



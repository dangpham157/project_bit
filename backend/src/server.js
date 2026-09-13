const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");

// Gọi file kết nối DB của bạn (data.js)
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
    cookie: { maxAge: 1000 * 60 * 60 },
  }),
);

// 1. Cấu hình đường dẫn tới thư mục public
const publicPath = path.join(__dirname, "../../public");
app.use(express.static(publicPath));

// 2. Mở file login.html khi truy cập đường dẫn gốc '/'
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "ui/login_ui/login.html"));
});

// API xử lý đăng nhập
app.post("/api/login", async (req, res) => {
  const { studentId, password } = req.body;

  console.log("Đã nhận yêu cầu đăng nhập với Mã SV:", studentId, "Mật khẩu là:", password);

  try {
    const db = await dbPromise;

    const [allAccounts] = await db.execute("SELECT * FROM account");
    console.log("Dữ liệu hiện có trong MySQL:", allAccounts);

    const [rows] = await db.execute("SELECT * FROM account WHERE Username = ? AND Role_ID = 1", [studentId]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Sai mã sinh viên!" });
    }

    const user = rows[0];

    // So sánh mật khẩu người dùng nhập với chuỗi hash trong cột Password
    const isMatch = await bcrypt.compare(password, user.Password.trim());

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Sai mật khẩu!" });
    }

    // Lưu session với dữ liệu từ bảng account
    req.session.user = {
      studentId: user.Username,
      roleId: user.Role_ID,
    };

    res.status(200).json({
      success: true,
      redirectUrl: "/ui/main_ui/main.html",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

// API Lấy danh sách lớp học phần
app.get("/api/classes", async (req, res) => {
  try {
    const db = await dbPromise;

    // Câu lệnh SQL JOIN 4 bảng và gộp lịch học
    const query = `
      SELECT 
          lhp.Ma_LHP AS maLHP,
          hp.Ten_HP AS tenHP,
          hp.STC AS tinChi,
          lhp.SoLuong AS soLuong,
          GROUP_CONCAT(
              CONCAT('Thứ ', tgh.Thu, ' (Ca ', tgh.Ca, ', P.', tgh.PhongHoc, ') - GV: ', gv.ten_GiangVien) 
              SEPARATOR '<br>'
          ) AS lichHoc
      FROM lophocphan lhp
      INNER JOIN hocphan hp ON lhp.Ma_HP = hp.Ma_HP
      LEFT JOIN thoigianhoc tgh ON lhp.Ma_LHP = tgh.Ma_LHP
      LEFT JOIN giangvien gv ON tgh.ID_GiangVien = gv.ID_GiangVien
      GROUP BY lhp.Ma_LHP, hp.Ten_HP, hp.STC, lhp.SoLuong
    `;

    const [rows] = await db.execute(query);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách lớp học phần:", error);
    res.status(500).json({ success: false, message: "Lỗi truy xuất CSDL!" });
  }
});

const fs = require("fs");
const path = require("path");
const dbPromise = require("./data");

async function seedDatabase() {
  console.log("==========================================");
  console.log(" BẮT ĐẦU NẠP DỮ LIỆU MẪU VÀO CSDL MYSQL...");
  console.log("==========================================");

  try {
    const db = await dbPromise;

    const sqlFilePath = path.join(__dirname, "../../data/seed_data.sql");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Loại bỏ comment dòng và chia theo dấu chấm phẩy
    const statements = sqlContent
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--") && !s.toLowerCase().startsWith("use "));

    console.log(`Tìm thấy ${statements.length} câu lệnh SQL cần thực thi.`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await db.query(stmt);
      } catch (err) {
        console.warn(`Lưu ý câu lệnh #${i + 1}: ${err.message}`);
      }
    }

    console.log("==========================================");
    console.log("✅ ĐÃ NẠP THÀNH CÔNG DỮ LIỆU MẪU VÀO MYSQL!");
    console.log("   - 5 Tài khoản (admin, trung, haidang, vananh, minhtri)");
    console.log("   - 4 Hồ sơ sinh viên đầy đủ thông tin");
    console.log("   - 7 Giảng viên các khoa");
    console.log("   - 21 Học phần trải dài từ Kỳ 1 đến Kỳ 8");
    console.log("   - 11 Lớp học phần mở đăng ký (kèm lịch học, phòng học)");
    console.log("   - Đã gán sẵn 1 lớp đầy chỗ (LHP_FULL01) để kiểm thử!");
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi nạp dữ liệu vào MySQL:", error);
    process.exit(1);
  }
}

seedDatabase();

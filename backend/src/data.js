const mysql = require("mysql2/promise");

// 1. Khai báo thông tin kết nối tới MySQL
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456", // Nhập mật khẩu MySQL thật của bạn vào đây
  database: "hethongdangky", // Tên database bạn đã tạo
});

// 2. Kiểm tra xem kết nối có thành công không
connection
  .then(() => {
    console.log("Đã kết nối MySQL thành công từ file data.js!");
  })
  .catch((err) => {
    console.error("Lỗi kết nối MySQL:", err);
  });

// 3. Xuất kết nối này ra ngoài để các file khác sử dụng
module.exports = connection;

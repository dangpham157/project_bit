const mysql = require("mysql2/promise");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "hethongdangky",
});

connection
  .then(() => {
    console.log("Đã kết nối MySQL thành công từ file data.js!");
  })
  .catch((err) => {
    console.error("Lỗi kết nối MySQL:", err);
  });

module.exports = connection;

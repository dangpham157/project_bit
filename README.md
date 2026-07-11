# 📚 Hệ Thống Đăng Ký Tín Chỉ (Mini)

## 📝 Mô tả & Mục tiêu

Dự án xây dựng một ứng dụng nhỏ gọn giúp sinh viên đăng ký môn học và Admin quản lý danh sách. Giao diện trực quan bằng đồ họa, dữ liệu lưu trữ tập trung vào cơ sở dữ liệu.

---

## 👥 Thành viên nhóm

- **Thành viên 1:** [Nguyễn Thành Trung]
- **Thành viên 2:** [Phạm Hải Đăng]

---

## 🛠 Công nghệ sử dụng

- **Ngôn ngữ:** C++
- **Giao diện:** Dear ImGui
- **Cơ sở dữ liệu:** MySQL

---

## ⚙️ Các chức năng chính (Bản tối giản)

### 1. Đăng nhập cơ bản

- Nhập tài khoản để phân quyền: Menu cho **Admin** hoặc Menu cho **Sinh viên**.

### 2. Chức năng cho Admin

- **Xem danh sách môn học:** Hiển thị tất cả môn đang có dưới dạng bảng.
- **Thêm môn học mới:** Nhập tên môn, mã môn, số tín

### 3. Chức năng cho Sinh viên

- **Xem & Đăng ký:** Hiện danh sách môn, bên cạnh có nút **[Đăng ký]**. Bấm vào là thêm tên mình vào môn đó (kiểm tra đơn giản: nếu môn chưa đầy thì cho vào).
- **Hủy môn:** Hiện các môn đã chọn, bấm **[Hủy]** để xóa ra khỏi danh sách.

---

## 📊 Yêu cầu hệ thống

- **Lưu dữ liệu:** Tắt app bật lại không bị mất lịch sử đăng ký
- **Dễ dùng:** Giao diện nút bấm rõ ràng

-- ========================================================
-- SCRIPT THÊM DỮ LIỆU MẪU CHO HỆ THỐNG ĐĂNG KÝ TÍN CHỈ
-- Cơ sở dữ liệu: hethongdangky
-- ========================================================

USE `hethongdangky`;

-- 1. BẢNG VAI TRÒ (ROLE)
INSERT INTO `role` (`Role_ID`, `Quyen`) VALUES 
(1, 'user'),
(2, 'admin')
ON DUPLICATE KEY UPDATE `Quyen` = VALUES(`Quyen`);

-- 2. BẢNG TÀI KHOẢN (ACCOUNT)
-- Mật khẩu mặc định của tất cả tài khoản bên dưới đều là: 123456
-- Chuỗi băm bcrypt ($2b$10$rf6jejjzwHLSe/G8ROxVJ.2zcSrYBuGVzDLY8j8Aps69Bp4mP.6sC)
INSERT INTO `account` (`Username`, `Password`, `Role_ID`) VALUES 
('admin', '$2b$10$rf6jejjzwHLSe/G8ROxVJ.2zcSrYBuGVzDLY8j8Aps69Bp4mP.6sC', 2),
('trung', '$2b$10$rf6jejjzwHLSe/G8ROxVJ.2zcSrYBuGVzDLY8j8Aps69Bp4mP.6sC', 1),
('haidang', '$2b$10$rf6jejjzwHLSe/G8ROxVJ.2zcSrYBuGVzDLY8j8Aps69Bp4mP.6sC', 1),
('vananh', '$2b$10$rf6jejjzwHLSe/G8ROxVJ.2zcSrYBuGVzDLY8j8Aps69Bp4mP.6sC', 1),
('minhtri', '$2b$10$rf6jejjzwHLSe/G8ROxVJ.2zcSrYBuGVzDLY8j8Aps69Bp4mP.6sC', 1)
ON DUPLICATE KEY UPDATE `Password` = VALUES(`Password`), `Role_ID` = VALUES(`Role_ID`);

-- 3. BẢNG HỒ SƠ SINH VIÊN (SINHVIEN)
INSERT INTO `sinhvien` (`MSV`, `Ten`, `Khoa`, `Lop`, `Username`) VALUES 
('28A4042280', 'Nguyễn Thành Trung', 'CNTT', 'K28CNTTA', 'trung'),
('28A4042281', 'Phạm Hải Đăng', 'CNTT', 'K28CNTTB', 'haidang'),
('28A4042282', 'Trần Thị Vân Anh', 'Kinh tế', 'K28KTTM', 'vananh'),
('28A4042283', 'Lê Minh Trí', 'CNTT', 'K28CNTTA', 'minhtri')
ON DUPLICATE KEY UPDATE `Ten` = VALUES(`Ten`), `Khoa` = VALUES(`Khoa`), `Lop` = VALUES(`Lop`);

-- 4. BẢNG GIẢNG VIÊN (GIANGVIEN)
INSERT INTO `giangvien` (`ID_GiangVien`, `Ten_GiangVien`) VALUES 
('101', 'TS. Nguyễn Văn An'),
('102', 'ThS. Trần Thị Bích'),
('103', 'TS. Lê Văn Cường'),
('104', 'ThS. Phạm Văn Dũng'),
('105', 'PGS.TS Hoàng Minh Tuấn'),
('106', 'ThS. Đỗ Thị Mai'),
('179', 'ThS. Nguyễn Thành Trung')
ON DUPLICATE KEY UPDATE `Ten_GiangVien` = VALUES(`Ten_GiangVien`);

-- 5. BẢNG HỌC PHẦN (HOCPHAN) - KHUNG CHƯƠNG TRÌNH ĐÀO TẠO 8 HỌC KỲ
INSERT INTO `hocphan` (`Ma_HP`, `Ten_HP`, `STC`, `LoaiMon`, `Khoa`, `SoTiet_LT`, `SoTiet_TH`, `HPTienQuyet`, `HocKy`) VALUES 
-- Học kỳ 1
('THML01', 'Triết học Mác-Lênin', 3, 'Bắt buộc', 'Khoa Lý luận chính trị', 45, 0, 'Không', 1),
('TRR01', 'Toán rời rạc', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'Không', 1),
('KTVM01', 'Kinh tế vi mô', 3, 'Bắt buộc', 'Khoa Kinh tế', 45, 0, 'Không', 1),
('THDC01', 'Tin học đại cương', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'Không', 1),
('TCC01', 'Toán cao cấp 1', 3, 'Bắt buộc', 'Khoa Toán ứng dụng', 45, 0, 'Không', 1),

-- Học kỳ 2
('LTNC01', 'Lập trình nâng cao C++', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'THDC01', 2),
('XSTK01', 'Xác suất & Thống kê', 3, 'Bắt buộc', 'Khoa Toán ứng dụng', 30, 15, 'TCC01', 2),
('KTMT01', 'Kiến trúc máy tính', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'Không', 2),
('TA01', 'Tiếng Anh chuyên ngành 1', 2, 'Tự chọn', 'Khoa Ngoại ngữ', 30, 0, 'Không', 2),

-- Học kỳ 3
('CSDL01', 'Cơ sở dữ liệu', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'TRR01', 3),
('CTDL01', 'Cấu trúc dữ liệu và giải thuật', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'LTNC01', 3),
('HDH01', 'Hệ điều hành', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'KTMT01', 3),
('OOP01', 'Lập trình hướng đối tượng (Java)', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'LTNC01', 3),

-- Học kỳ 4
('MMT01', 'Mạng máy tính', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'KTMT01', 4),
('PTTKHT01', 'Phân tích & Thiết kế hệ thống', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'CSDL01', 4),
('WEB01', 'Lập trình Web căn bản', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'CSDL01', 4),

-- Học kỳ 5
('CNPM01', 'Công nghệ phần mềm', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'PTTKHT01', 5),
('AI01', 'Nhập môn Trí tuệ nhân tạo', 3, 'Tự chọn', 'Khoa Công nghệ thông tin', 30, 15, 'CTDL01', 5),
('ATBM01', 'An toàn và bảo mật thông tin', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 30, 15, 'MMT01', 5),

-- Học kỳ 6
('MOB01', 'Lập trình di động (Flutter)', 3, 'Tự chọn', 'Khoa Công nghệ thông tin', 30, 15, 'OOP01', 6),
('CLOUD01', 'Điện toán đám mây', 3, 'Tự chọn', 'Khoa Công nghệ thông tin', 30, 15, 'MMT01', 6),

-- Học kỳ 7
('DA01', 'Đồ án chuyên ngành CNTT', 3, 'Bắt buộc', 'Khoa Công nghệ thông tin', 0, 45, 'CNPM01', 7),
('TTDN01', 'Thực tập doanh nghiệp', 4, 'Bắt buộc', 'Khoa Công nghệ thông tin', 0, 60, 'Không', 7),

-- Học kỳ 8
('KLTN01', 'Khóa luận tốt nghiệp', 10, 'Bắt buộc', 'Khoa Công nghệ thông tin', 0, 150, 'DA01', 8)
ON DUPLICATE KEY UPDATE 
  `Ten_HP` = VALUES(`Ten_HP`),
  `STC` = VALUES(`STC`),
  `LoaiMon` = VALUES(`LoaiMon`),
  `Khoa` = VALUES(`Khoa`),
  `SoTiet_LT` = VALUES(`SoTiet_LT`),
  `SoTiet_TH` = VALUES(`SoTiet_TH`),
  `HPTienQuyet` = VALUES(`HPTienQuyet`),
  `HocKy` = VALUES(`HocKy`);

-- 6. BẢNG LỚP HỌC PHẦN (LOPHOCPHAN) MỞ ĐĂNG KÝ
INSERT INTO `lophocphan` (`Ma_LHP`, `Ma_HP`, `SoLuong`, `TinhTrang`) VALUES 
('LHP_CSDL01_1', 'CSDL01', 40, 'còn mở'),
('LHP_CSDL01_2', 'CSDL01', 40, 'còn mở'),
('LHP_CTDL01_1', 'CTDL01', 45, 'còn mở'),
('LHP_CTDL01_2', 'CTDL01', 45, 'còn mở'),
('LHP_LTNC01', 'LTNC01', 40, 'còn mở'),
('LHP_THML01', 'THML01', 80, 'còn mở'),
('LHP_TRR01', 'TRR01', 50, 'còn mở'),
('LHP_XSTK01', 'XSTK01', 60, 'còn mở'),
('LHP_WEB01_1', 'WEB01', 35, 'còn mở'),
('LHP_MMT01_1', 'MMT01', 35, 'còn mở'),
('LHP_FULL01', 'HDH01', 2, 'còn mở') -- Lớp giả lập sĩ số nhỏ để demo tính năng hết chỗ
ON DUPLICATE KEY UPDATE `SoLuong` = VALUES(`SoLuong`), `TinhTrang` = VALUES(`TinhTrang`);

-- 7. BẢNG THỜI GIAN HỌC & PHÂN CÔNG GIẢNG VIÊN (THOIGIANHOC)
-- Xóa thời gian học cũ để nạp lại đồng bộ chính xác
DELETE FROM `thoigianhoc`;

INSERT INTO `thoigianhoc` (`Ma_LHP`, `Tuan`, `Thu`, `Ca`, `ID_GiangVien`, `PhongHoc`) VALUES 
-- LHP CSDL lớp 1: Thứ 2, Ca 1 (GV An, P.D6-201)
('LHP_CSDL01_1', '1-15', 2, 1, '101', 'D6-201'),
-- LHP CSDL lớp 2: Thứ 4, Ca 3 (GV Cường, P.A1-305)
('LHP_CSDL01_2', '1-15', 4, 3, '103', 'A1-305'),
-- LHP Cấu trúc dữ liệu lớp 1: Thứ 3, Ca 2 (GV Tuấn, P.D6-202)
('LHP_CTDL01_1', '1-15', 3, 2, '105', 'D6-202'),
-- LHP Cấu trúc dữ liệu lớp 2: Thứ 5, Ca 1 (GV Tuấn, P.B1-102)
('LHP_CTDL01_2', '1-15', 5, 1, '105', 'B1-102'),
-- LHP Lập trình nâng cao: Thứ 4, Ca 1 (GV Cường, P.A1-302)
('LHP_LTNC01', '1-15', 4, 1, '103', 'A1-302'),
-- LHP Triết học Mác-Lênin: Thứ 5, Ca 3 (GV Dũng, P.C2-401)
('LHP_THML01', '1-15', 5, 3, '104', 'C2-401'),
-- LHP Toán rời rạc: Thứ 2, Ca 2 (GV Trung, P.D6-211)
('LHP_TRR01', '1-15', 2, 2, '179', 'D6-211'),
-- LHP Xác suất thống kê: Thứ 3, Ca 1 (GV Bích, P.B1-101)
('LHP_XSTK01', '1-15', 3, 1, '102', 'B1-101'),
-- LHP Lập trình Web: Thứ 6, Ca 2 (GV Trung, P.LAB-01)
('LHP_WEB01_1', '1-15', 6, 2, '179', 'LAB-01'),
-- LHP Mạng máy tính: Thứ 7, Ca 1 (GV An, P.C1-203)
('LHP_MMT01_1', '1-15', 7, 1, '101', 'C1-203'),
-- LHP Hệ điều hành (Lớp demo hết chỗ): Thứ 6, Ca 4 (GV Mai, P.A2-105)
('LHP_FULL01', '1-15', 6, 4, '106', 'A2-105');

-- 8. BẢNG ĐĂNG KÝ HỌC PHẦN (DANGKYHOCPHAN) MẪU
-- Demo dữ liệu sinh viên đã đăng ký
INSERT INTO `dangkyhocphan` (`MSV`, `Ma_LHP`, `NgayDangKy`, `TinhTrang`) VALUES 
-- Lớp FULL01 có sĩ số tối đa 2: thêm 2 sinh viên đăng ký để chuyển sang trạng thái "Đã hết chỗ"
('28A4042281', 'LHP_FULL01', CURDATE(), 'Thành công'),
('28A4042282', 'LHP_FULL01', CURDATE(), 'Thành công'),

-- Sinh viên Trung (28A4042280) đăng ký trước 1 môn CSDL01 lớp 1
('28A4042280', 'LHP_CSDL01_1', CURDATE(), 'Thành công')
ON DUPLICATE KEY UPDATE `TinhTrang` = VALUES(`TinhTrang`);

-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hethongdangky
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `Username` char(255) NOT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `Role_ID` int DEFAULT NULL,
  PRIMARY KEY (`Username`),
  KEY `quyen_link` (`Role_ID`),
  CONSTRAINT `quyen_link` FOREIGN KEY (`Role_ID`) REFERENCES `role` (`Role_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES 
('trung','$2b$10$rf6jejjzwHLSe/G8ROxVJ.2zcSrYBuGVzDLY8j8Aps69Bp4mP.6sC',1),
('admin','$2b$10$rf6jejjzwHLSe/G8ROxVJ.2zcSrYBuGVzDLY8j8Aps69Bp4mP.6sC',2);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dangkyhocphan`
--

DROP TABLE IF EXISTS `dangkyhocphan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dangkyhocphan` (
  `MSV` char(255) NOT NULL,
  `Ma_LHP` char(255) NOT NULL,
  `NgayDangKy` date NOT NULL,
  `TinhTrang` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chua_cap_nhat',
  PRIMARY KEY (`MSV`,`Ma_LHP`),
  KEY `dklhp_link` (`Ma_LHP`),
  CONSTRAINT `dklhp_link` FOREIGN KEY (`Ma_LHP`) REFERENCES `lophocphan` (`Ma_LHP`),
  CONSTRAINT `dkmsv_link` FOREIGN KEY (`MSV`) REFERENCES `sinhvien` (`MSV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dangkyhocphan`
--

LOCK TABLES `dangkyhocphan` WRITE;
/*!40000 ALTER TABLE `dangkyhocphan` DISABLE KEYS */;
/*!40000 ALTER TABLE `dangkyhocphan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giangvien`
--

DROP TABLE IF EXISTS `giangvien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giangvien` (
  `ID_GiangVien` char(255) NOT NULL,
  `Ten_GiangVien` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chua_cap_nhat',
  PRIMARY KEY (`ID_GiangVien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giangvien`
--

LOCK TABLES `giangvien` WRITE;
/*!40000 ALTER TABLE `giangvien` DISABLE KEYS */;
INSERT INTO `giangvien` VALUES ('102','Trần Thị B'),('103','Lê Văn C'),('104','Phạm Văn D'),('179','Nguyễn Thành Trung');
/*!40000 ALTER TABLE `giangvien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hocphan`
--

DROP TABLE IF EXISTS `hocphan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hocphan` (
  `Ma_HP` char(255) NOT NULL,
  `Ten_HP` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chua_cap_nhat',
  `STC` int NOT NULL,
  `LoaiMon` varchar(50) DEFAULT 'Bắt buộc',
  `Khoa` varchar(100) DEFAULT 'Khoa Công nghệ thông tin',
  `SoTiet_LT` int DEFAULT '30',
  `SoTiet_TH` int DEFAULT '15',
  `HPTienQuyet` varchar(255) DEFAULT 'Không',
  `HocKy` int DEFAULT '1',
  PRIMARY KEY (`Ma_HP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hocphan`
--

LOCK TABLES `hocphan` WRITE;
/*!40000 ALTER TABLE `hocphan` DISABLE KEYS */;
INSERT INTO `hocphan` VALUES 
('THML01','Triết học Mác-Lênin',3,'Bắt buộc','Khoa Lý luận chính trị',45,0,'Không',1),
('TRR01','Toán rời rạc',3,'Bắt buộc','Khoa Công nghệ thông tin',30,15,'Không',1),
('KTVM01','Kinh tế vi mô',3,'Bắt buộc','Khoa Kinh tế',45,0,'Không',1),
('LTNC01','Lập trình nâng cao C++',3,'Bắt buộc','Khoa Công nghệ thông tin',30,15,'Tin học đại cương',2),
('XSTK01','Xác suất & Thống kê',3,'Bắt buộc','Khoa Toán ứng dụng',30,15,'Toán cao cấp',2),
('CSDL01','Cơ sở dữ liệu',3,'Bắt buộc','Khoa Công nghệ thông tin',30,15,'Toán rời rạc',3),
('CTDL01','Cấu trúc dữ liệu và giải thuật',3,'Bắt buộc','Khoa Công nghệ thông tin',30,15,'Lập trình nâng cao C++',3),
('MMT01','Mạng máy tính',3,'Tự chọn','Khoa Công nghệ thông tin',30,15,'Kiến trúc máy tính',4);
/*!40000 ALTER TABLE `hocphan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lophocphan`
--

DROP TABLE IF EXISTS `lophocphan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lophocphan` (
  `Ma_LHP` char(255) NOT NULL,
  `Ma_HP` char(255) DEFAULT NULL,
  `SoLuong` int DEFAULT '0',
  `TinhTrang` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chua_cap_nhat',
  PRIMARY KEY (`Ma_LHP`),
  KEY `hp_link` (`Ma_HP`),
  CONSTRAINT `hp_link` FOREIGN KEY (`Ma_HP`) REFERENCES `hocphan` (`Ma_HP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lophocphan`
--

LOCK TABLES `lophocphan` WRITE;
/*!40000 ALTER TABLE `lophocphan` DISABLE KEYS */;
INSERT INTO `lophocphan` VALUES ('LHP_LTNC01','LTNC01',40,'còn mở'),('LHP_THML01','THML01',80,'còn mở'),('LHP_TRR01','TRR01',50,'còn mở'),('LHP_XSTK01','XSTK01',60,'còn mở');
/*!40000 ALTER TABLE `lophocphan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `Role_ID` int NOT NULL,
  `Quyen` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`Role_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'user'),(2,'admin');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sinhvien`
--

DROP TABLE IF EXISTS `sinhvien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sinhvien` (
  `MSV` char(255) NOT NULL,
  `Ten` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chua_cap_nhat',
  `Khoa` char(10) DEFAULT '0',
  `Lop` char(255) DEFAULT 'Chua_cap_nhat',
  `Username` char(255) DEFAULT NULL,
  PRIMARY KEY (`MSV`),
  KEY `tk_link` (`Username`),
  CONSTRAINT `tk_link` FOREIGN KEY (`Username`) REFERENCES `account` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sinhvien`
--

LOCK TABLES `sinhvien` WRITE;
/*!40000 ALTER TABLE `sinhvien` DISABLE KEYS */;
INSERT INTO `sinhvien` VALUES ('28A4042280','Nguyễn Thành Trung','CNTT','K28CNTTA','trung');
/*!40000 ALTER TABLE `sinhvien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thoigianhoc`
--

DROP TABLE IF EXISTS `thoigianhoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thoigianhoc` (
  `ID_tg` int NOT NULL AUTO_INCREMENT,
  `Ma_LHP` char(255) DEFAULT NULL,
  `Tuan` varchar(50) DEFAULT NULL,
  `Thu` int DEFAULT '0',
  `Ca` int DEFAULT '0',
  `ID_GiangVien` char(255) DEFAULT NULL,
  `PhongHoc` char(50) DEFAULT 'Chua_cap_nhat',
  PRIMARY KEY (`ID_tg`),
  KEY `lhp_link` (`Ma_LHP`),
  KEY `gv_link` (`ID_GiangVien`),
  CONSTRAINT `gv_link` FOREIGN KEY (`ID_GiangVien`) REFERENCES `giangvien` (`ID_GiangVien`),
  CONSTRAINT `lhp_link` FOREIGN KEY (`Ma_LHP`) REFERENCES `lophocphan` (`Ma_LHP`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thoigianhoc`
--

LOCK TABLES `thoigianhoc` WRITE;
/*!40000 ALTER TABLE `thoigianhoc` DISABLE KEYS */;
INSERT INTO `thoigianhoc` VALUES (1,'LHP_TRR01','1-15',2,1,'179','D6-211'),(2,'LHP_XSTK01','1-15',3,2,'102','B1-101'),(3,'LHP_LTNC01','1-15',4,1,'103','A1-302'),(4,'LHP_THML01','1-15',5,3,'104','C2-401');
/*!40000 ALTER TABLE `thoigianhoc` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-13 18:50:12

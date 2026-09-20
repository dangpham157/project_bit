let allAdminCourses = [];
let allAdminClasses = [];
let allLecturers = [];

document.addEventListener("DOMContentLoaded", () => {
  // 1. Kiểm tra quyền Admin
  checkAdminAuth();

  // 2. Chuyển đổi Tabs
  initTabs();

  // 3. Tải dữ liệu ban đầu
  loadStats();
  loadAdminCourses();
  loadAdminClasses();
  loadLecturers();

  // 4. Modal Môn học
  initCourseModal();

  // 5. Modal Lớp học phần
  initClassModal();

  // 6. Sự kiện đăng xuất
  document.getElementById("btnAdminLogout").addEventListener("click", handleAdminLogout);

  // 7. Tìm kiếm Môn học
  document.getElementById("searchCourseAdmin").addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    renderCourses(
      allAdminCourses.filter(
        (c) =>
          c.Ma_HP.toLowerCase().includes(keyword) ||
          c.Ten_HP.toLowerCase().includes(keyword) ||
          (c.Khoa && c.Khoa.toLowerCase().includes(keyword))
      )
    );
  });

  // 8. Tìm kiếm Lớp học phần
  document.getElementById("searchClassAdmin").addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    renderClasses(
      allAdminClasses.filter(
        (cl) =>
          cl.maLHP.toLowerCase().includes(keyword) ||
          cl.tenHP.toLowerCase().includes(keyword) ||
          cl.maHP.toLowerCase().includes(keyword)
      )
    );
  });
});

// Kiểm tra quyền Admin
async function checkAdminAuth() {
  try {
    const res = await fetch("/api/me");
    const result = await res.json();

    if (!result.success || result.user.roleId !== 2) {
      alert("⚠️ Bạn không có quyền truy cập trang Quản trị viên!");
      window.location.href = "../login_ui/login.html";
    }
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    window.location.href = "../login_ui/login.html";
  }
}

// Xử lý chuyển đổi Tab
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const targetTabId = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(targetTabId).classList.add("active");

      // Đổi tiêu đề Topbar
      const pageTitle = document.getElementById("pageTitle");
      if (targetTabId === "tab-courses") {
        pageTitle.textContent = "Quản lý Danh mục Môn học (Học phần)";
      } else {
        pageTitle.textContent = "Quản lý Lớp học phần mở đăng ký";
      }
    });
  });
}

// Tải thống kê Dashboard
async function loadStats() {
  try {
    const res = await fetch("/api/admin/stats");
    const result = await res.json();
    if (result.success) {
      document.getElementById("statCourses").textContent = result.data.totalCourses || 0;
      document.getElementById("statClasses").textContent = result.data.totalClasses || 0;
      document.getElementById("statRegistrations").textContent = result.data.totalRegistrations || 0;
    }
  } catch (err) {
    console.error("Lỗi tải thống kê:", err);
  }
}

// ========================================================
// PHẦN 1: QUẢN LÝ MÔN HỌC (COURSES CRUD)
// ========================================================

async function loadAdminCourses() {
  try {
    const res = await fetch("/api/admin/courses");
    const result = await res.json();
    if (result.success) {
      allAdminCourses = result.data || [];
      renderCourses(allAdminCourses);
      updateCourseDropdownForClass();
    }
  } catch (err) {
    console.error("Lỗi tải môn học:", err);
  }
}

function renderCourses(list) {
  const tbody = document.getElementById("courseAdminList");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:#6b7280; padding:20px;">Không tìm thấy môn học nào</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map(
      (c, index) => `
      <tr>
        <td style="text-align:center;">${index + 1}</td>
        <td><strong>${c.Ma_HP}</strong></td>
        <td>${c.Ten_HP}</td>
        <td style="text-align:center;">${c.STC}</td>
        <td><span style="font-size:12px; font-weight:600; color:${c.LoaiMon === "Bắt buộc" ? "#1d4ed8" : "#d97706"}">${c.LoaiMon || "Bắt buộc"}</span></td>
        <td>${c.Khoa || "Chưa cập nhật"}</td>
        <td style="text-align:center;">${c.SoTiet_LT || 30}/${c.SoTiet_TH || 15}</td>
        <td>${c.HPTienQuyet || "Không"}</td>
        <td style="text-align:center;">${c.HocKy || 1}</td>
        <td style="text-align:center;">
          <button class="btn-edit" onclick="openEditCourseModal('${c.Ma_HP}')"><i class="fa-solid fa-pen"></i> Sửa</button>
          <button class="btn-del" onclick="deleteCourse('${c.Ma_HP}')"><i class="fa-solid fa-trash"></i> Xóa</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function initCourseModal() {
  const modal = document.getElementById("modalCourse");
  const btnOpen = document.getElementById("btnOpenAddCourseModal");
  const btnClose = document.getElementById("closeModalCourse");
  const btnCancel = document.getElementById("btnCancelCourse");
  const form = document.getElementById("formCourse");

  btnOpen.addEventListener("click", () => {
    form.reset();
    document.getElementById("courseIsEdit").value = "false";
    document.getElementById("cMaHP").disabled = false;
    document.getElementById("modalCourseTitle").textContent = "Thêm môn học mới";
    modal.classList.add("active");
  });

  const closeModal = () => modal.classList.remove("active");
  btnClose.addEventListener("click", closeModal);
  btnCancel.addEventListener("click", closeModal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const isEdit = document.getElementById("courseIsEdit").value === "true";
    const maHP = document.getElementById("cMaHP").value.trim().toUpperCase();
    const tenHP = document.getElementById("cTenHP").value.trim();
    const tinChi = document.getElementById("cSTC").value;
    const loaiMon = document.getElementById("cLoaiMon").value;
    const khoa = document.getElementById("cKhoa").value;
    const hocKy = document.getElementById("cHocKy").value;
    const soTietLT = document.getElementById("cSoTietLT").value;
    const soTietTH = document.getElementById("cSoTietTH").value;
    const tienQuyet = document.getElementById("cTienQuyet").value.trim();

    const body = { maHP, tenHP, tinChi, loaiMon, khoa, hocKy, soTietLT, soTietTH, tienQuyet };

    try {
      let res;
      if (isEdit) {
        res = await fetch(`/api/admin/courses/${maHP}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const result = await res.json();
      if (result.success) {
        alert("✅ " + result.message);
        closeModal();
        loadAdminCourses();
        loadStats();
      } else {
        alert("⚠️ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối tới máy chủ khi lưu môn học!");
    }
  });
}

function openEditCourseModal(maHP) {
  const course = allAdminCourses.find((c) => c.Ma_HP === maHP);
  if (!course) return;

  document.getElementById("courseIsEdit").value = "true";
  document.getElementById("cMaHP").value = course.Ma_HP;
  document.getElementById("cMaHP").disabled = true;
  document.getElementById("cTenHP").value = course.Ten_HP;
  document.getElementById("cSTC").value = course.STC;
  document.getElementById("cLoaiMon").value = course.LoaiMon || "Bắt buộc";
  document.getElementById("cKhoa").value = course.Khoa || "Khoa Công nghệ thông tin";
  document.getElementById("cHocKy").value = course.HocKy || 1;
  document.getElementById("cSoTietLT").value = course.SoTiet_LT || 30;
  document.getElementById("cSoTietTH").value = course.SoTiet_TH || 15;
  document.getElementById("cTienQuyet").value = course.HPTienQuyet || "Không";

  document.getElementById("modalCourseTitle").textContent = `Chỉnh sửa môn học: ${course.Ma_HP}`;
  document.getElementById("modalCourse").classList.add("active");
}

async function deleteCourse(maHP) {
  if (!confirm(`Bạn có chắc chắn muốn xóa môn học [${maHP}]?`)) return;

  try {
    const res = await fetch(`/api/admin/courses/${maHP}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      alert("✅ " + result.message);
      loadAdminCourses();
      loadStats();
    } else {
      alert("⚠️ " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi xóa môn học!");
  }
}

// ========================================================
// PHẦN 2: QUẢN LÝ LỚP HỌC PHẦN (CLASSES CRUD)
// ========================================================

async function loadAdminClasses() {
  try {
    const res = await fetch("/api/admin/classes");
    const result = await res.json();
    if (result.success) {
      allAdminClasses = result.data || [];
      renderClasses(allAdminClasses);
    }
  } catch (err) {
    console.error("Lỗi tải lớp học phần:", err);
  }
}

function renderClasses(list) {
  const tbody = document.getElementById("classAdminList");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#6b7280; padding:20px;">Chưa có lớp học phần nào</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map((cl) => {
      const schedule = cl.thu
        ? `Thứ ${cl.thu} (Ca ${cl.ca}, P.${cl.phongHoc}) - Tuần ${cl.tuan || "1-15"}`
        : "Chưa xếp lịch";
      const percent = Math.round((cl.daDangKy / cl.soLuongToiDa) * 100) || 0;

      return `
      <tr>
        <td><strong>${cl.maLHP}</strong></td>
        <td>${cl.tenHP} <span style="color:#6b7280; font-size:12px">(${cl.maHP})</span></td>
        <td style="text-align:center;">${cl.tinChi}</td>
        <td>
          <strong>${cl.daDangKy}</strong> / ${cl.soLuongToiDa} 
          <span style="font-size:11px; color:${percent >= 100 ? "#dc2626" : "#16a34a"}">(${percent}%)</span>
        </td>
        <td>${cl.giangVien}</td>
        <td>${schedule}</td>
        <td><span style="color:#059669; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Còn mở</span></td>
        <td style="text-align:center;">
          <button class="btn-del" onclick="deleteClass('${cl.maLHP}')"><i class="fa-solid fa-trash"></i> Xóa lớp</button>
        </td>
      </tr>
    `;
    })
    .join("");
}

async function loadLecturers() {
  try {
    const res = await fetch("/api/admin/lecturers");
    const result = await res.json();
    if (result.success) {
      allLecturers = result.data || [];
      const select = document.getElementById("clGiangVien");
      select.innerHTML = `<option value="">-- Chọn Giảng viên --</option>`;
      allLecturers.forEach((gv) => {
        select.innerHTML += `<option value="${gv.id}">${gv.ten}</option>`;
      });
    }
  } catch (err) {
    console.error("Lỗi tải giảng viên:", err);
  }
}

function updateCourseDropdownForClass() {
  const select = document.getElementById("clMaHP");
  if (!select) return;
  select.innerHTML = `<option value="">-- Chọn môn học --</option>`;
  allAdminCourses.forEach((c) => {
    select.innerHTML += `<option value="${c.Ma_HP}">${c.Ten_HP} (${c.Ma_HP}) - ${c.STC} TC</option>`;
  });
}

function initClassModal() {
  const modal = document.getElementById("modalClass");
  const btnOpen = document.getElementById("btnOpenAddClassModal");
  const btnClose = document.getElementById("closeModalClass");
  const btnCancel = document.getElementById("btnCancelClass");
  const form = document.getElementById("formClass");

  btnOpen.addEventListener("click", () => {
    form.reset();
    modal.classList.add("active");
  });

  const closeModal = () => modal.classList.remove("active");
  btnClose.addEventListener("click", closeModal);
  btnCancel.addEventListener("click", closeModal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const maLHP = document.getElementById("clMaLHP").value.trim().toUpperCase();
    const maHP = document.getElementById("clMaHP").value;
    const soLuong = document.getElementById("clSoLuong").value;
    const idGiangVien = document.getElementById("clGiangVien").value;
    const thu = document.getElementById("clThu").value;
    const ca = document.getElementById("clCa").value;
    const phongHoc = document.getElementById("clPhongHoc").value.trim();
    const tuan = document.getElementById("clTuan").value.trim();

    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maLHP, maHP, soLuong, idGiangVien, thu, ca, phongHoc, tuan }),
      });

      const result = await res.json();
      if (result.success) {
        alert("✅ " + result.message);
        closeModal();
        loadAdminClasses();
        loadStats();
      } else {
        alert("⚠️ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối máy chủ khi mở lớp!");
    }
  });
}

async function deleteClass(maLHP) {
  if (!confirm(`Bạn có chắc chắn muốn xóa lớp học phần [${maLHP}]? Các đăng ký của sinh viên trong lớp này cũng sẽ bị xóa!`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/classes/${maLHP}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      alert("✅ " + result.message);
      loadAdminClasses();
      loadStats();
    } else {
      alert("⚠️ " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi xóa lớp học phần!");
  }
}

// Xử lý Đăng xuất Admin
async function handleAdminLogout() {
  if (!confirm("Bạn có chắc chắn muốn đăng xuất quyền Quản trị?")) return;
  try {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "../login_ui/login.html";
  } catch (err) {
    console.error(err);
    window.location.href = "../login_ui/login.html";
  }
}

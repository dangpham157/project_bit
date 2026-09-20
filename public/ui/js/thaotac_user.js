// Quản lý thông tin và sự kiện người dùng
let allClasses = [];

document.addEventListener("DOMContentLoaded", () => {
  // 1. Kiểm tra session và tải thông tin sinh viên
  loadUserProfile();

  // 2. Tải danh sách lớp mở và kết quả đăng ký
  if (document.getElementById("classList")) {
    loadClasses();
  }
  if (document.getElementById("registeredList")) {
    loadMyRegistrations();
  }

  // 3. Sự kiện chuyển tới trang thông tin cá nhân khi click user-info
  const userInfoClick = document.getElementById("user_info");
  if (userInfoClick) {
    userInfoClick.addEventListener("click", () => {
      window.location.href = "../TTCN_ui/ttcn.html";
    });
  }

  // 4. Sự kiện đăng xuất
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", handleLogout);
  }

  // 5. Sự kiện tìm kiếm nhanh môn học
  const searchInput = document.getElementById("searchCourse");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase().trim();
      renderClassesTable(
        allClasses.filter(
          (item) =>
            item.maLHP.toLowerCase().includes(keyword) ||
            item.tenHP.toLowerCase().includes(keyword) ||
            (item.maHP && item.maHP.toLowerCase().includes(keyword))
        )
      );
    });
  }

  // 6. Sự kiện đổi mật khẩu tại trang Thông tin cá nhân
  const pwdForm = document.getElementById("changePasswordForm");
  if (pwdForm) {
    pwdForm.addEventListener("submit", handleChangePassword);
  }

  // 7. Khởi tạo chức năng cho trang Chương trình đào tạo
  if (document.getElementById("curriculumList")) {
    loadCurriculum();
  }

  // 8. Khởi tạo chức năng cho trang Tra cứu học phần
  if (document.getElementById("searchResultList")) {
    initCourseSearch();
  }
});

// Tải thông tin cá nhân và cập nhật Topbar
async function loadUserProfile() {
  try {
    const res = await fetch("/api/me");
    const result = await res.json();

    if (result.success && result.user) {
      const msvElem = document.getElementById("userMsv");
      const nameElem = document.getElementById("userName");
      if (msvElem) msvElem.textContent = result.user.msv || result.user.username;
      if (nameElem) nameElem.textContent = result.user.fullName || "Sinh viên";

      // Cập nhật cho trang Hồ sơ cá nhân (nếu đang ở trang ttcn.html)
      const pName = document.getElementById("profileName");
      const pMsv = document.getElementById("profileMsv");
      const pClass = document.getElementById("profileClass");
      const pFaculty = document.getElementById("profileFaculty");

      if (pName) pName.textContent = result.user.fullName || "Chưa cập nhật";
      if (pMsv) pMsv.textContent = result.user.msv || result.user.username;
      if (pClass) pClass.textContent = result.user.className || "Chưa cập nhật";
      if (pFaculty) pFaculty.textContent = result.user.faculty || "Công nghệ thông tin";
    } else {
      // Nếu chưa có session, chuyển hướng về trang đăng nhập
      const isLoginPage = window.location.pathname.includes("login.html");
      if (!isLoginPage && !window.location.pathname.endsWith("/")) {
        console.warn("Chưa đăng nhập, chuyển hướng về trang đăng nhập.");
        window.location.href = "../login_ui/login.html";
      }
    }
  } catch (error) {
    console.error("Lỗi xác thực người dùng:", error);
  }
}

// Xử lý Đổi mật khẩu
async function handleChangePassword(e) {
  e.preventDefault();
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const msgElem = document.getElementById("pwdMsg");

  msgElem.style.display = "none";

  if (newPassword !== confirmPassword) {
    msgElem.textContent = "❌ Mật khẩu mới và xác nhận mật khẩu không khớp nhau!";
    msgElem.style.backgroundColor = "#fee2e2";
    msgElem.style.color = "#dc2626";
    msgElem.style.display = "block";
    return;
  }

  if (newPassword.length < 6) {
    msgElem.textContent = "❌ Mật khẩu mới phải có ít nhất 6 ký tự!";
    msgElem.style.backgroundColor = "#fee2e2";
    msgElem.style.color = "#dc2626";
    msgElem.style.display = "block";
    return;
  }

  try {
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const result = await res.json();

    if (result.success) {
      msgElem.textContent = "✅ " + result.message;
      msgElem.style.backgroundColor = "#ecfdf5";
      msgElem.style.color = "#059669";
      msgElem.style.display = "block";
      document.getElementById("changePasswordForm").reset();
    } else {
      msgElem.textContent = "⚠️ " + (result.message || "Không thể đổi mật khẩu!");
      msgElem.style.backgroundColor = "#fee2e2";
      msgElem.style.color = "#dc2626";
      msgElem.style.display = "block";
    }
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    msgElem.textContent = "❌ Lỗi kết nối tới máy chủ khi đổi mật khẩu!";
    msgElem.style.backgroundColor = "#fee2e2";
    msgElem.style.color = "#dc2626";
    msgElem.style.display = "block";
  }
}

// Xử lý Đăng xuất
async function handleLogout(e) {
  if (e) e.preventDefault();
  if (!confirm("Bạn có chắc chắn muốn đăng xuất không?")) return;

  try {
    const res = await fetch("/api/logout", { method: "POST" });
    const result = await res.json();
    if (result.success) {
      window.location.href = "../login_ui/login.html";
    }
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    window.location.href = "../login_ui/login.html";
  }
}

// Tải danh sách các lớp học phần mở đăng ký
async function loadClasses() {
  const tbody = document.getElementById("classList");
  if (!tbody) return;

  try {
    const response = await fetch("/api/classes");
    const result = await response.json();

    if (result.success) {
      allClasses = result.data || [];
      renderClassesTable(allClasses);
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">${result.message || "Lỗi tải dữ liệu"}</td></tr>`;
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Mất kết nối tới máy chủ!</td></tr>`;
  }
}

// Render dữ liệu lớp học phần ra bảng
function renderClassesTable(list) {
  const tbody = document.getElementById("classList");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#6b7280; padding:15px;">Không tìm thấy lớp học phần phù hợp</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map((item) => {
      let actionBtn = "";
      if (item.isRegistered) {
        actionBtn = `<button class="btn-registered" disabled><i class="fa-solid fa-check"></i> Đã đăng ký</button>`;
      } else if (item.isFull) {
        actionBtn = `<button class="btn-full" disabled><i class="fa-solid fa-ban"></i> Đã hết chỗ</button>`;
      } else {
        actionBtn = `
          <button class="btn-register" onclick="registerClass('${item.maLHP}')">
            <i class="fa-solid fa-plus"></i> Đăng ký
          </button>
        `;
      }

      const siSoDisplay = `<strong>${item.daDangKy || 0}</strong> / ${item.soLuongToiDa}`;

      return `
        <tr>
          <td><strong>${item.maLHP}</strong></td>
          <td>${item.tenHP}</td>
          <td>${item.tinChi}</td>
          <td>${item.lichHoc || "Chưa có lịch"}</td>
          <td>${siSoDisplay}</td>
          <td>${actionBtn}</td>
        </tr>
      `;
    })
    .join("");
}

// Xử lý Đăng ký lớp học phần
async function registerClass(maLHP) {
  if (!confirm(`Bạn có chắc chắn muốn đăng ký lớp học phần ${maLHP}?`)) {
    return;
  }

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maLHP }),
    });

    const result = await res.json();

    if (result.success) {
      alert("✅ " + result.message);
      // Tải lại cả hai bảng để đồng bộ dữ liệu
      await Promise.all([loadClasses(), loadMyRegistrations()]);
    } else {
      alert("⚠️ " + (result.message || "Đăng ký không thành công!"));
    }
  } catch (error) {
    console.error("Lỗi đăng ký lớp học phần:", error);
    alert("❌ Lỗi kết nối tới máy chủ khi đăng ký!");
  }
}

// Tải danh sách môn học sinh viên đã đăng ký
async function loadMyRegistrations() {
  const tbody = document.getElementById("registeredList");
  const totalCreditsElem = document.getElementById("totalCredits");
  if (!tbody) return;

  try {
    const res = await fetch("/api/my-registrations");
    const result = await res.json();

    if (result.success) {
      const list = result.data || [];

      if (totalCreditsElem) {
        totalCreditsElem.textContent = result.totalCredits || 0;
      }

      if (list.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; color:#6b7280; padding:20px;">
              Chưa có học phần nào được đăng ký trong học kỳ này.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = list
        .map(
          (item) => `
          <tr>
            <td><strong>${item.maLHP}</strong></td>
            <td>${item.tenHP}</td>
            <td>${item.tinChi}</td>
            <td>${item.giangVien || "Chưa xếp"}</td>
            <td>${item.lichHoc || "Chưa có"}</td>
            <td><span style="color:#059669; font-weight:600;"><i class="fa-solid fa-circle-check"></i> ${item.tinhTrang || "Thành công"}</span></td>
            <td>
              <button class="btn-cancel" onclick="cancelRegistration('${item.maLHP}')">
                <i class="fa-solid fa-trash-can"></i> Hủy
              </button>
            </td>
          </tr>
        `
        )
        .join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">${result.message || "Không thể tải kết quả"}</td></tr>`;
    }
  } catch (error) {
    console.error("Lỗi tải kết quả đăng ký:", error);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Mất kết nối máy chủ!</td></tr>`;
  }
}

// Xử lý Hủy lớp học phần đã đăng ký
async function cancelRegistration(maLHP) {
  if (!confirm(`Bạn có chắc chắn muốn HỦY đăng ký lớp học phần ${maLHP}?`)) {
    return;
  }

  try {
    const res = await fetch("/api/cancel-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maLHP }),
    });

    const result = await res.json();

    if (result.success) {
      alert("✅ " + result.message);
      // Tải lại cả hai bảng để đồng bộ dữ liệu
      await Promise.all([loadClasses(), loadMyRegistrations()]);
    } else {
      alert("⚠️ " + (result.message || "Hủy đăng ký không thành công!"));
    }
  } catch (error) {
    console.error("Lỗi hủy lớp học phần:", error);
    alert("❌ Lỗi kết nối tới máy chủ khi hủy đăng ký!");
  }
}

// ==========================================
// CHỨC NĂNG CHƯƠNG TRÌNH ĐÀO TẠO (CTDT)
// ==========================================
async function loadCurriculum() {
  const tbody = document.getElementById("curriculumList");
  const creditsElem = document.getElementById("accumulatedCredits");
  if (!tbody) return;

  try {
    const res = await fetch("/api/curriculum");
    const result = await res.json();

    if (result.success) {
      if (creditsElem) {
        creditsElem.textContent = result.accumulatedCredits || 0;
      }

      const list = result.data || [];
      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#6b7280; padding:20px;">Chưa có dữ liệu chương trình đào tạo</td></tr>`;
        return;
      }

      tbody.innerHTML = list
        .map((item, index) => {
          let statusBadge = "";
          if (item.status === "Đang học") {
            statusBadge = `<span style="color:#059669; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Đang học</span>`;
          } else {
            statusBadge = `<span style="color:#6b7280;">Chưa học</span>`;
          }

          return `
            <tr>
              <td style="text-align:center;">${index + 1}</td>
              <td><strong>${item.maHP}</strong></td>
              <td>${item.tenHP}</td>
              <td style="text-align:center;">${item.tinChi}</td>
              <td style="text-align:center;">${item.soTietLT}</td>
              <td style="text-align:center;">${item.soTietTH}</td>
              <td>${item.tienQuyet || "Không"}</td>
              <td>${item.khoa || "Chưa cập nhật"}</td>
              <td style="text-align:center;">${statusBadge}</td>
            </tr>
          `;
        })
        .join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">${result.message || "Lỗi tải CTĐT"}</td></tr>`;
    }
  } catch (error) {
    console.error("Lỗi tải chương trình đào tạo:", error);
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">Mất kết nối máy chủ khi tải CTĐT!</td></tr>`;
  }
}

// ==========================================
// CHỨC NĂNG TRA CỨU HỌC PHẦN
// ==========================================
function initCourseSearch() {
  const btnSearch = document.getElementById("btnSearchCourse");
  const courseIdInput = document.getElementById("course-id");
  const courseNameInput = document.getElementById("course-name");
  const deptSelect = document.getElementById("department");

  // Tải danh sách học phần ban đầu
  searchCourses();

  if (btnSearch) {
    btnSearch.addEventListener("click", (e) => {
      e.preventDefault();
      searchCourses();
    });
  }

  // Bắt sự kiện Enter khi nhập ô tìm kiếm
  [courseIdInput, courseNameInput].forEach((input) => {
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          searchCourses();
        }
      });
    }
  });

  if (deptSelect) {
    deptSelect.addEventListener("change", () => {
      searchCourses();
    });
  }
}

async function searchCourses() {
  const tbody = document.getElementById("searchResultList");
  if (!tbody) return;

  const courseId = document.getElementById("course-id")?.value.trim() || "";
  const courseName = document.getElementById("course-name")?.value.trim() || "";
  const department = document.getElementById("department")?.value.trim() || "";

  tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:#6b7280; padding:15px;">Đang tìm kiếm...</td></tr>`;

  try {
    const params = new URLSearchParams();
    if (courseId) params.append("courseId", courseId);
    if (courseName) params.append("courseName", courseName);
    if (department) params.append("department", department);

    const res = await fetch(`/api/courses/search?${params.toString()}`);
    const result = await res.json();

    if (result.success) {
      const list = result.data || [];

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:#6b7280; padding:20px;">Không tìm thấy học phần nào khớp với tiêu chí tìm kiếm.</td></tr>`;
        return;
      }

      tbody.innerHTML = list
        .map((item, index) => {
          return `
            <tr>
              <td style="text-align:center;">${index + 1}</td>
              <td><strong>${item.maLHP ? `${item.maLHP} (${item.maHP})` : item.maHP}</strong></td>
              <td>${item.tenHP}</td>
              <td style="text-align:center;">${item.tinChi}</td>
              <td>${item.loaiMon || "Bắt buộc"}</td>
              <td>${item.khoa || "Chưa cập nhật"}</td>
              <td>${item.giangVien || "Chưa xếp"}</td>
              <td style="text-align:center;">${item.soLuongToiDa || 0}</td>
              <td style="text-align:center;">${item.daDangKy || 0}</td>
              <td>${item.lichHoc || "Chưa xếp lịch"}</td>
            </tr>
          `;
        })
        .join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:red;">${result.message || "Lỗi tra cứu"}</td></tr>`;
    }
  } catch (error) {
    console.error("Lỗi tra cứu học phần:", error);
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:red;">Mất kết nối máy chủ khi tra cứu!</td></tr>`;
  }
}


const user_infoClick = document.getElementById("user_info");

user_infoClick.addEventListener("click", function () {
  window.location.href = "../TTCN_ui/ttcn.html";
});

document.addEventListener("DOMContentLoaded", () => {
  loadClasses();
});

async function loadClasses() {
  const tbody = document.getElementById("classList");
  if (!tbody) return;

  try {
    const response = await fetch("/api/classes");
    const result = await response.json();

    if (result.success) {
      tbody.innerHTML = result.data
        .map(
          (item) => `
                <tr>
                    <td><strong>${item.maLHP}</strong></td>
                    <td>${item.tenHP}</td>
                    <td>${item.tinChi}</td>
                    <td>${item.lichHoc || "Chưa có lịch"}</td>
                    <td>${item.soLuong}</td>
                    <td>
                        <button class="btn-register" onclick="registerClass('${item.maLHP}')">
                            Đăng ký
                        </button>
                    </td>
                </tr>
            `,
        )
        .join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Lỗi tải dữ liệu</td></tr>`;
    }
  } catch (error) {
    console.error("Lỗi:", error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Mất kết nối máy chủ!</td></tr>`;
  }
}

function registerClass(maLHP) {
  console.log(`Đang xử lý đăng ký lớp: ${maLHP}`);
}

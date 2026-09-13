document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const studentId = document.getElementById("student-id").value.trim();
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");
  const btn = document.querySelector(".btn-login");

  // Hiển thị trạng thái đang xử lý
  btn.innerHTML = "Đang xử lý...";
  btn.disabled = true;
  errorMsg.style.display = "none";

  try {
    // Gửi dữ liệu tới API
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Đăng nhập thành công, chuyển hướng sang trang chủ
      window.location.href = data.redirectUrl;
    } else {
      // Hiện lỗi sai mật khẩu hoặc tài khoản
      errorMsg.textContent = data.message;
      errorMsg.style.display = "block";
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error);
    errorMsg.textContent = "Không thể kết nối tới máy chủ.";
    errorMsg.style.display = "block";
  } finally {
    // Phục hồi lại nút bấm
    btn.innerHTML = "Đăng nhập";
    btn.disabled = false;
  }
});

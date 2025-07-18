document.addEventListener("DOMContentLoaded", function () {
    const avatar = document.querySelector(".user-avatar");
    const dropdown = document.querySelector(".dropdown");
  
    if (avatar && dropdown) {
      avatar.addEventListener("click", function (event) {
        event.stopPropagation(); // Ngăn chặn sự kiện lan ra ngoài
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
      });
  
      // Ẩn dropdown khi click ra ngoài
      document.addEventListener("click", function () {
        dropdown.style.display = "none";
      });
  
      dropdown.addEventListener("click", function (event) {
        event.stopPropagation(); // Ngăn dropdown bị ẩn khi click vào bên trong
      });
    }
  });
  
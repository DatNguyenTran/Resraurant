document.addEventListener("DOMContentLoaded", function () {
  const bookings = window.bookings || [];
  const restaurantInfor = window.restaurantInfor || [];
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const tablesContainer = document.querySelector(".table-list");
  const selectedTableInput = document.getElementById("selectedTableId");
  const warnElm = document.getElementById("timeWarn");
  /** 🕒 Không cho chọn ngày trong quá khứ */
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // Thời gian mở và đóng cửa
  const timeOpening = "07:00";
  const lastAvailableTime = "20:00";

  timeInput.setAttribute("min", timeOpening);
  timeInput.setAttribute("max", lastAvailableTime);

   // Khi gõ giờ, tự khóa về trong khoảng 07:00–20:00
  timeInput.addEventListener("input", function () {
    if (this.value && (this.value < timeOpening || this.value > lastAvailableTime)) {
      // báo lỗi cho trình duyệt khi submit
      this.setCustomValidity("Nhà hàng chỉ nhận đặt từ 07:00 đến 20:00");
      // hiện chữ đỏ ngay lập tức
      warnElm.textContent = "⏰ Nhà hàng chỉ nhận đặt từ 07:00 đến 20:00!";
    } else {
      // hợp lệ thì xóa lỗi và ẩn chữ
      this.setCustomValidity("");
      warnElm.textContent = "";
    }
  });

  /** 🕒 Cập nhật min cho giờ khi chọn ngày */
  dateInput.addEventListener("change", function () {
    const selectedDate = new Date(dateInput.value);
    const now = new Date();
    

    // Giờ tối thiểu cho hôm nay = giờ hiện tại + 1 h
    const plus1h = new Date(now.getTime() + 60 * 60 * 1000);
    const plus1hStr = plus1h.toTimeString().slice(0, 5); // "HH:mm"

    if (selectedDate.toDateString() === now.toDateString()) {
      const minToday = plus1hStr > timeOpening ? plus1hStr : timeOpening;
      timeInput.setAttribute("min", minToday);
    } else {
      timeInput.setAttribute("min", timeOpening);
    }
    timeInput.setAttribute("max", lastAvailableTime);
    updateTableStatus();
  });

  /** 🏷️ Cập nhật trạng thái bàn dựa trên ngày & giờ đã chọn */
  function updateTableStatus() {
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;

    if (!selectedDate || !selectedTime) return;

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    console.log(selectedDateTime);

    document.querySelectorAll(".table-card").forEach((table) => {
      const tableId = table.getAttribute("data-table-id");
      const statusDiv = table.querySelector(".table-status");

      const isReserved = bookings.some((booking) => {
        if (booking.table.toString() !== tableId) return false;

        const bookedDateTime = new Date(booking.orderDate);

        // Trừ đi 7 giờ bằng cách sử dụng getTime()
        const adjustedBookedDateTime = new Date(
          bookedDateTime.getTime() - 7 * 60 * 60 * 1000
        );

        const timeDiff = Math.abs(
          (selectedDateTime - adjustedBookedDateTime) / (1000 * 60 * 60)
        );

        return timeDiff < 3; // Nếu chênh lệch dưới 3 giờ thì bàn đã đặt
      });

      if (isReserved) {
        statusDiv.textContent = "Đã đặt trước";
        statusDiv.className = "table-status reserved";
        table.classList.add("disabled");
      } else {
        statusDiv.textContent = "Có sẵn";
        statusDiv.className = "table-status available";
        table.classList.remove("disabled");
      }
    });
  }

  /** 🎯 Xử lý chọn bàn */
  function selectTable(selectedTable) {
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;

    if (!selectedDate || !selectedTime) {
      alert("Vui lòng chọn ngày và giờ trước khi chọn bàn!");
      return;
    }

    document.querySelectorAll(".table-card").forEach((table) => {
      table.classList.remove("selected");
    });

    selectedTable.classList.add("selected");
    selectedTableInput.value = selectedTable.getAttribute("data-table-id");
    console.log("Bàn được chọn:", selectedTableInput.value);
  }

  /** 🖱️ Xử lý chọn bàn (Event Delegation) */
  tablesContainer.addEventListener("click", function (event) {
    const selectedTable = event.target.closest(".table-card");
    if (selectedTable && !selectedTable.classList.contains("disabled")) {
      selectTable(selectedTable);
    }
  });

  // Gán sự kiện onchange cho input ngày & giờ
  dateInput.addEventListener("change", updateTableStatus);
  timeInput.addEventListener("change", updateTableStatus);

  // Gọi lần đầu khi trang load để disable bàn nếu cần
  updateTableStatus();
});

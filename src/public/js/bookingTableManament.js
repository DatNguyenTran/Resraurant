document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-name");
    const dateFilter = document.getElementById("filter-date");
    const tableRows = document.querySelectorAll(".reservation-row");

    function filterReservations() {
        const searchValue = searchInput.value.toLowerCase();
        const selectedDate = dateFilter.value;

        tableRows.forEach(row => {
            const name = row.querySelector(".customer-name").textContent.toLowerCase();
            const date = row.querySelector(".reservation-date").textContent;

            const matchesName = name.includes(searchValue);
            const matchesDate = selectedDate === "" || date === selectedDate;

            if (matchesName && matchesDate) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    searchInput.addEventListener("input", filterReservations);
    dateFilter.addEventListener("change", filterReservations);
});
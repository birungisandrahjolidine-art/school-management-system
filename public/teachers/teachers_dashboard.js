function markAttendance() {
    alert("Teacher attendance form will be added here.");
}


// Highlight navigation links

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {

    link.addEventListener("click", function () {

        navLinks.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

    });

});


// Table buttons

const tableButtons = document.querySelectorAll(".table-button");

tableButtons.forEach(button => {

    button.addEventListener("click", function () {

        alert("Teacher details will be displayed here.");

    });

});


// Report buttons

const reportCards = document.querySelectorAll(".report-card");

reportCards.forEach(report => {

    report.addEventListener("click", function () {

        const reportName = this.querySelector("strong").textContent;

        alert(reportName + " will be generated here.");

    });

});
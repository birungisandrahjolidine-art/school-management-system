// CURRENT DATE/

const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-UG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});



// QUICK ACTION NOTIFICATIONS


const actionButtons = document.querySelectorAll(".action-btn");

actionButtons.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();

    const action = button.textContent.trim();

    alert(`"${action}" page is coming soon.`);
  });
});
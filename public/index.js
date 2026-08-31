document.addEventListener("DOMContentLoaded", function () {
    var mobileToggle = document.getElementById("mobileToggle");
    var navLinks = document.querySelector(".nav-links");

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener("click", function () {
            navLinks.classList.toggle("open");
        });
    }

    var links = document.querySelectorAll(".nav-links .nav-link");

    links.forEach(function (link) {
        link.addEventListener("click", function () {
            links.forEach(function (l) {
                l.classList.remove("active");
            });
            link.classList.add("active");

            if (navLinks.classList.contains("open")) {
                navLinks.classList.remove("open");
            }
        });
    });

    window.addEventListener("scroll", function () {
        var navbar = document.querySelector(".navbar");
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 2px 15px rgba(0, 0, 0, 0.1)";
        } else {
            navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.06)";
        }
    });
});

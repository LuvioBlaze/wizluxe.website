// =========================
// HAMBURGER MENU
// =========================

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}


// =========================
// INTRO SCREEN
// =========================

window.addEventListener("load", () => {

    const intro = document.getElementById("intro");

    if (intro) {
        setTimeout(() => {
            intro.style.display = "none";
        }, 3000);
    }

});


// =========================
// SCROLL REVEAL
// =========================

const reveals = document.querySelectorAll(".reveal");

function revealSections() {

    reveals.forEach(section => {

        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop < window.innerHeight - 100) {
            section.classList.add("active");
        }

    });

}

window.addEventListener("scroll", revealSections);
revealSections();


// =========================
// COUNTER ANIMATION
// =========================

const statsSection = document.querySelector(".stats");
const counters = document.querySelectorAll(".counter");

let started = false;

function runCounters() {

    if (!statsSection || started) return;

    const sectionTop = statsSection.getBoundingClientRect().top;

    if (sectionTop < window.innerHeight - 50) {

        started = true;

        counters.forEach(counter => {

            const target = Number(counter.dataset.target);
            let count = 0;

            const timer = setInterval(() => {

                count++;

                counter.innerText = count;

                if (count >= target) {

                    counter.innerText = target + "+";
                    clearInterval(timer);

                }

            }, 10);

        });

    }

}

window.addEventListener("scroll", runCounters);


// =========================
// WHATSAPP CONTACT FORM
// =========================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const name = document.getElementById("name")?.value || "";
        const phone = document.getElementById("phone")?.value || "";
        const email = document.getElementById("email")?.value || "";
        const message = document.getElementById("message")?.value || "";


        const whatsappMessage =
`Hello Wizluxe Furniture & Interior,

👤 Name: ${name}

📞 Phone: ${phone}

📧 Email: ${email}

📝 Project Details:
${message}`;


        const whatsappURL =
        `https://wa.me/2349038318362?text=${encodeURIComponent(whatsappMessage)}`;


        window.open(whatsappURL, "_blank");

    });

}


// =========================
// DARK MODE
// =========================

const themeToggle = document.getElementById("theme-toggle");


if (themeToggle) {


    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark-mode");
        themeToggle.innerText = "☀️";

    }


    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");


        if (document.body.classList.contains("dark-mode")) {

            themeToggle.innerText = "☀️";
            localStorage.setItem("theme", "dark");

        } else {

            themeToggle.innerText = "🌙";
            localStorage.setItem("theme", "light");

        }

    });

}


// =========================
// COOKIE BANNER
// =========================

const cookieBanner = document.getElementById("cookie-banner");


if (cookieBanner) {

    cookieBanner.style.display = "flex";


    window.acceptCookies = function() {

        cookieBanner.style.display = "none";

    };


    window.declineCookies = function() {

        cookieBanner.style.display = "none";

    };

}


// =========================
// BACK TO TOP BUTTON
// =========================

const backToTop = document.getElementById("backToTop");


if (backToTop) {


    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            backToTop.style.display = "block";

        } else {

            backToTop.style.display = "none";

        }

    });


    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}


// =========================
// FAQ ACCORDION
// =========================

const faqQuestions = document.querySelectorAll(".faq-question");


faqQuestions.forEach(question => {


    question.addEventListener("click", () => {


        const answer = question.nextElementSibling;


        faqQuestions.forEach(item => {


            if (item !== question) {

                item.classList.remove("active");

                if (item.nextElementSibling) {

                    item.nextElementSibling.style.maxHeight = null;

                }

            }


        });


        question.classList.toggle("active");


        if (answer.style.maxHeight) {

            answer.style.maxHeight = null;

        } else {

            answer.style.maxHeight = answer.scrollHeight + "px";

        }


    });


});
// =========================
// GALLERY FILTER SYSTEM
// =========================

const filterButtons = document.querySelectorAll(".filter-btn");
const galleryCards = document.querySelectorAll(".gallery-card");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        const filter = button.dataset.filter;


        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");


        galleryCards.forEach(card => {

            if (filter === "all" || card.classList.contains(filter)) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

});

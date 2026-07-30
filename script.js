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

    setTimeout(() => {

        const intro = document.getElementById("intro");

        if (intro) {
            intro.style.display = "none";
        }

    }, 3000);

});

// =========================
// SCROLL REVEAL
// =========================

const reveals = document.querySelectorAll(".reveal");

function revealSections() {

    reveals.forEach(section => {

        const windowHeight = window.innerHeight;
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop < windowHeight - 100) {
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

    if (started) return;

    const sectionTop = statsSection.getBoundingClientRect().top;

    if (sectionTop < window.innerHeight - 50) {

        started = true;

        counters.forEach(counter => {

            const target = +counter.dataset.target;
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

    contactForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        const whatsappMessage =
`Hello Wizluxe Furniture & Interior,

👤 Name: ${name}

📞 Phone: ${phone}

📧 Email: ${email}

📝 Project Details:
${message}`;

const whatsappURL =
`https://wa.me/2349038318362?text=${encodeURIComponent(whatsappMessage)}`;

const submitButton = contactForm.querySelector("button[type='submit']");

submitButton.disabled = true;
submitButton.innerText = "⏳ Sending...";

setTimeout(() => {

    window.open(whatsappURL, "_blank");

    submitButton.disabled = false;
    submitButton.innerText = "Send Inquiry";

}, 1000);

});
}
// ==========================
// DARK MODE WITH MEMORY
// ==========================

const themeToggle = document.getElementById("theme-toggle");

// Load saved theme
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
document.getElementById("cookie-banner").style.display = "flex";

function acceptCookies() {
  document.getElementById("cookie-banner").style.display = "none";
}

function declineCookies() {
  document.getElementById("cookie-banner").style.display = "none";
}
// Back To Top Button

const backToTop = document.getElementById("backToTop");

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
// ===========================
// FAQ Accordion
// ===========================

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(question => {
    question.addEventListener("click", () => {

        const answer = question.nextElementSibling;

        faqQuestions.forEach(item => {
            if (item !== question) {
                item.nextElementSibling.style.maxHeight = null;
                item.classList.remove("active");
            }
        });

        question.classList.toggle("active");

        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
        } else {
            answer.style.maxHeight = answer.scrollHeight + "px";
        }

    });
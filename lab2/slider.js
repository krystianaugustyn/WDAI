
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    if (index < 0) currentSlide = slides.length - 1;

    slides.forEach(slide => slide.classList.remove("active"));
    slides[currentSlide].classList.add("active");
}

function changeSlide(n) {currentSlide += n;showSlide(currentSlide);
}

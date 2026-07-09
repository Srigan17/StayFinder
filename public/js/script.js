// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()


//------------------- stars in show.ejs ------------------------------

document.addEventListener("DOMContentLoaded", function() {
    const stars = document.querySelectorAll(".star-input");
    const ratingInput = document.getElementById("rating");
    const starError = document.getElementById("starError");

    let currentRating = 0;
    let userSelected = false; // track if user actually clicked a star

    updateStars(currentRating);

    stars.forEach(function(star) {
        const val = parseInt(star.dataset.value);

        star.addEventListener("mouseenter", function() {
            updateStars(val);
        });

        star.addEventListener("mouseleave", function() {
            updateStars(currentRating);
        });

        star.addEventListener("click", function() {
            currentRating = val;
            ratingInput.value = val;
            userSelected = true;
            starError.style.visibility = "hidden";
            updateStars(currentRating);
        });
    });

    function updateStars(rating) {
        stars.forEach(function(s) {
            const v = parseInt(s.dataset.value);
            s.classList.toggle("filled", v <= rating);
        });
    }

    const form = document.querySelector(".review-form");
    if (form) {
        form.addEventListener("submit", function(e) {
            if (!userSelected) {
                starError.style.visibility = "visible";
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
});
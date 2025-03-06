document.addEventListener("DOMContentLoaded", function() {
    const progress = document.querySelector(".progress");

    function animateProgress() {
        progress.style.width = "0%";
        setTimeout(() => {
            progress.style.width = "100%";
        }, 100);
    }

    setInterval(animateProgress, 2000);
    animateProgress();
});

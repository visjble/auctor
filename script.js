document.addEventListener("DOMContentLoaded", function(event) {
    const imgLoader = document.getElementById('imgLoader');
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const progressBar = document.getElementById('progressBar');
    const intervalInput = document.getElementById('interval');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const imagesLeftLabel = document.getElementById('imagesLeftLabel');

    let images = [];
    let currentIndex = 0;
    let imageDisplayInterval;
    let progressBarInterval;
    let intervalTime;
    let isPaused = false;

    function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
        }
    }

    function checkConditions() {
        if (images.length > 0 && intervalInput.value !== '') {
            startButton.removeAttribute("disabled");
            pauseButton.removeAttribute("disabled");
        } else {
            startButton.setAttribute("disabled", true);
            pauseButton.setAttribute("disabled", true);
        }
    }

imgLoader.addEventListener('change', function(event) {
    const promises = [];

    for (let i = 0; i < event.target.files.length; i++) {
        promises.push(new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                images.push(e.target.result);
                resolve();
            };
            reader.readAsDataURL(event.target.files[i]);
        }));
    }

    Promise.all(promises).then(() => {
        shuffleArray(images);
        checkConditions();
    });
});


    intervalInput.addEventListener('input', checkConditions);

    function displayImage() {
        canvas.width = 1300;
        canvas.height = 800;

        const img = new Image();
        img.onload = function() {
            const scaleFactor = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );

            const width = img.width * scaleFactor;
            const height = img.height * scaleFactor;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        };
        img.src = images[currentIndex];
    }

    function nextSlide() {
        if (currentIndex < images.length) {
            progressBar.style.width = '0%';
            updateImagesLeftLabel();
            displayImage();
            currentIndex++;
        } else {
            endSlideshow();
        }
    }

    function pauseSlideshow() {
        if (isPaused) {
            isPaused = false;
            pauseButton.textContent = "Pause";
            resumeSlideshow();
        } else {
            isPaused = true;
            pauseButton.textContent = "Resume";
            clearInterval(imageDisplayInterval);
            clearInterval(progressBarInterval);
        }
    }

    function resumeSlideshow() {
        intervalTime = intervalInput.value * 1000;

        imageDisplayInterval = setInterval(nextSlide, intervalTime);

        progressBarInterval = setInterval(function() {
            let increment = (100 * 100) / intervalTime;
            let currentWidth = parseFloat(progressBar.style.width);
            progressBar.style.width = (currentWidth + increment) + '%';
        }, 100);
    }

    function startSlideshow() {
        clearInterval(imageDisplayInterval);
        clearInterval(progressBarInterval);

        if (!isPaused) {
            currentIndex = 0;
            progressBar.style.width = '0%';
            nextSlide();

            intervalTime = intervalInput.value * 1000; 

            imageDisplayInterval = setInterval(nextSlide, intervalTime);

            progressBarInterval = setInterval(function() {
                let increment = (100 * 100) / intervalTime;
                let currentWidth = parseFloat(progressBar.style.width);
                progressBar.style.width = (currentWidth + increment) + '%';
            }, 100);
        } else {
            resumeSlideshow();
        }
    }

    function updateImagesLeftLabel() {
        imagesLeftLabel.textContent = `Images left: ${images.length - currentIndex - 1}`;
    }

    function endSlideshow() {
        progressBar.style.width = '100%';
        imagesLeftLabel.textContent = 'All images displayed!';
        clearInterval(imageDisplayInterval);
        clearInterval(progressBarInterval);
    }

    startButton.addEventListener('click', startSlideshow);
    pauseButton.addEventListener('click', pauseSlideshow);

    checkConditions();
});

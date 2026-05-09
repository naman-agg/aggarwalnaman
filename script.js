document.addEventListener('DOMContentLoaded', () => {

    // 1. Dark Mode Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
        }
    });

    // Allow toggle with Enter key for accessibility
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            themeToggle.click();
        }
    });

    // 2. Scroll Reveal Animations (Intersection Observer)
    // This looks for anything with the class 'fade-up'
    const observerOptions = {
        root: document.querySelector('.app-container'), // We observe scrolling INSIDE our container
        rootMargin: '0px',
        threshold: 0.1 // Triggers when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Optional: Stop observing once it has animated in
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Select all elements that need to animate and observe them
    const animatedElements = document.querySelectorAll('.fade-up');
    animatedElements.forEach(el => observer.observe(el));

});
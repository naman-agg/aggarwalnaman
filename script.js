document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Theme Toggle & Clock ---
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.replace('dark-mode', 'light-mode');
        } else {
            body.classList.replace('light-mode', 'dark-mode');
        }
    });

    const clockElement = document.getElementById('live-clock');
    setInterval(() => {
        const now = new Date();
        clockElement.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }, 1000);

    // --- 2. Word-by-Word Paragraph Setup ---
    const manifestoTextEl = document.getElementById('manifesto-text');
    // Split the text into an array of words
    const words = manifestoTextEl.innerText.trim().split(/\s+/);
    manifestoTextEl.innerHTML = ''; // Clear original text
    
    // Wrap each word in a span and append back to the element
    words.forEach(word => {
        const span = document.createElement('span');
        span.innerText = word + ' ';
        manifestoTextEl.appendChild(span);
    });
    
    // Store all the spans for quick access during scrolling
    const wordSpans = manifestoTextEl.querySelectorAll('span');

    // --- 3. Standard Scroll Reveals ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));


    // --- 4. Cinematic Scroll Logic Engine ---
    
    // Hero Elements
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1');
    const heroL2 = document.getElementById('hero-l2');
    const heroL3 = document.getElementById('hero-l3');
    const headerBg = document.getElementById('header-bg');
    
    // Manifesto & Workshop Elements
    const manifestoTrigger = document.getElementById('manifesto-trigger');
    const workshopTrigger = document.getElementById('workshop-trigger');
    const aiText = document.getElementById('ai-text');
    const aiImage = document.getElementById('ai-image');
    const printSolid = document.getElementById('print-solid');

    function mapRange(value, inMin, inMax, outMin, outMax) {
        value = Math.max(inMin, Math.min(value, inMax)); 
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    function onScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // A. Hero to Header Transition (Happens over the first 500px of scroll)
        const transitionDistance = 500;
        const heroProgress = Math.max(0, Math.min(scrollY / transitionDistance, 1));

        // Fade out Line 1 and Line 3, and move them slightly
        heroL1.style.opacity = 1 - (heroProgress * 1.5);
        heroL1.style.transform = `translateY(-${heroProgress * 30}px)`;
        
        heroL3.style.opacity = 1 - (heroProgress * 1.5);
        heroL3.style.transform = `translateY(${heroProgress * 30}px)`;

        // Move the entire container up to the header position
        const startTop = windowHeight / 2;
        const endTop = 40; // Center of the 80px header
        const currentTop = startTop - ((startTop - endTop) * heroProgress);
        dynamicHero.style.top = `${currentTop}px`;

        // Scale down your name (Line 2)
        const startScale = 1;
        const endScale = 0.3; // Shrinks down to fit nicely in the header
        const currentScale = startScale - ((startScale - endScale) * heroProgress);
        heroL2.style.transform = `scale(${currentScale})`;

        // Fade in the frosted glass header background
        headerBg.style.opacity = heroProgress;


        // B. Word-by-Word Scrubbing
        const manifestoRect = manifestoTrigger.getBoundingClientRect();
        if (manifestoRect.top < windowHeight && manifestoRect.bottom > 0) {
            // Calculate progress strictly within the sticky section
            let progress = -manifestoRect.top / (manifestoRect.height - windowHeight);
            progress = Math.max(0, Math.min(progress, 1));
            
            // Calculate how many words should be highlighted based on progress
            let activeWordIndex = Math.floor(progress * wordSpans.length);

            // Loop through spans and apply the colour
            wordSpans.forEach((span, index) => {
                if (index <= activeWordIndex) {
                    span.style.color = 'var(--text-primary)';
                } else {
                    span.style.color = 'var(--text-muted)';
                }
            });
        }

        // C. The Workshop Animations
        const workshopRect = workshopTrigger.getBoundingClientRect();
        if (workshopRect.top < windowHeight && workshopRect.bottom > 0) {
            let progress = -workshopRect.top / (workshopRect.height - windowHeight);
            progress = Math.max(0, Math.min(progress, 1));

            const textOpacity = mapRange(progress, 0.2, 0.5, 1, 0);
            const imageOpacity = mapRange(progress, 0.5, 0.8, 0, 1);
            aiText.style.opacity = textOpacity;
            aiImage.style.opacity = imageOpacity;

            const clipInset = mapRange(progress, 0.3, 0.9, 100, 0);
            printSolid.style.clipPath = `inset(${clipInset}% 0 0 0)`;
        }

        requestAnimationFrame(onScroll);
    }

    requestAnimationFrame(onScroll);
});
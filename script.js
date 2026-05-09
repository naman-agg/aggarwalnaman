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
    const words = manifestoTextEl.innerText.trim().split(/\s+/);
    manifestoTextEl.innerHTML = ''; 
    
    words.forEach(word => {
        const span = document.createElement('span');
        span.innerText = word;
        manifestoTextEl.appendChild(span);
        manifestoTextEl.appendChild(document.createTextNode(' '));
    });
    
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
    const ambientAurora = document.getElementById('ambient-aurora');
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1');
    const heroL2 = document.getElementById('hero-l2');
    const heroL3 = document.getElementById('hero-l3');
    const headerBg = document.getElementById('header-bg');
    
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

        // A. Hero to Header Transition
        const transitionDistance = windowHeight; 
        const heroProgress = Math.max(0, Math.min(scrollY / transitionDistance, 1));

        // Fade out the Aurora as we scroll
        ambientAurora.style.opacity = 1 - (heroProgress * 1.5); 

        heroL1.style.opacity = 1 - (heroProgress * 2); 
        heroL1.style.transform = `translateY(-${heroProgress * 40}px)`;
        
        heroL3.style.opacity = 1 - (heroProgress * 2);
        heroL3.style.transform = `translateY(${heroProgress * 40}px)`;

        const startTop = windowHeight / 2;
        const endTop = 40; 
        const currentTop = startTop - ((startTop - endTop) * heroProgress);
        dynamicHero.style.top = `${currentTop}px`;

        const isMobile = window.innerWidth <= 768;
        const endScale = isMobile ? 0.4 : 0.3; 
        const currentScale = 1 - ((1 - endScale) * heroProgress);
        heroL2.style.transform = `scale(${currentScale})`;

        headerBg.style.opacity = heroProgress;
        
        if (heroProgress > 0.9) {
            headerBg.classList.add('show-neon');
        } else {
            headerBg.classList.remove('show-neon');
        }

        // B. Word-by-Word Scrubbing
        const manifestoRect = manifestoTrigger.getBoundingClientRect();
        
        if (heroProgress >= 1) {
            manifestoTextEl.style.opacity = 1;
        } else {
            manifestoTextEl.style.opacity = 0;
        }

        if (manifestoRect.top < windowHeight && manifestoRect.bottom > 0) {
            let progress = -manifestoRect.top / (manifestoRect.height - windowHeight);
            progress = Math.max(0, Math.min(progress, 1));
            
            let activeWordIndex = Math.floor(progress * wordSpans.length);

            wordSpans.forEach((span, index) => {
                if (index <= activeWordIndex) {
                    span.classList.add('active-word');
                } else {
                    span.classList.remove('active-word');
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
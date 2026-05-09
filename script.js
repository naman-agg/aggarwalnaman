document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Magnetic Parallax & Cursor Engine ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    const ambientAurora = document.getElementById('ambient-aurora');
    
    // Global variables to store mouse coordinates for the render loop
    let mouseX = 0;
    let mouseY = 0;
    
    window.addEventListener('mousemove', (e) => {
        // Update custom cursor
        cursorDot.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
        cursorRing.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
        
        // Calculate parallax tilt limits (max 15 degrees)
        mouseX = (window.innerWidth / 2 - e.clientX) / 40;
        mouseY = (window.innerHeight / 2 - e.clientY) / 40;
    });

    // Hover interactions for the negative cursor
    document.querySelectorAll('.interactive-element').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorRing.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorRing.classList.remove('hovering');
        });
    });

    // --- 2. Theme Toggle & Clock ---
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

    // --- 3. Word-by-Word Paragraph Setup ---
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

    // --- 4. Standard Scroll Reveals ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // --- 5. Cinematic Scroll Logic Engine ---
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1');
    const heroL2 = document.getElementById('hero-l2');
    const heroL3 = document.getElementById('hero-l3');
    const headerBg = document.getElementById('header-bg');
    const manifestoTrigger = document.getElementById('manifesto-trigger');
    
    // Calculate exact pixel distance needed to center name in the 80px header
    let moveDist = 0;
    function calculateHeroMath() {
        const l2Rect = heroL2.getBoundingClientRect();
        const l2CenterY = l2Rect.top + (l2Rect.height / 2); 
        moveDist = l2CenterY - 40; 
    }
    
    setTimeout(calculateHeroMath, 100); 
    window.addEventListener('resize', calculateHeroMath);

    function onScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // A. Zero-Delay Hero Transition
        // The container margin is 350px. The transition must finish exactly at 350px.
        const transitionDistance = 350; 
        const heroProgress = Math.max(0, Math.min(scrollY / transitionDistance, 1));

        // Fade Aurora
        ambientAurora.style.opacity = 1 - (heroProgress * 1.5); 
        // Parallax fades to 0 as it locks into header, ensuring stability
        const parallaxStrength = 1 - heroProgress;
        ambientAurora.style.transform = `translate(${mouseX * -2 * parallaxStrength}px, ${mouseY * -2 * parallaxStrength}px)`;

        // Fade out top and bottom lines
        heroL1.style.opacity = 1 - (heroProgress * 2); 
        heroL3.style.opacity = 1 - (heroProgress * 2); 

        // Scale Naman Aggarwal
        const isMobile = window.innerWidth <= 768;
        const endScale = isMobile ? 0.4 : 0.3; 
        const currentScale = 1 - ((1 - endScale) * heroProgress);
        
        // Apply Translation, Scaling, and Magnetic Parallax simultaneously
        dynamicHero.style.transform = `translateY(-${moveDist * heroProgress}px) rotateY(${mouseX * parallaxStrength}deg) rotateX(${mouseY * parallaxStrength}deg)`;
        heroL2.style.transform = `scale(${currentScale})`;

        // Header Background Solid Color Fade
        headerBg.style.opacity = heroProgress;
        
        if (heroProgress > 0.9) {
            headerBg.classList.add('show-neon');
        } else {
            headerBg.classList.remove('show-neon');
        }

        // B. Paragraph Scrub & Uplift
        const manifestoRect = manifestoTrigger.getBoundingClientRect();
        
        if (manifestoRect.top < windowHeight && manifestoRect.bottom > 0) {
            // Maps scroll purely inside the sticky container bounds
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

        requestAnimationFrame(onScroll);
    }

    requestAnimationFrame(onScroll);
});
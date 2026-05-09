document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Custom Cursor Engine ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorGlow = document.getElementById('cursor-glow');
    
    window.addEventListener('mousemove', (e) => {
        // Hardware accelerated tracking
        cursorDot.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
        cursorGlow.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
    });

    // Hover interactions
    document.querySelectorAll('.interactive-element').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('hovering');
            cursorGlow.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('hovering');
            cursorGlow.classList.remove('hovering');
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

    // --- 3. Fluid Wave Text Setup ---
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

    // --- 4. Intersection Observers ---
    // Standard elements
    const standardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => standardObserver.observe(el));

    // The Text Wave Observer (Triggers fluidly when paragraph is seen)
    const manifestoTrigger = document.getElementById('manifesto-trigger');
    const manifestoObserver = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting && !manifestoTrigger.classList.contains('wave-triggered')) {
            manifestoTrigger.classList.add('wave-triggered');
            // Stagger the animation of each word by 30 milliseconds
            wordSpans.forEach((span, index) => {
                setTimeout(() => {
                    span.classList.add('active-word');
                }, index * 30); 
            });
        }
    }, { threshold: 0.5 }); // Triggers when the text is nicely in the middle of the screen
    manifestoObserver.observe(manifestoTrigger);

    // --- 5. Cinematic Scroll Logic Engine ---
    const ambientAurora = document.getElementById('ambient-aurora');
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1');
    const heroL2 = document.getElementById('hero-l2');
    const heroL3 = document.getElementById('hero-l3');
    const headerBg = document.getElementById('header-bg');
    
    // Calculate exact pixel distance needed to center name in the 80px header
    let moveDist = 0;
    function calculateHeroMath() {
        const l2Rect = heroL2.getBoundingClientRect();
        // The natural center of the text when the page loads
        const l2CenterY = l2Rect.top + (l2Rect.height / 2); 
        moveDist = l2CenterY - 40; // 40px is the center of the header
    }
    
    // Allow fonts to render briefly before calculating geometry
    setTimeout(calculateHeroMath, 100); 
    window.addEventListener('resize', calculateHeroMath);

    function onScroll() {
        const scrollY = window.scrollY;
        
        // Drastically faster transition! Finishes in just 350px of scrolling. No empty gap.
        const transitionDistance = 350; 
        const heroProgress = Math.max(0, Math.min(scrollY / transitionDistance, 1));

        ambientAurora.style.opacity = 1 - (heroProgress * 1.5); 

        heroL1.style.opacity = 1 - (heroProgress * 2); 
        heroL3.style.opacity = 1 - (heroProgress * 2); 

        // Moves the entire flex container upwards flawlessly
        dynamicHero.style.transform = `translateY(-${moveDist * heroProgress}px)`;

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

        requestAnimationFrame(onScroll);
    }

    requestAnimationFrame(onScroll);
});
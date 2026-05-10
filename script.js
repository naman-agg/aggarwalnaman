document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Inverted Trailing Cursor (System Cursor remains visible) ---
    const cursorTrail = document.getElementById('cursor-trail');
    const archGrid = document.getElementById('arch-grid');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = mouseX;
    let trailY = mouseY;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Apply architectural spotlight mask based on mouse movement
        archGrid.style.webkitMaskImage = `radial-gradient(circle 350px at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
        archGrid.style.maskImage = `radial-gradient(circle 350px at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
    });

    function renderCursor() {
        trailX += (mouseX - trailX) * 0.15; 
        trailY += (mouseY - trailY) * 0.15;
        cursorTrail.style.transform = `translate3d(calc(${trailX}px - 50%), calc(${trailY}px - 50%), 0)`;
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    document.querySelectorAll('.interactive-element').forEach(el => {
        el.addEventListener('mouseenter', () => { cursorTrail.classList.add('hovering'); });
        el.addEventListener('mouseleave', () => { cursorTrail.classList.remove('hovering'); });
    });

    // --- 2. Theme Toggle ---
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.replace('dark-mode', 'light-mode');
        } else {
            body.classList.replace('light-mode', 'dark-mode');
        }
    });

    // --- 3. The 3D Flip World Clock ---
    const clockTime = document.getElementById('clock-time');
    const clockLabel = document.getElementById('clock-location');
    
    const timezones = [
        { label: 'LONDON', tz: 'Europe/London' },
        { label: 'NEW DELHI', tz: 'Asia/Kolkata' },
        { label: 'NEW YORK', tz: 'America/New_York' }
    ];
    let currentTzIndex = 0;

    function updateTime() {
        const now = new Date();
        const options = { timeZone: timezones[currentTzIndex].tz, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        clockTime.textContent = new Intl.DateTimeFormat('en-GB', options).format(now);
    }
    setInterval(updateTime, 1000);
    updateTime();

    // The 3D Flip Animation Logic
    setInterval(() => {
        // Step 1: Flip out
        clockLabel.classList.add('flip-out');
        clockLabel.classList.remove('flip-normal');

        setTimeout(() => {
            // Step 2: Change text while invisible, prep for flip in
            currentTzIndex = (currentTzIndex + 1) % timezones.length;
            clockLabel.textContent = timezones[currentTzIndex].label;
            
            clockLabel.classList.remove('flip-out');
            clockLabel.classList.add('flip-in');
            
            // Force browser reflow to reset transition state
            void clockLabel.offsetWidth;
            
            // Step 3: Flip back to normal
            clockLabel.classList.remove('flip-in');
            clockLabel.classList.add('flip-normal');
            updateTime();
        }, 400); // 400ms matches the CSS transition timing
    }, 4000);

    // --- 4. Word-by-Word Setup ---
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

    // --- 5. Capsule Internal Scroll Logic (Scrubbing & Spy Nav) ---
    const capsule = document.getElementById('capsule-container');
    const manifestoTrigger = document.getElementById('manifesto-trigger');
    const navDots = document.querySelectorAll('.capsule-nav .nav-dot');
    const spySections = document.querySelectorAll('.scroll-spy-section');
    
    capsule.addEventListener('scroll', () => {
        const scrollY = capsule.scrollTop;
        const capsuleHeight = capsule.clientHeight;

        // Scrubbing Math
        const manifestoTop = manifestoTrigger.offsetTop; 
        const manifestoHeight = manifestoTrigger.offsetHeight;
        const startScrub = manifestoTop;
        const endScrub = manifestoTop + manifestoHeight - capsuleHeight;

        if (scrollY >= startScrub && scrollY <= endScrub) {
            let progress = (scrollY - startScrub) / (endScrub - startScrub);
            progress = Math.max(0, Math.min(progress, 1));
            let activeWordIndex = Math.floor(progress * wordSpans.length);

            wordSpans.forEach((span, index) => {
                if (index <= activeWordIndex) {
                    span.classList.add('active-word');
                } else {
                    span.classList.remove('active-word');
                }
            });
        } else if (scrollY < startScrub) {
            wordSpans.forEach(span => span.classList.remove('active-word'));
        } else if (scrollY > endScrub) {
            wordSpans.forEach(span => span.classList.add('active-word'));
        }

        // Scroll Spy Navigation
        spySections.forEach((sec, index) => {
            const secTop = sec.offsetTop - 200; 
            const secBottom = secTop + sec.offsetHeight;
            if (scrollY >= secTop && scrollY < secBottom) {
                navDots.forEach(dot => dot.classList.remove('active'));
                if(navDots[index]) navDots[index].classList.add('active');
            }
        });
    });

    // Click to Jump via Nav
    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            const targetSec = document.getElementById(targetId);
            capsule.scrollTo({ top: targetSec.offsetTop, behavior: 'smooth' });
        });
    });

    // Standard Observers
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in-view'); });
    }, { root: capsule, threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // --- 6. Outer Window Scroll Engine (State Change) ---
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1');
    const heroL2 = document.getElementById('hero-l2');
    const heroL3 = document.getElementById('hero-l3');
    const capsuleNav = document.getElementById('capsule-nav');
    
    let moveDist = 0;
    function calculateHeroMath() {
        const l2Rect = heroL2.getBoundingClientRect();
        const l2CenterY = l2Rect.top + (l2Rect.height / 2); 
        const isMobile = window.innerWidth <= 768;
        const endCenter = isMobile ? 40 : 60; 
        moveDist = l2CenterY - endCenter; 
    }
    setTimeout(calculateHeroMath, 100); 
    window.addEventListener('resize', calculateHeroMath);

    function onWindowScroll() {
        const scrollY = window.scrollY;
        const transitionDistance = 500; 
        const progress = Math.max(0, Math.min(scrollY / transitionDistance, 1));

        // Spotlight Grid fades out as you enter reading mode
        archGrid.style.opacity = 1 - progress; 

        heroL1.style.opacity = 1 - (progress * 2); 
        heroL3.style.opacity = 1 - (progress * 2); 

        const isMobile = window.innerWidth <= 768;
        const endScale = isMobile ? 0.4 : 0.3; 
        const currentScale = 1 - ((1 - endScale) * progress);
        
        dynamicHero.style.transform = `translateY(-${moveDist * progress}px)`;
        heroL2.style.transform = `scale(${currentScale})`;

        capsule.style.transform = `translateY(${(1 - progress) * 100}vh)`;
        capsule.style.opacity = progress;
        
        if (progress === 1) {
            capsule.style.pointerEvents = 'auto';
            capsuleNav.classList.add('visible');
        } else {
            capsule.style.pointerEvents = 'none';
            capsuleNav.classList.remove('visible');
        }

        requestAnimationFrame(onWindowScroll);
    }

    window.addEventListener('scroll', () => { requestAnimationFrame(onWindowScroll); });
    onWindowScroll(); 
});
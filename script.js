document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Inverted Trailing Cursor ---
    const cursorTrail = document.getElementById('cursor-trail');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = mouseX;
    let trailY = mouseY;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
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

    // --- 2. Canvas Tech Grid ---
    const canvas = document.getElementById('tech-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    const dots = [];
    const spacing = 60; 

    function initCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        dots.length = 0;
        
        for (let x = 0; x < width; x += spacing) {
            for (let y = 0; y < height; y += spacing) {
                dots.push({ x, y });
            }
        }
    }
    
    function drawGrid() {
        ctx.clearRect(0, 0, width, height);
        
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'; 
        dots.forEach(dot => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        const interactionRadius = 250;
        let nearbyDots = [];
        
        dots.forEach(dot => {
            const dist = Math.hypot(dot.x - mouseX, dot.y - mouseY);
            if (dist < interactionRadius) { 
                nearbyDots.push({ dot, dist });
            }
        });

        nearbyDots.sort((a, b) => a.dist - b.dist);
        const dotsToConnect = nearbyDots.slice(0, 4);

        dotsToConnect.forEach(item => {
            ctx.beginPath();
            ctx.moveTo(item.dot.x, item.dot.y);
            ctx.lineTo(mouseX, mouseY);
            
            const opacity = 1 - (item.dist / interactionRadius);
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.8})`; 
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
        
        requestAnimationFrame(drawGrid);
    }
    
    initCanvas();
    window.addEventListener('resize', initCanvas);
    drawGrid();

    // --- 3. Theme Toggle ---
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.replace('dark-mode', 'light-mode');
        } else {
            body.classList.replace('light-mode', 'dark-mode');
        }
    });

    // --- 4. The Global Terminal Clock ---
    const clockLon = document.getElementById('time-lon');
    const clockDel = document.getElementById('time-del');
    const clockDxb = document.getElementById('time-dxb');
    const clockNyc = document.getElementById('time-nyc');

    function updateClocks() {
        const now = new Date();
        const formatOptions = { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        
        clockLon.textContent = new Intl.DateTimeFormat('en-GB', { ...formatOptions, timeZone: 'Europe/London' }).format(now);
        clockDel.textContent = new Intl.DateTimeFormat('en-GB', { ...formatOptions, timeZone: 'Asia/Kolkata' }).format(now);
        clockDxb.textContent = new Intl.DateTimeFormat('en-GB', { ...formatOptions, timeZone: 'Asia/Dubai' }).format(now);
        clockNyc.textContent = new Intl.DateTimeFormat('en-GB', { ...formatOptions, timeZone: 'America/New_York' }).format(now);
    }
    setInterval(updateClocks, 1000);
    updateClocks();

    // --- 5. Word-by-Word Setup ---
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

    // --- 6. Capsule Internal Scroll Logic (Scrubbing & Spy Nav) ---
    const capsule = document.getElementById('capsule-container');
    const manifestoTrigger = document.getElementById('manifesto-trigger');
    const navDots = document.querySelectorAll('.capsule-nav .nav-dot');
    const spySections = document.querySelectorAll('.scroll-spy-section');
    
    capsule.addEventListener('scroll', () => {
        const scrollY = capsule.scrollTop;
        const capsuleHeight = capsule.clientHeight;

        // Scrubbing Math (The Fix applied here for the first word)
        const manifestoTop = manifestoTrigger.offsetTop; 
        const manifestoHeight = manifestoTrigger.offsetHeight;
        const startScrub = manifestoTop;
        const endScrub = manifestoTop + manifestoHeight - capsuleHeight;

        if (scrollY >= startScrub && scrollY <= endScrub) {
            let progress = (scrollY - startScrub) / (endScrub - startScrub);
            progress = Math.max(0, Math.min(progress, 1));
            
            // FIX: If progress is effectively 0, force active index to -1 so all words drop
            let activeWordIndex = progress <= 0 ? -1 : Math.floor(progress * wordSpans.length);

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

        // Scroll Spy Navigation Highlight
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

    // --- 7. Outer Window Scroll Engine (State Change) ---
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1');
    const heroL2 = document.getElementById('hero-l2');
    const heroL3 = document.getElementById('hero-l3');
    const headerBg = document.getElementById('header-bg');
    const techCanvasEl = document.getElementById('tech-canvas');
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

        techCanvasEl.style.opacity = 0.5 - (progress * 0.4); 
        techCanvasEl.style.filter = `blur(${progress * 8}px)`; 

        heroL1.style.opacity = 1 - (progress * 2); 
        heroL3.style.opacity = 1 - (progress * 2); 

        const isMobile = window.innerWidth <= 768;
        const endScale = isMobile ? 0.4 : 0.3; 
        const currentScale = 1 - ((1 - endScale) * progress);
        
        dynamicHero.style.transform = `translateY(-${moveDist * progress}px)`;
        heroL2.style.transform = `scale(${currentScale})`;

        headerBg.style.opacity = progress;

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
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
        el.addEventListener('mouseenter', () => {
            cursorTrail.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorTrail.classList.remove('hovering');
        });
    });

    // --- 2. Canvas Tech Grid (Nearest Neighbour Logic) ---
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
        
        // Draw static dots
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'; 
        dots.forEach(dot => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // 1. Gather all dots within interaction radius
        const interactionRadius = 250;
        let nearbyDots = [];
        
        dots.forEach(dot => {
            const dist = Math.hypot(dot.x - mouseX, dot.y - mouseY);
            if (dist < interactionRadius) { 
                nearbyDots.push({ dot, dist });
            }
        });

        // 2. Sort by distance (closest first)
        nearbyDots.sort((a, b) => a.dist - b.dist);

        // 3. Only draw lines to the top 4 closest dots (creates the clean geometric shape)
        const maxConnections = 4;
        const dotsToConnect = nearbyDots.slice(0, maxConnections);

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

    // --- 3. Theme Toggle & Clock ---
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

    // --- 4. Word-by-Word Paragraph Setup ---
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

    // --- 5. Standard Scroll Reveals ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // --- 6. Cinematic Scroll Logic Engine ---
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1');
    const heroL2 = document.getElementById('hero-l2');
    const heroL3 = document.getElementById('hero-l3');
    const headerBg = document.getElementById('header-bg');
    const manifestoTrigger = document.getElementById('manifesto-trigger');
    
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

        const transitionDistance = windowHeight; 
        const heroProgress = Math.max(0, Math.min(scrollY / transitionDistance, 1));

        heroL1.style.opacity = 1 - (heroProgress * 2); 
        heroL3.style.opacity = 1 - (heroProgress * 2); 

        const isMobile = window.innerWidth <= 768;
        const endScale = isMobile ? 0.4 : 0.3; 
        const currentScale = 1 - ((1 - endScale) * heroProgress);
        
        dynamicHero.style.transform = `translateY(-${moveDist * heroProgress}px)`;
        heroL2.style.transform = `scale(${currentScale})`;

        headerBg.style.opacity = heroProgress;
        
        if (heroProgress > 0.9) {
            headerBg.classList.add('show-neon');
        } else {
            headerBg.classList.remove('show-neon');
        }

        // B. Paragraph Scrub & Uplift
        const manifestoRect = manifestoTrigger.getBoundingClientRect();
        
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

        requestAnimationFrame(onScroll);
    }

    requestAnimationFrame(onScroll);
});
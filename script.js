document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Inverted Trailing Cursor & Architectural Spotlight ---
    const cursorTrail = document.getElementById('cursor-trail');
    const archGrid = document.getElementById('arch-grid');
    
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let trailX = mouseX, trailY = mouseY;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        archGrid.style.webkitMaskImage = `radial-gradient(circle 400px at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
        archGrid.style.maskImage = `radial-gradient(circle 400px at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
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
        body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
    });

    // --- 3. Global Terminal Clock ---
    const zones = [
        { id: 'time-lon', tz: 'Europe/London' },
        { id: 'time-del', tz: 'Asia/Kolkata' },
        { id: 'time-dxb', tz: 'Asia/Dubai' },
        { id: 'time-nyc', tz: 'America/New_York' }
    ];

    function updateClocks() {
        const now = new Date();
        zones.forEach(zone => {
            const el = document.getElementById(zone.id);
            if (el) {
                const options = { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: zone.tz };
                el.textContent = new Intl.DateTimeFormat('en-GB', options).format(now);
            }
        });
    }
    setInterval(updateClocks, 1000); updateClocks();

    // --- 4. Word-by-Word Reveal Setup ---
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

        const manifestoTop = manifestoTrigger.offsetTop; 
        const manifestoHeight = manifestoTrigger.offsetHeight;
        const startScrub = manifestoTop;
        const endScrub = manifestoTop + manifestoHeight - capsuleHeight;

        if (scrollY >= startScrub && scrollY <= endScrub) {
            let progress = (scrollY - startScrub) / (endScrub - startScrub);
            let activeWordIndex = progress <= 0.01 ? -1 : Math.floor(progress * wordSpans.length);

            wordSpans.forEach((span, index) => {
                if (index <= activeWordIndex) span.classList.add('active-word');
                else span.classList.remove('active-word');
            });
        } else if (scrollY < startScrub) {
            wordSpans.forEach(span => span.classList.remove('active-word'));
        }

        spySections.forEach((sec, index) => {
            const secTop = sec.offsetTop - 100;
            const secBottom = secTop + sec.offsetHeight;
            if (scrollY >= secTop && scrollY < secBottom) {
                navDots.forEach(dot => dot.classList.remove('active'));
                if(navDots[index]) navDots[index].classList.add('active');
            }
        });
    });

    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            const targetSec = document.getElementById(targetId);
            capsule.scrollTo({ top: targetSec.offsetTop, behavior: 'smooth' });
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in-view'); });
    }, { root: capsule, threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));


    // --- 6. Matrix Role Scramble Engine (Throttled for readability) ---
    const scrambleEl = document.getElementById('hero-l3');
    const phrases = ["A PRODUCT MANAGER.", "A DESIGNER.", "AN INVENTOR."];
    const chars = "><[]{}*&^%$#@!ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; 
    
    let phraseIndex = 0;
    
    class CypherScrambler {
        constructor(el) { this.el = el; }
        
        async scramble(newText) {
            const oldText = this.el.innerText;
            const maxLength = Math.max(oldText.length, newText.length);
            const promise = new Promise(resolve => this.resolvePromise = resolve);
            
            this.queue = [];
            for (let i = 0; i < maxLength; i++) {
                const startChars = oldText[i] || '';
                const endChar = newText[i] || '';
                const startScramble = Math.floor(Math.random() * 15); 
                const endScramble = startScramble + Math.floor(Math.random() * 15);
                this.queue.push({ startChars, endChar, startScramble, endScramble });
            }
            
            this.frame = 0;
            this.update();
            return promise;
        }
        
        update() {
            // Frame Throttle: Only updates the scramble every ~50ms to make it readable
            if (!this.lastTime) this.lastTime = Date.now();
            const now = Date.now();
            const dt = now - this.lastTime;

            if (dt < 50) { 
                requestAnimationFrame(this.update.bind(this));
                return;
            }
            
            this.lastTime = now;
            this.frame++;

            let output = '';
            let complete = 0;
            
            for (let i = 0; i < this.queue.length; i++) {
                const { startChars, endChar, startScramble, endScramble } = this.queue[i];
                
                if (this.frame >= endScramble) {
                    complete++; output += endChar;
                } else if (this.frame >= startScramble) {
                    const char = chars[Math.floor(Math.random() * chars.length)];
                    output += `<span class="cypher-char">${char}</span>`;
                } else { output += startChars; }
            }
            
            this.el.innerHTML = output;
            
            if (complete === this.queue.length) { this.resolvePromise(); } 
            else { requestAnimationFrame(this.update.bind(this)); }
        }
    }

    function calculateRolePosition() {
        const l2El = document.getElementById('hero-l2');
        const l3El = document.getElementById('hero-l3');
        const isMobile = window.innerWidth <= 768;
        
        const bottomGap = isMobile ? 30 : 50; 
        l3El.style.bottom = `-${bottomGap}px`;
        l3El.style.left = `50%`;
        l3El.style.transform = `translateX(-50%)`;
    }
    setTimeout(calculateRolePosition, 50);
    window.addEventListener('resize', calculateRolePosition);

    const scrambler = new CypherScrambler(scrambleEl);
    async function runScrambleLoop() {
        while(true) {
            await scrambler.scramble(phrases[phraseIndex]);
            phraseIndex = (phraseIndex + 1) % phrases.length;
            await new Promise(r => setTimeout(r, 2500)); 
        }
    }
    runScrambleLoop();


    // --- 7. Outer Window Scroll Engine (State Change) ---
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
        const vGap = isMobile ? 16 : 24;
        const uiHeight = 40;
        const endCenterY = vGap + (uiHeight / 2); 
        moveDist = l2CenterY - endCenterY; 
    }
    setTimeout(calculateHeroMath, 100); window.addEventListener('resize', calculateHeroMath);

    function onWindowScroll() {
        const scrollY = window.scrollY;
        const transitionDistance = 500; 
        const progress = Math.max(0, Math.min(scrollY / transitionDistance, 1));

        archGrid.style.opacity = 1 - progress; 

        const isMobile = window.innerWidth <= 768;
        const endScale = isMobile ? 0.35 : 0.25; 
        const currentScale = 1 - ((1 - endScale) * progress);
        
        // Ensure Ghost L1 stays centered mathematically while translating up
        heroL1.style.opacity = Math.max(0, 1 - (progress * 1.5));
        heroL1.style.transform = `translate(-50%, calc(-50% - ${progress * 40}px))`;

        // Ensure L3 stays centered horizontally while translating up
        heroL3.style.opacity = Math.max(0, 1 - (progress * 2));
        heroL3.style.transform = `translateX(-50%) translateY(-${progress * 40}px)`;

        dynamicHero.style.transform = `translateY(-${moveDist * progress}px)`;
        heroL2.style.transform = `scale(${currentScale})`;

        capsule.style.transform = `translateY(${(1 - progress) * 100}vh)`;
        capsule.style.opacity = progress;
        
        if (progress === 1) {
            capsule.style.pointerEvents = 'auto';
            capsuleNav.classList.add('visible');
            cursorTrail.style.display = 'none'; // Clean native interaction inside capsule
        } else {
            capsule.style.pointerEvents = 'none';
            capsuleNav.classList.remove('visible');
            cursorTrail.style.display = 'block'; // Restore xray ring when back in hero
        }
        requestAnimationFrame(onWindowScroll);
    }

    window.addEventListener('scroll', () => { requestAnimationFrame(onWindowScroll); });
    onWindowScroll(); 
});
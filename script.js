document.addEventListener('DOMContentLoaded', () => {

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

    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
    });

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

    const capsule = document.getElementById('capsule-container');
    const navDots = document.querySelectorAll('.capsule-nav .nav-dot');
    const spySections = document.querySelectorAll('.scroll-spy-section');
    
    const hWrapper = document.getElementById('horizontal-wrapper');
    const stickyView = document.getElementById('sticky-view');
    const cardsTrack = document.getElementById('cards-track');

    capsule.addEventListener('scroll', () => {
        const scrollY = capsule.scrollTop;
        const capsuleHeight = capsule.clientHeight;

        if (hWrapper && stickyView && cardsTrack) {
            const startHScroll = hWrapper.offsetTop - (capsuleHeight * 0.1); 
            const maxScroll = hWrapper.offsetHeight - stickyView.offsetHeight;
            const endHScroll = startHScroll + maxScroll;

            if (scrollY >= startHScroll && scrollY <= endHScroll) {
                const progress = (scrollY - startHScroll) / maxScroll;
                const maxTranslate = cardsTrack.scrollWidth - stickyView.clientWidth; 
                cardsTrack.style.transform = `translate3d(-${progress * maxTranslate}px, 0, 0)`;
            } else if (scrollY < startHScroll) {
                cardsTrack.style.transform = `translate3d(0px, 0, 0)`;
            } else if (scrollY > endHScroll) {
                const maxTranslate = cardsTrack.scrollWidth - stickyView.clientWidth; 
                cardsTrack.style.transform = `translate3d(-${maxTranslate}px, 0, 0)`;
            }
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


    // ==========================================
    // FAST VERTICAL SLIDE LOGIC
    // ==========================================
    const slideTextEl = document.getElementById('slide-text');
    const greetings = ['HELLO', 'नमस्ते', 'CIAO', 'こんにちは', 'HALLO', '안녕하세요'];
    let greetIndex = 0;

    setInterval(() => {
        // Trigger fast slide out
        slideTextEl.classList.add('sliding-out');
        
        // Wait 250ms for CSS animation to finish
        setTimeout(() => {
            greetIndex = (greetIndex + 1) % greetings.length;
            slideTextEl.textContent = greetings[greetIndex];
            
            // Remove out class, trigger in class
            slideTextEl.classList.remove('sliding-out');
            slideTextEl.classList.add('sliding-in');
            
            // Cleanup classes
            setTimeout(() => {
                slideTextEl.classList.remove('sliding-in');
            }, 250); 
            
        }, 250); 
    }, 3500); 
    // ==========================================


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
        
        heroL1.style.opacity = Math.max(0, 1 - (progress * 2));
        heroL1.style.transform = `translateY(-${progress * 60}px)`;

        heroL3.style.opacity = Math.max(0, 1 - (progress * 2));
        heroL3.style.transform = `translateY(${progress * 60}px)`;

        dynamicHero.style.transform = `translateY(-${moveDist * progress}px)`;
        heroL2.style.transform = `scale(${currentScale})`;

        capsule.style.transform = `translateY(${(1 - progress) * 100}vh)`;
        capsule.style.opacity = progress;
        
        if (progress === 1) {
            capsule.style.pointerEvents = 'auto';
            capsuleNav.classList.add('visible');
            cursorTrail.style.display = 'none'; 
        } else {
            capsule.style.pointerEvents = 'none';
            capsuleNav.classList.remove('visible');
            cursorTrail.style.display = 'block'; 
        }
        requestAnimationFrame(onWindowScroll);
    }

    window.addEventListener('scroll', () => { requestAnimationFrame(onWindowScroll); });
    onWindowScroll(); 
});
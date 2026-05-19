document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. CURSOR ENGINE
    // ==========================================
    const cursorTrail = document.getElementById('cursor-trail');
    const archGrid = document.getElementById('arch-grid');
    
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let trailX = mouseX, trailY = mouseY;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        // Subtle optical flashlight on the background grid
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


    // ==========================================
    // 2. THEME & CLOCKS
    // ==========================================
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


    // ==========================================
    // 3. FAST VERTICAL SLIDE GREETINGS
    // ==========================================
    const slideTextEl = document.getElementById('slide-text');
    const greetings = ['HELLO', 'नमस्ते', 'CIAO', 'こんにちは', 'HALLO', '안녕하세요'];
    let greetIndex = 0;

    setInterval(() => {
        slideTextEl.classList.add('sliding-out');
        setTimeout(() => {
            greetIndex = (greetIndex + 1) % greetings.length;
            slideTextEl.textContent = greetings[greetIndex];
            
            slideTextEl.classList.remove('sliding-out');
            slideTextEl.classList.add('sliding-in');
            
            setTimeout(() => {
                slideTextEl.classList.remove('sliding-in');
            }, 250); 
        }, 250); 
    }, 3500); 


    // ==========================================
    // 4. CAPSULE SCROLL PHYSICS & TELEMETRY
    // ==========================================
    const capsule = document.getElementById('capsule-container');
    const structuralIndex = document.getElementById('structural-index');
    const indexItems = document.querySelectorAll('.structural-index .index-item');
    const spySections = document.querySelectorAll('.scroll-spy-section');
    
    const hWrapper = document.getElementById('horizontal-wrapper');
    const stickyView = document.getElementById('sticky-view');
    const cardsTrack = document.getElementById('cards-track');
    const scrollProgress = document.getElementById('scroll-progress');

    capsule.addEventListener('scroll', () => {
        const scrollY = capsule.scrollTop;
        const capsuleHeight = capsule.clientHeight;

        // A. HARDWARE PROGRESS BAR LOGIC
        if (scrollProgress) {
            const maxCapsuleScroll = capsule.scrollHeight - capsule.clientHeight;
            const progressPercentage = maxCapsuleScroll > 0 ? (scrollY / maxCapsuleScroll) * 100 : 0;
            scrollProgress.style.width = `${progressPercentage}%`;
        }

        // B. HORIZONTAL SCROLL TIMELINE LOGIC
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

        // C. STRUCTURAL INDEX SCROLL SPY LOGIC
        spySections.forEach((sec, index) => {
            const secTop = sec.offsetTop - 100;
            const secBottom = secTop + sec.offsetHeight;
            if (scrollY >= secTop && scrollY < secBottom) {
                indexItems.forEach(item => item.classList.remove('active'));
                if(indexItems[index]) indexItems[index].classList.add('active');
            }
        });
    });

    // Click to navigate via Structural Index
    indexItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const targetSec = document.getElementById(targetId);
            capsule.scrollTo({ top: targetSec.offsetTop, behavior: 'smooth' });
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in-view'); });
    }, { root: capsule, threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));


    // ==========================================
    // 5. WINDOW PARALLAX (HERO TO CAPSULE TRANSITION)
    // ==========================================
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1'); 
    const heroL2 = document.getElementById('hero-l2'); 
    const heroL3 = document.getElementById('hero-l3'); 
    
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
    setTimeout(calculateHeroMath, 100); 
    window.addEventListener('resize', calculateHeroMath);

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
            if(structuralIndex) structuralIndex.classList.add('visible');
            cursorTrail.style.display = 'none'; 
        } else {
            capsule.style.pointerEvents = 'none';
            if(structuralIndex) structuralIndex.classList.remove('visible');
            cursorTrail.style.display = 'block'; 
        }
        requestAnimationFrame(onWindowScroll);
    }

    window.addEventListener('scroll', () => { requestAnimationFrame(onWindowScroll); });
    onWindowScroll(); 
    // ==========================================
    // 7. LIVE HEX SCANNER ENGINE
    // ==========================================
    const scannerBtn = document.getElementById('hex-scanner-btn');
    let isScannerActive = false;

    // Create and inject the HUD
    const scannerHud = document.createElement('div');
    scannerHud.id = 'scanner-hud';
    scannerHud.innerHTML = `
        <div class="scan-row">
            <span class="scan-label">FG</span>
            <div class="scan-box" id="scan-fg-box"></div>
            <span class="scan-hex" id="scan-fg-hex">-</span>
        </div>
        <div class="scan-row">
            <span class="scan-label">BG</span>
            <div class="scan-box" id="scan-bg-box"></div>
            <span class="scan-hex" id="scan-bg-hex">-</span>
        </div>
    `;
    document.body.appendChild(scannerHud);

    const fgBox = document.getElementById('scan-fg-box');
    const fgHex = document.getElementById('scan-fg-hex');
    const bgBox = document.getElementById('scan-bg-box');
    const bgHex = document.getElementById('scan-bg-hex');
    
    // Internal variables to hold current colours for clipboard copying
    let currentData = '';

    // Mathematical RGB to HEX converter
    function rgbToHex(rgb) {
        if (rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return 'CLEAR';
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgb;
        return "#" + (1 << 24 | match[1] << 16 | match[2] << 8 | match[3]).toString(16).slice(1).toUpperCase();
    }

    // Toggle Scanner State
    if (scannerBtn) {
        scannerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isScannerActive = !isScannerActive;
            document.body.classList.toggle('scanner-active', isScannerActive);
            
            if (isScannerActive) {
                scannerBtn.style.color = 'var(--accent)';
                scannerBtn.textContent = '[ SCANNING... ]';
            } else {
                scannerBtn.style.color = '';
                scannerBtn.textContent = '[ HEX.SCANNER ]';
                scannerHud.style.opacity = '0';
            }
        });
    }

    // Live Tracking & Computation
    document.addEventListener('mousemove', (e) => {
        if (!isScannerActive) return;

        // Track cursor
        scannerHud.style.left = `${e.clientX}px`;
        scannerHud.style.top = `${e.clientY}px`;

        // Identify the exact DOM node under the crosshair
        const target = document.elementFromPoint(e.clientX, e.clientY);

        // Ignore the HUD itself to prevent feedback loops
        if (target && target.id !== 'scanner-hud' && !scannerHud.contains(target)) {
            const computed = window.getComputedStyle(target);
            
            const fgColorRaw = computed.color;
            const bgColorRaw = computed.backgroundColor;
            
            const fgHexVal = rgbToHex(fgColorRaw);
            const bgHexVal = rgbToHex(bgColorRaw);

            // Update HUD Visuals
            fgBox.style.backgroundColor = fgHexVal === 'CLEAR' ? 'transparent' : fgHexVal;
            fgHex.textContent = fgHexVal;
            
            bgBox.style.backgroundColor = bgHexVal === 'CLEAR' ? 'transparent' : bgHexVal;
            bgHex.textContent = bgHexVal;

            // Store data for copying
            currentData = `FG: ${fgHexVal} | BG: ${bgHexVal}`;
            
            scannerHud.style.opacity = '1';
        } else {
            scannerHud.style.opacity = '0';
        }
    });

    // Click to Copy and Exit
    document.addEventListener('click', (e) => {
        if (isScannerActive && e.target !== scannerBtn) {
            // Copy to clipboard
            navigator.clipboard.writeText(currentData).then(() => {
                // Visual feedback on the button
                scannerBtn.textContent = '[ COPIED TO CLIPBOARD ]';
                scannerBtn.classList.add('flash-copied');
                
                // Shut down scanner
                isScannerActive = false;
                document.body.classList.remove('scanner-active');
                scannerHud.style.opacity = '0';
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    scannerBtn.textContent = '[ HEX.SCANNER ]';
                    scannerBtn.style.color = '';
                    scannerBtn.classList.remove('flash-copied');
                }, 2000);
            });
        }
    });
});
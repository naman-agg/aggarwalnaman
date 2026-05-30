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
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            body.classList.toggle('light-mode');
        });
    }

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
    // 3. WINDOW PARALLAX (HERO TO CAPSULE TRANSITION)
    // ==========================================
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1'); 
    const heroL2 = document.getElementById('hero-l2'); 
    const heroL3 = document.getElementById('hero-l3'); 
    const capsule = document.getElementById('capsule-container');
    
    let moveDist = 0;
    function calculateHeroMath() {
        if(!heroL2) return;
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
        
        if(heroL1) {
            heroL1.style.opacity = Math.max(0, 1 - (progress * 2));
            heroL1.style.transform = `translateY(-${progress * 60}px)`;
        }
        if(heroL3) {
            heroL3.style.opacity = Math.max(0, 1 - (progress * 2));
            heroL3.style.transform = `translateY(${progress * 60}px)`;
        }
        if(dynamicHero && heroL2) {
            dynamicHero.style.transform = `translateY(-${moveDist * progress}px)`;
            heroL2.style.transform = `scale(${currentScale})`;
        }
        if(capsule) {
            capsule.style.transform = `translateY(${(1 - progress) * 100}vh)`;
            capsule.style.opacity = progress;
            if (progress === 1) {
                capsule.style.pointerEvents = 'auto';
                cursorTrail.style.display = 'none'; 
            } else {
                capsule.style.pointerEvents = 'none';
                cursorTrail.style.display = 'block'; 
            }
        }
        requestAnimationFrame(onWindowScroll);
    }
    window.addEventListener('scroll', () => { requestAnimationFrame(onWindowScroll); });
    onWindowScroll(); 

    // ==========================================
    // 4. CAPSULE SCROLL PHYSICS & SCRUBBING ENGINE
    // ==========================================
    const scrollProgress = document.getElementById('scroll-progress');
    const manifestoTextEl = document.getElementById('about-manifesto-text');
    const scrollTrack = document.getElementById('about-scroll-track');
    let wordSpans = [];

    // Prepare text for scrubbing
    if (manifestoTextEl) {
        const words = manifestoTextEl.innerText.trim().split(/\s+/);
        manifestoTextEl.innerHTML = ''; 
        words.forEach(word => {
            const span = document.createElement('span');
            span.innerText = word;
            manifestoTextEl.appendChild(span);
            manifestoTextEl.appendChild(document.createTextNode(' '));
            wordSpans.push(span);
        });
    }

    // Isolated scrubbing maths
    function calculateScrubbing() {
        if (!manifestoTextEl || wordSpans.length === 0 || !scrollTrack) return;
        
        const scrollY = capsule.scrollTop;
        const capsuleHeight = capsule.clientHeight;
        
        let trackTop = 0;
        let currentEl = scrollTrack;
        while (currentEl && currentEl !== capsule) {
            trackTop += currentEl.offsetTop;
            currentEl = currentEl.offsetParent;
        }
        
        const trackHeight = scrollTrack.offsetHeight;
        const maxScrollDistance = trackHeight - capsuleHeight;
        
        let progress = 0;
        if (scrollY > trackTop) {
            progress = (scrollY - trackTop) / maxScrollDistance;
        }
        
        // 20% buffer before starting, finishes at 80%
        let mappedProgress = (progress - 0.20) / 0.60;
        mappedProgress = Math.max(0, Math.min(1, mappedProgress));
        
        const activeCount = Math.floor(mappedProgress * wordSpans.length);
        
        wordSpans.forEach((span, index) => {
            if (index < activeCount) {
                span.classList.add('active-word');
            } else {
                span.classList.remove('active-word');
            }
        });
    }

    // Initialize state
    calculateScrubbing();

    if(capsule) {
        capsule.addEventListener('scroll', () => {
            if (scrollProgress) {
                const maxCapsuleScroll = capsule.scrollHeight - capsule.clientHeight;
                const progressPercentage = maxCapsuleScroll > 0 ? (capsule.scrollTop / maxCapsuleScroll) * 100 : 0;
                scrollProgress.style.width = `${progressPercentage}%`;
            }
            calculateScrubbing();
        });
    }

    // ==========================================
    // 5. ACADEMIC GLASSMORPHISM MODAL
    // ==========================================
    const academicModalOverlay = document.getElementById('academic-modal');
    const academicModalBody = document.getElementById('academic-modal-body');
    const academicModalClose = document.getElementById('close-academic-modal');
    
    const bachelorsCard = document.getElementById('card-bachelors');
    const mastersCard = document.getElementById('card-masters');

    const degreeData = {
        bachelors: `
            <span class="modal-degree-title">Bachelors of Technology<br>(Mechanical and Automation Engineering)</span>
            <span class="modal-degree-duration">2015 &ndash; 2019</span>
            <span class="modal-degree-location">India</span>
        `,
        masters: `
            <span class="modal-degree-title">Masters of Business Administration</span>
            <span class="modal-degree-duration">2022 &ndash; 2023</span>
            <span class="modal-degree-location">United Kingdom</span>
        `
    };

    function openAcademicModal(degreeKey) {
        if(academicModalBody && academicModalOverlay) {
            academicModalBody.innerHTML = degreeData[degreeKey];
            academicModalOverlay.classList.add('active');
        }
    }

    if (bachelorsCard) bachelorsCard.addEventListener('click', () => openAcademicModal('bachelors'));
    if (mastersCard) mastersCard.addEventListener('click', () => openAcademicModal('masters'));
    
    if (academicModalClose) {
        academicModalClose.addEventListener('click', () => {
            academicModalOverlay.classList.remove('active');
        });
    }

    if (academicModalOverlay) {
        academicModalOverlay.addEventListener('click', (e) => {
            if (e.target === academicModalOverlay) academicModalOverlay.classList.remove('active');
        });
    }

    // ==========================================
    // 6. SPOTLIGHT SEARCH ENGINE
    // ==========================================
    const searchBtnNode = document.querySelector('.search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearchBtn = document.getElementById('close-search');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    const searchableSections = [
        { id: 'about-section', title: 'Overview' },
        { id: 'education-section', title: 'Foundation' }
    ];

    let searchIndex = [];
    setTimeout(() => {
        searchIndex = searchableSections.map(sec => {
            const el = document.getElementById(sec.id);
            return {
                id: sec.id,
                title: sec.title,
                text: el ? el.innerText.replace(/\n/g, ' ') : ''
            };
        });
    }, 500);

    function openSearch() {
        if(searchOverlay) {
            searchOverlay.classList.add('active');
            setTimeout(() => searchInput.focus(), 50); 
            renderDefaultResults();
        }
    }

    function closeSearch() {
        if(searchOverlay) {
            searchOverlay.classList.remove('active');
            searchInput.value = ''; 
        }
    }

    if (searchBtnNode) searchBtnNode.addEventListener('click', openSearch);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if(searchOverlay && searchOverlay.classList.contains('active')) closeSearch();
            if(academicModalOverlay && academicModalOverlay.classList.contains('active')) academicModalOverlay.classList.remove('active');
        }
    });
    
    if(searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) closeSearch();
        });
    }

    function routeToSection(targetId) {
        closeSearch();
        if (window.scrollY < 500) {
            window.scrollTo({ top: 600, behavior: 'instant' });
        }
        setTimeout(() => {
            const targetSec = document.getElementById(targetId);
            if (targetSec && capsule) {
                capsule.scrollTo({ top: targetSec.offsetTop, behavior: 'smooth' });
            }
        }, 50);
    }

    function renderDefaultResults() {
        if(!searchResults) return;
        searchResults.innerHTML = '';
        
        const quickLinksHeading = document.createElement('li');
        quickLinksHeading.className = 'results-group-heading';
        quickLinksHeading.textContent = 'QUICK LINKS';
        searchResults.appendChild(quickLinksHeading);

        searchIndex.forEach(item => {
            const li = document.createElement('li');
            li.className = 'result-item interactive-element';
            li.innerHTML = `<span class="result-title">${item.title}</span>`;
            li.addEventListener('click', () => routeToSection(item.id));
            searchResults.appendChild(li);
        });

        const actionsHeading = document.createElement('li');
        actionsHeading.className = 'results-group-heading';
        actionsHeading.style.marginTop = '8px';
        actionsHeading.textContent = 'SYSTEM ACTIONS';
        searchResults.appendChild(actionsHeading);

        const printLi = document.createElement('li');
        printLi.className = 'result-item interactive-element';
        printLi.innerHTML = `<span class="result-title">Print Dossier</span><span class="result-snippet">Generate a physical copy</span>`;
        printLi.addEventListener('click', () => { closeSearch(); window.print(); });
        searchResults.appendChild(printLi);

        const themeLi = document.createElement('li');
        themeLi.className = 'result-item interactive-element';
        themeLi.innerHTML = `<span class="result-title">Toggle Theme</span><span class="result-snippet">Switch visual mode</span>`;
        themeLi.addEventListener('click', () => { 
            closeSearch(); 
            document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('light-mode');
        });
        searchResults.appendChild(themeLi);
    }

    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchResults.innerHTML = '';

            if (!query) {
                renderDefaultResults();
                return;
            }

            const matches = searchIndex.filter(item => 
                item.text.toLowerCase().includes(query) || item.title.toLowerCase().includes(query)
            );

            if (matches.length === 0) {
                searchResults.innerHTML = `<li class="results-group-heading">RESULTS</li><li class="result-item" style="pointer-events: none;"><span class="result-title">No matches found</span></li>`;
                return;
            }

            const hitsHeading = document.createElement('li');
            hitsHeading.className = 'results-group-heading';
            hitsHeading.textContent = 'TOP HITS';
            searchResults.appendChild(hitsHeading);

            matches.forEach(match => {
                const li = document.createElement('li');
                li.className = 'result-item interactive-element';
                
                let snippet = '';
                const matchIndex = match.text.toLowerCase().indexOf(query);
                if (matchIndex > -1) {
                    const start = Math.max(0, matchIndex - 40);
                    const end = Math.min(match.text.length, matchIndex + query.length + 40);
                    snippet = match.text.substring(start, end);
                    if (start > 0) snippet = '...' + snippet;
                    if (end < match.text.length) snippet = snippet + '...';
                    
                    const regex = new RegExp(`(${query})`, 'gi');
                    snippet = snippet.replace(regex, '<span class="snippet-highlight">$1</span>');
                }

                li.innerHTML = `<span class="result-title">${match.title}</span>${snippet ? `<span class="result-snippet">${snippet}</span>` : ''}`;
                li.addEventListener('click', () => routeToSection(match.id));
                searchResults.appendChild(li);
            });
        });
    }

    // ==========================================
    // 7. LIVE HEX SCANNER ENGINE
    // ==========================================
    const scannerBtn = document.getElementById('hex-scanner-btn');
    let isScannerActive = false;

    if (scannerBtn) {
        const scannerHud = document.createElement('div');
        scannerHud.id = 'scanner-hud';
        scannerHud.innerHTML = `
            <div class="scan-row"><span class="scan-label">FG</span><div class="scan-box" id="scan-fg-box"></div><span class="scan-hex" id="scan-fg-hex">-</span></div>
            <div class="scan-row"><span class="scan-label">BG</span><div class="scan-box" id="scan-bg-box"></div><span class="scan-hex" id="scan-bg-hex">-</span></div>
        `;
        document.body.appendChild(scannerHud);

        const fgBox = document.getElementById('scan-fg-box');
        const fgHex = document.getElementById('scan-fg-hex');
        const bgBox = document.getElementById('scan-bg-box');
        const bgHex = document.getElementById('scan-bg-hex');
        
        let currentData = '';

        function rgbToHex(rgb) {
            if (rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return 'CLEAR';
            const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (!match) return rgb;
            return "#" + (1 << 24 | match[1] << 16 | match[2] << 8 | match[3]).toString(16).slice(1).toUpperCase();
        }

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

        document.addEventListener('mousemove', (e) => {
            if (!isScannerActive) return;
            scannerHud.style.left = `${e.clientX}px`;
            scannerHud.style.top = `${e.clientY}px`;

            const target = document.elementFromPoint(e.clientX, e.clientY);
            if (target && target.id !== 'scanner-hud' && !scannerHud.contains(target)) {
                const computed = window.getComputedStyle(target);
                const fgColorRaw = computed.color;
                const bgColorRaw = computed.backgroundColor;
                const fgHexVal = rgbToHex(fgColorRaw);
                const bgHexVal = rgbToHex(bgColorRaw);

                fgBox.style.backgroundColor = fgHexVal === 'CLEAR' ? 'transparent' : fgHexVal;
                fgHex.textContent = fgHexVal;
                bgBox.style.backgroundColor = bgHexVal === 'CLEAR' ? 'transparent' : bgHexVal;
                bgHex.textContent = bgHexVal;

                currentData = `FG: ${fgHexVal} | BG: ${bgHexVal}`;
                scannerHud.style.opacity = '1';
            } else {
                scannerHud.style.opacity = '0';
            }
        });

        document.addEventListener('click', (e) => {
            if (isScannerActive && e.target !== scannerBtn) {
                navigator.clipboard.writeText(currentData).then(() => {
                    scannerBtn.textContent = '[ COPIED ]';
                    scannerBtn.classList.add('flash-copied');
                    isScannerActive = false;
                    document.body.classList.remove('scanner-active');
                    scannerHud.style.opacity = '0';
                    setTimeout(() => {
                        scannerBtn.textContent = '[ HEX.SCANNER ]';
                        scannerBtn.style.color = '';
                        scannerBtn.classList.remove('flash-copied');
                    }, 2000);
                });
            }
        });
    }
});
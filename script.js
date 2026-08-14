document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. INTERACTIVE GRID ENGINE
    // ==========================================
    const archGrid = document.getElementById('arch-grid');
    
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (archGrid) {
            archGrid.style.webkitMaskImage = `radial-gradient(circle 400px at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
            archGrid.style.maskImage = `radial-gradient(circle 400px at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
        }
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
        { id: 'time-tyo', tz: 'Asia/Tokyo' },
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
        if (!slideTextEl) return;
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
    
    const hWrapper = document.getElementById('food-horizontal-wrapper');
    const stickyView = document.getElementById('food-sticky-view');
    const cardsTrack = document.getElementById('food-cards-track');
    const scrollProgress = document.getElementById('scroll-progress');

    // --- SETUP: WORD-BY-WORD SCRUBBING ENGINE ---
    const manifestoTextEl = document.getElementById('about-manifesto-text');
    let wordSpans = [];

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
    // --------------------------------------------

    if (capsule) {
        capsule.addEventListener('scroll', () => {
            const scrollY = capsule.scrollTop;
            const capsuleHeight = capsule.clientHeight;

            // A. HARDWARE PROGRESS BAR LOGIC
            if (scrollProgress) {
                const maxCapsuleScroll = capsule.scrollHeight - capsule.clientHeight;
                const progressPercentage = maxCapsuleScroll > 0 ? (scrollY / maxCapsuleScroll) * 100 : 0;
                scrollProgress.style.width = `${progressPercentage}%`;
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

            // D. EXECUTE STICKY SCRUBBING
            const scrollTrack = document.getElementById('about-scroll-track');
            if (manifestoTextEl && wordSpans.length > 0 && scrollTrack) {
                
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
        });
    }

    // Click to navigate via Structural Index
    indexItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const targetSec = document.getElementById(targetId);
            if(targetSec && capsule) {
                capsule.scrollTo({ top: targetSec.offsetTop, behavior: 'smooth' });
            }
        });
    });


    // ==========================================
    // 5. WINDOW PARALLAX (HERO TO CAPSULE TRANSITION)
    // ==========================================
    const dynamicHero = document.getElementById('dynamic-hero');
    const heroL1 = document.getElementById('hero-l1'); 
    const heroL2 = document.getElementById('hero-l2'); 
    const heroL3 = document.getElementById('hero-l3'); 
    
    let moveDist = 0;
    function calculateHeroMath() {
        if (!heroL2) return;
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

        if (archGrid) archGrid.style.opacity = 1 - progress; 

        const isMobile = window.innerWidth <= 768;
        const endScale = isMobile ? 0.35 : 0.25; 
        const currentScale = 1 - ((1 - endScale) * progress);
        
        if (heroL1) {
            heroL1.style.opacity = Math.max(0, 1 - (progress * 2));
            heroL1.style.transform = `translateY(-${progress * 60}px)`;
        }

        if (heroL3) {
            heroL3.style.opacity = Math.max(0, 1 - (progress * 2));
            heroL3.style.transform = `translateY(${progress * 60}px)`;
        }

        if (dynamicHero) dynamicHero.style.transform = `translateY(-${moveDist * progress}px)`;
        if (heroL2) heroL2.style.transform = `scale(${currentScale})`;

        if (capsule) {
            capsule.style.transform = `translateY(${(1 - progress) * 100}vh)`;
            capsule.style.opacity = progress;
            
            if (progress === 1) {
                capsule.style.pointerEvents = 'auto';
                if(structuralIndex) structuralIndex.classList.add('visible');
            } else {
                capsule.style.pointerEvents = 'none';
                if(structuralIndex) structuralIndex.classList.remove('visible');
            }
        }
        requestAnimationFrame(onWindowScroll);
    }

    window.addEventListener('scroll', () => { requestAnimationFrame(onWindowScroll); });
    onWindowScroll(); 


    // ==========================================
    // 6. SPOTLIGHT SEARCH ENGINE & ROUTING
    // ==========================================
    const searchBtnNode = document.querySelector('.search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearchBtn = document.getElementById('close-search');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    const searchableSections = [
        { id: 'motto-section', title: 'My Motto' },
        { id: 'education-section', title: 'Education' },
        { id: 'lab-section', title: 'The Lab' },
        { id: 'food-section', title: 'Food Journey' }
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
        if (!searchOverlay) return;
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput.focus(), 50); 
        renderDefaultResults();
    }

    function closeSearch() {
        if (!searchOverlay) return;
        searchOverlay.classList.remove('active');
        if (searchInput) searchInput.value = ''; 
    }

    if (searchBtnNode) searchBtnNode.addEventListener('click', openSearch);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
    
    if (searchOverlay) {
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
        if (!searchResults) return;
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
        printLi.innerHTML = `
            <span class="result-title">Print Dossier</span>
            <span class="result-snippet">Generate a physical copy of this document</span>
        `;
        printLi.addEventListener('click', () => { closeSearch(); window.print(); });
        searchResults.appendChild(printLi);

        const themeLi = document.createElement('li');
        themeLi.className = 'result-item interactive-element';
        themeLi.innerHTML = `
            <span class="result-title">Toggle Interface Theme</span>
            <span class="result-snippet">Switch between light and dark modes</span>
        `;
        themeLi.addEventListener('click', () => { 
            closeSearch(); 
            document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('light-mode');
        });
        searchResults.appendChild(themeLi);
    }

    if (searchInput) {
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
                searchResults.innerHTML = `
                    <li class="results-group-heading">RESULTS</li>
                    <li class="result-item" style="pointer-events: none;">
                        <span class="result-title">No matches found for "${query}"</span>
                    </li>`;
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

                li.innerHTML = `
                    <span class="result-title">${match.title}</span>
                    ${snippet ? `<span class="result-snippet">${snippet}</span>` : ''}
                `;
                
                li.addEventListener('click', () => routeToSection(match.id));
                searchResults.appendChild(li);
            });
        });
    }

    // ==========================================
    // ESCAPE KEY HANDLER (Global Modals)
    // ==========================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Force close the Academic Modal
            const activeAcademicModal = document.getElementById('academic-modal');
            if (activeAcademicModal && activeAcademicModal.classList.contains('active')) {
                activeAcademicModal.classList.remove('active');
            }
            
            // Force close the Search Modal
            const activeSearchModal = document.getElementById('search-overlay');
            if (activeSearchModal && activeSearchModal.classList.contains('active')) {
                activeSearchModal.classList.remove('active');
                if(document.getElementById('search-input')) document.getElementById('search-input').value = '';
            }
        }
    });

    // ==========================================
    // 8. ACADEMIC GLASSMORPHISM MODAL LOGIC
    // ==========================================
    const academicModalOverlay = document.getElementById('academic-modal');
    const academicModalBody = document.getElementById('academic-modal-body');
    const academicModalClose = document.getElementById('close-academic-modal');
    
    const bachelorsCard = document.getElementById('card-bachelors');
    const mastersCard = document.getElementById('card-masters');

    const degreeData = {
        bachelors: `
            <span class="modal-degree-title">Bachelors of Technology<br>(Mechanical and Automation Engineering)</span>
            <span class="modal-degree-duration">2015 – 2019</span>
            <span class="modal-degree-location">India</span>
        `,
        masters: `
            <span class="modal-degree-title">Masters of Business Administration</span>
            <span class="modal-degree-duration">2022 – 2023</span>
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
    // 9. PERFECT GLASS STACK ENGINE 
    // ==========================================
    const stickyWrappers = document.querySelectorAll('.sticky-wrapper');
    const glassCards = document.querySelectorAll('.perfect-glass-card');

    if (capsule && stickyWrappers.length > 0 && glassCards.length > 0) {
        const stackContainer = stickyWrappers[0].parentElement;

        capsule.addEventListener('scroll', () => {
            const capsuleTop = capsule.getBoundingClientRect().top;
            const containerTop = stackContainer.getBoundingClientRect().top;

            stickyWrappers.forEach((wrapper, index) => {
                const card = glassCards[index];
                const lockPoint = capsuleTop - (index * window.innerHeight);
                const distancePastTop = lockPoint - containerTop;

                if (distancePastTop > 0) {
                    const scaleDrop = (distancePastTop / window.innerHeight) * 0.04;
                    const scale = Math.max(0.75, 1 - scaleDrop);
                    const yPush = (distancePastTop / window.innerHeight) * 20;
                    const translateY = -yPush;
                    card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                } else {
                    card.style.transform = `scale(1) translateY(0px)`;
                }
            });
        });
    }

    // ==========================================
    // 10. FOOD GALLERY HORIZONTAL SCROLL ENGINE
    // ==========================================
    const foodWrapper = document.getElementById('food-horizontal-wrapper');
    const foodTrack = document.getElementById('food-cards-track');

    if (capsule && foodWrapper && foodTrack) {
        capsule.addEventListener('scroll', () => {
            const rect = foodWrapper.getBoundingClientRect();
            const capsuleTop = capsule.getBoundingClientRect().top;
            
            if (rect.top <= capsuleTop) {
                const scrollDistance = capsuleTop - rect.top;
                const maxVerticalScroll = foodWrapper.offsetHeight - window.innerHeight;
                
                let progress = scrollDistance / maxVerticalScroll;
                progress = Math.max(0, Math.min(1, progress));
                
                const maxHorizontalTranslate = foodTrack.scrollWidth - window.innerWidth + (window.innerWidth * 0.1);
                foodTrack.style.transform = `translateX(-${progress * maxHorizontalTranslate}px)`;
            } else {
                foodTrack.style.transform = `translateX(0px)`;
            }
        });
    }

    // ==========================================
    // 11. LIVE COUNTER ENGINE
    // ==========================================
    const counters = document.querySelectorAll('.counter-stat');

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                const suffix = entry.target.getAttribute('data-suffix');
                
                let currentCount = 0;
                const speed = 40; 
                const increment = target / speed;

                const updateCount = () => {
                    currentCount += increment;
                    if (currentCount < target) {
                        entry.target.innerText = Math.ceil(currentCount) + suffix;
                        requestAnimationFrame(updateCount); 
                    } else {
                        entry.target.innerText = target + suffix;
                    }
                };

                updateCount();
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.5, root: null });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // ==========================================
    // 12. WATCHLIST BAR CHART ENGINE
    // ==========================================
    const animatedBars = document.querySelectorAll('.animate-bar');

    const barObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetWidth = entry.target.getAttribute('data-width');
                entry.target.style.width = targetWidth;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    animatedBars.forEach(bar => {
        barObserver.observe(bar);
    });

    // ==========================================
    // 13. TOOL STACK FILTERING ENGINE 
    // ==========================================
    const filterBtns = document.querySelectorAll('.stack-btn');
    const toolTiles = document.querySelectorAll('.tool-tile');

    toolTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('visible-tile');
        }, index * 40);
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetCategory = btn.getAttribute('data-category');
            let visibleIndex = 0;

            toolTiles.forEach(tile => {
                tile.classList.remove('visible-tile');
                tile.style.display = 'none'; 
            });

            toolTiles.forEach(tile => {
                if (targetCategory === 'all' || tile.classList.contains(targetCategory)) {
                    tile.style.display = 'flex';
                    void tile.offsetWidth;

                    setTimeout(() => {
                        tile.classList.add('visible-tile');
                    }, visibleIndex * 50);
                    
                    visibleIndex++;
                }
            });
        });
    });
});
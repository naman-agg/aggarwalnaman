document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Theme Toggle & Clock ---
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.replace('dark-mode', 'light-mode');
            // Hack to make text highlighting work in light mode
            document.getElementById('manifesto-text').style.backgroundImage = 'linear-gradient(90deg, #111 50%, transparent 50%)';
        } else {
            body.classList.replace('light-mode', 'dark-mode');
            document.getElementById('manifesto-text').style.backgroundImage = 'linear-gradient(90deg, #f8fafc 50%, transparent 50%)';
        }
    });

    const clockElement = document.getElementById('live-clock');
    setInterval(() => {
        const now = new Date();
        clockElement.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }, 1000);

    // --- 2. Standard Scroll Reveals (Intersection Observer) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));


    // --- 3. Cinematic Scroll Logic (The Core Engine) ---
    
    // Elements we need to animate
    const heroTrigger = document.getElementById('hero-trigger');
    const heroTitle = document.querySelector('.hero-text-wrapper');
    
    const manifestoTrigger = document.getElementById('manifesto-trigger');
    const manifestoText = document.getElementById('manifesto-text');
    
    const workshopTrigger = document.getElementById('workshop-trigger');
    const aiText = document.getElementById('ai-text');
    const aiImage = document.getElementById('ai-image');
    const printSolid = document.getElementById('print-solid');

    // Utility mapping function (like Arduino's map function)
    function mapRange(value, inMin, inMax, outMin, outMax) {
        value = Math.max(inMin, Math.min(value, inMax)); // Clamp value
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    // The main render loop using requestAnimationFrame for 60fps performance
    function onScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // A. Hero Animation: Scale and fade out as user scrolls down the first section
        const heroRect = heroTrigger.getBoundingClientRect();
        if (heroRect.top < windowHeight && heroRect.bottom > 0) {
            // Calculate progress from 0 (top) to 1 (scrolled past 100vh)
            let progress = -heroRect.top / (heroRect.height - windowHeight);
            progress = Math.max(0, Math.min(progress, 1));
            
            const scale = mapRange(progress, 0, 0.8, 1, 0.8);
            const opacity = mapRange(progress, 0.4, 0.8, 1, 0);
            
            heroTitle.style.transform = `scale(${scale})`;
            heroTitle.style.opacity = opacity;
        }

        // B. Manifesto Text Scrubbing
        const manifestoRect = manifestoTrigger.getBoundingClientRect();
        if (manifestoRect.top < windowHeight && manifestoRect.bottom > 0) {
            // Calculate progress purely within the sticky phase
            let progress = -manifestoRect.top / (manifestoRect.height - windowHeight);
            progress = Math.max(0, Math.min(progress, 1));
            
            // Map progress to background position to reveal text
            // 100% is fully hidden (transparent), 0% is fully revealed
            const bgPosition = mapRange(progress, 0.1, 0.9, 100, 0);
            manifestoText.style.backgroundPosition = `${bgPosition}% 0`;
        }

        // C. The Workshop Animations
        const workshopRect = workshopTrigger.getBoundingClientRect();
        if (workshopRect.top < windowHeight && workshopRect.bottom > 0) {
            let progress = -workshopRect.top / (workshopRect.height - windowHeight);
            progress = Math.max(0, Math.min(progress, 1));

            // 1. AI Card: Text fades out, Image fades in
            const textOpacity = mapRange(progress, 0.2, 0.5, 1, 0);
            const imageOpacity = mapRange(progress, 0.5, 0.8, 0, 1);
            aiText.style.opacity = textOpacity;
            aiImage.style.opacity = imageOpacity;

            // 2. 3D Print Card: Clip-path reveals from bottom to top
            // 100% inset means hidden, 0% inset means fully visible
            const clipInset = mapRange(progress, 0.3, 0.9, 100, 0);
            printSolid.style.clipPath = `inset(${clipInset}% 0 0 0)`;
        }

        requestAnimationFrame(onScroll);
    }

    // Start the render loop
    requestAnimationFrame(onScroll);
});
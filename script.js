// ===================================
// SMOOTH SCROLL & INTERSECTION OBSERVER
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe project card for fade-in
    const projectCard = document.querySelector('.project-card');
    if (projectCard) {
        observer.observe(projectCard);
    }

    // --- MOBILE PROJECT INTERACTION ---
    const projectItems = document.querySelectorAll('.project-item');

    // Auto-reveal on scroll for mobile
    const projectRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (window.innerWidth <= 768) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active-mobile');
                } else {
                    entry.target.classList.remove('active-mobile');
                }
            }
        });
    }, { threshold: 0.6 });

    projectItems.forEach(item => {
        projectRevealObserver.observe(item);

        // Touch interaction for immediate feedback
        item.addEventListener('touchstart', () => {
            if (window.innerWidth <= 768) {
                item.classList.add('active-mobile');
            }
        }, { passive: true });
    });

    // Close when touching outside
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.project-item')) {
            projectItems.forEach(item => item.classList.remove('active-mobile'));
        }
    }, { passive: true });
    // ----------------------------------

    // Add typing effect to status text
    const statusText = document.querySelector('.status-text');
    if (statusText) {
        const originalText = statusText.textContent;
        statusText.textContent = '';
        let i = 0;

        const typeWriter = () => {
            if (i < originalText.length) {
                statusText.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };

        // Start typing after a short delay
        setTimeout(typeWriter, 1000);
    }

    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Initialize Thunder Clouds
    initThunderClouds();
});

// ===================================
// THUNDER CLOUDS EFFECT
// ===================================
function initThunderClouds() {
    const container = document.getElementById('thunder-clouds');
    if (!container) return;

    // Use a simple 2D canvas for performance and aesthetic control
    const canvas = document.createElement('canvas');
    canvas.width = 1400; // Wider canvas
    canvas.height = 600; // Taller canvas to avoid clipping
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let lightning = {
        active: false,
        timer: 0,
        x: 0,
        y: 0,
        opacity: 0,
        life: 0
    };

    function drawLightning() {
        if (!lightning.active) {
            if (Math.random() < 0.005) { // Much less frequent (approx every 3-4s)
                lightning.active = true;
                // Pick a side: Left (0-200px) or Right (width-200px to width)
                const side = Math.random() > 0.5 ? 'left' : 'right';
                lightning.x = side === 'left' ?
                    Math.random() * 200 :
                    canvas.width - (Math.random() * 200);

                lightning.y = Math.random() * 100; // Start near top
                lightning.opacity = 1;
                lightning.life = 20; // Slightly longer life
            }
            return;
        }

        ctx.beginPath();
        ctx.moveTo(lightning.x, lightning.y);
        let currX = lightning.x;
        let currY = lightning.y;

        // Draw vertical jagged line downwards
        const segments = 20;
        const segmentHeight = canvas.height / segments;

        for (let i = 0; i < segments; i++) {
            currX += (Math.random() - 0.5) * 50; // Random horizontal jitter
            currY += segmentHeight;
            ctx.lineTo(currX, currY);
        }

        ctx.strokeStyle = `rgba(255, 42, 42, ${lightning.opacity})`; // Red lightning
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff2a2a';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Flash effect (localized)
        const flashRadius = 300;
        const grad = ctx.createRadialGradient(lightning.x, canvas.height / 2, 0, lightning.x, canvas.height / 2, flashRadius);
        grad.addColorStop(0, `rgba(255, 42, 42, ${lightning.opacity * 0.1})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        lightning.life--;
        lightning.opacity = Math.random() * 0.8; // Flicker

        if (lightning.life <= 0) {
            lightning.active = false;
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Only draw lightning, no clouds
        drawLightning();
        requestAnimationFrame(animate);
    }

    animate();
}

// ===================================
// CURSOR TRAIL EFFECT (Optional)
// ===================================

// Create subtle red glow cursor trail
let cursorTrail = [];
const trailLength = 10;

document.addEventListener('mousemove', (e) => {
    // Only on desktop
    if (window.innerWidth > 768) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = e.pageX + 'px';
        trail.style.top = e.pageY + 'px';
        document.body.appendChild(trail);

        cursorTrail.push(trail);

        if (cursorTrail.length > trailLength) {
            const oldTrail = cursorTrail.shift();
            oldTrail.remove();
        }

        setTimeout(() => {
            trail.style.opacity = '0';
            trail.style.transform = 'scale(0)';
        }, 10);

        setTimeout(() => {
            trail.remove();
        }, 500);
    }
});

// Add cursor trail styles dynamically
const style = document.createElement('style');
style.textContent = `
    .cursor-trail {
        position: absolute;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, rgba(255, 42, 42, 0.6), transparent);
        border-radius: 50%;
        pointer-events: none;
        opacity: 1;
        transform: scale(1);
        transition: all 0.5s ease-out;
        z-index: 9999;
    }
`;
document.head.appendChild(style);

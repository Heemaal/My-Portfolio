// Update year
document.getElementById('year').textContent = new Date().getFullYear();

// Menu Toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Global State variables for interactive components
let heroChartInstance = null;
let sandboxChartInstance = null;
let activeHexColor = '#8b5cf6'; // Violet default

// Dark & Light Mode Theme Switcher
function toggleTheme() {
    const docEl = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    
    if (docEl.classList.contains('dark')) {
        // Shift to Light Mode
        docEl.classList.remove('dark');
        themeIcon.className = "fa-solid fa-sun text-lg";
        localStorage.setItem('portfolio-theme', 'light');
    } else {
        // Shift to Dark Mode
        docEl.classList.add('dark');
        themeIcon.className = "fa-solid fa-moon text-lg";
        localStorage.setItem('portfolio-theme', 'dark');
    }

    // Repaint Charts & Particles for optimized contrast
    onThemeRepaint();
}

// Initialize Theme from Storage or default to Dark
function initSavedTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const docEl = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');

    if (savedTheme === 'light') {
        docEl.classList.remove('dark');
        themeIcon.className = "fa-solid fa-sun text-lg";
    } else {
        docEl.classList.add('dark');
        themeIcon.className = "fa-solid fa-moon text-lg";
    }
}

// Custom theme dynamic accent switcher
function setThemeAccent(rgb, hexColor) {
    document.body.style.setProperty('--accent-rgb', rgb);
    activeHexColor = hexColor;
    onThemeRepaint();
}

// Repaints chart grid-lines, ticks, and layouts on dark/light mode toggle
function onThemeRepaint() {
    const isDark = document.documentElement.classList.contains('dark');
    
    // Re-render hero trend chart with new theme configuration
    const activeTech = document.querySelector('.hero-chip.active')?.innerText || 'Python';
    const mappedTech = activeTech.includes('MySQL') ? 'SQL' : activeTech.includes('Power BI') ? 'PowerBI' : activeTech.includes('ML') ? 'ML' : 'Python';
    renderHeroChart(mappedTech);

    // Re-render sandbox databases
    runSandboxQuery();
}

// Particle background logic
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? `rgba(${getComputedStyle(document.body).getPropertyValue('--accent-rgb') || '139, 92, 246'}, 0.35)` : `rgba(${getComputedStyle(document.body).getPropertyValue('--accent-rgb') || '139, 92, 246'}, 0.25)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 16000);
    for (let i = 0; i < particleCount; i++) {
        particlesArray.push(new Particle());
    }
}
initParticles();

function connectParticles() {
    const isDark = document.documentElement.classList.contains('dark');
    const accentRgb = getComputedStyle(document.body).getPropertyValue('--accent-rgb') || '139, 92, 246';
    
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            const dist = Math.hypot(particlesArray[a].x - particlesArray[b].x, particlesArray[a].y - particlesArray[b].y);
            if (dist < 100) {
                ctx.strokeStyle = `rgba(${accentRgb}, ${isDark ? 0.08 - dist / 1200 : 0.05 - dist / 2000})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animate);
}
animate();

// Interactive Hero Metrics Chart logic (Line/Area graph)
const heroDataPoints = {
    Python: {
        labels: ['Q1-2023', 'Q3-2023', 'Q1-2024', 'Q3-2024', 'Q1-2025', 'Q1-2026'],
        data: [40, 55, 70, 78, 88, 95]
    },
    SQL: {
        labels: ['Q1-2023', 'Q3-2023', 'Q1-2024', 'Q3-2024', 'Q1-2025', 'Q1-2026'],
        data: [30, 45, 60, 75, 85, 90]
    },
    PowerBI: {
        labels: ['Q1-2023', 'Q3-2023', 'Q1-2024', 'Q3-2024', 'Q1-2025', 'Q1-2026'],
        data: [20, 30, 50, 70, 82, 88]
    },
    ML: {
        labels: ['Q1-2023', 'Q3-2023', 'Q1-2024', 'Q3-2024', 'Q1-2025', 'Q1-2026'],
        data: [10, 25, 45, 60, 75, 85]
    }
};

function renderHeroChart(tech) {
    const ctxHero = document.getElementById('heroChart').getContext('2d');
    const dataSet = heroDataPoints[tech];
    const isDark = document.documentElement.classList.contains('dark');
    
    if (heroChartInstance) {
        heroChartInstance.destroy();
    }

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)';
    const tickColor = isDark ? '#94a3b8' : '#475569';

    heroChartInstance = new Chart(ctxHero, {
        type: 'line',
        data: {
            labels: dataSet.labels,
            datasets: [{
                label: `${tech} Competency Trend (%)`,
                data: dataSet.data,
                borderColor: activeHexColor,
                backgroundColor: activeHexColor + (isDark ? '15' : '22'),
                fill: true,
                tension: 0.4,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: gridColor },
                    ticks: { color: tickColor, font: { family: 'Fira Code', size: 9 } },
                    min: 0,
                    max: 100
                },
                x: {
                    grid: { display: false },
                    ticks: { color: tickColor, font: { family: 'Fira Code', size: 9 } }
                }
            }
        }
    });
}

function updateHeroChart(tech) {
    const chips = document.querySelectorAll('.hero-chip');
    chips.forEach(chip => {
        if(chip.innerText.toLowerCase().includes(tech.toLowerCase()) || (tech === 'PowerBI' && chip.innerText === 'Power BI') || (tech === 'ML' && chip.innerText === 'ML Models')) {
            chip.className = "hero-chip active px-2 py-1 text-center font-mono text-[10px] sm:text-xs rounded border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400";
        } else {
            chip.className = "hero-chip px-2 py-1 text-center font-mono text-[10px] sm:text-xs rounded border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400";
        }
    });
    renderHeroChart(tech);
}

// SQL Sandbox logic
const queryDatabase = {
    skills_mastery: {
        labels: ['Python', 'MySQL/SQL', 'Excel', 'Power BI', 'ML Frameworks'],
        data: [95, 90, 88, 88, 85],
        chartType: 'bar',
        command: 'cat query.sql',
        queryStr: 'SELECT skill_name, mastery_score FROM heemaal_skills_table;',
        stats: 'Returning indices for Heemaal Skills dataset: 5 records compiled.'
    },
    experience_months: {
        labels: ['LG Electronics', 'Renu Sharma Found.', 'E-Control Devices', 'My F&O School', 'Coding Junior'],
        data: [4, 4, 14, 2, 4],
        chartType: 'doughnut',
        command: 'cat timeline_query.sql',
        queryStr: 'SELECT role, datediff(month, start, end) FROM professional_experiences;',
        stats: 'Aggregated months duration metrics across 5 entities successfully.'
    },
    research_topics: {
        labels: ['Alzheimer Detection', 'Seizure Deep Learning', 'BERT Contract Risk', 'Cloud HR Automation'],
        data: [92, 95, 89, 90],
        chartType: 'polarArea',
        command: 'cat literature_query.sql',
        queryStr: 'SELECT document_title, confidence_score FROM heemaal_research_papers;',
        stats: 'Extracted neural network metrics for 4 published entities.'
    }
};

function runSandboxQuery() {
    const dropdown = document.getElementById('query-dropdown');
    const queryKey = dropdown.value;
    const config = queryDatabase[queryKey];
    const isDark = document.documentElement.classList.contains('dark');

    document.getElementById('terminal-command').textContent = config.command;
    document.getElementById('terminal-interactive-query').textContent = config.queryStr;
    document.getElementById('terminal-stats').textContent = config.stats;

    const ctxSandbox = document.getElementById('sandboxChart').getContext('2d');
    if (sandboxChartInstance) {
        sandboxChartInstance.destroy();
    }

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)';
    const tickColor = isDark ? '#94a3b8' : '#475569';

    sandboxChartInstance = new Chart(ctxSandbox, {
        type: config.chartType,
        data: {
            labels: config.labels,
            datasets: [{
                label: 'Value metrics',
                data: config.data,
                backgroundColor: [
                    activeHexColor,
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(14, 165, 233, 0.85)',
                    'rgba(245, 158, 11, 0.85)',
                    'rgba(236, 72, 153, 0.85)'
                ],
                borderWidth: isDark ? 1 : 1.5,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: config.chartType === 'doughnut',
                    labels: { color: tickColor, font: { family: 'Fira Code', size: 10 } }
                }
            },
            scales: config.chartType === 'bar' ? {
                y: {
                    grid: { color: gridColor },
                    ticks: { color: tickColor, font: { family: 'Fira Code' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: tickColor, font: { family: 'Fira Code' } }
                }
            } : {}
        }
    });
}

// Experience Timeline mapping highlight
function highlightExperiencesBySkill(skill) {
    const items = document.querySelectorAll('.timeline-item');
    const feedback = document.getElementById('skills-match-box');
    let matchCount = 0;

    items.forEach(item => {
        const itemSkills = item.getAttribute('data-skills');
        const node = item.querySelector('.node-indicator');
        if (itemSkills.toLowerCase().includes(skill.toLowerCase())) {
            item.style.opacity = '1';
            node.style.transform = 'scale(1.2)';
            node.style.borderColor = '#10B981';
            matchCount++;
        } else {
            item.style.opacity = '0.35';
            node.style.transform = 'scale(1)';
            node.style.borderColor = 'rgba(139, 92, 246, 0.2)';
        }
    });

    feedback.classList.remove('hidden');
    feedback.innerHTML = `<span class="text-emerald-500 dark:text-emerald-400 font-bold">${skill}</span> was successfully identified in <span class="text-slate-800 dark:text-white underline font-bold">${matchCount}</span> key experience records! Scroll down to see highlighting, or click anywhere on skills matrix to clear.`;
}

document.getElementById('skills').addEventListener('click', (e) => {
    if (!e.target.closest('.skill-badge-btn')) {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach(item => {
            item.style.opacity = '1';
            const node = item.querySelector('.node-indicator');
            node.style.transform = 'scale(1)';
            node.style.borderColor = '';
        });
        document.getElementById('skills-match-box').classList.add('hidden');
    }
});

function filterProjects(category) {
    const buttons = document.querySelectorAll('.project-tab-btn');
    buttons.forEach(btn => {
        if (btn.innerText.toLowerCase().includes(category) || (category === 'all' && btn.innerText.toLowerCase().includes('all'))) {
            btn.className = "project-tab-btn active px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400";
        } else {
            btn.className = "project-tab-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400";
        }
    });

    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

const titles = ["Data Analyst", "CS Engineer", "Machine Learning Enthusiast", "System Architecture Expert"];
let titleIdx = 0;
let charIdx = 0;
let isDeleting = false;
const speed = 100;
const delay = 2000;
const titleEl = document.getElementById('dynamic-title');

function typeEffect() {
    const currentTitle = titles[titleIdx];
    if (isDeleting) {
        titleEl.textContent = currentTitle.substring(0, charIdx - 1);
        charIdx--;
    } else {
        titleEl.textContent = currentTitle.substring(0, charIdx + 1);
        charIdx++;
    }

    if (!isDeleting && charIdx === currentTitle.length) {
        isDeleting = true;
        setTimeout(typeEffect, delay);
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        titleIdx = (titleIdx + 1) % titles.length;
        setTimeout(typeEffect, 500);
    } else {
        setTimeout(typeEffect, isDeleting ? speed / 2 : speed);
    }
}


// Mail chooser: open Gmail, Outlook, or default mail app
function removeMailChooser() {
    const existing = document.getElementById('mail-chooser-popup');
    if (existing) existing.remove();
}

function createMailChooser(email, x, y) {
    removeMailChooser();
    const popup = document.createElement('div');
    popup.id = 'mail-chooser-popup';
    popup.className = 'absolute z-50 p-2 rounded-lg shadow-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.innerHTML = `
        <div class="flex gap-2">
            <button data-provider="gmail" class="px-3 py-1 rounded bg-blue-600 text-white font-semibold">Gmail</button>
            <button data-provider="outlook" class="px-3 py-1 rounded bg-sky-600 text-white font-semibold">Outlook</button>
            <button data-provider="default" class="px-3 py-1 rounded border">Default Mail App</button>
        </div>
        <div class="text-xs mt-2 opacity-80">To: ${email}</div>
    `;

    document.body.appendChild(popup);

    popup.addEventListener('click', (ev) => {
        const btn = ev.target.closest('button[data-provider]');
        if (!btn) return;
        const provider = btn.getAttribute('data-provider');
        if (provider === 'gmail') {
            window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`,'_blank');
        } else if (provider === 'outlook') {
            window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}`,'_blank');
        } else {
            window.location.href = `mailto:${email}`;
        }
        removeMailChooser();
    });

    // close on any click outside
    setTimeout(() => {
        window.addEventListener('click', function handler(e) {
            if (!popup.contains(e.target)) {
                removeMailChooser();
                window.removeEventListener('click', handler);
            }
        });
    }, 0);
}

document.querySelectorAll('.mailto-chooser').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        const email = el.dataset.email || 'heemaaljaglan@gmail.com';
        const x = e.pageX + 8;
        const y = e.pageY + 8;
        createMailChooser(email, x, y);
    });
});

// Certificates viewer (dynamic)
let certificateFiles = [
    { src: 'Certificates/a.html', title: 'Certificate A' }
    // Fallback list; will be replaced by fetching Certificates/index.json when available
];

async function loadCertificatesIndex() {
    try {
        const res = await fetch('Certificates/index.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('Index fetch failed');
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
            certificateFiles = data;
        }
    } catch (err) {
        // keep fallback list
        console.warn('Could not load Certificates/index.json — using fallback', err);
    }
}

function renderCertificates() {
    const grid = document.getElementById('certificates-grid');
    if (!grid) return;
    grid.innerHTML = '';
    certificateFiles.forEach((c) => {
        const ext = (c.src.split('.').pop() || '').toLowerCase();
        const card = document.createElement('button');
        card.className = 'group overflow-hidden rounded-xl border border-slate-200 dark:border-white/5 bg-white/90 dark:bg-slate-800/60 hover:shadow-lg transition';
        card.setAttribute('data-src', c.src);
        card.setAttribute('aria-label', 'Open certificate ' + c.title);

        let previewHtml = '';
        if (['png','jpg','jpeg','svg'].includes(ext)) {
            previewHtml = `<img src="${c.src}" alt="${c.title}" class="w-full h-40 object-cover group-hover:scale-105 transition-transform" loading="lazy">`;
        } else if (ext === 'html') {
            previewHtml = `<iframe src="${c.src}" class="w-full h-40 border-0" sandbox="allow-same-origin allow-scripts"></iframe>`;
        } else if (ext === 'pdf') {
            previewHtml = `<div class="w-full h-40 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-gray-300 text-sm"><i class="fa-solid fa-file-pdf text-3xl text-red-500 mr-3"></i><span class="max-w-[60%] truncate">${c.title}</span></div>`;
        } else {
            previewHtml = `<div class="w-full h-40 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-gray-300 text-sm"><i class="fa-solid fa-certificate text-3xl text-violet-600 mr-3"></i><span class="max-w-[60%] truncate">${c.title}</span></div>`;
        }

        card.innerHTML = `
            <div class="w-full">${previewHtml}</div>
            <div class="p-3 flex items-center justify-between">
                <div>
                    <div class="font-semibold text-sm text-slate-900 dark:text-white">${c.title}</div>
                    <div class="text-xs text-slate-500 dark:text-gray-400">Click to open full view</div>
                </div>
                <div class="text-xs text-slate-400 dark:text-gray-500">Open</div>
            </div>
        `;
        card.addEventListener('click', () => openCertificate(c.src, c.title));
        grid.appendChild(card);
    });
}

// Certificate viewer: zoom & pan state
let certZoom = 1;
let certMinZoom = 0.5;
let certMaxZoom = 4;
let certPanX = 0;
let certPanY = 0;
let certIsPanning = false;
let certStartX = 0;
let certStartY = 0;
let certTouchStartDist = 0;
let certTouchStartZoom = 1;

function applyCertTransform() {
    const content = document.getElementById('certificate-viewer-content');
    if (!content) return;
    // keep center translate and apply pan and scale
    content.style.transform = `translate(-50%, -50%) translate(${certPanX}px, ${certPanY}px) scale(${certZoom})`;
}

function setCertZoom(z) {
    certZoom = Math.max(certMinZoom, Math.min(certMaxZoom, z));
    const val = document.getElementById('cert-zoom-val');
    if (val) val.textContent = Math.round(certZoom * 100) + '%';
    applyCertTransform();
}

function zoomIn() { setCertZoom(certZoom + 0.2); }
function zoomOut() { setCertZoom(certZoom - 0.2); }
function resetCertView() { certZoom = 1; certPanX = 0; certPanY = 0; setCertZoom(1); }
function fitCertView() { certPanX = 0; certPanY = 0; setCertZoom(1); }

function openCertificate(src, title) {
    const modal = document.getElementById('certificate-modal');
    const viewerContent = document.getElementById('certificate-viewer-content');
    const titleEl = document.getElementById('certificate-title');
    if (!modal || !viewerContent) return;
    viewerContent.innerHTML = '';
    titleEl && (titleEl.textContent = title || 'Certificate');

    const ext = (src.split('.').pop() || '').toLowerCase();
    let el;
    if (['png','jpg','jpeg','svg'].includes(ext)) {
        el = document.createElement('img');
        el.src = src;
        el.alt = title || '';
        el.style.display = 'block';
        el.style.maxWidth = 'none';
        el.style.maxHeight = 'none';
    } else if (ext === 'html') {
        el = document.createElement('iframe');
        el.src = src;
        el.style.border = '0';
        el.setAttribute('sandbox','allow-same-origin allow-scripts');
        el.style.width = '100%';
        el.style.height = '100%';
    } else {
        // fallback: embed PDF or file in iframe/object
        el = document.createElement('iframe');
        el.src = src;
        el.style.border = '0';
        el.style.width = '100%';
        el.style.height = '100%';
    }

    el.className = 'certificate-content-element';
    el.style.willChange = 'transform';
    el.style.pointerEvents = 'auto';
    // ensure the content has a sensible size to start with
    el.style.maxWidth = '1200px';
    el.style.maxHeight = '1200px';
    viewerContent.appendChild(el);

    // reset zoom/pan
    certZoom = 1; certPanX = 0; certPanY = 0;
    setCertZoom(1);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // set cursor
    viewerContent.style.cursor = 'grab';
}

function closeCertificate() {
    const modal = document.getElementById('certificate-modal');
    const viewerContent = document.getElementById('certificate-viewer-content');
    if (!modal || !viewerContent) return;
    viewerContent.innerHTML = '';
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
}

function setupCertificateHandlers() {
    // close handlers
    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('#certificate-close');
        if (closeBtn) { closeCertificate(); return; }
        if (e.target && e.target.id === 'certificate-modal') { closeCertificate(); }
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCertificate(); });

    // toolbar
    const zin = document.getElementById('cert-zoom-in');
    const zout = document.getElementById('cert-zoom-out');
    const fit = document.getElementById('cert-fit');
    const reset = document.getElementById('cert-reset');
    zin && zin.addEventListener('click', zoomIn);
    zout && zout.addEventListener('click', zoomOut);
    fit && fit.addEventListener('click', fitCertView);
    reset && reset.addEventListener('click', resetCertView);

    // pan & wheel & touch handlers on viewer
    const viewer = document.getElementById('certificate-viewer');
    const content = document.getElementById('certificate-viewer-content');
    if (!viewer || !content) return;

    // mouse pan
    viewer.addEventListener('mousedown', (e) => {
        certIsPanning = true;
        certStartX = e.clientX;
        certStartY = e.clientY;
        viewer.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => { certIsPanning = false; if (viewer) viewer.style.cursor = 'default'; });
    window.addEventListener('mousemove', (e) => {
        if (!certIsPanning) return;
        const dx = e.clientX - certStartX;
        const dy = e.clientY - certStartY;
        certStartX = e.clientX; certStartY = e.clientY;
        certPanX += dx;
        certPanY += dy;
        applyCertTransform();
    });

    // wheel to zoom
    viewer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = -e.deltaY;
        const factor = delta > 0 ? 1.08 : 0.92;
        const rect = content.getBoundingClientRect();
        // optional: zoom toward cursor (not implemented fully)
        setCertZoom(certZoom * factor);
    }, { passive: false });

    // touch: pinch to zoom and single-finger pan
    viewer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            certTouchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            certTouchStartZoom = certZoom;
        } else if (e.touches.length === 1) {
            certIsPanning = true;
            certStartX = e.touches[0].clientX;
            certStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    viewer.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const d = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const ratio = d / (certTouchStartDist || d);
            setCertZoom(certTouchStartZoom * ratio);
        } else if (e.touches.length === 1 && certIsPanning) {
            const dx = e.touches[0].clientX - certStartX;
            const dy = e.touches[0].clientY - certStartY;
            certStartX = e.touches[0].clientX;
            certStartY = e.touches[0].clientY;
            certPanX += dx; certPanY += dy;
            applyCertTransform();
        }
    }, { passive: true });

    viewer.addEventListener('touchend', (e) => { if (e.touches.length === 0) certIsPanning = false; }, { passive: true });
}

window.onload = function() {
    initSavedTheme();
    renderHeroChart('Python');
    runSandboxQuery();
    typeEffect();
    // Certificates: try to load index.json then render
    loadCertificatesIndex().then(() => {
        renderCertificates();
        setupCertificateHandlers();
    });
};

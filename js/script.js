import { content, projectsData, experienceData, certificatesData } from './data.js';

let currentLang = localStorage.getItem('lang') || 'id';
let currentTheme = localStorage.getItem('theme') || 'light';

function init() {
    applyTheme(currentTheme);
    renderContent();
    setupEventListeners();
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('theme-toggle').innerHTML = '<i class="bi bi-sun"></i>';
    } else {
        document.body.classList.remove('dark');
        document.getElementById('theme-toggle').innerHTML = '<i class="bi bi-moon"></i>';
    }
}

function renderContent() {
    const langData = content[currentLang];

    // Update simple text elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const keys = key.split('.');
        let text = langData;
        keys.forEach(k => {
            text = text[k];
        });
        if (text) el.textContent = text;
    });

    // Page specific rendering
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
        renderHero();
        renderSkills();
        renderProjectHighlights();
        renderExperience();
    } else if (path.includes('projects.html')) {
        renderProjectsGrid();
        renderFilters();
    } else if (path.includes('certificates.html')) {
        renderCertificatesGrid();
    } else if (path.includes('project-detail.html')) {
        renderProjectDetail();
    } else if (path.includes('about.html')) {
        renderAbout();
    }
}

function renderAbout() {
    const statsContainer = document.getElementById('about-stats-container');
    if (!statsContainer) return;

    statsContainer.innerHTML = '';
    const stats = content[currentLang].about.stats;

    stats.forEach(stat => {
        const col = document.createElement('div');
        col.className = 'col-4 col-md-4';
        col.innerHTML = `
            <div class="stat-card">
                <h4 class="fw-bold mb-1">${stat.value}</h4>
                <p class="text-muted small mb-0">${stat.label}</p>
            </div>
        `;
        statsContainer.appendChild(col);
    });
}

function renderFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    container.innerHTML = '';
    const categories = content[currentLang].projects.categories;
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-primary filter-btn';
        if (cat === (localStorage.getItem('category-filter') || categories[0])) btn.classList.add('active');
        btn.textContent = cat;
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('category-filter', cat);
            renderProjectsGrid();
        };
        container.appendChild(btn);
    });
}

function renderProjectsGrid() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    const searchTerm = document.getElementById('project-search')?.value.toLowerCase() || '';
    const activeCat = localStorage.getItem('category-filter') || content[currentLang].projects.categories[0];

    container.innerHTML = '';
    const filtered = projectsData.filter(p => {
        const matchesSearch = p.title[currentLang].toLowerCase().includes(searchTerm);
        const matchesCat = activeCat === content[currentLang].projects.categories[0] || p.category === activeCat;
        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Proyek tidak ditemukan.</p></div>';
        return;
    }

    filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4';
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="bg-primary text-white p-5 text-center rounded-top" style="height: 200px; display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-laptop display-1"></i>
                </div>
                <div class="card-body">
                    <h5 class="card-title fw-bold">${project.title[currentLang]}</h5>
                    <p class="card-text text-muted small">${project.year} • ${project.role[currentLang]}</p>
                    <p class="card-text">${project.shortDescription[currentLang]}</p>
                    <a href="project-detail.html?slug=${project.slug}" class="btn btn-sm btn-primary">Detail</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderCertificatesGrid() {
    const container = document.getElementById('certificates-grid');
    if (!container) return;

    container.innerHTML = '';
    certificatesData.forEach(cert => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4';
        card.innerHTML = `
            <div class="card h-100 shadow-sm text-center">
                <div class="card-body">
                    <i class="bi bi-patch-check text-primary display-4 mb-3"></i>
                    <h5 class="card-title fw-bold">${cert.title}</h5>
                    <p class="card-text text-muted mb-1">${cert.organizer}</p>
                    <p class="card-text small mb-4">${cert.year} • ${cert.category}</p>
                    <div class="d-grid gap-2">
                        <button class="btn btn-outline-primary btn-sm" onclick="showCertPreview('${cert.title}', '${cert.file}')">Preview</button>
                        <a href="${cert.file}" class="btn btn-primary btn-sm" download>Download</a>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

window.showCertPreview = function (title, file) {
    const modal = new bootstrap.Modal(document.getElementById('certModal'));
    document.getElementById('certModalTitle').textContent = title;
    document.getElementById('certIframe').src = file;
    document.getElementById('certDownloadLink').href = file;
    modal.show();
};

function renderProjectDetail() {
    const container = document.getElementById('detail-content');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const project = projectsData.find(p => p.slug === slug);

    if (!project) {
        container.innerHTML = '<div class="alert alert-warning">Project not found.</div>';
        return;
    }

    document.getElementById('breadcrumb-title').textContent = project.title[currentLang];

    container.innerHTML = `
        <div class="row">
            <div class="col-lg-12 mb-5">
                <div class="browser-mockup">
                    <div class="browser-header">
                        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                        <div class="browser-address-bar">${project.links.demo !== '#' ? project.links.demo : 'https://dimas-portfolio.dev'}</div>
                    </div>
                    <img src="${project.image}" class="img-fluid w-100" alt="${project.title[currentLang]}">
                </div>
            </div>
            <div class="col-lg-8">
                <h1 class="fw-bold mb-3">${project.title[currentLang]}</h1>
                <p class="lead mb-5">${project.fullDescription[currentLang]}</p>
                
                <div class="mb-5">
                    <h4 class="fw-bold mb-3">${currentLang === 'id' ? 'Masalah' : 'Problem'}</h4>
                    <p>${project.problem[currentLang]}</p>
                </div>
                
                <div class="mb-5">
                    <h4 class="fw-bold mb-3">${currentLang === 'id' ? 'Solusi' : 'Solution'}</h4>
                    <p>${project.solution[currentLang]}</p>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card shadow-sm border-0 sticky-top" style="top: 100px;">
                    <div class="card-body">
                        <h5 class="fw-bold mb-4">Project Info</h5>
                        <ul class="list-unstyled">
                            <li class="mb-3"><strong>Year:</strong><br>${project.year}</li>
                            <li class="mb-3"><strong>Role:</strong><br>${project.role[currentLang]}</li>
                            <li class="mb-3"><strong>Category:</strong><br>${project.category}</li>
                            <li class="mb-3"><strong>Tech Stack:</strong><br>${project.techStack.join(', ')}</li>
                            <li class="mb-3"><strong>Skills Improved:</strong><br>${project.skillsImproved.join(', ')}</li>
                        </ul>
                        <div class="d-grid gap-2 mt-4">
                            <a href="${project.links.demo}" class="btn btn-primary" target="_blank">View Demo</a>
                            <a href="${project.links.repo}" class="btn btn-outline-primary" target="_blank">Repository</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderHero() {
    const hero = content[currentLang].hero;
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    heroSection.querySelector('.greeting').textContent = hero.greeting;
    heroSection.querySelector('.name').textContent = hero.name;
    heroSection.querySelector('.tagline').textContent = hero.tagline;
    heroSection.querySelector('.bio').textContent = hero.bio;
}

function renderSkills() {
    const container = document.getElementById('skills-grid');
    if (!container) return;

    const langData = content[currentLang].skills;
    const items = langData.items;
    const categories = langData.categories;

    container.innerHTML = '';

    Object.keys(categories).forEach(catKey => {
        const catItems = items.filter(item => item.category === catKey);
        if (catItems.length === 0) return;

        const catTitle = document.createElement('div');
        catTitle.className = 'col-12 mt-5 mb-3';
        catTitle.innerHTML = `<h5 class="text-uppercase fw-bold text-center category-title">${categories[catKey]}</h5>`;
        container.appendChild(catTitle);

        catItems.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-2-4';

            const iconContent = item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${item.name}" class="skill-img-logo">`
                : `<i class="bi ${item.icon}"></i>`;

            col.innerHTML = `
                <div class="skill-tile text-center p-4">
                    <div class="tile-icon-wrapper mb-3">
                        ${iconContent}
                    </div>
                    <div class="tile-name small fw-bold text-uppercase">${item.name}</div>
                </div>
            `;
            container.appendChild(col);
        });
    });
}

function renderProjectHighlights() {
    const container = document.getElementById('project-carousel-inner');
    if (!container) return;

    container.innerHTML = '';
    projectsData.slice(0, 3).forEach((project, index) => {
        const item = document.createElement('div');
        item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        item.innerHTML = `
            <div class="row align-items-center p-4">
                <div class="col-md-6 mb-3 mb-md-0">
                    <img src="${project.image}" class="d-block w-100 rounded shadow" alt="${project.title[currentLang]}">
                </div>
                <div class="col-md-6">
                    <h3>${project.title[currentLang]}</h3>
                    <p>${project.shortDescription[currentLang]}</p>
                    <div class="d-flex gap-2">
                        <a href="project-detail.html?slug=${project.slug}" class="btn btn-primary px-4">Detail</a>
                        ${project.links.demo !== '#' ? `
                            <a href="${project.links.demo}" class="btn btn-outline-primary px-4" target="_blank">
                                <i class="bi bi-box-arrow-up-right me-2"></i>Live Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderExperience() {
    const container = document.getElementById('experience-timeline');
    if (!container) return;

    container.innerHTML = '';
    experienceData.forEach((exp, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item-modern position-relative mb-5 ps-4';
        item.innerHTML = `
            <div class="timeline-node">
                <i class="bi ${exp.icon}"></i>
            </div>
            <div class="card experience-card p-4">
                <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                    <h5 class="fw-bold mb-0" style="color: var(--primary-color)">${exp.title[currentLang]}</h5>
                    <span class="badge rounded-pill bg-accent-color text-dark small px-3 py-2">${exp.year}</span>
                </div>
                <div class="small text-muted mb-3 text-uppercase letter-spacing-1">${exp.type}</div>
                <p class="mb-0 text-muted">${exp.description[currentLang]}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

function setupEventListeners() {
    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'id' ? 'en' : 'id';
        localStorage.setItem('lang', currentLang);
        renderContent();
    });

    document.getElementById('theme-toggle').addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    });

    const searchInput = document.getElementById('project-search');
    if (searchInput) {
        searchInput.addEventListener('input', renderProjectsGrid);
    }
}

document.addEventListener('DOMContentLoaded', init);

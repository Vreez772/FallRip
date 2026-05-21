/**
 * FallRip - SteamFree Website
 * Pure JavaScript implementation for GitHub Pages
 */

// Configuration
const CONFIG = {
    GAMES_DATA_URL: 'games-data.json',
    PAGE_SIZE: 48,
    HERO_BG: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663440677470/Q6rfp8WXtpZKpwvnhmE7hA/titanfall2_hero_custom_05978bbc.webp'
};

const CATEGORIES = [
    "Action", "Adventure", "Anime", "Building", "First-person Shooter Games",
    "Horror", "Indie", "Multiplayer", "Open World", "Racing",
    "Role-playing game", "Sci-fi", "Shooters", "Simulation",
    "Sports", "Strategy", "Survival", "Virtual Reality"
];

const CATEGORY_COLORS = {
    "Action": "oklch(0.62 0.22 35)",
    "Adventure": "oklch(0.55 0.18 200)",
    "Role-playing game": "oklch(0.55 0.18 280)",
    "RPG": "oklch(0.55 0.18 280)",
    "Horror": "oklch(0.50 0.20 15)",
    "Indie": "oklch(0.55 0.18 160)",
    "Strategy": "oklch(0.55 0.18 240)",
    "Simulation": "oklch(0.55 0.18 180)",
    "Shooters": "oklch(0.60 0.20 30)",
    "First-person Shooter Games": "oklch(0.60 0.20 30)",
    "Multiplayer": "oklch(0.55 0.18 120)",
    "Open World": "oklch(0.55 0.18 140)",
    "Racing": "oklch(0.60 0.22 60)",
    "Sports": "oklch(0.55 0.18 100)",
    "Anime": "oklch(0.55 0.18 320)",
    "Virtual Reality": "oklch(0.55 0.18 220)",
    "Sci-fi": "oklch(0.55 0.18 180)",
    "Building": "oklch(0.55 0.18 100)",
    "Survival": "oklch(0.50 0.18 30)"
};

// State
let allGames = [];
let filteredGames = [];
let currentPage = 1;
let currentCategory = '';
let currentSort = 'newest';
let searchQuery = '';

// DOM Elements
const gamesGrid = document.getElementById('gamesGrid');
const loadingSkeleton = document.getElementById('loadingSkeleton');
const noResults = document.getElementById('noResults');
const pagination = document.getElementById('pagination');
const paginationNumbers = document.getElementById('paginationNumbers');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const searchInput = document.getElementById('searchInput');
const searchInputMobile = document.getElementById('searchInputMobile');
const categoryChips = document.getElementById('categoryChips');
const resultsCount = document.getElementById('resultsCount');
const gameCountBadge = document.getElementById('gameCountBadge');
const gameModal = document.getElementById('gameModal');
const modalContent = document.getElementById('modalContent');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    setupEventListeners();
    renderCategoryChips();
    await loadGames();
}

function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInputMobile.addEventListener('input', debounce(handleSearch, 300));
    
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => handleSort(btn.dataset.sort));
    });
    
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    
    gameModal.addEventListener('click', (e) => {
        if (e.target === gameModal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function renderCategoryChips() {
    const chipsHTML = CATEGORIES.map(cat => 
        `<button class="chip" data-category="${cat}">${cat}</button>`
    ).join('');
    
    categoryChips.innerHTML = `<button class="chip active" data-category="">Alle</button>${chipsHTML}`;
    
    categoryChips.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => handleCategory(chip.dataset.category));
    });
}

async function loadGames() {
    showLoading(true);
    try {
        const response = await fetch(CONFIG.GAMES_DATA_URL);
        allGames = await response.json();
        gameCountBadge.textContent = `${allGames.length.toLocaleString()} Spiele verfügbar`;
        applyFilters();
    } catch (error) {
        console.error('Failed to load games:', error);
        gamesGrid.innerHTML = `<div class="no-results"><p>Fehler beim Laden der Spiele</p></div>`;
    }
    showLoading(false);
}

function showLoading(show) {
    if (show) {
        loadingSkeleton.style.display = 'grid';
        gamesGrid.style.display = 'none';
        noResults.style.display = 'none';
        loadingSkeleton.innerHTML = Array(24).fill('').map(() => `
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton-body">
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line short"></div>
                </div>
            </div>
        `).join('');
    } else {
        loadingSkeleton.style.display = 'none';
        gamesGrid.style.display = 'grid';
    }
}

function handleSearch(e) {
    searchQuery = e.target.value.toLowerCase();
    searchInput.value = e.target.value;
    searchInputMobile.value = e.target.value;
    currentPage = 1;
    applyFilters();
}

function handleCategory(category) {
    currentCategory = category;
    currentPage = 1;
    categoryChips.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.category === category);
    });
    applyFilters();
}

function handleSort(sort) {
    currentSort = sort;
    currentPage = 1;
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === sort);
    });
    applyFilters();
}

function applyFilters() {
    filteredGames = allGames.filter(game => {
        const matchesSearch = !searchQuery || 
            game.title.toLowerCase().includes(searchQuery) ||
            (game.description && game.description.toLowerCase().includes(searchQuery));
        const matchesCategory = !currentCategory || 
            (game.categories && game.categories.some(c => c === currentCategory));
        return matchesSearch && matchesCategory;
    });
    sortGames();
    renderGames();
    renderPagination();
}

function sortGames() {
    switch (currentSort) {
        case 'title_asc':
            filteredGames.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title_desc':
            filteredGames.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'newest':
        default:
            break;
    }
}

function renderGames() {
    const start = (currentPage - 1) * CONFIG.PAGE_SIZE;
    const end = start + CONFIG.PAGE_SIZE;
    const pageGames = filteredGames.slice(start, end);
    resultsCount.textContent = filteredGames.length.toLocaleString();
    
    if (pageGames.length === 0) {
        gamesGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    gamesGrid.style.display = 'grid';
    noResults.style.display = 'none';
    gamesGrid.innerHTML = pageGames.map(game => createGameCard(game)).join('');
    
    gamesGrid.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => openGameModal(card.dataset.slug));
    });
}

function createGameCard(game) {
    const primaryCategory = game.categories?.[0] || '';
    const categoryColor = CATEGORY_COLORS[primaryCategory] || 'oklch(0.55 0.10 265)';
    return `
        <div class="game-card" data-slug="${game.slug}">
            <div class="game-card-image">
                ${game.image ? 
                    `<img src="${game.image}" alt="${escapeHtml(game.title)}" loading="lazy" onerror="this.parentElement.innerHTML=createPlaceholder('${escapeHtml(game.title)}')">` :
                    createPlaceholder(game.title)
                }
                ${primaryCategory ? `<span class="game-card-badge" style="background: ${categoryColor}cc;">${primaryCategory}</span>` : ''}
                <div class="game-card-gradient"></div>
            </div>
            <div class="game-card-body">
                <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
                <div class="game-card-meta">
                    ${game.version ? `<span class="game-card-version">${escapeHtml(game.version)}</span>` : '<span></span>'}
                </div>
            </div>
        </div>
    `;
}

function createPlaceholder(title) {
    return `<div class="game-card-placeholder"><span>🎮</span><span>${escapeHtml(title || '')}</span></div>`;
}

function renderPagination() {
    const totalPages = Math.ceil(filteredGames.length / CONFIG.PAGE_SIZE);
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    pagination.style.display = 'flex';
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    let pages = [];
    if (totalPages <= 7) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, 6, 7];
    } else if (currentPage >= totalPages - 3) {
        pages = Array.from({ length: 7 }, (_, i) => totalPages - 6 + i);
    } else {
        pages = Array.from({ length: 7 }, (_, i) => currentPage - 3 + i);
    }
    
    paginationNumbers.innerHTML = pages.map(page => 
        `<button class="pagination-number ${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`
    ).join('');
    
    paginationNumbers.querySelectorAll('.pagination-number').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderGames();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function changePage(delta) {
    const totalPages = Math.ceil(filteredGames.length / CONFIG.PAGE_SIZE);
    currentPage = Math.max(1, Math.min(totalPages, currentPage + delta));
    renderGames();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openGameModal(slug) {
    const game = allGames.find(g => g.slug === slug);
    if (!game) return;
    
    modalContent.innerHTML = `
        ${game.image ? `<img src="${game.image}" alt="${escapeHtml(game.title)}" class="modal-image" onerror="this.style.display='none'">` : ''}
        <div class="modal-body">
            <h2 class="modal-title">${escapeHtml(game.title)}</h2>
            ${game.version ? `<span class="modal-version">${escapeHtml(game.version)}</span>` : ''}
            <div class="modal-categories">
                ${(game.categories || []).map(cat => `<span class="modal-category">${escapeHtml(cat)}</span>`).join('')}
            </div>
            <h3 class="modal-section-title">Download-Links</h3>
            <div class="download-links">
                ${(game.download_links && game.download_links.length > 0) ? 
                    game.download_links.map(link => `
                        <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="download-link">
                            <span class="download-link-label">🚀 ${escapeHtml(link.label || 'Download')}</span>
                            <span class="download-link-host">${escapeHtml(link.host || 'Mirror')}</span>
                        </a>
                    `).join('') :
                    `<a href="${escapeHtml(game.url)}" target="_blank" rel="noopener noreferrer" class="download-link">
                        <span class="download-link-label">🔗 Auf SteamRIP ansehen</span>
                        <span class="download-link-host">SteamRIP</span>
                    </a>`
                }
            </div>
        </div>
    `;
    gameModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    gameModal.classList.remove('active');
    document.body.style.overflow = '';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.closeModal = closeModal;

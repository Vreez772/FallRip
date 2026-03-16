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
    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInputMobile.addEventListener('input', debounce(handleSearch, 300));
    
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => handleSort(btn.dataset.sort));
    });
    
    // Pagination
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    
    // Modal close on overlay click
    gameModal.addEventListener('click', (e) => {
        if (e.target === gameModal) closeModal();
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function renderCategoryChips() {
    const chipsHTML = CATEGORIES.map(cat => 
        `<button class="chip" data-category="${cat}">${cat}</button>`
    ).join('');
    
    categoryChips.innerHTML = `<button class="chip active" data-category="">Alle</button>${chipsHTML}`;
    
    // Add click listeners
    categoryChips.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => handleCategory(chip.dataset.category));
    });
}

async function loadGames() {
    showLoading(true);
    
    try {
        const response = await fetch(CONFIG.GAMES_DATA_URL);
        allGames = await response.json();
        
        // Update badge
        gameCountBadge.textContent = `${allGames.length.toLocaleString()} Spiele verfügbar`;
        
        // Apply initial filter
        applyFilters();
    } catch (error) {
        console.error('Failed to load games:', error);
        gamesGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1;">
                <div class="no-results-icon">⚠️</div>
                <p class="no-results-title">Fehler beim Laden der Spiele</p>
                <p class="no-results-subtitle">Bitte lade die Seite neu</p>
            </div>
        `;
    }
    
    showLoading(false);
}

function showLoading(show) {
    if (show) {
        loadingSkeleton.style.display = 'grid';
        gamesGrid.style.display = 'none';
        noResults.style.display = 'none';
        
        // Generate skeleton cards
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
    
    // Sync both search inputs
    searchInput.value = e.target.value;
    searchInputMobile.value = e.target.value;
    
    currentPage = 1;
    applyFilters();
}

function handleCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    // Update active chip
    categoryChips.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.category === category);
    });
    
    applyFilters();
}

function handleSort(sort) {
    currentSort = sort;
    currentPage = 1;
    
    // Update active button
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === sort);
    });
    
    applyFilters();
}

function applyFilters() {
    // Filter
    filteredGames = allGames.filter(game => {
        const matchesSearch = !searchQuery || 
            game.title.toLowerCase().includes(searchQuery) ||
            (game.description && game.description.toLowerCase().includes(searchQuery));
        
        const matchesCategory = !currentCategory || 
            (game.categories && game.categories.some(c => c === currentCategory));
        
        return matchesSearch && matchesCategory;
    });
    
    // Sort
    sortGames();
    
    // Render
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
            // Keep original order (assumed to be newest first)
            break;
    }
}

function renderGames() {
    const start = (currentPage - 1) * CONFIG.PAGE_SIZE;
    const end = start + CONFIG.PAGE_SIZE;
    const pageGames = filteredGames.slice(start, end);
    
    // Update results count
    resultsCount.textContent = filteredGames.length.toLocaleString();
    
    if (pageGames.length === 0) {
        gamesGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    gamesGrid.style.display = 'grid';
    noResults.style.display = 'none';
    
    gamesGrid.innerHTML = pageGames.map(game => createGameCard(game)).join('');
    
    // Add click listeners to cards
    gamesGrid.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => openGameModal(card.dataset.slug));
    });
}

function createGameCard(game) {
    const primaryCategory = game.categories?.[0] || '';
    const categoryColor = CATEGORY_COLORS[primaryCategory] || 'oklch(0.55 0.10 265)';
    const hasDownloads = (game.download_links?.length || 0) > 0;
    
    return `
        <div class="game-card" data-slug="${game.slug}">
            <div class="game-card-image">
                ${game.image ? 
                    `<img src="${game.image}" alt="${escapeHtml(game.title)}" loading="lazy" onerror="this.parentElement.innerHTML=createPlaceholder('${escapeHtml(game.title)}')">` :
                    createPlaceholder(game.title)
                }
                ${primaryCategory ? 
                    `<span class="game-card-badge" style="background: ${categoryColor}cc; backdrop-filter: blur(4px);">${primaryCategory}</span>` : 
                    ''
                }
                ${hasDownloads ? 
                    `<span class="game-card-downloads">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        ${game.download_links.length}
                    </span>` : 
                    ''
                }
                <div class="game-card-gradient"></div>
            </div>
            <div class="game-card-body">
                <h3 class="game-card-title">${escapeHtml(game.title)}</h3>
                <div class="game-card-meta">
                    ${game.version ? `<span class="game-card-version">${escapeHtml(game.version)}</span>` : '<span></span>'}
                    <div class="game-card-tags">
                        ${(game.tags || []).slice(0, 2).map(tag => 
                            `<span class="game-card-tag">${escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createPlaceholder(title) {
    return `
        <div class="game-card-placeholder">
            <div class="game-card-placeholder-icon">🎮</div>
            <span class="game-card-placeholder-text">${escapeHtml(title || '')}</span>
        </div>
    `;
}

function renderPagination() {
    const totalPages = Math.ceil(filteredGames.length / CONFIG.PAGE_SIZE);
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // Update prev/next buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // Generate page numbers
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
    
    // Add click listeners
    paginationNumbers.querySelectorAll('.pagination-number').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderGames();
            renderPagination();
            scrollToGames();
        });
    });
}

function changePage(delta) {
    const totalPages = Math.ceil(filteredGames.length / CONFIG.PAGE_SIZE);
    currentPage = Math.max(1, Math.min(totalPages, currentPage + delta));
    renderGames();
    renderPagination();
    scrollToGames();
}

function scrollToGames() {
    document.getElementById('games-grid').scrollIntoView({ behavior: 'smooth' });
}

function openGameModal(slug) {
    const game = allGames.find(g => g.slug === slug);
    if (!game) return;
    
    const primaryCategory = game.categories?.[0] || '';
    const categoryColor = CATEGORY_COLORS[primaryCategory] || 'oklch(0.55 0.10 265)';
    
    modalContent.innerHTML = `
        ${game.image ? 
            `<img src="${game.image}" alt="${escapeHtml(game.title)}" class="modal-image" onerror="this.style.display='none'">` : 
            ''
        }
        <div class="modal-body">
            <h2 class="modal-title">${escapeHtml(game.title)}</h2>
            ${game.version ? `<span class="modal-version">${escapeHtml(game.version)}</span>` : ''}
            
            <div class="modal-categories">
                ${(game.categories || []).map(cat => {
                    const color = CATEGORY_COLORS[cat] || 'oklch(0.55 0.10 265)';
                    return `<span class="modal-category" style="background: ${color};">${escapeHtml(cat)}</span>`;
                }).join('')}
            </div>
            
            ${game.size ? `<p class="modal-size">📦 Größe: ${escapeHtml(game.size)}</p>` : ''}
            
            ${game.description && game.description !== game.title ? 
                `<p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem;">${escapeHtml(game.description)}</p>` : 
                ''
            }
            
            ${(game.download_links?.length || 0) > 0 ? `
                <h3 class="modal-section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download-Links
                </h3>
                <div class="download-links">
                    ${game.download_links.map(link => `
                        <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="download-link">
                            <span class="download-link-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                ${escapeHtml(link.label || 'Download')}
                            </span>
                            <span class="download-link-host">${escapeHtml(link.host || 'Link')}</span>
                        </a>
                    `).join('')}
                </div>
            ` : '<p style="color: var(--text-muted);">Keine Download-Links verfügbar</p>'}
            
            ${game.url ? `
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <a href="${escapeHtml(game.url)}" target="_blank" rel="noopener noreferrer" 
                       style="color: var(--accent); font-size: 0.875rem; display: inline-flex; align-items: center; gap: 0.5rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Auf SteamRip ansehen
                    </a>
                </div>
            ` : ''}
        </div>
    `;
    
    gameModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    gameModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Utility functions
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

// Make closeModal available globally
window.closeModal = closeModal;
window.scrollToGames = scrollToGames;
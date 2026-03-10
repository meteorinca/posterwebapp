document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('carousel');
    const navLinks = document.querySelectorAll('#filter-nav a');
    const nav = document.getElementById('filter-nav');
    const logo = document.querySelector('.logo');
    
    // Search elements
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.getElementById('search-input');
    
    // Ratings elements
    const ratingCheck = document.getElementById('show-ratings-checkbox');
    const ratingCheckIcon = document.getElementById('rating-check-icon');

    // Initialize container events (drag/wheel)
    initEvents(container);

    // Initial render
    renderGallery(container, 'All');

    // Filter click events
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const filter = link.getAttribute('data-filter') || 'All';
            renderGallery(container, filter, searchInput.value);
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                nav.classList.remove('show-mobile');
            }
        });
    });

    // Mobile menu toggle
    logo.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            nav.classList.toggle('show-mobile');
        }
    });

    // Search functionality
    searchIcon.addEventListener('click', () => {
        if (searchInput.style.display === 'none') {
            searchInput.style.display = 'block';
            searchInput.focus();
        } else {
            searchInput.style.display = 'none';
            if (searchInput.value !== '') {
                searchInput.value = '';
                const activeLink = document.querySelector('#filter-nav a.active');
                const filter = activeLink ? activeLink.getAttribute('data-filter') : 'All';
                renderGallery(container, filter, '');
            }
        }
    });

    searchInput.addEventListener('input', () => {
        const activeLink = document.querySelector('#filter-nav a.active');
        const filter = activeLink ? activeLink.getAttribute('data-filter') : 'All';
        renderGallery(container, filter, searchInput.value);
    });

    // Ratings toggle functionality
    ratingCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('show-ratings');
            ratingCheckIcon.setAttribute('stroke', '#ffffff');
        } else {
            document.body.classList.remove('show-ratings');
            ratingCheckIcon.setAttribute('stroke', '#a0a0a0');
        }
    });
});

function getDefaultImage(type, title) {
    let icon = '';
    let bgColor = '#333';
    switch(type) {
        case 'Movies': icon = '🎬'; bgColor = '#2c3e50'; break;
        case 'TVShows': icon = '📺'; bgColor = '#8e44ad'; break;
        case 'Books': icon = '📚'; bgColor = '#d35400'; break;
        case 'Articles': icon = '📝'; bgColor = '#16a085'; break;
        case 'Music': icon = '🎵'; bgColor = '#2980b9'; break;
        default: icon = '🖼️'; bgColor = '#34495e'; break;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <text x="50%" y="40%" font-size="80" text-anchor="middle" dominant-baseline="middle">${icon}</text>
        <text x="50%" y="60%" font-size="28" fill="white" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${title.substring(0, 20)}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function renderGallery(container, filter, query = '') {
    container.innerHTML = ''; // Clear current gallery

    let filteredPosters = POSTERS.filter(item => {
        const type = typeof item === 'string' ? 'Movies' : (item.type || 'Movies');
        let filename = typeof item === 'string' ? item : (item.poster || '');
        let title = (item.title || filename.replace(/\.(png|jpe?g|gif|webp)$/i, ''));
        
        let matchFilter = false;
        if (filter === 'EveryTing') matchFilter = true;
        else if (filter === 'All') matchFilter = (type === 'Movies' || type === 'TVShows');
        else matchFilter = (type === filter);

        if (!matchFilter) return false;

        if (query) {
            return title.toLowerCase().includes(query.toLowerCase());
        }
        return true;
    });

    filteredPosters.forEach(item => {
        let title = '';
        let imgSrc = '';
        let rating = null;

        if (typeof item === 'string') {
            title = item.replace(/\.(png|jpe?g|gif|webp)$/i, '');
            imgSrc = `assets/Posters/${item}`;
        } else {
            title = item.title || (item.poster ? item.poster.replace(/\.(png|jpe?g|gif|webp)$/i, '') : 'Untitled');
            const itemType = item.type || 'Movies';
            if (item.poster) {
                imgSrc = `assets/Posters/${item.poster}`;
            } else {
                imgSrc = getDefaultImage(itemType, title);
            }
            rating = item.rating || null;
        }

        const div = document.createElement('div');
        div.className = 'poster-item';

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = title;
        img.draggable = false;

        // Rating element
        if (rating) {
            const ratingEl = document.createElement('div');
            ratingEl.className = 'poster-rating';
            ratingEl.innerHTML = `★ ${rating}`;
            div.appendChild(ratingEl);
        }

        const overlay = document.createElement('div');
        overlay.className = 'poster-overlay';

        const titleEl = document.createElement('div');
        titleEl.className = 'poster-title';
        titleEl.textContent = title;

        overlay.appendChild(titleEl);
        div.appendChild(img);
        div.appendChild(overlay);

        container.appendChild(div);
    });

    // Reset container scroll
    container.scrollTo({ left: 0, behavior: 'instant' });

    // Initial state setup and center first item
    requestAnimationFrame(() => {
        checkActiveItem(container);

        setTimeout(() => {
            const items = container.querySelectorAll('.poster-item');
            if (items.length > 0) {
                const firstItem = items[0];
                const containerCenter = container.getBoundingClientRect().width / 2;
                const itemCenter = firstItem.offsetWidth / 2;
                container.scrollTo({
                    left: firstItem.offsetLeft - containerCenter + itemCenter,
                    behavior: 'smooth'
                });
            }
        }, 100);
    });
}

function checkActiveItem(container) {
    const items = container.querySelectorAll('.poster-item');
    if (items.length === 0) return;

    const containerCenter = container.getBoundingClientRect().width / 2;
    let closestItem = null;
    let minDistance = Infinity;

    items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenter - itemCenter);

        if (distance < minDistance) {
            minDistance = distance;
            closestItem = item;
        }
    });

    items.forEach(item => {
        if (item === closestItem) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function initEvents(container) {
    // Scroll snapping and centering update logic
    container.addEventListener('scroll', () => {
        requestAnimationFrame(() => checkActiveItem(container));
    });

    // Mouse drag swiping functionality
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        container.style.scrollSnapType = 'none';
    });

    container.addEventListener('mouseleave', () => {
        if (!isDown) return;
        isDown = false;
        container.style.scrollSnapType = 'x mandatory';
    });

    container.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        container.style.scrollSnapType = 'x mandatory';

        container.scrollBy({ left: 1, behavior: 'auto' });
        container.scrollBy({ left: -1, behavior: 'auto' });
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    });

    // Vertical wheel to horizontal scroll mapping
    container.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            container.scrollBy({
                left: e.deltaY * 3,
                behavior: 'smooth'
            });
        }
    }, { passive: false });
}

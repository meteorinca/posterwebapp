document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('carousel');
    const navLinks = document.querySelectorAll('#filter-nav a');

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
            renderGallery(container, filter);
        });
    });
});

function renderGallery(container, filter) {
    container.innerHTML = ''; // Clear current gallery

    let filteredPosters = POSTERS.filter(item => {
        const type = typeof item === 'string' ? 'Movies' : (item.type || 'Movies');
        if (filter === 'EveryTing') return true;
        if (filter === 'All') return type === 'Movies' || type === 'TVShows';
        return type === filter;
    });

    filteredPosters.forEach(item => {
        let filename = typeof item === 'string' ? item : item.poster;
        let title = filename.replace(/\.(png|jpe?g|gif|webp)$/i, '');

        const div = document.createElement('div');
        div.className = 'poster-item';

        const img = document.createElement('img');
        img.src = `assets/Posters/${filename}`;
        img.alt = title;
        img.draggable = false;

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

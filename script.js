document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('carousel');

    // Dynamically build the gallery from POSTERS array
    POSTERS.forEach(filename => {
        // Extract title: remove extensions
        let title = filename.replace(/\.(png|jpe?g)$/i, '');
        // Optional: Replace hyphens/underscores with spaces
        // title = title.replace(/[-_]/g, ' ');

        const item = document.createElement('div');
        item.className = 'poster-item';

        const img = document.createElement('img');
        img.src = `assets/Posters/${filename}`;
        img.alt = title;
        // Prevent default drag behaviors to make custom mouse scrolling work properly
        img.draggable = false;

        const overlay = document.createElement('div');
        overlay.className = 'poster-overlay';

        const titleEl = document.createElement('div');
        titleEl.className = 'poster-title';
        titleEl.textContent = title;

        overlay.appendChild(titleEl);
        item.appendChild(img);
        item.appendChild(overlay);

        container.appendChild(item);
    });

    setupCarousel(container);
});

function setupCarousel(container) {
    const items = document.querySelectorAll('.poster-item');
    if (items.length === 0) return;

    // Handle Active state
    const checkActiveItem = () => {
        const containerCenter = container.getBoundingClientRect().width / 2;
        let closestItem = null;
        let minDistance = Infinity;

        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            // Need the center of the item relative to viewport
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
    };

    // Scroll snapping and centering update logic
    container.addEventListener('scroll', () => {
        requestAnimationFrame(checkActiveItem);
    });

    // Mouse drag swiping functionality
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        // Temporarily disable scroll snap to allow smooth dragging
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
        // Re-enable scroll snap which causes it to securely snap perfectly to a poster
        container.style.scrollSnapType = 'x mandatory';

        // Minor trick to trigger snap layout algorithm again after setting style
        container.scrollBy({ left: 1, behavior: 'auto' });
        container.scrollBy({ left: -1, behavior: 'auto' });
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // scroll speed multiplier
        container.scrollLeft = scrollLeft - walk;
    });

    // Vertical wheel to horizontal scroll mapping
    container.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            // Move horizontally map deltaY directly to scrollLeft
            // Smooth natural behavior natively managed by browser physics
            container.scrollBy({
                left: e.deltaY * 3,
                behavior: 'smooth'
            });
        }
    }, { passive: false });


    // Initial state setup
    checkActiveItem();

    // Position scrolling so the first item naturally falls to the center initially
    setTimeout(() => {
        // Find padding values and calculate proper first align
        const firstItem = items[0];
        const containerCenter = container.getBoundingClientRect().width / 2;
        const itemCenter = firstItem.offsetWidth / 2;
        container.scrollTo({
            left: firstItem.offsetLeft - containerCenter + itemCenter,
            behavior: 'smooth'
        });
    }, 100);
}

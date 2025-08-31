document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const header = document.querySelector('.hero');
    const footer = document.querySelector('.site-footer');
    const searchInput = document.getElementById('search-input');
    const categoryFiltersContainer = document.getElementById('category-filters');
    const reservationForm = document.getElementById('reservation-form');
    const reservationMessage = document.getElementById('reservation-message');
    const viewMenuBtn = document.getElementById('view-menu');

    let allMenuItems = []; // This will store all menu items fetched from Supabase

    // --- Animation Functions ---
    function animatePageLoad() {
        if (header) header.classList.add('animate-header-slide-down');
        if (footer) setTimeout(() => footer.classList.add('animate-footer-slide-up'), 200);
    }

    function triggerContentAnimations(section) {
        // Remove existing animation classes to allow re-triggering
        const animatedElements = section.querySelectorAll('[data-animation]');
        animatedElements.forEach(el => {
            el.className = el.className.replace(/animate-.*?(\s|$)/g, ' ').trim(); // Remove specific animation classes
            el.style.opacity = '0'; // Reset opacity for re-animation
        });
        
        // Trigger new animations with a slight delay
        setTimeout(() => {
            let delay = 0;
            animatedElements.forEach(el => {
                const animationType = el.getAttribute('data-animation');
                if (animationType) { // Ensure data-animation attribute exists
                    el.style.animationDelay = `${delay}s`;
                    el.classList.add(`animate-${animationType}`);
                    el.style.opacity = '1'; // Ensure opacity is set to 1 by the animation
                    delay += 0.15;
                }
            });
        }, 50); // Small delay to ensure class removal and opacity reset take effect
    }

    // --- Section Display Logic ---
    function showSection(sectionId, isInitialLoad = false) {
        sections.forEach(section => {
            section.style.display = 'none'; // Hide all sections
            // Also remove animation classes when hiding to prevent re-animation on redisplay
            section.querySelectorAll('[data-animation]').forEach(el => {
                el.className = el.className.replace(/animate-.*?(\s|$)/g, ' ').trim();
                el.style.opacity = '0'; // Reset opacity when hidden
            });
        });
        
        const sectionToShow = document.getElementById(sectionId);
        if (sectionToShow) {
            sectionToShow.style.display = 'block'; // Show the target section

            // Trigger animations for the newly shown section
            triggerContentAnimations(sectionToShow);

            // Special handling for the menu section
            if (sectionId === 'menu') {
                initializeMenu();
            }
        }
    }

    // --- Menu Functionality ---
    function animateMenuItems(items) {
        const menuGrid = document.getElementById('menu-items');
        if (!menuGrid) return; // Guard against menuGrid not existing

        const gridRect = menuGrid.getBoundingClientRect();
        const gridCenter = gridRect.left + gridRect.width / 2;
        let delay = 0;

        items.forEach(item => {
            // Reset existing animation classes and opacity before applying new ones
            item.className = 'menu-item'; // Reset to base class
            item.style.opacity = '0'; // Reset opacity for re-animation
            item.style.animationDelay = `${delay}s`;

            // Apply animation based on screen size or item position
            if (window.innerWidth <= 768) {
                item.classList.add('animate-slide-up');
            } else {
                const itemCenter = item.getBoundingClientRect().left + item.offsetWidth / 2;
                item.classList.add(itemCenter < gridCenter ? 'animate-slide-left' : 'animate-slide-right');
            }
            delay += 0.08; // Slightly faster animation delay for grid items
        });
    }

    function renderFilteredItems(items) {
        const menuGrid = document.getElementById('menu-items');
        menuGrid.innerHTML = ''; // Clear previous items

        if (items.length === 0) {
            menuGrid.innerHTML = '<p class="menu-item-title" style="text-align: center; grid-column: 1 / -1; opacity: 1;">No items match your filter.</p>';
            return;
        }

        let menuHtml = '';
        items.forEach(item => {
            menuHtml += `
                <div class="menu-item" data-animation="slide-up"> <!-- Add data-animation here for individual item animation -->
                    <img src="${item.image}" class="menu-item-img" alt="${item.name}">
                    <div class="menu-item-title">${item.name}</div>
                    <div class="menu-item-desc">${item.description}</div>
                    <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                </div>
            `;
        });
        menuGrid.innerHTML = menuHtml;
        // Animate the newly rendered items
        setTimeout(() => animateMenuItems(menuGrid.querySelectorAll('.menu-item')), 50);
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeButton = categoryFiltersContainer.querySelector('.filter-btn.active');
        const selectedCategory = activeButton ? activeButton.dataset.category : 'all'; // Default to 'all' if no button is active

        const filteredItems = allMenuItems.filter(item => {
            const matchesCategory = selectedCategory === 'all' || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        renderFilteredItems(filteredItems);
    }

    function populateCategoryButtons() {
        if (allMenuItems.length === 0) return;
        
        // Extract unique categories, convert to lowercase, sort, and add 'all'
        const categories = ['all', ...new Set(allMenuItems.map(item => item.category ? item.category.toLowerCase() : '').filter(Boolean).sort())];
        
        categoryFiltersContainer.innerHTML = ''; // Clear existing buttons

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.category = category;
            button.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter

            if (category === 'all') {
                button.classList.add('active'); // 'All' button is active by default
            }

            button.addEventListener('click', () => {
                const currentActive = categoryFiltersContainer.querySelector('.active');
                if (currentActive) currentActive.classList.remove('active');
                button.classList.add('active');
                applyFilters(); // Re-apply filters when category changes
            });
            categoryFiltersContainer.appendChild(button);
        });
    }

    async function initializeMenu() {
        const menuGrid = document.getElementById('menu-items');
        if (menuGrid) {
            menuGrid.innerHTML = '<p style="text-align: center; color: #ffd800; grid-column: 1 / -1;">Loading menu items...</p>';
        }
        
        allMenuItems = await fetchMenuItems(); // Fetch from supabase.js
        if (allMenuItems && allMenuItems.length > 0) {
            populateCategoryButtons();
            applyFilters(); // Initial render of all items
        } else {
            if (menuGrid) menuGrid.innerHTML = '<p style="text-align: center; color: #ffd800; grid-column: 1 / -1;">Failed to load menu items.</p>';
        }
        
        // Ensure search input listener is only added once
        searchInput.removeEventListener('input', applyFilters); 
        searchInput.addEventListener('input', applyFilters);
    }

    // --- Reservation Form Handling ---
    if (reservationForm) {
        reservationForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            const name = document.getElementById('res-name').value;
            const date = document.getElementById('res-date').value;
            const time = document.getElementById('res-time').value;
            const guests = parseInt(document.getElementById('res-guests').value, 10);

            reservationMessage.textContent = 'Submitting reservation...';
            reservationMessage.className = 'form-message'; // Reset message styling

            // Assuming createReservation is available from supabase.js
            const result = await createReservation(name, date, time, guests);

            if (result) {
                reservationMessage.textContent = 'Reservation successful! We look forward to seeing you.';
                reservationMessage.classList.add('success');
                reservationForm.reset(); // Clear the form
            } else {
                reservationMessage.textContent = 'Failed to make reservation. Please try again.';
                reservationMessage.classList.add('error');
            }
            // Remove message after 5 seconds
            setTimeout(() => {
                reservationMessage.textContent = '';
                reservationMessage.className = 'form-message';
            }, 5000);
        });
    }


    // --- Event Listeners and Initial Load ---
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('href').replace('#', ''); // Get target section ID
            showSection(targetId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    if (viewMenuBtn) {
        viewMenuBtn.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            const menuLink = document.getElementById('menu-link'); // Corrected ID
            if (menuLink) menuLink.classList.add('active');
            
            showSection('menu'); // Corrected section ID
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Initial page load animations and display 'welcome' section
    animatePageLoad();
    showSection('welcome', true); // Show the welcome section on initial load
});
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const gridItems = document.querySelectorAll('.grid-item');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuBtn = document.querySelector('.menu-btn');
    const categoryFilters = document.querySelector('.category-filters');
    let currentFilter = 'all';

    // Toggle menu
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        categoryFilters.classList.toggle('show');
        // Add arrow based on menu state
        const arrow = categoryFilters.classList.contains('show') ? '▲' : '▼';
        // Keep the current filter text
        menuBtn.textContent = `${getCurrentFilterText()} ${arrow}`;
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!categoryFilters.contains(e.target) && !menuBtn.contains(e.target)) {
            categoryFilters.classList.remove('show');
            menuBtn.textContent = `${getCurrentFilterText()} ▼`;
        }
    });

    // Filter button click handlers
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            filterProjects();
            
            // Update menu button text with current selection
            menuBtn.textContent = `${this.textContent} ▼`;
            categoryFilters.classList.remove('show');
        });
    });

    // Helper function to get current filter text
    function getCurrentFilterText() {
        const activeFilter = document.querySelector('.filter-btn.active');
        return activeFilter ? activeFilter.textContent : 'Options';
    }

    // Search input handler
    searchInput.addEventListener('input', filterProjects);

    function filterProjects() {
        const searchTerm = searchInput.value.toLowerCase();

        gridItems.forEach(item => {
            if (!item.href || item.href === '#') return; // Skip empty grid items
            
            const originalText = item.textContent.trim();
            const itemText = originalText.toLowerCase();
            const isPython = itemText.includes('python');
            const isWebTech = itemText.includes('html') || itemText.includes('css') || itemText.includes('js');
            
            let shouldShow = true;

            // Filter by category
            if (currentFilter === 'python' && !isPython) shouldShow = false;
            if (currentFilter === 'html' && !isWebTech) shouldShow = false;

            // Filter by search term
            if (searchTerm && !itemText.includes(searchTerm)) shouldShow = false;

            if (shouldShow) {
                if (searchTerm) {
                    // Highlight search matches
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    const highlightedText = originalText.replace(regex, '<span style="color: #b74b4b; font-weight: bold;">$1</span>');
                    item.innerHTML = highlightedText;
                } else {
                    item.innerHTML = originalText;
                }
                item.style.display = '';
            } else {
                item.innerHTML = originalText;
                item.style.display = 'none';
            }
        });
    }
});

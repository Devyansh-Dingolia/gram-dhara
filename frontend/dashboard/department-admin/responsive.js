const navToggle = document.querySelector('.mobile-nav-toggle');

navToggle.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');

    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    
    if (navToggle && sidebar) {
        sidebar.classList.toggle('active');
        navToggle.classList.toggle('active');
    }
});
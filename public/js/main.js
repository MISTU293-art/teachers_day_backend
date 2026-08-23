document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarClose = document.getElementById('sidebarClose');

  function openSidebar() {
    sidebar && sidebar.classList.add('show');
    sidebarOverlay && sidebarOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar && sidebar.classList.remove('show');
    sidebarOverlay && sidebarOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  sidebarToggle && sidebarToggle.addEventListener('click', openSidebar);
  sidebarClose && sidebarClose.addEventListener('click', closeSidebar);
  sidebarOverlay && sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) closeSidebar();
  });

  // Auto-dismiss alerts after 5 seconds
  document.querySelectorAll('.alert-dismissible').forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.4s';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 420);
    }, 5000);
  });

  // Highlight active sidebar link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (currentPath === href || (href !== '/' && currentPath.startsWith(href)))) {
      link.classList.add('active');
      link.style.color = '';  // reset any inline color overrides
    }
  });
});

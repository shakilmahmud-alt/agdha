document.addEventListener('DOMContentLoaded', () => {
  const totalPages = 3;
  let currentPage = 1;
  let currentZoom = 1;

  // DOM Elements
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const pageCounter = document.getElementById('pageCounter');
  const pageDots = document.querySelectorAll('.page-dot');
  const pages = document.querySelectorAll('.document-page');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // Initialize page from URL hash if present
  function initPageFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/#page-(d+)/) || hash.match(/#(d+)/);
    if (match && match[1]) {
      const p = parseInt(match[1], 10);
      if (p >= 1 && p <= totalPages) {
        currentPage = p;
      }
    }
  }

  // Update View
  function renderPage() {
    // Reset zoom when navigating
    resetZoom();

    // Show active page, hide others
    pages.forEach((pageEl, idx) => {
      const pageNum = idx + 1;
      if (pageNum === currentPage) {
        pageEl.classList.add('active');
      } else {
        pageEl.classList.remove('active');
      }
    });

    // Arrow Visibility Rules:
    // Page 1: Only NEXT arrow (PREV hidden)
    // Page 2: BOTH PREV and NEXT arrows visible
    // Page 3: Only PREV arrow (NEXT hidden)
    if (currentPage === 1) {
      if (prevBtn) prevBtn.classList.add('hidden');
      if (nextBtn) nextBtn.classList.remove('hidden');
    } else if (currentPage === 2) {
      if (prevBtn) prevBtn.classList.remove('hidden');
      if (nextBtn) nextBtn.classList.remove('hidden');
    } else if (currentPage === 3) {
      if (prevBtn) prevBtn.classList.remove('hidden');
      if (nextBtn) nextBtn.classList.add('hidden');
    }

    // Update Counter badge
    if (pageCounter) {
      pageCounter.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    // Update Pagination Dots
    pageDots.forEach((dot, idx) => {
      if (idx + 1 === currentPage) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update URL hash without jumping
    history.replaceState(null, '', `#page-${currentPage}`);

    // Scroll to top of document smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToPage(targetPage) {
    if (targetPage >= 1 && targetPage <= totalPages) {
      currentPage = targetPage;
      renderPage();
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  // Zoom controls
  function applyZoom() {
    const activeImg = document.querySelector('.document-page.active .page-display-img');
    if (activeImg) {
      activeImg.style.transform = `scale(${currentZoom})`;
      if (currentZoom > 1) {
        activeImg.classList.add('zoomed');
      } else {
        activeImg.classList.remove('zoomed');
      }
    }
  }

  function zoomIn() {
    if (currentZoom < 2.5) {
      currentZoom = Math.min(2.5, currentZoom + 0.25);
      applyZoom();
    }
  }

  function zoomOut() {
    if (currentZoom > 0.75) {
      currentZoom = Math.max(0.75, currentZoom - 0.25);
      applyZoom();
    }
  }

  function resetZoom() {
    currentZoom = 1;
    applyZoom();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Event Listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevPage();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextPage();
    });
  }

  pageDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const pageNum = parseInt(dot.getAttribute('data-page'), 10);
      if (pageNum) goToPage(pageNum);
    });
  });

  if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Click image to toggle zoom
  pages.forEach(p => {
    const img = p.querySelector('.page-display-img');
    if (img) {
      img.addEventListener('click', () => {
        if (currentZoom === 1) {
          currentZoom = 1.6;
        } else {
          currentZoom = 1;
        }
        applyZoom();
      });
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      nextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      prevPage();
    } else if (e.key === 'Home') {
      goToPage(1);
    } else if (e.key === 'End') {
      goToPage(totalPages);
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  });

  // Touch swipe gesture support
  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Horizontal swipe threshold: 50px, more horizontal than vertical
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swipe Left -> Next
        nextPage();
      } else {
        // Swipe Right -> Prev
        prevPage();
      }
    }
  }, { passive: true });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    initPageFromHash();
    renderPage();
  });

  // Initial render
  initPageFromHash();
  renderPage();
});

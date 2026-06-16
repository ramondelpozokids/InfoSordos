document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initActiveNavLinks();
  initMobileMenu();
  initScrollToTop();
  initStatsCounter();
  initVideoFacades();
  initBlogFilter();
});

/**
 * Sticky Header Scroll State Changer
 */
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('bg-background/80', 'backdrop-blur-md', 'border-b', 'border-border/60', 'shadow-sm');
      header.classList.remove('bg-transparent');
    } else {
      header.classList.remove('bg-background/80', 'backdrop-blur-md', 'border-b', 'border-border/60', 'shadow-sm');
      header.classList.add('bg-transparent');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Trigger once on load
}

/**
 * Automatically sets active classes on nav links matching the current location
 */
function initActiveNavLinks() {
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";

  const navLinks = document.querySelectorAll('header nav a, #mobile-menu nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Check if path matches or if it's root
    const isActive = href === page || 
                     (page === "" && href === "index.html") || 
                     (page === "index.html" && href === "index.html");

    if (isActive) {
      link.classList.add('text-primary', 'font-semibold');
      link.classList.remove('text-muted-foreground');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('text-primary', 'font-semibold');
      link.classList.add('text-muted-foreground');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Fully Accessible Mobile Menu (WCAG 2.2 AA)
 * - Traps keyboard focus inside the menu when open
 * - Closes on Escape key press
 * - Updates aria-expanded attributes
 */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  const menuLinks = menu.querySelectorAll('a, button');
  const firstFocusable = btn;
  const lastFocusable = menuLinks.length ? menuLinks[menuLinks.length - 1] : btn;

  let isOpen = false;

  const toggleMenu = (shouldOpen) => {
    isOpen = shouldOpen !== undefined ? shouldOpen : !isOpen;
    btn.setAttribute('aria-expanded', isOpen.toString());
    
    if (isOpen) {
      menu.classList.remove('hidden');
      // Slide/fade animation triggers
      setTimeout(() => {
        menu.classList.add('opacity-100', 'translate-y-0');
        menu.classList.remove('opacity-0', '-translate-y-4');
      }, 10);
      document.body.classList.add('overflow-hidden'); // Prevent background scroll
    } else {
      menu.classList.add('opacity-0', '-translate-y-4');
      menu.classList.remove('opacity-100', 'translate-y-0');
      // Wait for transitions
      setTimeout(() => {
        menu.classList.add('hidden');
      }, 300);
      document.body.classList.remove('overflow-hidden');
    }
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking a link
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Handle Keyboard Accessibility
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;

    // Close on Escape
    if (e.key === 'Escape') {
      toggleMenu(false);
      btn.focus();
    }

    // Trap focus inside menu
    if (e.key === 'Tab') {
      if (e.shiftKey) { // Shift + Tab (backward)
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else { // Tab (forward)
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (isOpen && !menu.contains(e.target) && !btn.contains(e.target)) {
      toggleMenu(false);
    }
  });
}

/**
 * Accessible Scroll-To-Top Button
 */
function initScrollToTop() {
  const btn = document.getElementById('scroll-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Stats Counter Animation using IntersectionObserver and requestAnimationFrame
 */
function initStatsCounter() {
  const counters = document.querySelectorAll('[data-counter-target]');
  if (counters.length === 0) return;

  const animateCounter = (el) => {
    const targetString = el.getAttribute('data-counter-target');
    const hasPlus = targetString.includes('+');
    const hasK = targetString.includes('K');
    const hasPercent = targetString.includes('%');
    
    // Parse target number
    let target = parseFloat(targetString.replace(/[+K%]/g, ''));
    if (isNaN(target)) return;

    let start = 0;
    const duration = 1500; // 1.5 seconds animation
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (easeOutQuad)
      const ease = progress * (2 - progress);
      const current = ease * target;

      // Format display
      let formattedVal = Math.floor(current);
      if (target % 1 !== 0) {
        formattedVal = current.toFixed(1);
      }

      if (hasK) formattedVal += 'K';
      if (hasPlus) formattedVal += '+';
      if (hasPercent) formattedVal += '%';

      el.textContent = formattedVal;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        // Final value override to match exact target format
        el.textContent = targetString;
      }
    };

    window.requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(counter => observer.observe(counter));
}

/**
 * Facade pattern for YouTube embeds to maximize PageSpeed scores
 * - Renders preview image and play button.
 * - Mounts iframe ONLY when the user clicks the card or presses Enter.
 */
function initVideoFacades() {
  const facades = document.querySelectorAll('[data-video-facade]');
  facades.forEach(facade => {
    const videoId = facade.getAttribute('data-video-id');
    if (!videoId) return;

    const playVideo = () => {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1`);
      iframe.setAttribute('title', 'Vídeo explicativo en Lengua de Signos Española (LSE)');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.classList.add('w-full', 'h-full', 'absolute', 'inset-0', 'rounded-2xl', 'z-20');
      
      // Clear facade container and load video
      facade.innerHTML = '';
      facade.appendChild(iframe);
      facade.classList.remove('cursor-pointer');
      facade.removeAttribute('tabindex');
    };

    facade.addEventListener('click', playVideo);
    facade.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playVideo();
      }
    });
  });
}

/**
 * Filter blog articles by category using URL synchronisation
 */
function initBlogFilter() {
  const filterButtons = document.querySelectorAll('[data-blog-filter]');
  const articles = document.querySelectorAll('[data-blog-article]');
  if (filterButtons.length === 0 || articles.length === 0) return;

  const filterCategory = (category) => {
    // Update active button states
    filterButtons.forEach(btn => {
      if (btn.getAttribute('data-blog-filter') === category) {
        btn.classList.add('bg-primary', 'text-primary-foreground');
        btn.classList.remove('bg-card', 'text-muted-foreground', 'border-border/80');
      } else {
        btn.classList.remove('bg-primary', 'text-primary-foreground');
        btn.classList.add('bg-card', 'text-muted-foreground', 'border-border/80');
      }
    });

    // Show/hide articles with simple CSS animations
    articles.forEach(article => {
      const artCategory = article.getAttribute('data-blog-category');
      if (category === 'all' || artCategory === category) {
        article.classList.remove('hidden');
        setTimeout(() => {
          article.classList.add('opacity-100', 'scale-100');
          article.classList.remove('opacity-0', 'scale-95');
        }, 10);
      } else {
        article.classList.add('hidden', 'opacity-0', 'scale-95');
        article.classList.remove('opacity-100', 'scale-100');
      }
    });
  };

  // Bind click event to filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-blog-filter');
      const url = new URL(window.location);
      if (category === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', category);
      }
      window.history.pushState({}, '', url);
      filterCategory(category);
    });
  });

  // Check initial URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    filterCategory(categoryParam);
  } else {
    filterCategory('all');
  }
}

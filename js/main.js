/**
 * VISHY Supported Housing Website - Main JavaScript
 * Handles mobile menu, carousel, smooth scrolling, and accessibility features
 */

(function() {
  'use strict';

  // ========================================
  // Utility Functions
  // ========================================
  
  /**
   * Debounce function to limit execution rate
   * @param {Function} func - Function to debounce
   * @param {number} wait - Milliseconds to wait
   * @returns {Function} - Debounced function
   */
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

  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ========================================
  // Mobile Menu
  // ========================================
  
  function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!menuToggle.contains(event.target) && 
          !navMenu.contains(event.target) && 
          navMenu.classList.contains('active')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && navMenu.classList.contains('active')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle.focus();
      }
    });
  }

  // ========================================
  // Header Scroll Effect
  // ========================================
  
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY;
      
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    // Initial check
    updateHeader();
  }

  // ========================================
  // Smooth Scrolling
  // ========================================
  
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();

        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });

        // Update URL without jumping
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  // ========================================
  // Testimonials Carousel
  // ========================================
  
  function initTestimonialsCarousel() {
    const track = document.getElementById('testimonials-track');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!track || !prevBtn || !nextBtn || dots.length === 0) return;

    let currentIndex = 0;
    const totalSlides = dots.length;
    let autoplayInterval;
    const autoplayDelay = 5000;

    function updateCarousel() {
      const slideWidth = track.children[0].offsetWidth;
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
        dot.setAttribute('aria-selected', index === currentIndex);
      });

      // Update button states
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === totalSlides - 1;
    }

    function goToSlide(index) {
      if (index < 0) index = 0;
      if (index >= totalSlides) index = totalSlides - 1;
      currentIndex = index;
      updateCarousel();
    }

    function nextSlide() {
      goToSlide((currentIndex + 1) % totalSlides);
    }

    function prevSlide() {
      goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
    }

    // Event listeners
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToSlide(index);
        resetAutoplay();
      });
    });

    // Keyboard navigation
    track.parentElement.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        resetAutoplay();
      }
    });

    // Autoplay
    function startAutoplay() {
      if (prefersReducedMotion()) return;
      autoplayInterval = setInterval(nextSlide, autoplayDelay);
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Pause on hover/focus
    const carousel = track.parentElement;
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    // Handle window resize
    window.addEventListener('resize', debounce(updateCarousel, 250));

    // Initialize
    updateCarousel();
    startAutoplay();
  }

  // ========================================
  // Active Navigation Link
  // ========================================
  
  function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    function setActiveLink() {
      const scrollY = window.pageYOffset;
      const headerOffset = 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop - headerOffset;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', debounce(setActiveLink, 100), { passive: true });
    setActiveLink();
  }

  // ========================================
  // Contact Form
  // ========================================
  
  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Basic validation
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
          
          // Add error message
          let errorMsg = field.parentElement.querySelector('.error-message');
          if (!errorMsg) {
            errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'This field is required';
            errorMsg.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
            field.parentElement.appendChild(errorMsg);
          }
        } else {
          field.classList.remove('error');
          const errorMsg = field.parentElement.querySelector('.error-message');
          if (errorMsg) errorMsg.remove();
        }
      });

      if (!isValid) return;

      // Email validation
      const emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value)) {
          emailField.classList.add('error');
          alert('Please enter a valid email address');
          return;
        }
      }

      // Success - in real implementation, send to server
      // For now, show success message
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Simulate form submission
      setTimeout(() => {
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.backgroundColor = '#10B981';
        
        form.reset();
        
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.style.backgroundColor = '';
        }, 3000);
      }, 1500);

      // Log form data (for development)
      console.log('Form submitted:', data);
    });

    // Clear error state on input
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', function() {
        this.classList.remove('error');
        const errorMsg = this.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      });
    });
  }

  // ========================================
  // FAQ Accordion Enhancement
  // ========================================
  
  function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const summary = item.querySelector('.faq-question');
      
      if (!summary) return;

      // Add animation for smooth opening/closing
      summary.addEventListener('click', function() {
        // Close other items (optional - for accordion behavior)
        // Uncomment the following lines if you want only one item open at a time
        /*
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.open) {
            otherItem.open = false;
          }
        });
        */
      });
    });
  }

  // ========================================
  // Intersection Observer for Animations
  // ========================================
  
  function initScrollAnimations() {
    if (prefersReducedMotion()) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
      '.about-card, .service-card, .step, .impact-stat'
    );

    animatedElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });

    // Add visible class style
    const style = document.createElement('style');
    style.textContent = `
      .animate-on-scroll.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // Focus Management
  // ========================================
  
  function initFocusManagement() {
    // Skip to content focus
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', function(e) {
        const main = document.getElementById('main-content');
        if (main) {
          e.preventDefault();
          main.setAttribute('tabindex', '-1');
          main.focus();
          main.removeAttribute('tabindex');
        }
      });
    }

    // Trap focus in modal/mobile menu when open
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', function() {
        const isOpen = navMenu.classList.contains('active');
        if (isOpen) {
          const firstLink = navMenu.querySelector('a');
          if (firstLink) firstLink.focus();
        }
      });
    }
  }

  // ========================================
  // Performance: Lazy Loading Images (if any)
  // ========================================
  
  function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        img.src = img.dataset.src;
      });
    }
  }

  // ========================================
  // Initialize Everything
  // ========================================
  
  function init() {
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
    initTestimonialsCarousel();
    initActiveNavigation();
    initContactForm();
    initFAQAccordion();
    initScrollAnimations();
    initFocusManagement();
    initLazyLoading();

    // Add loaded class to body for any CSS transitions
    document.body.classList.add('loaded');

    console.log('VISHY website initialized successfully');
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize on dynamic content changes (if needed in future)
  window.VISHY = {
    reinit: init
  };

})();
'use strict';

/**
 * Portfolio Website - Main JavaScript
 * Handles: scroll animations, form validation, mobile nav, 
 * portfolio filtering, back-to-top, and active page indicator.
 */

(function () {
  // ============================================
  // UTILITIES
  // ============================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function announce(message) {
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.textContent = '';
      // Small delay to ensure screen readers pick up the change
      setTimeout(function () {
        announcer.textContent = message;
      }, 100);
    }
  }

  // ============================================
  // INTERSECTION OBSERVER - Scroll Animations
  // ============================================
  function initScrollAnimations() {
    if (prefersReducedMotion) {
      // Make all elements visible immediately
      document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ============================================
  // MOBILE NAVIGATION
  // ============================================
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    function openNav() {
      toggle.setAttribute('aria-expanded', 'true');
      nav.classList.add('is-open');
      overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';

      // Focus first nav link
      var firstLink = nav.querySelector('.nav-link');
      if (firstLink) firstLink.focus();
    }

    function closeNav() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
      toggle.focus();
    }

    function isNavOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    toggle.addEventListener('click', function () {
      if (isNavOpen()) {
        closeNav();
      } else {
        openNav();
      }
    });

    overlay.addEventListener('click', function () {
      closeNav();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isNavOpen()) {
        closeNav();
      }
    });

    // Focus trap within open nav
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !isNavOpen()) return;

      var focusableElements = nav.querySelectorAll('a, button');
      var allFocusable = [toggle].concat(Array.from(focusableElements));
      var firstFocusable = allFocusable[0];
      var lastFocusable = allFocusable[allFocusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });

    // Close nav on nav link click (mobile)
    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (isNavOpen()) {
          closeNav();
        }
      });
    });
  }

  // ============================================
  // ACTIVE PAGE INDICATOR
  // ============================================
  function initActivePageIndicator() {
    var currentPath = window.location.pathname;
    var filename = currentPath.split('/').pop() || 'index.html';
    if (filename === '') filename = 'index.html';

    document.querySelectorAll('.nav-link').forEach(function (link) {
      // Remove existing aria-current
      link.removeAttribute('aria-current');

      var href = link.getAttribute('href');
      if (href === filename || (filename === 'index.html' && href === './')) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  // ============================================
  // CONTACT FORM VALIDATION
  // ============================================
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var fields = {
      name: {
        element: document.getElementById('contact-name'),
        errorEl: document.getElementById('name-error'),
        validate: function (value) {
          if (!value.trim()) return 'Please enter your full name.';
          if (value.trim().length < 2) return 'Name must be at least 2 characters.';
          return '';
        }
      },
      email: {
        element: document.getElementById('contact-email'),
        errorEl: document.getElementById('email-error'),
        validate: function (value) {
          if (!value.trim()) return 'Please enter your email address.';
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
          return '';
        }
      },
      subject: {
        element: document.getElementById('contact-subject'),
        errorEl: document.getElementById('subject-error'),
        validate: function (value) {
          if (!value) return 'Please select a subject.';
          return '';
        }
      },
      message: {
        element: document.getElementById('contact-message'),
        errorEl: document.getElementById('message-error'),
        validate: function (value) {
          if (!value.trim()) return 'Please enter your message.';
          if (value.trim().length < 10) return 'Message must be at least 10 characters.';
          return '';
        }
      }
    };

    function validateField(fieldKey) {
      var field = fields[fieldKey];
      if (!field.element) return true;

      var error = field.validate(field.element.value);
      if (error) {
        field.element.setAttribute('aria-invalid', 'true');
        if (field.errorEl) field.errorEl.textContent = error;
        return false;
      } else {
        field.element.removeAttribute('aria-invalid');
        if (field.errorEl) field.errorEl.textContent = '';
        return true;
      }
    }

    // Real-time validation on blur
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (field.element) {
        field.element.addEventListener('blur', function () {
          validateField(key);
        });

        // Clear error on input
        field.element.addEventListener('input', function () {
          if (field.element.getAttribute('aria-invalid') === 'true') {
            validateField(key);
          }
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var allValid = true;
      var firstInvalid = null;
      var fieldKeys = Object.keys(fields);

      for (var i = 0; i < fieldKeys.length; i++) {
        var isValid = validateField(fieldKeys[i]);
        if (!isValid && !firstInvalid) {
          firstInvalid = fields[fieldKeys[i]].element;
          allValid = false;
        } else if (!isValid) {
          allValid = false;
        }
      }

      if (!allValid) {
        if (firstInvalid) firstInvalid.focus();
        announce('Form has errors. Please correct them and try again.');
        return;
      }

      // Simulate form submission
      var submitBtn = document.getElementById('submit-btn');
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      var formStatus = document.getElementById('form-status');

      // Simulate async submission
      setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }

        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = 'Thank you! Your message has been sent successfully. I\'ll get back to you soon.';
        }

        announce('Message sent successfully. Thank you for reaching out.');
        form.reset();

        // Clear success message after 5 seconds
        setTimeout(function () {
          if (formStatus) {
            formStatus.className = 'form-status';
            formStatus.textContent = '';
          }
        }, 5000);
      }, 1500);
    });
  }

  // ============================================
  // BACK TO TOP BUTTON
  // ============================================
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    function toggleVisibility() {
      if (window.scrollY > 500) {
        btn.hidden = false;
      } else {
        btn.hidden = true;
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href').slice(1);
      var targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();
      targetEl.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      targetEl.focus({ preventScroll: true });
    });
  }

  // ============================================
  // PORTFOLIO FILTER
  // ============================================
  function initPortfolioFilter() {
    var filterBar = document.querySelector('.filter-bar');
    if (!filterBar) return;

    var filterBtns = filterBar.querySelectorAll('.filter-btn');
    var projectCards = document.querySelectorAll('.project-card[data-category]');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        // Update aria-pressed
        filterBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
          b.classList.remove('active');
        });
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('active');

        // Filter projects
        var visibleCount = 0;
        projectCards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.classList.remove('hidden');
            card.style.display = '';
            visibleCount++;
          } else {
            card.classList.add('hidden');
            card.style.display = 'none';
          }
        });

        // Announce to screen readers
        var categoryLabel = btn.textContent.trim();
        announce('Showing ' + visibleCount + ' ' + categoryLabel + ' project' + (visibleCount !== 1 ? 's' : '') + '.');
      });
    });
  }

  // ============================================
  // INITIALIZE
  // ============================================
  document.addEventListener('DOMContentLoaded', function () {
    try {
      initScrollAnimations();
      initMobileNav();
      initActivePageIndicator();
      initContactForm();
      initBackToTop();
      initSmoothScroll();
      initPortfolioFilter();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  });
})();

/**
 * LES'ART GROUP — Multi-Page Interactive Engine
 * Handles Navigation, Sliders, Portfolio Filtering, Lightbox, and WhatsApp Quotes
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // 1. Navigation & Scroll State
  // -------------------------------------------------------------------------
  const siteHeader = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinkItems = document.querySelectorAll('.nav-link');

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        if (siteHeader) {
          if (window.scrollY > 40) {
            siteHeader.classList.add('scrolled');
          } else {
            siteHeader.classList.remove('scrolled');
          }
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // -------------------------------------------------------------------------
  // 2. Hero Cinematic Slider (Home Page)
  // -------------------------------------------------------------------------
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const btnPrev = document.getElementById('heroPrev');
  const btnNext = document.getElementById('heroNext');
  const slideCounter = document.getElementById('heroCurrentIndex');

  if (slides.length > 0) {
    let currentSlide = 0;
    let slideInterval = null;
    const slideDuration = 6000;

    function showSlide(index) {
      slides[currentSlide].classList.remove('active');
      if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');

      if (slideCounter) {
        slideCounter.textContent = `0${currentSlide + 1}`;
      }
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function prevSlide() {
      showSlide(currentSlide - 1);
    }

    function startAutoplay() {
      stopAutoplay();
      slideInterval = setInterval(nextSlide, slideDuration);
    }

    function stopAutoplay() {
      if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
      }
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        nextSlide();
        startAutoplay();
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        prevSlide();
        startAutoplay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
        startAutoplay();
      });
    });

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      let touchStartX = 0;
      let touchEndX = 0;

      heroSection.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
      }, { passive: true });

      heroSection.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
          nextSlide();
        } else if (touchEndX - touchStartX > 50) {
          prevSlide();
        }
        startAutoplay();
      }, { passive: true });

      heroSection.addEventListener('mouseenter', stopAutoplay);
      heroSection.addEventListener('mouseleave', startAutoplay);
    }

    startAutoplay();
  }

  // -------------------------------------------------------------------------
  // 3. Portfolio Filtering Engine (Realisations Page / Section)
  // -------------------------------------------------------------------------
  const mainFilterBtns = document.querySelectorAll('.filter-btn');
  const subFiltersContainer = document.getElementById('subFilters');
  const subFilterBtns = document.querySelectorAll('.sub-btn');
  const workCards = document.querySelectorAll('.work-card');

  if (workCards.length > 0 && mainFilterBtns.length > 0) {
    let activeMainFilter = 'all';
    let activeSubFilter = 'all';

    function applyFilters() {
      workCards.forEach(card => {
        const cardCat = card.dataset.cat;
        const cardSubcat = card.dataset.subcat || '';

        const matchMain = (activeMainFilter === 'all' || cardCat === activeMainFilter);
        const matchSub = (activeMainFilter !== 'photo' || activeSubFilter === 'all' || cardSubcat === activeSubFilter);

        if (matchMain && matchSub) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    }

    mainFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mainFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeMainFilter = btn.dataset.filter;

        if (activeMainFilter === 'photo') {
          if (subFiltersContainer) subFiltersContainer.classList.add('visible');
        } else {
          if (subFiltersContainer) subFiltersContainer.classList.remove('visible');
          activeSubFilter = 'all';
          subFilterBtns.forEach((b, idx) => b.classList.toggle('active', idx === 0));
        }

        applyFilters();
      });
    });

    subFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeSubFilter = btn.dataset.subfilter;
        applyFilters();
      });
    });

    applyFilters();
  }

  // -------------------------------------------------------------------------
  // 4. Fullscreen Lightbox
  // -------------------------------------------------------------------------
  const lightbox = document.getElementById('lightbox');
  const lightboxFrame = document.getElementById('lightboxFrame');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (lightbox && workCards.length > 0) {
    let visibleGalleryItems = [];
    let currentGalleryIndex = -1;

    function getVisibleCards() {
      return Array.from(workCards).filter(c => !c.classList.contains('hidden'));
    }

    function openLightboxAt(index) {
      visibleGalleryItems = getVisibleCards();
      if (index < 0 || index >= visibleGalleryItems.length) return;

      currentGalleryIndex = index;
      const card = visibleGalleryItems[currentGalleryIndex];
      const isVideo = card.hasAttribute('data-embed');
      const title = card.getAttribute('data-title') || card.querySelector('.work-title-label')?.textContent || '';

      if (isVideo) {
        const embedUrl = card.getAttribute('data-embed');
        if (lightboxImg) {
          lightboxImg.style.display = 'none';
          lightboxImg.src = '';
        }
        if (lightboxFrame) {
          lightboxFrame.style.display = 'block';
          lightboxFrame.src = embedUrl;
        }
      } else {
        const img = card.querySelector('img');
        if (lightboxFrame) {
          lightboxFrame.style.display = 'none';
          lightboxFrame.src = '';
        }
        if (lightboxImg) {
          lightboxImg.style.display = 'block';
          lightboxImg.src = img ? img.src : '';
          lightboxImg.alt = title;
        }
      }

      if (lightboxCaption) {
        lightboxCaption.textContent = title;
      }

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (lightboxFrame) lightboxFrame.src = '';
        if (lightboxImg) lightboxImg.src = '';
      }, 250);
    }

    function navigateLightbox(direction) {
      visibleGalleryItems = getVisibleCards();
      if (!visibleGalleryItems.length) return;

      let newIndex = currentGalleryIndex + direction;
      if (newIndex < 0) newIndex = visibleGalleryItems.length - 1;
      if (newIndex >= visibleGalleryItems.length) newIndex = 0;

      openLightboxAt(newIndex);
    }

    workCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        visibleGalleryItems = getVisibleCards();
        const cardIndex = visibleGalleryItems.indexOf(card);
        if (cardIndex !== -1) {
          openLightboxAt(cardIndex);
        }
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-media-wrap')) {
        closeLightbox();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. Interactive WhatsApp Quote Form (Contact Page)
  // -------------------------------------------------------------------------
  const quoteForm = document.getElementById('projectQuoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('formName')?.value.trim() || 'Non précisé';
      const phone = document.getElementById('formPhone')?.value.trim() || 'Non précisé';
      const service = document.getElementById('formService')?.value || 'Projet global';
      const budget = document.getElementById('formBudget')?.value || 'À discuter';
      const message = document.getElementById('formMessage')?.value.trim() || '';

      const text = `Bonjour LES'ART GROUP,\n\nJe vous contacte depuis votre site web pour un projet :\n- Nom : ${name}\n- Téléphone : ${phone}\n- Prestation : ${service}\n- Budget estimé : ${budget}\n\nDétails :\n${message}`;

      const encoded = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/221774654046?text=${encoded}`;

      window.open(whatsappUrl, '_blank');
    });
  }
});

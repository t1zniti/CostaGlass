/* ============================================
   COSTA GLASS — Main JavaScript
   Animations, Navigation, Language Switcher
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ========== HERO SLIDESHOW ==========
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 1) {
        let currentSlide = 0;
        setInterval(() => {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, 5000);
    }

    // ========== NAVBAR SCROLL EFFECT ==========
    const navbar = document.getElementById('navbar');
    
    if (navbar) {
        const handleNavScroll = () => {
            if (window.scrollY > 60) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleNavScroll, { passive: true });
        handleNavScroll();
    }

    // ========== MOBILE MENU ==========
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            const isOpen = mobileMenu.classList.contains('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';
            document.body.classList.toggle('mobile-menu-open', isOpen);
        });

        // Close on link click
        mobileMenu.querySelectorAll('a:not(.mobile-dropdown-trigger)').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.body.classList.remove('mobile-menu-open');
            });
        });

        // Mobile dropdown
        const mobileDropdownTrigger = mobileMenu.querySelector('.mobile-dropdown-trigger');
        const mobileDropdownMenu = mobileMenu.querySelector('.mobile-dropdown-menu');

        if (mobileDropdownTrigger && mobileDropdownMenu) {
            mobileDropdownTrigger.addEventListener('click', () => {
                mobileDropdownMenu.classList.toggle('active');
                const svg = mobileDropdownTrigger.querySelector('svg');
                if (svg) {
                    svg.style.transform = mobileDropdownMenu.classList.contains('active') 
                        ? 'rotate(180deg)' 
                        : '';
                }
            });
        }
    }

    // ========== SCROLL ANIMATIONS (Intersection Observer) ==========
    const animatedElements = document.querySelectorAll('.fade-up, .fade-left, .fade-right');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -10px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Get delay from CSS variable if set
                const delay = getComputedStyle(entry.target).getPropertyValue('--delay');
                if (delay) {
                    entry.target.style.transitionDelay = delay;
                }
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = navbar.offsetHeight + 20;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== LANGUAGE SWITCHER WIDGET ==========
    const langToggle = document.getElementById('langToggle');
    const langMenu = document.getElementById('langMenu');
    const langOptions = document.querySelectorAll('.lang-option');
    const currentFlag = document.getElementById('currentFlag');
    const currentLang = document.getElementById('currentLang');

    if (langToggle && langMenu) {
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('active');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.lang-widget')) {
                langMenu.classList.remove('active');
            }
        });

        // Language option click — trigger Google Translate
        langOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.dataset.lang;
                const flagSrc = option.querySelector('img').src;
                const langName = option.querySelector('span').textContent;

                // Update widget UI
                if (currentFlag) currentFlag.src = flagSrc;
                if (currentLang) currentLang.textContent = lang.toUpperCase();

                // Trigger Google Translate
                triggerGoogleTranslate(lang);

                langMenu.classList.remove('active');
            });
        });
    }

    function triggerGoogleTranslate(langCode) {
        // Google Translate uses specific language codes
        const gtLangMap = {
            'en': 'en',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'ru': 'ru',
            'ar': 'ar'
        };

        const code = gtLangMap[langCode] || langCode;

        // Method 1: Try using the Google Translate combo box
        const selectEl = document.querySelector('.goog-te-combo');
        if (selectEl) {
            selectEl.value = code;
            selectEl.dispatchEvent(new Event('change'));
            return;
        }

        // Method 2: Set cookie and reload
        const domain = window.location.hostname;
        document.cookie = `googtrans=/es/${code}; path=/; domain=${domain}`;
        document.cookie = `googtrans=/es/${code}; path=/`;

        // If Google Translate element exists, try to find and trigger it
        const gtFrame = document.querySelector('.goog-te-menu-frame');
        if (gtFrame) {
            const items = gtFrame.contentDocument.querySelectorAll('.goog-te-menu2-item span.text');
            items.forEach(item => {
                if (item.textContent.toLowerCase().includes(langCode)) {
                    item.click();
                }
            });
        } else {
            // Fallback: reload with translate cookie set
            window.location.reload();
        }
    }

    // ========== REVIEWS DRAG-TO-SCROLL & AUTO-SLIDE ==========
    const reviewsSlider = document.querySelector('.reviews-slider');
    if (reviewsSlider) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let autoSlideInterval;

        const startAutoSlide = () => {
            autoSlideInterval = setInterval(() => {
                reviewsSlider.scrollLeft += 3;
                // Wrap around to start when reaching the end
                if (reviewsSlider.scrollLeft >= reviewsSlider.scrollWidth - reviewsSlider.clientWidth) {
                    reviewsSlider.scrollLeft = 0;
                }
            }, 30);
        };

        const pauseAutoSlide = () => {
            clearInterval(autoSlideInterval);
        };

        // Start auto-slide on page load
        startAutoSlide();

        // Pause on mouse enter
        reviewsSlider.addEventListener('mouseenter', pauseAutoSlide);
        // Resume on mouse leave
        reviewsSlider.addEventListener('mouseleave', startAutoSlide);

        reviewsSlider.addEventListener('mousedown', (e) => {
            isDown = true;
            pauseAutoSlide();
            reviewsSlider.classList.add('grabbing');
            startX = e.pageX - reviewsSlider.offsetLeft;
            scrollLeft = reviewsSlider.scrollLeft;
        });

        reviewsSlider.addEventListener('mouseleave', () => {
            isDown = false;
            reviewsSlider.classList.remove('grabbing');
        });

        reviewsSlider.addEventListener('mouseup', () => {
            isDown = false;
            reviewsSlider.classList.remove('grabbing');
            startAutoSlide();
        });

        reviewsSlider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - reviewsSlider.offsetLeft;
            const walk = (x - startX) * 2;
            reviewsSlider.scrollLeft = scrollLeft - walk;
        });
    }

    // ========== ACTIVE NAV LINK HIGHLIGHT ==========
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu-content > a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ========== PARALLAX HERO (subtle) ==========
    const heroSlideshowEl = document.querySelector('.hero-slideshow');
    const heroSingleBg = document.querySelector('.page-hero-bg img');
    const parallaxTarget = heroSlideshowEl || heroSingleBg;
    if (parallaxTarget) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                parallaxTarget.style.transform = `translateY(${scrolled * 0.2}px) scale(1.05)`;
            }
        }, { passive: true });
    }

});

// ============================================
// LANDING PAGE JAVASCRIPT - KrisKNCreative
// ============================================

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // COOKIE BANNER
    // ============================================
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    
    // Verificar si las cookies ya fueron aceptadas
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 2000);
    }
    
    // Aceptar cookies
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieBanner.classList.remove('show');
        });
    }
    
    // ============================================
    // SCROLL TO TOP BUTTON
    // ============================================
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ============================================
    // STICKY NAVIGATION
    // ============================================
    const stickyNav = document.getElementById('stickyNav');
    const heroSection = document.getElementById('hero');
    
    if (stickyNav && heroSection) {
        const heroHeight = heroSection.offsetHeight;
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > heroHeight * 0.3) {
                stickyNav.classList.add('visible');
            } else {
                stickyNav.classList.remove('visible');
            }
        });
        
        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenuToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
            
            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                });
            });
        }
    }
    
    // ============================================
    // SMOOTH SCROLL FOR NAVIGATION
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for sticky nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // SLIDER FUNCTIONALITY
    // ============================================
    class Slider {
        constructor(sliderElement, dotsContainer) {
            this.slider = sliderElement;
            this.dotsContainer = dotsContainer;
            this.cards = this.slider.querySelectorAll('.slider-card');
            this.currentIndex = 0;
            this.cardsPerView = this.getCardsPerView();
            this.totalPages = Math.ceil(this.cards.length / this.cardsPerView);
            this.autoplayInterval = null;
            this.autoplayDelay = 20000; // 20 segundos
            this.isPaused = false;
            
            this.init();
        }
        
        getCardsPerView() {
            const width = window.innerWidth;
            if (width < 768) return 1;
            if (width < 1024) return 2;
            return 3;
        }
        
        init() {
            this.createDots();
            this.setupControls();
            this.updateView();
            this.startAutoplay();
            this.setupHoverPause();
            
            // Actualizar en resize
            window.addEventListener('resize', () => {
                const newCardsPerView = this.getCardsPerView();
                if (newCardsPerView !== this.cardsPerView) {
                    this.cardsPerView = newCardsPerView;
                    this.totalPages = Math.ceil(this.cards.length / this.cardsPerView);
                    this.currentIndex = 0;
                    this.createDots();
                    this.updateView();
                }
            });
        }
        
        setupHoverPause() {
            this.slider.addEventListener('mouseenter', () => {
                this.isPaused = true;
                this.stopAutoplay();
            });
            
            this.slider.addEventListener('mouseleave', () => {
                this.isPaused = false;
                this.startAutoplay();
            });
        }
        
        createDots() {
            if (!this.dotsContainer) return;
            
            this.dotsContainer.innerHTML = '';
            for (let i = 0; i < this.totalPages; i++) {
                const dot = document.createElement('div');
                dot.className = 'slider-dot';
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goToPage(i));
                this.dotsContainer.appendChild(dot);
            }
        }
        
        setupControls() {
            const container = this.slider.closest('.slider-container');
            if (!container) return;
            
            const prevBtn = container.querySelector('.slider-prev');
            const nextBtn = container.querySelector('.slider-next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.prev());
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.next());
            }
            
            // Touch/Swipe support
            let startX = 0;
            let endX = 0;
            
            this.slider.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });
            
            this.slider.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                this.handleSwipe(startX, endX);
            });
            
            // Mouse drag support
            let isDragging = false;
            let dragStartX = 0;
            
            this.slider.addEventListener('mousedown', (e) => {
                isDragging = true;
                dragStartX = e.clientX;
                this.slider.style.cursor = 'grabbing';
            });
            
            this.slider.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
            });
            
            this.slider.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                this.slider.style.cursor = 'grab';
                const dragEndX = e.clientX;
                this.handleSwipe(dragStartX, dragEndX);
            });
            
            this.slider.addEventListener('mouseleave', () => {
                if (isDragging) {
                    isDragging = false;
                    this.slider.style.cursor = 'grab';
                }
            });
        }
        
        handleSwipe(startX, endX) {
            const threshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        }
        
        updateView() {
            // Ocultar todas las tarjetas
            this.cards.forEach((card, index) => {
                const startIndex = this.currentIndex * this.cardsPerView;
                const endIndex = startIndex + this.cardsPerView;
                
                if (index >= startIndex && index < endIndex) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Actualizar dots
            if (this.dotsContainer) {
                const dots = this.dotsContainer.querySelectorAll('.slider-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === this.currentIndex);
                });
            }
        }
        
        next() {
            this.currentIndex = (this.currentIndex + 1) % this.totalPages;
            this.updateView();
            this.resetAutoplay();
        }
        
        prev() {
            this.currentIndex = (this.currentIndex - 1 + this.totalPages) % this.totalPages;
            this.updateView();
            this.resetAutoplay();
        }
        
        goToPage(index) {
            this.currentIndex = index;
            this.updateView();
            this.resetAutoplay();
        }
        
        startAutoplay() {
            this.autoplayInterval = setInterval(() => {
                this.next();
            }, this.autoplayDelay);
        }
        
        resetAutoplay() {
            clearInterval(this.autoplayInterval);
            this.startAutoplay();
        }
        
        stopAutoplay() {
            clearInterval(this.autoplayInterval);
        }
    }
    
    // Inicializar sliders
    const programasSlider = document.getElementById('programasSlider');
    const programasDots = document.getElementById('programasDots');
    
    if (programasSlider && programasDots) {
        new Slider(programasSlider, programasDots);
    }
    
    const cursosSlider = document.getElementById('cursosSlider');
    const cursosDots = document.getElementById('cursosDots');
    
    if (cursosSlider && cursosDots) {
        new Slider(cursosSlider, cursosDots);
    }
    
    const beneficiosSlider = document.getElementById('beneficiosSlider');
    const beneficiosDots = document.getElementById('beneficiosDots');
    
    if (beneficiosSlider && beneficiosDots) {
        new Slider(beneficiosSlider, beneficiosDots);
    }
    
    // ============================================
    // SOCIAL PROOF POPUPS
    // ============================================
    const socialProofData = [
        { name: "María García", location: "Madrid, España", action: "se unió a Blacks University", time: "hace 3 minutos", gender: "female" },
        { name: "Carlos Rodríguez", location: "Buenos Aires, Argentina", action: "completó el curso de Marketing Digital", time: "hace 5 minutos", gender: "male" },
        { name: "Ana Martínez", location: "Ciudad de México, México", action: "se inscribió en ExpressLaunch", time: "hace 8 minutos", gender: "female" },
        { name: "Pedro López", location: "Bogotá, Colombia", action: "descargó la Matrícula Premium", time: "hace 12 minutos", gender: "male" },
        { name: "Laura Fernández", location: "Lima, Perú", action: "empezó el Reto 21 Días con IA", time: "hace 15 minutos", gender: "female" },
        { name: "Diego Torres", location: "Santiago, Chile", action: "se unió a Blacks University", time: "hace 18 minutos", gender: "male" },
        { name: "Carmen Sánchez", location: "Barcelona, España", action: "completó Lean Six Sigma", time: "hace 22 minutos", gender: "female" },
        { name: "Roberto Díaz", location: "Monterrey, México", action: "se inscribió en YouTube Mentoring", time: "hace 25 minutos", gender: "male" },
        { name: "Patricia Ruiz", location: "Medellín, Colombia", action: "accedió a la Matrícula", time: "hace 28 minutos", gender: "female" },
        { name: "Miguel Ángel", location: "Quito, Ecuador", action: "empezó Tu Negocio Digital con IA", time: "hace 32 minutos", gender: "male" },
        { name: "Sofía Morales", location: "Valencia, España", action: "se unió a Mente CEO", time: "hace 35 minutos", gender: "female" },
        { name: "Fernando Castro", location: "Guadalajara, México", action: "completó Tráfico Pago", time: "hace 38 minutos", gender: "male" },
        { name: "Isabel Romero", location: "Cali, Colombia", action: "se inscribió en Conexión Parental", time: "hace 42 minutos", gender: "female" },
        { name: "Javier Herrera", location: "Rosario, Argentina", action: "descargó contenido premium", time: "hace 45 minutos", gender: "male" },
        { name: "Lucía Navarro", location: "Sevilla, España", action: "se unió a Blacks University", time: "hace 48 minutos", gender: "female" },
        { name: "Antonio Jiménez", location: "Puebla, México", action: "completó el curso de CCTV", time: "hace 52 minutos", gender: "male" },
        { name: "Elena Vargas", location: "Cartagena, Colombia", action: "empezó ExpressLaunch", time: "hace 55 minutos", gender: "female" },
        { name: "Jorge Ortiz", location: "Córdoba, Argentina", action: "se inscribió en la Matrícula", time: "hace 58 minutos", gender: "male" },
        { name: "Cristina Molina", location: "Zaragoza, España", action: "accedió a Marketing Digital", time: "hace 1 hora", gender: "female" },
        { name: "Ricardo Serrano", location: "Tijuana, México", action: "se unió a YouTube Mentoring", time: "hace 1 hora", gender: "male" },
        { name: "Beatriz Gil", location: "Barranquilla, Colombia", action: "completó Cafeterías Rentables", time: "hace 1 hora", gender: "female" },
        { name: "Francisco Ramos", location: "La Plata, Argentina", action: "empezó Lean Six Sigma", time: "hace 1 hora", gender: "male" },
        { name: "Raquel Delgado", location: "Málaga, España", action: "se inscribió en Mente CEO", time: "hace 1 hora", gender: "female" },
        { name: "Manuel Vega", location: "León, México", action: "descargó la Matrícula Premium", time: "hace 1 hora", gender: "male" },
        { name: "Alicia Marín", location: "Bucaramanga, Colombia", action: "se unió a Blacks University", time: "hace 2 horas", gender: "female" },
        { name: "Pablo Cortés", location: "Mendoza, Argentina", action: "completó Tráfico Pago", time: "hace 2 horas", gender: "male" },
        { name: "Marta Guerrero", location: "Bilbao, España", action: "empezó el Reto 21 Días", time: "hace 2 horas", gender: "female" },
        { name: "Alejandro Núñez", location: "Querétaro, México", action: "se inscribió en ExpressLaunch", time: "hace 2 horas", gender: "male" },
        { name: "Teresa Medina", location: "Pereira, Colombia", action: "accedió a contenido premium", time: "hace 2 horas", gender: "female" },
        { name: "Luis Romero", location: "Salta, Argentina", action: "se unió a YouTube Mentoring", time: "hace 2 horas", gender: "male" },
        { name: "Pilar Santos", location: "Murcia, España", action: "completó Marketing Digital", time: "hace 3 horas", gender: "female" },
        { name: "Óscar Flores", location: "Mérida, México", action: "empezó la Matrícula", time: "hace 3 horas", gender: "male" },
        { name: "Rosa Iglesias", location: "Manizales, Colombia", action: "se inscribió en Mente CEO", time: "hace 3 horas", gender: "female" },
        { name: "Enrique Prieto", location: "San Miguel, Argentina", action: "descargó Blacks University", time: "hace 3 horas", gender: "male" },
        { name: "Inmaculada Rubio", location: "Palma, España", action: "se unió a ExpressLaunch", time: "hace 3 horas", gender: "female" },
        { name: "Alberto Pascual", location: "Cancún, México", action: "completó Tu Negocio con IA", time: "hace 3 horas", gender: "male" },
        { name: "Victoria Sanz", location: "Santa Marta, Colombia", action: "empezó Lean Six Sigma", time: "hace 4 horas", gender: "female" },
        { name: "Gabriel Blanco", location: "Neuquén, Argentina", action: "se inscribió en la Matrícula", time: "hace 4 horas", gender: "male" },
        { name: "Dolores Mora", location: "Granada, España", action: "accedió a Tráfico Pago", time: "hace 4 horas", gender: "female" },
        { name: "Ramón Lozano", location: "Aguascalientes, México", action: "se unió a Blacks University", time: "hace 4 horas", gender: "male" },
        { name: "Amparo Muñoz", location: "Ibagué, Colombia", action: "completó el curso de CCTV", time: "hace 4 horas", gender: "female" },
        { name: "Tomás Garrido", location: "Paraná, Argentina", action: "empezó YouTube Mentoring", time: "hace 4 horas", gender: "male" },
        { name: "Montserrat Cruz", location: "Oviedo, España", action: "se inscribió en Mente CEO", time: "hace 5 horas", gender: "female" },
        { name: "Ignacio Peña", location: "Veracruz, México", action: "descargó la Matrícula Premium", time: "hace 5 horas", gender: "male" },
        { name: "Encarnación León", location: "Cúcuta, Colombia", action: "se unió a ExpressLaunch", time: "hace 5 horas", gender: "female" },
        { name: "Sergio Méndez", location: "Bahía Blanca, Argentina", action: "completó Marketing Digital", time: "hace 5 horas", gender: "male" },
        { name: "Consuelo Cabrera", location: "Santander, España", action: "empezó el Reto 21 Días", time: "hace 5 horas", gender: "female" },
        { name: "Adrián Velasco", location: "Toluca, México", action: "se inscribió en Blacks University", time: "hace 6 horas", gender: "male" },
        { name: "Angélica Campos", location: "Villavicencio, Colombia", action: "accedió a contenido premium", time: "hace 6 horas", gender: "female" },
        { name: "Gonzalo Carrillo", location: "Santa Fe, Argentina", action: "se unió a YouTube Mentoring", time: "hace 6 horas", gender: "male" },
        { name: "Nieves Domínguez", location: "Vitoria, España", action: "completó Lean Six Sigma", time: "hace 6 horas", gender: "female" },
        { name: "Rubén Reyes", location: "Morelia, México", action: "empezó la Matrícula", time: "hace 6 horas", gender: "male" },
        { name: "Milagros Vázquez", location: "Armenia, Colombia", action: "se inscribió en Mente CEO", time: "hace 7 horas", gender: "female" },
        { name: "Víctor Esteban", location: "Resistencia, Argentina", action: "descargó ExpressLaunch", time: "hace 7 horas", gender: "male" },
        { name: "Remedios Aguilar", location: "Logroño, España", action: "se unió a Blacks University", time: "hace 7 horas", gender: "female" }
    ];

    function createSocialProofPopup() {
        const container = document.getElementById('socialProofContainer');
        if (!container) return;
        
        const randomData = socialProofData[Math.floor(Math.random() * socialProofData.length)];
        
        const popup = document.createElement('div');
        popup.className = 'social-proof-popup';
        
        const avatar = randomData.gender === 'female' ? '👩' : '👨';
        
        popup.innerHTML = `
            <div class="popup-avatar">${avatar}</div>
            <div class="popup-content">
                <div class="popup-name">${randomData.name}</div>
                <div class="popup-action">${randomData.action}</div>
                <div class="popup-details">
                    <span class="popup-location">📍 ${randomData.location}</span>
                    <span class="popup-time">⏱️ ${randomData.time}</span>
                </div>
            </div>
            <button class="popup-close" aria-label="Cerrar">×</button>
        `;
        
        container.appendChild(popup);
        
        // Show popup with animation
        setTimeout(() => {
            popup.classList.add('show');
        }, 100);
        
        // Close button
        const closeBtn = popup.querySelector('.popup-close');
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 300);
        });
        
        // Auto remove after 7 seconds
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }, 7000);
    }

    // Show popup every 26 seconds
    setInterval(createSocialProofPopup, 26000);
    
    // Show first popup after 5 seconds
    setTimeout(createSocialProofPopup, 5000);
    
    // ============================================
    // INTERSECTION OBSERVER - Animaciones al scroll
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar secciones para animaciones
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    });
    
    // ============================================
    // LAZY LOADING de imágenes
    // ============================================
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    // ============================================
    // PERFORMANCE - Preload crítico
    // ============================================
    const preloadImage = (url) => {
        const img = new Image();
        img.src = url;
    };
    
    // Precargar logo si es necesario
    const logo = document.querySelector('.logo');
    if (logo && logo.src) {
        preloadImage(logo.src);
    }
    
    // ============================================
    // TRACK ANALYTICS (Google/Facebook Pixel)
    // ============================================
    const trackEvent = (eventName, eventData = {}) => {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, eventData);
        }
        
        console.log('Event tracked:', eventName, eventData);
    };
    
    // ============================================
    // CTA WIZARD POPUP - COOKIE SYSTEM
    // ============================================
    const ctaWizard = document.getElementById('ctaWizard');
    const wizardSteps = document.querySelectorAll('.wizard-step');
    const wizardOptions = document.querySelectorAll('.wizard-option');
    const wizardForm = document.getElementById('wizardForm');
    let currentStep = 1;
    const wizardAnswers = {};
    
    // Cookie management functions
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
    
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    function hasCompletedWizard() {
        return getCookie('wizardCompleted') === 'true';
    }
    
    function markWizardAsCompleted() {
        setCookie('wizardCompleted', 'true', 365); // Cookie válida por 1 año
    }
    
    // Open wizard on CTA click - with cookie check
    document.querySelectorAll('[data-cta]').forEach(cta => {
        cta.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if user already completed the wizard
            if (hasCompletedWizard()) {
                // Redirect directly to blog
                window.location.href = 'https://KrisKNCreative.short.gy/kris-learn';
                return;
            }
            
            // If not completed, open wizard
            if (ctaWizard) {
                ctaWizard.classList.add('active');
                document.body.style.overflow = 'hidden';
                currentStep = 1;
                showWizardStep(1);
            }
        });
    });
    
    // Close wizard
    const wizardClose = document.querySelector('.cta-wizard-close');
    if (wizardClose) {
        wizardClose.addEventListener('click', () => {
            closeWizard();
        });
    }
    
    if (ctaWizard) {
        ctaWizard.querySelector('.cta-wizard-overlay').addEventListener('click', () => {
            closeWizard();
        });
    }
    
    // Wizard option selection
    wizardOptions.forEach(option => {
        option.addEventListener('click', function() {
            const step = parseInt(this.closest('.wizard-step').dataset.step);
            const value = this.dataset.value;
            
            // Remove selected from siblings
            this.parentElement.querySelectorAll('.wizard-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected to clicked
            this.classList.add('selected');
            
            // Save answer
            wizardAnswers[`question${step}`] = value;
            
            // Save progress in cookie (all 7 questions answered)
            if (step === 7) {
                // All questions answered, save progress
                setCookie('wizardQuestionsCompleted', 'true', 365);
            }
            
            // Move to next step after short delay
            setTimeout(() => {
                if (step < 7) {
                    showWizardStep(step + 1);
                }
            }, 300);
        });
    });
    
    // Form submission
    if (wizardForm) {
        wizardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Add wizard answers to form data
            const formData = new FormData(this);
            Object.keys(wizardAnswers).forEach(key => {
                formData.append(key, wizardAnswers[key]);
            });
            
            // Submit to Web3Forms
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirect to blog
                    window.location.href = 'https://KrisKNCreative.short.gy/kris-learn';
                } else {
                    alert('Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Redirect anyway
                window.location.href = 'https://KrisKNCreative.short.gy/kris-learn';
            });
        });
    }
    
    function showWizardStep(step) {
        wizardSteps.forEach((s, index) => {
            if (index + 1 === step) {
                s.style.display = 'block';
            } else {
                s.style.display = 'none';
            }
        });
        currentStep = step;
    }
    
    function closeWizard() {
        if (ctaWizard) {
            ctaWizard.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ============================================
    // LEGAL MODALS
    // ============================================
    const legalModal = document.getElementById('legalModal');
    const legalModalBody = document.getElementById('legalModalBody');
    const legalLinks = document.querySelectorAll('.legal-link');
    const legalModalClose = document.querySelector('.legal-modal-close');
    
    // Legal pages content (from blog)
    const legalPages = {
        'privacidad': getPrivacidadContent(),
        'cookies': getCookiesContent(),
        'aviso-legal': getAvisoLegalContent(),
        'afiliados': getAfiliadosContent()
    };
    
    legalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const legalType = this.dataset.legal;
            if (legalPages[legalType] && legalModalBody) {
                legalModalBody.innerHTML = legalPages[legalType];
                if (legalModal) {
                    legalModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });
    
    if (legalModalClose) {
        legalModalClose.addEventListener('click', () => {
            closeLegalModal();
        });
    }
    
    if (legalModal) {
        legalModal.querySelector('.legal-modal-overlay').addEventListener('click', () => {
            closeLegalModal();
        });
    }
    
    function closeLegalModal() {
        if (legalModal) {
            legalModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Legal content functions - Complete content from blog
    function getPrivacidadContent() {
        return `
            <h1>Política de Privacidad</h1>
            <p><strong>Última actualización:</strong> 5 de Enero de 2026</p>
            
            <h2>Datos del Responsable</h2>
            <p><strong>Responsable del tratamiento:</strong> Kristian Krasimirov .N<br>
            <strong>Blog:</strong> KrisKNCreative<br>
            <strong>Email de contacto:</strong> solucionesworld2016@gmail.com</p>
            
            <p>KrisKNCreative es un blog especializado en formación digital, negocios online, marketing digital e inteligencia artificial. El responsable del tratamiento de datos personales es Kristian Krasimirov .N, quien gestiona este sitio web con el objetivo de compartir información valiosa sobre formaciones y estrategias digitales.</p>
            
            <h2>1. Información que Recopilamos</h2>
            <p>En KrisKNCreative recopilamos la siguiente información cuando utilizas nuestro sitio web:</p>
            <ul>
                <li><strong>Información de contacto:</strong> nombre completo, correo electrónico y asunto cuando completas el formulario de contacto</li>
                <li><strong>Información técnica:</strong> dirección IP, tipo de navegador, sistema operativo, páginas visitadas, tiempo de permanencia y origen del tráfico</li>
                <li><strong>Cookies:</strong> utilizamos cookies técnicas y analíticas para mejorar tu experiencia de navegación y analizar el uso del sitio</li>
                <li><strong>Datos de navegación:</strong> información sobre cómo interactúas con nuestro sitio web</li>
            </ul>
            
            <h2>2. Base Legal y Finalidad del Tratamiento</h2>
            <p>Tratamos tus datos personales basándonos en:</p>
            <ul>
                <li><strong>Consentimiento:</strong> cuando nos proporcionas tus datos a través del formulario de contacto</li>
                <li><strong>Interés legítimo:</strong> para mejorar nuestros servicios y analizar el uso del sitio web</li>
                <li><strong>Cumplimiento legal:</strong> cuando sea necesario para cumplir con obligaciones legales</li>
            </ul>
            
            <p>Utilizamos la información recopilada para:</p>
            <ul>
                <li>Responder a tus consultas y solicitudes de información</li>
                <li>Mejorar nuestro sitio web, servicios y experiencia de usuario</li>
                <li>Enviarte información relevante sobre formaciones y artículos (solo si has dado tu consentimiento explícito)</li>
                <li>Analizar el comportamiento de los usuarios para optimizar el contenido</li>
                <li>Cumplir con obligaciones legales y normativas aplicables</li>
            </ul>
            
            <h2>3. Compartir Información</h2>
            <p>No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales. Podemos compartir información únicamente en los siguientes casos:</p>
            <ul>
                <li><strong>Proveedores de servicios:</strong> empresas que nos ayudan a operar el sitio web (hosting, análisis, email) bajo estrictos acuerdos de confidencialidad</li>
                <li><strong>Autoridades legales:</strong> cuando sea requerido por ley, orden judicial o proceso legal</li>
                <li><strong>Protección de derechos:</strong> cuando sea necesario para proteger nuestros derechos, propiedad o seguridad</li>
            </ul>
            
            <h2>4. Seguridad de los Datos</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal contra:</p>
            <ul>
                <li>Acceso no autorizado o ilegal</li>
                <li>Pérdida, destrucción o alteración accidental</li>
                <li>Tratamiento no autorizado</li>
            </ul>
            <p>Estas medidas incluyen encriptación, firewalls, controles de acceso y procedimientos de seguridad regulares. Sin embargo, ningún método de transmisión por internet es 100% seguro.</p>
            
            <h2>5. Retención de Datos</h2>
            <p>Conservamos tus datos personales solo durante el tiempo necesario para cumplir con las finalidades descritas en esta política, a menos que la ley requiera o permita un período de retención más largo.</p>
            <ul>
                <li><strong>Datos de contacto:</strong> se conservan mientras mantengamos una relación activa o hasta que solicites su eliminación</li>
                <li><strong>Datos técnicos:</strong> se conservan durante el tiempo necesario para análisis y mejora del sitio</li>
                <li><strong>Cookies:</strong> según se especifica en nuestra Política de Cookies</li>
            </ul>
            
            <h2>6. Tus Derechos</h2>
            <p>De acuerdo con la normativa de protección de datos, tienes derecho a:</p>
            <ul>
                <li><strong>Acceso:</strong> obtener información sobre qué datos personales tratamos sobre ti</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
                <li><strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios</li>
                <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos en ciertas circunstancias</li>
                <li><strong>Limitación:</strong> solicitar la limitación del tratamiento de tus datos</li>
                <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común</li>
                <li><strong>Retirar consentimiento:</strong> retirar tu consentimiento en cualquier momento</li>
            </ul>
            <p>Para ejercer cualquiera de estos derechos, puedes contactarnos en: <strong>solucionesworld2016@gmail.com</strong></p>
            
            <h2>7. Transferencias Internacionales</h2>
            <p>Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico Europeo. En estos casos, nos aseguramos de que existan garantías adecuadas para la protección de tus datos personales.</p>
            
            <h2>8. Menores de Edad</h2>
            <p>Nuestro sitio web no está dirigido a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor, tomaremos medidas para eliminarla inmediatamente.</p>
            
            <h2>9. Cambios en esta Política</h2>
            <p>Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Te notificaremos de cambios significativos publicando la nueva política en esta página y actualizando la fecha de "Última actualización".</p>
            
            <h2>10. Contacto</h2>
            <p>Para cualquier consulta, solicitud o ejercicio de derechos relacionados con esta Política de Privacidad, puedes contactarnos en:</p>
            <p><strong>Email:</strong> solucionesworld2016@gmail.com<br>
            <strong>Asunto:</strong> Política de Privacidad - KrisKNCreative</p>
            <p>Nos comprometemos a responder a tu solicitud en un plazo máximo de 72 horas.</p>
        `;
    }
    
    function getCookiesContent() {
        return `
            <h1>Política de Cookies</h1>
            <p><strong>Última actualización:</strong> 5 de Enero de 2026</p>
            
            <h2>Responsable</h2>
            <p><strong>Responsable:</strong> Kristian Krasimirov .N<br>
            <strong>Blog:</strong> KrisKNCreative<br>
            <strong>Email:</strong> solucionesworld2016@gmail.com</p>
            
            <h2>¿Qué son las Cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet, móvil) cuando visitas un sitio web. Estas cookies permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo, por lo que no tienes que volver a configurarlas cada vez que regresas al sitio o navegas de una página a otra.</p>
            
            <h2>Tipos de Cookies que Utilizamos</h2>
            
            <h3>Cookies Esenciales</h3>
            <p>Necesarias para el funcionamiento básico del sitio web. No se pueden desactivar.</p>
            <ul>
                <li>Cookies de sesión para mantener tu navegación</li>
                <li>Cookies de seguridad</li>
            </ul>
            
            <h3>Cookies Analíticas</h3>
            <p>Nos ayudan a entender cómo los visitantes interactúan con el sitio:</p>
            <ul>
                <li>Páginas más visitadas</li>
                <li>Tiempo de permanencia</li>
                <li>Origen del tráfico</li>
            </ul>
            
            <h3>Cookies de Funcionalidad</h3>
            <p>Permiten recordar tus preferencias:</p>
            <ul>
                <li>Idioma seleccionado</li>
                <li>Configuraciones de visualización</li>
            </ul>
            
            <h2>Gestionar Cookies</h2>
            <p>Puedes controlar y/o eliminar cookies según desees. Puedes eliminar todas las cookies que ya están en tu dispositivo y configurar la mayoría de navegadores para evitar que se instalen.</p>
            
            <p>Ten en cuenta que si desactivas las cookies, algunas funcionalidades del sitio pueden no funcionar correctamente.</p>
            
            <h2>Más Información</h2>
            <p>Para más información sobre cookies, visita: <a href="https://www.aboutcookies.org" target="_blank" style="color: var(--color-accent); text-decoration: underline;">www.aboutcookies.org</a></p>
        `;
    }
    
    function getAvisoLegalContent() {
        return `
            <h1>Aviso Legal</h1>
            <p><strong>Última actualización:</strong> 5 de Enero de 2026</p>
            
            <h2>1. Datos Identificativos del Responsable</h2>
            <p><strong>Responsable:</strong> Kristian Krasimirov .N<br>
            <strong>Blog:</strong> KrisKNCreative<br>
            <strong>Email de contacto:</strong> solucionesworld2016@gmail.com</p>
            
            <p>KrisKNCreative es un blog especializado en formación digital, negocios online, marketing digital e inteligencia artificial. El responsable y titular de este sitio web es Kristian Krasimirov .N, quien gestiona y mantiene este espacio con el objetivo de compartir información valiosa, reseñas y análisis sobre formaciones digitales y estrategias de negocio online.</p>
            
            <h2>2. Objeto</h2>
            <p>El presente aviso legal regula el uso y utilización del sitio web KrisKNCreative, del que es titular Kristian Krasimirov.</p>
            <p>La navegación por el sitio web atribuye la condición de usuario y implica la aceptación plena de todas las disposiciones incluidas en este Aviso Legal.</p>
            
            <h2>3. Propiedad Intelectual</h2>
            <p>Todos los contenidos del sitio web, incluyendo textos, imágenes, diseño, logotipos y código fuente, son propiedad de KrisKNCreative o de terceros que han autorizado su uso.</p>
            <p>Queda prohibida la reproducción, distribución o modificación de cualquier contenido sin autorización expresa.</p>
            
            <h2>4. Responsabilidad</h2>
            <p>KrisKNCreative no se hace responsable de:</p>
            <ul>
                <li>La continuidad y disponibilidad de los contenidos</li>
                <li>Errores u omisiones en los contenidos</li>
                <li>Daños causados por el uso inadecuado del sitio web</li>
                <li>Enlaces a sitios web de terceros</li>
            </ul>
            
            <h2>5. Enlaces a Terceros</h2>
            <p>El sitio web puede contener enlaces a sitios de terceros. KrisKNCreative no se responsabiliza del contenido de estos sitios externos.</p>
            
            <h2>6. Modificaciones</h2>
            <p>KrisKNCreative se reserva el derecho de modificar el presente aviso legal en cualquier momento. Los cambios serán publicados en esta página.</p>
            
            <h2>7. Legislación Aplicable</h2>
            <p>El presente aviso legal se rige por la legislación española vigente.</p>
        `;
    }
    
    function getAfiliadosContent() {
        return `
            <h1>Página de Afiliados</h1>
            <p><strong>Última actualización:</strong> 5 de Enero de 2026</p>
            
            <h2>Responsable</h2>
            <p><strong>Responsable:</strong> Kristian Krasimirov .N<br>
            <strong>Blog:</strong> KrisKNCreative<br>
            <strong>Email:</strong> solucionesworld2016@gmail.com</p>
            
            <h2>Divulgación de Afiliación</h2>
            <p>KrisKNCreative participa en programas de afiliación. Esto significa que podemos recibir comisiones por las compras realizadas a través de los enlaces presentes en este sitio web.</p>
            
            <h2>Transparencia Total</h2>
            <p>Creemos firmemente en la transparencia. Cuando recomendamos un producto, curso o formación, es porque:</p>
            <ul>
                <li>Lo hemos investigado exhaustivamente</li>
                <li>Creemos genuinamente en su valor</li>
                <li>Consideramos que puede ayudarte en tu desarrollo profesional</li>
                <li>Tiene respaldo de resultados reales</li>
            </ul>
            
            <h2>Nuestra Relación con Universidad.Online</h2>
            <p>La mayoría de las formaciones, certificaciones y productos que recomendamos en este blog provienen de <strong>Universidad.Online®</strong>, una plataforma educativa digital para la comunidad hispanohablante.</p>
            
            <h3>¿Qué es Universidad.Online®?</h3>
            <p>Universidad.Online® es un ecosistema de educación online enfocado en cerrar la brecha digital, ofreciendo acceso continuo y flexible a cursos, programas y productos digitales desarrollados por expertos.</p>
            
            <h3>Características de Universidad.Online®:</h3>
            <ul>
                <li><strong>Metodología innovadora:</strong> Aprendizaje asíncrono e inductivo, a tu propio ritmo</li>
                <li><strong>Distribución:</strong> Los programas se comercializan a través de Hotmart®</li>
                <li><strong>Certificación PLATA:</strong> Otorgada por el Centro de Educación y Liderazgo (CEL)</li>
                <li><strong>Aval académico:</strong> Florida Global University (FGU) dentro de su Programa de Educación Continua</li>
                <li><strong>Acreditación CertiProf®:</strong> Emite credenciales digitales verificables</li>
                <li><strong>Reconocimiento mediático:</strong> Semana, Yahoo Finanzas, El Espectador, Europa Press, Agencia EFE</li>
            </ul>
            
            <h2>¿Por Qué Recomendamos Universidad.Online?</h2>
            <p>Recomendamos Universidad.Online porque representa una alternativa real al modelo educativo tradicional:</p>
            <ul>
                <li>Formación práctica y aplicable al mundo real</li>
                <li>Sin horarios obligatorios ni evaluaciones memorísticas</li>
                <li>Acceso permanente a los contenidos</li>
                <li>Certificaciones con reconocimiento internacional</li>
                <li>Enfoque en habilidades para la economía digital</li>
            </ul>
            
            <h2>Comisiones de Afiliado</h2>
            <p>Cuando haces clic en un enlace de afiliado y realizas una compra, recibimos una comisión. <strong>Esto no tiene ningún costo adicional para ti.</strong> El precio que pagas es exactamente el mismo que si accedieras directamente.</p>
            
            <h2>Nuestro Compromiso Contigo</h2>
            <p>Nuestro compromiso es siempre contigo, el lector:</p>
            <ul>
                <li><strong>Honestidad:</strong> Solo recomendamos lo que consideramos valioso</li>
                <li><strong>Investigación:</strong> Analizamos cada formación antes de recomendarla</li>
                <li><strong>Resultados reales:</strong> Nos basamos en casos de éxito verificables</li>
                <li><strong>Tu beneficio primero:</strong> Nuestra reputación depende de tu éxito</li>
            </ul>
            
            <h2>Tu Derecho a Elegir</h2>
            <p>Eres libre de:</p>
            <ul>
                <li>Usar o no usar nuestros enlaces de afiliado</li>
                <li>Investigar por tu cuenta cualquier recomendación</li>
                <li>Buscar alternativas</li>
                <li>Contactarnos si tienes dudas sobre cualquier recomendación</li>
            </ul>
            
            <h2>Preguntas</h2>
            <p>Si tienes alguna pregunta sobre nuestra página de afiliados o sobre cualquier recomendación específica, no dudes en contactarnos en: solucionesworld2016@gmail.com</p>
            
            <p><strong>Gracias por tu confianza.</strong></p>
            
            <div style="margin-top: 60px; padding-top: 40px; border-top: 2px solid var(--color-border);">
                <h2 style="color: var(--color-accent); margin-bottom: 24px;">Sobre Universidad.Online®</h2>
                <p style="font-size: 18px; line-height: 1.8; margin-bottom: 24px; color: var(--color-text);">
                    Universidad.Online® es una plataforma de educación digital disruptiva para hispanohablantes, enfocada en ofrecer formación práctica, flexible y accesible, distinta al modelo universitario tradicional.
                </p>
                
                <h3 style="margin-top: 32px; margin-bottom: 16px;">¿Qué es Universidad.Online®?</h3>
                <p style="margin-bottom: 20px; line-height: 1.8;">
                    Es una plataforma de educación en línea orientada a reducir la brecha digital en el mundo hispanohablante mediante propuestas educativas disruptivas. Ofrece cursos, programas, seminarios, productos digitales y talleres creados por profesionales expertos en distintas áreas.
                </p>
                
                <h3 style="margin-top: 32px; margin-bottom: 16px;">Enfoque Educativo</h3>
                <p style="margin-bottom: 20px; line-height: 1.8;">
                    Su metodología es asíncrona e inductiva, permitiendo aprender a tu propio ritmo a partir de experiencias prácticas y aplicables de inmediato. El objetivo no es memorizar para aprobar exámenes, sino desarrollar habilidades reales para transformar la vida personal, profesional y económica del estudiante.
                </p>
                
                <h3 style="margin-top: 32px; margin-bottom: 16px;">Modelo y Alianza Tecnológica</h3>
                <p style="margin-bottom: 20px; line-height: 1.8;">
                    Promueve acceso libre, flexible y efectivo al conocimiento, sin barreras geográficas ni horarios rígidos, y alejado de modelos académicos considerados caducos. Mantiene una alianza estratégica con Hotmart® para distribuir productos digitales y garantizar una experiencia 100% online con acceso de por vida a los programas adquiridos.
                </p>
                
                <h3 style="margin-top: 32px; margin-bottom: 16px;">Reconocimientos y Avales</h3>
                <p style="margin-bottom: 16px; line-height: 1.8;">
                    Ha sido mencionada y destacada en múltiples medios como Revista Semana, Yahoo Finanzas, El Espectador, Europa Press, Agencia EFE y otros, como referente de educación digital en Latinoamérica.
                </p>
                <p style="margin-bottom: 20px; line-height: 1.8;">
                    Cuenta con un certificado como aliado Plata: sus programas están certificados por el Centro de Educación y Liderazgo (CEL) y avalados por Florida Global University dentro de su Programa de Educación Continua, cumpliendo estándares del Estado de Florida.
                </p>
                
                <h3 style="margin-top: 32px; margin-bottom: 16px;">Certificaciones y Estándares</h3>
                <p style="margin-bottom: 16px; line-height: 1.8;">
                    CertiProf® certifica que Universidad.Online® emite credenciales digitales verificables (insignias) y realiza procesos de certificación mediante evaluaciones que validan la apropiación del conocimiento.
                </p>
                <p style="margin-bottom: 20px; line-height: 1.8;">
                    Sus programas se declaran alineados con marcos de desarrollo de habilidades reconocidos mundialmente, como SFIA y marcos de la Oficina de Gobierno de Estados Unidos, elevando el estatus profesional de sus estudiantes.
                </p>
            </div>
        `;
    }
    
    // ============================================
    // FAQ ACCORDION
    // ============================================
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = question.classList.contains('active');
            
            // Close all others
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.classList.remove('active');
                    q.nextElementSibling?.classList.remove('active');
                }
            });
            
            // Toggle current
            if (isActive) {
                question.classList.remove('active');
                answer.classList.remove('active');
            } else {
                question.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
    
    // Track CTA clicks
    document.querySelectorAll('[data-cta]').forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            trackEvent('click_cta', {
                button_text: buttonText,
                button_location: this.closest('section')?.className || 'unknown'
            });
        });
    });
    
    // Track scroll depth
    let scrollDepth = 0;
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        if (scrollPercent > scrollDepth) {
            scrollDepth = Math.floor(scrollPercent / 25) * 25;
            if (scrollDepth > 0 && scrollDepth <= 100) {
                trackEvent('scroll_depth', {
                    depth: scrollDepth
                });
            }
        }
    });
    
    // ============================================
    // ACCESSIBILITY - Keyboard Navigation
    // ============================================
    document.addEventListener('keydown', function(e) {
        // Escape para cerrar banners
        if (e.key === 'Escape') {
            if (cookieBanner.classList.contains('show')) {
                cookieBanner.classList.remove('show');
            }
        }
        
        // Tab trap para modales (si los hubiera)
        if (e.key === 'Tab') {
            const focusableElements = document.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
    
    // ============================================
    // PERFORMANCE OPTIMIZATION
    // ============================================
    
    // Debounce function
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
    
    // Optimize resize events
    const handleResize = debounce(() => {
        // Cualquier lógica de resize adicional
        console.log('Window resized');
    }, 250);
    
    window.addEventListener('resize', handleResize);
    
    // ============================================
    // FORM VALIDATION (si se añaden formularios)
    // ============================================
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };
    
    // ============================================
    // ANIMATIONS ON HOVER
    // ============================================
    document.querySelectorAll('.slider-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
    });
    
    // ============================================
    // LOADING STATE
    // ============================================
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Ocultar cualquier loader si existe
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    });
    
    // ============================================
    // PAGE VISIBILITY API - Pausar autoplay cuando no está visible
    // ============================================
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Pausar animaciones, videos, etc.
            console.log('Page is hidden');
        } else {
            // Reanudar
            console.log('Page is visible');
        }
    });
    
    // ============================================
    // DYNAMIC YEAR in Footer
    // ============================================
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
    
    // ============================================
    // COPY TO CLIPBOARD (si se necesita)
    // ============================================
    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Copied to clipboard:', text);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    };
    
    // ============================================
    // SHARE API (para compartir en redes sociales)
    // ============================================
    const shareContent = async (title, text, url) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: url
                });
                console.log('Content shared successfully');
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback para navegadores que no soportan Share API
            console.log('Share API not supported');
        }
    };
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        // Aquí podrías enviar errores a un servicio de logging
    });
    
    // ============================================
    // CONSOLE MESSAGE
    // ============================================
    console.log('%c🚀 KrisKNCreative Landing Page', 'color: #8b5cf6; font-size: 20px; font-weight: bold;');
    console.log('%cTransforma tu conocimiento en negocio digital exitoso', 'color: #6366f1; font-size: 14px;');
    console.log('%c¿Interesado en nuestros programas? Visita: https://kris-kn-creative.com', 'color: #a0a0b8; font-size: 12px;');
    
    // ============================================
    // INIT COMPLETE
    // ============================================
    console.log('✅ Landing Page initialized successfully');
});

// ============================================
// SERVICE WORKER (PWA - opcional)
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Descomentar si se quiere implementar PWA
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}

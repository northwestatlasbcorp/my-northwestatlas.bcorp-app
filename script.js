// ========== NORTH WEST ATLAS B CORP - ПРЕМИУМ СКРИПТ ==========
// Стоимость разработки: 1,000,000 - 1,500,000 рублей
// Уровень: Премиум бизнес-класс

'use strict';

class PremiumWebsite {
    constructor() {
        this.isInitialized = false;
        this.currentLanguage = this.detectLanguage();
        this.scrollPosition = 0;
        this.isMobile = window.innerWidth <= 768;
        this.initialize();
    }

    // Основная инициализация
    initialize() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.initializeAnimations();
        this.initializeParticles();
        this.initializeCustomCursor();
        this.setupPreloader();
        this.setupScrollEffects();
        this.setupFormHandlers();
        this.setupESGCalculator();
        
        this.isInitialized = true;
        console.log('🚀 North West Atlas B Corp - Премиум сайт инициализирован');
    }

    // Определение языка
    detectLanguage() {
        const path = window.location.pathname;
        if (path.includes('/en') || path.includes('/en.html')) return 'en';
        return 'ru';
    }

    // ========== СИСТЕМА АНИМАЦИЙ ==========
    initializeAnimations() {
        // Инициализация AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1200,
                easing: 'ease-in-out-cubic',
                once: true,
                mirror: false,
                anchorPlacement: 'top-bottom',
                offset: 100
            });
        }

        // Анимация главного заголовка
        this.animateHeroSection();
        
        // Параллакс эффекты
        this.setupParallaxEffects();
        
        // Анимация чисел
        this.setupCounterAnimation();
    }

    animateHeroSection() {
        const heroTitle = document.querySelector('.site-title');
        if (!heroTitle) return;

        // Сложная многоэтапная анимация
        const timeline = anime.timeline({
            easing: 'easeOutExpo',
            duration: 2000
        });

        timeline
            .add({
                targets: heroTitle,
                opacity: [0, 1],
                translateY: [100, 0],
                scale: [0.8, 1],
                duration: 1800
            })
            .add({
                targets: '.hero-subtitle',
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 1200
            }, '-=800');
    }

    // ========== ЧАСТИЦЫ И ФОН ==========
    initializeParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: {
                        value: 120,
                        density: {
                            enable: true,
                            value_area: 1500
                        }
                    },
                    color: {
                        value: ['#d4af37', '#f4e5c3', '#aa8a2e', '#ffd700']
                    },
                    shape: {
                        type: ['circle', 'polygon'],
                        polygon: {
                            nb_sides: 6
                        }
                    },
                    opacity: {
                        value: 0.7,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 1,
                            opacity_min: 0.3,
                            sync: false
                        }
                    },
                    size: {
                        value: 4,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 4,
                            size_min: 1,
                            sync: false
                        }
                    },
                    line_linked: {
                        enable: true,
                        distance: 180,
                        color: '#d4af37',
                        opacity: 0.4,
                        width: 1.5,
                        shadow: {
                            enable: true,
                            color: '#ffd700',
                            blur: 5
                        }
                    },
                    move: {
                        enable: true,
                        speed: 3,
                        direction: 'none',
                        random: true,
                        straight: false,
                        out_mode: 'out',
                        bounce: false,
                        attract: {
                            enable: true,
                            rotateX: 600,
                            rotateY: 1200
                        }
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: {
                            enable: true,
                            mode: ['grab', 'bubble']
                        },
                        onclick: {
                            enable: true,
                            mode: 'push'
                        },
                        resize: true
                    },
                    modes: {
                        grab: {
                            distance: 200,
                            line_linked: {
                                opacity: 1
                            }
                        },
                        bubble: {
                            distance: 200,
                            size: 6,
                            duration: 2,
                            opacity: 0.8
                        },
                        push: {
                            particles_nb: 6
                        }
                    }
                },
                retina_detect: true
            });
        }
    }

    // ========== ПРЕМИАЛЬНЫЙ КУРСОР ==========
    initializeCustomCursor() {
        const cursor = document.querySelector('.custom-cursor');
        if (!cursor) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Плавное движение курсора
        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Интерактивные элементы
        const interactiveElements = document.querySelectorAll(
            'a, button, .nav-link, .read-more, .submit-btn, .expertise-card, .about-card'
        );

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                document.body.style.cursor = 'none';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                document.body.style.cursor = 'none';
            });
        });

        // Клик анимация
        document.addEventListener('click', () => {
            cursor.classList.add('click');
            setTimeout(() => cursor.classList.remove('click'), 500);
        });
    }

    // ========== PRELOADER ПРЕМИУМ КЛАССА ==========
    setupPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        let progress = 0;
        const progressBar = document.querySelector('.loading-progress');
        const progressText = document.querySelector('.preloader-text');

        // Имитация загрузки с прогрессом
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            if (progressBar) progressBar.style.width = progress + '%';
            
            if (progressText) {
                const steps = ['Инициализация системы', 'Загрузка данных', 'Оптимизация', 'Запуск интерфейса'];
                const stepIndex = Math.floor(progress / 25);
                progressText.textContent = steps[stepIndex] || 'Готово';
            }

            if (progress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    setTimeout(() => preloader.remove(), 1000);
                    
                    // Запуск пост-загрузочных анимаций
                    this.onPageLoaded();
                }, 500);
            }
        }, 200);
    }

    onPageLoaded() {
        // Запуск анимаций после загрузки
        this.animateElementsOnScroll();
        this.setupIntersectionObserver();
    }

    // ========== СИСТЕМА ПРОКРУТКИ ==========
    setupScrollEffects() {
        // Параллакс
        this.setupParallaxEffects();
        
        // Липкое меню
        this.setupStickyHeader();
        
        // Навигация по секциям
        this.setupScrollSpy();
        
        // Плавная прокрутка
        this.setupSmoothScrolling();
    }

    setupStickyHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
                
                if (currentScroll > lastScroll && currentScroll > 200) {
                    header.classList.add('hidden');
                } else {
                    header.classList.remove('hidden');
                }
            } else {
                header.classList.remove('scrolled', 'hidden');
            }
            
            lastScroll = currentScroll;
        });
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-20% 0px -20% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Закрытие мобильного меню
                    this.closeMobileMenu();
                }
            });
        });
    }

    // ========== МОБИЛЬНОЕ МЕНЮ ==========
    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });

            // Закрытие при клике вне меню
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Закрытие при клике на ссылку
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => this.closeMobileMenu());
            });
        }
    }

    toggleMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (navMenu.classList.contains('active')) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');
        
        navMenu.classList.add('active');
        menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');
        
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========== ESG КАЛЬКУЛЯТОР ПРЕМИУМ КЛАССА ==========
    setupESGCalculator() {
        this.initializeESGData();
        this.setupCalculatorEvents();
    }

    initializeESGData() {
        // Расширенные данные для ESG рейтингов
        this.esgData = {
            ru: {
                solidcore: {
                    ratings: [
                        ["Sustainalytics ESG Risk", "8.5/10", "Низкий риск"],
                        ["Refinitiv ESG Score", "92/100", "Лидер отрасли"],
                        ["MSCI ESG Rating", "AA", "Высокий уровень"],
                        ["RAEX Europe", "A+", "Превосходно"],
                        ["NRA ESG", "A1.esg", "Высшая категория"],
                        ["CDP Climate Change", "A-", "Осознанное управление"],
                        ["S&P Global ESG Score", "84/100", "Сильные показатели"],
                        ["Согласованность рейтингов", "7.8/10", "Высокая"],
                        ["Динамика 12 мес", "+12.3%", "Растущий тренд"]
                    ],
                    recommendations: [
                        {
                            title: "Стратегия устойчивого развития",
                            text: "Рекомендуется разработать дорожную карту углеродной нейтральности до 2035 года",
                            priority: "high"
                        },
                        {
                            title: "Корпоративное управление",
                            text: "Внедрение блокчейн-технологий для повышения прозрачности цепочки поставок",
                            priority: "medium"
                        },
                        {
                            title: "Социальные инициативы",
                            text: "Расширение программ инклюзивности и разнообразия в совете директоров",
                            priority: "high"
                        }
                    ]
                }
            },
            en: {
                solidcore: {
                    ratings: [
                        ["Sustainalytics ESG Risk", "8.5/10", "Low Risk"],
                        ["Refinitiv ESG Score", "92/100", "Industry Leader"],
                        ["MSCI ESG Rating", "AA", "High Level"],
                        ["RAEX Europe", "A+", "Excellent"],
                        ["NRA ESG", "A1.esg", "Highest Category"],
                        ["CDP Climate Change", "A-", "Conscious Management"],
                        ["S&P Global ESG Score", "84/100", "Strong Performance"],
                        ["Rating Consistency", "7.8/10", "High"],
                        ["12-Month Dynamics", "+12.3%", "Growing Trend"]
                    ],
                    recommendations: [
                        {
                            title: "Sustainable Development Strategy",
                            text: "Develop carbon neutrality roadmap until 2035",
                            priority: "high"
                        },
                        {
                            title: "Corporate Governance",
                            text: "Implement blockchain for supply chain transparency",
                            priority: "medium"
                        },
                        {
                            title: "Social Initiatives",
                            text: "Expand diversity programs in board of directors",
                            priority: "high"
                        }
                    ]
                }
            }
        };
    }

    setupCalculatorEvents() {
        const calculateBtn = document.getElementById('calculate-esg');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateESG());
        }

        // Автоматический расчет при изменении параметров
        const inputs = document.querySelectorAll('#esg-calculator input, #esg-calculator select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.type !== 'button') {
                    setTimeout(() => this.calculateESG(), 300);
                }
            });
        });
    }

    calculateESG() {
        const company = document.getElementById('company').value;
        const resultDiv = document.getElementById('result');
        const recommendationsDiv = document.getElementById('expert-recommendations');

        if (!this.esgData[this.currentLanguage]?.[company]) {
            this.showNotification('Данные о компании не найдены', 'error');
            return;
        }

        const data = this.esgData[this.currentLanguage][company];

        // Показываем анимацию загрузки
        this.showLoadingAnimation(resultDiv);

        setTimeout(() => {
            // Генерация премиальной таблицы
            resultDiv.innerHTML = this.generatePremiumTable(data.ratings);
            
            // Генерация рекомендаций
            recommendationsDiv.innerHTML = this.generateRecommendations(data.recommendations);
            
            // Анимация появления
            this.animateResults();
            
            // Показать уведомление
            this.showNotification('ESG анализ завершен успешно', 'success');
        }, 1500);
    }

    generatePremiumTable(ratings) {
        let tableHTML = `
            <div class="table-container">
                <table class="premium-ratings-table">
                    <thead>
                        <tr>
                            <th>Показатель</th>
                            <th>Оценка</th>
                            <th>Статус</th>
                            <th>Тенденция</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        ratings.forEach((row, index) => {
            const trend = index % 3 === 0 ? '📈' : index % 3 === 1 ? '📊' : '🎯';
            tableHTML += `
                <tr>
                    <td>${row[0]}</td>
                    <td><span class="rating-value">${row[1]}</span></td>
                    <td><span class="status-badge">${row[2]}</span></td>
                    <td>${trend}</td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        return tableHTML;
    }

    generateRecommendations(recommendations) {
        const title = this.currentLanguage === 'en' ? 'Strategic Recommendations' : 'Стратегические рекомендации';
        
        let html = `
            <h3 class="recommendation-title">${title}</h3>
            <div class="recommendation-grid">
        `;

        recommendations.forEach(rec => {
            const priorityClass = `priority-${rec.priority}`;
            html += `
                <div class="recommendation-card ${priorityClass}">
                    <div class="recommendation-header">
                        <h4>${rec.title}</h4>
                        <span class="priority-indicator ${rec.priority}"></span>
                    </div>
                    <p>${rec.text}</p>
                    <div class="recommendation-meta">
                        <span class="timeline">⏱ 6-12 месяцев</span>
                        <span class="impact">💎 Высокое влияние</span>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <div class="report-actions">
                <button class="download-button premium" onclick="premiumWebsite.downloadReport()">
                    <i class="fas fa-download"></i> 
                    ${this.currentLanguage === 'en' ? 'Download Full Report' : 'Скачать полный отчет'}
                </button>
                <button class="consultation-button" onclick="premiumWebsite.requestConsultation()">
                    <i class="fas fa-calendar"></i> 
                    ${this.currentLanguage === 'en' ? 'Book Consultation' : 'Заказать консультацию'}
                </button>
            </div>
        `;

        return html;
    }

    // ========== СИСТЕМА УВЕДОМЛЕНИЙ ==========
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `premium-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 100);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '💎'
        };
        return icons[type] || '💎';
    }

    // ========== ФОРМЫ И КОНТАКТЫ ==========
    setupFormHandlers() {
        this.setupContactForm();
        this.setupNewsletterForm();
        this.setupConsultationForms();
    }

    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(contactForm, 'contact');
            });
        }
    }

    async handleFormSubmission(form, type) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Показ загрузки
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;

        try {
            // Имитация отправки на сервер
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Сообщение успешно отправлено!', 'success');
            form.reset();
            
            // Дополнительные действия в зависимости от типа формы
            if (type === 'consultation') {
                this.scheduleCallback();
            }
            
        } catch (error) {
            this.showNotification('Ошибка отправки. Попробуйте еще раз.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // ========== СИСТЕМА ЗАЩИТЫ КОНТЕНТА ==========
    setupContentProtection() {
        // Защита от копирования
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.showCopyProtectionMessage();
        });

        // Защита от правого клика
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showProtectionMessage();
        });

        // Защита от перетаскивания
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });

        // Защита от DevTools
        this.setupDevToolsProtection();
    }

    showCopyProtectionMessage() {
        const message = this.currentLanguage === 'en' 
            ? '© North West Atlas B Corp — Content protected by intellectual property rights'
            : '© North West Atlas B Corp — Контент защищен правами интеллектуальной собственности';

        this.showNotification(message, 'warning');
    }

    // ========== ДОПОЛНИТЕЛЬНЫЕ ПРЕМИУМ ФУНКЦИИ ==========
    
    // Загрузка отчета
    downloadReport() {
        this.showNotification('Подготовка отчета...', 'info');
        
        setTimeout(() => {
            // Создание премиального PDF отчета
            this.generatePremiumReport();
        }, 2000);
    }

    // Запрос консультации
    requestConsultation() {
        const modal = this.createConsultationModal();
        document.body.appendChild(modal);
        this.showModal(modal);
    }

    // Создание модального окна консультации
    createConsultationModal() {
        const modal = document.createElement('div');
        modal.className = 'premium-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="premiumWebsite.closeModal(this.parentElement)"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${this.currentLanguage === 'en' ? 'Schedule Consultation' : 'Запланировать консультацию'}</h3>
                    <button class="modal-close" onclick="premiumWebsite.closeModal(this.closest('.premium-modal'))">×</button>
                </div>
                <div class="modal-body">
                    <form id="consultation-form">
                        <div class="form-group">
                            <label>${this.currentLanguage === 'en' ? 'Your Name' : 'Ваше имя'}</label>
                            <input type="text" required>
                        </div>
                        <div class="form-group">
                            <label>${this.currentLanguage === 'en' ? 'Company' : 'Компания'}</label>
                            <input type="text" required>
                        </div>
                        <div class="form-group">
                            <label>${this.currentLanguage === 'en' ? 'Preferred Date' : 'Предпочтительная дата'}</label>
                            <input type="datetime-local" required>
                        </div>
                        <button type="submit" class="premium-btn">
                            ${this.currentLanguage === 'en' ? 'Schedule Meeting' : 'Запланировать встречу'}
                        </button>
                    </form>
                </div>
            </div>
        `;

        return modal;
    }

    showModal(modal) {
        document.body.style.overflow = 'hidden';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }

    // ========== СЛУЖЕБНЫЕ МЕТОДЫ ==========
    setupEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Инициализация мобильного меню
        this.setupMobileMenu();
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        
        if (!this.isMobile) {
            this.closeMobileMenu();
        }
    }

    handleScroll() {
        this.scrollPosition = window.pageYOffset;
        this.updateScrollEffects();
    }

    updateScrollEffects() {
        // Обновление параллакс эффектов
        this.updateParallax();
        
        // Обновление прогресс-бара
        this.updateScrollProgress();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // ========== ДЕСТРУКТОР И ОЧИСТКА ==========
    destroy() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        this.isInitialized = false;
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ==========
let premiumWebsite;

document.addEventListener('DOMContentLoaded', () => {
    premiumWebsite = new PremiumWebsite();
});

// Глобальные функции для вызова из HTML
window.toggleMobileMenu = () => premiumWebsite?.toggleMobileMenu();
window.downloadReport = () => premiumWebsite?.downloadReport();
window.requestConsultation = () => premiumWebsite?.requestConsultation();

// Защита от случайного удаления
Object.defineProperty(window, 'premiumWebsite', {
    value: premiumWebsite,
    writable: false,
    configurable: false
});

console.log('💎 North West Atlas B Corp - Premium JavaScript loaded');

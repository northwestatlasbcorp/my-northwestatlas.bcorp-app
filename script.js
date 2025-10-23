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
        
        // Данные для модальных окон экспертизы
        this.expertiseData = {
            ai: {
                title: "Искусственный интеллект и машинное обучение",
                icon: "🤖",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">🤖</span>
                            <h3>Искусственный интеллект и машинное обучение</h3>
                        </div>
                        <div class="expertise-body">
                            <p>Используем передовые алгоритмы AI и ML для автоматизированного анализа данных, включая обработку естественного языка, компьютерное зрение и предиктивную аналитику. Наши решения помогают выявлять скрытые закономерности и принимать более обоснованные решения.</p>
                            
                            <div class="expertise-features">
                                <h4>Ключевые возможности:</h4>
                                <ul>
                                    <li>Глубокая аналитика ESG-данных</li>
                                    <li>Предиктивное моделирование рисков</li>
                                    <li>Автоматизированная генерация отчетов</li>
                                    <li>Компьютерное зрение для анализа документов</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "2-4 недели",
                complexity: "Высокая"
            },
            "big-data": {
                title: "Анализ больших данных",
                icon: "📊",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">📊</span>
                            <h3>Анализ больших данных</h3>
                        </div>
                        <div class="expertise-body">
                            <p>Обрабатываем миллионы ESG-документов в реальном времени, используя распределенные вычисления и облачные технологии. Наша инфраструктура позволяет анализировать структурированные и неструктурированные данные из различных источников для формирования целостной картины.</p>
                            
                            <div class="expertise-features">
                                <h4>Технологический стек:</h4>
                                <ul>
                                    <li>Apache Spark для распределенных вычислений</li>
                                    <li>Hadoop для хранения больших данных</li>
                                    <li>Real-time analytics pipelines</li>
                                    <li>Облачные решения AWS/Azure</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "3-6 недель",
                complexity: "Средняя"
            },
            risks: {
                title: "Оценка ESG-рисков",
                icon: "⚡",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">⚡</span>
                            <h3>Оценка ESG-рисков</h3>
                        </div>
                        <div class="expertise-body">
                            <p>Применяем ML и big data для ESG-оценок, создавая многофакторные модели риска, учитывающие как традиционные финансовые показатели, так и нефинансовые метрики устойчивого развития. Наш подход позволяет выявлять скрытые риски и возможности.</p>
                            
                            <div class="expertise-features">
                                <h4>Области оценки:</h4>
                                <ul>
                                    <li>Климатические риски и возможности</li>
                                    <li>Социальная ответственность</li>
                                    <li>Корпоративное управление</li>
                                    <li>Цепочки поставок</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "2-3 недели",
                complexity: "Высокая"
            },
            scaling: {
                title: "Масштабирование бизнеса",
                icon: "🚀",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">🚀</span>
                            <h3>Масштабирование бизнеса</h3>
                        </div>
                        <div class="expertise-body">
                            <p>Разрабатываем стратегии устойчивого роста, основанные на глубоком анализе рынка и конкурентной среды. Наша команда помогает компаниям выйти на новые рынки, оптимизировать бизнес-процессы и внедрить инновационные технологии для обеспечения долгосрочного успеха.</p>
                            
                            <div class="expertise-features">
                                <h4>Стратегические направления:</h4>
                                <ul>
                                    <li>Выход на международные рынки</li>
                                    <li>Оптимизация операционной деятельности</li>
                                    <li>Цифровая трансформация</li>
                                    <li>Управление ростом</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "4-8 недель",
                complexity: "Средняя"
            },
            legal: {
                title: "Юридическое сопровождение",
                icon: "⚖️",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">⚖️</span>
                            <h3>Юридическое сопровождение</h3>
                        </div>
                        <div class="expertise-body">
                            <p>Защита прав инвесторов и сопровождение сделок на всех этапах, от структурирования до закрытия. Наши юристы специализируются на венчурных инвестициях, M&A, интеллектуальной собственности и международном праве, обеспечивая надежную правовую защиту ваших интересов.</p>
                            
                            <div class="expertise-features">
                                <h4>Юридические услуги:</h4>
                                <ul>
                                    <li>Структурирование инвестиционных сделок</li>
                                    <li>Due diligence и оценка рисков</li>
                                    <li>Международное право и compliance</li>
                                    <li>Защита интеллектуальной собственности</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "1-2 недели",
                complexity: "Высокая"
            },
            patents: {
                title: "Патентование",
                icon: "📝",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">📝</span>
                            <h3>Патентование</h3>
                        </div>
                        <div class="expertise-body">
                            <p>Комплексное патентное обеспечение и экспертиза, включая патентный поиск, подготовку и подачу заявок, защиту прав интеллектуальной собственности. Мы помогаем изобретателям и компаниям защитить свои инновации и максимизировать их коммерческую ценность.</p>
                            
                            <div class="expertise-features">
                                <h4>Патентые услуги:</h4>
                                <ul>
                                    <li>Патентный поиск и анализ</li>
                                    <li>Подготовка патентных заявок</li>
                                    <li>Международное патентование</li>
                                    <li>Защита от патентных исков</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "3-6 месяцев",
                complexity: "Очень высокая"
            }
        };

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
        this.setupExpertiseModals(); // ✅ ДОБАВЛЕНО: Система модальных окон
        
        this.isInitialized = true;
        console.log('🚀 North West Atlas B Corp - Премиум сайт инициализирован');
    }

    // ========== СИСТЕМА МОДАЛЬНЫХ ОКОН ЭКСПЕРТИЗЫ ==========
    setupExpertiseModals() {
        // Создаем контейнер для модальных окон
        this.createModalContainer();
        
        // Добавляем обработчики для карточек экспертизы
        this.attachExpertiseHandlers();
        
        // Обработчики для кнопок "Узнать больше"
        this.attachReadMoreHandlers();
    }

    createModalContainer() {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'expertise-modals-container';
        modalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(modalContainer);
        this.modalContainer = modalContainer;
    }

    attachExpertiseHandlers() {
        // Обработчики для клика по карточкам экспертизы
        const expertiseCards = document.querySelectorAll('.expertise-card');
        expertiseCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.read-more')) {
                    const expertiseType = card.dataset.expertise;
                    if (expertiseType) {
                        this.openExpertiseModal(expertiseType);
                    }
                }
            });
        });
    }

    attachReadMoreHandlers() {
        // Обработчики для кнопок "Узнать больше"
        const readMoreButtons = document.querySelectorAll('.read-more');
        readMoreButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.expertise-card');
                if (card) {
                    const expertiseType = card.dataset.expertise;
                    if (expertiseType) {
                        this.openExpertiseModal(expertiseType);
                    }
                }
            });
        });
    }

    openExpertiseModal(expertiseType) {
        const expertise = this.expertiseData[expertiseType];
        if (!expertise) return;

        // Создаем премиальное модальное окно
        const modal = this.createExpertiseModal(expertise);
        
        // Показываем модальное окно с анимацией
        this.showExpertiseModal(modal);
    }

    createExpertiseModal(expertise) {
        const modal = document.createElement('div');
        modal.className = 'premium-expertise-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="premiumWebsite.closeExpertiseModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title-section">
                        <span class="modal-icon">${expertise.icon}</span>
                        <h3>${expertise.title}</h3>
                    </div>
                    <button class="modal-close" onclick="premiumWebsite.closeExpertiseModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    ${expertise.content}
                    
                    <div class="expertise-meta">
                        <div class="meta-item">
                            <span class="meta-label">Срок реализации:</span>
                            <span class="meta-value">${expertise.duration}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Сложность:</span>
                            <span class="meta-value complexity-${expertise.complexity.toLowerCase()}">${expertise.complexity}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="premiumWebsite.closeExpertiseModal()">
                        Закрыть
                    </button>
                    <button class="btn-primary" onclick="premiumWebsite.requestExpertiseConsultation('${expertise.title}')">
                        <i class="fas fa-calendar-check"></i>
                        Заказать консультацию
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    showExpertiseModal(modal) {
        // Очищаем контейнер
        this.modalContainer.innerHTML = '';
        this.modalContainer.appendChild(modal);
        
        // Показываем контейнер
        this.modalContainer.style.display = 'flex';
        
        // Анимация появления
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('active');
        }, 10);

        // Блокируем скролл body
        document.body.style.overflow = 'hidden';
    }

    closeExpertiseModal() {
        const modalContent = this.modalContainer.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('active');
            
            setTimeout(() => {
                this.modalContainer.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    requestExpertiseConsultation(expertiseTitle) {
        this.closeExpertiseModal();
        
        // Создаем модальное окно консультации с предзаполненной темой
        const consultationModal = this.createConsultationModal(expertiseTitle);
        document.body.appendChild(consultationModal);
        this.showModal(consultationModal);
    }

    createConsultationModal(expertiseTitle = '') {
        const modal = document.createElement('div');
        modal.className = 'premium-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="premiumWebsite.closeModal(this.parentElement)"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Запрос консультации</h3>
                    <button class="modal-close" onclick="premiumWebsite.closeModal(this.closest('.premium-modal'))">×</button>
                </div>
                <div class="modal-body">
                    <form id="expertise-consultation-form">
                        <div class="form-group">
                            <label>Тема консультации</label>
                            <input type="text" value="${expertiseTitle}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Ваше имя *</label>
                            <input type="text" required>
                        </div>
                        <div class="form-group">
                            <label>Компания *</label>
                            <input type="text" required>
                        </div>
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" required>
                        </div>
                        <div class="form-group">
                            <label>Телефон</label>
                            <input type="tel">
                        </div>
                        <div class="form-group">
                            <label>Предпочтительная дата</label>
                            <input type="datetime-local">
                        </div>
                        <div class="form-group">
                            <label>Дополнительная информация</label>
                            <textarea rows="4" placeholder="Опишите ваши потребности..."></textarea>
                        </div>
                        <button type="submit" class="premium-btn">
                            <i class="fas fa-paper-plane"></i>
                            Отправить запрос
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Добавляем обработчик формы
        setTimeout(() => {
            const form = modal.querySelector('#expertise-consultation-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleExpertiseConsultation(form, expertiseTitle);
                });
            }
        }, 100);

        return modal;
    }

    async handleExpertiseConsultation(form, expertiseTitle) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Показ загрузки
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;

        try {
            // Имитация отправки на сервер
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Запрос на консультацию отправлен! Мы свяжемся с вами в течение 24 часов.', 'success');
            this.closeModal(form.closest('.premium-modal'));
            
        } catch (error) {
            this.showNotification('Ошибка отправки. Попробуйте еще раз.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // ========== ОБНОВЛЕННАЯ СИСТЕМА АНИМАЦИЙ ==========
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
        
        // Анимация карточек экспертизы
        this.animateExpertiseCards();
        
        // Параллакс эффекты
        this.setupParallaxEffects();
        
        // Анимация чисел
        this.setupCounterAnimation();
    }

    animateExpertiseCards() {
        const expertiseCards = document.querySelectorAll('.expertise-card');
        
        expertiseCards.forEach((card, index) => {
            // Добавляем атрибут данных для идентификации типа экспертизы
            const expertiseTypes = ['ai', 'big-data', 'risks', 'scaling', 'legal', 'patents'];
            if (expertiseTypes[index]) {
                card.dataset.expertise = expertiseTypes[index];
            }

            // Сложная анимация при наведении
            card.addEventListener('mouseenter', (e) => {
                if (!this.isMobile) {
                    this.animateCardHover(card, true);
                }
            });

            card.addEventListener('mouseleave', (e) => {
                if (!this.isMobile) {
                    this.animateCardHover(card, false);
                }
            });
        });
    }

    animateCardHover(card, isHovering) {
        if (isHovering) {
            anime({
                targets: card,
                translateY: -15,
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(212, 175, 55, 0.3)',
                duration: 600,
                easing: 'easeOutCubic'
            });
        } else {
            anime({
                targets: card,
                translateY: 0,
                scale: 1,
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                duration: 400,
                easing: 'easeOutCubic'
            });
        }
    }

    // ========== ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ==========
    
    // ... (остальные методы остаются без изменений из предыдущего кода)

    setupEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Инициализация мобильного меню
        this.setupMobileMenu();
        
        // Закрытие модальных окон по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeExpertiseModal();
                this.closeAllModals();
            }
        });
    }

    closeAllModals() {
        this.closeExpertiseModal();
        document.querySelectorAll('.premium-modal').forEach(modal => {
            this.closeModal(modal);
        });
    }

    // ... (остальной код без изменений)
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
window.openExpertiseModal = (type) => premiumWebsite?.openExpertiseModal(type);
window.closeExpertiseModal = () => premiumWebsite?.closeExpertiseModal();

// Защита от случайного удаления
Object.defineProperty(window, 'premiumWebsite', {
    value: premiumWebsite,
    writable: false,
    configurable: false
});

console.log('💎 North West Atlas B Corp - Premium JavaScript with Expertise Modals loaded');

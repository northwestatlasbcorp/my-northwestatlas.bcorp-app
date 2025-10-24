// Detect current page language
function getCurrentLanguage() {
    return window.location.pathname.includes('/en.html') ? 'en' : 'ru';
}

// Объявление AOS
const AOS = window.AOS;

// Инициализация AOS для анимаций
document.addEventListener("DOMContentLoaded", () => {
    AOS.init({
        duration: 800,
        easing: "ease",
        once: false,
        mirror: false,
        anchorPlacement: "top-bottom",
    });
});

// Установка текущего года в футере
document.getElementById("current-year").textContent = new Date().getFullYear();

// Инициализация активного пункта меню при скролле
function initScrollSpy() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });
}

// Изменение шапки при скролле
function initHeaderScroll() {
    const header = document.getElementById("header");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

// Функция для переключения меню
function toggleMenu() {
    const menu = document.getElementById("nav-menu");
    menu.classList.toggle("active");
}

// Показ/скрытие контактов
function toggleContacts() {
    const contacts = document.getElementById("contacts");
    const button = document.getElementById("show-contacts-btn");

    if (contacts.style.display === "none" || contacts.style.display === "") {
        contacts.style.display = "block";
        contacts.style.opacity = "0";
        contacts.style.transition = "opacity 0.5s ease-in-out";

        setTimeout(() => {
            contacts.style.opacity = "1";
        }, 10);

        button.textContent = getCurrentLanguage() === 'en' ? 'Hide' : 'Скрыть';
    } else {
        contacts.style.opacity = "0";

        setTimeout(() => {
            contacts.style.display = "none";
        }, 500);

        button.textContent = getCurrentLanguage() === 'en' ? 'Show' : 'Показать';
    }
}

// Объект с данными для модальных окон
const expertiseData = {
    ai: {
        title: "Искусственный интеллект и машинное обучение",
        content: `<p>Используем передовые алгоритмы AI и ML для автоматизированного анализа данных, включая обработку естественного языка, компьютерное зрение и предиктивную аналитику. Наши решения помогают выявлять скрытые закономерности и принимать более обоснованные решения.</p>`,
    },
    "big-data": {
        title: "Анализ больших данных",
        content: `<p>Обрабатываем миллионы ESG-документов в реальном времени, используя распределенные вычисления и облачные технологии. Наша инфраструктура позволяет анализировать структурированные и неструктурированные данные из различных источников для формирования целостной картины.</p>`,
    },
    risks: {
        title: "Оценка ESG-рисков",
        content: `<p>Применяем ML и big data для ESG-оценок, создавая многофакторные модели риска, учитывающие как традиционные финансовые показатели, так и нефинансовые метрики устойчивого развития. Наш подход позволяет выявлять скрытые риски и возможности.</p>`,
    },
    scaling: {
        title: "Масштабирование бизнеса",
        content: `<p>Разрабатываем стратегии устойчивого роста, основанные на глубоком анализе рынка и конкурентной среды. Наша команда помогает компаниям выйти на новые рынки, оптимизировать бизнес-процессы и внедрить инновационные технологии для обеспечения долгосрочного успеха.</p>`,
    },
    legal: {
        title: "Юридическое сопровождение",
        content: `<p>Защита прав инвесторов и сопровождение сделок на всех этапах, от структурирования до закрытия. Наши юристы специализируются на венчурных инвестициях, M&A, интеллектуальной собственности и международном праве, обеспечивая надежную правовую защиту ваших интересов.</p>`,
    },
    patents: {
        title: "Патентование",
        content: `<p>Комплексное патентное обеспечение и экспертиза, включая патентный поиск, подготовку и подачу заявок, защиту прав интеллектуальной собственности. Мы помогаем изобретателям и компаниям защитить свои инновации и максимизировать их коммерческую ценность.</p>`,
    },
};

// Открытие модального окна
function openPopup(expertise) {
    const popup = document.getElementById("popup-modal");
    const title = document.getElementById("popup-title");
    const details = document.getElementById("popup-details");

    const data = expertiseData[expertise];
    if (!data) return;

    title.textContent = data.title;
    details.innerHTML = data.content;
    
    // Показываем модальное окно
    popup.style.display = "flex";
    document.body.style.overflow = "hidden"; // Блокируем скролл страницы
    
    // Анимация появления
    setTimeout(() => {
        popup.style.opacity = "1";
        const content = popup.querySelector('.popup-content');
        content.style.transform = "scale(1)";
        content.style.opacity = "1";
    }, 10);
}

// Закрытие модального окна
function closePopup() {
    const popup = document.getElementById("popup-modal");
    const content = popup.querySelector('.popup-content');
    
    // Анимация закрытия
    popup.style.opacity = "0";
    content.style.transform = "scale(0.9)";
    content.style.opacity = "0";
    
    setTimeout(() => {
        popup.style.display = "none";
        document.body.style.overflow = ""; // Разблокируем скролл страницы
    }, 300);
}

// ESG Calculator data - BILINGUAL
const ratingsDataRU = {
    solidcore: {
        ratings: [
            ["Sustainalytics", "8.5"],
            ["Refinitiv", "92"],
            ["MSCI", "AA"],
            ["RAEX Europe", "A+"],
            ["NRA ESG", "A1.esg"],
            ["Средняя согласованность рейтингов", "7.50"],
            ["Соответствие ЦУР №7", "Высокие показатели"],
            ["Соответствие ЦУР №5", "Средние показатели"],
            ["Историческая динамика RAEX Europe", "+5%"],
            ["Историческая динамика MSCI", "-3%"],
            ["ESG-профиль (E)", "Отличное управление выбросами CO2"],
            ["ESG-профиль (S)", "Программы поддержки местных сообществ"],
            ["ESG-профиль (G)", "Недостаточная прозрачность управления рисками"],
        ],
        recommendations: [
            { title: "Оригинальность", text: "Проект демонстрирует высокую степень уникальности." },
            { title: "Новизна", text: "Проект подтверждает свою патентную чистоту." },
            { title: "Проработанность", text: "Проект требует более детального описания целей." },
            { title: "Эффективность", text: "Проект обладает высокой потенциальной доходностью." },
            { title: "Ресурсное обеспечение", text: "Проект требует дополнительного анализа потребностей." },
            { title: "Коммерциализируемость", text: "Проект требует доработки бизнес-модели." },
        ],
    },
};

const ratingsDataEN = {
    solidcore: {
        ratings: [
            ["Sustainalytics", "8.5"],
            ["Refinitiv", "92"],
            ["MSCI", "AA"],
            ["RAEX Europe", "A+"],
            ["NRA ESG", "A1.esg"],
            ["Average rating consistency", "7.50"],
            ["SDG #7 compliance", "High performance"],
            ["SDG #5 compliance", "Medium performance"],
            ["RAEX Europe historical dynamics", "+5%"],
            ["MSCI historical dynamics", "-3%"],
            ["ESG profile (E)", "Excellent CO2 emission management"],
            ["ESG profile (S)", "Local community support programs"],
            ["ESG profile (G)", "Insufficient risk management transparency"],
        ],
        recommendations: [
            { title: "Originality", text: "The project demonstrates a high degree of uniqueness." },
            { title: "Innovation", text: "The project confirms its patent cleanliness." },
            { title: "Development", text: "The project requires more detailed goal description." },
            { title: "Efficiency", text: "The project has high potential profitability." },
            { title: "Resource Support", text: "The project requires additional needs analysis." },
            { title: "Commercializability", text: "The project requires business model refinement." },
        ],
    },
};

// Select ratings based on language
const ratingsData = getCurrentLanguage() === 'en' ? ratingsDataEN : ratingsDataRU;

// Переключение отображения рейтингов
function toggleRatings() {
    const result = document.getElementById("result");
    const recommendations = document.getElementById("expert-recommendations");
    const button = document.getElementById("ratings-button");

    if (!result.classList.contains("active")) {
        loadRatings();
        result.classList.add("active");
        recommendations.classList.add("active");
        button.textContent = getCurrentLanguage() === 'en' ? 'HIDE RATINGS' : 'СКРЫТЬ РЕЙТИНГИ';
    } else {
        result.classList.remove("active");
        recommendations.classList.remove("active");
        button.textContent = getCurrentLanguage() === 'en' ? 'LOAD RATINGS' : 'ЗАГРУЗИТЬ РЕЙТИНГИ';
    }
}

// Генерация рейтингов и рекомендаций
function loadRatings() {
    const company = document.getElementById("company").value;
    const resultDiv = document.getElementById("result");
    const recommendationsDiv = document.getElementById("expert-recommendations");

    if (!ratingsData[company]) {
        resultDiv.innerHTML = "<p>Данные о компании не найдены.</p>";
        recommendationsDiv.innerHTML = "";
        return;
    }

    // Генерация таблицы
    const tableTitle = getCurrentLanguage() === 'en' ? 'ESG Ratings' : 'ESG Рейтинги';
    let tableHTML = `<h3 class="recommendation-title">${tableTitle}</h3><table class="ratings-table"><thead><tr><th>${getCurrentLanguage() === 'en' ? 'Indicator' : 'Показатель'}</th><th>${getCurrentLanguage() === 'en' ? 'Rating' : 'Оценка'}</th></tr></thead><tbody>`;
    ratingsData[company].ratings.forEach((row) => {
        tableHTML += `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;
    resultDiv.innerHTML = tableHTML;

    // Генерация рекомендаций
    const recTitle = getCurrentLanguage() === 'en' ? 'Expert Recommendations' : 'Экспертные рекомендации';
    let recommendationsHTML = `<h3 class="recommendation-title">${recTitle}</h3><div class="recommendation-grid">`;
    ratingsData[company].recommendations.forEach((rec) => {
        recommendationsHTML += `<div class="recommendation-card"><h4>${rec.title}</h4><p>${rec.text}</p></div>`;
    });
    
    // ИСПРАВЛЕНИЕ: добавляем проверку языка для кнопки
    const downloadText = getCurrentLanguage() === 'en' ? 'Download Report' : 'Полный доступ — по запросу';
    recommendationsHTML += `</div><button class="download-button gold-button" onclick="downloadExcel()"><i class="fas fa-download"></i> ${downloadText}</button>`;
    
    recommendationsDiv.innerHTML = recommendationsHTML;
}

// Функция скачивания отчёта
function downloadExcel() {
    // Создаем данные для CSV файла
    const company = document.getElementById("company").value;
    const data = ratingsData[company];

    if (!data) {
        alert(getCurrentLanguage() === 'en' ? "Company data not found." : "Данные о компании не найдены.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (getCurrentLanguage() === 'en') {
        csvContent += "Indicator,Rating\n";
        data.ratings.forEach((row) => {
            csvContent += `"${row[0]}","${row[1]}"\n`;
        });
        csvContent += "\nRecommendations\n";
        data.recommendations.forEach((rec) => {
            csvContent += `"${rec.title}","${rec.text}"\n`;
        });
    } else {
        csvContent += "Показатель,Оценка\n";
        data.ratings.forEach((row) => {
            csvContent += `"${row[0]}","${row[1]}"\n`;
        });
        csvContent += "\nРекомендации\n";
        data.recommendations.forEach((rec) => {
            csvContent += `"${rec.title}","${rec.text}"\n`;
        });
    }

    // Кодируем URI
    const encodedUri = encodeURI(csvContent);

    // Создаем временную ссылку для скачивания
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = getCurrentLanguage() === 'en' 
        ? `ESG_Report_${company}_${new Date().toISOString().split("T")[0]}.csv`
        : `ESG_Отчет_${company}_${new Date().toISOString().split("T")[0]}.csv`;
    
    link.setAttribute("download", fileName);
    document.body.appendChild(link);

    // Имитируем клик по ссылке
    link.click();

    // Удаляем ссылку
    document.body.removeChild(link);
}

// ========== ПРЕМИАЛЬНЫЕ ЭФФЕКТЫ ДЛЯ ЗОЛОТЫХ ЭЛЕМЕНТОВ ==========

// Инициализация эффектов для элементов с data-gold-glow
function initGoldEffects() {
    const goldElements = document.querySelectorAll('[data-gold-glow]');
    
    goldElements.forEach(element => {
        // Добавляем обработчики для интерактивных эффектов
        if (element.classList.contains('about-card') || 
            element.classList.contains('expertise-card') || 
            element.classList.contains('methodology-card')) {
            
            element.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        }
    });
}

// Улучшенное свечение логотипа с поддержкой премиальных эффектов
function initPremiumLogoEffects() {
    const logo = document.getElementById('main-logo');
    
    if (logo) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            // Более плавное изменение свечения
            const glowIntensity = 0.6 + (x + y) / 2 * 0.4;
            const glowSize = 25 + (x + y) / 2 * 35;
            
            logo.style.filter = `
                drop-shadow(0 0 ${glowSize}px rgba(212, 175, 55, ${glowIntensity}))
                drop-shadow(0 0 ${glowSize * 1.5}px rgba(212, 175, 55, ${glowIntensity * 0.8}))
                drop-shadow(0 0 ${glowSize * 2}px rgba(212, 175, 55, ${glowIntensity * 0.5}))
            `;
            
            // Легкое движение логотипа в ответ на курсор
            const moveX = (x - 0.5) * 10;
            const moveY = (y - 0.5) * 10;
            logo.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        });
    }
}

// ========== УЛУЧШЕННЫЙ SATURN CURSOR С ПЛАЗМОЙ ==========

let mouseX = 0, mouseY = 0;
let saturnX = 0, saturnY = 0;
const delay = 0.08; // Увеличена скорость для более отзывчивого курсора

function createSaturnCursor() {
    const saturn = document.createElement('div');
    saturn.className = 'saturn';
    
    // Добавляем плазменный эффект
    const plasma = document.createElement('div');
    plasma.className = 'saturn-plasma';
    saturn.appendChild(plasma);
    
    document.body.appendChild(saturn);
    return saturn;
}

function initSaturnCursor() {
    const saturn = document.querySelector('.saturn') || createSaturnCursor();
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateSaturn() {
        saturnX += (mouseX - saturnX) * delay;
        saturnY += (mouseY - saturnY) * delay;
        saturn.style.transform = `translate(${saturnX}px, ${saturnY}px)`;
        requestAnimationFrame(animateSaturn);
    }

    // Добавляем эффекты при наведении на интерактивные элементы
    const interactiveElements = document.querySelectorAll('a, button, .nav-link, .read-more, .submit-btn, .gold-button');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            saturn.style.transform = `translate(${saturnX}px, ${saturnY}px) scale(1.3)`;
        });
        
        el.addEventListener('mouseleave', () => {
            saturn.style.transform = `translate(${saturnX}px, ${saturnY}px) scale(1)`;
        });
    });

    animateSaturn();
}

// ========== УЛУЧШЕННАЯ ОБРАБОТКА ФОРМЫ ==========

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Анимация отправки
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + 
                                (getCurrentLanguage() === 'en' ? 'Sending...' : 'Отправка...');
            submitBtn.disabled = true;
            
            // Имитация отправки
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> ' + 
                                    (getCurrentLanguage() === 'en' ? 'Sent!' : 'Отправлено!');
                submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    contactForm.reset();
                }, 2000);
            }, 1500);
        });
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ВСЕХ ФУНКЦИЙ ==========

document.addEventListener("DOMContentLoaded", () => {
    initScrollSpy();
    initHeaderScroll();
    initGoldEffects();
    initPremiumLogoEffects();
    initSaturnCursor();
    initContactForm();
    
    // Плавная прокрутка до секций
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Анимация появления лого после загрузки
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Добавление/удаление класса scrolled при прокрутке
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ========== PARTICLES.JS НАСТРОЙКИ =======
window.addEventListener('load', function() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#d4af37'
            },
            shape: {
                type: 'circle',
            },
            opacity: {
                value: 0.5,
                random: false,
                anim: {
                    enable: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#d4af37',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 1
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
});

// ========== ПРЕМИАЛЬНОЕ УВЕДОМЛЕНИЕ ПРИ КОПИРОВАНИИ ==========
document.addEventListener('copy', (e) => {
    e.preventDefault();
    
    const lang = getCurrentLanguage();
    const messages = {
        'ru': '© North West Atlas B Corp — Контент защищён',
        'en': '© North West Atlas B Corp — Content Protected'
    };
    
    const notification = document.createElement('div');
    notification.textContent = messages[lang] || messages['en'];
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: #d4af37;
        padding: 20px 40px;
        border-radius: 10px;
        border: 2px solid #d4af37;
        font-size: 16px;
        font-family: 'Playfair Display', serif;
        letter-spacing: 1px;
        z-index: 99999;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.5);
        animation: fadeInOut 2s ease;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
        notification.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 1700);
});

// ========== ПРЕМИАЛЬНЫЙ PRELOADER ==========
window.addEventListener('load', function() {
    setTimeout(function() {
        const preloader = document.getElementById('preloader');
        preloader.style.opacity = '0';
        preloader.style.pointerEvents = 'none';
        preloader.style.transition = 'opacity 800ms cubic-bezier(.6,.9,.39,1.15)';
        setTimeout(function() {
            preloader.remove();
        }, 900);
    }, 2000);
});

// Скролл наверх при загрузке
document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);
});

window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});

if (window.history && window.history.scrollRestoration) {
    window.history.scrollRestoration = 'manual';
}

// ========== ОПТИМИЗАЦИЯ ДЛЯ МОБИЛЬНЫХ ==========

// Функция определения мобильного устройства
function isMobileDevice() {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Оптимизированная версия инициализации
function initOptimizedEffects() {
    if (isMobileDevice()) {
        // Отключаем тяжелые эффекты на мобильных
        disableHeavyEffects();
    } else {
        // На десктопе включаем все эффекты
        initPremiumEffects();
    }
}

function disableHeavyEffects() {
    // Отключаем Saturn курсор
    const saturn = document.querySelector('.saturn');
    if (saturn) saturn.style.display = 'none';
    
    // Упрощаем анимацию логотипа
    const logo = document.getElementById('main-logo');
    if (logo) {
        logo.style.animation = 'none';
        logo.style.filter = 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.6))';
    }
    
    // Отключаем сложные обработчики мыши
    document.removeEventListener('mousemove', handleMouseMove);
}

function initPremiumEffects() {
    // Инициализация премиальных эффектов только для десктопа
    initSaturnCursor();
    initPremiumLogoEffects();
}

// Упрощенный обработчик для мобильных
function handleMobileInteractions() {
    if (isMobileDevice()) {
        // Добавляем touch-оптимизированные обработчики
        const interactiveElements = document.querySelectorAll('.about-card, .expertise-card, .methodology-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.1s ease';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
}

// Оптимизированная инициализация частиц только для десктопа
function initOptimizedParticles() {
    if (!isMobileDevice() && typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 40, density: { enable: true, value_area: 800 } },
                color: { value: '#d4af37' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: false },
                size: { value: 2, random: true },
                line_linked: { 
                    enable: true, 
                    distance: 100, 
                    color: '#d4af37', 
                    opacity: 0.2, 
                    width: 1 
                },
                move: { 
                    enable: true, 
                    speed: 1, 
                    direction: 'none',
                    out_mode: 'out' 
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: false }, // Отключаем на мобильных
                    onclick: { enable: false }, // Отключаем на мобильных
                    resize: true
                }
            },
            retina_detect: true
        });
    }
}

// Обновите главную функцию инициализации
document.addEventListener("DOMContentLoaded", () => {
    initScrollSpy();
    initHeaderScroll();
    initOptimizedEffects();
    handleMobileInteractions();
    initOptimizedParticles();
    
    // Базовые функции для всех устройств
    initContactForm();
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Закрытие по клику на фон
document.addEventListener('click', function(e) {
    const popup = document.getElementById("popup-modal");
    if (e.target === popup) {
        closePopup();
    }
});

// Закрытие по ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePopup();
    }
});

// Улучшенные тултипы для мобильных
function initMobileTooltips() {
    if (isMobileDevice()) {
        const aboutCards = document.querySelectorAll('.about-card');
        
        aboutCards.forEach(card => {
            let tooltipTimeout;
            
            card.addEventListener('touchstart', function(e) {
                e.preventDefault();
                clearTimeout(tooltipTimeout);
                
                // Показываем тултип
                this.style.setProperty('--tooltip-visible', '1');
                
                // Скрываем через 3 секунды
                tooltipTimeout = setTimeout(() => {
                    this.style.setProperty('--tooltip-visible', '0');
                }, 3000);
            });
            
            card.addEventListener('touchend', function() {
                clearTimeout(tooltipTimeout);
            });
        });
    }
}

// Добавьте вызов функции в инициализацию
document.addEventListener("DOMContentLoaded", () => {
    // ... ваш существующий код ...
    initMobileTooltips(); // ДОБАВЬТЕ ЭТУ СТРОЧКУ
});

// ========== ФИКС ТУЛТИПОВ ДЛЯ МОБИЛЬНЫХ ==========

function initTooltips() {
    const aboutCards = document.querySelectorAll('.about-card');
    
    aboutCards.forEach(card => {
        let tooltipTimeout;
        let isTooltipVisible = false;
        
        // Для десктопов - hover
        card.addEventListener('mouseenter', function() {
            clearTimeout(tooltipTimeout);
            isTooltipVisible = true;
        });
        
        card.addEventListener('mouseleave', function() {
            clearTimeout(tooltipTimeout);
            isTooltipVisible = false;
        });
        
        // Для мобильных - tap
        if (isMobileDevice()) {
            card.addEventListener('touchstart', function(e) {
                e.preventDefault();
                clearTimeout(tooltipTimeout);
                
                if (!isTooltipVisible) {
                    // Показываем тултип
                    this.classList.add('tooltip-active');
                    isTooltipVisible = true;
                    
                    // Скрываем через 3 секунды
                    tooltipTimeout = setTimeout(() => {
                        this.classList.remove('tooltip-active');
                        isTooltipVisible = false;
                    }, 3000);
                } else {
                    // Скрываем тултип
                    this.classList.remove('tooltip-active');
                    isTooltipVisible = false;
                }
            });
            
            // Предотвращаем скролл при касании карточки
            card.addEventListener('touchmove', function(e) {
                if (isTooltipVisible) {
                    e.preventDefault();
                }
            });
        }
    });
}

// Добавьте класс для мобильных тултипов в CSS
const mobileTooltipCSS = `
.about-card.tooltip-active::before {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translate(-50%, -50%) scale(1) !important;
}
`;

// Вставка CSS для мобильных тултипов
const style = document.createElement('style');
style.textContent = mobileTooltipCSS;
document.head.appendChild(style);

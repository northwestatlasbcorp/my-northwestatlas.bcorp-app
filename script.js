// ========== NORTH WEST ATLAS B CORP - OPTIMIZED SCRIPT ==========
// Исправлены AOS конфликты и оптимизирована производительность

// Detect current page language
function getCurrentLanguage() {
    return window.location.pathname.includes('/en.html') ? 'en' : 'ru';
}

// ========== AOS INITIALIZATION - FIXED ==========
document.addEventListener("DOMContentLoaded", function() {
    console.log('🚀 DOM Content Loaded - Initializing AOS...');
    
    // Простая и надежная инициализация AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: "ease-in-out",
            once: true, // Анимация только один раз
            mirror: false,
            anchorPlacement: "top-bottom",
            disable: window.innerWidth < 768 // Отключаем на мобильных
        });
        
        console.log('✅ AOS initialized successfully');
    } else {
        console.warn('⚠️ AOS not loaded');
    }
});

// ========== BASIC FUNCTIONS ==========

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

// Функция для переключения мобильного меню
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const icon = menuToggle.querySelector('i');
    
    if (navMenu && menuToggle) {
        navMenu.classList.toggle('active');
        
        // Обновляем aria-атрибуты для accessibility
        const isExpanded = navMenu.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
        navMenu.setAttribute('aria-hidden', !isExpanded);
        
        // Меняем иконку
        if (isExpanded) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            // Блокируем скролл страницы когда меню открыто
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            // Разблокируем скролл
            document.body.style.overflow = '';
        }
    }
}

// Закрытие меню при клике на ссылку
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.getElementById('nav-menu');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                
                // Обновляем aria-атрибуты
                menuToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
                
                // Разблокируем скролл
                document.body.style.overflow = '';
            }
        });
    });
    
    // Закрытие меню при клике вне его области
    document.addEventListener('click', function(event) {
        const navMenu = document.getElementById('nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (navMenu && navMenu.classList.contains('active') && 
            !navMenu.contains(event.target) && 
            !menuToggle.contains(event.target)) {
            
            navMenu.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            
            // Обновляем aria-атрибуты
            menuToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
            
            // Разблокируем скролл
            document.body.style.overflow = '';
        }
    });
});

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

// ========== EXPERTISE POPUPS ==========

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
    document.body.style.overflow = "hidden";
    
    // Анимация появления
    setTimeout(() => {
        popup.classList.add('active');
    }, 10);
}

// Закрытие модального окна
function closePopup() {
    const popup = document.getElementById("popup-modal");
    
    // Анимация закрытия
    popup.classList.remove('active');
    
    setTimeout(() => {
        popup.style.display = "none";
        document.body.style.overflow = "";
    }, 300);
}

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

// ========== ESG CALCULATOR ==========

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
    
    const downloadText = getCurrentLanguage() === 'en' ? 'Download Report' : 'Полный доступ — по запросу';
    recommendationsHTML += `</div><button class="download-button gold-button" onclick="downloadExcel()"><i class="fas fa-download"></i> ${downloadText}</button>`;
    
    recommendationsDiv.innerHTML = recommendationsHTML;
}

// Функция скачивания отчёта
function downloadExcel() {
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

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = getCurrentLanguage() === 'en' 
        ? `ESG_Report_${company}_${new Date().toISOString().split("T")[0]}.csv`
        : `ESG_Отчет_${company}_${new Date().toISOString().split("T")[0]}.csv`;
    
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ========== CONTACT FORM ==========

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

// ========== PARTICLES.JS ==========

function initOptimizedParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 40,
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
                    value: 0.3,
                    random: false,
                },
                size: {
                    value: 2,
                    random: true,
                },
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
    }
}

// ========== TOOLTIPS ==========

function initTooltips() {
    // Простая инициализация тултипов
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            // Временное решение - показать alert для мобильных
            if (window.innerWidth <= 768) {
                // Для мобильных можно добавить специальное поведение
                console.log('Tooltip:', this.getAttribute('data-tooltip'));
            }
        });
    });
}

// ========== MAIN INITIALIZATION ==========

document.addEventListener("DOMContentLoaded", function() {
    console.log('🚀 Initializing North West Atlas B Corp...');
    
    // 1. Базовые функции
    initScrollSpy();
    initHeaderScroll();
    
    // 2. AOS уже инициализирован в начале файла
    
    // 3. Остальные функции
    initContactForm();
    initTooltips();
    
    // 4. Particles.js инициализируем после загрузки
    window.addEventListener('load', function() {
        initOptimizedParticles();
        
        // Обновляем AOS после полной загрузки
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
            console.log('✅ AOS refreshed after page load');
        }
    });
    
    console.log('✅ All systems initialized successfully');
});

// ========== UTILITY FUNCTIONS ==========

// Функция для принудительного обновления AOS (для отладки)
function refreshAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
        console.log('🔄 AOS manually refreshed');
    }
}

// Функция проверки статуса AOS
function checkAOS() {
    console.log('🔍 AOS Diagnostic:');
    console.log('- AOS loaded:', typeof AOS !== 'undefined');
    console.log('- Elements with data-aos:', document.querySelectorAll('[data-aos]').length);
    console.log('- Animated elements:', document.querySelectorAll('.aos-animate').length);
    
    return {
        aosLoaded: typeof AOS !== 'undefined',
        totalElements: document.querySelectorAll('[data-aos]').length,
        animatedElements: document.querySelectorAll('.aos-animate').length
    };
}

// ========== PRELOADER ==========

window.addEventListener('load', function() {
    setTimeout(function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
            preloader.style.transition = 'opacity 800ms ease';
            setTimeout(function() {
                preloader.remove();
            }, 900);
        }
    }, 2000);
});

// ========== CONTENT PROTECTION ==========

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

// ========== SMOOTH SCROLL ==========

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

// ========== SCROLL TO TOP ON RELOAD ==========

document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);
});

window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});

if (window.history && window.history.scrollRestoration) {
    window.history.scrollRestoration = 'manual';
}

console.log('🎯 North West Atlas B Corp script loaded successfully!');

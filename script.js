// ========== КАСТОМНЫЕ АНИМАЦИИ (замена AOS) ==========

// Detect current page language
function getCurrentLanguage() {
    return window.location.pathname.includes('/en.html') ? 'en' : 'ru';
}

// Кастомная система анимаций
class CustomAnimations {
    constructor() {
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        // Ждем полной загрузки страницы
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
        } else {
            this.setupAnimations();
        }

        // Запускаем анимации
        setTimeout(() => {
            this.animateOnScroll();
        }, 100);

        // Слушаем скролл
        window.addEventListener('scroll', () => this.animateOnScroll());
        window.addEventListener('resize', () => this.animateOnScroll());
    }

    setupAnimations() {
        // Находим все элементы с data-aos
        const elements = document.querySelectorAll('[data-aos]');
        
        elements.forEach(element => {
            // Удаляем data-aos атрибуты чтобы не мешали
            const animationType = element.getAttribute('data-aos');
            const delay = element.getAttribute('data-aos-delay') || 0;
            const duration = element.getAttribute('data-aos-duration') || 800;

            // Устанавливаем начальные стили
            this.setInitialStyles(element, animationType);
            
            // Сохраняем данные для анимации
            element._animationData = {
                type: animationType,
                delay: parseInt(delay),
                duration: parseInt(duration),
                animated: false
            };

            this.animatedElements.add(element);
        });

        console.log(`🎯 Настроено ${this.animatedElements.size} элементов для анимации`);
    }

    setInitialStyles(element, type) {
        const styles = {
            'fade-up': { opacity: '0', transform: 'translateY(30px)' },
            'fade-down': { opacity: '0', transform: 'translateY(-30px)' },
            'fade-left': { opacity: '0', transform: 'translateX(-30px)' },
            'fade-right': { opacity: '0', transform: 'translateX(30px)' },
            'zoom-in': { opacity: '0', transform: 'scale(0.9)' },
            'flip-left': { opacity: '0', transform: 'rotateY(-90deg)' }
        };

        const style = styles[type] || styles['fade-up'];
        
        Object.assign(element.style, {
            transition: `all ${element._animationData?.duration || 800}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            opacity: style.opacity,
            transform: style.transform,
            willChange: 'transform, opacity'
        });
    }

    animateOnScroll() {
        const windowHeight = window.innerHeight;
        const triggerOffset = 100;

        this.animatedElements.forEach(element => {
            if (element._animationData.animated) return;

            const rect = element.getBoundingClientRect();
            const elementTop = rect.top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                this.animateElement(element);
            }
        });
    }

    animateElement(element) {
        const data = element._animationData;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) translateX(0) scale(1) rotateY(0)';
            element._animationData.animated = true;
            
            // Добавляем класс для парящего эффекта карточек
            if (element.classList.contains('about-card') || 
                element.classList.contains('expertise-card') || 
                element.classList.contains('methodology-card') ||
                element.classList.contains('investment-block')) {
                setTimeout(() => {
                    element.classList.add('aos-animate');
                }, data.duration);
            }
        }, data.delay);
    }
}

// ========== ОСНОВНОЙ КОД ==========

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

        button.textContent = "Скрыть";
    } else {
        contacts.style.opacity = "0";

        setTimeout(() => {
            contacts.style.display = "none";
        }, 500);

        button.textContent = "Показать";
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
    title.textContent = data.title;
    details.innerHTML = data.content;
    popup.style.display = "flex";
}

// Закрытие модального окна
function closePopup() {
    const popup = document.getElementById("popup-modal");
    popup.style.display = "none";
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
        button.textContent = "СКРЫТЬ РЕЙТИНГИ";
    } else {
        result.classList.remove("active");
        recommendations.classList.remove("active");
        button.textContent = "ЗАГРУЗИТЬ РЕЙТИНГИ";
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
    let tableHTML = `<table class="ratings-table"><thead><tr><th>Показатель</th><th>Оценка</th></tr></thead><tbody>`;
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
    recommendationsHTML += `</div><button class="download-button" onclick="downloadExcel()"><i class="fas fa-download"></i> ${downloadText}</button>`;
    
    recommendationsDiv.innerHTML = recommendationsHTML;
}

// Функция скачивания отчёта
function downloadExcel() {
    // Создаем данные для CSV файла
    const company = document.getElementById("company").value;
    const data = ratingsData[company];

    if (!data) {
        alert("Данные о компании не найдены.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    // Добавляем заголовок
    csvContent += "Показатель,Оценка\n";

    // Добавляем данные рейтингов
    data.ratings.forEach((row) => {
        csvContent += `"${row[0]}","${row[1]}"\n`;
    });

    // Добавляем разделитель
    csvContent += "\nРекомендации\n";

    // Добавляем рекомендации
    data.recommendations.forEach((rec) => {
        csvContent += `"${rec.title}","${rec.text}"\n`;
    });

    // Кодируем URI
    const encodedUri = encodeURI(csvContent);

    // Создаем временную ссылку для скачивания
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ESG_Report_${company}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);

    // Имитируем клик по ссылке
    link.click();

    // Удаляем ссылку
    document.body.removeChild(link);
}

// Плавная прокрутка до секций
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// ======= PARTICLES.JS НАСТРОЙКИ =======
// Инициализация интерактивного фона с золотыми частицами
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
    }, 2000); // 2 секунды
});

// ========== ИНИЦИАЛИЗАЦИЯ ВСЕГО ==========
document.addEventListener("DOMContentLoaded", () => {
    // Запускаем кастомные анимации
    new CustomAnimations();
    
    // Инициализируем остальные функции
    initScrollSpy();
    initHeaderScroll();
    
    console.log("🚀 Сайт полностью загружен и готов");
});

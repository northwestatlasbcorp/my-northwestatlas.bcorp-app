// ========== NORTH WEST ATLAS B CORP - RESTORED SCRIPT ==========
// Все функции восстановлены и оптимизированы

// ========== GLOBAL VARIABLES ==========
let currentLanguage = 'ru';

// ========== AOS INITIALIZATION - FIXED ==========
document.addEventListener("DOMContentLoaded", function() {
    console.log('🚀 DOM Content Loaded - Initializing North West Atlas B Corp...');
    
    // Initialize current year
    document.getElementById("current-year").textContent = new Date().getFullYear();
    
    // Initialize AOS with proper settings
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: "ease-in-out-cubic",
            once: true,
            mirror: false,
            anchorPlacement: "top-bottom",
            disable: function() {
                return window.innerWidth < 768;
            }
        });
        console.log('✅ AOS initialized successfully');
    } else {
        console.warn('⚠️ AOS library not found');
    }

    // Initialize all components
    initializeAllComponents();
});

// ========== COMPREHENSIVE COMPONENT INITIALIZATION ==========
function initializeAllComponents() {
    console.log('🔄 Initializing all components...');
    
    // Initialize particles background
    initOptimizedParticles();
    
    // Initialize custom cursor
    initCursor();
    
    // Initialize partners marquee
    initMarquee();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize scroll spy
    initScrollSpy();
    
    // Initialize header scroll effect
    initHeaderScroll();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize mobile menu
    initMobileMenu();
    
    console.log('✅ All components initialized successfully');
}

// ========== PARTICLE BACKGROUND ==========
function initOptimizedParticles() {
    if (typeof particlesJS !== 'undefined') {
        console.log('🎯 Initializing particles.js background...');
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 50,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#d4af37'
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#d4af37',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
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
                            opacity: 0.4
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
        console.log('✅ Particles.js background initialized');
    } else {
        console.warn('⚠️ Particles.js not available');
    }
}

// ========== CUSTOM CURSOR ANIMATION ==========
function initCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const saturn = document.querySelector('.saturn');
    
    if (cursor && saturn) {
        console.log('🎯 Initializing custom cursor...');
        
        // Make cursor visible
        cursor.style.display = 'block';
        saturn.style.display = 'block';
        
        document.addEventListener('mousemove', (e) => {
            // Update cursor position immediately
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            
            // Update saturn position with slight delay for smooth effect
            setTimeout(() => {
                saturn.style.left = e.clientX - 20 + 'px';
                saturn.style.top = e.clientY - 20 + 'px';
            }, 50);
        });
        
        // Add hover effects to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .nav-link, .expertise-card, .about-card, .investment-block');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                saturn.style.transform = 'scale(1.2)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                saturn.style.transform = 'scale(1)';
            });
        });
        
        console.log('✅ Custom cursor initialized');
    } else {
        console.warn('⚠️ Custom cursor elements not found');
    }
}

// ========== PARTNERS MARQUEE ==========
function initMarquee() {
    const track = document.querySelector('.partners-track');
    if (track) {
        console.log('🎯 Initializing partners marquee...');
        
        // Reset and start animation
        track.style.animation = 'none';
        setTimeout(() => {
            track.style.animation = 'marquee 30s linear infinite';
        }, 100);
        
        // Pause animation on hover
        const marquee = document.querySelector('.partners-marquee');
        if (marquee) {
            marquee.addEventListener('mouseenter', () => {
                track.style.animationPlayState = 'paused';
            });
            
            marquee.addEventListener('mouseleave', () => {
                track.style.animationPlayState = 'running';
            });
        }
        
        console.log('✅ Partners marquee initialized');
    }
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        console.log('🎯 Mobile menu ready');
        
        // Close menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }
}

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = document.querySelector('.menu-toggle i');
    
    if (!navMenu) return;
    
    if (navMenu.classList.contains('active')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = document.querySelector('.menu-toggle i');
    
    navMenu.classList.add('active');
    menuIcon.classList.replace('fa-bars', 'fa-times');
    document.body.style.overflow = 'hidden';
    console.log('📱 Mobile menu opened');
}

function closeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = document.querySelector('.menu-toggle i');
    
    navMenu.classList.remove('active');
    menuIcon.classList.replace('fa-times', 'fa-bars');
    document.body.style.overflow = '';
    console.log('📱 Mobile menu closed');
}

// ========== SCROLL FUNCTIONS ==========
function initScrollSpy() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener("scroll", () => {
            let current = "";

            sections.forEach((section) => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;

                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
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
        console.log('✅ Scroll spy initialized');
    }
}

function initHeaderScroll() {
    const header = document.getElementById("header");
    
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.style.background = "rgba(13, 13, 13, 0.98)";
                header.style.backdropFilter = "blur(20px)";
            } else {
                header.style.background = "rgba(13, 13, 13, 0.95)";
                header.style.backdropFilter = "blur(20px)";
            }
        });
        console.log('✅ Header scroll effect initialized');
    }
}

// ========== EXPERTISE POPUPS ==========
const expertiseData = {
    ai: {
        title: "Искусственный интеллект и машинное обучение",
        content: `<p>Используем передовые алгоритмы AI и ML для автоматизированного анализа данных, включая обработку естественного языка, компьютерное зрение и предиктивную аналитику. Наши решения помогают выявлять скрытые закономерности и принимать более обоснованные решения.</p>
                 <ul>
                     <li>Анализ текстовых данных и NLP</li>
                     <li>Предиктивная аналитика и прогнозирование</li>
                     <li>Компьютерное зрение для анализа изображений</li>
                     <li>Рекомендательные системы</li>
                 </ul>`,
    },
    "big-data": {
        title: "Анализ больших данных",
        content: `<p>Обрабатываем миллионы ESG-документов в реальном времени, используя распределенные вычисления и облачные технологии. Наша инфраструктура позволяет анализировать структурированные и неструктурированные данные из различных источников для формирования целостной картины.</p>
                 <ul>
                     <li>Обработка больших объемов данных в реальном времени</li>
                     <li>Анализ структурированных и неструктурированных данных</li>
                     <li>Интеграция данных из множества источников</li>
                     <li>Визуализация и отчетность</li>
                 </ul>`,
    },
    risks: {
        title: "Оценка ESG-рисков",
        content: `<p>Применяем ML и big data для ESG-оценок, создавая многофакторные модели риска, учитывающие как традиционные финансовые показатели, так и нефинансовые метрики устойчивого развития. Наш подход позволяет выявлять скрытые риски и возможности.</p>
                 <ul>
                     <li>Многофакторные модели оценки рисков</li>
                     <li>Анализ ESG-показателей</li>
                     <li>Выявление скрытых рисков и возможностей</li>
                     <li>Мониторинг изменений в реальном времени</li>
                 </ul>`,
    },
    scaling: {
        title: "Масштабирование бизнеса",
        content: `<p>Разрабатываем стратегии устойчивого роста, основанные на глубоком анализе рынка и конкурентной среды. Наша команда помогает компаниям выйти на новые рынки, оптимизировать бизнес-процессы и внедрить инновационные технологии для обеспечения долгосрочного успеха.</p>
                 <ul>
                     <li>Стратегическое планирование роста</li>
                     <li>Оптимизация бизнес-процессов</li>
                     <li>Выход на новые рынки</li>
                     <li>Внедрение инновационных технологий</li>
                 </ul>`,
    },
    legal: {
        title: "Юридическое сопровождение",
        content: `<p>Защита прав инвесторов и сопровождение сделок на всех этапах, от структурирования до закрытия. Наши юристы специализируются на венчурных инвестициях, M&A, интеллектуальной собственности и международном праве, обеспечивая надежную правовую защиту ваших интересов.</p>
                 <ul>
                     <li>Структурирование и сопровождение сделок</li>
                     <li>Защита прав интеллектуальной собственности</li>
                     <li>Международное право и compliance</li>
                     <li>Венчурные инвестиции и M&A</li>
                 </ul>`,
    },
    patents: {
        title: "Патентование",
        content: `<p>Комплексное патентное обеспечение и экспертиза, включая патентный поиск, подготовку и подачу заявок, защиту прав интеллектуальной собственности. Мы помогаем изобретателям и компаниям защитить свои инновации и максимизировать их коммерческую ценность.</p>
                 <ul>
                     <li>Патентный поиск и экспертиза</li>
                     <li>Подготовка и подача заявок</li>
                     <li>Защита прав интеллектуальной собственности</li>
                     <li>Коммерциализация инноваций</li>
                 </ul>`,
    },
};

function openPopup(expertise) {
    const popup = document.getElementById("popup-modal");
    const title = document.getElementById("popup-title");
    const details = document.getElementById("popup-details");

    const data = expertiseData[expertise];
    if (!data) {
        console.error('❌ Expertise data not found:', expertise);
        return;
    }

    title.textContent = data.title;
    details.innerHTML = data.content;
    
    // Show modal
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
    
    // Animate in
    setTimeout(() => {
        popup.classList.add('active');
    }, 10);
    
    console.log('📁 Modal opened:', expertise);
}

function closePopup() {
    const popup = document.getElementById("popup-modal");
    
    // Animate out
    popup.classList.remove('active');
    
    setTimeout(() => {
        popup.style.display = "none";
        document.body.style.overflow = "";
    }, 300);
    
    console.log('📁 Modal closed');
}

// Close modal on background click and ESC key
document.addEventListener('click', function(e) {
    const popup = document.getElementById("popup-modal");
    if (e.target === popup) {
        closePopup();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePopup();
    }
});

// ========== ESG CALCULATOR ==========
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

function getCurrentLanguage() {
    return window.location.pathname.includes('/en.html') ? 'en' : 'ru';
}

function toggleRatings() {
    const result = document.getElementById("result");
    const recommendations = document.getElementById("expert-recommendations");
    const button = document.getElementById("ratings-button");

    if (!result.classList.contains("active")) {
        loadRatings();
        result.classList.add("active");
        recommendations.classList.add("active");
        button.textContent = getCurrentLanguage() === 'en' ? 'HIDE RATINGS' : 'СКРЫТЬ РЕЙТИНГИ';
        console.log('📊 ESG Ratings shown');
    } else {
        result.classList.remove("active");
        recommendations.classList.remove("active");
        button.textContent = getCurrentLanguage() === 'en' ? 'SHOW RATINGS' : 'ПОКАЗАТЬ РЕЙТИНГИ';
        console.log('📊 ESG Ratings hidden');
    }
}

function loadRatings() {
    const company = document.getElementById("company").value;
    const resultDiv = document.getElementById("result");
    const recommendationsDiv = document.getElementById("expert-recommendations");

    const ratingsData = getCurrentLanguage() === 'en' ? ratingsDataEN : ratingsDataRU;

    if (!ratingsData[company]) {
        resultDiv.innerHTML = `<p style="color: #d4af37; text-align: center;">${getCurrentLanguage() === 'en' ? 'Company data not found.' : 'Данные о компании не найдены.'}</p>`;
        recommendationsDiv.innerHTML = "";
        return;
    }

    // Generate table
    const tableTitle = getCurrentLanguage() === 'en' ? 'ESG Ratings' : 'ESG Рейтинги';
    let tableHTML = `<h3 class="recommendation-title">${tableTitle}</h3><table class="ratings-table"><thead><tr><th>${getCurrentLanguage() === 'en' ? 'Indicator' : 'Показатель'}</th><th>${getCurrentLanguage() === 'en' ? 'Rating' : 'Оценка'}</th></tr></thead><tbody>`;
    ratingsData[company].ratings.forEach((row) => {
        tableHTML += `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;
    resultDiv.innerHTML = tableHTML;

    // Generate recommendations
    const recTitle = getCurrentLanguage() === 'en' ? 'Expert Recommendations' : 'Экспертные рекомендации';
    let recommendationsHTML = `<h3 class="recommendation-title">${recTitle}</h3><div class="recommendation-grid">`;
    ratingsData[company].recommendations.forEach((rec) => {
        recommendationsHTML += `<div class="recommendation-card"><h4>${rec.title}</h4><p>${rec.text}</p></div>`;
    });
    
    const downloadText = getCurrentLanguage() === 'en' ? 'Download Report' : 'Полный доступ — по запросу';
    recommendationsHTML += `</div><button class="download-button gold-button" onclick="downloadExcel()"><i class="fas fa-download"></i> ${downloadText}</button>`;
    
    recommendationsDiv.innerHTML = recommendationsHTML;
}

function downloadExcel() {
    const company = document.getElementById("company").value;
    const ratingsData = getCurrentLanguage() === 'en' ? ratingsDataEN : ratingsDataRU;
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
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + 
                                (getCurrentLanguage() === 'en' ? 'Sending...' : 'Отправка...');
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                // Show success state
                submitBtn.innerHTML = '<i class="fas fa-check"></i> ' + 
                                    (getCurrentLanguage() === 'en' ? 'Sent!' : 'Отправлено!');
                submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                
                // Reset form after delay
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    contactForm.reset();
                }, 2000);
            }, 1500);
            
            console.log('📧 Contact form submitted');
        });
        console.log('✅ Contact form initialized');
    }
}

// ========== TOOLTIPS ==========
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            // Simple tooltip implementation
            const tooltipText = this.getAttribute('data-tooltip');
            console.log('💡 Tooltip:', tooltipText);
        });
    });
    console.log('✅ Tooltips initialized');
}

// ========== CONTACTS TOGGLE ==========
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

// ========== PRELOADER ==========
window.addEventListener('load', function() {
    console.log('🎯 Page fully loaded, hiding preloader...');
    
    setTimeout(function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
            
            setTimeout(function() {
                preloader.style.display = 'none';
                console.log('✅ Preloader hidden');
                
                // Refresh AOS after preloader hides
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                    console.log('🔄 AOS refreshed after preloader');
                }
            }, 800);
        }
    }, 1500);
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

// ========== UTILITY FUNCTIONS ==========
function refreshAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
        console.log('🔄 AOS manually refreshed');
    }
}

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

// ========== SCROLL TO TOP ON RELOAD ==========
window.addEventListener('beforeunload', function() {
    window.scrollTo(0, 0);
});

// Force scroll to top on load
window.addEventListener('load', function() {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

if (window.history && window.history.scrollRestoration) {
    window.history.scrollRestoration = 'manual';
}

console.log('🎯 North West Atlas B Corp script loaded successfully! All systems operational.');

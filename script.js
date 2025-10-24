// ========== NORTH WEST ATLAS B CORP — FINAL OPTIMIZED SCRIPT ==========
document.addEventListener("DOMContentLoaded", function() {
  // Установка года в футере
  document.getElementById("current-year").textContent = new Date().getFullYear();

  // Инициализация AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      disable: window.innerWidth < 768
    });
  }

  // Плавная прокрутка
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Закрыть мобильное меню
        const navMenu = document.getElementById('nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          document.querySelector('.menu-toggle i').className = 'fas fa-bars';
          document.body.style.overflow = '';
        }
      }
    });
  });

  // Мобильное меню
  window.toggleMenu = function() {
    const navMenu = document.getElementById('nav-menu');
    const icon = document.querySelector('.menu-toggle i');
    navMenu.classList.toggle('active');
    if (navMenu.classList.contains('active')) {
      icon.className = 'fas fa-times';
      document.body.style.overflow = 'hidden';
    } else {
      icon.className = 'fas fa-bars';
      document.body.style.overflow = '';
    }
  };

  // Закрытие меню при клике вне
  document.addEventListener('click', function(e) {
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navMenu && navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      navMenu.classList.remove('active');
      document.querySelector('.menu-toggle i').className = 'fas fa-bars';
      document.body.style.overflow = '';
    }
  });

  // Контакты
  window.toggleContacts = function() {
    const contacts = document.getElementById("contacts");
    const btn = document.getElementById("show-contacts-btn");
    if (contacts.style.display === "none" || contacts.style.display === "") {
      contacts.style.display = "block";
      btn.textContent = "Скрыть";
    } else {
      contacts.style.display = "none";
      btn.textContent = "Показать";
    }
  };

  // Модальные окна
  const expertiseData = {
    ai: { title: "Искусственный интеллект", content: "<p>Используем передовые алгоритмы AI...</p>" },
    "big-data": { title: "Анализ больших данных", content: "<p>Обрабатываем миллионы ESG-документов...</p>" },
    risks: { title: "Оценка рисков", content: "<p>Применяем ML и big data для ESG-оценок...</p>" },
    scaling: { title: "Масштабирование бизнеса", content: "<p>Разрабатываем стратегии устойчивого роста...</p>" },
    legal: { title: "Юридическое сопровождение", content: "<p>Защита прав инвесторов и сопровождение сделок...</p>" },
    patents: { title: "Патентование", content: "<p>Комплексное патентное обеспечение...</p>" }
  };

  window.openPopup = function(key) {
    const popup = document.getElementById("popup-modal");
    const title = document.getElementById("popup-title");
    const details = document.getElementById("popup-details");
    const data = expertiseData[key];
    if (data) {
      title.textContent = data.title;
      details.innerHTML = data.content;
      popup.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  };

  window.closePopup = function() {
    document.getElementById("popup-modal").style.display = "none";
    document.body.style.overflow = "";
  };

  document.addEventListener('click', function(e) {
    if (e.target.id === "popup-modal") closePopup();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePopup();
  });

  // ESG Калькулятор
  const ratingsData = {
    solidcore: {
      ratings: [
        ["Sustainalytics", "8.5"],
        ["Refinitiv", "92"],
        ["MSCI", "AA"],
        ["RAEX Europe", "A+"],
        ["NRA ESG", "A1.esg"],
        ["Средняя согласованность рейтингов", "7.50"]
      ],
      recommendations: [
        { title: "Оригинальность", text: "Проект демонстрирует высокую степень уникальности." },
        { title: "Новизна", text: "Проект подтверждает свою патентную чистоту." }
      ]
    }
  };

  window.toggleRatings = function() {
    const result = document.getElementById("result");
    const rec = document.getElementById("expert-recommendations");
    const btn = document.getElementById("ratings-button");
    if (!result.classList.contains("active")) {
      loadRatings();
      result.classList.add("active");
      rec.classList.add("active");
      btn.textContent = "СКРЫТЬ РЕЙТИНГИ";
    } else {
      result.classList.remove("active");
      rec.classList.remove("active");
      btn.textContent = "ЗАГРУЗИТЬ РЕЙТИНГИ";
    }
  };

  function loadRatings() {
    const company = "solidcore";
    const data = ratingsData[company];
    let table = `<h3 class="recommendation-title">ESG Рейтинги</h3><table class="ratings-table"><thead><tr><th>Показатель</th><th>Оценка</th></tr></thead><tbody>`;
    data.ratings.forEach(r => table += `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`);
    table += `</tbody></table>`;
    document.getElementById("result").innerHTML = table;

    let recs = `<h3 class="recommendation-title">Экспертные рекомендации</h3><div class="recommendation-grid">`;
    data.recommendations.forEach(r => recs += `<div class="recommendation-card"><h4>${r.title}</h4><p>${r.text}</p></div>`);
    recs += `</div><button class="download-button gold-button" onclick="alert('Полный доступ — по запросу')"><i class="fas fa-download"></i> Полный доступ — по запросу</button>`;
    document.getElementById("expert-recommendations").innerHTML = recs;
  }

  // Particles.js
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 40, density: { enable: true, value_area: 800 } },
        color: { value: "#d4af37" },
        shape: { type: "circle" },
        opacity: { value: 0.3, random: false },
        size: { value: 2, random: true },
        line_linked: {
          enable: true, distance: 100, color: "#d4af37", opacity: 0.2, width: 1
        },
        move: { enable: true, speed: 1, direction: "none", out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" },
          resize: true
        }
      },
      retina_detect: true
    });
  }

  // Защита контента
  document.addEventListener('copy', e => {
    e.preventDefault();
    const msg = document.createElement('div');
    msg.textContent = '© North West Atlas B Corp — Контент защищён';
    msg.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.95); color: #d4af37; padding: 20px 40px;
      border-radius: 10px; border: 2px solid #d4af37; font-size: 16px;
      font-family: 'Playfair Display', serif; z-index: 99999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.5);
      animation: fadeInOut 2s ease;
    `;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  });

  // Preloader
  window.addEventListener('load', () => {
    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.pointerEvents = 'none';
        setTimeout(() => preloader.remove(), 800);
      }
    }, 2000);
  });
});

// Скролл наверх при загрузке
document.addEventListener('DOMContentLoaded', () => window.scrollTo(0, 0));
window.addEventListener('load', () => window.scrollTo(0, 0));
if (window.history && window.history.scrollRestoration) {
  window.history.scrollRestoration = 'manual';
}

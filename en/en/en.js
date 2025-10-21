// AOS Declaration
const AOS = window.AOS;

// Title animation via Anime.js
document.addEventListener("DOMContentLoaded", () => {
    anime({
        targets: ".site-title",
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1500,
        easing: "easeOutExpo",
    });

    // Initialize AOS for other elements
    AOS.init({
        duration: 800,
        easing: "ease",
        once: false,
        mirror: false,
        anchorPlacement: "top-bottom",
    });
});

// Set current year in footer
document.getElementById("current-year").textContent = new Date().getFullYear();

// Initialize active menu item on scroll
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

// Change header on scroll
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

// Menu toggle function
function toggleMenu() {
    const menu = document.getElementById("nav-menu");
    menu.classList.toggle("active");
}

// Show/hide contacts
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

        button.textContent = "Hide";
    } else {
        contacts.style.opacity = "0";

        setTimeout(() => {
            contacts.style.display = "none";
        }, 500);

        button.textContent = "Show";
    }
}

// Initialize mobile tooltips
function initMobileTooltips() {
    if (window.innerWidth <= 768) {
        const aboutCards = document.querySelectorAll(".about-card");

        aboutCards.forEach((card) => {
            card.addEventListener("click", function (e) {
                this.classList.toggle("tooltip-active");

                aboutCards.forEach((otherCard) => {
                    if (otherCard !== this) {
                        otherCard.classList.remove("tooltip-active");
                    }
                });
            });
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".about-card")) {
                aboutCards.forEach((card) => {
                    card.classList.remove("tooltip-active");
                });
            }
        });
    }
}

// Expertise data object for modal windows
const expertiseData = {
    ai: {
        title: "Artificial Intelligence and Machine Learning",
        content: `<p>We use advanced AI and ML algorithms for automated data analysis, including natural language processing, computer vision and predictive analytics. Our solutions help identify hidden patterns and make more informed decisions.</p>`,
    },
    "big-data": {
        title: "Big Data Analysis",
        content: `<p>We process millions of ESG documents in real time using distributed computing and cloud technologies. Our infrastructure allows us to analyze both structured and unstructured data from various sources to form a comprehensive picture.</p>`,
    },
    risks: {
        title: "ESG Risk Assessment",
        content: `<p>We apply ML and big data for ESG assessments, creating multi-factor risk models that consider both traditional financial indicators and non-financial metrics of sustainable development. Our approach allows us to identify hidden risks and opportunities.</p>`,
    },
    scaling: {
        title: "Business Scaling",
        content: `<p>We develop sustainable growth strategies based on in-depth market analysis and competitive environment assessment. Our team helps companies enter new markets, optimize business processes and implement innovative technologies for long-term success.</p>`,
    },
    legal: {
        title: "Legal Support",
        content: `<p>Protection of investor rights and transaction support at all stages, from structuring to closing. Our lawyers specialize in venture capital, M&A, intellectual property and international law, providing reliable legal protection of your interests.</p>`,
    },
    patents: {
        title: "Patenting",
        content: `<p>Comprehensive patent support and expertise, including patent search, application preparation and filing, intellectual property protection. We help inventors and companies protect their innovations and maximize their commercial value.</p>`,
    },
};

// Open modal window
function openPopup(expertise) {
    const popup = document.getElementById("popup-modal");
    const title = document.getElementById("popup-title");
    const details = document.getElementById("popup-details");

    const data = expertiseData[expertise];
    title.textContent = data.title;
    details.innerHTML = data.content;

    popup.style.display = "flex";
}

// Close modal window
function closePopup() {
    const popup = document.getElementById("popup-modal");
    popup.style.display = "none";
}

// ESG Calculator data
const ratingsData = {
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

// Toggle ratings display
function toggleRatings() {
    const result = document.getElementById("result");
    const recommendations = document.getElementById("expert-recommendations");
    const button = document.getElementById("ratings-button");

    if (!result.classList.contains("active")) {
        loadRatings();
        result.classList.add("active");
        recommendations.classList.add("active");
        button.textContent = "HIDE RATINGS";
    } else {
        result.classList.remove("active");
        recommendations.classList.remove("active");
        button.textContent = "LOAD RATINGS";
    }
}

// Generate ratings and recommendations
function loadRatings() {
    const company = document.getElementById("company").value;
    const resultDiv = document.getElementById("result");
    const recommendationsDiv = document.getElementById("expert-recommendations");

    if (!ratingsData[company]) {
        resultDiv.innerHTML = "<p>Company data not found.</p>";
        recommendationsDiv.innerHTML = "";
        return;
    }

    // Generate table
    let tableHTML = `<table class="ratings-table"><thead><tr><th>Indicator</th><th>Rating</th></tr></thead><tbody>`;
    ratingsData[company].ratings.forEach((row) => {
        tableHTML += `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;
    resultDiv.innerHTML = tableHTML;

    // Generate recommendations
    let recommendationsHTML = `<h3 class="recommendation-title">Expert Recommendations</h3><div class="recommendation-grid">`;
    ratingsData[company].recommendations.forEach((rec) => {
        recommendationsHTML += `<div class="recommendation-card"><h4>${rec.title}</h4><p>${rec.text}</p></div>`;
    });
    recommendationsHTML += `</div><button class="download-button" onclick="downloadExcel()"><i class="fas fa-download"></i> Download Report</button>`;
    recommendationsDiv.innerHTML = recommendationsHTML;
}

// Download report function
function downloadExcel() {
    const company = document.getElementById("company").value;
    const data = ratingsData[company];

    if (!data) {
        alert("Company data not found.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Indicator,Rating\n";

    data.ratings.forEach((row) => {
        csvContent += `"${row[0]}","${row[1]}"\n`;
    });

    csvContent += "\nRecommendations\n";

    data.recommendations.forEach((rec) => {
        csvContent += `"${rec.title}","${rec.text}"\n`;
    });

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ESG_Report_${company}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
}

// Smooth scroll to sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Animation on scroll
window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero');
    if (window.scrollY > 100) {
        hero.style.transform = 'translateY(-50px)';
    } else {
        hero.style.transform = 'translateY(0)';
    }
});

// Add "scrolled" class on scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ======= PARTICLES.JS SETTINGS =======
// Initialize interactive background with golden particles
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


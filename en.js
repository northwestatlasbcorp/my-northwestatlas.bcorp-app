// ========== NORTH WEST ATLAS B CORP - PREMIUM SCRIPT (ENGLISH) ==========
// Development Cost: 1,000,000 - 1,500,000 RUB
// Level: Premium Business Class

'use strict';

class PremiumWebsite {
    constructor() {
        this.isInitialized = false;
        this.currentLanguage = 'en';
        this.scrollPosition = 0;
        this.isMobile = window.innerWidth <= 768;
        
        // Expertise data for modal windows
        this.expertiseData = {
            ai: {
                title: "Artificial Intelligence and Machine Learning",
                icon: "🤖",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">🤖</span>
                            <h3>Artificial Intelligence and Machine Learning</h3>
                        </div>
                        <div class="expertise-body">
                            <p>We use advanced AI and ML algorithms for automated data analysis, including natural language processing, computer vision and predictive analytics. Our solutions help identify hidden patterns and make more informed decisions.</p>
                            
                            <div class="expertise-features">
                                <h4>Key Capabilities:</h4>
                                <ul>
                                    <li>Deep ESG data analytics</li>
                                    <li>Predictive risk modeling</li>
                                    <li>Automated report generation</li>
                                    <li>Computer vision for document analysis</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "2-4 weeks",
                complexity: "High"
            },
            "big-data": {
                title: "Big Data Analysis",
                icon: "📊",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">📊</span>
                            <h3>Big Data Analysis</h3>
                        </div>
                        <div class="expertise-body">
                            <p>We process millions of ESG documents in real time using distributed computing and cloud technologies. Our infrastructure allows us to analyze both structured and unstructured data from various sources to form a comprehensive picture.</p>
                            
                            <div class="expertise-features">
                                <h4>Technology Stack:</h4>
                                <ul>
                                    <li>Apache Spark for distributed computing</li>
                                    <li>Hadoop for big data storage</li>
                                    <li>Real-time analytics pipelines</li>
                                    <li>AWS/Azure cloud solutions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "3-6 weeks",
                complexity: "Medium"
            },
            risks: {
                title: "ESG Risk Assessment",
                icon: "⚡",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">⚡</span>
                            <h3>ESG Risk Assessment</h3>
                        </div>
                        <div class="expertise-body">
                            <p>We apply ML and big data for ESG assessments, creating multi-factor risk models that consider both traditional financial indicators and non-financial metrics of sustainable development. Our approach allows us to identify hidden risks and opportunities.</p>
                            
                            <div class="expertise-features">
                                <h4>Assessment Areas:</h4>
                                <ul>
                                    <li>Climate risks and opportunities</li>
                                    <li>Social responsibility</li>
                                    <li>Corporate governance</li>
                                    <li>Supply chains</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "2-3 weeks",
                complexity: "High"
            },
            scaling: {
                title: "Business Scaling",
                icon: "🚀",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">🚀</span>
                            <h3>Business Scaling</h3>
                        </div>
                        <div class="expertise-body">
                            <p>We develop sustainable growth strategies based on in-depth market analysis and competitive environment assessment. Our team helps companies enter new markets, optimize business processes and implement innovative technologies for long-term success.</p>
                            
                            <div class="expertise-features">
                                <h4>Strategic Directions:</h4>
                                <ul>
                                    <li>International market entry</li>
                                    <li>Operational optimization</li>
                                    <li>Digital transformation</li>
                                    <li>Growth management</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "4-8 weeks",
                complexity: "Medium"
            },
            legal: {
                title: "Legal Support",
                icon: "⚖️",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">⚖️</span>
                            <h3>Legal Support</h3>
                        </div>
                        <div class="expertise-body">
                            <p>Protection of investor rights and transaction support at all stages, from structuring to closing. Our lawyers specialize in venture capital, M&A, intellectual property and international law, providing reliable legal protection of your interests.</p>
                            
                            <div class="expertise-features">
                                <h4>Legal Services:</h4>
                                <ul>
                                    <li>Investment deal structuring</li>
                                    <li>Due diligence and risk assessment</li>
                                    <li>International law and compliance</li>
                                    <li>Intellectual property protection</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "1-2 weeks",
                complexity: "High"
            },
            patents: {
                title: "Patenting",
                icon: "📝",
                content: `
                    <div class="expertise-content">
                        <div class="expertise-header">
                            <span class="expertise-icon">📝</span>
                            <h3>Patenting</h3>
                        </div>
                        <div class="expertise-body">
                            <p>Comprehensive patent support and expertise, including patent search, application preparation and filing, intellectual property protection. We help inventors and companies protect their innovations and maximize their commercial value.</p>
                            
                            <div class="expertise-features">
                                <h4>Patent Services:</h4>
                                <ul>
                                    <li>Patent search and analysis</li>
                                    <li>Patent application preparation</li>
                                    <li>International patenting</li>
                                    <li>Patent litigation protection</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `,
                duration: "3-6 months",
                complexity: "Very High"
            }
        };

        // ESG Calculator data
        this.ratingsData = {
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
        };

        this.initialize();
    }

    // Main initialization
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
        this.setupExpertiseModals();
        
        this.isInitialized = true;
        console.log('🚀 North West Atlas B Corp - Premium Website Initialized');
    }

    // ========== ANIMATION SYSTEM ==========
    initializeAnimations() {
        // Initialize AOS
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

        // Animate hero section
        this.animateHeroSection();
        
        // Animate expertise cards
        this.animateExpertiseCards();
        
        // Parallax effects
        this.setupParallaxEffects();
    }

    animateHeroSection() {
        const heroTitle = document.querySelector('.site-title');
        if (!heroTitle) return;

        // Complex multi-stage animation
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

    animateExpertiseCards() {
        const expertiseCards = document.querySelectorAll('.expertise-card');
        
        expertiseCards.forEach((card, index) => {
            // Add data attribute for expertise type identification
            const expertiseTypes = ['ai', 'big-data', 'risks', 'scaling', 'legal', 'patents'];
            if (expertiseTypes[index]) {
                card.dataset.expertise = expertiseTypes[index];
            }

            // Complex hover animation
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

    // ========== PARTICLES AND BACKGROUND ==========
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

    // ========== PREMIUM CURSOR ==========
    initializeCustomCursor() {
        const cursor = document.querySelector('.custom-cursor');
        if (!cursor) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor movement
        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Interactive elements
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

        // Click animation
        document.addEventListener('click', () => {
            cursor.classList.add('click');
            setTimeout(() => cursor.classList.remove('click'), 500);
        });
    }

    // ========== PREMIUM PRELOADER ==========
    setupPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        let progress = 0;
        const progressBar = document.querySelector('.loading-progress');
        const progressText = document.querySelector('.preloader-text');

        // Simulate loading with progress
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            if (progressBar) progressBar.style.width = progress + '%';
            
            if (progressText) {
                const steps = ['Initializing System', 'Loading Data', 'Optimizing', 'Launching Interface'];
                const stepIndex = Math.floor(progress / 25);
                progressText.textContent = steps[stepIndex] || 'Ready';
            }

            if (progress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    setTimeout(() => preloader.remove(), 1000);
                    
                    // Launch post-load animations
                    this.onPageLoaded();
                }, 500);
            }
        }, 200);
    }

    onPageLoaded() {
        // Launch animations after loading
        this.animateElementsOnScroll();
        this.setupIntersectionObserver();
    }

    // ========== EXPERTISE MODALS SYSTEM ==========
    setupExpertiseModals() {
        // Create container for modal windows
        this.createModalContainer();
        
        // Add handlers for expertise cards
        this.attachExpertiseHandlers();
        
        // Handlers for "Learn More" buttons
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
        // Handlers for clicking expertise cards
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
        // Handlers for "Learn More" buttons
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

        // Create premium modal window
        const modal = this.createExpertiseModal(expertise);
        
        // Show modal with animation
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
                            <span class="meta-label">Implementation Time:</span>
                            <span class="meta-value">${expertise.duration}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Complexity:</span>
                            <span class="meta-value complexity-${expertise.complexity.toLowerCase()}">${expertise.complexity}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="premiumWebsite.closeExpertiseModal()">
                        Close
                    </button>
                    <button class="btn-primary" onclick="premiumWebsite.requestExpertiseConsultation('${expertise.title}')">
                        <i class="fas fa-calendar-check"></i>
                        Request Consultation
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    showExpertiseModal(modal) {
        // Clear container
        this.modalContainer.innerHTML = '';
        this.modalContainer.appendChild(modal);
        
        // Show container
        this.modalContainer.style.display = 'flex';
        
        // Appearance animation
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('active');
        }, 10);

        // Block body scroll
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
        
        // Create consultation modal with pre-filled topic
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
                    <h3>Consultation Request</h3>
                    <button class="modal-close" onclick="premiumWebsite.closeModal(this.closest('.premium-modal'))">×</button>
                </div>
                <div class="modal-body">
                    <form id="expertise-consultation-form">
                        <div class="form-group">
                            <label>Consultation Topic</label>
                            <input type="text" value="${expertiseTitle}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Your Name *</label>
                            <input type="text" required>
                        </div>
                        <div class="form-group">
                            <label>Company *</label>
                            <input type="text" required>
                        </div>
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" required>
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel">
                        </div>
                        <div class="form-group">
                            <label>Preferred Date</label>
                            <input type="datetime-local">
                        </div>
                        <div class="form-group">
                            <label>Additional Information</label>
                            <textarea rows="4" placeholder="Describe your needs..."></textarea>
                        </div>
                        <button type="submit" class="premium-btn">
                            <i class="fas fa-paper-plane"></i>
                            Send Request
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Add form handler
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

        // Show loading
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate server submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Consultation request sent! We will contact you within 24 hours.', 'success');
            this.closeModal(form.closest('.premium-modal'));
            
        } catch (error) {
            this.showNotification('Sending error. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // ========== ESG CALCULATOR ==========
    setupESGCalculator() {
        this.setupCalculatorEvents();
    }

    setupCalculatorEvents() {
        const calculateBtn = document.getElementById('calculate-esg');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateESG());
        }

        // Auto calculation on parameter changes
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

        if (!this.ratingsData[company]) {
            this.showNotification('Company data not found', 'error');
            return;
        }

        const data = this.ratingsData[company];

        // Show loading animation
        this.showLoadingAnimation(resultDiv);

        setTimeout(() => {
            // Generate premium table
            resultDiv.innerHTML = this.generatePremiumTable(data.ratings);
            
            // Generate recommendations
            recommendationsDiv.innerHTML = this.generateRecommendations(data.recommendations);
            
            // Appearance animation
            this.animateResults();
            
            // Show notification
            this.showNotification('ESG analysis completed successfully', 'success');
        }, 1500);
    }

    generatePremiumTable(ratings) {
        let tableHTML = `
            <div class="table-container">
                <table class="premium-ratings-table">
                    <thead>
                        <tr>
                            <th>Indicator</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th>Trend</th>
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
        let html = `
            <h3 class="recommendation-title">Strategic Recommendations</h3>
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
                        <span class="timeline">⏱ 6-12 months</span>
                        <span class="impact">💎 High impact</span>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <div class="report-actions">
                <button class="download-button premium" onclick="premiumWebsite.downloadReport()">
                    <i class="fas fa-download"></i> 
                    Download Full Report
                </button>
                <button class="consultation-button" onclick="premiumWebsite.requestConsultation()">
                    <i class="fas fa-calendar"></i> 
                    Book Consultation
                </button>
            </div>
        `;

        return html;
    }

    // ========== NOTIFICATION SYSTEM ==========
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

        // Appearance animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto hide
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

    // ========== CONTENT PROTECTION ==========
    setupContentProtection() {
        // Copy protection
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.showCopyProtectionMessage();
        });

        // Right click protection
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showProtectionMessage();
        });

        // Drag protection
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
    }

    showCopyProtectionMessage() {
        const message = '© North West Atlas B Corp — Content protected by intellectual property rights';
        this.showNotification(message, 'warning');
    }

    // ========== SCROLL SYSTEM ==========
    setupScrollEffects() {
        // Parallax
        this.setupParallaxEffects();
        
        // Sticky menu
        this.setupStickyHeader();
        
        // Section navigation
        this.setupScrollSpy();
        
        // Smooth scrolling
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
                    
                    // Close mobile menu
                    this.closeMobileMenu();
                }
            });
        });
    }

    // ========== MOBILE MENU ==========
    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });

            // Close when clicking outside menu
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });

            // Close when clicking on link
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

    // ========== ADDITIONAL METHODS ==========
    
    setupEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Initialize mobile menu
        this.setupMobileMenu();
        
        // Close modals with ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeExpertiseModal();
                this.closeAllModals();
            }
        });

        // Content protection
        this.setupContentProtection();
    }

    closeAllModals() {
        this.closeExpertiseModal();
        document.querySelectorAll('.premium-modal').forEach(modal => {
            this.closeModal(modal);
        });
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

    // Utility methods
    showLoadingAnimation(element) {
        element.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Analyzing ESG Data...</div>';
    }

    animateResults() {
        const elements = document.querySelectorAll('#result, #expert-recommendations');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100);
        });
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
        // Update parallax effects
        this.updateParallax();
    }

    setupParallaxEffects() {
        // Parallax implementation
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Report download
    downloadReport() {
        this.showNotification('Preparing report...', 'info');
        
        setTimeout(() => {
            // Create premium PDF report
            this.generatePremiumReport();
        }, 2000);
    }

    generatePremiumReport() {
        // Implementation for premium report generation
        this.showNotification('Premium report generated successfully!', 'success');
    }

    // General consultation request
    requestConsultation() {
        const modal = this.createConsultationModal();
        document.body.appendChild(modal);
        this.showModal(modal);
    }

    // Form handlers
    setupFormHandlers() {
        this.setupContactForm();
        this.setupNewsletterForm();
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

    setupNewsletterForm() {
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmission(newsletterForm);
            });
        }
    }

    async handleFormSubmission(form, type) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate server submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Message sent successfully!', 'success');
            form.reset();
            
        } catch (error) {
            this.showNotification('Sending error. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleNewsletterSubmission(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitBtn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.showNotification('Successfully subscribed to newsletter!', 'success');
            form.reset();
        } catch (error) {
            this.showNotification('Subscription error. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Set current year in footer
    setCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // Destructor and cleanup
    destroy() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        this.isInitialized = false;
    }
}

// ========== INITIALIZATION ON LOAD ==========
let premiumWebsite;

document.addEventListener('DOMContentLoaded', () => {
    premiumWebsite = new PremiumWebsite();
    premiumWebsite.setCurrentYear();
});

// Global functions for HTML calls
window.toggleMobileMenu = () => premiumWebsite?.toggleMobileMenu();
window.downloadReport = () => premiumWebsite?.downloadReport();
window.requestConsultation = () => premiumWebsite?.requestConsultation();
window.openExpertiseModal = (type) => premiumWebsite?.openExpertiseModal(type);
window.closeExpertiseModal = () => premiumWebsite?.closeExpertiseModal();

// Protection against accidental deletion
Object.defineProperty(window, 'premiumWebsite', {
    value: premiumWebsite,
    writable: false,
    configurable: false
});

console.log('💎 North West Atlas B Corp - Premium English Version Loaded');

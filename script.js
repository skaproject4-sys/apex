// APEX Greater Noida — Website JavaScript
const project = 'APEX AQUALIS';
const whatsappPrimary = '918920625850';
const whatsappSecondary = '918920625850';

function openWhatsAppToBoth(waMessage) {
    const urlPrimary = 'https://wa.me/' + whatsappPrimary + '?text=' + waMessage;
    const urlSecondary = 'https://wa.me/' + whatsappSecondary + '?text=' + waMessage;
    const w1 = window.open(urlPrimary, '_blank');
    if (!w1 || w1.closed === undefined) {
        window.location.href = urlPrimary;
        return;
    }
    window.open(urlSecondary, '_blank');
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavbar();
    initForms();
    initScrollEffects();
    initGallery();
    initSmoothScrolling();
    initLoading();
});

// Navbar functionality
function initNavbar() {
    const navbar = document.querySelector('.navbar');

    // Change navbar on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Close mobile menu on click
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    hide: true
                });
            }
        });
    });
}

// Form handling
function initForms() {
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(this, 'contact');
        });
    }

    // Visit form
    const visitForm = document.getElementById('visitForm');
    if (visitForm) {
        visitForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(this, 'visit');
        });
    }

    // Brochure download button and form
    const brochureDownloadBtn = document.getElementById('brochureDownloadBtn');
    const brochureModal = document.getElementById('brochureModal');
    const brochureForm = document.getElementById('brochureForm');
    if (brochureDownloadBtn && brochureModal) {
        brochureDownloadBtn.addEventListener('click', function() {
            const modal = new bootstrap.Modal(brochureModal);
            modal.show();
        });
    }
    if (brochureForm) {
        brochureForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBrochureDownload(this);
        });
    }

    // WhatsApp form (modal same as brochure)
    const whatsappForm = document.getElementById('whatsappForm');
    if (whatsappForm) {
        whatsappForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleWhatsAppSubmit(this);
        });
    }

    // WhatsApp floating button: open modal on click (no inline onclick)
    const whatsappFloatingBtn = document.getElementById('whatsappFloatingBtn');
    if (whatsappFloatingBtn) {
        whatsappFloatingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openWhatsApp();
        });
    }

    // Floor Plan: View More buttons — open WhatsApp modal (same as floating button)
    document.querySelectorAll('.floorplan-whatsapp-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openWhatsApp();
        });
    });
}

function handleFormSubmit(form, type) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate required fields (email is optional)
    if (!data.name || !data.phone) {
        showNotification('Please fill in required fields (Name and Phone).', 'error');
        return;
    }

    // Validate email format only if provided
    if (data.email && data.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // Prepare data (include visit date in message if present)
    const messageText = data.message ? data.message.trim() : (data.date ? 'Visit date: ' + data.date : '');
    const submissionData = {
        name: data.name.trim(),
        email: (data.email && data.email.trim()) ? data.email.trim() : '',
        phone: data.phone.trim(),
        message: messageText
    };

    // Send to Google Form (no API needed)
    sendRequests(submissionData, type === 'visit' ? { redirectToWhatsApp: false } : {});

    if (type === 'visit') {
        showNotification('Thank you! Your visit request has been submitted. We will contact you soon.', 'success');
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }

    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', { event_category: 'engagement', event_label: type + '_form' });
    }
}

function sendRequests(submissionData, options) {
    const redirectToWhatsApp = options && options.redirectToWhatsApp !== false;
    const name = submissionData.name || '';
    const email = submissionData.email || 'nodata@gmail.com';
    const phone = submissionData.phone || submissionData.mobile || '';
    const message = submissionData.message || '';

    const googleFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSclUCGk918JHNt_5ipKrvKNfrzEdEXpQh0vjDVBoanqyUrCAg/formResponse';
    const formBody = new URLSearchParams({
        'entry.2005620554': name,
        'entry.1045781291': email,
        'entry.1166974658': phone,
        'entry.839337160': project + ' - ' + message
    });
    fetch(googleFormURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
    }).catch(function() {});

    if (redirectToWhatsApp) {
        const waMessage = 'Hi, I am interested in ' + project + '.%0A%0AName: ' + encodeURIComponent(name) + '%0AMobile: ' + encodeURIComponent(phone) + '%0AEmail: ' + encodeURIComponent(email) + '%0A%0APlease share more details about the project.';
        openWhatsAppToBoth(waMessage);
    }
}

// Brochure: data to Google Form, then download from Brochure/brochure.pdf
function handleBrochureDownload(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (!data.name || !data.phone) {
        showNotification('Please enter Name and Phone.', 'error');
        return;
    }
    if (data.email && data.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email.trim())) {
            showNotification('Please enter a valid email or leave it blank.', 'error');
            return;
        }
    }
    const submitBtn = form.querySelector('#brochureSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
    submitBtn.disabled = true;

    const submissionData = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: (data.email && data.email.trim()) ? data.email.trim() : '',
        message: 'Brochure download'
    };

    if (typeof sendRequests === 'function') {
        sendRequests(submissionData, { redirectToWhatsApp: false });
    }

    showNotification('Thank you! Your details have been recorded. Downloading brochure...', 'success');
    const modalEl = document.getElementById('brochureModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
    form.reset();
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

    const link = document.createElement('a');
    link.href = 'Brochure/brochure.pdf';
    link.download = 'APEX-AQUALIS-Brochure.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Scroll effects and animations
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    // Reveal sections and staggered children
    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                const children = entry.target.querySelectorAll('.reveal-up');
                children.forEach((el, i) => {
                    el.style.setProperty('--i', i);
                    setTimeout(() => el.classList.add('revealed'), 50 + i * 60);
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(section => {
        revealObserver.observe(section);
    });

    // Legacy fade-in for elements without .reveal
    const fadeObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('fade-in');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.highlight-card:not(.reveal-up), .price-card:not(.reveal-up), .amenity-card:not(.reveal-up), .floor-plan-card:not(.reveal-up), .location-item, .gallery-item').forEach(el => {
        if (!el.closest('.reveal')) fadeObserver.observe(el);
    });
}

// Gallery functionality
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            openLightbox(imgSrc);
        });
    });
}

function openLightbox(imgSrc) {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${imgSrc}" alt="Gallery Image">
            <button class="lightbox-close">&times;</button>
        </div>
    `;

    document.body.appendChild(lightbox);

    // Add styles
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        cursor: pointer;
    `;

    const lightboxContent = lightbox.querySelector('.lightbox-content');
    lightboxContent.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
    `;

    const lightboxImg = lightbox.querySelector('img');
    lightboxImg.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    `;

    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 30px;
        background: none;
        border: none;
        cursor: pointer;
    `;

    // Close lightbox
    function closeLightbox() {
        document.body.removeChild(lightbox);
    }

    lightbox.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
    });
}

// Smooth scrolling for navigation
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Loading animation
function initLoading() {
    // Hide loading after page loads
    window.addEventListener('load', function() {
        setTimeout(() => {
            const loading = document.querySelector('.loading');
            if (loading) {
                loading.style.display = 'none';
            }
        }, 500);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        document.body.removeChild(notification);
    });

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
        background: ${type === 'success' ? '#38a169' : '#3182ce'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        font-weight: 500;
    `;

    const icon = notificationContent.querySelector('i');
    icon.style.cssText = `
        margin-right: 0.75rem;
        font-size: 1.2rem;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);

    // Add slideOut animation
    setTimeout(() => {
        const slideOutStyle = document.createElement('style');
        slideOutStyle.textContent = `
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(slideOutStyle);
    }, 4700);
}

// Phone number click tracking
document.addEventListener('click', function(e) {
    if (e.target.closest('a[href^="tel:"]')) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'engagement',
                'event_label': 'phone_call'
            });
        }
    }
});

// WhatsApp click tracking
document.addEventListener('click', function(e) {
    if (e.target.closest('a[href*="wa.me"]')) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'engagement',
                'event_label': 'whatsapp_contact'
            });
        }
    }
});

// Open WhatsApp modal (same popup style as Brochure)
function openWhatsApp() {
    const whatsappModal = document.getElementById('whatsappModal');
    if (!whatsappModal) return;
    try {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = bootstrap.Modal.getOrCreateInstance(whatsappModal);
            modal.show();
        } else {
            const defaultMsg = encodeURIComponent('Hi, I am interested in APEX AQUALIS project. Please share details.');
            openWhatsAppToBoth(defaultMsg);
        }
    } catch (err) {
        console.error('WhatsApp modal error:', err);
        openWhatsAppToBoth(encodeURIComponent('Hi, I am interested in APEX AQUALIS project.'));
    }
}

// WhatsApp form submit: validate, send to Google Form, then open WhatsApp in new tab (chat khul jaye)
function handleWhatsAppSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (!data.name || !data.phone) {
        showNotification('Please enter Name and Phone.', 'error');
        return;
    }
    const mobileRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!mobileRegex.test(data.phone.trim())) {
        showNotification('Please enter a valid phone number.', 'error');
        return;
    }
    if (data.email && data.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email.trim())) {
            showNotification('Please enter a valid email or leave it blank.', 'error');
            return;
        }
    }
    const name = data.name.trim();
    const phone = data.phone.trim();
    const emailTrimmed = (data.email && data.email.trim()) ? data.email.trim() : '';
    const submissionData = {
        name: name,
        phone: phone,
        email: emailTrimmed,
        message: 'WhatsApp enquiry'
    };
    sendRequests(submissionData, { redirectToWhatsApp: false });
    let waMessage = 'Hi, I am interested in ' + project + '.%0A%0AName: ' + encodeURIComponent(name) + '%0AMobile: ' + encodeURIComponent(phone);
    if (emailTrimmed) waMessage += '%0AEmail: ' + encodeURIComponent(emailTrimmed);
    waMessage += '%0A%0APlease share more details about the project.';
    openWhatsAppToBoth(waMessage);
    const modalEl = document.getElementById('whatsappModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
    form.reset();
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', { event_category: 'engagement', event_label: 'whatsapp_contact_with_details' });
    }
}

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}
// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize GSAP
  gsap.registerPlugin(ScrollTrigger)

  // Navigation toggle
  const navToggle = document.querySelector(".nav-toggle")
  const navMenu = document.querySelector(".nav-menu")

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active")
      navMenu.classList.toggle("active")
    })
  }

  // Close menu when clicking on a nav item
  const navLinks = document.querySelectorAll(".nav-menu a")
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active")
      navMenu.classList.remove("active")
    })
  })

  // Sticky navbar
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar")
    if (window.scrollY > 50) {
      navbar.style.padding = "10px 0"
      navbar.style.backgroundColor = "rgba(255, 255, 255, 0.98)"
      navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
    } else {
      navbar.style.padding = "15px 0"
      navbar.style.backgroundColor = "rgba(255, 255, 255, 0.95)"
      navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
    }
  })

  // Testimonial slider
  const testimonialSlides = document.querySelectorAll(".testimonial-slide")
  const dots = document.querySelectorAll(".dot")
  const prevBtn = document.querySelector(".testimonial-prev")
  const nextBtn = document.querySelector(".testimonial-next")
  let currentSlide = 0

  function showSlide(n) {
    testimonialSlides.forEach((slide) => slide.classList.remove("active"))
    dots.forEach((dot) => dot.classList.remove("active"))

    currentSlide = (n + testimonialSlides.length) % testimonialSlides.length

    testimonialSlides[currentSlide].classList.add("active")
    dots[currentSlide].classList.add("active")
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => showSlide(currentSlide - 1))
    nextBtn.addEventListener("click", () => showSlide(currentSlide + 1))
  }

  if (dots.length > 0) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => showSlide(index))
    })
  }

  // Auto slide for testimonials
  let testimonialInterval = setInterval(() => {
    if (nextBtn) showSlide(currentSlide + 1)
  }, 5000)

  // Pause auto slide on hover
  const testimonialSlider = document.querySelector(".testimonial-slider")
  if (testimonialSlider) {
    testimonialSlider.addEventListener("mouseenter", () => {
      clearInterval(testimonialInterval)
    })

    testimonialSlider.addEventListener("mouseleave", () => {
      testimonialInterval = setInterval(() => {
        showSlide(currentSlide + 1)
      }, 5000)
    })
  }

  // Features tabs
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabPanes = document.querySelectorAll(".tab-pane")

  if (tabBtns.length > 0) {
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab")

        tabBtns.forEach((b) => b.classList.remove("active"))
        tabPanes.forEach((p) => p.classList.remove("active"))

        btn.classList.add("active")
        document.getElementById(tabId).classList.add("active")
      })
    })
  }

  // FAQ accordion
  const faqItems = document.querySelectorAll(".faq-item")

  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question")

      question.addEventListener("click", () => {
        item.classList.toggle("active")
      })
    })
  }

  // Contact form submission
  const contactForm = document.getElementById("contactForm")

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Simulate form submission
      const submitBtn = contactForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent

      submitBtn.textContent = "Sending..."
      submitBtn.disabled = true

      setTimeout(() => {
        alert("Thank you for your message! We will get back to you soon.")
        contactForm.reset()
        submitBtn.textContent = originalText
        submitBtn.disabled = false
      }, 1500)
    })
  }

  // GSAP Animations
  // Hero section animations
  gsap.from(".hero-content", {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: "power3.out",
  })

  gsap.from(".hero-image", {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: "power3.out",
    delay: 0.3,
  })

  // Animate stats
  gsap.from(".stat-item", {
    scrollTrigger: {
      trigger: ".stats-container",
      start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
  })

  // Animate feature cards
  gsap.from(".feature-card", {
    scrollTrigger: {
      trigger: ".features-grid",
      start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
  })

  // Animate steps
  gsap.from(".step", {
    scrollTrigger: {
      trigger: ".steps-container",
      start: "top 80%",
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
  })

  // Animate CTA
  gsap.from(".cta-content", {
    scrollTrigger: {
      trigger: ".cta",
      start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  })

  // Animate about page sections
  gsap.from(".about-image", {
    scrollTrigger: {
      trigger: ".about-grid",
      start: "top 80%",
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  })

  gsap.from(".about-content", {
    scrollTrigger: {
      trigger: ".about-grid",
      start: "top 80%",
    },
    x: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  })

  // Animate value cards
  gsap.from(".value-card", {
    scrollTrigger: {
      trigger: ".values-grid",
      start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
  })

  // Animate team members
  gsap.from(".team-member", {
    scrollTrigger: {
      trigger: ".team-grid",
      start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
  })

  // Animate features tabs
  gsap.from(".tab-btn", {
    scrollTrigger: {
      trigger: ".features-tab-nav",
      start: "top 80%",
    },
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "power3.out",
  })

  // Animate contact methods
  gsap.from(".contact-method", {
    scrollTrigger: {
      trigger: ".contact-methods",
      start: "top 80%",
    },
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "power3.out",
  })

  // Animate FAQ items
  gsap.from(".faq-item", {
    scrollTrigger: {
      trigger: ".faq-container",
      start: "top 80%",
    },
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "power3.out",
  })
})


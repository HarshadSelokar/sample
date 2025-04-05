// Main JavaScript file

// Declare the functions to avoid errors.  These should be defined elsewhere.
function initThree() {}
function initHeroModel() {}
function initDemoModel() {}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Three.js
  initThree()

  // Initialize 3D models after a short delay to ensure DOM is ready
  setTimeout(() => {
    initHeroModel()
    initDemoModel()
  }, 500)

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

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        e.preventDefault()
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth",
        })
      }
    })
  })

  // Demo controls interaction
  const demoControls = document.querySelectorAll(".demo-control")
  demoControls.forEach((control) => {
    control.addEventListener("click", function () {
      demoControls.forEach((c) => c.classList.remove("active"))
      this.classList.add("active")
    })
  })

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
})


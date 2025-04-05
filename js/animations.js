// GSAP animations and interactive elements
document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, TextPlugin)

  // Initialize loader
  initLoader()

  // Initialize animations once the page is loaded
  window.addEventListener("load", () => {
    // Hide loader
    hideLoader()

    // Initialize all animations
    initNavbarAnimations()
    initHeroAnimations()
    initStatCounters()
    initFeatureCards()
    initStepAnimations()
    initTestimonialSlider()
    initParticlesJS()
    initGlitchEffect()
  })
})

// Loader animation
function initLoader() {
  const progress = document.querySelector(".progress")
  const loadingText = document.querySelector(".loading-text")
  const loaderContainer = document.querySelector(".loader-container")

  let width = 0
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval)
      return
    }

    width += Math.floor(Math.random() * 10) + 1
    if (width > 100) width = 100

    progress.style.width = width + "%"
    loadingText.textContent = `Loading Experience... ${width}%`
  }, 200)
}

// Hide loader
function hideLoader() {
  const loaderContainer = document.querySelector(".loader-container")

  gsap.to(loaderContainer, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      loaderContainer.style.display = "none"
    },
  })
}

// Navbar animations
function initNavbarAnimations() {
  const navbar = document.querySelector(".navbar")
  const navToggle = document.querySelector(".nav-toggle")
  const navMenu = document.querySelector(".nav-menu")
  const navLinks = document.querySelectorAll(".nav-menu a")

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.style.padding = "10px 0"
      navbar.style.backgroundColor = "rgba(45, 55, 72, 0.95)"
    } else {
      navbar.style.padding = "15px 0"
      navbar.style.backgroundColor = "rgba(45, 55, 72, 0.9)"
    }
  })

  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active")
      navMenu.classList.toggle("active")

      if (navMenu.classList.contains("active")) {
        gsap.from(navLinks, {
          y: 20,
          opacity: 0,
          stagger: 0.1,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    })
  }

  // Close menu when clicking on a nav item
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active")
      navMenu.classList.remove("active")
    })
  })
}

// Hero section animations
function initHeroAnimations() {
  // Animate headline
  gsap.from(".headline", {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: "power3.out",
  })

  // Animate subheadline
  gsap.from(".subheadline", {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: "power3.out",
    delay: 0.3,
  })

  // Animate CTA buttons
  gsap.from(".hero-cta .btn", {
    duration: 1,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: "power3.out",
    delay: 0.6,
  })

  // Animate hero visual
  gsap.from(".hero-visual", {
    duration: 1.5,
    scale: 0.8,
    opacity: 0,
    ease: "elastic.out(1, 0.5)",
    delay: 0.8,
  })

  // Animate scroll indicator
  gsap.from(".scroll-indicator", {
    duration: 1,
    y: -20,
    opacity: 0,
    ease: "power3.out",
    delay: 1.5,
  })
}

// Stat counters animation
function initStatCounters() {
  const statItems = document.querySelectorAll(".stat-item")

  statItems.forEach((item) => {
    const statNumber = item.querySelector(".stat-number")
    const targetValue = Number.parseInt(item.getAttribute("data-value"))

    // Initialize stat canvas
    const canvas = item.querySelector(".stat-canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = 120
    canvas.height = 120

    // Set up ScrollTrigger
    ScrollTrigger.create({
      trigger: item,
      start: "top 80%",
      onEnter: () => {
        // Animate counter
        gsap.to(statNumber, {
          duration: 2,
          innerText: targetValue,
          snap: { innerText: 1 },
          ease: "power2.out",
        })

        // Animate canvas
        gsap.to(
          {},
          {
            duration: 2,
            onUpdate: function () {
              const progress = this.progress()
              drawStatCircle(ctx, progress, targetValue)
            },
          },
        )
      },
    })
  })
}

// Draw stat circle
function drawStatCircle(ctx, progress, value) {
  const centerX = 60
  const centerY = 60
  const radius = 50

  // Clear canvas
  ctx.clearRect(0, 0, 120, 120)

  // Draw background circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(226, 232, 240, 0.3)"
  ctx.lineWidth = 10
  ctx.stroke()

  // Draw progress circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2)

  // Create gradient based on value
  let gradient
  if (value <= 50) {
    gradient = ctx.createLinearGradient(0, 0, 120, 120)
    gradient.addColorStop(0, "#ff5252")
    gradient.addColorStop(1, "#ff8a80")
  } else if (value <= 90) {
    gradient = ctx.createLinearGradient(0, 0, 120, 120)
    gradient.addColorStop(0, "#6c63ff")
    gradient.addColorStop(1, "#8a84ff")
  } else {
    gradient = ctx.createLinearGradient(0, 0, 120, 120)
    gradient.addColorStop(0, "#4ecdc4")
    gradient.addColorStop(1, "#7ee8e1")
  }

  ctx.strokeStyle = gradient
  ctx.lineWidth = 10
  ctx.stroke()

  // Draw center dot
  ctx.beginPath()
  ctx.arc(centerX, centerY, 5, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()
}

// Feature cards animation
function initFeatureCards() {
  const featureCards = document.querySelectorAll(".feature-card")

  featureCards.forEach((card) => {
    // Initialize particles.js for each card
    const particlesContainer = card.querySelector(".feature-particles")

    // Set up ScrollTrigger
    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      onEnter: () => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        })
      },
    })

    // Add hover animation
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        y: -10,
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
        duration: 0.3,
      })

      gsap.to(card.querySelector(".feature-icon"), {
        scale: 1.1,
        duration: 0.3,
      })
    })

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        y: 0,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        duration: 0.3,
      })

      gsap.to(card.querySelector(".feature-icon"), {
        scale: 1,
        duration: 0.3,
      })
    })
  })
}

// Step animations
function initStepAnimations() {
  const steps = document.querySelectorAll(".step")

  steps.forEach((step, index) => {
    // Initialize step canvas
    const canvas = step.querySelector(".step-canvas")
    if (canvas) {
      const ctx = canvas.getContext("2d")
      canvas.width = 150
      canvas.height = 150

      // Draw step visualization
      drawStepVisualization(ctx, index)
    }

    // Set up ScrollTrigger
    ScrollTrigger.create({
      trigger: step,
      start: "top 80%",
      onEnter: () => {
        gsap.from(step, {
          x: -50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        })
      },
    })
  })
}

// Draw step visualization
function drawStepVisualization(ctx, stepIndex) {
  const centerX = 75
  const centerY = 75
  const radius = 60

  // Clear canvas
  ctx.clearRect(0, 0, 150, 150)

  // Different visualization for each step
  switch (stepIndex) {
    case 0: // Profile
      // Draw profile circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 82, 82, 0.2)"
      ctx.fill()

      // Draw head
      ctx.beginPath()
      ctx.arc(centerX, centerY - 10, 25, 0, Math.PI * 2)
      ctx.fillStyle = "#ff5252"
      ctx.fill()

      // Draw body
      ctx.beginPath()
      ctx.moveTo(centerX, centerY + 15)
      ctx.lineTo(centerX - 30, centerY + 60)
      ctx.lineTo(centerX + 30, centerY + 60)
      ctx.closePath()
      ctx.fillStyle = "#ff5252"
      ctx.fill()
      break

    case 1: // Goals
      // Draw target
      for (let i = 3; i > 0; i--) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * (i / 3), 0, Math.PI * 2)

        if (i === 1) {
          ctx.fillStyle = "#ff5252"
        } else if (i === 2) {
          ctx.fillStyle = "rgba(108, 99, 255, 0.6)"
        } else {
          ctx.fillStyle = "rgba(78, 205, 196, 0.3)"
        }

        ctx.fill()
      }

      // Draw arrow
      ctx.beginPath()
      ctx.moveTo(centerX - 60, centerY - 60)
      ctx.lineTo(centerX, centerY)
      ctx.lineWidth = 5
      ctx.strokeStyle = "#ffffff"
      ctx.stroke()

      // Draw arrowhead
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX - 15, centerY - 5)
      ctx.lineTo(centerX - 5, centerY - 15)
      ctx.closePath()
      ctx.fillStyle = "#ffffff"
      ctx.fill()
      break

    case 2: // Plan
      // Draw calendar
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(centerX - 40, centerY - 40, 80, 80)

      ctx.strokeStyle = "#6c63ff"
      ctx.lineWidth = 2
      ctx.strokeRect(centerX - 40, centerY - 40, 80, 80)

      // Draw calendar lines
      ctx.beginPath()
      ctx.moveTo(centerX - 40, centerY - 20)
      ctx.lineTo(centerX + 40, centerY - 20)
      ctx.moveTo(centerX - 40, centerY)
      ctx.lineTo(centerX + 40, centerY)
      ctx.moveTo(centerX - 40, centerY + 20)
      ctx.lineTo(centerX + 40, centerY + 20)

      ctx.moveTo(centerX - 20, centerY - 40)
      ctx.lineTo(centerX - 20, centerY + 40)
      ctx.moveTo(centerX, centerY - 40)
      ctx.lineTo(centerX, centerY + 40)
      ctx.moveTo(centerX + 20, centerY - 40)
      ctx.lineTo(centerX + 20, centerY + 40)

      ctx.stroke()

      // Draw checkmarks
      ctx.beginPath()
      ctx.moveTo(centerX - 30, centerY - 30)
      ctx.lineTo(centerX - 25, centerY - 25)
      ctx.lineTo(centerX - 15, centerY - 35)

      ctx.moveTo(centerX - 10, centerY - 10)
      ctx.lineTo(centerX - 5, centerY - 5)
      ctx.lineTo(centerX + 5, centerY - 15)

      ctx.moveTo(centerX + 10, centerY + 10)
      ctx.lineTo(centerX + 15, centerY + 15)
      ctx.lineTo(centerX + 25, centerY + 5)

      ctx.strokeStyle = "#ff5252"
      ctx.lineWidth = 3
      ctx.stroke()
      break

    case 3: // Success
      // Draw trophy
      ctx.fillStyle = "#ffd700"

      // Trophy cup
      ctx.beginPath()
      ctx.moveTo(centerX - 30, centerY - 30)
      ctx.bezierCurveTo(centerX - 30, centerY - 60, centerX + 30, centerY - 60, centerX + 30, centerY - 30)
      ctx.lineTo(centerX + 20, centerY)
      ctx.lineTo(centerX - 20, centerY)
      ctx.closePath()
      ctx.fill()

      // Trophy base
      ctx.fillRect(centerX - 15, centerY, 30, 10)
      ctx.fillRect(centerX - 25, centerY + 10, 50, 10)

      // Trophy handles
      ctx.beginPath()
      ctx.arc(centerX - 30, centerY - 40, 10, Math.PI / 2, (3 * Math.PI) / 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(centerX + 30, centerY - 40, 10, -Math.PI / 2, Math.PI / 2)
      ctx.fill()

      // Draw stars around trophy
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2
        const x = centerX + Math.cos(angle) * 50
        const y = centerY + Math.sin(angle) * 50

        drawStar(ctx, x, y, 5, 10, 5, "#6c63ff")
      }
      break
  }
}

// Draw a star shape
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }

  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

// Testimonial slider
function initTestimonialSlider() {
  const testimonialSlides = document.querySelectorAll(".testimonial-slide")
  const dots = document.querySelectorAll(".dot")
  const prevBtn = document.querySelector(".testimonial-prev")
  const nextBtn = document.querySelector(".testimonial-next")
  let currentSlide = 0

  function showSlide(n) {
    // Hide all slides
    testimonialSlides.forEach((slide) => {
      gsap.to(slide, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => {
          slide.classList.remove("active")
        },
      })
    })

    // Update current slide index
    currentSlide = (n + testimonialSlides.length) % testimonialSlides.length

    // Show current slide
    gsap.to(testimonialSlides[currentSlide], {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: 0.3,
      onStart: () => {
        testimonialSlides[currentSlide].classList.add("active")
      },
    })

    // Update dots
    dots.forEach((dot) => dot.classList.remove("active"))
    dots[currentSlide].classList.add("active")
  }

  // Add event listeners
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => showSlide(currentSlide - 1))
    nextBtn.addEventListener("click", () => showSlide(currentSlide + 1))
  }

  if (dots.length > 0) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => showSlide(index))
    })
  }

  // Auto slide
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

  // Set up ScrollTrigger
  ScrollTrigger.create({
    trigger: ".testimonials",
    start: "top 80%",
    onEnter: () => {
      gsap.from(".testimonial-content", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
    },
  })
}

// Initialize particles.js
function initParticlesJS() {
  // CTA particles
  if (document.getElementById("cta-particles")) {
    if (typeof particlesJS !== "undefined") {
      particlesJS("cta-particles", {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: "#ffffff",
          },
          shape: {
            type: "circle",
            stroke: {
              width: 0,
              color: "#000000",
            },
            polygon: {
              nb_sides: 5,
            },
          },
          opacity: {
            value: 0.5,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.1,
              sync: false,
            },
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200,
            },
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab",
            },
            onclick: {
              enable: true,
              mode: "push",
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 1,
              },
            },
            push: {
              particles_nb: 4,
            },
          },
        },
        retina_detect: true,
      })
    }
  }

  // Feature card particles
  document.querySelectorAll(".feature-particles").forEach((container, index) => {
    const colors = ["#ff5252", "#6c63ff", "#4ecdc4", "#ffeb3b", "#8bc34a"]
    const color = colors[index % colors.length]

    if (typeof particlesJS !== "undefined") {
      particlesJS(container, {
        particles: {
          number: {
            value: 20,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: color,
          },
          shape: {
            type: "circle",
            stroke: {
              width: 0,
              color: "#000000",
            },
          },
          opacity: {
            value: 0.5,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.1,
              sync: false,
            },
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: color,
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab",
            },
            onclick: {
              enable: true,
              mode: "push",
            },
            resize: true,
          },
        },
        retina_detect: true,
      })
    }
  })
}

// Glitch text effect
function initGlitchEffect() {
  const glitchTexts = document.querySelectorAll(".glitch-text")

  glitchTexts.forEach((text) => {
    // Set data-text attribute
    if (!text.getAttribute("data-text")) {
      text.setAttribute("data-text", text.textContent)
    }

    // Add random glitch effect
    setInterval(
      () => {
        text.classList.add("active")
        setTimeout(() => {
          text.classList.remove("active")
        }, 200)
      },
      3000 + Math.random() * 5000,
    )
  })
}


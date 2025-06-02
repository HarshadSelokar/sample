document.addEventListener("DOMContentLoaded", () => {
  console.log("Career.js loaded - starting initialization")

  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDcspoxuhH8LUgx9fSxPTO3QuvkQjx9W_g",
    authDomain: "vectorwebsiteblog.firebaseapp.com",
    projectId: "vectorwebsiteblog",
    storageBucket: "vectorwebsiteblog.appspot.com",
  }

  // Initialize Firebase
  let db, firebase
  try {
    console.log("Checking Firebase initialization status")
    // Check if firebase is already defined
    if (typeof window.firebase === "undefined") {
      console.error("Firebase is not initialized. Ensure Firebase SDK is included in your HTML.")
      const jobsContainer = document.getElementById("jobsContainer")
      if (jobsContainer) {
        jobsContainer.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 20px; color: #e53e3e;">
          <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
          <p>Firebase SDK not loaded. Please check your internet connection and try again.</p>
          <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">Retry</button>
        </div>
      `
      }
      return // Stop execution if Firebase is not available
    }

    firebase = window.firebase
    console.log("Firebase is defined, checking if already initialized")

    // Check if Firebase is already initialized
    if (!firebase.apps || !firebase.apps.length) {
      console.log("Initializing Firebase")
      firebase.initializeApp(firebaseConfig)
    } else {
      console.log("Firebase already initialized")
    }

    db = firebase.firestore()
    console.log("Firestore initialized successfully")

    // Test Firestore connection
    db.collection("test")
      .limit(1)
      .get()
      .then(() => {
        console.log("Firestore connection test successful")
      })
      .catch((error) => {
        console.error("Firestore connection test failed:", error)
      })
  } catch (e) {
    console.error("Firebase initialization error:", e)
    const jobsContainer = document.getElementById("jobsContainer")
    if (jobsContainer) {
      jobsContainer.innerHTML = `
      <div class="error-message" style="text-align: center; padding: 20px; color: #e53e3e;">
        <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p>Error initializing Firebase: ${e.message}</p>
        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">Retry</button>
      </div>
    `
    }
    return
  }

  // Firestore References
  const jobsRef = db.collection("jobs")
  const careerContentRef = db.collection("careerContent")
  const benefitsRef = db.collection("benefits")
  const processStepsRef = db.collection("processSteps")

  // Load Job Listings
  function loadJobs() {
    console.log("Starting to load jobs")
    const jobsContainer = document.getElementById("jobsContainer")
    if (!jobsContainer) {
      console.error("Jobs container element not found")
      return
    }

    jobsContainer.innerHTML =
      '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading job openings...</div>'

    // Add debug information to help troubleshoot
    console.log("Firebase instance:", firebase)
    console.log("Firestore instance:", db)

    try {
      // First, check if the collection exists and has documents
      jobsRef
        .limit(1)
        .get()
        .then((snapshot) => {
          console.log("Initial jobs query completed", snapshot.empty ? "No jobs found" : "Jobs found")
          console.log("Query snapshot:", snapshot)

          // If we're querying an empty collection or non-existent collection
          if (snapshot.empty) {
            jobsContainer.innerHTML =
              '<p class="no-jobs">No current openings. Please check back later or submit your resume for future opportunities.</p>'
            return
          }

          // Collection exists, proceed with the full query
          return jobsRef
            .orderBy("postedDate", "desc")
            .get()
            .then((snapshot) => {
              console.log(`Retrieved ${snapshot.size} jobs`)

              if (snapshot.empty) {
                jobsContainer.innerHTML =
                  '<p class="no-jobs">No current openings. Please check back later or submit your resume for future opportunities.</p>'
                return
              }

              jobsContainer.innerHTML = "" // Clear loading message

              snapshot.forEach((doc) => {
                const job = doc.data()
                console.log(`Processing job: ${job.title}`)

                const jobCard = document.createElement("div")
                jobCard.className = "job-card"

                jobCard.innerHTML = `
                  <div class="job-header">
                      <h3>${job.title || "Untitled Position"}</h3>
                      <span class="job-type">${job.type || "Full-time"}</span>
                  </div>
                  <div class="job-details">
                      <p class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location || "Remote"}</p>
                      <p class="job-department"><i class="fas fa-briefcase"></i> ${job.department || "General"}</p>
                  </div>
                  <p class="job-description">${
                    job.description
                      ? job.description.substring(0, 150) + (job.description.length > 150 ? "..." : "")
                      : "No description available"
                  }</p>
                  <div class="job-skills">
                      ${job.skills ? job.skills.map((skill) => `<span>${skill}</span>`).join("") : ""}
                  </div>
                  <a href="job-details.html?id=${doc.id}" class="btn btn-secondary">Apply Now</a>
                `

                jobsContainer.appendChild(jobCard)
              })
            })
        })
        .catch((error) => {
          console.error("Error loading jobs:", error)
          jobsContainer.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 20px; color: #e53e3e;">
              <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
              <p>Failed to load job listings. Please try again later.</p>
              <p style="font-size: 0.8rem; margin-top: 10px; color: #666;">Error details: ${error.message}</p>
              <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">Retry</button>
            </div>
          `
        })
    } catch (e) {
      console.error("Exception in loadJobs function:", e)
      jobsContainer.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 20px; color: #e53e3e;">
          <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
          <p>Failed to load job listings. Please try again later.</p>
          <p style="font-size: 0.8rem; margin-top: 10px; color: #666;">Error details: ${e.message}</p>
          <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">Retry</button>
        </div>
      `
    }
  }

  // Load Career Content
  function loadCareerContent() {
    console.log("Loading career content")
    // Load Hero Section
    careerContentRef
      .doc("hero")
      .get()
      .then((doc) => {
        if (doc.exists) {
          const heroContent = doc.data()

          const heroHeadline = document.getElementById("heroHeadline")
          const heroSubheadline = document.getElementById("heroSubheadline")
          const heroImage = document.getElementById("heroImage")

          if (heroHeadline) heroHeadline.textContent = heroContent.headline || "Join Our Mission to Transform Education"
          if (heroSubheadline)
            heroSubheadline.textContent =
              heroContent.subheadline ||
              "Be part of a team thats revolutionizing how students learn and achieve their goals."
          if (heroImage && heroContent.imageUrl) heroImage.src = heroContent.imageUrl
        }
      })
      .catch((error) => {
        console.error("Error loading hero content:", error)
      })

    // Load Why Join Us Section
    careerContentRef
      .doc("whyJoinUs")
      .get()
      .then((doc) => {
        if (doc.exists) {
          const whyJoinContent = doc.data()

          const whyJoinHeadline = document.getElementById("whyJoinHeadline")
          const whyJoinSubheadline = document.getElementById("whyJoinSubheadline")

          if (whyJoinHeadline) whyJoinHeadline.textContent = whyJoinContent.headline || "Why Join Vector Labs?"
          if (whyJoinSubheadline)
            whyJoinSubheadline.textContent =
              whyJoinContent.subheadline ||
              "We are building the future of education technology with a team of passionate innovators."
        }
      })
      .catch((error) => {
        console.error("Error loading why join us content:", error)
      })

    // Load Process Section
    careerContentRef
      .doc("process")
      .get()
      .then((doc) => {
        if (doc.exists) {
          const processContent = doc.data()

          const processHeadline = document.getElementById("processHeadline")
          const processSubheadline = document.getElementById("processSubheadline")

          if (processHeadline) processHeadline.textContent = processContent.headline || "Our Application Process"
          if (processSubheadline)
            processSubheadline.textContent =
              processContent.subheadline || "We have designed a straightforward process to help you join our team."
        }
      })
      .catch((error) => {
        console.error("Error loading process content:", error)
      })
  }

  // Load Benefits
  function loadBenefits() {
    console.log("Loading benefits")
    const benefitsGrid = document.getElementById("benefitsGrid")
    if (!benefitsGrid) return

    benefitsGrid.innerHTML =
      '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading benefits...</div>'

    benefitsRef
      .orderBy("order")
      .get()
      .then((snapshot) => {
        benefitsGrid.innerHTML = "" // Clear loading message

        if (snapshot.empty) {
          benefitsGrid.innerHTML = '<p class="no-benefits">No benefits information available at this time.</p>'
          return
        }

        snapshot.forEach((doc) => {
          const benefit = doc.data()

          const benefitCard = document.createElement("div")
          benefitCard.className = "benefit-card"

          benefitCard.innerHTML = `
                    <div class="benefit-icon">
                        <i class="fas ${benefit.icon || "fa-check-circle"}"></i>
                    </div>
                    <h3>${benefit.title || "Benefit"}</h3>
                    <p>${benefit.description || "No description available"}</p>
                `

          benefitsGrid.appendChild(benefitCard)
        })
      })
      .catch((error) => {
        console.error("Error loading benefits:", error)
        benefitsGrid.innerHTML = `<p class="error-message">Failed to load benefits: ${error.message}. Please try again later.</p>`
      })
  }

  // Load Process Steps
  function loadProcessSteps() {
    console.log("Loading process steps")
    const processSteps = document.getElementById("processSteps")
    if (!processSteps) return

    processSteps.innerHTML =
      '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading application process...</div>'

    processStepsRef
      .orderBy("order")
      .get()
      .then((snapshot) => {
        processSteps.innerHTML = "" // Clear loading message

        if (snapshot.empty) {
          processSteps.innerHTML = '<p class="no-steps">No process steps available at this time.</p>'
          return
        }

        snapshot.forEach((doc) => {
          const step = doc.data()

          const stepElement = document.createElement("div")
          stepElement.className = "process-step"

          stepElement.innerHTML = `
                    <div class="step-number">${step.order || "•"}</div>
                    <div class="step-content">
                        <h3>${step.title || "Step"}</h3>
                        <p>${step.description || "No description available"}</p>
                    </div>
                `

          processSteps.appendChild(stepElement)
        })
      })
      .catch((error) => {
        console.error("Error loading process steps:", error)
        processSteps.innerHTML = `<p class="error-message">Failed to load application process: ${error.message}. Please try again later.</p>`
      })
  }

  // Open Application Modal button
  const openApplicationModalBtn = document.getElementById("openApplicationModal")
  if (openApplicationModalBtn) {
    openApplicationModalBtn.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "form.html"
    })
  }

  // Testimonial Slider
  const testimonialSlides = document.querySelectorAll(".testimonial-slide")
  const testimonialDots = document.querySelectorAll(".testimonial-dots .dot")
  const prevBtn = document.querySelector(".testimonial-prev")
  const nextBtn = document.querySelector(".testimonial-next")

  let currentSlide = 0

  function showSlide(index) {
    // Hide all slides
    testimonialSlides.forEach((slide) => {
      slide.classList.remove("active")
    })

    // Remove active class from all dots
    testimonialDots.forEach((dot) => {
      dot.classList.remove("active")
    })

    // Show the selected slide and dot
    if (testimonialSlides[index]) testimonialSlides[index].classList.add("active")
    if (testimonialDots[index]) testimonialDots[index].classList.add("active")
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length
      showSlide(currentSlide)
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentSlide = (currentSlide + 1) % testimonialSlides.length
      showSlide(currentSlide)
    })
  }

  // Dot navigation
  testimonialDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index
      showSlide(currentSlide)
    })
  })

  // Auto-advance slides every 5 seconds
  if (testimonialSlides.length > 0) {
    setInterval(() => {
      if (document.visibilityState === "visible") {
        currentSlide = (currentSlide + 1) % testimonialSlides.length
        showSlide(currentSlide)
      }
    }, 5000)
  }

  // Initialize
  console.log("Starting to initialize career page components")
  loadCareerContent()
  loadBenefits()
  loadProcessSteps()
  loadJobs()

  console.log("Career.js fully initialized")
})

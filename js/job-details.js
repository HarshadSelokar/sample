document.addEventListener("DOMContentLoaded", () => {
  console.log("Job details page loaded - starting initialization")

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
      displayErrorMessage("Firebase SDK not loaded. Please check your internet connection and try again.")
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
  } catch (e) {
    console.error("Firebase initialization error:", e)
    displayErrorMessage(`Error initializing Firebase: ${e.message}`)
    return
  }

  const jobsRef = db.collection("jobs")

  // Get job ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const jobId = urlParams.get("id")
  console.log("Job ID from URL:", jobId)

  // Check if job ID exists
  if (!jobId) {
    console.error("No job ID provided in URL")
    displayErrorMessage("No job ID provided. Please select a job from the careers page.")
    return
  }

  // Load job details
  loadJobDetails(jobId)

  // Function to load job details
  function loadJobDetails(id) {
    console.log(`Loading job details for ID: ${id}`)

    // Show loading state
    const container = document.querySelector(".job-details-container")
    if (container) {
      container.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading job details...</p>
        </div>
      `
    }

    jobsRef
      .doc(id)
      .get()
      .then((doc) => {
        console.log("Job query completed", doc.exists ? "Job found" : "Job not found")

        if (doc.exists) {
          const job = doc.data()
          displayJobDetails(job, id)
        } else {
          // Job not found
          displayErrorMessage("Job listing not found or has been removed.")
        }
      })
      .catch((error) => {
        console.error("Error getting job details:", error)
        displayErrorMessage(`Error loading job details: ${error.message}. Please try again later.`)
      })
  }

  // Function to display job details
  function displayJobDetails(job, jobId) {
    console.log(`Displaying job details for: ${job.title}`)

    // Get the container
    const container = document.querySelector(".job-details-container")
    if (!container) {
      console.error("Job details container not found")
      return
    }

    // Format posted date
    const postedDate = job.postedDate ? new Date(job.postedDate.toDate()).toLocaleDateString() : "-"

    // Get status class
    const statusClass = getStatusClass(job.status || "active")

    // Reset container content with comprehensive job details
    container.innerHTML = `
      <div class="job-details-header">
        <h1 id="jobTitle">${job.title || "Untitled Position"}</h1>
        <span class="job-status ${statusClass}">${job.status || "Active"}</span>
        
        <div class="job-meta" id="jobMeta">
          <div class="job-meta-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${job.location || "-"}</span>
          </div>
          <div class="job-meta-item">
            <i class="fas fa-briefcase"></i>
            <span>${job.department || "-"}</span>
          </div>
          <div class="job-meta-item">
            <i class="fas fa-clock"></i>
            <span>${job.type || "-"}</span>
          </div>
          <div class="job-meta-item">
            <i class="fas fa-calendar-alt"></i>
            <span>Posted: ${postedDate}</span>
          </div>
          ${
            job.salary
              ? `
          <div class="job-meta-item">
            <i class="fas fa-money-bill-wave"></i>
            <span>${job.salary}</span>
          </div>
          `
              : `
          <div class="job-meta-item">
            <i class="fas fa-money-bill-wave"></i>
            <span>-</span>
          </div>
          `
          }
        </div>
      </div>
      
      <div class="job-details-content">
        <!-- Job Information Table -->
        <div class="job-info-container">
        <div class="job-section">
  <h3>Job Information</h3>
  <div class="job-info-list">
    <div class="job-info-item">
      <strong>Job Title:</strong> Senior Full Stack Developer
    </div>
    <div class="job-info-item">
      <strong>Department:</strong> Engineering
    </div>
    <div class="job-info-item">
      <strong>Job Type:</strong> Part-time
    </div>
    <div class="job-info-item">
      <strong>Location:</strong> Remote
    </div>
    <div class="job-info-item">
      <strong>Salary Range:</strong> 5000
    </div>
    <div class="job-info-item">
      <strong>Status:</strong> Active
    </div>
    <div class="job-info-item">
      <strong>Posted Date:</strong> 4/17/2025
    </div>
  </div>
</div>

        </div>.
        <div class="job-section">
          <h3>Job Description</h3>
          <p>${job.description || "-"}</p>
        </div>
        
        <div class="job-section">
          <h3>Requirements</h3>
          ${
            job.requirements && job.requirements.length > 0
              ? `
          <ul class="job-requirements">
            ${job.requirements.map((req) => `<li>${req}</li>`).join("")}
          </ul>
          `
              : `<p class="empty-value">- No specific requirements listed -</p>`
          }
        </div>
        
        <div class="job-section">
          <h3>Skills</h3>
          ${
            job.skills && job.skills.length > 0
              ? `
          <div class="job-skills-detailed">
            ${job.skills.map((skill) => `<span>${skill}</span>`).join("")}
          </div>
          `
              : `<p class="empty-value">- No specific skills listed -</p>`
          }
        </div>
      </div>
      
      <div class="job-details-footer">
        <a href="form.html?jobId=${jobId}" id="applyNowBtn" class="btn btn-primary apply-button">Apply Now</a>
        <a href="career.html" class="btn btn-outline">Back to Careers</a>
      </div>
    `

    // Update page title
    document.title = `${job.title || "Job Details"} - Vector Labs Careers`

    // Add event listener to Apply Now button
    const applyNowBtn = document.getElementById("applyNowBtn")
    if (applyNowBtn) {
      applyNowBtn.addEventListener("click", (e) => {
        e.preventDefault()
        window.location.href = `form.html?jobId=${jobId}`
      })
    }
  }

  // Helper function to get status class
  function getStatusClass(status) {
    status = status.toLowerCase()
    if (status === "active") return "active"
    if (status === "closed") return "closed"
    if (status === "draft") return "draft"
    return "active" // Default
  }

  // Function to display error message
  function displayErrorMessage(message) {
    console.error(`Displaying error: ${message}`)

    const container = document.querySelector(".job-details-container")
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <h2>Oops! Something went wrong</h2>
          <p>${message}</p>
          <a href="career.html" class="btn btn-primary">Back to Careers</a>
        </div>
      `
    }
  }

  console.log("Job details page initialization complete")
})

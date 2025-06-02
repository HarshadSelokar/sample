document.addEventListener("DOMContentLoaded", () => {
    console.log("Application.js loaded - v2")
  
    // Firebase Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDcspoxuhH8LUgx9fSxPTO3QuvkQjx9W_g",
      authDomain: "vectorwebsiteblog.firebaseapp.com",
      projectId: "vectorwebsiteblog",
      storageBucket: "vectorwebsiteblog.appspot.com",
    }
  
    // Initialize Firebase
    let db, storage
    try {
      // Check if Firebase is already initialized
      if (!firebase.apps.length) {
        console.log("Initializing Firebase")
        firebase.initializeApp(firebaseConfig)
      } else {
        console.log("Firebase already initialized")
      }
  
      db = firebase.firestore()
      storage = firebase.storage()
      console.log("Firebase services initialized successfully")
    } catch (e) {
      console.error("Firebase initialization error:", e)
      alert("Error initializing Firebase. Please check console for details.")
      return
    }
  
    // Firestore References
    const jobsRef = db.collection("jobs")
    const applicationsRef = db.collection("applications")
  
    // Get job ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const jobId = urlParams.get("jobId")
    console.log("Job ID from URL:", jobId)
  
    // Elements
    const jobTitleDisplay = document.querySelector("#job-title-display span")
    const applicationForm = document.getElementById("applicationForm")
    const resumeInput = document.getElementById("resume")
    const fileName = document.querySelector(".file-name")
    const submitBtn = document.getElementById("submitBtn")
    const cancelBtn = document.getElementById("cancelBtn")
    const successMessage = document.getElementById("successMessage")
  
    console.log("Form elements:", {
      jobTitleDisplay: !!jobTitleDisplay,
      applicationForm: !!applicationForm,
      resumeInput: !!resumeInput,
      fileName: !!fileName,
      submitBtn: !!submitBtn,
      cancelBtn: !!cancelBtn,
      successMessage: !!successMessage,
    })
  
    // Variables to store job data
    let jobTitle = "General Application"
  
    // Load job details if jobId is provided
    if (jobId) {
      console.log("Fetching job details for ID:", jobId)
      jobsRef
        .doc(jobId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const job = doc.data()
            jobTitle = job.title
            console.log("Job title loaded:", jobTitle)
            if (jobTitleDisplay) {
              jobTitleDisplay.textContent = jobTitle
            } else {
              console.error("jobTitleDisplay element not found")
            }
  
            // Update page title
            document.title = `Apply for ${jobTitle} - Vector Labs`
          } else {
            console.error("Job not found")
            if (jobTitleDisplay) {
              jobTitleDisplay.textContent = "Position not found"
            }
          }
        })
        .catch((error) => {
          console.error("Error getting job:", error)
          if (jobTitleDisplay) {
            jobTitleDisplay.textContent = "Error loading position"
          }
        })
    } else {
      console.log("No job ID provided, using general application")
      if (jobTitleDisplay) {
        jobTitleDisplay.textContent = "General Application"
      }
    }
  
    // File input change handler
    if (resumeInput && fileName) {
      console.log("Adding event listener to resume input")
      resumeInput.addEventListener("change", function () {
        console.log("Resume file changed")
        if (this.files.length > 0) {
          fileName.textContent = this.files[0].name
          console.log("Selected file:", this.files[0].name)
  
          // Validate file size (max 5MB)
          const fileSize = this.files[0].size / 1024 / 1024 // in MB
          console.log("File size:", fileSize, "MB")
          if (fileSize > 5) {
            alert("File size exceeds 5MB. Please choose a smaller file.")
            this.value = "" // Clear the file input
            fileName.textContent = "No file chosen"
          }
        } else {
          fileName.textContent = "No file chosen"
        }
      })
    } else {
      console.error("Resume input or file name elements not found")
    }
  
    // Cancel button handler
    if (cancelBtn) {
      console.log("Adding event listener to cancel button")
      cancelBtn.addEventListener("click", () => {
        console.log("Cancel button clicked")
        if (confirm("Are you sure you want to cancel your application? All entered data will be lost.")) {
          window.location.href = "career.html"
        }
      })
    } else {
      console.error("Cancel button element not found")
    }
  
    // Form submission handler
    if (applicationForm) {
      console.log("Adding submit event listener to application form")
      applicationForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!this.checkValidity()) {
          this.reportValidity();
          return;
        }
      
        const fullName = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const location = document.getElementById("location").value || "";
        const linkedin = document.getElementById("linkedin").value || "";
        const portfolio = document.getElementById("portfolio").value || "";
        const resumeFile = document.getElementById("resume").files[0];
        const coverLetter = document.getElementById("coverLetter").value || "";
        const experience = document.getElementById("experience").value;
        const skills = document.getElementById("skills").value;
        const startDate = document.getElementById("startDate").value;
        const salary = document.getElementById("salary").value || "";
        const referral = document.getElementById("referral").value || "";
        const futureContact = document.getElementById("futureContact").checked;
      
        if (!resumeFile) {
          alert("Please upload your resume.");
          return;
        }
      
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      
        const storageRef = storage.ref();
        const resumeRef = storageRef.child(`applications/${Date.now()}_${resumeFile.name}`);
      
        resumeRef.put(resumeFile)
          .then(snapshot => snapshot.ref.getDownloadURL())
          .then(downloadURL => {
            return applicationsRef.add({
              name: fullName,
              email: email,
              phone: phone,
              location: location,
              linkedin: linkedin,
              portfolio: portfolio,
              position: jobTitle,
              positionId: jobId || "general",
              coverLetter: coverLetter,
              experience: experience,
              skills: skills.split(",").map(s => s.trim()),
              startDate: startDate,
              salary: salary,
              referral: referral,
              futureContact: futureContact,
              resumeUrl: downloadURL,
              status: "new",
              appliedDate: firebase.firestore.FieldValue.serverTimestamp()
            });
          })
          .then(() => {
            // ✅ Show success message and reset form
            successMessage.classList.add("active");
            applicationForm.reset();
            fileName.textContent = "No file chosen";
          })
          .catch(error => {
            console.error("Error submitting application:", error);
            alert("There was an error submitting your application. Please try again.");
          })
          .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Application';
          });
      }
      );
    } else {
      console.error("Application form element not found")
    }
  
    console.log("Application.js initialization complete")
  })
  
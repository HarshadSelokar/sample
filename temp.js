document.addEventListener("DOMContentLoaded", () => {
    // Firebase Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDcspoxuhH8LUgx9fSxPTO3QuvkQjx9W_g",
      authDomain: "vectorwebsiteblog.firebaseapp.com",
      projectId: "vectorwebsiteblog",
      storageBucket: "vectorwebsiteblog.appspot.com",
    }
  
    // Initialize Firebase
    try {
      if (typeof firebase === "undefined") {
        console.error("Firebase is not initialized. Ensure Firebase SDK is included in your HTML.")
        return
      }
      firebase.initializeApp(firebaseConfig)
    } catch (e) {
      console.error("Firebase initialization error:", e)
    }
  
    const auth = firebase.auth()
    const db = firebase.firestore()
    const storage = firebase.storage()

    // Detect if on public career page
        const isPublicCareerPage = document.querySelector(".current-openings") && !document.querySelector("#jobListings");

        if (isPublicCareerPage) {
        renderPublicCareerPage();
        }

        function renderPublicCareerPage() {
            // Render job listings
            const db = firebase.firestore();
            const jobsRef = db.collection("jobs");
            jobsRef.orderBy("postedDate", "desc").onSnapshot(snapshot => {
              const jobsContainer = document.querySelector('.jobs-container');
              if (!jobsContainer) return;
              jobsContainer.innerHTML = ""; // Clear
          
              snapshot.forEach(doc => {
                const job = doc.data();
                const jobEl = document.createElement("div");
                jobEl.className = "job-card";
                jobEl.innerHTML = `
                  <div class="job-header">
                    <h3>${job.title}</h3>
                    <span class="job-type">${job.type}</span>
                  </div>
                  <div class="job-details">
                    <p class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                    <p class="job-department"><i class="fas fa-briefcase"></i> ${job.department}</p>
                  </div>
                  <p class="job-description">${job.description}</p>
                  <div class="job-skills">
                    ${job.skills?.map(skill => `<span>${skill}</span>`).join('') || ''}
                  </div>
                  <a href="form.html" class="btn btn-secondary">Apply Now</a>
                `;
                jobsContainer.appendChild(jobEl);
              });
            });
          
            // Render benefits
            benefitsRef.orderBy("order").onSnapshot(snapshot => {
              const container = document.querySelector(".benefits-grid");
              if (!container) return;
              container.innerHTML = "";
          
              snapshot.forEach(doc => {
                const benefit = doc.data();
                const benefitCard = document.createElement("div");
                benefitCard.className = "benefit-card";
                benefitCard.innerHTML = `
                  <div class="benefit-icon"><i class="${benefit.icon || 'fas fa-check-circle'}"></i></div>
                  <h3>${benefit.title}</h3>
                  <p>${benefit.description}</p>
                `;
                container.appendChild(benefitCard);
              });
            });
          
            // Render process steps
            processStepsRef.orderBy("order").onSnapshot(snapshot => {
              const container = document.querySelector(".process-steps");
              if (!container) return;
          
              const stepsWrapper = container.querySelector(".process-steps") || container;
              stepsWrapper.innerHTML = "";
          
              snapshot.forEach(doc => {
                const step = doc.data();
                const stepEl = document.createElement("div");
                stepEl.className = "process-step";
                stepEl.innerHTML = `
                  <div class="step-number">${step.order}</div>
                  <div class="step-content">
                    <h3>${step.title}</h3>
                    <p>${step.description}</p>
                  </div>
                `;
                stepsWrapper.appendChild(stepEl);
              });
            });
          
            // Optionally update hero content
            careerContentRef.doc("hero").get().then(doc => {
              if (doc.exists) {
                const data = doc.data();
                const headline = document.querySelector(".headline");
                const subheadline = document.querySelector(".subheadline");
                if (headline) headline.textContent = data.headline || headline.textContent;
                if (subheadline) subheadline.textContent = data.subheadline || subheadline.textContent;
              }
            });
          }
          
  
    // Firestore References
    const blogsRef = db.collection("blogs")
    const jobsRef = db.collection("jobs")
    const careerContentRef = db.collection("careerContent")
    const applicationsRef = db.collection("applications")
    const benefitsRef = db.collection("benefits")
    const processStepsRef = db.collection("processSteps")
  
    // Check Authentication
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = "login.html"
        return
      }
  
      try {
        const adminDoc = await db.collection("admins").doc(user.email).get()
        if (!adminDoc.exists) {
          alert("You are not authorized.")
          auth.signOut()
          window.location.href = "login.html"
          return
        }
  
        // Set user info
        setUserInfo(user)
  
        // Load data
        fetchBlogs()
        fetchJobs()
        fetchCareerContent()
        fetchApplications()
        fetchBenefits()
        fetchProcessSteps()
  
        // Update dashboard stats
        updateStats()
  
        // Update recent activity
        updateRecentActivity()
      } catch (error) {
        console.error("Error checking admin status:", error)
        alert("An error occurred. Please try again.")
      }
    })
  
    // Set User Info
    function setUserInfo(user) {
      const userName = document.getElementById("userName")
      const userRole = document.getElementById("userRole")
      const userAvatar = document.getElementById("userAvatar")
      const headerUserName = document.getElementById("headerUserName")
      const headerUserAvatar = document.getElementById("headerUserAvatar")
  
      if (userName && userRole && userAvatar) {
        userName.textContent = user.displayName || user.email.split("@")[0]
        userRole.textContent = "Administrator"
  
        if (user.photoURL) {
          userAvatar.src = user.photoURL
          if (headerUserAvatar) headerUserAvatar.src = user.photoURL
        }
  
        if (headerUserName) {
          headerUserName.textContent = user.displayName || user.email.split("@")[0]
        }
      }
    }
  
    // Logout
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault()
        auth
          .signOut()
          .then(() => {
            window.location.href = "login.html"
          })
          .catch((error) => {
            console.error("Error signing out:", error)
          })
      })
    }
  
    // Sidebar Toggle
    const sidebarToggle = document.getElementById("sidebarToggle")
    const dashboardContainer = document.querySelector(".dashboard-container")
  
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        dashboardContainer.classList.toggle("sidebar-collapsed")
        document.querySelector(".dashboard-sidebar").classList.toggle("expanded")
      })
    }
  
    // Navigation Links
    const navLinks = document.querySelectorAll(".nav-link")
    const dashboardOverview = document.getElementById("dashboardOverview")
    const blogManagement = document.getElementById("blogManagement")
    const careerManagement = document.getElementById("careerManagement")
  
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault()
  
        // Remove active class from all links
        navLinks.forEach((l) => {
          l.parentElement.classList.remove("active")
        })
  
        // Add active class to clicked link
        this.parentElement.classList.add("active")
  
        // Show corresponding section
        const page = this.getAttribute("data-page")
  
        if (page === "blog") {
          dashboardOverview.style.display = "none"
          blogManagement.style.display = "block"
          careerManagement.style.display = "none"
        } else if (page === "career") {
          dashboardOverview.style.display = "none"
          blogManagement.style.display = "none"
          careerManagement.style.display = "block"
        } else {
          dashboardOverview.style.display = "block"
          blogManagement.style.display = "none"
          careerManagement.style.display = "none"
        }
      })
    })
  
    // Career Management Tabs
    const tabButtons = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        tabButtons.forEach((btn) => {
          btn.classList.remove("active")
        })
  
        // Add active class to clicked button
        this.classList.add("active")
  
        // Show corresponding tab content
        const tabId = this.getAttribute("data-tab")
  
        tabContents.forEach((content) => {
          content.classList.remove("active")
        })
  
        document.getElementById(tabId).classList.add("active")
      })
    })
  
    // Update Dashboard Stats
    function updateStats() {
      // Update blog count
      blogsRef.get().then((snapshot) => {
        const blogCount = document.getElementById("blogCount")
        if (blogCount) {
          blogCount.textContent = snapshot.size
        }
      })
  
      // Update job count
      jobsRef.get().then((snapshot) => {
        const jobCount = document.querySelector(".stat-info p:nth-child(2)")
        if (jobCount) {
          jobCount.textContent = snapshot.size
        }
      })
  
      // Update benefits count
      benefitsRef.get().then((snapshot) => {
        const benefitsCount = document.getElementById("benefitsCount")
        if (benefitsCount) {
          benefitsCount.textContent = snapshot.size
        }
      })
  
      // Update process steps count
      processStepsRef.get().then((snapshot) => {
        const stepsCount = document.getElementById("stepsCount")
        if (stepsCount) {
          stepsCount.textContent = snapshot.size
        }
      })
    }
  
    // Update Recent Activity
    function updateRecentActivity() {
      const activityList = document.getElementById("recentActivityList")
      if (!activityList) return
  
      // Clear existing activities
      activityList.innerHTML = ""
  
      // Get recent blogs
      blogsRef
        .orderBy("createdAt", "desc")
        .limit(2)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const blog = doc.data()
            const activityDate = blog.createdAt ? new Date(blog.createdAt.toDate()).toLocaleString() : "Unknown date"
  
            const activityItem = document.createElement("div")
            activityItem.className = "activity-item"
  
            activityItem.innerHTML = `
                          <div class="activity-icon">
                              <i class="fas fa-file-alt"></i>
                          </div>
                          <div class="activity-details">
                              <p>Blog post added: <strong>${blog.title}</strong></p>
                              <span class="activity-time">${activityDate}</span>
                          </div>
                      `
  
            activityList.appendChild(activityItem)
          })
        })
  
      // Get recent jobs
      jobsRef
        .orderBy("postedDate", "desc")
        .limit(2)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const job = doc.data()
            const activityDate = job.postedDate ? new Date(job.postedDate.toDate()).toLocaleString() : "Unknown date"
  
            const activityItem = document.createElement("div")
            activityItem.className = "activity-item"
  
            activityItem.innerHTML = `
                          <div class="activity-icon">
                              <i class="fas fa-briefcase"></i>
                          </div>
                          <div class="activity-details">
                              <p>Job listing added: <strong>${job.title}</strong></p>
                              <span class="activity-time">${activityDate}</span>
                          </div>
                      `
  
            activityList.appendChild(activityItem)
          })
        })
  
      // Get recent benefits
      benefitsRef
        .orderBy("updatedAt", "desc")
        .limit(1)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const benefit = doc.data()
            const activityDate = benefit.updatedAt
              ? new Date(benefit.updatedAt.toDate()).toLocaleString()
              : "Unknown date"
  
            const activityItem = document.createElement("div")
            activityItem.className = "activity-item"
  
            activityItem.innerHTML = `
                          <div class="activity-icon">
                              <i class="fas fa-star"></i>
                          </div>
                          <div class="activity-details">
                              <p>Benefit updated: <strong>${benefit.title}</strong></p>
                              <span class="activity-time">${activityDate}</span>
                          </div>
                      `
  
            activityList.appendChild(activityItem)
          })
        })
    }
  
    // ===== BLOG MANAGEMENT =====
  
    // Blog CRUD Logic
    const submitBlogBtn = document.getElementById("submitBlogBtn")
    const resetBlogBtn = document.getElementById("resetBlogBtn")
  
    // Submit Blog
    if (submitBlogBtn) {
      submitBlogBtn.addEventListener("click", () => {
        submitBlog()
      })
    }
  
    // Reset Blog Form
    if (resetBlogBtn) {
      resetBlogBtn.addEventListener("click", () => {
        resetBlogForm()
      })
    }
  
    function submitBlog() {
      const id = document.getElementById("blog-id").value
      const title = document.getElementById("title").value
      const content = document.getElementById("content").value
      const category = document.getElementById("category").value
      const readTime = +document.getElementById("readTime").value
      const imageUrl = document.getElementById("imageUrl").value
  
      if (!title || !content || !category || !readTime) {
        alert("Please fill in all required fields")
        return
      }
  
      const data = {
        title: title,
        content: content,
        category: category,
        readTime: readTime,
        imageUrl: imageUrl,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }
  
      if (!id) {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp()
      }
  
      if (id) {
        blogsRef
          .doc(id)
          .update(data)
          .then(() => {
            alert("Blog updated successfully!")
            resetBlogForm()
            fetchBlogs()
            updateRecentActivity()
          })
          .catch((error) => {
            console.error("Error updating blog:", error)
            alert("Error updating blog. Please try again.")
          })
      } else {
        blogsRef
          .add(data)
          .then(() => {
            alert("Blog added successfully!")
            resetBlogForm()
            fetchBlogs()
            updateStats()
            updateRecentActivity()
          })
          .catch((error) => {
            console.error("Error adding blog:", error)
            alert("Error adding blog. Please try again.")
          })
      }
    }
  
    function fetchBlogs() {
      blogsRef
        .orderBy("createdAt", "desc")
        .get()
        .then((snapshot) => {
          const container = document.getElementById("blogs-list")
          if (!container) return
  
          container.innerHTML = ""
  
          if (snapshot.empty) {
            container.innerHTML = "<p class='no-blogs'>No blogs found. Create your first blog post!</p>"
            return
          }
  
          snapshot.forEach((doc) => {
            const blog = doc.data()
            const blogDate = blog.createdAt ? new Date(blog.createdAt.toDate()).toLocaleDateString() : "Unknown date"
  
            const blogItem = document.createElement("div")
            blogItem.className = "blog-post-item"
  
            blogItem.innerHTML = `
                      <div class="post-thumbnail">
                          <img src="${blog.imageUrl || "images/blog-placeholder-1.jpg"}" alt="${blog.title}">
                      </div>
                      <div class="post-details">
                          <h3>${blog.title}</h3>
                          <div class="post-meta">
                              <span><i class="fas fa-calendar"></i> ${blogDate}</span>
                              <span><i class="fas fa-folder"></i> ${blog.category}</span>
                              <span><i class="fas fa-clock"></i> ${blog.readTime} min read</span>
                          </div>
                          <p class="post-excerpt">${blog.content.substring(0, 150)}${blog.content.length > 150 ? "..." : ""}</p>
                      </div>
                      <div class="post-actions">
                          <button class="btn-icon edit-blog-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                          <button class="btn-icon delete-blog-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i></button>
                      </div>
                  `
  
            container.appendChild(blogItem)
          })
  
          // Add event listeners to edit and delete buttons
          addBlogActionListeners()
        })
        .catch((error) => {
          console.error("Error fetching blogs:", error)
        })
    }
  
    function addBlogActionListeners() {
      // Edit Blog
      const editBlogBtns = document.querySelectorAll(".edit-blog-btn")
      editBlogBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const blogId = this.getAttribute("data-id")
          editBlog(blogId)
        })
      })
  
      // Delete Blog
      const deleteBlogBtns = document.querySelectorAll(".delete-blog-btn")
      deleteBlogBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const blogId = this.getAttribute("data-id")
          deleteBlog(blogId)
        })
      })
    }
  
    function editBlog(id) {
      blogsRef
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const blog = doc.data()
            document.getElementById("blog-id").value = id
            document.getElementById("title").value = blog.title
            document.getElementById("content").value = blog.content
            document.getElementById("category").value = blog.category
            document.getElementById("readTime").value = blog.readTime
            document.getElementById("imageUrl").value = blog.imageUrl || ""
  
            // Scroll to the form
            document.querySelector(".blog-editor").scrollIntoView({ behavior: "smooth" })
          }
        })
        .catch((error) => {
          console.error("Error getting blog:", error)
        })
    }
  
    function deleteBlog(id) {
      if (confirm("Are you sure you want to delete this blog?")) {
        blogsRef
          .doc(id)
          .delete()
          .then(() => {
            alert("Blog deleted successfully!")
            fetchBlogs()
            updateStats()
            updateRecentActivity()
          })
          .catch((error) => {
            console.error("Error deleting blog:", error)
            alert("Error deleting blog. Please try again.")
          })
      }
    }
  
    function resetBlogForm() {
      document.getElementById("blog-id").value = ""
      document.getElementById("title").value = ""
      document.getElementById("content").value = ""
      document.getElementById("category").value = ""
      document.getElementById("readTime").value = ""
      document.getElementById("imageUrl").value = ""
    }
  
    // ===== CAREER MANAGEMENT =====
  
    // Job Form Modal
    const addJobBtn = document.getElementById("addJobBtn")
    const jobFormModal = document.getElementById("jobFormModal")
    const closeModal = document.querySelector(".close-modal")
    const cancelJobBtn = document.getElementById("cancelJobBtn")
    const saveJobBtn = document.getElementById("saveJobBtn")
    const jobForm = document.getElementById("jobForm")
    const modalTitle = document.getElementById("modalTitle")
  
    // Open modal when Add Job button is clicked
    if (addJobBtn) {
      addJobBtn.addEventListener("click", () => {
        modalTitle.textContent = "Add New Job Listing"
        jobForm.reset()
        document.getElementById("jobId").value = ""
        jobFormModal.classList.add("active")
      })
    }
  
    // Close modal when close button is clicked
    if (closeModal) {
      closeModal.addEventListener("click", () => {
        jobFormModal.classList.remove("active")
      })
    }
  
    // Close modal when Cancel button is clicked
    if (cancelJobBtn) {
      cancelJobBtn.addEventListener("click", () => {
        jobFormModal.classList.remove("active")
      })
    }
  
    // Fetch and render job listings
    function fetchJobs() {
      jobsRef
        .orderBy("postedDate", "desc")
        .get()
        .then((snapshot) => {
          const tableBody = document.querySelector("#jobListings tbody")
          if (!tableBody) return
  
          tableBody.innerHTML = "" // Clear existing
  
          if (snapshot.empty) {
            const tr = document.createElement("tr")
            tr.innerHTML = `<td colspan="8" style="text-align: center;">No job listings found.</td>`
            tableBody.appendChild(tr)
            return
          }
  
          snapshot.forEach((doc) => {
            const job = doc.data()
            const postedDate = job.postedDate ? new Date(job.postedDate.toDate()).toLocaleDateString() : "Unknown"
  
            const tr = document.createElement("tr")
            tr.innerHTML = `
                      <td>${job.title}</td>
                      <td>${job.department}</td>
                      <td>${job.location}</td>
                      <td>${job.type}</td>
                      <td>${postedDate}</td>
                      <td>${job.applications || 0}</td>
                      <td><span class="status-${job.status}">${job.status}</span></td>
                      <td>
                          <button class="btn-icon edit-job-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                          <button class="btn-icon delete-job-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i></button>
                      </td>
                  `
            tableBody.appendChild(tr)
          })
  
          // Add event listeners to edit and delete buttons
          addJobActionListeners()
        })
        .catch((error) => {
          console.error("Error fetching jobs:", error)
        })
    }
  
    function addJobActionListeners() {
      // Edit Job
      const editJobBtns = document.querySelectorAll(".edit-job-btn")
      editJobBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const jobId = this.getAttribute("data-id")
          editJob(jobId)
        })
      })
  
      // Delete Job
      const deleteJobBtns = document.querySelectorAll(".delete-job-btn")
      deleteJobBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const jobId = this.getAttribute("data-id")
          deleteJob(jobId)
        })
      })
    }
  
    function editJob(id) {
      jobsRef
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const job = doc.data()
  
            document.getElementById("jobId").value = id
            document.getElementById("jobTitle").value = job.title || ""
            document.getElementById("jobDepartment").value = job.department || ""
            document.getElementById("jobType").value = job.type || ""
            document.getElementById("jobLocation").value = job.location || ""
            document.getElementById("jobDescription").value = job.description || ""
            document.getElementById("jobRequirements").value = job.requirements ? job.requirements.join("\n") : ""
            document.getElementById("jobSkills").value = job.skills ? job.skills.join(", ") : ""
            document.getElementById("jobSalary").value = job.salary || ""
  
            const statusRadio = document.querySelector(`input[name="jobStatus"][value="${job.status}"]`)
            if (statusRadio) statusRadio.checked = true
  
            modalTitle.textContent = "Edit Job Listing"
            jobFormModal.classList.add("active")
          }
        })
        .catch((error) => {
          console.error("Error getting job:", error)
        })
    }
  
    function deleteJob(id) {
      if (confirm("Are you sure you want to delete this job listing?")) {
        jobsRef
          .doc(id)
          .delete()
          .then(() => {
            alert("Job listing deleted successfully!")
            fetchJobs()
            updateStats()
            updateRecentActivity()
          })
          .catch((error) => {
            console.error("Error deleting job:", error)
            alert("Error deleting job. Please try again.")
          })
      }
    }
  
    // Save Job button
    if (saveJobBtn) {
      saveJobBtn.addEventListener("click", () => {
        // Validate form
        if (!jobForm.checkValidity()) {
          jobForm.reportValidity()
          return
        }
  
        const jobId = document.getElementById("jobId").value
        const title = document.getElementById("jobTitle").value
        const department = document.getElementById("jobDepartment").value
        const type = document.getElementById("jobType").value
        const location = document.getElementById("jobLocation").value
        const description = document.getElementById("jobDescription").value
        const requirementsText = document.getElementById("jobRequirements").value
        const skillsText = document.getElementById("jobSkills").value
        const salary = document.getElementById("jobSalary").value
        const status = document.querySelector('input[name="jobStatus"]:checked').value
  
        // Process requirements and skills
        const requirements = requirementsText.split("\n").filter((req) => req.trim() !== "")
        const skills = skillsText
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== "")
  
        const data = {
          title,
          department,
          type,
          location,
          description,
          requirements,
          skills,
          salary,
          status,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }
  
        if (!jobId) {
          data.postedDate = firebase.firestore.FieldValue.serverTimestamp()
          data.applications = 0
        }
  
        const saveOperation = jobId ? jobsRef.doc(jobId).update(data) : jobsRef.add(data)
  
        saveOperation
          .then(() => {
            alert(jobId ? "Job updated successfully!" : "Job added successfully!")
            jobFormModal.classList.remove("active")
            fetchJobs()
            updateStats()
            updateRecentActivity()
          })
          .catch((error) => {
            console.error("Error saving job:", error)
            alert("Error saving job. Please try again.")
          })
      })
    }
  
    // Career Page Content Management
    function fetchCareerContent() {
      careerContentRef
        .doc("hero")
        .get()
        .then((doc) => {
          if (doc.exists) {
            const heroContent = doc.data()
            document.getElementById("heroHeadline").value = heroContent.headline || ""
            document.getElementById("heroSubheadline").value = heroContent.subheadline || ""
  
            // Update file name if there's an image
            if (heroContent.imageUrl) {
              const fileName = document.querySelector(".file-name")
              if (fileName) {
                fileName.textContent = heroContent.imageUrl.split("/").pop()
              }
            }
          }
        })
  
      careerContentRef
        .doc("whyJoinUs")
        .get()
        .then((doc) => {
          if (doc.exists) {
            const whyJoinContent = doc.data()
            document.getElementById("whyJoinHeadline").value = whyJoinContent.headline || ""
            document.getElementById("whyJoinSubheadline").value = whyJoinContent.subheadline || ""
          }
        })
  
      careerContentRef
        .doc("process")
        .get()
        .then((doc) => {
          if (doc.exists) {
            const processContent = doc.data()
            document.getElementById("processHeadline").value = processContent.headline || ""
            document.getElementById("processSubheadline").value = processContent.subheadline || ""
          }
        })
    }
  
    // Fetch Benefits
    function fetchBenefits() {
      benefitsRef
        .orderBy("order")
        .get()
        .then((snapshot) => {
          const benefitsList = document.querySelector(".benefits-list")
          if (!benefitsList) return
  
          benefitsList.innerHTML = ""
  
          if (snapshot.empty) {
            benefitsList.innerHTML = "<p>No benefits added yet.</p>"
            return
          }
  
          snapshot.forEach((doc) => {
            const benefit = doc.data()
            const benefitItem = document.createElement("div")
            benefitItem.className = "benefit-item"
            benefitItem.innerHTML = `
                      <div class="benefit-header">
                          <h5>${benefit.title}</h5>
                          <div class="benefit-actions">
                              <button class="btn-icon edit-benefit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                              <button class="btn-icon delete-benefit-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i></button>
                          </div>
                      </div>
                      <p>${benefit.description}</p>
                  `
            benefitsList.appendChild(benefitItem)
          })
  
          // Add event listeners for benefit actions
          addBenefitActionListeners()
        })
    }
  
    function addBenefitActionListeners() {
      // Edit Benefit
      const editBenefitBtns = document.querySelectorAll(".edit-benefit-btn")
      editBenefitBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const benefitId = this.getAttribute("data-id")
          editBenefit(benefitId)
        })
      })
  
      // Delete Benefit
      const deleteBenefitBtns = document.querySelectorAll(".delete-benefit-btn")
      deleteBenefitBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const benefitId = this.getAttribute("data-id")
          deleteBenefit(benefitId)
        })
      })
    }
  
    function editBenefit(id) {
      benefitsRef
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const benefit = doc.data()
  
            // Get modal elements
            const benefitModal = document.getElementById("benefitModal")
            const benefitModalTitle = document.getElementById("benefitModalTitle")
            const benefitId = document.getElementById("benefitId")
            const benefitTitle = document.getElementById("benefitTitle")
            const benefitDescription = document.getElementById("benefitDescription")
            const benefitIcon = document.getElementById("benefitIcon")
            const benefitOrder = document.getElementById("benefitOrder")
  
            // Set modal values
            benefitModalTitle.textContent = "Edit Benefit"
            benefitId.value = id
            benefitTitle.value = benefit.title || ""
            benefitDescription.value = benefit.description || ""
            benefitIcon.value = benefit.icon || "fa-check-circle"
            benefitOrder.value = benefit.order || 1
  
            // Show modal
            benefitModal.classList.add("active")
          }
        })
        .catch((error) => {
          console.error("Error getting benefit:", error)
        })
    }
  
    function deleteBenefit(id) {
      if (confirm("Are you sure you want to delete this benefit?")) {
        benefitsRef
          .doc(id)
          .delete()
          .then(() => {
            alert("Benefit deleted successfully!")
            fetchBenefits()
            updateStats()
            updateRecentActivity()
          })
          .catch((error) => {
            console.error("Error deleting benefit:", error)
            alert("Error deleting benefit. Please try again.")
          })
      }
    }
  
    // Fetch Process Steps
    function fetchProcessSteps() {
      processStepsRef
        .orderBy("order")
        .get()
        .then((snapshot) => {
          const stepsList = document.querySelector(".process-steps-list")
          if (!stepsList) return
  
          stepsList.innerHTML = ""
  
          if (snapshot.empty) {
            stepsList.innerHTML = "<p>No process steps added yet.</p>"
            return
          }
  
          snapshot.forEach((doc) => {
            const step = doc.data()
            const stepItem = document.createElement("div")
            stepItem.className = "process-step-item"
            stepItem.innerHTML = `
                      <div class="step-header">
                          <span class="step-number">${step.order}</span>
                          <h5>${step.title}</h5>
                          <div class="step-actions">
                              <button class="btn-icon edit-step-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                              <button class="btn-icon delete-step-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i></button>
                          </div>
                      </div>
                      <p>${step.description}</p>
                  `
            stepsList.appendChild(stepItem)
          })
  
          // Add event listeners for step actions
          addStepActionListeners()
        })
    }
  
    function addStepActionListeners() {
      // Edit Step
      const editStepBtns = document.querySelectorAll(".edit-step-btn")
      editStepBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const stepId = this.getAttribute("data-id")
          editStep(stepId)
        })
      })
  
      // Delete Step
      const deleteStepBtns = document.querySelectorAll(".delete-step-btn")
      deleteStepBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const stepId = this.getAttribute("data-id")
          deleteStep(stepId)
        })
      })
    }
  
    function editStep(id) {
      processStepsRef
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const step = doc.data()
  
            // Get modal elements
            const stepModal = document.getElementById("stepModal")
            const stepModalTitle = document.getElementById("stepModalTitle")
            const stepId = document.getElementById("stepId")
            const stepTitle = document.getElementById("stepTitle")
            const stepDescription = document.getElementById("stepDescription")
            const stepOrder = document.getElementById("stepOrder")
  
            // Set modal values
            stepModalTitle.textContent = "Edit Process Step"
            stepId.value = id
            stepTitle.value = step.title || ""
            stepDescription.value = step.description || ""
            stepOrder.value = step.order || 1
  
            // Show modal
            stepModal.classList.add("active")
          }
        })
        .catch((error) => {
          console.error("Error getting process step:", error)
        })
    }
  
    function deleteStep(id) {
      if (confirm("Are you sure you want to delete this process step?")) {
        processStepsRef
          .doc(id)
          .delete()
          .then(() => {
            alert("Process step deleted successfully!")
            fetchProcessSteps()
            updateStats()
            updateRecentActivity()
          })
          .catch((error) => {
            console.error("Error deleting process step:", error)
            alert("Error deleting process step. Please try again.")
          })
      }
    }
  
    // Save Page Content button
    const savePageContentBtn = document.getElementById("savePageContent")
  
    if (savePageContentBtn) {
      savePageContentBtn.addEventListener("click", () => {
        // Get hero section values
        const heroHeadline = document.getElementById("heroHeadline").value
        const heroSubheadline = document.getElementById("heroSubheadline").value
  
        // Get why join us section values
        const whyJoinHeadline = document.getElementById("whyJoinHeadline").value
        const whyJoinSubheadline = document.getElementById("whyJoinSubheadline").value
  
        // Get process section values
        const processHeadline = document.getElementById("processHeadline").value
        const processSubheadline = document.getElementById("processSubheadline").value
  
        // Save hero section
        careerContentRef.doc("hero").set(
          {
            headline: heroHeadline,
            subheadline: heroSubheadline,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        )
  
        // Save why join us section
        careerContentRef.doc("whyJoinUs").set(
          {
            headline: whyJoinHeadline,
            subheadline: whyJoinSubheadline,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        )
  
        // Save process section
        careerContentRef.doc("process").set(
          {
            headline: processHeadline,
            subheadline: processSubheadline,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        )
  
        alert("Career page content updated successfully!")
      })
    }
  
    // File Upload for Hero Image
    const fileInput = document.getElementById("heroImage")
    const fileName = document.querySelector(".file-name")
  
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        if (this.files.length > 0) {
          fileName.textContent = this.files[0].name
  
          // Upload file to Firebase Storage
          const file = this.files[0]
          const storageRef = storage.ref()
          const fileRef = storageRef.child(`career/${file.name}`)
  
          fileRef
            .put(file)
            .then((snapshot) => {
              return snapshot.ref.getDownloadURL()
            })
            .then((downloadURL) => {
              // Save the download URL to Firestore
              careerContentRef.doc("hero").update({
                imageUrl: downloadURL,
              })
  
              alert("Image uploaded successfully!")
            })
            .catch((error) => {
              console.error("Error uploading image:", error)
              alert("Error uploading image. Please try again.")
            })
        } else {
          fileName.textContent = "No file chosen"
        }
      })
    }
  
    // Fetch Applications
    function fetchApplications() {
      applicationsRef
        .orderBy("appliedDate", "desc")
        .get()
        .then((snapshot) => {
          const tableBody = document.querySelector("#applications tbody")
          if (!tableBody) return
  
          tableBody.innerHTML = "" // Clear existing
  
          if (snapshot.empty) {
            const tr = document.createElement("tr")
            tr.innerHTML = `<td colspan="5" style="text-align: center;">No applications found.</td>`
            tableBody.appendChild(tr)
            return
          }
  
          snapshot.forEach((doc) => {
            const application = doc.data()
            const appliedDate = application.appliedDate
              ? new Date(application.appliedDate.toDate()).toLocaleDateString()
              : "Unknown"
  
            const tr = document.createElement("tr")
            tr.innerHTML = `
                      <td>
                          <div class="applicant-info">
                              <img src="${application.photoUrl || "images/avatar-placeholder.jpg"}" alt="Applicant">
                              <div>
                                  <h4>${application.name}</h4>
                                  <p>${application.email}</p>
                              </div>
                          </div>
                      </td>
                      <td>${application.position}</td>
                      <td>${appliedDate}</td>
                      <td><span class="status-${application.status}">${application.status}</span></td>
                      <td>
                          <button class="btn-icon view-application-btn" data-id="${doc.id}"><i class="fas fa-eye"></i></button>
                          <button class="btn-icon download-resume-btn" data-id="${doc.id}"><i class="fas fa-download"></i></button>
                      </td>
                  `
            tableBody.appendChild(tr)
          })
  
          // Add event listeners for application actions
          addApplicationActionListeners()
        })
        .catch((error) => {
          console.error("Error fetching applications:", error)
        })
    }
  
    function addApplicationActionListeners() {
      // View Application
      const viewBtns = document.querySelectorAll(".view-application-btn")
      viewBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const applicationId = this.getAttribute("data-id")
          viewApplication(applicationId)
        })
      })
  
      // Download Resume
      const downloadBtns = document.querySelectorAll(".download-resume-btn")
      downloadBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          const applicationId = this.getAttribute("data-id")
          downloadResume(applicationId)
        })
      })
    }
  
    function viewApplication(id) {
      // This would open a modal with application details
      applicationsRef
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const application = doc.data()
            // Display application details in a modal
            alert(`Viewing application from ${application.name} for ${application.position}`)
            // In a real app, you'd show a modal with all details
          }
        })
    }
  
    function downloadResume(id) {
      applicationsRef
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const application = doc.data()
            if (application.resumeUrl) {
              // Open resume URL in new tab
              window.open(application.resumeUrl, "_blank")
            } else {
              alert("No resume available for this applicant.")
            }
          }
        })
    }
  
    // Application Filters
    const filterBtn = document.querySelector("#applications .btn-secondary")
    if (filterBtn) {
      filterBtn.addEventListener("click", () => {
        const position = document.getElementById("positionFilter").value
        const status = document.getElementById("statusFilter").value
        const date = document.getElementById("dateFilter").value
  
        // Build query based on filters
        let query = applicationsRef
  
        if (position) {
          query = query.where("position", "==", position)
        }
  
        if (status) {
          query = query.where("status", "==", status)
        }
  
        if (date) {
          const now = new Date()
          let startDate
  
          if (date === "today") {
            startDate = new Date(now.setHours(0, 0, 0, 0))
          } else if (date === "week") {
            startDate = new Date(now.setDate(now.getDate() - 7))
          } else if (date === "month") {
            startDate = new Date(now.setMonth(now.getMonth() - 1))
          }
  
          if (startDate) {
            query = query.where("appliedDate", ">=", startDate)
          }
        }
  
        // Execute query
        query
          .orderBy("appliedDate", "desc")
          .get()
          .then((snapshot) => {
            // Update table with filtered results
            // Similar to fetchApplications but with filtered data
            const tableBody = document.querySelector("#applications tbody")
            if (!tableBody) return
  
            tableBody.innerHTML = "" // Clear existing
  
            if (snapshot.empty) {
              const tr = document.createElement("tr")
              tr.innerHTML = `<td colspan="5" style="text-align: center;">No applications found matching your filters.</td>`
              tableBody.appendChild(tr)
              return
            }
  
            // Render applications (same code as in fetchApplications)
            snapshot.forEach((doc) => {
              const application = doc.data()
              const appliedDate = application.appliedDate
                ? new Date(application.appliedDate.toDate()).toLocaleDateString()
                : "Unknown"
  
              const tr = document.createElement("tr")
              tr.innerHTML = `
                          <td>
                              <div class="applicant-info">
                                  <img src="${application.photoUrl || "images/avatar-placeholder.jpg"}" alt="Applicant">
                                  <div>
                                      <h4>${application.name}</h4>
                                      <p>${application.email}</p>
                                  </div>
                              </div>
                          </td>
                          <td>${application.position}</td>
                          <td>${appliedDate}</td>
                          <td><span class="status-${application.status}">${application.status}</span></td>
                          <td>
                              <button class="btn-icon view-application-btn" data-id="${doc.id}"><i class="fas fa-eye"></i></button>
                              <button class="btn-icon download-resume-btn" data-id="${doc.id}"><i class="fas fa-download"></i></button>
                          </td>
                      `
              tableBody.appendChild(tr)
            })
  
            // Add event listeners for application actions
            addApplicationActionListeners()
          })
      })
    }
  
    // Add Benefit Button
    const addBenefitBtn = document.getElementById("addBenefitBtn")
    if (addBenefitBtn) {
      addBenefitBtn.addEventListener("click", () => {
        // Implementation would go here
        alert("Add benefit functionality would be implemented here")
        // In a real app, you'd show a modal to add a new benefit
      })
    }
  
    // Add Step Button
    const addStepBtn = document.getElementById("addStepBtn")
    if (addStepBtn) {
      addStepBtn.addEventListener("click", () => {
        // Implementation would go here
        alert("Add step functionality would be implemented here")
        // In a real app, you'd show a modal to add a new process step
      })
    }
  })
  document.addEventListener("DOMContentLoaded", () => {
  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDcspoxuhH8LUgx9fSxPTO3QuvkQjx9W_g",
    authDomain: "vectorwebsiteblog.firebaseapp.com",
    projectId: "vectorwebsiteblog",
    storageBucket: "vectorwebsiteblog.appspot.com",
  }

  // Initialize Firebase
  try {
    if (typeof firebase === "undefined") {
      console.error("Firebase is not initialized. Ensure Firebase SDK is included in your HTML.")
      return
    }
    firebase.initializeApp(firebaseConfig)
  } catch (e) {
    console.error("Firebase initialization error:", e)
  }

  const auth = firebase.auth()
  const db = firebase.firestore()
  const storage = firebase.storage()

  // Firestore References
  const blogsRef = db.collection("blogs")
  const jobsRef = db.collection("jobs")
  const careerContentRef = db.collection("careerContent")
  const applicationsRef = db.collection("applications")
  const benefitsRef = db.collection("benefits")
  const processStepsRef = db.collection("processSteps")

  // Check Authentication
  const isDashboard = window.location.pathname.includes("dashboard.html");

  auth.onAuthStateChanged(async (user) => {
    if (isDashboard && !user) {
      window.location.href = "login.html";
      return;
    }
  
    if (isDashboard && user) {
      try {
        const adminDoc = await db.collection("admins").doc(user.email).get();
        if (!adminDoc.exists) {
          alert("You are not authorized.");
          auth.signOut();
          window.location.href = "login.html";
          return;
        }
  
        setUserInfo(user);
        fetchBlogs();
        fetchJobs();
        fetchCareerContent();
        fetchApplications();
        fetchBenefits();
        fetchProcessSteps();
        updateStats();
        updateRecentActivity();
      } catch (error) {
        console.error("Error checking admin status:", error);
        alert("An error occurred. Please try again.");
      }
    }
  });
  

  // Set User Info
  function setUserInfo(user) {
    const userName = document.getElementById("userName")
    const userRole = document.getElementById("userRole")
    const userAvatar = document.getElementById("userAvatar")
    const headerUserName = document.getElementById("headerUserName")
    const headerUserAvatar = document.getElementById("headerUserAvatar")

    if (userName && userRole && userAvatar) {
      userName.textContent = user.displayName || user.email.split("@")[0]
      userRole.textContent = "Administrator"

      if (user.photoURL) {
        userAvatar.src = user.photoURL
        if (headerUserAvatar) headerUserAvatar.src = user.photoURL
      }

      if (headerUserName) {
        headerUserName.textContent = user.displayName || user.email.split("@")[0]
      }
    }
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      auth
        .signOut()
        .then(() => {
          window.location.href = "login.html"
        })
        .catch((error) => {
          console.error("Error signing out:", error)
        })
    })
  }

  // Sidebar Toggle
  const sidebarToggle = document.getElementById("sidebarToggle")
  const dashboardContainer = document.querySelector(".dashboard-container")

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      dashboardContainer.classList.toggle("sidebar-collapsed")
      document.querySelector(".dashboard-sidebar").classList.toggle("expanded")
    })
  }

  // Navigation Links
  const navLinks = document.querySelectorAll(".nav-link")
  const dashboardOverview = document.getElementById("dashboardOverview")
  const blogManagement = document.getElementById("blogManagement")
  const careerManagement = document.getElementById("careerManagement")

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Remove active class from all links
      navLinks.forEach((l) => {
        l.parentElement.classList.remove("active")
      })

      // Add active class to clicked link
      this.parentElement.classList.add("active")

      // Show corresponding section
      const page = this.getAttribute("data-page")

      if (page === "blog") {
        dashboardOverview.style.display = "none"
        blogManagement.style.display = "block"
        careerManagement.style.display = "none"
      } else if (page === "career") {
        dashboardOverview.style.display = "none"
        blogManagement.style.display = "none"
        careerManagement.style.display = "block"
      } else {
        dashboardOverview.style.display = "block"
        blogManagement.style.display = "none"
        careerManagement.style.display = "none"
      }
    })
  })

  // Career Management Tabs
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      tabButtons.forEach((btn) => {
        btn.classList.remove("active")
      })

      // Add active class to clicked button
      this.classList.add("active")

      // Show corresponding tab content
      const tabId = this.getAttribute("data-tab")

      tabContents.forEach((content) => {
        content.classList.remove("active")
      })

      document.getElementById(tabId).classList.add("active")
    })
  })

  // Update Dashboard Stats
  function updateStats() {
    // Update blog count
    blogsRef.get().then((snapshot) => {
      const blogCount = document.getElementById("blogCount")
      if (blogCount) {
        blogCount.textContent = snapshot.size
      }
    })

    // Update job count
    jobsRef.get().then((snapshot) => {
      const jobCount = document.querySelector(".stat-info p:nth-child(2)")
      if (jobCount) {
        jobCount.textContent = snapshot.size
      }
    })

    // Update benefits count
    benefitsRef.get().then((snapshot) => {
      const benefitsCount = document.getElementById("benefitsCount")
      if (benefitsCount) {
        benefitsCount.textContent = snapshot.size
      }
    })

    // Update process steps count
    processStepsRef.get().then((snapshot) => {
      const stepsCount = document.getElementById("stepsCount")
      if (stepsCount) {
        stepsCount.textContent = snapshot.size
      }
    })
  }

  // Update Recent Activity
  function updateRecentActivity() {
    const activityList = document.getElementById("recentActivityList")
    if (!activityList) return

    // Clear existing activities
    activityList.innerHTML = ""

    // Get recent blogs
    blogsRef
      .orderBy("createdAt", "desc")
      .limit(2)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const blog = doc.data()
          const activityDate = blog.createdAt ? new Date(blog.createdAt.toDate()).toLocaleString() : "Unknown date"

          const activityItem = document.createElement("div")
          activityItem.className = "activity-item"

          activityItem.innerHTML = `
                        <div class="activity-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="activity-details">
                            <p>Blog post added: <strong>${blog.title}</strong></p>
                            <span class="activity-time">${activityDate}</span>
                        </div>
                    `

          activityList.appendChild(activityItem)
        })
      })

    // Get recent jobs
    jobsRef
      .orderBy("postedDate", "desc")
      .limit(2)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const job = doc.data()
          const activityDate = job.postedDate ? new Date(job.postedDate.toDate()).toLocaleString() : "Unknown date"

          const activityItem = document.createElement("div")
          activityItem.className = "activity-item"

          activityItem.innerHTML = `
                        <div class="activity-icon">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <div class="activity-details">
                            <p>Job listing added: <strong>${job.title}</strong></p>
                            <span class="activity-time">${activityDate}</span>
                        </div>
                    `

          activityList.appendChild(activityItem)
        })
      })

    // Get recent benefits
    benefitsRef
      .orderBy("updatedAt", "desc")
      .limit(1)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const benefit = doc.data()
          const activityDate = benefit.updatedAt
            ? new Date(benefit.updatedAt.toDate()).toLocaleString()
            : "Unknown date"

          const activityItem = document.createElement("div")
          activityItem.className = "activity-item"

          activityItem.innerHTML = `
                        <div class="activity-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="activity-details">
                            <p>Benefit updated: <strong>${benefit.title}</strong></p>
                            <span class="activity-time">${activityDate}</span>
                        </div>
                    `

          activityList.appendChild(activityItem)
        })
      })
  }

  // ===== BLOG MANAGEMENT =====

  // Blog CRUD Logic
  const submitBlogBtn = document.getElementById("submitBlogBtn")
  const resetBlogBtn = document.getElementById("resetBlogBtn")

  // Submit Blog
  if (submitBlogBtn) {
    submitBlogBtn.addEventListener("click", () => {
      submitBlog()
    })
  }

  // Reset Blog Form
  if (resetBlogBtn) {
    resetBlogBtn.addEventListener("click", () => {
      resetBlogForm()
    })
  }

  function submitBlog() {
    const id = document.getElementById("blog-id").value
    const title = document.getElementById("title").value
    const content = document.getElementById("content").value
    const category = document.getElementById("category").value
    const readTime = +document.getElementById("readTime").value
    const imageUrl = document.getElementById("imageUrl").value

    if (!title || !content || !category || !readTime) {
      alert("Please fill in all required fields")
      return
    }

    const data = {
      title: title,
      content: content,
      category: category,
      readTime: readTime,
      imageUrl: imageUrl,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }

    if (!id) {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp()
    }

    if (id) {
      blogsRef
        .doc(id)
        .update(data)
        .then(() => {
          alert("Blog updated successfully!")
          resetBlogForm()
          fetchBlogs()
          updateRecentActivity()
        })
        .catch((error) => {
          console.error("Error updating blog:", error)
          alert("Error updating blog. Please try again.")
        })
    } else {
      blogsRef
        .add(data)
        .then(() => {
          alert("Blog added successfully!")
          resetBlogForm()
          fetchBlogs()
          updateStats()
          updateRecentActivity()
        })
        .catch((error) => {
          console.error("Error adding blog:", error)
          alert("Error adding blog. Please try again.")
        })
    }
  }

  function fetchBlogs() {
    blogsRef
      .orderBy("createdAt", "desc")
      .get()
      .then((snapshot) => {
        const container = document.getElementById("blogs-list")
        if (!container) return

        container.innerHTML = ""

        if (snapshot.empty) {
          container.innerHTML = "<p class='no-blogs'>No blogs found. Create your first blog post!</p>"
          return
        }

        snapshot.forEach((doc) => {
          const blog = doc.data()
          const blogDate = blog.createdAt ? new Date(blog.createdAt.toDate()).toLocaleDateString() : "Unknown date"

          const blogItem = document.createElement("div")
          blogItem.className = "blog-post-item"

          blogItem.innerHTML = `
                    <div class="post-thumbnail">
                        <img src="${blog.imageUrl || "images/blog-placeholder-1.jpg"}" alt="${blog.title}">
                    </div>
                    <div class="post-details">
                        <h3>${blog.title}</h3>
                        <div class="post-meta">
                            <span><i class="fas fa-calendar"></i> ${blogDate}</span>
                            <span><i class="fas fa-folder"></i> ${blog.category}</span>
                            <span><i class="fas fa-clock"></i> ${blog.readTime} min read</span>
                        </div>
                        <p class="post-excerpt">${blog.content.substring(0, 150)}${blog.content.length > 150 ? "..." : ""}</p>
                    </div>
                    <div class="post-actions">
                        <button class="btn-icon edit-blog-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-blog-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `

          container.appendChild(blogItem)
        })

        // Add event listeners to edit and delete buttons
        addBlogActionListeners()
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error)
      })
  }

  function addBlogActionListeners() {
    // Edit Blog
    const editBlogBtns = document.querySelectorAll(".edit-blog-btn")
    editBlogBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const blogId = this.getAttribute("data-id")
        editBlog(blogId)
      })
    })

    // Delete Blog
    const deleteBlogBtns = document.querySelectorAll(".delete-blog-btn")
    deleteBlogBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const blogId = this.getAttribute("data-id")
        deleteBlog(blogId)
      })
    })
  }

  function editBlog(id) {
    blogsRef
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const blog = doc.data()
          document.getElementById("blog-id").value = id
          document.getElementById("title").value = blog.title
          document.getElementById("content").value = blog.content
          document.getElementById("category").value = blog.category
          document.getElementById("readTime").value = blog.readTime
          document.getElementById("imageUrl").value = blog.imageUrl || ""

          // Scroll to the form
          document.querySelector(".blog-editor").scrollIntoView({ behavior: "smooth" })
        }
      })
      .catch((error) => {
        console.error("Error getting blog:", error)
      })
  }

  function deleteBlog(id) {
    if (confirm("Are you sure you want to delete this blog?")) {
      blogsRef
        .doc(id)
        .delete()
        .then(() => {
          alert("Blog deleted successfully!")
          fetchBlogs()
          updateStats()
          updateRecentActivity()
        })
        .catch((error) => {
          console.error("Error deleting blog:", error)
          alert("Error deleting blog. Please try again.")
        })
    }
  }

  function resetBlogForm() {
    document.getElementById("blog-id").value = ""
    document.getElementById("title").value = ""
    document.getElementById("content").value = ""
    document.getElementById("category").value = ""
    document.getElementById("readTime").value = ""
    document.getElementById("imageUrl").value = ""
  }

  // ===== CAREER MANAGEMENT =====

  // Job Form Modal
  const addJobBtn = document.getElementById("addJobBtn")
  const jobFormModal = document.getElementById("jobFormModal")
  const closeModal = document.querySelector(".close-modal")
  const cancelJobBtn = document.getElementById("cancelJobBtn")
  const saveJobBtn = document.getElementById("saveJobBtn")
  const jobForm = document.getElementById("jobForm")
  const modalTitle = document.getElementById("modalTitle")

  // Open modal when Add Job button is clicked
  if (addJobBtn) {
    addJobBtn.addEventListener("click", () => {
      modalTitle.textContent = "Add New Job Listing"
      jobForm.reset()
      document.getElementById("jobId").value = ""
      jobFormModal.classList.add("active")
    })
  }

  // Close modal when close button is clicked
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      jobFormModal.classList.remove("active")
    })
  }

  // Close modal when Cancel button is clicked
  if (cancelJobBtn) {
    cancelJobBtn.addEventListener("click", () => {
      jobFormModal.classList.remove("active")
    })
  }

  // Fetch and render job listings
  function fetchJobs() {
    jobsRef
      .orderBy("postedDate", "desc")
      .get()
      .then((snapshot) => {
        const tableBody = document.querySelector("#jobListings tbody")
        if (!tableBody) return

        tableBody.innerHTML = "" // Clear existing

        if (snapshot.empty) {
          const tr = document.createElement("tr")
          tr.innerHTML = `<td colspan="8" style="text-align: center;">No job listings found.</td>`
          tableBody.appendChild(tr)
          return
        }

        snapshot.forEach((doc) => {
          const job = doc.data()
          const postedDate = job.postedDate ? new Date(job.postedDate.toDate()).toLocaleDateString() : "Unknown"

          const tr = document.createElement("tr")
          tr.innerHTML = `
                    <td>${job.title}</td>
                    <td>${job.department}</td>
                    <td>${job.location}</td>
                    <td>${job.type}</td>
                    <td>${postedDate}</td>
                    <td>${job.applications || 0}</td>
                    <td><span class="status-${job.status}">${job.status}</span></td>
                    <td>
                        <button class="btn-icon edit-job-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-job-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `
          tableBody.appendChild(tr)
        })

        // Add event listeners to edit and delete buttons
        addJobActionListeners()
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error)
      })
  }

  function addJobActionListeners() {
    // Edit Job
    const editJobBtns = document.querySelectorAll(".edit-job-btn")
    editJobBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const jobId = this.getAttribute("data-id")
        editJob(jobId)
      })
    })

    // Delete Job
    const deleteJobBtns = document.querySelectorAll(".delete-job-btn")
    deleteJobBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const jobId = this.getAttribute("data-id")
        deleteJob(jobId)
      })
    })
  }

  function editJob(id) {
    jobsRef
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const job = doc.data()

          document.getElementById("jobId").value = id
          document.getElementById("jobTitle").value = job.title || ""
          document.getElementById("jobDepartment").value = job.department || ""
          document.getElementById("jobType").value = job.type || ""
          document.getElementById("jobLocation").value = job.location || ""
          document.getElementById("jobDescription").value = job.description || ""
          document.getElementById("jobRequirements").value = job.requirements ? job.requirements.join("\n") : ""
          document.getElementById("jobSkills").value = job.skills ? job.skills.join(", ") : ""
          document.getElementById("jobSalary").value = job.salary || ""

          const statusRadio = document.querySelector(`input[name="jobStatus"][value="${job.status}"]`)
          if (statusRadio) statusRadio.checked = true

          modalTitle.textContent = "Edit Job Listing"
          jobFormModal.classList.add("active")
        }
      })
      .catch((error) => {
        console.error("Error getting job:", error)
      })
  }

  function deleteJob(id) {
    if (confirm("Are you sure you want to delete this job listing?")) {
      jobsRef
        .doc(id)
        .delete()
        .then(() => {
          alert("Job listing deleted successfully!")
          fetchJobs()
          updateStats()
          updateRecentActivity()
        })
        .catch((error) => {
          console.error("Error deleting job:", error)
          alert("Error deleting job. Please try again.")
        })
    }
  }

  // Save Job button
  if (saveJobBtn) {
    saveJobBtn.addEventListener("click", () => {
      // Validate form
      if (!jobForm.checkValidity()) {
        jobForm.reportValidity()
        return
      }

      const jobId = document.getElementById("jobId").value
      const title = document.getElementById("jobTitle").value
      const department = document.getElementById("jobDepartment").value
      const type = document.getElementById("jobType").value
      const location = document.getElementById("jobLocation").value
      const description = document.getElementById("jobDescription").value
      const requirementsText = document.getElementById("jobRequirements").value
      const skillsText = document.getElementById("jobSkills").value
      const salary = document.getElementById("jobSalary").value
      const status = document.querySelector('input[name="jobStatus"]:checked').value

      // Process requirements and skills
      const requirements = requirementsText.split("\n").filter((req) => req.trim() !== "")
      const skills = skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "")

      const data = {
        title,
        department,
        type,
        location,
        description,
        requirements,
        skills,
        salary,
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }

      if (!jobId) {
        data.postedDate = firebase.firestore.FieldValue.serverTimestamp()
        data.applications = 0
      }

      const saveOperation = jobId ? jobsRef.doc(jobId).update(data) : jobsRef.add(data)

      saveOperation
        .then(() => {
          alert(jobId ? "Job updated successfully!" : "Job added successfully!")
          jobFormModal.classList.remove("active")
          fetchJobs()
          updateStats()
          updateRecentActivity()
        })
        .catch((error) => {
          console.error("Error saving job:", error)
          alert("Error saving job. Please try again.")
        })
    })
  }

  // Career Page Content Management
  function fetchCareerContent() {
    careerContentRef
      .doc("hero")
      .get()
      .then((doc) => {
        if (doc.exists) {
          const heroContent = doc.data()
          document.getElementById("heroHeadline").value = heroContent.headline || ""
          document.getElementById("heroSubheadline").value = heroContent.subheadline || ""

          // Update file name if there's an image
          if (heroContent.imageUrl) {
            const fileName = document.querySelector(".file-name")
            if (fileName) {
              fileName.textContent = heroContent.imageUrl.split("/").pop()
            }
          }
        }
      })

    careerContentRef
      .doc("whyJoinUs")
      .get()
      .then((doc) => {
        if (doc.exists) {
          const whyJoinContent = doc.data()
          document.getElementById("whyJoinHeadline").value = whyJoinContent.headline || ""
          document.getElementById("whyJoinSubheadline").value = whyJoinContent.subheadline || ""
        }
      })

    careerContentRef
      .doc("process")
      .get()
      .then((doc) => {
        if (doc.exists) {
          const processContent = doc.data()
          document.getElementById("processHeadline").value = processContent.headline || ""
          document.getElementById("processSubheadline").value = processContent.subheadline || ""
        }
      })
  }

  // Fetch Benefits
  function fetchBenefits() {
    benefitsRef
      .orderBy("order")
      .get()
      .then((snapshot) => {
        const benefitsList = document.querySelector(".benefits-list")
        if (!benefitsList) return

        benefitsList.innerHTML = ""

        if (snapshot.empty) {
          benefitsList.innerHTML = "<p>No benefits added yet.</p>"
          return
        }

        snapshot.forEach((doc) => {
          const benefit = doc.data()
          const benefitItem = document.createElement("div")
          benefitItem.className = "benefit-item"
          benefitItem.innerHTML = `
                    <div class="benefit-header">
                        <h5>${benefit.title}</h5>
                        <div class="benefit-actions">
                            <button class="btn-icon edit-benefit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete-benefit-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                    <p>${benefit.description}</p>
                `
          benefitsList.appendChild(benefitItem)
        })

        // Add event listeners for benefit actions
        addBenefitActionListeners()
      })
  }

  function addBenefitActionListeners() {
    // Edit Benefit
    const editBenefitBtns = document.querySelectorAll(".edit-benefit-btn")
    editBenefitBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const benefitId = this.getAttribute("data-id")
        editBenefit(benefitId)
      })
    })

    // Delete Benefit
    const deleteBenefitBtns = document.querySelectorAll(".delete-benefit-btn")
    deleteBenefitBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const benefitId = this.getAttribute("data-id")
        deleteBenefit(benefitId)
      })
    })
  }

  function editBenefit(id) {
    benefitsRef
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const benefit = doc.data()

          // Get modal elements
          const benefitModal = document.getElementById("benefitModal")
          const benefitModalTitle = document.getElementById("benefitModalTitle")
          const benefitId = document.getElementById("benefitId")
          const benefitTitle = document.getElementById("benefitTitle")
          const benefitDescription = document.getElementById("benefitDescription")
          const benefitIcon = document.getElementById("benefitIcon")
          const benefitOrder = document.getElementById("benefitOrder")

          // Set modal values
          benefitModalTitle.textContent = "Edit Benefit"
          benefitId.value = id
          benefitTitle.value = benefit.title || ""
          benefitDescription.value = benefit.description || ""
          benefitIcon.value = benefit.icon || "fa-check-circle"
          benefitOrder.value = benefit.order || 1

          // Show modal
          benefitModal.classList.add("active")
        }
      })
      .catch((error) => {
        console.error("Error getting benefit:", error)
      })
  }

  function deleteBenefit(id) {
    if (confirm("Are you sure you want to delete this benefit?")) {
      benefitsRef
        .doc(id)
        .delete()
        .then(() => {
          alert("Benefit deleted successfully!")
          fetchBenefits()
          updateStats()
          updateRecentActivity()
        })
        .catch((error) => {
          console.error("Error deleting benefit:", error)
          alert("Error deleting benefit. Please try again.")
        })
    }
  }

  // Fetch Process Steps
  function fetchProcessSteps() {
    processStepsRef
      .orderBy("order")
      .get()
      .then((snapshot) => {
        const stepsList = document.querySelector(".process-steps-list")
        if (!stepsList) return

        stepsList.innerHTML = ""

        if (snapshot.empty) {
          stepsList.innerHTML = "<p>No process steps added yet.</p>"
          return
        }

        snapshot.forEach((doc) => {
          const step = doc.data()
          const stepItem = document.createElement("div")
          stepItem.className = "process-step-item"
          stepItem.innerHTML = `
                    <div class="step-header">
                        <span class="step-number">${step.order}</span>
                        <h5>${step.title}</h5>
                        <div class="step-actions">
                            <button class="btn-icon edit-step-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete-step-btn" data-id="${doc.id}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                    <p>${step.description}</p>
                `
          stepsList.appendChild(stepItem)
        })

        // Add event listeners for step actions
        addStepActionListeners()
      })
  }

  function addStepActionListeners() {
    // Edit Step
    const editStepBtns = document.querySelectorAll(".edit-step-btn")
    editStepBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const stepId = this.getAttribute("data-id")
        editStep(stepId)
      })
    })

    // Delete Step
    const deleteStepBtns = document.querySelectorAll(".delete-step-btn")
    deleteStepBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const stepId = this.getAttribute("data-id")
        deleteStep(stepId)
      })
    })
  }

  function editStep(id) {
    processStepsRef
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const step = doc.data()

          // Get modal elements
          const stepModal = document.getElementById("stepModal")
          const stepModalTitle = document.getElementById("stepModalTitle")
          const stepId = document.getElementById("stepId")
          const stepTitle = document.getElementById("stepTitle")
          const stepDescription = document.getElementById("stepDescription")
          const stepOrder = document.getElementById("stepOrder")

          // Set modal values
          stepModalTitle.textContent = "Edit Process Step"
          stepId.value = id
          stepTitle.value = step.title || ""
          stepDescription.value = step.description || ""
          stepOrder.value = step.order || 1

          // Show modal
          stepModal.classList.add("active")
        }
      })
      .catch((error) => {
        console.error("Error getting process step:", error)
      })
  }

  function deleteStep(id) {
    if (confirm("Are you sure you want to delete this process step?")) {
      processStepsRef
        .doc(id)
        .delete()
        .then(() => {
          alert("Process step deleted successfully!")
          fetchProcessSteps()
          updateStats()
          updateRecentActivity()
        })
        .catch((error) => {
          console.error("Error deleting process step:", error)
          alert("Error deleting process step. Please try again.")
        })
    }
  }

  // Save Page Content button
  const savePageContentBtn = document.getElementById("savePageContent")

  if (savePageContentBtn) {
    savePageContentBtn.addEventListener("click", () => {
      // Get hero section values
      const heroHeadline = document.getElementById("heroHeadline").value
      const heroSubheadline = document.getElementById("heroSubheadline").value

      // Get why join us section values
      const whyJoinHeadline = document.getElementById("whyJoinHeadline").value
      const whyJoinSubheadline = document.getElementById("whyJoinSubheadline").value

      // Get process section values
      const processHeadline = document.getElementById("processHeadline").value
      const processSubheadline = document.getElementById("processSubheadline").value

      // Save hero section
      careerContentRef.doc("hero").set(
        {
          headline: heroHeadline,
          subheadline: heroSubheadline,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      // Save why join us section
      careerContentRef.doc("whyJoinUs").set(
        {
          headline: whyJoinHeadline,
          subheadline: whyJoinSubheadline,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      // Save process section
      careerContentRef.doc("process").set(
        {
          headline: processHeadline,
          subheadline: processSubheadline,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      alert("Career page content updated successfully!")
    })
  }

  // File Upload for Hero Image
  const fileInput = document.getElementById("heroImage")
  const fileName = document.querySelector(".file-name")

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      if (this.files.length > 0) {
        fileName.textContent = this.files[0].name

        // Upload file to Firebase Storage
        const file = this.files[0]
        const storageRef = storage.ref()
        const fileRef = storageRef.child(`career/${file.name}`)

        fileRef
          .put(file)
          .then((snapshot) => {
            return snapshot.ref.getDownloadURL()
          })
          .then((downloadURL) => {
            // Save the download URL to Firestore
            careerContentRef.doc("hero").update({
              imageUrl: downloadURL,
            })

            alert("Image uploaded successfully!")
          })
          .catch((error) => {
            console.error("Error uploading image:", error)
            alert("Error uploading image. Please try again.")
          })
      } else {
        fileName.textContent = "No file chosen"
      }
    })
  }

  // Fetch Applications
  function fetchApplications() {
    applicationsRef
      .orderBy("appliedDate", "desc")
      .get()
      .then((snapshot) => {
        const tableBody = document.getElementById("applicationsTable")
        if (!tableBody) return

        tableBody.innerHTML = "" // Clear existing

        if (snapshot.empty) {
          const tr = document.createElement("tr")
          tr.innerHTML = `<td colspan="5" style="text-align: center;">No applications found.</td>`
          tableBody.appendChild(tr)
          return
        }

        snapshot.forEach((doc) => {
          const application = doc.data()
          const appliedDate = application.appliedDate
            ? new Date(application.appliedDate.toDate()).toLocaleDateString()
            : "Unknown"

          const tr = document.createElement("tr")
          tr.innerHTML = `
                    <td>
                        <div class="applicant-info">
                            <img src="${application.photoUrl || "images/avatar-placeholder.jpg"}" alt="Applicant">
                            <div>
                                <h4>${application.name}</h4>
                                <p>${application.email}</p>
                            </div>
                        </div>
                    </td>
                    <td>${application.position}</td>
                    <td>${appliedDate}</td>
                    <td><span class="status-${application.status}">${application.status}</span></td>
                    <td>
                        <button class="btn-icon view-application-btn" data-id="${doc.id}"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon download-resume-btn" data-id="${doc.id}"><i class="fas fa-download"></i></button>
                    </td>
                `
          tableBody.appendChild(tr)
        })

        // Add event listeners for application actions
        addApplicationActionListeners()
      })
      .catch((error) => {
        console.error("Error fetching applications:", error)
      })
  }

  function addApplicationActionListeners() {
    // View Application
    const viewBtns = document.querySelectorAll(".view-application-btn")
    viewBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const applicationId = this.getAttribute("data-id")
        viewApplication(applicationId)
      })
    })

    // Download Resume
    const downloadBtns = document.querySelectorAll(".download-resume-btn")
    downloadBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const applicationId = this.getAttribute("data-id")
        downloadResume(applicationId)
      })
    })
  }

  function viewApplication(id) {
    applicationsRef
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const application = doc.data()

          // Create a modal to display application details
          const modalHTML = `
                <div class="modal active" id="viewApplicationModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Application Details</h2>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="applicant-header">
                                <img src="${application.photoUrl || "images/avatar-placeholder.jpg"}" alt="${application.name}">
                                <div>
                                    <h3>${application.name}</h3>
                                    <p>${application.position}</p>
                                    <p class="applicant-meta">Applied on: ${application.appliedDate ? new Date(application.appliedDate.toDate()).toLocaleDateString() : "Unknown"}</p>
                                </div>
                            </div>
                            
                            <div class="application-details">
                                <div class="detail-section">
                                    <h4>Contact Information</h4>
                                    <p><strong>Email:</strong> ${application.email}</p>
                                    <p><strong>Phone:</strong> ${application.phone || "Not provided"}</p>
                                    <p><strong>Location:</strong> ${application.location || "Not provided"}</p>
                                </div>
                                
                                <div class="detail-section">
                                    <h4>Professional Information</h4>
                                    <p><strong>Experience:</strong> ${application.experience || "Not provided"}</p>
                                    <p><strong>Skills:</strong> ${application.skills ? application.skills.join(", ") : "Not provided"}</p>
                                    <p><strong>LinkedIn:</strong> ${application.linkedin ? `<a href="${application.linkedin}" target="_blank">${application.linkedin}</a>` : "Not provided"}</p>
                                    <p><strong>Portfolio:</strong> ${application.portfolio ? `<a href="${application.portfolio}" target="_blank">${application.portfolio}</a>` : "Not provided"}</p>
                                </div>
                                
                                <div class="detail-section">
                                    <h4>Cover Letter</h4>
                                    <div class="cover-letter">
                                        ${application.coverLetter || "No cover letter provided."}
                                    </div>
                                </div>
                                
                                <div class="detail-section">
                                    <h4>Additional Information</h4>
                                    <p><strong>Earliest Start Date:</strong> ${application.startDate || "Not provided"}</p>
                                    <p><strong>Expected Salary:</strong> ${application.salary || "Not provided"}</p>
                                    <p><strong>Referral Source:</strong> ${application.referral || "Not provided"}</p>
                                    <p><strong>Open to Future Opportunities:</strong> ${application.futureContact ? "Yes" : "No"}</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" id="downloadResumeBtn" data-url="${application.resumeUrl}">Download Resume</button>
                            <div class="status-actions">
                                <label for="applicationStatus">Status:</label>
                                <select id="applicationStatus" data-id="${id}">
                                    <option value="new" ${application.status === "new" ? "selected" : ""}>New</option>
                                    <option value="reviewing" ${application.status === "reviewing" ? "selected" : ""}>Reviewing</option>
                                    <option value="interview" ${application.status === "interview" ? "selected" : ""}>Interview</option>
                                    <option value="offered" ${application.status === "offered" ? "selected" : ""}>Offered</option>
                                    <option value="rejected" ${application.status === "rejected" ? "selected" : ""}>Rejected</option>
                                </select>
                                <button class="btn btn-primary" id="updateStatusBtn">Update Status</button>
                            </div>
                        </div>
                    </div>
                </div>
                `

          // Append modal to body
          const modalContainer = document.createElement("div")
          modalContainer.innerHTML = modalHTML
          document.body.appendChild(modalContainer)

          // Add event listeners
          const closeBtn = document.querySelector("#viewApplicationModal .close-modal")
          const downloadBtn = document.getElementById("downloadResumeBtn")
          const updateStatusBtn = document.getElementById("updateStatusBtn")

          closeBtn.addEventListener("click", () => {
            document.body.removeChild(modalContainer)
          })

          downloadBtn.addEventListener("click", function () {
            const resumeUrl = this.getAttribute("data-url")
            if (resumeUrl) {
              window.open(resumeUrl, "_blank")
            } else {
              alert("No resume available for this applicant.")
            }
          })

          updateStatusBtn.addEventListener("click", () => {
            const statusSelect = document.getElementById("applicationStatus")
            const newStatus = statusSelect.value
            const applicationId = statusSelect.getAttribute("data-id")

            applicationsRef
              .doc(applicationId)
              .update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then(() => {
                alert("Application status updated successfully!")
                fetchApplications() // Refresh the applications table
                document.body.removeChild(modalContainer) // Close the modal
              })
              .catch((error) => {
                console.error("Error updating application status:", error)
                alert("Error updating application status. Please try again.")
              })
          })
        }
      })
  }

  function downloadResume(id) {
    applicationsRef
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const application = doc.data()
          if (application.resumeUrl) {
            // Open resume URL in new tab
            window.open(application.resumeUrl, "_blank")
          } else {
            alert("No resume available for this applicant.")
          }
        }
      })
  }

  // Application Filters
  const filterBtn = document.querySelector("#applications .btn-secondary")
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      const position = document.getElementById("positionFilter").value
      const status = document.getElementById("statusFilter").value
      const date = document.getElementById("dateFilter").value

      // Build query based on filters
      let query = applicationsRef

      if (position) {
        query = query.where("position", "==", position)
      }

      if (status) {
        query = query.where("status", "==", status)
      }

      if (date) {
        const now = new Date()
        let startDate

        if (date === "today") {
          startDate = new Date(now.setHours(0, 0, 0, 0))
        } else if (date === "week") {
          startDate = new Date(now.setDate(now.getDate() - 7))
        } else if (date === "month") {
          startDate = new Date(now.setMonth(now.getMonth() - 1))
        }

        if (startDate) {
          query = query.where("appliedDate", ">=", startDate)
        }
      }

      // Execute query
      query
        .orderBy("appliedDate", "desc")
        .get()
        .then((snapshot) => {
          // Update table with filtered results
          // Similar to fetchApplications but with filtered data
          const tableBody = document.querySelector("#applications tbody")
          if (!tableBody) return

          tableBody.innerHTML = "" // Clear existing

          if (snapshot.empty) {
            const tr = document.createElement("tr")
            tr.innerHTML = `<td colspan="5" style="text-align: center;">No applications found matching your filters.</td>`
            tableBody.appendChild(tr)
            return
          }

          // Render applications (same code as in fetchApplications)
          snapshot.forEach((doc) => {
            const application = doc.data()
            const appliedDate = application.appliedDate
              ? new Date(application.appliedDate.toDate()).toLocaleDateString()
              : "Unknown"

            const tr = document.createElement("tr")
            tr.innerHTML = `
                        <td>
                            <div class="applicant-info">
                                <img src="${application.photoUrl || "images/avatar-placeholder.jpg"}" alt="Applicant">
                                <div>
                                    <h4>${application.name}</h4>
                                    <p>${application.email}</p>
                                </div>
                            </div>
                        </td>
                        <td>${application.position}</td>
                        <td>${appliedDate}</td>
                        <td><span class="status-${application.status}">${application.status}</span></td>
                        <td>
                            <button class="btn-icon view-application-btn" data-id="${doc.id}"><i class="fas fa-eye"></i></button>
                            <button class="btn-icon download-resume-btn" data-id="${doc.id}"><i class="fas fa-download"></i></button>
                        </td>
                    `
            tableBody.appendChild(tr)
          })

          // Add event listeners for application actions
          addApplicationActionListeners()
        })
    })
  }

  // Add Benefit Button
  const addBenefitBtn = document.getElementById("addBenefitBtn")
  if (addBenefitBtn) {
    addBenefitBtn.addEventListener("click", () => {
      // Implementation would go here
      alert("Add benefit functionality would be implemented here")
      // In a real app, you'd show a modal to add a new benefit
    })
  }

  // Add Step Button
  const addStepBtn = document.getElementById("addStepBtn")
  if (addStepBtn) {
    addStepBtn.addEventListener("click", () => {
      // Implementation would go here
      alert("Add step functionality would be implemented here")
      // In a real app, you'd show a modal to add a new process step
    })
  }
})

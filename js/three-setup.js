// Import Three.js library
import * as THREE from "three"

// Three.js setup and configurations
let scene, camera, renderer, controls
let heroModel, demoModel
let mixer, clock
const particles = []

// Initialize Three.js scene
function initThree() {
  // Create scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2d3748)

  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 5)

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("bg-canvas"),
    antialias: true,
    alpha: true,
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // Add point lights
  const pointLight1 = new THREE.PointLight(0xff5252, 1, 100)
  pointLight1.position.set(5, 5, 5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x6c63ff, 1, 100)
  pointLight2.position.set(-5, -5, 5)
  scene.add(pointLight2)

  // Initialize clock for animations
  clock = new THREE.Clock()

  // Create particles
  createParticles()

  // Handle window resize
  window.addEventListener("resize", onWindowResize)

  // Start animation loop
  animate()
}

// Create background particles
function createParticles() {
  const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8)
  const particleMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xff5252 }),
    new THREE.MeshBasicMaterial({ color: 0x6c63ff }),
    new THREE.MeshBasicMaterial({ color: 0x4ecdc4 }),
  ]

  for (let i = 0; i < 100; i++) {
    const particle = new THREE.Mesh(
      particleGeometry,
      particleMaterials[Math.floor(Math.random() * particleMaterials.length)],
    )

    particle.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50)

    particle.scale.set(Math.random() * 1 + 0.5, Math.random() * 1 + 0.5, Math.random() * 1 + 0.5)

    particle.userData = {
      speed: Math.random() * 0.02 + 0.01,
      rotationSpeed: Math.random() * 0.02 - 0.01,
      direction: new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize(),
    }

    scene.add(particle)
    particles.push(particle)
  }
}

// Initialize hero section 3D model
function initHeroModel() {
  const heroContainer = document.getElementById("hero-3d-container")
  if (!heroContainer) return

  // Create scene
  const heroScene = new THREE.Scene()

  // Create camera
  const heroCamera = new THREE.PerspectiveCamera(75, heroContainer.clientWidth / heroContainer.clientHeight, 0.1, 1000)
  heroCamera.position.set(0, 0, 5)

  // Create renderer
  const heroRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight)
  heroRenderer.setPixelRatio(window.devicePixelRatio)
  heroRenderer.shadowMap.enabled = true
  heroContainer.appendChild(heroRenderer.domElement)

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  heroScene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  heroScene.add(directionalLight)

  // Create geometric shapes representing the Vector logo
  createVectorLogoModel(heroScene)

  // Animation function
  function animateHero() {
    requestAnimationFrame(animateHero)

    // Rotate all children
    heroScene.children.forEach((child) => {
      if (child.type === "Group") {
        child.rotation.y += 0.005
        child.rotation.x += 0.002
      }
    })

    heroRenderer.render(heroScene, heroCamera)
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    heroCamera.aspect = heroContainer.clientWidth / heroContainer.clientHeight
    heroCamera.updateProjectionMatrix()
    heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight)
  })

  // Start animation
  animateHero()
}

// Create Vector logo 3D model
function createVectorLogoModel(targetScene) {
  const logoGroup = new THREE.Group()

  // Create triangular shapes based on the Vector logo
  const shapes = [
    { color: 0xff5252, position: [-2, 1, 0], rotation: [0.5, 0.3, 0.2], scale: [1, 1.5, 1] },
    { color: 0x6c63ff, position: [-1, -1, 0], rotation: [0.2, 0.5, 0.3], scale: [1.2, 1, 1] },
    { color: 0x4ecdc4, position: [0, 1, 0], rotation: [0.3, 0.2, 0.5], scale: [1, 1, 1.3] },
    { color: 0xffeb3b, position: [1, -0.5, 0], rotation: [0.1, 0.4, 0.2], scale: [0.8, 1.2, 1] },
    { color: 0x8bc34a, position: [2, 0.8, 0], rotation: [0.4, 0.1, 0.3], scale: [1.1, 0.9, 1] },
  ]

  shapes.forEach((shape) => {
    const geometry = new THREE.TetrahedronGeometry(1, 0)
    const material = new THREE.MeshPhongMaterial({
      color: shape.color,
      shininess: 100,
      specular: 0x111111,
      transparent: true,
      opacity: 0.9,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...shape.position)
    mesh.rotation.set(...shape.rotation)
    mesh.scale.set(...shape.scale)

    // Add animation data
    mesh.userData = {
      initialPosition: [...shape.position],
      initialRotation: [...shape.rotation],
      animationOffset: Math.random() * Math.PI * 2,
    }

    logoGroup.add(mesh)
  })

  // Add text "VECTOR"
  const textGroup = new THREE.Group()
  textGroup.position.set(0, -2, 0)
  logoGroup.add(textGroup)

  targetScene.add(logoGroup)

  return logoGroup
}

// Initialize demo section 3D model
function initDemoModel() {
  const demoContainer = document.getElementById("demo-3d-container")
  if (!demoContainer) return

  // Create scene
  const demoScene = new THREE.Scene()

  // Create camera
  const demoCamera = new THREE.PerspectiveCamera(75, demoContainer.clientWidth / demoContainer.clientHeight, 0.1, 1000)
  demoCamera.position.set(0, 0, 5)

  // Create renderer
  const demoRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  demoRenderer.setSize(demoContainer.clientWidth, demoContainer.clientHeight)
  demoRenderer.setPixelRatio(window.devicePixelRatio)
  demoContainer.appendChild(demoRenderer.domElement)

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  demoScene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  demoScene.add(directionalLight)

  // Create interactive 3D model
  const demoModels = {
    personalized: createPersonalizedModel(demoScene),
    goals: createGoalsModel(demoScene),
    gamification: createGamificationModel(demoScene),
    management: createManagementModel(demoScene),
  }

  // Set initial active model
  const activeModel = "personalized"
  Object.keys(demoModels).forEach((key) => {
    demoModels[key].visible = key === activeModel
  })

  // Add event listeners to demo controls
  const demoControls = document.querySelectorAll(".demo-control")
  demoControls.forEach((control) => {
    control.addEventListener("click", () => {
      const demoType = control.getAttribute("data-demo")

      // Update active class
      demoControls.forEach((c) => c.classList.remove("active"))
      control.classList.add("active")

      // Update visible model
      Object.keys(demoModels).forEach((key) => {
        demoModels[key].visible = key === demoType
      })
    })
  })

  // Animation function
  function animateDemo() {
    requestAnimationFrame(animateDemo)

    // Animate active model
    const activeModelObj = demoModels[activeModel]
    if (activeModelObj) {
      activeModelObj.rotation.y += 0.01
    }

    demoRenderer.render(demoScene, demoCamera)
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    demoCamera.aspect = demoContainer.clientWidth / demoContainer.clientHeight
    demoCamera.updateProjectionMatrix()
    demoRenderer.setSize(demoContainer.clientWidth, demoContainer.clientHeight)
  })

  // Start animation
  animateDemo()
}

// Create personalized learning model
function createPersonalizedModel(scene) {
  const group = new THREE.Group()

  // Create a brain-like structure
  const brainGeometry = new THREE.SphereGeometry(1.5, 32, 32)
  const brainMaterial = new THREE.MeshPhongMaterial({
    color: 0xff5252,
    wireframe: true,
    transparent: true,
    opacity: 0.8,
  })
  const brain = new THREE.Mesh(brainGeometry, brainMaterial)
  group.add(brain)

  // Add neural connections
  for (let i = 0; i < 50; i++) {
    const nodeGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const nodeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x6c63ff,
      emissiveIntensity: 0.5,
    })
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial)

    // Position nodes on the brain surface
    const phi = Math.acos(-1 + (2 * i) / 50)
    const theta = Math.sqrt(50 * Math.PI) * phi

    node.position.x = 1.5 * Math.cos(theta) * Math.sin(phi)
    node.position.y = 1.5 * Math.sin(theta) * Math.sin(phi)
    node.position.z = 1.5 * Math.cos(phi)

    group.add(node)
  }

  scene.add(group)
  return group
}

// Create goals model
function createGoalsModel(scene) {
  const group = new THREE.Group()
  group.visible = false

  // Create target/bullseye
  const ringGeometry1 = new THREE.TorusGeometry(1.5, 0.2, 16, 100)
  const ringMaterial1 = new THREE.MeshPhongMaterial({ color: 0xff5252 })
  const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial1)
  group.add(ring1)

  const ringGeometry2 = new THREE.TorusGeometry(1.0, 0.2, 16, 100)
  const ringMaterial2 = new THREE.MeshPhongMaterial({ color: 0x6c63ff })
  const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2)
  group.add(ring2)

  const ringGeometry3 = new THREE.TorusGeometry(0.5, 0.2, 16, 100)
  const ringMaterial3 = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 })
  const ring3 = new THREE.Mesh(ringGeometry3, ringMaterial3)
  group.add(ring3)

  // Add arrow
  const arrowGroup = new THREE.Group()
  arrowGroup.position.set(-3, 0, 0)

  const arrowBodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 32)
  const arrowBodyMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const arrowBody = new THREE.Mesh(arrowBodyGeometry, arrowBodyMaterial)
  arrowBody.rotation.z = Math.PI / 2
  arrowBody.position.x = 1.5
  arrowGroup.add(arrowBody)

  const arrowHeadGeometry = new THREE.ConeGeometry(0.3, 0.6, 32)
  const arrowHeadMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial)
  arrowHead.rotation.z = -Math.PI / 2
  arrowHead.position.x = 3.1
  arrowGroup.add(arrowHead)

  group.add(arrowGroup)

  scene.add(group)
  return group
}

// Create gamification model
function createGamificationModel(scene) {
  const group = new THREE.Group()
  group.visible = false

  // Create trophy
  const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.3, 32)
  const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.y = -1.5
  group.add(base)

  const stemGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32)
  const stemMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 })
  const stem = new THREE.Mesh(stemGeometry, stemMaterial)
  stem.position.y = -0.8
  group.add(stem)

  const cupGeometry = new THREE.CylinderGeometry(0.8, 0.5, 1.5, 32)
  const cupMaterial = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    shininess: 100,
    specular: 0xffffff,
  })
  const cup = new THREE.Mesh(cupGeometry, cupMaterial)
  cup.position.y = 0.5
  group.add(cup)

  // Add stars around trophy
  for (let i = 0; i < 8; i++) {
    const starGeometry = new THREE.OctahedronGeometry(0.3, 0)
    const starMaterial = new THREE.MeshPhongMaterial({
      color: 0x6c63ff,
      emissive: 0x6c63ff,
      emissiveIntensity: 0.5,
    })
    const star = new THREE.Mesh(starGeometry, starMaterial)

    const angle = (i / 8) * Math.PI * 2
    const radius = 2
    star.position.x = Math.cos(angle) * radius
    star.position.z = Math.sin(angle) * radius
    star.position.y = Math.sin(i * 0.5) * 0.5

    star.userData = {
      initialY: star.position.y,
      animationOffset: i * (Math.PI / 4),
    }

    group.add(star)
  }

  scene.add(group)
  return group
}

// Create management model
function createManagementModel(scene) {
  const group = new THREE.Group()
  group.visible = false

  // Create calendar/task board
  const boardGeometry = new THREE.BoxGeometry(3, 2, 0.1)
  const boardMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const board = new THREE.Mesh(boardGeometry, boardMaterial)
  group.add(board)

  // Add task items
  const taskColors = [0xff5252, 0x6c63ff, 0x4ecdc4, 0xffeb3b, 0x8bc34a]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      const taskGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.05)
      const taskMaterial = new THREE.MeshPhongMaterial({
        color: taskColors[(i * 4 + j) % taskColors.length],
      })
      const task = new THREE.Mesh(taskGeometry, taskMaterial)

      task.position.x = -1.2 + j * 0.8
      task.position.y = 0.7 - i * 0.5
      task.position.z = 0.1

      group.add(task)
    }
  }

  scene.add(group)
  return group
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// Animation loop
function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()

  // Animate particles
  particles.forEach((particle) => {
    const { speed, rotationSpeed, direction } = particle.userData

    particle.position.x += direction.x * speed
    particle.position.y += direction.y * speed
    particle.position.z += direction.z * speed

    particle.rotation.x += rotationSpeed
    particle.rotation.y += rotationSpeed

    // Reset particle if it goes too far
    if (
      Math.abs(particle.position.x) > 25 ||
      Math.abs(particle.position.y) > 25 ||
      Math.abs(particle.position.z) > 25
    ) {
      particle.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50)
    }
  })

  // Update mixer if exists
  if (mixer) {
    mixer.update(delta)
  }

  renderer.render(scene, camera)
}


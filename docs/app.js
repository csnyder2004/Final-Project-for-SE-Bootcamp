// 🌐 API Base URL (Render Backend)
const API_URL = "https://project4-forum-backend.onrender.com/api";

// ========== FORM TOGGLING ==========
function toggleForm(type) {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  registerForm.classList.toggle("active", type === "register");
  loginForm.classList.toggle("active", type === "login");

  const focusField =
    type === "register"
      ? document.getElementById("registerUsername")
      : document.getElementById("loginEmail");
  if (focusField) focusField.focus();

  updateBackButton("auth");
}

// ========== REGISTER ==========
async function register() {
  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!username || !email || !password)
    return showAlert("Please fill in all fields.", "error");

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    showAlert(data.message, res.ok ? "success" : "error");

    if (res.ok) toggleForm("login");
  } catch {
    showAlert("Network error: unable to register.", "error");
  }
}

// ========== LOGIN ==========
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password)
    return showAlert("Please fill in all fields.", "error");

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok)
      return showAlert(data.message || "Invalid credentials.", "error");

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username);
    showWelcome();
  } catch {
    showAlert("Network error: unable to connect to server.", "error");
  }
}

// ========== SECTION VISIBILITY ==========
function showWelcome() {
  console.log("✅ showWelcome() running");
  document.body.classList.add("authed");
  document.getElementById("auth-forms").classList.add("hidden");
  document.getElementById("welcome").classList.remove("hidden");
  document.getElementById("forum").classList.remove("hidden");
  document.getElementById("createPost").classList.remove("hidden");

  const username = localStorage.getItem("username");
  document.getElementById("welcomeMessage").innerText = `Welcome, ${username}!`;

  updateBackButton("forum");
  loadPosts();
}

function logout() {
  localStorage.clear();
  document.body.classList.remove("authed");
  document.getElementById("auth-forms").classList.remove("hidden");
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("forum").classList.add("hidden");
  toggleForm("login");
  updateBackButton("auth");
  showAlert("You’ve been signed out.", "success");
}

// ========== AUTO-LOGIN ON PAGE LOAD ==========
window.onload = () => {
  if (localStorage.getItem("token")) showWelcome();
  else toggleForm("register");
};

// ========== LOAD POSTS ==========
async function loadPosts(category = "All") {
  const loading = document.getElementById("loading");
  const postsList = document.getElementById("postsList");

  loading.classList.remove("hidden");
  postsList.innerHTML = "";

  try {
    const res = await fetch(`${API_URL}/posts`);
    console.log("🛰️ Fetching posts:", res.status, res.statusText);
    const text = await res.text();
    console.log("📦 Raw response:", text);

    let posts;
    try {
      posts = JSON.parse(text);
    } catch {
      console.error("💥 Could not parse posts JSON!");
      showAlert("Server returned invalid data.", "error");
      return;
    }

    loading.classList.add("hidden");

    if (!res.ok) {
      console.error("❌ Failed to load posts:", posts);
      showAlert(posts.message || "Failed to load posts.", "error");
      return;
    }

    if (!Array.isArray(posts) || posts.length === 0) {
      postsList.innerHTML = `<p class="muted">No posts yet — be the first to start a discussion!</p>`;
      return;
    }

    const filteredPosts =
      category === "All" ? posts : posts.filter((p) => p.category === category);

    postsList.innerHTML = "";
    filteredPosts.forEach((p) => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <small>
          <strong>${p.category || "General"}</strong> |
          By ${p.author?.username || "Unknown"} on ${new Date(
        p.createdAt
      ).toLocaleString()}
        </small>
      `;
      postsList.appendChild(div);
    });
  } catch (error) {
    loading.classList.add("hidden");
    console.error("💥 loadPosts() failed:", error);
    showAlert("Failed to load posts. Check console.", "error");
  }
}

// ========== CREATE POST ==========
async function createPost() {
  const token = localStorage.getItem("token");
  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const category = document.getElementById("postCategory").value;

  if (!title || !content)
    return showAlert("Title and content are required.", "error");

  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content, category }),
    });

    const data = await res.json();
    showAlert(data.message, res.ok ? "success" : "error");

    if (res.ok) {
      document.getElementById("postTitle").value = "";
      document.getElementById("postContent").value = "";
      loadPosts();
    }
  } catch {
    showAlert("Unable to create post. Please try again later.", "error");
  }
}

// ========== CATEGORY FILTER ==========
function filterByCategory(category) {
  document
    .querySelectorAll(".category-btn")
    .forEach((btn) => btn.classList.remove("active"));

  const clicked = document.querySelector(
    `.category-btn:nth-child(${
      ["All", "General", "Tech", "Gaming", "Education", "Misc"].indexOf(
        category
      ) + 1
    })`
  );
  if (clicked) clicked.classList.add("active");

  loadPosts(category);
}

// ========== VIEW DEMO DATA ==========
async function viewDemoData() {
  try {
    showAlert("Loading demo data...", "success");
    const res = await fetch(`${API_URL}/seed/demo`, { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      showAlert(data.message || "Demo data loaded!", "success");
      localStorage.setItem("demoLoaded", "true");
      const demoBtn = document.getElementById("demoBtn");
      if (demoBtn) {
        demoBtn.textContent = "Demo Data Loaded ✅";
        demoBtn.disabled = true;
      }
      loadPosts();
    } else {
      showAlert(data.message || "Failed to load demo data.", "error");
    }
  } catch (error) {
    console.error("💥 viewDemoData() failed:", error);
    showAlert("Failed to connect to server.", "error");
  }
}

// ========== BACK BUTTON ==========
function goBack() {
  const token = localStorage.getItem("token");
  if (token) logout();
  else {
    const loginActive = document
      .getElementById("loginForm")
      .classList.contains("active");
    toggleForm(loginActive ? "register" : "login");
  }
}

function updateBackButton(state) {
  const backBtn = document.getElementById("backButton");
  if (state === "forum" || state === "auth")
    backBtn.classList.remove("hidden");
  else backBtn.classList.add("hidden");
}

// ========== ALERT BOX ==========
function showAlert(message, type = "success") {
  let alertBox = document.getElementById("alertBox");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "alertBox";
    alertBox.className = "alert-box";
    document.body.appendChild(alertBox);
  }

  alertBox.textContent = message;
  alertBox.classList.remove("error", "success", "show");
  alertBox.classList.add(type, "show");

  setTimeout(() => alertBox.classList.remove("show"), 3000);
}

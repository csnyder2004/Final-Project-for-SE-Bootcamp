// 🌐 API Base URL (Render Backend)
const API_URL = "https://project4-forum-backend.onrender.com/api";

// ========== AUTH TOGGLE ==========
function toggleForm(type) {
  document.getElementById("registerForm").classList.toggle("active", type === "register");
  document.getElementById("loginForm").classList.toggle("active", type === "login");
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
      body: JSON.stringify({ username, email, password })
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
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) return showAlert(data.message, "error");

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username);
    showWelcome();
  } catch {
    showAlert("Network error: unable to connect to server.", "error");
  }
}

// ========== SHOW / HIDE SECTIONS ==========
function showWelcome() {
  document.getElementById("auth-forms").classList.add("hidden");
  document.getElementById("welcome").classList.remove("hidden");
  document.getElementById("forum").classList.remove("hidden");
  document.getElementById("createPost").classList.remove("hidden");

  const username = localStorage.getItem("username");
  document.getElementById("welcomeMessage").innerText = `Welcome, ${username}!`;

  loadPosts();
}

function logout() {
  localStorage.clear();
  document.getElementById("auth-forms").classList.remove("hidden");
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("forum").classList.add("hidden");
  toggleForm("login");
}

// Auto-login on page load
window.onload = () => {
  if (localStorage.getItem("token")) showWelcome();
  else toggleForm("register");
};

// ========== POSTS ==========
async function loadPosts() {
  try {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();

    const postsList = document.getElementById("postsList");
    postsList.innerHTML = "";

    posts.forEach(p => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <small>By ${p.author?.username || "Unknown"} on ${new Date(p.createdAt).toLocaleString()}</small>
      `;
      postsList.appendChild(div);
    });
  } catch {
    showAlert("Failed to load posts. Please try again later.", "error");
  }
}

async function createPost() {
  const token = localStorage.getItem("token");
  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();

  if (!title || !content)
    return showAlert("Title and content are required.", "error");

  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, content })
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

// ========== ALERT BOX ==========
function showAlert(message, type = "success") {
  // Create alert if not exists
  let alertBox = document.getElementById("alertBox");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "alertBox";
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.right = "20px";
    alertBox.style.padding = "12px 16px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.fontWeight = "500";
    alertBox.style.zIndex = "9999";
    alertBox.style.transition = "opacity 0.3s ease";
    document.body.appendChild(alertBox);
  }

  alertBox.textContent = message;
  alertBox.style.background = type === "error" ? "#ef4444" : "#22c55e";
  alertBox.style.color = "#fff";
  alertBox.style.opacity = "1";

  // Hide after 3 seconds
  setTimeout(() => { alertBox.style.opacity = "0"; }, 3000);
}

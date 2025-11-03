const API_URL = "http://localhost:4000/api/auth";

function toggleForm(type) {
  document.getElementById("registerForm").classList.toggle("active", type === "register");
  document.getElementById("loginForm").classList.toggle("active", type === "login");
}

async function register() {
  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) toggleForm("login");
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.message);

  // Store token in localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.user.username);

  showWelcome();
}

function showWelcome() {
  document.getElementById("auth-forms").classList.add("hidden");
  document.getElementById("welcome").classList.remove("hidden");

  const username = localStorage.getItem("username");
  document.getElementById("welcomeMessage").innerText = `Welcome, ${username}!`;
}

function logout() {
  localStorage.clear();
  document.getElementById("auth-forms").classList.remove("hidden");
  document.getElementById("welcome").classList.add("hidden");
  toggleForm("login");
}

// Auto-login if token exists
window.onload = () => {
  if (localStorage.getItem("token")) showWelcome();
  else toggleForm("register");
};

// ================== POSTS =====================

// Fetch and display posts
async function loadPosts() {
  const res = await fetch("http://localhost:4000/api/posts");
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
}

// Create new post
async function createPost() {
  const token = localStorage.getItem("token");
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;

  const res = await fetch("http://localhost:4000/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) {
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    loadPosts();
  }
}

// Modify your existing showWelcome() function:
function showWelcome() {
  document.getElementById("auth-forms").classList.add("hidden");
  document.getElementById("welcome").classList.remove("hidden");
  document.getElementById("forum").classList.remove("hidden");
  document.getElementById("createPost").classList.remove("hidden");

  const username = localStorage.getItem("username");
  document.getElementById("welcomeMessage").innerText = `Welcome, ${username}!`;

  loadPosts();
}

// Modify logout() to hide forum
function logout() {
  localStorage.clear();
  document.getElementById("auth-forms").classList.remove("hidden");
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("forum").classList.add("hidden");
  toggleForm("login");
}


// 🌐 API Base URL (Render Backend)
const API_URL = "https://project4-forum-backend.onrender.com/api";

/* =========================================================
   Small helpers for inline field errors & strength meter
   ========================================================= */
function ensureErrorEl(inputEl) {
  if (!inputEl) return null;
  // wrap input in a relatively positioned container (non-destructive)
  if (!inputEl.parentElement.style.position) {
    inputEl.parentElement.style.position = "relative";
  }
  let err = inputEl.parentElement.querySelector(".field-error");
  if (!err) {
    err = document.createElement("span");
    err.className = "field-error";
    // inline style so we don’t touch your CSS file
    Object.assign(err.style, {
      position: "absolute",
      right: "0",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#ef4444",
      fontSize: "0.875rem",
      paddingLeft: "8px",
      whiteSpace: "nowrap",
      pointerEvents: "none",
    });
    inputEl.parentElement.appendChild(err);
  }
  return err;
}
function showFieldError(inputId, msg) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const err = ensureErrorEl(input);
  if (err) err.textContent = msg || "";
  input.setAttribute("aria-invalid", "true");
  input.style.borderColor = "#ef4444";
}
function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const err = input.parentElement?.querySelector?.(".field-error");
  if (err) err.textContent = "";
  input.removeAttribute("aria-invalid");
  input.style.borderColor = ""; // back to default (inherits from CSS)
}
function setCheckboxError(checkboxId, msg) {
  const cb = document.getElementById(checkboxId);
  if (!cb) return;
  // highlight label/area
  const container = cb.closest("label") || cb.parentElement;
  if (container) {
    container.style.outline = "2px solid #ef4444";
    container.style.outlineOffset = "4px";
  }
  // message to the right of checkbox text
  let err = container.querySelector(".field-error");
  if (!err) {
    err = document.createElement("span");
    err.className = "field-error";
    Object.assign(err.style, {
      marginLeft: "8px",
      color: "#ef4444",
      fontSize: "0.875rem",
      whiteSpace: "nowrap",
      pointerEvents: "none",
    });
    container.appendChild(err);
  }
  err.textContent = msg || "";
}
function clearCheckboxError(checkboxId) {
  const cb = document.getElementById(checkboxId);
  if (!cb) return;
  const container = cb.closest("label") || cb.parentElement;
  if (!container) return;
  const err = container.querySelector(".field-error");
  if (err) err.textContent = "";
  container.style.outline = "";
  container.style.outlineOffset = "";
}

/* ================================
   Password strength (simple)
   ================================ */
function passwordStrengthScore(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4); // 0..4
}
function ensureStrengthEl() {
  let el = document.getElementById("passwordStrength");
  if (!el) {
    const pwd = document.getElementById("registerPassword");
    if (!pwd) return null;
    el = document.createElement("div");
    el.id = "passwordStrength";
    Object.assign(el.style, {
      fontSize: "0.875rem",
      marginTop: "4px",
      textAlign: "right",
    });
    pwd.parentElement.appendChild(el);
  }
  return el;
}
function renderStrength(pw) {
  const el = ensureStrengthEl();
  if (!el) return;
  const score = passwordStrengthScore(pw);
  const labels = ["Very weak", "Weak", "Okay", "Good", "Strong"];
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#16a34a"];
  el.textContent = pw ? `Password strength: ${labels[score]}` : "";
  el.style.color = colors[score];
}

/* =========================================================
   Alerts (existing)
   ========================================================= */
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
  setTimeout(() => alertBox.classList.remove("show"), 3500);
}

/* =========================================================
   Form toggling
   ========================================================= */
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

/* =========================================================
   Register
   ========================================================= */
async function register() {
  const username = (document.getElementById("registerUsername")?.value || "").trim();
  const email = (document.getElementById("registerEmail")?.value || "").trim();
  const password = (document.getElementById("registerPassword")?.value || "").trim();
  const confirm = (document.getElementById("confirmPassword")?.value || "").trim();
  const terms = document.getElementById("registerTerms"); // optional checkbox

  // Clear any previous errors
  ["registerUsername", "registerEmail", "registerPassword", "confirmPassword"].forEach(clearFieldError);
  if (terms) clearCheckboxError("registerTerms");

  // Validate
  let hasError = false;

  if (!username) {
    showFieldError("registerUsername", "Required");
    hasError = true;
  } else if (username.length < 3) {
    showFieldError("registerUsername", "Min 3 characters");
    hasError = true;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showFieldError("registerEmail", "Required");
    hasError = true;
  } else if (!emailRegex.test(email)) {
    showFieldError("registerEmail", "Invalid email");
    hasError = true;
  }

  if (!password) {
    showFieldError("registerPassword", "Required");
    hasError = true;
  } else if (password.length < 6) {
    showFieldError("registerPassword", "Min 6 characters");
    hasError = true;
  }

  if (!confirm) {
    showFieldError("confirmPassword", "Required");
    hasError = true;
  } else if (password !== confirm) {
    showFieldError("confirmPassword", "Does not match");
    hasError = true;
  }

  if (terms && !terms.checked) {
    setCheckboxError("registerTerms", "Please accept");
    hasError = true;
  }

  if (hasError) {
    showAlert("Please fix the highlighted fields.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = (data && data.message) || "Registration failed.";
      // try to map to individual fields if possible
      const lower = msg.toLowerCase();
      if (lower.includes("email")) showFieldError("registerEmail", "Already registered");
      if (lower.includes("username")) showFieldError("registerUsername", "Already taken");
      showAlert(msg, "error");
      return;
    }

    showAlert("Registration successful! Please log in.", "success");
    toggleForm("login");
  } catch (err) {
    console.error("💥 Registration error:", err);
    showAlert("Unable to reach server. Try again later.", "error");
  }
}

/* =========================================================
   Login
   ========================================================= */
async function login() {
  const email = (document.getElementById("loginEmail")?.value || "").trim();
  const password = (document.getElementById("loginPassword")?.value || "").trim();

  // Clear old errors
  ["loginEmail", "loginPassword"].forEach(clearFieldError);

  let hasError = false;
  if (!email) {
    showFieldError("loginEmail", "Required");
    hasError = true;
  }
  if (!password) {
    showFieldError("loginPassword", "Required");
    hasError = true;
  }
  if (hasError) {
    showAlert("Please enter both email and password.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      const msg = (data && data.message) || "Login failed.";
      // best effort mapping
      if (msg.toLowerCase().includes("password")) showFieldError("loginPassword", "Incorrect");
      if (msg.toLowerCase().includes("email")) showFieldError("loginEmail", "Not found");
      showAlert(msg, "error");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username);
    showWelcome();
    showAlert(`Welcome back, ${data.user.username}!`, "success");
  } catch (err) {
    console.error("💥 Login error:", err);
    showAlert("Unable to connect to server. Try again later.", "error");
  }
}

/* =========================================================
   Section visibility & back button
   ========================================================= */
function showWelcome() {
  document.body.classList.add("authed");
  document.getElementById("auth-forms").classList.add("hidden");
  document.getElementById("welcome").classList.remove("hidden");
  document.getElementById("forum").classList.remove("hidden");
  document.getElementById("createPost").classList.remove("hidden");

  const username = localStorage.getItem("username");
  document.getElementById("welcomeMessage").innerText = `Welcome, ${username}!`;

  const demoBtn = document.getElementById("demoBtn");
  const demoLoaded = localStorage.getItem("demoLoaded") === "true";
  if (demoBtn) {
    demoBtn.textContent = demoLoaded ? "Hide Demo Data" : "View Demo Data";
    demoBtn.disabled = false;
  }

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

  const demoBtn = document.getElementById("demoBtn");
  if (demoBtn) {
    demoBtn.textContent = "View Demo Data";
    demoBtn.disabled = false;
  }
}

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
  if (!backBtn) return;
  if (state === "forum" || state === "auth") backBtn.classList.remove("hidden");
  else backBtn.classList.add("hidden");
}

/* =========================================================
   Auto-login on load
   ========================================================= */
window.onload = () => {
  // real-time error clearing & password strength
  const attach = (id, evt = "input", fn = () => clearFieldError(id)) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
  };
  ["registerUsername", "registerEmail", "registerPassword", "confirmPassword", "loginEmail", "loginPassword"]
    .forEach((id) => attach(id));
  // password strength live
  const pwd = document.getElementById("registerPassword");
  if (pwd) {
    pwd.addEventListener("input", () => renderStrength(pwd.value));
  }
  // confirm clears when either field changes
  const conf = document.getElementById("confirmPassword");
  if (conf) {
    conf.addEventListener("input", () => clearFieldError("confirmPassword"));
    if (pwd) pwd.addEventListener("input", () => clearFieldError("confirmPassword"));
  }
  // checkbox live clear
  const terms = document.getElementById("registerTerms");
  if (terms) terms.addEventListener("change", () => clearCheckboxError("registerTerms"));

  if (localStorage.getItem("token")) showWelcome();
  else toggleForm("register");
};

/* =========================================================
   Posts loading & demo toggle
   ========================================================= */
async function loadPosts(category = "All", hideDemos = false) {
  const loading = document.getElementById("loading");
  const postsList = document.getElementById("postsList");

  loading.classList.remove("hidden");
  postsList.innerHTML = "";

  try {
    const res = await fetch(`${API_URL}/posts`);
    const text = await res.text();
    let posts;
    try {
      posts = JSON.parse(text);
    } catch {
      showAlert("Server returned invalid data.", "error");
      return;
    }

    loading.classList.add("hidden");

    if (!res.ok) {
      showAlert(posts.message || "Failed to load posts.", "error");
      return;
    }

    if (!Array.isArray(posts) || posts.length === 0) {
      postsList.innerHTML = `<p class="muted">No posts yet — be the first to start a discussion!</p>`;
      return;
    }

    // Filter by category
    let filteredPosts =
      category === "All" ? posts : posts.filter((p) => p.category === category);

    // Hide demo posts when requested
    if (hideDemos) {
      filteredPosts = filteredPosts.filter(
        (p) =>
          !["SmokeyTheDog", "NeylandLegend", "RockyTopFan"].includes(
            p.author?.username
          )
      );
    }

    // Render posts
    postsList.innerHTML = "";
    filteredPosts.forEach((p) => {
      const div = document.createElement("div");
      div.className = "post";

      const isDemo = ["SmokeyTheDog", "NeylandLegend", "RockyTopFan"].includes(
        p.author?.username
      );
      if (isDemo) div.classList.add("demo-post");

      div.innerHTML = `
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <small>
          <strong>${p.category || "General"}</strong> |
          By ${p.author?.username || "Unknown"} on ${new Date(p.createdAt).toLocaleString()}
        </small>
      `;
      postsList.appendChild(div);
    });
  } catch (error) {
    loading.classList.add("hidden");
    showAlert("Failed to load posts. Check console.", "error");
  }
}

// Create Post
async function createPost() {
  const token = localStorage.getItem("token");
  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const category = document.getElementById("postCategory").value;

  if (!title) return showFieldError("postTitle", "Required");
  if (!content) return showFieldError("postContent", "Required");

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

// Category filter
function filterByCategory(category) {
  document.querySelectorAll(".category-btn").forEach((btn) => btn.classList.remove("active"));
  const clicked = document.querySelector(
    `.category-btn:nth-child(${
      ["All", "Game Day Talk", "Players & Recruiting", "Stats & Analysis", "Vols History", "SEC Rivalries", "Fan Zone"]
        .indexOf(category) + 1
    })`
  );
  if (clicked) clicked.classList.add("active");
  loadPosts(category);
}

// Demo toggle
async function viewDemoData() {
  const demoBtn = document.getElementById("demoBtn");
  const demoLoaded = localStorage.getItem("demoLoaded") === "true";

  if (demoLoaded) {
    localStorage.removeItem("demoLoaded");
    if (demoBtn) demoBtn.textContent = "View Demo Data";
    showAlert("Demo data hidden.", "success");
    await loadPosts("All", true);
    return;
  }

  try {
    showAlert("Checking for Vols demo data...", "success");
    const res = await fetch(`${API_URL}/seed/demo`, { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("demoLoaded", "true");
      if (demoBtn) demoBtn.textContent = "Hide Demo Data";
      showAlert(data.message || "Vols demo data loaded!", "success");
      await loadPosts();
    } else {
      showAlert(data.message || "Failed to load demo data.", "error");
    }
  } catch (error) {
    showAlert("Failed to connect to server.", "error");
  }
}

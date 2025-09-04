const LS_KEY = "auth";            // must match the key used in login.js
const LOGIN_PAGE = "auth/Login.html";       // "login" or "login.html" depending on your setup

function getAuth() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (!obj.expiry || Date.now() > obj.expiry) {
      // expired or malformed → clear and treat as logged out
      localStorage.removeItem(LS_KEY);
      return null;
    }
    return obj;
  } catch {
    localStorage.removeItem(LS_KEY);
    return null;
  }
}

function go(path) {
  // works for both file:// and a dev/prod server
  const isFile = location.protocol === "file:" || location.origin === "null";
  if (isFile) {
    location.href = path.endsWith(".html") ? path : `${path}.html`;
  } else {
    // if you serve routes without .html, keep as-is; otherwise append .html
    location.href = path.endsWith(".html") ? path : `${path}.html`;
  }
}

/* ============== Guard (runs immediately) ============== */
const auth = getAuth();
if (!auth) {
  go(LOGIN_PAGE);
  // Stop executing the rest of the script on this page
  throw new Error("Not authenticated. Redirecting to login...");
}

const emailSpan = document.querySelector(".datadiv span:nth-child(1)");
const genderSpan = document.querySelector(".datadiv span:nth-child(2)");
const logoutBtn = document.getElementById("homebtn");

(function hydrate() {
  const user = auth.user || {};

  // Prefer values from auth; fallback to existing text
  if (emailSpan) {
    emailSpan.textContent = user.email || emailSpan.textContent || "—";
  }
  if (genderSpan) {
    const g = (user.gender || genderSpan.textContent || "").toString().trim();
    // Normalize "male"/"female" capitalization
    genderSpan.textContent = g ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase() : "—";
  }
})();

/* ============== Logout ============== */
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(LS_KEY);
    go(LOGIN_PAGE);
  });
}

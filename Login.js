const PATHS = {
  login: "/auth/login",
  home: "/Home.html",
};

// ----- Helpers -----
const LS_KEY = "auth";

const setAuth = (data, expiresInMins) => {
  const now = Date.now();
  const expiry = now + expiresInMins * 60 * 1000;
  localStorage.setItem(
    LS_KEY,
    JSON.stringify({ token: data.token, user: data, expiry })
  );
};

const getAuth = () => {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (!obj.expiry || Date.now() > obj.expiry) {
      localStorage.removeItem(LS_KEY);
      return null;
    }
    return obj;
  } catch {
    localStorage.removeItem(LS_KEY);
    return null;
  }
};

const redirectTo = (path) => {
  // Works for file servers and real routes
  if (location.origin === "null" || location.protocol === "file:") {
    // fallback when running from filesystem; adjust as needed
    location.href = path.endsWith(".html") ? path : `${path}.html`;
  } else {
    location.href = path;
  }
};

const auth = getAuth();
if (auth) {
  redirectTo(PATHS.home);
} else {
  const form = document.querySelector("form");
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const rememberme = document.getElementById("rememberme");
  const loginbtn = document.getElementById("loginbtn");
  const eyeicon = document.getElementById('eyeicon')

  // console.log(form,username,email,password,rememberme,loginbtn)

  // clear error function
  const clearErrors = () => {
    const fielderror = document.querySelectorAll(".field-error");
    fielderror.forEach((item) => item.remove());

    const inputdiv = document.querySelectorAll(".inputdiv");
    inputdiv.forEach((element) => (element.computedStyleMap.outline = ""));

    const formError = document.querySelector(".form-error");
    if (formError) {
      formError.remove();
    }
  };

  const showFiledError = (input, message) => {
    const wrap = input.closest(".inputdiv");
    console.log("wrap:", wrap);
    if (!wrap) {
      return;
    }
    wrap.style.outline = "2px solid red";

    const msg = document.createElement("div");
    msg.className = "field-error";
    msg.textContent = message;
    msg.style.cssText = "color:red; font-size:12px; margin-top:6px";
    console.log(msg);
    wrap.appendChild(msg);
  };

  // fake loading
  const setLoading = (isLoading) => {
    if (!loginbtn) {
      return;
    }
    loginbtn.disabled = isLoading;
    loginbtn.style.opacity = isLoading ? "0.7" : "1";
    loginbtn.style.color = "white";
    loginbtn.textContent = isLoading ? "Logging in..." : "Login";
  };

  const showFormError = (message) => {
    const content = document.querySelector(".login_container .content");

    if (!content) return;

    const box = document.createElement("div");
    box.className = "form-error";
    box.textContent = message;
    box.style.cssText =
      "background:#fff1f1;border:1px solid #f3b1b1;color:#b71c1c;padding:10px 12px;border-radius:8px;font-size:14px;margin-top:8px;";
    content.prepend(box);
  };

  function isValidEmail(email) {
    // simple and reliable email pattern for UI validation:
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function createOrGetError(after) {
    let err = after.parentElement.querySelector(".field-error");
    if (!err) {
      err = document.createElement("div");
      err.className = "field-error";
      err.style.color = "#d32f2f";
      err.style.fontSize = "12px";
      err.style.marginTop = "6px";
      after.parentElement.appendChild(err);
    }
    return err;
  }

  form.setAttribute("no-validate", "");

   //eye icon handle
    eyeicon.addEventListener('click', () => {
        console.log(password.type);
        if (password.type === "password") {
            password.type = "text";   // show password
        } else {
            password.type = "password"; // hide password
        }
    })

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const usernametext = username.value.trim();
    const emailtext = email.value.trim();
    const passwordtext = password.value.trim();

    let ok = true;
    if(!usernametext){
        ok = false;
        showFiledError(username, "Username is required!")
    }
    else if (usernametext !== "emilys") {
      ok = false;
      showFiledError(username, "UserName must be 'emilys'");
    }
    if (!emailtext) {
      ok = false;
      // console.log('hi i am here')
      showFiledError(email, "Email is required!");
    } else if (!isValidEmail(emailtext)) {
      ok = false;
      const error = createOrGetError(email.closest(".inputdiv"));
      error.textContent = "Please enter a valid email address.";
    }
    if (!passwordtext) {
      ok = false;
      // console.log('hi i am here')
      showFiledError(password, "Password is required!");
    } else if (passwordtext !== 'emilyspass') {
      ok = false;
      console.log("passord", passwordtext);
      showFiledError(password, "Password must be 'emilyspass'.");
    }

    if (!ok) {
      return;
    }

    const expiresInMins = rememberme && rememberme.checked ? 43200 : 30;
    setLoading(true);

    console.log("username", usernametext)
    console.log("password", passwordtext)
    try {
      const res = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          username : usernametext,
          password : passwordtext,
          email : emailtext,
          expiresInMins,
        }),
      });

      console.log("res",res)

      const data = await res.json();
      console.log("data",data)
      if (!res.ok) {
        throw new Error(data?.message || "Login Failed. try agin later!");
      }
      if (!data?.accessToken) {
        throw new Error("No token received from server.");
      }
      setAuth(data, expiresInMins);
      redirectTo(PATHS.home);
    } catch (error) {
      showFormError(
        error.message || "Something went wrong. Please try agin later."
      );
    } finally {
      setLoading(false);
    }
  });
}

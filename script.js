/* =========================================================
   VOTECR HOME PAGE
========================================================= */


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function toggleMobileMenu() {

    const menu =
        document.getElementById("mobileNavigation");

    menu.classList.toggle("show");

}



async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const rollNumber = document.getElementById("registerRoll").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !rollNumber || !password) {
        showToast("Please fill in all fields.");
        return;
    }

    try {
        const result = await VoteCRBackend.registerStudent({
            name: name,
            email: email,
            rollNumber: rollNumber,
            department: "B.Tech AI",
            password: password
        });

        if (!result.ok) {
            showToast(result.error);
            return;
        }

        showToast("Registration successful! Redirecting...");

        setTimeout(() => {
            window.location.href = "./dashboard.html";
        }, 700);

    } catch (error) {
        console.error("Registration error:", error);
        showToast("Registration failed. Please try again.");
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showToast("Please enter your email and password.");
        return;
    }

    try {
        const result = await VoteCRBackend.loginStudent({
            email: email,
            password: password
        });

        if (!result.ok) {
            showToast(result.error);
            return;
        }

        showToast("Login successful! Redirecting...");

        setTimeout(() => {
            window.location.href = "./dashboard.html";
        }, 700);

    } catch (error) {
        console.error("Login error:", error);
        showToast("Login failed. Please try again.");
    }
}



/* Close mobile menu after clicking a link */

document
    .querySelectorAll(".mobile-nav-link")
    .forEach(link => {

        link.addEventListener("click", function() {

            closeMobileMenu();

        });

    });



/* =========================================================
   LOGIN
========================================================= */

function openLogin() {

    const modal =
        document.getElementById("loginModal");

    modal.classList.add("show");
    document.body.classList.add("modal-open");
}


function closeLogin() {

    const modal =
        document.getElementById("loginModal");

    modal.classList.remove("show");

    document.body.classList.remove("modal-open");

}



/* =========================================================
   REGISTER
========================================================= */

function openRegister() {

    const modal =
        document.getElementById("registerModal");

    modal.classList.add("show");

    document.body.classList.add("modal-open");

}


function closeRegister() {

    const modal =
        document.getElementById("registerModal");

    modal.classList.remove("show");

    document.body.classList.remove("modal-open");

}



/* =========================================================
   SWITCH LOGIN / REGISTER
========================================================= */

function showRegister(event) {

    event.preventDefault();

    closeLogin();

    openRegister();

}


function showLogin(event) {

    event.preventDefault();

    closeRegister();

    openLogin();

}



/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function togglePassword() {

    const password =
        document.getElementById("password");

    if (password.type === "password") {

        password.type = "text";

    } else {

        password.type = "password";

    }

}



/* =========================================================
   LOGIN FORM
========================================================= */



function handleLogin(event) {
  event.preventDefault();

  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");

  const email = (emailEl?.value || "").trim().toLowerCase();
  const password = passwordEl?.value || "";

  if (!email || !password) {
    if (typeof showToast === "function") {
      showToast("Please enter your email and password.");
    }
    return;
  }

  let users = [];
  try {
    users = JSON.parse(localStorage.getItem("voteCR_users") || "[]");
  } catch (err) {
    console.error("Failed to read voteCR_users:", err);
    users = [];
  }

  const user = Array.isArray(users)
    ? users.find((u) => (u.email || "").toLowerCase() === email && u.password === password)
    : null;

  if (!user) {
    if (typeof showToast === "function") {
      showToast("Invalid email or password. Please register first.");
    }
    return;
  }

  const sessionUser = {
    id: user.id || "usr_" + Date.now(),
    name: user.name,
    email: user.email,
    rollNumber: user.rollNumber,
    department: user.department || "B.Tech AI",
  };

  localStorage.setItem("voteCR_currentUser", JSON.stringify(sessionUser));

  if (typeof showToast === "function") {
    showToast("Login successful!");
  }

  window.location.href = "dashboard.html";
}




/* =========================================================
   REGISTER FORM
========================================================= */


/* ==========================================
   LOGIN FORM - BACKEND CONNECTED
========================================== */

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showToast("Please enter your email and password.");
        return;
    }

    try {
        const result = await VoteCRBackend.loginStudent({
            email: email,
            password: password
        });

        if (!result.ok) {
            showToast(result.error);
            return;
        }

        showToast("Login successful! Redirecting...");

        setTimeout(() => {
            window.location.href = "./dashboard.html";
        }, 700);

    } catch (error) {
        console.error("Login error:", error);
        showToast("Login failed. Please try again.");
    }
}


/* ==========================================
   REGISTRATION FORM - BACKEND CONNECTED
========================================== */

async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const rollNumber = document.getElementById("registerRoll").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !rollNumber || !password) {
        showToast("Please fill in all fields.");
        return;
    }

    try {
        const result = await VoteCRBackend.registerStudent({
            name: name,
            email: email,
            rollNumber: rollNumber,
            department: "B.Tech AI",
            password: password
        });

        if (!result.ok) {
            showToast(result.error);
            return;
        }

        // Registration automatically creates a session.
        // Clear it so the student can log in normally.
        VoteCRBackend.logoutStudent();

        document.getElementById("registerForm").reset();

        closeRegister();

        showToast("Account created successfully! Please log in.");

    } catch (error) {
        console.error("Registration error:", error);
        showToast("Registration failed. Please try again.");
    }
}






/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

document
    .getElementById("loginModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeLogin();

        }

    });


document
    .getElementById("registerModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeRegister();

        }

    });



/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeLogin();

            closeRegister();

            closeMobileMenu();

        }

    }
);



/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

const sections =
    document.querySelectorAll("section[id]");

const navigationLinks =
    document.querySelectorAll(".desktop-navigation .nav-link");


window.addEventListener("scroll", function() {

    let currentSection = "";


    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 150;


        if (window.scrollY >= sectionTop) {

            currentSection =
                section.getAttribute("id");

        }

    });


    navigationLinks.forEach(link => {

        link.classList.remove("active");


        const target =
            link.getAttribute("href")
                .substring(1);


        if (target === currentSection) {

            link.classList.add("active");

        }

    });

});



/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const text =
        document.getElementById("toastText");


    text.textContent = message;


    toast.classList.add("show");


    setTimeout(function() {

        toast.classList.remove("show");

    }, 3000);

}
console.log("VoteCR script.js loaded successfully");

window.openLogin = function () {
    const modal = document.getElementById("loginModal");

    if (!modal) {
        console.error("Login modal not found!");
        return;
    }

    modal.classList.add("show");
    document.body.classList.add("modal-open");

    console.log("Login window opened!");
};
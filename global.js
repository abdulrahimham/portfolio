console.log("IT'S ALIVE!");

// Select all links in the nav bar
const navLinks = Array.from(document.querySelectorAll("nav a"));

// Find the current link
const currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

// Add the `current` class if the link is found
currentLink?.classList.add("current");

// Define the pages for the navigation menu
const pages = [
    { url: "", title: "Home" },
    { url: "project/index.html", title: "Projects" },
    { url: "resume.html", title: "Resume" },
    { url: "https://github.com/abdulrahimham", title: "GitHub", external: true },
    { url: "contact/index.html", title: "Contact Me" }
];

// Check if we are on the home page
const ARE_WE_HOME = document.documentElement.classList.contains("home");

// Create the navigation menu dynamically
const nav = document.createElement("nav");
document.body.prepend(nav);

// Add links to the navigation menu
for (let p of pages) {
    let url = p.url;
    if (!p.url.startsWith("http") && !ARE_WE_HOME) {
        url = "../" + url; 
    }

    const a = document.createElement("a");
    a.href = url;
    a.textContent = p.title;

    // Add `target="_blank"` for external links
    if (p.external) {
        a.target = "_blank";
    }

    // Highlight the current page
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add("current");
    }

    nav.appendChild(a);

// Insert the theme switcher dynamically into the page
document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <label class="color-scheme">
        Theme:
        <select id="theme-select">
            <option value="auto">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>
    `
);

// Select the dropdown menu
const select = document.querySelector("#theme-select");

// Function to apply the theme
function applyTheme(theme) {
    const colorScheme = theme === "auto" ? "light dark" : theme;
    document.documentElement.style.setProperty("color-scheme", colorScheme);
}

// Event listener to handle theme changes
select.addEventListener("input", (event) => {
    const theme = event.target.value;
    applyTheme(theme); 
    localStorage.setItem("colorScheme", theme); e
});

// Load the user's saved preference on page load
const savedTheme = localStorage.getItem("colorScheme") || "auto";
applyTheme(savedTheme); 
select.value = savedTheme; 


if (!document.querySelector(".color-scheme")) {
  document.body.insertAdjacentHTML(
      "afterbegin",
      `
      <label class="color-scheme">
          Theme:
          <select id="theme-select">
              <option value="auto">Automatic</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
          </select>
      </label>
      `
  );

  // Select the dropdown menu
  const select = document.querySelector("#theme-select");

  // Function to apply the theme
  function applyTheme(theme) {
      const colorScheme = theme === "auto" ? "light dark" : theme;
      document.documentElement.setAttribute("data-theme", theme);
  }

  // Event listener to handle theme changes
  select.addEventListener("input", (event) => {
      const theme = event.target.value;
      applyTheme(theme); 
      localStorage.setItem("colorScheme", theme); 
  });

  // Load the user's saved preference on page load
  const savedTheme = localStorage.getItem("colorScheme") || "auto";
  applyTheme(savedTheme); 
  select.value = savedTheme; 
}

}


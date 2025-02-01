console.log("IT'S ALIVE!");

// Check if we're running on GitHub Pages or locally
const IS_GITHUB_PAGES = window.location.hostname === 'abdulrahimham.github.io';

// Define the base path for GitHub Pages
const BASE_PATH = IS_GITHUB_PAGES ? '/portfolio/' : '/';

// Define the pages for the navigation menu
const pages = [
    { url: BASE_PATH, title: "Home" },
    { url: `${BASE_PATH}project/index.html`, title: "Projects" },
    { url: `${BASE_PATH}resume.html`, title: "Resume" },
    { url: "https://github.com/abdulrahimham", title: "GitHub", external: true },
    { url: `${BASE_PATH}contact/index.html`, title: "Contact Me" }
];

// Check if we are on the home page
const ARE_WE_HOME = document.documentElement.classList.contains("home");

// Create the navigation menu dynamically
const nav = document.createElement("nav");
document.body.prepend(nav);

// Add links to the navigation menu
for (let p of pages) {
    let url = p.url;

    const a = document.createElement("a");
    a.href = url;
    a.textContent = p.title;

    if (p.external) {
        a.target = "_blank";
    }

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add("current");
    }

    nav.appendChild(a);
}

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

    if (theme === "auto") {
        const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
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

// Function to fetch JSON data
export async function fetchJSON(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

// Function to render projects
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';

    projects.forEach(project => {
        console.log('Rendering project:', project); // Debugging

        const article = document.createElement('article');

        const heading = document.createElement(headingLevel);
        heading.textContent = project.title;
        article.appendChild(heading);

        const image = document.createElement('img');
        image.src = project.image;
        image.alt = '';
        article.appendChild(image);

        const description = document.createElement('p');
        description.textContent = project.description;
        article.appendChild(description);

        containerElement.appendChild(article);
    });
}
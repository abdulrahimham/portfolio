console.log("IT'S ALIVE!");

const pages = [
    { url: "/portfolio/", title: "Home" },
    { url: "/portfolio/project/index.html", title: "Projects" },
    { url: "/portfolio/resume.html", title: "Resume" },
    { url: "https://github.com/abdulrahimham", title: "GitHub", external: true },
    { url: "/portfolio/contact/index.html", title: "Contact Me" }
];

const ARE_WE_HOME = document.documentElement.classList.contains("home");

const nav = document.createElement("nav");
document.body.prepend(nav);

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

const select = document.querySelector("#theme-select");

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

select.addEventListener("input", (event) => {
    const theme = event.target.value;
    applyTheme(theme);
    localStorage.setItem("colorScheme", theme);
});

const savedTheme = localStorage.getItem("colorScheme") || "auto";
applyTheme(savedTheme);
select.value = savedTheme;

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

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';

    projects.forEach(project => {
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
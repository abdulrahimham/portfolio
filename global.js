console.log("IT'S ALIVE!");

// Function to get all nav links
const navLinks = $$("nav a");

// Find the current page link
const currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

// Add the `current` class to the current page link if it exists
if (currentLink) {
    currentLink.classList.add("current");
}

import { fetchJSON, renderProjects } from './global.js';

// Function to fetch GitHub data
async function fetchGitHubData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        return null;
    }
}

(async function () {
    try {
        // Fetch all projects
        const projects = await fetchJSON('./lib/projects.json');

        // Filter the first 3 projects
        const latestProjects = projects.slice(0, 3);

        // Select the projects container
        const projectsContainer = document.querySelector('.projects');

        // Render the latest projects
        if (projectsContainer) {
            renderProjects(latestProjects, projectsContainer, 'h2');
        }
    } catch (error) {
        console.error('Error loading latest projects:', error);
    }

    // Fetch GitHub data
    const githubUsername = 'abdulrahimham'; 
    const githubData = await fetchGitHubData(githubUsername);
    console.log('GitHub data:', githubData); // Debugging

    // Populate GitHub stats
    if (githubData) {
        document.getElementById('public-repos').textContent = githubData.public_repos;
        document.getElementById('followers').textContent = githubData.followers;
        document.getElementById('following').textContent = githubData.following;
    }
})();
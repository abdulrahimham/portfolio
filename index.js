import { fetchJSON, renderProjects } from './global.js';

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
        const projects = await fetchJSON('./lib/projects.json');

        const latestProjects = projects.slice(0, 3);

        const projectsContainer = document.querySelector('.projects');

        if (projectsContainer) {
            renderProjects(latestProjects, projectsContainer, 'h2');
        }
    } catch (error) {
        console.error('Error loading latest projects:', error);
    }

    const githubUsername = 'abdulrahimham'; 
    const githubData = await fetchGitHubData(githubUsername);

    if (githubData) {
        document.getElementById('public-repos').textContent = githubData.public_repos;
        document.getElementById('followers').textContent = githubData.followers;
        document.getElementById('following').textContent = githubData.following;
    }
})();
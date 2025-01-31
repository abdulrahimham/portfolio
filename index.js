import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

(async function () {
    try {
        const projects = await fetchJSON('./lib/projects.json');

        const latestProjects = projects.slice(0, 3);

        const projectsContainer = document.querySelector('.projects');

        if (projectsContainer) {
            renderProjects(latestProjects, projectsContainer, 'h2');
        }

        const githubUsername = 'abdulrahimham'; 
        const githubData = await fetchGitHubData(githubUsername);

        if (githubData) {
            document.getElementById('public-repos').textContent = githubData.public_repos;
            document.getElementById('followers').textContent = githubData.followers;
            document.getElementById('following').textContent = githubData.following;
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
})();
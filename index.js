import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

(async function () {
    try {
        // Fetch all projects
        const projects = await fetchJSON('./lib/projects.json'); // Correct path
        console.log('Fetched projects:', projects); // Debugging

        // Filter the first 3 projects
        const latestProjects = projects.slice(0, 3);
        console.log('Latest projects:', latestProjects); // Debugging

        // Select the projects container
        const projectsContainer = document.querySelector('.projects');
        console.log('Projects container:', projectsContainer); // Debugging

        // Render the latest projects
        if (projectsContainer) {
            renderProjects(latestProjects, projectsContainer, 'h2');
        } else {
            console.error('Projects container not found!');
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
    } catch (error) {
        console.error('Error loading data:', error);
    }
})();
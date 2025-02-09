import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let selectedIndex = -1; 
let projectsData = [];

(async function () {
    try {
        projectsData = await fetchJSON('../lib/projects.json');
        const projectsContainer = document.querySelector('.projects');
        renderProjects(projectsData, projectsContainer, 'h2');

        const projectsTitle = document.querySelector('.projects-title');
        if (projectsTitle) {
            projectsTitle.textContent = `${projectsData.length} Projects (${projectsData.length})`;
        }

        renderPieChart(projectsData);
        addSearch(projectsData, projectsContainer);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
})();

function renderPieChart(projects) {
    let rolledData = d3.rollups(projects, v => v.length, d => d.year);
    let data = rolledData.map(([year, count]) => ({ value: count, label: `Year ${year}`, year }));

    let sliceGenerator = d3.pie().value(d => d.value);
    let arcData = sliceGenerator(data);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    d3.select('svg').selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();

    let svg = d3.select('svg');
    svg.selectAll('path')
        .data(arcData)
        .join('path')
        .attr('d', arcGenerator)
        .attr('fill', (_, i) => colors(i))
        .attr('data-year', (_, i) => data[i].year)
        .style('transition', 'opacity 300ms')
        .on('mouseover', function () {
            d3.selectAll('path').style('opacity', 0.5);
            d3.select(this).style('opacity', 1).style('cursor', 'pointer');
        })
        .on('mouseout', function () {
            d3.selectAll('path').style('opacity', 1);
            d3.select(this).style('cursor', 'default');
        })
        .on('click', function (event, d) {
            selectedIndex = selectedIndex === d.index ? -1 : d.index;
        
            d3.selectAll('path')
                .classed('selected', false)
                .style('opacity', 0.5)
                .style('fill', '');
        
            d3.selectAll('.legend-item .swatch')
                .each(function (legendD, i) {
                    d3.select(this).style('background-color', colors(i));
                });
        
            if (selectedIndex !== -1) {
                d3.select(this)
                    .classed('selected', true)
                    .style('opacity', 1) 
                    .style('fill', 'oklch(60% 45% 0)') 
                d3.select(`.legend-item[data-year="${d.data.year}"] .swatch`)
                    .style('background-color', 'oklch(60% 45% 0)'); 
            } else {
                d3.selectAll('path').style('opacity', 1).style('stroke', 'none');
            }
        
            filterProjects(d.data.year);
        });
    addLegend(data, colors);
}

function addLegend(data, colors) {
    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    data.forEach((d, idx) => {
        legend.append('li')
            .attr('class', 'legend-item')
            .attr('data-year', d.year) 
            .html(`<span class="swatch" style="background-color: ${colors(idx)};"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

function addSearch(projects, projectsContainer) {
    let searchInput = document.querySelector('.searchBar');

    searchInput.addEventListener('input', () => {
        let query = searchInput.value.toLowerCase();
        
        let selectedYear = selectedIndex !== -1 ? projectsData.find(p => String(p.year) === String(data[selectedIndex]?.year))?.year : null;

        filterProjects(selectedYear);
    });
}

function filterProjects(year) {
    let projectsContainer = document.querySelector('.projects');
    let searchInput = document.querySelector('.searchBar').value.toLowerCase();

    let filteredProjects = projectsData;

    if (selectedIndex !== -1) {
        filteredProjects = filteredProjects.filter(p => String(p.year) === String(year));
    }

    if (searchInput.trim() !== "") {
        filteredProjects = filteredProjects.filter(project =>
            Object.values(project).join('\n').toLowerCase().includes(searchInput)
        );
    }

    console.log("Filtered Projects after both filters:", filteredProjects);
    renderProjects(filteredProjects, projectsContainer, 'h2');
}

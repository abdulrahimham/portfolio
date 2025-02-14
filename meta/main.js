let data = []; 
let commits = [];
let xScale, yScale; 
let brushSelection = null; 

// Dimensions and margins for the scatterplot
const width = 1000;
const height = 600; 
const margin = { top: 10, right: 10, bottom: 50, left: 25 }; 

const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
};

// Function to load and process the CSV data
async function loadData() {
    try {
        data = await d3.csv('loc.csv', (row) => ({
            ...row,
            line: +row.line || 0, 
            depth: +row.depth || 0, 
            length: +row.length || 0, 
            date: new Date(row.date + 'T00:00' + row.timezone),
            datetime: new Date(row.datetime),
            type: row.file.split('.').pop() 
        }));

        console.log('Data loaded successfully:', data); 

        processCommits();

        displayStats();

        // Create scatterplot
        createScatterplot();
    } catch (error) {
        console.error('Error loading CSV file:', error); // Log any errors
        d3.select('#stats').html('<p>Error loading data. Please try again later.</p>'); // Display error message
    }
}

// Function to process commit data
function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit) 
        .map(([commit, lines]) => {
            let first = lines[0]; 
            let { author, date, time, timezone, datetime } = first;

            return {
                id: commit,
                url: 'https://github.com/abdulrahimham/portfolio/commit/' + commit, 
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60, 
                totalLines: lines.length, 
                lines: lines 
            };
        });

    console.log('Processed Commits:', commits);
}

// Function to display summary stats on the page
function displayStats() {
    const statsDiv = d3.select("#stats").html('');

    statsDiv.append('h2').text('Summary Stats');

    const table = statsDiv.append('table').attr('class', 'summary-stats');

    const headerRow = table.append('thead').append('tr');
    headerRow.selectAll('th')
        .data(['Commits', 'Total Files', 'TOTAL Lines ', 'Max Depth', 'Longest Line', 'Max Lines'])
        .enter()
        .append('th')
        .text(d => d);

    const dataRow = table.append('tbody').append('tr');
    dataRow.selectAll('td')
        .data([
            commits.length,
            new Set(data.map(d => d.file)).size, 
            data.length, 
            d3.max(data, d => d.depth), 
            d3.max(data, d => d.length),
            d3.max(d3.rollups(data, v => v.length, d => d.file), d => d[1])
        ])
        .enter()
        .append('td')
        .text(d => d);
}

// Function to update tooltip content
function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');

    console.log("Updating tooltip content:", commit); // Debug log

    if (!commit || Object.keys(commit).length === 0) {
        link.href = "";
        link.textContent = "";
        date.textContent = "";
        time.textContent = "";
        author.textContent = "";
        lines.textContent = "";
        return;
    }

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime.toLocaleDateString("en", { dateStyle: 'full' });
    time.textContent = commit.datetime.toLocaleTimeString("en", { timeStyle: 'short' });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

// Function to update tooltip visibility
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    console.log("Tooltip visibility:", isVisible); // Debug log
    tooltip.hidden = !isVisible;
}

// Function to update tooltip position
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    console.log("Tooltip position:", event.clientX, event.clientY); // Debug log
    tooltip.style.left = `${event.clientX + 10}px`; 
    tooltip.style.top = `${event.clientY + 10}px`;
}

// Function to check if a commit is selected
function isCommitSelected(commit) {
    if (!brushSelection) return false;

    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };

    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);

    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

// Function to update the visual state of dots based on selection
function updateSelection() {
    d3.selectAll('circle')
        .classed('selected', (d) => isCommitSelected(d));
}

// Function to update the selection count
function updateSelectionCount() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    const countElement = document.getElementById('selection-count');

    countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;

    return selectedCommits;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }

    const lines = selectedCommits.flatMap((d) => d.lines);
    console.log("Lines data:", lines); 

    const breakdown = d3.rollup(
        lines,
        (v) => v.length, 
        (d) => d.type 
    );
    console.log("Language breakdown:", breakdown);

    container.innerHTML = '';
    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1%')(proportion);

        container.innerHTML += `
            <div>${language}: ${count} lines (${formatted})</div>
        `;
    }

    return breakdown;
}

// Function to handle brush events
function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown(); 
}

// Function to create the scatterplot
function createScatterplot() {
    console.log('Creating scatterplot...'); 

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "visible");

    console.log('SVG created:', svg); // Debug log

    // Create scales
    xScale = d3
        .scaleTime()
        .domain(d3.extent(sortedCommits, (d) => d.datetime)) 
        .range([usableArea.left, usableArea.right]) 
        .nice(); 

    yScale = d3
        .scaleLinear()
        .domain([0, 24]) 
        .range([usableArea.bottom, usableArea.top]); 

    const [minLines, maxLines] = d3.extent(sortedCommits, (d) => d.totalLines);

    const rScale = d3
        .scaleSqrt() 
        .domain([minLines, maxLines])
        .range([2, 30]); 
    console.log('Scales created:', { xScale, yScale, rScale }); 

    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    gridlines.call(
        d3.axisLeft(yScale)
            .tickFormat("")
            .tickSize(-usableArea.width)
    );

    const dots = svg.append("g").attr("class", "dots");

    dots
        .selectAll("circle")
        .data(sortedCommits) 
        .join("circle")
        .attr("cx", (d) => xScale(d.datetime)) 
        .attr("cy", (d) => yScale(d.hourFrac)) 
        .attr("r", (d) => rScale(d.totalLines)) 
        .attr("fill", "steelblue")
        .style("fill-opacity", 0.7) 
        .on("mouseenter", function (event, commit) {
            d3.select(event.currentTarget).style("fill-opacity", 1); 
            updateTooltipContent(commit);
            updateTooltipVisibility(true); 
            updateTooltipPosition(event); 
        })
        .on("mouseleave", function () {
            d3.select(event.currentTarget).style("fill-opacity", 0.7);
            updateTooltipContent({}); 
            updateTooltipVisibility(false);
        });

    console.log('Dots drawn:', dots); // Debug log

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%b %d"));

    const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => `${d}:00`);

    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis)
        .selectAll("text") 
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end") 
        .attr("dx", "-0.5em")
        .attr("dy", "0.5em"); 

    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    svg.call(d3.brush().on('start brush end', brushed));

    svg.selectAll('.dots, .overlay ~ *').raise();
}

// Load data and create visualizations when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
});
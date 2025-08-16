const API_URLS = {
    '1F': 'https://sheet2api.vercel.app/api?id=19Fc1Nx_6COy2CZR580PgKrZiKjerl4vtccFwcuHG7Cc&sheet=1F',
    '2F': 'https://sheet2api.vercel.app/api?id=19Fc1Nx_6COy2CZR580PgKrZiKjerl4vtccFwcuHG7Cc&sheet=2F'
};

let currentDivision = '1F';

async function fetchLeaderboardData(division) {
    try {
	const response = await fetch(API_URLS[division]);
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	return data;
    } catch (error) {
	console.error('Error fetching data:', error);
	throw error;
    }
}

function switchDivision(division) {
    currentDivision = division;
    
    // Update tab styles
    document.querySelectorAll('.tab').forEach(tab => {
	tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load new division data
    loadLeaderboard();
}

function createLeaderboardTable(data) {
    // Sort data by TOTAL column (highest to lowest)
    const sortedData = data.sort((a, b) => {
	const totalA = parseFloat(a.TOTAL) || 0;
	const totalB = parseFloat(b.TOTAL) || 0;
	return totalB - totalA;
    });

    const divisionName = currentDivision === '1F' ? '1ra Fuerza' : '2da Fuerza';
    
    let tableHTML = `
	<div style="text-align: center; padding: 15px 0; background: #f8f9fa; border-bottom: 2px solid #e9ecef;">
	    <h2 style="color: #2d5016; margin: 0; font-size: 1.2rem; text-transform: uppercase;">Tabla General: ${divisionName}</h2>
	</div>
	<table class="leaderboard-table">
	    <thead class="table-header">
		<tr>
		    <th>Team</th>
		    <th>J1</th>
		    <th>J2</th>
		    <th>J3</th>
		    <th>J4</th>
		    <th>J5</th>
		    <th>Total</th>
		</tr>
	    </thead>
	    <tbody>
    `;

    sortedData.forEach((team, index) => {
	const rank = index + 1;
	const rankClass = rank === 1 ? 'rank-1' : 
			 rank === 2 ? 'rank-2' : 
			 rank === 3 ? 'rank-3' : 'rank-other';

	// Combine A and B values with + separator
	const j1 = `${team['1A'] || ''}<span class="score-separator">+</span>${team['1B'] || ''}`;
	const j2 = `${team['2A'] || ''}<span class="score-separator">+</span>${team['2B'] || ''}`;
	const j3 = `${team['3A'] || ''}<span class="score-separator">+</span>${team['3B'] || ''}`;
	const j4 = `${team['4A'] || ''}<span class="score-separator">+</span>${team['4B'] || ''}`;
	const j5 = `${team['5A'] || ''}<span class="score-separator">+</span>${team['5B'] || ''}`;

	tableHTML += `
	    <tr class="team-row">
		<td>
		    <span class="rank ${rankClass}">${rank}</span>
		    <span class="team-name">${team.TEAM || 'Unknown Team'}</span>
		</td>
		<td class="score">${j1}</td>
		<td class="score">${j2}</td>
		<td class="score">${j3}</td>
		<td class="score">${j4}</td>
		<td class="score">${j5}</td>
		<td class="total-score">${team.TOTAL || '0'}</td>
	    </tr>
	`;
    });

    tableHTML += `
	    </tbody>
	</table>
    `;

    return tableHTML;
}

function showError(message) {
    document.getElementById('content').innerHTML = `
	<div class="error">
	    <h3>❌ Error Loading Data</h3>
	    <p>${message}</p>
	    <button class="refresh-btn" onclick="loadLeaderboard()">Try Again</button>
	</div>
    `;
}

function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleString();
    const divisionName = currentDivision === '1F' ? '1ra Fuerza' : '2da Fuerza';
    document.getElementById('lastUpdated').innerHTML = `${divisionName} - Last updated: ${timeString}`;
}

async function loadLeaderboard() {
    const contentDiv = document.getElementById('content');
    
    // Show loading state
    contentDiv.innerHTML = `
	<div class="loading">
	    <div class="spinner"></div>
	    Loading ${currentDivision === '1F' ? '1ra Fuerza' : '2da Fuerza'} data...
	</div>
    `;

    try {
	const data = await fetchLeaderboardData(currentDivision);
	
	if (!data || data.length === 0) {
	    showError('No data available for this division');
	    return;
	}

	const tableHTML = createLeaderboardTable(data);
	contentDiv.innerHTML = tableHTML;
	updateLastUpdated();

    } catch (error) {
	showError(`Failed to load ${currentDivision === '1F' ? '1ra Fuerza' : '2da Fuerza'} data: ${error.message}`);
    }
}

// Load leaderboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadLeaderboard();
});


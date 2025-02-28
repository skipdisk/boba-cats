import { playersData } from "./playersData.js";

// Function to format dates consistently
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Function to calculate K/D/A ratio
function calculateKDA(kills, assists, deaths) {
  return deaths === 0
    ? (kills + assists).toFixed(2)
    : ((kills + assists) / deaths).toFixed(2);
}

// Add K/D/A ratio to each player
playersData.forEach((player) => {
  player.kda = calculateKDA(player.kills, player.assists, player.deaths);
  // Ensure date format is consistent
  player.match = formatDate(player.match);
});

// Get unique match dates
function getUniqueDates() {
  const dates = [...new Set(playersData.map((player) => player.match))];
  return dates.sort((a, b) => new Date(b) - new Date(a)); // Sort most recent first
}

// Function to filter players based on current filters
function filterPlayers() {
  const guildFilter = document.getElementById("guildFilter").value;
  const fieldFilter = document.getElementById("fieldFilter").value;
  const statFilter = document.getElementById("statFilter").value;
  const searchTerm = document
    .getElementById("playerSearch")
    .value.toLowerCase();
  const dateFilter = document.getElementById("dateFilter").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  return playersData.filter((player) => {
    // Guild filter
    if (guildFilter !== "all" && player.guild !== guildFilter) {
      return false;
    }

    // Field filter
    if (fieldFilter !== "all" && player.field !== fieldFilter) {
      return false;
    }

    // Search filter
    if (searchTerm && !player.name.toLowerCase().includes(searchTerm)) {
      return false;
    }

    // Date filter
    if (dateFilter === "latest") {
      const latestDate = getUniqueDates()[0];
      if (player.match !== latestDate) {
        return false;
      }
    } else if (dateFilter === "custom" && startDate && endDate) {
      const playerDate = new Date(player.match);
      const filterStartDate = new Date(startDate);
      const filterEndDate = new Date(endDate);

      if (playerDate < filterStartDate || playerDate > filterEndDate) {
        return false;
      }
    }

    // Stat filter
    if (statFilter === "kills" && player.kills < 20) {
      return false;
    } else if (statFilter === "assists" && player.assists < 300) {
      return false;
    } else if (statFilter === "kda" && parseFloat(player.kda) < 5) {
      return false;
    } else if (statFilter === "score" && player.score < 1000) {
      return false;
    }

    return true;
  });
}

// Function to update the players table
function updatePlayersTable() {
  const filteredPlayers = filterPlayers();
  const tableBody = document.getElementById("playersTableBody");

  // Clear table
  tableBody.innerHTML = "";

  // Update table count
  document.getElementById(
    "tableCount"
  ).textContent = `${filteredPlayers.length} players`;

  // Update table title
  let title = "All Players";
  const guildFilter = document.getElementById("guildFilter").value;
  const fieldFilter = document.getElementById("fieldFilter").value;
  const statFilter = document.getElementById("statFilter").value;
  const dateFilter = document.getElementById("dateFilter").value;

  if (guildFilter !== "all") {
    title = `${guildFilter} Players`;
  }

  if (fieldFilter !== "all") {
    title += ` (${
      fieldFilter.charAt(0).toUpperCase() + fieldFilter.slice(1)
    } Field)`;
  }

  if (statFilter !== "all") {
    switch (statFilter) {
      case "kills":
        title += " - High Kills";
        break;
      case "assists":
        title += " - High Assists";
        break;
      case "kda":
        title += " - Best K/D/A Ratio";
        break;
      case "score":
        title += " - Top Score";
        break;
    }
  }

  if (dateFilter === "latest") {
    title += ` - Latest Match (${getUniqueDates()[0]})`;
  } else if (dateFilter === "custom") {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    if (startDate && endDate) {
      title += ` - ${startDate} to ${endDate}`;
    }
  }

  document.getElementById("tableTitle").textContent = title;

  // Update table with filtered players
  filteredPlayers.forEach((player) => {
    const row = document.createElement("tr");
    row.classList.add(
      player.guild === "BobaCats" ? "player-bbc" : "player-eternity"
    );
    row.classList.add(`field-${player.field}`);

    row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${player.guild}</td>
                    <td>
                        <span class="field-indicator field-${
                          player.field
                        }-indicator"></span>
                        ${
                          player.field.charAt(0).toUpperCase() +
                          player.field.slice(1)
                        }
                    </td>
                    <td>${player.match}</td>
                    <td>${player.monsters}</td>
                    <td>${player.boss}</td>
                    <td>${player.kills}</td>
                    <td>${player.assists}</td>
                    <td>${player.deaths}</td>
                    <td class="kda-ratio-cell">${player.kda}</td>
                    <td><strong>${player.score}</strong></td>
                `;

    tableBody.appendChild(row);
  });
}

// Function to sort players
function sortPlayers(column) {
  const headers = document.querySelectorAll(".players-table th");

  // Remove existing sort classes
  headers.forEach((header) => {
    if (header.dataset.sort !== column) {
      header.classList.remove("asc", "desc");
    }
  });

  // Get the header for the clicked column
  const header = document.querySelector(
    `.players-table th[data-sort="${column}"]`
  );

  // Determine sort direction
  let direction = "asc";
  if (header.classList.contains("asc")) {
    direction = "desc";
    header.classList.remove("asc");
    header.classList.add("desc");
  } else {
    header.classList.remove("desc");
    header.classList.add("asc");
  }

  // Sort the data
  const filteredPlayers = filterPlayers();
  filteredPlayers.sort((a, b) => {
    let valueA = a[column];
    let valueB = b[column];

    // Convert to numbers for numeric columns
    if (
      column !== "name" &&
      column !== "guild" &&
      column !== "field" &&
      column !== "match"
    ) {
      valueA = parseFloat(valueA);
      valueB = parseFloat(valueB);
    }

    // Special handling for dates
    if (column === "match") {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }

    if (direction === "asc") {
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    } else {
      if (valueA > valueB) return -1;
      if (valueA < valueB) return 1;
      return 0;
    }
  });

  // Clear and rebuild table with sorted players
  const tableBody = document.getElementById("playersTableBody");
  tableBody.innerHTML = "";

  filteredPlayers.forEach((player) => {
    const row = document.createElement("tr");
    row.classList.add(
      player.guild === "BobaCats" ? "player-bbc" : "player-eternity"
    );
    row.classList.add(`field-${player.field}`);

    row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${player.guild}</td>
                    <td>
                        <span class="field-indicator field-${
                          player.field
                        }-indicator"></span>
                        ${
                          player.field.charAt(0).toUpperCase() +
                          player.field.slice(1)
                        }
                    </td>
                    <td>${player.match}</td>
                    <td>${player.monsters}</td>
                    <td>${player.boss}</td>
                    <td>${player.kills}</td>
                    <td>${player.assists}</td>
                    <td>${player.deaths}</td>
                    <td class="kda-ratio-cell">${player.kda}</td>
                    <td><strong>${player.score}</strong></td>
                `;

    tableBody.appendChild(row);
  });
}

// Function to calculate guild statistics based on filtered players
function calculateGuildStats() {
  const filteredPlayers = filterPlayers();
  const bbcPlayers = filteredPlayers.filter(
    (player) => player.guild === "BobaCats"
  );
  const eternityPlayers = filteredPlayers.filter(
    (player) => player.guild === "Eternity"
  );

  // Calculate totals
  const bbcStats = {
    players: bbcPlayers.length,
    totalScore: bbcPlayers.reduce((sum, player) => sum + player.score, 0),
    totalKills: bbcPlayers.reduce((sum, player) => sum + player.kills, 0),
    totalAssists: bbcPlayers.reduce((sum, player) => sum + player.assists, 0),
    totalDeaths: bbcPlayers.reduce((sum, player) => sum + player.deaths, 0),
    totalMonsters: bbcPlayers.reduce((sum, player) => sum + player.monsters, 0),
    totalBoss: bbcPlayers.reduce((sum, player) => sum + player.boss, 0),
    topKills: Math.max(
      ...(bbcPlayers.length ? bbcPlayers.map((player) => player.kills) : [0])
    ),
  };

  const eternityStats = {
    players: eternityPlayers.length,
    totalScore: eternityPlayers.reduce((sum, player) => sum + player.score, 0),
    totalKills: eternityPlayers.reduce((sum, player) => sum + player.kills, 0),
    totalAssists: eternityPlayers.reduce(
      (sum, player) => sum + player.assists,
      0
    ),
    totalDeaths: eternityPlayers.reduce(
      (sum, player) => sum + player.deaths,
      0
    ),
    totalMonsters: eternityPlayers.reduce(
      (sum, player) => sum + player.monsters,
      0
    ),
    totalBoss: eternityPlayers.reduce((sum, player) => sum + player.boss, 0),
    topKills: Math.max(
      ...(eternityPlayers.length
        ? eternityPlayers.map((player) => player.kills)
        : [0])
    ),
  };

  // Calculate averages
  bbcStats.avgScore =
    bbcStats.players > 0
      ? Math.round(bbcStats.totalScore / bbcStats.players)
      : 0;
  bbcStats.avgKills =
    bbcStats.players > 0
      ? Math.round(bbcStats.totalKills / bbcStats.players)
      : 0;
  bbcStats.avgAssists =
    bbcStats.players > 0
      ? Math.round(bbcStats.totalAssists / bbcStats.players)
      : 0;
  bbcStats.avgDeaths =
    bbcStats.players > 0
      ? Math.round(bbcStats.totalDeaths / bbcStats.players)
      : 0;
  bbcStats.kdaRatio =
    bbcStats.totalDeaths > 0
      ? (
          (bbcStats.totalKills + bbcStats.totalAssists) /
          bbcStats.totalDeaths
        ).toFixed(2)
      : (bbcStats.totalKills + bbcStats.totalAssists).toFixed(2);

  eternityStats.avgScore =
    eternityStats.players > 0
      ? Math.round(eternityStats.totalScore / eternityStats.players)
      : 0;
  eternityStats.avgKills =
    eternityStats.players > 0
      ? Math.round(eternityStats.totalKills / eternityStats.players)
      : 0;
  eternityStats.avgAssists =
    eternityStats.players > 0
      ? Math.round(eternityStats.totalAssists / eternityStats.players)
      : 0;
  eternityStats.avgDeaths =
    eternityStats.players > 0
      ? Math.round(eternityStats.totalDeaths / eternityStats.players)
      : 0;
  eternityStats.kdaRatio =
    eternityStats.totalDeaths > 0
      ? (
          (eternityStats.totalKills + eternityStats.totalAssists) /
          eternityStats.totalDeaths
        ).toFixed(2)
      : (eternityStats.totalKills + eternityStats.totalAssists).toFixed(2);

  // Update summary stats
  document.getElementById("bbcTotalScore").textContent =
    bbcStats.totalScore.toLocaleString();
  document.getElementById("eternityTotalScore").textContent =
    eternityStats.totalScore.toLocaleString();
  document.getElementById("scoreDifference").textContent = Math.abs(
    bbcStats.totalScore - eternityStats.totalScore
  ).toLocaleString();
  document
    .getElementById("scoreDifference")
    .classList.add(
      bbcStats.totalScore > eternityStats.totalScore
        ? "advantage"
        : "disadvantage"
    );

  document.getElementById("bbcPlayerCount").textContent = bbcStats.players;
  document.getElementById("eternityPlayerCount").textContent =
    eternityStats.players;
  document.getElementById("bbcAvgScore").textContent =
    bbcStats.avgScore.toLocaleString();
  document.getElementById("eternityAvgScore").textContent =
    eternityStats.avgScore.toLocaleString();

  // Update K/D/A ratio stats
  document.getElementById("bbcKDARatio").textContent = bbcStats.kdaRatio;
  document.getElementById("eternityKDARatio").textContent =
    eternityStats.kdaRatio;
  document.getElementById("bbcTopKills").textContent = bbcStats.topKills;
  document.getElementById("eternityTopKills").textContent =
    eternityStats.topKills;

  // Update progress bar
  const progressBar = document.getElementById("guildProgress");
  const totalScore = bbcStats.totalScore + eternityStats.totalScore;
  const bbcPercentage =
    totalScore > 0 ? (bbcStats.totalScore / totalScore) * 100 : 50;
  progressBar.style.width = `${bbcPercentage}%`;

  // Update comparison chart
  updateComparisonChart(bbcStats, eternityStats);

  // Update top players
  updateTopPlayers(bbcPlayers, eternityPlayers);

  // Generate strategy recommendations
  generateStrategyRecommendations(
    bbcStats,
    eternityStats,
    bbcPlayers,
    eternityPlayers
  );

  return { bbcStats, eternityStats };
}

// Function to update comparison chart
function updateComparisonChart(bbcStats, eternityStats) {
  // Get max values for normalization
  const maxKills = Math.max(bbcStats.totalKills, eternityStats.totalKills) || 1;
  const maxAssists =
    Math.max(bbcStats.totalAssists, eternityStats.totalAssists) || 1;
  const maxDeaths =
    Math.max(bbcStats.totalDeaths, eternityStats.totalDeaths) || 1;
  const maxBoss = Math.max(bbcStats.totalBoss, eternityStats.totalBoss) || 1;
  const maxMonsters =
    Math.max(bbcStats.totalMonsters, eternityStats.totalMonsters) || 1;

  // Update bars
  document.getElementById("killsBarBBC").style.height = `${
    (bbcStats.totalKills / maxKills) * 100
  }%`;
  document.getElementById("killsBarEternity").style.height = `${
    (eternityStats.totalKills / maxKills) * 100
  }%`;

  document.getElementById("assistsBarBBC").style.height = `${
    (bbcStats.totalAssists / maxAssists) * 100
  }%`;
  document.getElementById("assistsBarEternity").style.height = `${
    (eternityStats.totalAssists / maxAssists) * 100
  }%`;

  document.getElementById("deathsBarBBC").style.height = `${
    (bbcStats.totalDeaths / maxDeaths) * 100
  }%`;
  document.getElementById("deathsBarEternity").style.height = `${
    (eternityStats.totalDeaths / maxDeaths) * 100
  }%`;

  document.getElementById("bossBarBBC").style.height = `${
    (bbcStats.totalBoss / maxBoss) * 100
  }%`;
  document.getElementById("bossBarEternity").style.height = `${
    (eternityStats.totalBoss / maxBoss) * 100
  }%`;

  document.getElementById("monstersBarBBC").style.height = `${
    (bbcStats.totalMonsters / maxMonsters) * 100
  }%`;
  document.getElementById("monstersBarEternity").style.height = `${
    (eternityStats.totalMonsters / maxMonsters) * 100
  }%`;

  // Add tooltips
  setBarTooltip("killsBarBBC", `BobaCats Total Kills: ${bbcStats.totalKills}`);
  setBarTooltip(
    "killsBarEternity",
    `Eternity Total Kills: ${eternityStats.totalKills}`
  );

  setBarTooltip(
    "assistsBarBBC",
    `BobaCats Total Assists: ${bbcStats.totalAssists}`
  );
  setBarTooltip(
    "assistsBarEternity",
    `Eternity Total Assists: ${eternityStats.totalAssists}`
  );

  setBarTooltip(
    "deathsBarBBC",
    `BobaCats Total Deaths: ${bbcStats.totalDeaths}`
  );
  setBarTooltip(
    "deathsBarEternity",
    `Eternity Total Deaths: ${eternityStats.totalDeaths}`
  );

  setBarTooltip("bossBarBBC", `BobaCats Total Boss: ${bbcStats.totalBoss}`);
  setBarTooltip(
    "bossBarEternity",
    `Eternity Total Boss: ${eternityStats.totalBoss}`
  );

  setBarTooltip(
    "monstersBarBBC",
    `BobaCats Total Monsters: ${bbcStats.totalMonsters}`
  );
  setBarTooltip(
    "monstersBarEternity",
    `Eternity Total Monsters: ${eternityStats.totalMonsters}`
  );
}

// Function to set bar tooltip
function setBarTooltip(elementId, text) {
  const element = document.getElementById(elementId);

  element.addEventListener("mouseover", (e) => {
    const tooltip = document.getElementById("tooltip");
    tooltip.textContent = text;
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 10}px`;
    tooltip.style.opacity = "1";
  });

  element.addEventListener("mouseout", () => {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.opacity = "0";
  });

  element.addEventListener("mousemove", (e) => {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 10}px`;
  });
}

// Function to update top players
function updateTopPlayers(bbcPlayers, eternityPlayers) {
  const container = document.getElementById("topPlayersContainer");
  container.innerHTML = "";

  // Get top 5 players from each guild by score
  const topBBC = [...bbcPlayers]
    .sort((a, b) => b.score - a.score)
    .filter(
      (player, index, self) =>
        index === self.findIndex((p) => p.name === player.name)
    )
    .slice(0, 5);

  const topEternity = [...eternityPlayers]
    .sort((a, b) => b.score - a.score)
    .filter(
      (player, index, self) =>
        index === self.findIndex((p) => p.name === player.name)
    )
    .slice(0, 5);

  // Add top BBC players
  topBBC.forEach((player) => {
    const card = document.createElement("div");
    card.className = "player-card bbc";

    card.innerHTML = `
                    <div class="player-name">${player.name}</div>
                    <div class="field-badge field-${player.field}">${player.field}</div>
                    <div>Score: ${player.score}</div>
                    <div class="date-badge">${player.match}</div>
                    <div class="player-metrics">
                        <div class="player-metric">
                            <span>Kills:</span>
                            <span>${player.kills}</span>
                        </div>
                        <div class="player-metric">
                            <span>Assists:</span>
                            <span>${player.assists}</span>
                        </div>
                        <div class="player-metric">
                            <span>Deaths:</span>
                            <span>${player.deaths}</span>
                        </div>
                        <div class="player-metric">
                            <span>K/D/A:</span>
                            <span>${player.kda}</span>
                        </div>
                    </div>
                `;

    container.appendChild(card);
  });

  // Add top Eternity players
  topEternity.forEach((player) => {
    const card = document.createElement("div");
    card.className = "player-card eternity";

    card.innerHTML = `
                    <div class="player-name">${player.name}</div>
                    <div class="field-badge field-${player.field}">${player.field}</div>
                    <div>Score: ${player.score}</div>
                    <div class="date-badge">${player.match}</div>
                    <div class="player-metrics">
                        <div class="player-metric">
                            <span>Kills:</span>
                            <span>${player.kills}</span>
                        </div>
                        <div class="player-metric">
                            <span>Assists:</span>
                            <span>${player.assists}</span>
                        </div>
                        <div class="player-metric">
                            <span>Deaths:</span>
                            <span>${player.deaths}</span>
                        </div>
                        <div class="player-metric">
                            <span>K/D/A:</span>
                            <span>${player.kda}</span>
                        </div>
                    </div>
                `;

    container.appendChild(card);
  });
}

// Function to generate strategy recommendations
function generateStrategyRecommendations(
  bbcStats,
  eternityStats,
  bbcPlayers,
  eternityPlayers
) {
  const strategyList = document.getElementById("strategyList");
  strategyList.innerHTML = "";

  const strategies = [];

  // Compare total scores
  if (bbcStats.totalScore > eternityStats.totalScore) {
    strategies.push(
      "BobaCats has a higher total score. Maintain the lead by continuing to focus on high-scoring activities."
    );
  } else if (bbcStats.totalScore < eternityStats.totalScore) {
    strategies.push(
      "Eternity currently leads in total score. Focus on improving overall guild performance to close the gap."
    );
  } else {
    strategies.push(
      "The guilds are tied in total score. Look for opportunities to gain an advantage in the next match."
    );
  }

  // Compare KDA ratios
  if (parseFloat(bbcStats.kdaRatio) < parseFloat(eternityStats.kdaRatio)) {
    strategies.push(
      "Eternity has a better Kill/Death/Assist ratio. Work on improving survivability while maintaining offensive output."
    );
  } else if (
    parseFloat(bbcStats.kdaRatio) > parseFloat(eternityStats.kdaRatio)
  ) {
    strategies.push(
      "BobaCats has a strong Kill/Death/Assist ratio. Leverage this advantage in team fights."
    );
  }

  // Compare kills
  if (bbcStats.totalKills < eternityStats.totalKills) {
    const topEternityKillers = [...eternityPlayers]
      .sort((a, b) => b.kills - a.kills)
      .filter(
        (player, index, self) =>
          index === self.findIndex((p) => p.name === player.name)
      )
      .slice(0, 3)
      .map((p) => p.name);
    strategies.push(
      `Target Eternity's top killers (${topEternityKillers.join(
        ", "
      )}) to reduce their kill advantage.`
    );
  } else if (bbcStats.totalKills > eternityStats.totalKills) {
    const topBBCKillers = [...bbcPlayers]
      .sort((a, b) => b.kills - a.kills)
      .filter(
        (player, index, self) =>
          index === self.findIndex((p) => p.name === player.name)
      )
      .slice(0, 3)
      .map((p) => p.name);
    strategies.push(
      `Protect our top killers (${topBBCKillers.join(
        ", "
      )}) to maintain our kill advantage.`
    );
  }

  // Compare boss kills
  if (bbcStats.totalBoss < eternityStats.totalBoss) {
    strategies.push(
      "Eternity has more boss kills. Allocate more resources to boss objectives to even the playing field."
    );
  } else if (bbcStats.totalBoss > eternityStats.totalBoss) {
    strategies.push(
      "BobaCats leads in boss kills. Continue to prioritize boss objectives for the advantage they provide."
    );
  }

  // Compare monster kills
  if (bbcStats.totalMonsters < eternityStats.totalMonsters) {
    strategies.push(
      "Eternity has more monster kills. Consider increasing monster farming to gain resource advantage."
    );
  } else if (bbcStats.totalMonsters > eternityStats.totalMonsters) {
    strategies.push(
      "BobaCats leads in monster kills. Continue to leverage this resource advantage."
    );
  }

  // Field-based comparison
  const bbcMainPlayers = bbcPlayers.filter((p) => p.field === "main");
  const bbcSecondaryPlayers = bbcPlayers.filter((p) => p.field === "secondary");
  const eternityMainPlayers = eternityPlayers.filter((p) => p.field === "main");
  const eternitySecondaryPlayers = eternityPlayers.filter(
    (p) => p.field === "secondary"
  );

  const bbcMainScore = bbcMainPlayers.reduce((sum, p) => sum + p.score, 0);
  const bbcSecondaryScore = bbcSecondaryPlayers.reduce(
    (sum, p) => sum + p.score,
    0
  );
  const eternityMainScore = eternityMainPlayers.reduce(
    (sum, p) => sum + p.score,
    0
  );
  const eternitySecondaryScore = eternitySecondaryPlayers.reduce(
    (sum, p) => sum + p.score,
    0
  );

  if (
    bbcMainScore < eternityMainScore &&
    bbcSecondaryScore > eternitySecondaryScore
  ) {
    strategies.push(
      "BobaCats is stronger in the secondary field but weaker in the main field. Consider shifting some resources to strengthen the main field."
    );
  } else if (
    bbcMainScore > eternityMainScore &&
    bbcSecondaryScore < eternitySecondaryScore
  ) {
    strategies.push(
      "BobaCats is stronger in the main field but weaker in the secondary field. The main field advantage should be leveraged while improving secondary field performance."
    );
  }

  // Identify players with high deaths
  const highDeathsThreshold = 20;
  const bbcHighDeaths = bbcPlayers
    .filter((p) => p.deaths > highDeathsThreshold)
    .filter(
      (player, index, self) =>
        index === self.findIndex((p) => p.name === player.name)
    )
    .map((p) => p.name);

  if (bbcHighDeaths.length > 0) {
    strategies.push(
      `Focus on improving survival rate for players with high deaths: ${bbcHighDeaths
        .slice(0, 3)
        .join(", ")}${bbcHighDeaths.length > 3 ? "..." : ""}`
    );
  }

  // Identify support roles
  const highAssistLowKillPlayers = bbcPlayers
    .filter((p) => p.assists > 300 && p.kills < 10)
    .filter(
      (player, index, self) =>
        index === self.findIndex((p) => p.name === player.name)
    )
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 3)
    .map((p) => p.name);

  if (highAssistLowKillPlayers.length > 0) {
    strategies.push(
      `Protect our key support players: ${highAssistLowKillPlayers.join(", ")}`
    );
  }

  // Identify players with exceptional KDA ratios
  const exceptionalKDAPlayers = bbcPlayers
    .filter((p) => parseFloat(p.kda) > 5 && p.kills > 20)
    .filter(
      (player, index, self) =>
        index === self.findIndex((p) => p.name === player.name)
    )
    .sort((a, b) => parseFloat(b.kda) - parseFloat(a.kda))
    .slice(0, 3)
    .map((p) => p.name);

  if (exceptionalKDAPlayers.length > 0) {
    strategies.push(
      `Leverage the efficiency of players with exceptional K/D/A ratios: ${exceptionalKDAPlayers.join(
        ", "
      )}`
    );
  }

  // Add recommendations to the list
  strategies.forEach((strategy) => {
    const li = document.createElement("li");
    li.textContent = strategy;
    strategyList.appendChild(li);
  });
}

// Function to export data
function exportData() {
  const filteredPlayers = filterPlayers();
  const bbcPlayers = filteredPlayers.filter(
    (player) => player.guild === "BobaCats"
  );
  const eternityPlayers = filteredPlayers.filter(
    (player) => player.guild === "Eternity"
  );

  // Calculate guild stats for export
  const bbcStats = {
    players: bbcPlayers.length,
    totalScore: bbcPlayers.reduce((sum, player) => sum + player.score, 0),
    totalKills: bbcPlayers.reduce((sum, player) => sum + player.kills, 0),
    totalAssists: bbcPlayers.reduce((sum, player) => sum + player.assists, 0),
    totalDeaths: bbcPlayers.reduce((sum, player) => sum + player.deaths, 0),
    totalMonsters: bbcPlayers.reduce((sum, player) => sum + player.monsters, 0),
    totalBoss: bbcPlayers.reduce((sum, player) => sum + player.boss, 0),
    kdaRatio: (
      (bbcPlayers.reduce((sum, player) => sum + player.kills, 0) +
        bbcPlayers.reduce((sum, player) => sum + player.assists, 0)) /
      Math.max(
        1,
        bbcPlayers.reduce((sum, player) => sum + player.deaths, 0)
      )
    ).toFixed(2),
  };

  const eternityStats = {
    players: eternityPlayers.length,
    totalScore: eternityPlayers.reduce((sum, player) => sum + player.score, 0),
    totalKills: eternityPlayers.reduce((sum, player) => sum + player.kills, 0),
    totalAssists: eternityPlayers.reduce(
      (sum, player) => sum + player.assists,
      0
    ),
    totalDeaths: eternityPlayers.reduce(
      (sum, player) => sum + player.deaths,
      0
    ),
    totalMonsters: eternityPlayers.reduce(
      (sum, player) => sum + player.monsters,
      0
    ),
    totalBoss: eternityPlayers.reduce((sum, player) => sum + player.boss, 0),
    kdaRatio: (
      (eternityPlayers.reduce((sum, player) => sum + player.kills, 0) +
        eternityPlayers.reduce((sum, player) => sum + player.assists, 0)) /
      Math.max(
        1,
        eternityPlayers.reduce((sum, player) => sum + player.deaths, 0)
      )
    ).toFixed(2),
  };

  // Get filter settings
  const guildFilter = document.getElementById("guildFilter").value;
  const fieldFilter = document.getElementById("fieldFilter").value;
  const dateFilter = document.getElementById("dateFilter").value;

  const exportData = {
    exportDate: new Date().toISOString(),
    filters: {
      guild: guildFilter,
      field: fieldFilter,
      date: dateFilter,
    },
    bbcStats,
    eternityStats,
    players: filteredPlayers,
  };

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "guild_stats_export.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Add event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Initialize table
  updatePlayersTable();

  // Calculate and display guild stats
  calculateGuildStats();

  // Setup date filter functionality
  document.getElementById("dateFilter").addEventListener("change", function () {
    const customDateFields = document.getElementById("startDate");
    const endDateField = document.getElementById("endDate");

    if (this.value === "custom") {
      customDateFields.disabled = false;
      endDateField.disabled = false;

      // Set default date range if not set
      if (!customDateFields.value) {
        const dates = getUniqueDates();
        if (dates.length > 1) {
          // Convert M/D/YYYY to YYYY-MM-DD for the date input
          const formatForInput = (dateStr) => {
            const [month, day, year] = dateStr.split("/");
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          };

          customDateFields.value = formatForInput(dates[dates.length - 1]);
          endDateField.value = formatForInput(dates[0]);
        }
      }
    } else {
      customDateFields.disabled = true;
      endDateField.disabled = true;
    }

    updatePlayersTable();
    calculateGuildStats();
  });

  document.getElementById("startDate").addEventListener("change", function () {
    updatePlayersTable();
    calculateGuildStats();
  });

  document.getElementById("endDate").addEventListener("change", function () {
    updatePlayersTable();
    calculateGuildStats();
  });

  // Add event listeners for filters
  document
    .getElementById("guildFilter")
    .addEventListener("change", function () {
      updatePlayersTable();
      calculateGuildStats();
    });

  document
    .getElementById("fieldFilter")
    .addEventListener("change", function () {
      updatePlayersTable();
      calculateGuildStats();
    });

  document.getElementById("statFilter").addEventListener("change", function () {
    updatePlayersTable();
    calculateGuildStats();
  });

  document
    .getElementById("playerSearch")
    .addEventListener("input", function () {
      updatePlayersTable();
      calculateGuildStats();
    });

  document
    .getElementById("resetFilters")
    .addEventListener("click", function () {
      document.getElementById("guildFilter").value = "all";
      document.getElementById("fieldFilter").value = "all";
      document.getElementById("statFilter").value = "all";
      document.getElementById("playerSearch").value = "";
      document.getElementById("dateFilter").value = "all";
      document.getElementById("startDate").disabled = true;
      document.getElementById("endDate").disabled = true;

      updatePlayersTable();
      calculateGuildStats();
    });

  // Add event listeners for sorting
  document.querySelectorAll(".players-table th").forEach((header) => {
    header.addEventListener("click", function () {
      sortPlayers(this.dataset.sort);
    });
  });

  // Tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");
      document.getElementById(this.dataset.tab).classList.add("active");
    });
  });

  // Export button
  document.getElementById("exportButton").addEventListener("click", exportData);
});

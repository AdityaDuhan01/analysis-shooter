async function loadAnalytics() {
  try {
    const res = await fetch('/api/results');
    const results = await res.json();

    if (!results.length) {
      document.getElementById('resultsBody').innerHTML =
        '<tr><td colspan="7" style="color:#aaa">No games played yet</td></tr>';
      return;
    }

    // --- Summary Stats ---
    const totalGames = results.length;
    const avgAccuracy = Math.round(
      results.reduce((sum, r) => sum + r.accuracy, 0) / totalGames
    );
    const avgReaction = Math.round(
      results.reduce((sum, r) => sum + r.avgReactionTime, 0) / totalGames
    );
    const topScore = Math.max(...results.map(r => r.score));

    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('avgAccuracy').textContent = avgAccuracy + '%';
    document.getElementById('avgReaction').textContent = avgReaction + 'ms';
    document.getElementById('topScore').textContent = topScore;

    // --- Results Table ---
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';

    results.forEach(r => {
      const date = new Date(r.playedAt).toLocaleString();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${r.playerName}</td>
        <td>${r.score}</td>
        <td>${r.accuracy}%</td>
        <td>${r.avgReactionTime}ms</td>
        <td>${r.hits}</td>
        <td>${r.misses}</td>
        <td>${date}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error('Failed to load analytics:', err);
    document.getElementById('resultsBody').innerHTML =
      '<tr><td colspan="7" style="color:red">Failed to load data</td></tr>';
  }
}

loadAnalytics();
// reference main html container sections
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');

// handle admin authentication login submit
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  // auth user with supabase auth
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert('erreur de connexion : ' + error.message);
  } else {
    // hide login form and display visualization dashboard
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    loadDashboardData();
  }
});

// fetch response records and render interactive charts
async function loadDashboardData() {
  // retrieve all survey responses from table
  const { data: reponses, error } = await supabaseClient
    .from('reponses_sondage')
    .select('*');

  if (error) {
    alert('erreur lors du chargement des résultats : ' + error.message);
    return;
  }

  // render chart 1: usage frequency pie chart
  const frequenceCounts = countOccurrences(reponses, 'frequence');
  createPieChart('chartFrequence', 'Fréquence d\'utilisation', frequenceCounts);

  // render chart 2: sector distribution bar chart
  const poleCounts = countOccurrences(reponses, 'pole');
  createBarChart('chartPole', 'Répartition par pôle', poleCounts);

  // render chart 3: average rating scores
  const avgErgonomie = calculateAverage(reponses, 'ergonomie_note');
  const avgRecherche = calculateAverage(reponses, 'recherche_note');
  createBarChart('chartNotes', 'Notes moyennes (sur 5)', {
    'Ergonomie générale': avgErgonomie,
    'Facilité de recherche': avgRecherche
  });

  // render chart 4: ged transition opinion
  const gedCounts = countOccurrences(reponses, 'favorable_ged');
  createPieChart('chartGed', 'Avis évolution GED', gedCounts);
}

// helper function to count occurrences of single key values
function countOccurrences(list, key) {
  return list.reduce((acc, item) => {
    const val = item[key] || 'non renseigné';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

// helper function to calculate numeric average score
function calculateAverage(list, key) {
  if (list.length === 0) return 0;
  const total = list.reduce((sum, item) => sum + (item[key] || 0), 0);
  return (total / list.length).toFixed(1);
}

// helper function to generate pie charts using chart.js
function createPieChart(elementId, title, dataObj) {
  new Chart(document.getElementById(elementId), {
    type: 'pie',
    data: {
      labels: Object.keys(dataObj),
      datasets: [{
        data: Object.values(dataObj),
        backgroundColor: ['#6b1d2f', '#8b263e', '#d4a373', '#e8e2d5', '#521523']
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: title }
      }
    }
  });
}

// helper function to generate bar charts using chart.js
function createBarChart(elementId, title, dataObj) {
  new Chart(document.getElementById(elementId), {
    type: 'bar',
    data: {
      labels: Object.keys(dataObj),
      datasets: [{
        label: title,
        data: Object.values(dataObj),
        backgroundColor: '#6b1d2f'
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: title }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
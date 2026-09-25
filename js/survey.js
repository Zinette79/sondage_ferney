// html element for user notifications
const statusMsg = document.getElementById('status-message');

// helper function to display visual status messages
function showStatus(text, isError = false) {
  if (!statusMsg) return;
  statusMsg.style.display = 'block';
  statusMsg.style.padding = '15px';
  statusMsg.style.borderRadius = '6px';
  statusMsg.style.marginBottom = '15px';
  statusMsg.style.fontWeight = 'bold';
  
  if (isError) {
    statusMsg.style.backgroundColor = '#f8d7da';
    statusMsg.style.color = '#721c24';
    statusMsg.style.border = '1px solid #f5c6cb';
  } else {
    statusMsg.style.backgroundColor = '#d4edda';
    statusMsg.style.color = '#155724';
    statusMsg.style.border = '1px solid #c3e6cb';
  }
  statusMsg.innerText = text;
}

// test database connectivity immediately on load
async function checkSupabaseConnection() {
  console.log('testing supabase connection...');
  
  if (typeof supabaseClient === 'undefined') {
    showStatus('erreur : le client supabase n\'est pas défini. vérifiez js/config.js', true);
    console.error('supabaseClient is undefined. check js/config.js file.');
    return;
  }

  try {
    const { data, error } = await supabaseClient.from('reponses_sondage').select('id').limit(1);
    if (error) {
      console.error('connection test failed:', error);
      showStatus('avertissement connexion supabase : ' + error.message, true);
    } else {
      console.log('supabase connection successful!');
    }
  } catch (err) {
    console.error('unexpected error during connection test:', err);
    showStatus('erreur inattendue de connexion : ' + err.message, true);
  }
}

// execute initial connection diagnostic check
checkSupabaseConnection();

// handle survey form submit event
const surveyForm = document.getElementById('survey-form');
if (surveyForm) {
  surveyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('form submit event triggered');

    showStatus('envoi en cours, veuillez patienter...', false);

    // extract form data fields
    const formData = new FormData(e.target);

    // construct database insertion payload
    const payload = {
      frequence: formData.get('frequence'),
      fonctions: formData.getAll('fonctions'),
      pole: formData.get('pole'),
      ergonomie_note: parseInt(formData.get('ergonomie_note')) || null,
      recherche_note: parseInt(formData.get('recherche_note')) || null,
      points_forts: formData.getAll('points_forts'),
      difficultes: formData.getAll('difficultes'),
      fonctions_manquantes: formData.getAll('fonctions_manquantes'),
      autres_documents: formData.get('autres_documents'),
      favorable_ged: formData.get('favorable_ged'),
      remarques_ged: formData.get('remarques_ged'),
      groupe_pilote: formData.get('groupe_pilote')
    };

    console.log('payload ready to insert:', payload);

    try {
      // submit survey record to supabase
      const { data, error } = await supabaseClient
        .from('reponses_sondage')
        .insert([payload]);

      if (error) {
        console.error('supabase insert error:', error);
        showStatus('erreur lors de l\'envoi : ' + error.message, true);
      } else {
        console.log('insert successful:', data);
        showStatus('merci ! vos réponses anonymes ont bien été enregistrées.', false);
        e.target.reset();
      }
    } catch (err) {
      console.error('submission runtime exception:', err);
      showStatus('erreur inattendue lors de l\'envoi : ' + err.message, true);
    }
  });
} else {
  console.error('form element #survey-form not found in document!');
}
const apiKey = 'AIzaSyDIz4arXY4AiJ8cFZ_Czj8IZAVHIgEcMSw';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  console.log('--- LISTING AUTHORIZED MODELS ---');
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log('AVAILABLE MODELS:');
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log('RESPONSE:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

listModels();

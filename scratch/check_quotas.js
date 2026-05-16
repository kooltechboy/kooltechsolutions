const apiKey = 'AIzaSyDIz4arXY4AiJ8cFZ_Czj8IZAVHIgEcMSw';

const models = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest'
];

async function checkQuotas() {
  console.log('--- NEURAL QUOTA SWEEP START ---');
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
      });
      const data = await response.json();
      console.log(`MODEL: ${model} | STATUS: ${response.status}`);
      if (response.ok) {
        console.log(`✅ FOUND ACTIVE QUOTA: ${model}`);
        process.exit(0); // Exit early if we find one
      }
    } catch (e) {}
  }
  console.log('--- NEURAL QUOTA SWEEP END ---');
}

checkQuotas();

const apiKey = 'AIzaSyDIz4arXY4AiJ8cFZ_Czj8IZAVHIgEcMSw';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

async function test() {
  console.log('--- AI KEY DIAGNOSTIC START ---');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    
    const data = await response.json();
    console.log('STATUS:', response.status);
    console.log('RESPONSE:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ SUCCESS: The API Key is ACTIVE and reaching Google.');
    } else {
      console.log('❌ FAILURE: Google rejected the request.');
    }
  } catch (e) {
    console.error('❌ CRITICAL NETWORK ERROR:', e.message);
  }
  console.log('--- AI KEY DIAGNOSTIC END ---');
}

test();

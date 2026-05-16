const apiKey = 'AIzaSyDIz4arXY4AiJ8cFZ_Czj8IZAVHIgEcMSw';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

async function test() {
  console.log('--- TESTING GEMINI 2.0 FLASH HANDSHAKE ---');
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
    
    if (response.ok) {
      console.log('✅ HANDSHAKE SUCCESSFUL!');
      console.log('AI RESPONSE:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('❌ HANDSHAKE FAILED:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error('❌ NETWORK ERROR:', e.message);
  }
}

test();

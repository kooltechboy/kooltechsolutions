const body = JSON.stringify({
  messages: [{ id: '1', role: 'user', content: 'Hello Kira, what services does KoolTech Solutions offer?' }],
  agentName: 'Kira',
  agentRole: 'Executive Concierge',
  context: { pathname: '/' }
});

const res = await fetch('http://localhost:3000/api/ai-workforce/v1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body
});

console.log('HTTP Status:', res.status);
console.log('Content-Type:', res.headers.get('content-type'));

const text = await res.text();
if (res.status === 200) {
  // Parse the streamed data-stream format: lines like `0:"text chunk"\n`
  const chunks = text.split('\n')
    .filter(l => l.startsWith('0:'))
    .map(l => {
      try { return JSON.parse(l.slice(2)); } catch { return l.slice(2); }
    });
  console.log('\n✅ KIRA RESPONDED:\n');
  console.log(chunks.join(''));
} else {
  console.log('\n❌ ERROR RESPONSE:\n', text.substring(0, 600));
}

const googlePlugin = require('@livekit/agents-plugin-google');
console.log('Google Plugin Keys:', Object.keys(googlePlugin));
if (googlePlugin.beta) {
  console.log('Google Plugin Beta Keys:', Object.keys(googlePlugin.beta));
  if (googlePlugin.beta.multimodal) {
    console.log('multimodal keys:', Object.keys(googlePlugin.beta.multimodal));
  }
}
try {
  const agents = require('@livekit/agents');
  console.log('Agents Keys:', Object.keys(agents));
  if (agents.multimodal) {
    console.log('agents.multimodal keys:', Object.keys(agents.multimodal));
  }
} catch (e) {
  console.log('Error loading @livekit/agents:', e.message);
}

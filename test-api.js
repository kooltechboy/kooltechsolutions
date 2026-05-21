const url = "http://localhost:3000/api/ai-workforce/v1";
const data = {
  messages: [{ role: "user", content: "Hello, I am interested in cybersecurity services." }],
  agentName: "Aria"
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})
  .then(async res => {
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response stream:");
    console.log(text);
  })
  .catch(err => console.error(err));

const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function testModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-1.5-flash-8b"
  ];

  for (const modelName of modelsToTest) {
    console.log(`Testing ${modelName}...`);
    try {
      const model = await genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("hi");
      console.log(`✅ ${modelName} works! Response: ${result.response.text().substring(0, 20)}...`);
      return modelName; // Stop at first working model
    } catch (e) {
      console.log(`❌ ${modelName} failed: ${e.message.substring(0, 50)}...`);
    }
  }
}

testModels();

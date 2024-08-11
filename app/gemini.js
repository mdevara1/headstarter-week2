const dotenv = require('dotenv');

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
console.log(process.env.NEXT_PUBLIC_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);

async function run() {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const prompt = "Write a story about a magic backpack."

  const result = await model.generateContent(prompt);
  console.log('entered here5', result)
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

run();
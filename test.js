const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Formulae to caluclate distance between 2 points in a 2D plane",
    });

    console.log(response.text);
}

test();
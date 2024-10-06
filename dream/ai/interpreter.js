const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function CanUseWind(regtext) {
    const genAI = new GoogleGenerativeAI("AIzaSyB3jRNyygo-wgH9hiP3WPla3HFBqUJKGxE");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Answer with a yes or a no, does the following text ban utility scale wind energy?: " + regtext;

    const result = await model.generateContent(prompt);
    text = result.response.text();
    
    if (text.includes("yes")) {
        return false;
    }
    else {
        return true;
    }
}

module.exports = { CanUseWind }
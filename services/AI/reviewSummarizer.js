const { GoogleGenAI } = require("@google/genai");
const Listing = require("../../models/listing");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


async function generateReviewSummary(listingId) {
    const listing = await Listing.findById(listingId)
        .populate("reviews");

    if (!listing) return;
    if (listing.reviews.length < 5) {
        return;
    }

    console.log("Inside The Func");

    const reviewsText = listing.reviews
        .map(review =>
            `Rating: ${review.rating}/5
            Comment: ${review.comment}`
        )
        .join("\n\n");

    const prompt = `
                    You are an expert hotel review analyzer.

                    Analyze the following customer reviews.

                    Return ONLY valid JSON.

                    Format:

                    {
                      "positives":[
                          "...",
                          "..."
                      ],
                      "negatives":[
                          "...",
                          "..."
                      ],
                      "overall":"...",
                      "sentiment":85
                    }

                    Rules:

                    - Do not explain.
                    - Do not use markdown.
                    - Do not wrap JSON inside backticks.
                    - Give at most 5 positives.
                    - Give at most 5 negatives.
                    - sentiment must be an integer between 0 and 100.

                    Reviews:

                    ${reviewsText}
                    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const text = response.text;

    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const summary = JSON.parse(cleaned);

    listing.aiSummary = {
        ...summary,
        updatedAt: new Date()
    };

    await listing.save();
}

module.exports = {
    generateReviewSummary
};
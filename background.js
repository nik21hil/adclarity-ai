console.log("🔋 Background service worker loaded.");
import { OPENAI_API_KEY } from './llm/secrets.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "explain-ad" && request.adText) {
    console.log("📨 Received ad explanation request:", request.adText);

    (async () => {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `
You are an advertising expert. Given a LinkedIn ad post, generate a natural, human-sounding explanation of why the user may be seeing this ad. Use a helpful, friendly tone.

Format the response using **bold bullet headers** (no numbering or asterisks) for each section:

- Targeting Insight: Explain based on likely user interests, behaviors, demographics, or past engagements. Use phrases like “You may be seeing this ad because…” or “You might have recently shown interest in…”

- Ad Objective: Explain what the advertiser is trying to achieve with this ad (e.g., promote a product, drive signups, build awareness).

Do not refer to “someone” or “the user”—speak directly and naturally. Avoid numbering, asterisks, or excessive formality.
                `.trim()
              },
              {
                role: "user",
                content: `Here's the ad text:\n\n${request.adText}\n\nPlease explain to the user why they may be seeing this ad on LinkedIn.`
              }
            ]
          })
        });

        const result = await response.json();

        if (result.error) {
          console.error("❌ OpenAI API error:", result.error);
          sendResponse({ message: "Error: " + result.error.message });
          return;
        }

        const message = result.choices?.[0]?.message?.content || "No explanation generated.";
        console.log("✅ OpenAI API response:", message);
        sendResponse({ message });

      } catch (err) {
        console.error("❌ Fetch error:", err);
        sendResponse({ message: "Error fetching explanation from OpenAI." });
      }
    })();

    return true; // allow async sendResponse
  }
});

# 🧠 AdClarity AI

> Understand why you’re seeing online ads, powered by LLMs.

---

## ✨ Project Summary

**AdClarity AI** is a lightweight Chrome extension that explains why a user is seeing a specific ad on platforms like LinkedIn. By analyzing ad copy and context, it uses large language models (LLMs) to infer likely targeting logic and advertiser intent, giving users transparent insights into their online ad experience.

---

## ⚙️ How It Works

1. **User selects an ad** on LinkedIn and clicks the extension icon.
2. The ad text is passed to the extension’s background script.
3. **OpenAI’s GPT-3.5-Turbo** model generates an explanation based on:
   - Possible user interests or behaviors
   - Advertiser's goals (e.g., conversions, awareness)
4. A friendly, structured explanation is shown in the popup.

---

## 🧩 How to Install

1. Clone or download this repository.
2. In Chrome, go to `chrome://extensions/` and enable **Developer mode**.
3. Click **Load unpacked**, and select the project directory (e.g., `adclarity-ai-clean`).
4. Pin the extension to your toolbar.
5. Navigate to LinkedIn, click on any ad, and hit the extension icon to see the magic!

---

## 🛠️ Tech Stack

- **JavaScript** (ES6+)
- **Chrome Extensions API** (Manifest v3)
- **OpenAI API (GPT-3.5-Turbo)**
- HTML + CSS for popup UI

---

## 📸 Demo

<img src="assets/demo.gif" alt="AdClarity AI Demo" width="600"/>

_Or add a screenshot here if you don't have a GIF yet._

---

## 🔐 Security Note

This project uses the OpenAI API key to fetch ad explanations. **Your API key should never be hardcoded or exposed publicly.**  
We've moved the key to a `secrets.js` file that is **excluded via `.gitignore`** to prevent accidental commits.

> **Important**: You are responsible for managing API usage and costs securely. For production use, implement secure proxying and authentication layers.

---

## 🤝 Contribution & License

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

Licensed under the MIT License.
"""




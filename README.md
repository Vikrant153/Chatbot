# Chatbot
An AI chatbot , used to think and answer the questions

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Chatbot (GPT + Voice)</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="chat-container">
    <div class="chatbot">
      <header>
        <h2>AI Chatbot</h2>
      </header>
      <ul class="chatbox">
        <li class="chat incoming">
          <span class="material-symbols-rounded">smart_toy</span>
          <p>Hi there 👋<br>How can I help you today?</p>
        </li>
      </ul>
      <div class="chat-input">
      <button id="upload-btn" class="material-symbols-rounded">add</button>
      <textarea placeholder="Type your message..."></textarea>
      <button id="voice-btn" class="material-symbols-rounded">mic</button>
      <button id="send-btn" class="material-symbols-rounded">send</button>
      </div>

<!-- Hidden file input -->
      <input type="file" id="file-input" style="display: none;" multiple>

    </div>
  </div>
  <script src="script.js" defer></script>
</body>
</html>


css part

/* style.css */
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}

body {
  background: #e3f2fd;
}

.chat-container {
  position: fixed;
  right: 40px;
  bottom: 35px;
  width: 420px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 0 128px 0 rgba(0,0,0,0.1),
              0 32px 64px -48px rgba(0,0,0,0.5);
  overflow: hidden;
}

.chatbot header {
  background: #724ae8;
  padding: 16px 0;
  text-align: center;
}

.chatbot header h2 {
  color: #fff;
  font-size: 1.4rem;
}

.chatbot .chatbox {
  height: 510px;
  overflow-y: auto;
  padding: 30px 20px 70px;
}

.chatbot .chat {
  display: flex;
  margin-bottom: 20px;
}

.chatbox .incoming span {
  height: 32px;
  width: 32px;
  background: #724ae8;
  color: #fff;
  text-align: center;
  line-height: 32px;
  border-radius: 4px;
  margin-right: 10px;
}

.chatbox .outgoing {
  justify-content: flex-end;
}

.chatbox .chat p {
  color: #fff;
  max-width: 75%;
  white-space: pre-wrap;
  padding: 12px 16px;
  border-radius: 10px 10px 0 10px;
  background: #724ae8;
}

.chatbox .incoming p {
  background: #f2f2f2;
  color: #000;
  border-radius: 10px 10px 10px 0;
}

.chat-input {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  gap: 5px;
  padding: 5px 20px;
  background: #fff;
  border-top: 1px solid #ccc;
}

.chat-input textarea {
  height: 55px;
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: 0.95rem;
  padding: 16px 15px 16px 0;
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
  border-top: 1px solid #eee;
  background-color: #fff;
  border-radius: 0 0 16px 16px;
}


.chat-input span {
  align-self: flex-end;
  color: #724ae8;
  font-size: 1.35rem;
  cursor: pointer;
  height: 55px;
  line-height: 55px;
}

.chat-input button {
  background: transparent;
  border: none;
  font-size: 22px;
  color: #555;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.chat-input button:hover {
  color: #111;
}


JAVA SCRIPT

// script.js (DeepSeek + FAQ + Upload Button – Vanilla JS)

const chatInput = document.querySelector(".chat-input textarea");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");
const chatbox = document.querySelector(".chatbox");

// 🔑 OpenRouter API
const OPENROUTER_API_KEY = "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"; // Your OpenRouter Key
const SITE_URL = "https://your-portfolio.com"; // Optional
const SITE_TITLE = "Vikrant Chatbot"; // Optional

// 📚 FAQ Dataset from your PDF
const faqData = [
  { q: "Where is my order?", a: "You can track your order from the 'My Orders' section of your account." },
  { q: "How do I return a product?", a: "You can initiate a return from the 'My Orders' section within the return window." },
  { q: "What payment methods do you accept?", a: "We accept Credit/Debit Cards, Net Banking, UPI, Wallets, and Cash on Delivery." },
  { q: "Can I cancel my order after placing it?", a: "Orders can be cancelled before shipment from the 'My Orders' section." },
  { q: "How do I apply a coupon code?", a: "Enter the coupon code at checkout to apply the discount." },
  { q: "How can I contact customer support?", a: "Click on the 'Help' section or use the chat/call options to reach support." },
  // Add more Q&A pairs from your PDF if needed
];

// 🎯 Match user input with FAQ
const matchFAQ = (userMessage) => {
  const lowerMsg = userMessage.toLowerCase();
  return faqData.find(faq => lowerMsg.includes(faq.q.toLowerCase().split(" ")[0]));
};

// 💬 Create chat message element
const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  const content =
    className === "outgoing"
      ? `<p>${message}</p>`
      : `<span class="material-symbols-rounded">smart_toy</span><p>${message}</p>`;
  chatLi.innerHTML = content;
  return chatLi;
};

// 🤖 DeepSeek (via OpenRouter)
const generateResponse = async (userMessage, liElement) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_TITLE,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();
    console.log("OpenRouter/DeepSeek response:", data);

    const reply = data.choices?.[0]?.message?.content || "⚠️ No response from DeepSeek.";
    liElement.querySelector("p").textContent = reply.trim();
  } catch (error) {
    liElement.querySelector("p").textContent = "❌ Error: " + error.message;
    console.error("OpenRouter error:", error);
  }
};

// ✉️ Main chat handler
const handleChat = () => {
  const message = chatInput.value.trim();
  if (!message) return;

  const userLi = createChatLi(message, "outgoing");
  chatbox.appendChild(userLi);
  chatInput.value = "";

  const botLi = createChatLi("Thinking...", "incoming");
  chatbox.appendChild(botLi);
  chatbox.scrollTo(0, chatbox.scrollHeight);

  // Check if message matches an FAQ
  const matched = matchFAQ(message);
  if (matched) {
    botLi.querySelector("p").textContent = matched.a;
  } else {
    generateResponse(message, botLi); // Fallback to DeepSeek
  }
};

// 📤 Handle send button
sendBtn.addEventListener("click", handleChat);

// 🎤 Voice input using Web Speech API
voiceBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (event) => {
    const voiceText = event.results[0][0].transcript;
    chatInput.value = voiceText;
    chatInput.focus();
  };

  recognition.onerror = (err) => {
    alert("Voice input error: " + err.error);
  };
});

// 📎 Upload Button Handler
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const files = [...fileInput.files];
  files.forEach((file) => {
    const fileLi = document.createElement("li");
    fileLi.classList.add("chat", "outgoing");

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      img.style.maxWidth = "200px";
      fileLi.appendChild(img);
    } else {
      fileLi.innerHTML = `<p>📎 ${file.name}</p>`;
    }

    chatbox.appendChild(fileLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
  });

  fileInput.value = "";
});







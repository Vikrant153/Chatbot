const chatInput = document.querySelector(".chat-input textarea");
const sendBtn = document.getElementById("send-btn");
const voiceBtn = document.getElementById("voice-btn");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");
const chatbox = document.querySelector(".chatbox");

const OPENROUTER_API_KEY = "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"; // Your OpenRouter Key
const SITE_URL = "https://your-portfolio.com";
const SITE_TITLE = "Vikrant Chatbot";

// 📚 Extended FAQ Dataset from PDF
const faqData = [
  { q: "Where is my order?", a: "You can track your order from the 'My Orders' section of your account." },
  { q: "How can I track my shipment?", a: "You will receive a tracking link via SMS/email once your order is shipped." },
  { q: "My order hasn't arrived yet - what should I do?", a: "If your order is delayed, please check the tracking link or contact support." },
  { q: "Can I change my delivery address after ordering?", a: "Address changes after placing an order are generally not allowed. Contact support for urgent issues." },
  { q: "How long does delivery take?", a: "Delivery typically takes 3-7 business days depending on your location." },
  { q: "Is same-day or next-day delivery available?", a: "Same-day or next-day delivery is available in select cities." },
  { q: "How do I return a product?", a: "You can initiate a return from the 'My Orders' section within the return window." },
  { q: "What's your return policy?", a: "Most products can be returned within 7-10 days of delivery if eligible." },
  { q: "Will I get a refund for a returned item?", a: "Yes, refunds are issued after the returned product passes quality checks." },
  { q: "How long does a refund take?", a: "Refunds are processed within 5-7 business days." },
  { q: "Which items can't be returned?", a: "Some items like perishable goods, innerwear, or customized products are non-returnable." },
  { q: "Can I exchange instead of getting a refund?", a: "Yes, exchanges are allowed for select products depending on availability." },
  { q: "What payment options do you support?", a: "We accept Credit/Debit Cards, Net Banking, UPI, Wallets, and Cash on Delivery." },
  { q: "Is Cash on Delivery available?", a: "Yes, COD is available on most products." },
  { q: "Why did my payment fail?", a: "Payments can fail due to bank issues, insufficient funds, or incorrect details." },
  { q: "Can I use more than one payment method?", a: "Currently, only one payment method can be used per order." },
  { q: "Do you offer EMI?", a: "Yes, EMI options are available on select credit cards and orders above certain value." },
  { q: "Where can I find my invoice?", a: "Invoices can be downloaded from the 'My Orders' section under each order." },
  { q: "How can I add my GST number to the invoice?", a: "You can add your GST details in your profile before placing the order." },
  { q: "Do you provide GST bills?", a: "Yes, GST invoices are provided for eligible orders." },
  { q: "How do I create an account?", a: "Click on 'Sign Up' and fill in the required details to create an account." },
  { q: "I forgot my password. What should I do?", a: "Click on 'Forgot Password' to reset it using your registered email or mobile." },
  { q: "How do I update my phone number?", a: "Go to your account settings and edit your phone number." },
  { q: "Can I delete my account?", a: "Yes, please contact support to permanently delete your account." },
  { q: "Can I cancel an order I just placed?", a: "Orders can be cancelled before shipment from the 'My Orders' section." },
  { q: "Can I add items to an order I've already placed?", a: "You cannot modify an existing order. Please place a new order." },
  { q: "I ordered the wrong item. What now?", a: "Cancel the incorrect order and place a new one with correct items." },
  { q: "Are there any discounts or coupons?", a: "Yes, active discount coupons are shown on the product or checkout pages." },
  { q: "How do I apply a coupon code?", a: "Enter the coupon code at checkout to apply the discount." },
  { q: "Why isn't my coupon code working?", a: "It may be expired, invalid, or not applicable to selected items." },
  { q: "My item arrived damaged. What should I do?", a: "Initiate a return and select 'Product damaged' as the reason." },
  { q: "I got the wrong item. How do I report this?", a: "Go to 'My Orders' > 'Return' and select 'Wrong item received'." },
  { q: "How can I contact customer support?", a: "Click on the 'Help' section or use the chat/call options to reach support." }
];

// 🔍 Better fuzzy match
const matchFAQ = (userMessage) => {
  const lowerMsg = userMessage.toLowerCase();

  for (const faq of faqData) {
    const lowerQ = faq.q.toLowerCase();
    if (lowerMsg.includes(lowerQ) || lowerQ.includes(lowerMsg)) return faq;

    const overlap = lowerQ.split(" ").filter(word => lowerMsg.includes(word)).length;
    if (overlap >= Math.ceil(lowerQ.split(" ").length * 0.6)) return faq;
  }

  return null;
};

// 💬 Create chat message
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

let lastBotMessage = "";

// 🤖 AI Fallback (DeepSeek)
const generateResponse = async (userMessage, liElement, context = "") => {
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
        messages: [
          { role: "system", content: "If the user asks a question listed in the FAQ, do NOT change its answer. Otherwise, respond normally." },
          ...(context ? [{ role: "user", content: "Earlier you said: " + context }] : []),
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ No response from DeepSeek.";
    lastBotMessage = reply.trim();
    liElement.querySelector("p").textContent = lastBotMessage;
  } catch (error) {
    liElement.querySelector("p").textContent = "❌ Error: " + error.message;
    console.error("OpenRouter error:", error);
  }
};

// 🧠 Handle user message
const handleChat = () => {
  const message = chatInput.value.trim();
  if (!message) return;

  const userLi = createChatLi(message, "outgoing");
  chatbox.appendChild(userLi);
  chatInput.value = "";

  const botLi = createChatLi("Thinking...", "incoming");
  chatbox.appendChild(botLi);
  chatbox.scrollTo(0, chatbox.scrollHeight);

  const matched = matchFAQ(message);
  if (matched) {
    lastBotMessage = matched.a;
    botLi.querySelector("p").textContent = matched.a;
  } else {
    generateResponse(message, botLi, lastBotMessage);
  }
};

sendBtn.addEventListener("click", handleChat);

// 🎤 Voice Input
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

// 📎 Upload Handler
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

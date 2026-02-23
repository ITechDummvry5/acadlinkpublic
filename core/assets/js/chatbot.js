// ===================== Persona =====================
const persona = {
  name: `MAXIMUS`,
  tone: "friendly",
  traits: ["helpful"],
  memory: [],
  maxMemory: 50
};

// ===================== Voices =====================
let selectedVoice = null;
let voices = [];

// ===================== Cache DOM =====================
const inputBox = document.getElementById("textInput");
const responseBox = document.getElementById("responseBox");
const voiceSelect = document.getElementById("voiceSelect");
const suggestionsBox = document.getElementById("suggestions");
const chatbotOptions = document.querySelectorAll(".chatbot-options button");

// ===================== Disable input initially =====================
inputBox.disabled = true;

// ===================== Custom Q&A =====================
const QA = [
  { questions: ["hello"], response: "Hello! How can I assist you today?" },
  { questions: ["your name"], response: `My name is ${persona.name}.` },
  { questions: ["how are you"], response: "I'm functioning perfectly!" },
  { questions: ["what is acadlink"], response: "ACADLINK is a web-based scholarship finder that helps students search and filter scholarships by keywords, academic strand, and location." },
  { questions: ["what does acadlink do"], response: "ACADLINK allows students to search scholarships, filter by strand, view deadlines, bookmark opportunities, and access official scholarship websites." },
  { questions: ["is acadlink free"], response: "Yes, ACADLINK is completely free and accessible online." },
  { questions: ["do i need an account"], response: "No account is required. Students can search and explore scholarships directly." },
  // ... include all other QA items as in your code
];

// ===================== Generate Reply =====================
function generateReply(message) {
  persona.memory.push({ role: "user", content: message });
  if (persona.memory.length > persona.maxMemory) persona.memory.shift();

  const lower = message.toLowerCase();
  let replyObj = QA.find(q => q.questions.some(k => lower === k));

  if (!replyObj) {
    replyObj = QA.find(q => q.questions.some(k => lower.includes(k)));
  }

  let reply = replyObj?.response || "You said: " + message;

  // Greeting smile icon
  const showSmile = QA[0].questions.some(greet => lower.includes(greet));
  if (showSmile) {
    reply = `<img src="core/assets/images/Logo/favicon.ico" alt="smile" style="width:20px; vertical-align:middle;"> ${reply}`;
  }

  persona.memory.push({ role: "assistant", content: reply });
  return reply;
}

// ===================== Send Text =====================
function sendText() {
  if (inputBox.disabled) return; // Prevent bypass
  const input = inputBox.value.trim();
  if (!input) return;

  // User bubble
  const userBubble = document.createElement("div");
  userBubble.className = "response-bubble user";
  userBubble.innerHTML = `<span>${input}</span>`;
  responseBox.appendChild(userBubble);

  // Bot reply
  const reply = generateReply(input);
  const botBubble = document.createElement("div");
  botBubble.className = "response-bubble assistant";
  botBubble.innerHTML = `<img src="core/assets/images/Logo/favicon.ico"><span>${reply}</span>`;
  responseBox.appendChild(botBubble);

  speak(reply.replace(/<[^>]+>/g, ""));
  inputBox.value = "";
  suggestionsBox.innerHTML = "";
  responseBox.scrollTop = responseBox.scrollHeight;
}

// ===================== Text-to-Speech =====================
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.pitch = 1.2;
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

// ===================== Load Voices =====================
function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  if (!voiceSelect) return;
  voiceSelect.innerHTML = '<option value="">Select Voice</option>';
  voices.forEach((voice, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}
voiceSelect?.addEventListener("change", e => selectedVoice = voices[e.target.value] || null);
window.speechSynthesis.onvoiceschanged = loadVoices;
window.addEventListener("load", loadVoices);

// ===================== Autocomplete Suggestions =====================
inputBox.addEventListener("input", () => {
  const query = inputBox.value.toLowerCase().trim();
  suggestionsBox.innerHTML = "";
  if (!query) return;

  const matches = QA.flatMap(q => q.questions).filter(q => q.toLowerCase().includes(query));
  matches.slice(0, 10).forEach(match => {
    const div = document.createElement("div");
    div.textContent = match;
    div.addEventListener("click", () => {
      inputBox.value = match;
      suggestionsBox.innerHTML = "";
    });
    suggestionsBox.appendChild(div);
  });
});

// ===================== Chatbot Agree Buttons =====================
chatbotOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    const choice = btn.textContent.trim();
    if (choice === "Learn More") {
      addBotMessage("By agreeing to the terms, you accept that the chatbot will guide you based on our system rules. You can still ask questions freely.");
    } else if (choice === "No, I don't") {
      chatbotOptions.forEach(b => b.disabled = true);
      inputBox.disabled = true;
      addBotMessage("You cannot use the chatbot without agreeing to the terms.");
    } else if (choice === "Yes, I agree") {
      chatbotOptions.forEach(b => b.style.display = "none");
      inputBox.disabled = false;
      inputBox.focus();
      addBotMessage("Thank you for agreeing! You can now use the chatbot.");
    }
  });
});

// ===================== Helper to Add Bot Messages =====================
function addBotMessage(msg) {
  const botBubble = document.createElement("div");
  botBubble.className = "response-bubble assistant";
  botBubble.innerHTML = `<img src="core/assets/images/Logo/favicon.ico"><span>${msg}</span>`;
  responseBox.appendChild(botBubble);
  speak(msg);
  responseBox.scrollTop = responseBox.scrollHeight;
}
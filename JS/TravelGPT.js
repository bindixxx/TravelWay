const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('messages');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatContainer = document.getElementById('chatContainer');

let conversationHistory = [];

const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(theme) {
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  toggle.checked = theme === 'light';
  localStorage.setItem('theme', theme);
}

setTheme(stored || (prefersDark ? 'dark' : 'light'));

toggle.addEventListener('change', () => {
  setTheme(toggle.checked ? 'light' : 'dark');
});

function goBack() {
  window.location.href = 'main.html';
}

messageInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});

messageInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function selectSuggestion(text) {
  messageInput.value = text;
  sendMessage();
}

function addMessage(content, isUser) {
  welcomeScreen.style.display = 'none';
  messagesContainer.style.display = 'flex';

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;

  messageDiv.innerHTML = `
    <div class="message-avatar">${isUser ? "👤" : "🤖"}</div>
    <div class="message-content">${escapeHtml(content)}</div>
  `;

  messagesContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showTyping() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message assistant';
  typingDiv.id = 'typing-indicator';

  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;

  messagesContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  messageInput.value = '';
  messageInput.style.height = 'auto';

  if (conversationHistory.length === 0) {
    conversationHistory.push({
      role: 'system',
      content: 'Ты TravelGPT — эксперт по путешествиям и туризму по Азербайджану. Ты знаешь всё про достопримечательности Азербайджана, маршруты Азербайджана, культуру Азербайджана, кухню Азербайджана и практические советы для путешественников. Отвечай дружелюбно, полезно и подробно, обязательно на русском языке.'
    });
  }
  
  conversationHistory.push({ role: 'user', content: message });

  showTyping();
  sendButton.disabled = true;

  try {
    const response = await fetch('https://tennisfriends.az/ai/chat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conversationHistory,
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const assistantMessage = data.choices?.[0]?.message?.content || "Извините, не удалось получить ответ.";

    conversationHistory.push({ role: 'assistant', content: assistantMessage });

    removeTyping();
    addMessage(assistantMessage, false);

  } catch (error) {
    console.error('Ошибка:', error);
    removeTyping();
    addMessage('Извините, произошла ошибка при обращении к API.', false);
  } finally {
    sendButton.disabled = false;
  }
}
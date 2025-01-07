let BOT_TOKEN = localStorage.getItem('botToken') || '';
let currentChatId = null;
let lastMessageId = 0;

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeSelect').value = savedTheme;

    document.getElementById('menuToggle').addEventListener('click', () => {
        document.querySelector('.chats-list').classList.toggle('active');
    });

    document.getElementById('backButton').addEventListener('click', () => {
        document.querySelector('.chats-list').classList.remove('active');
    });

    document.getElementById('notifyButton').addEventListener('click', requestNotificationPermission);
    
    document.getElementById('settingsButton').addEventListener('click', () => {
        document.getElementById('botToken').value = BOT_TOKEN;
        document.getElementById('tokenModal').style.display = 'block';
    });

    document.getElementById('refreshButton').addEventListener('click', () => {
        if (currentChatId) {
            displayMessages(currentChatId);
        }
        displayChats();
    });

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('tokenModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.getElementById('saveToken').addEventListener('click', () => {
        const token = document.getElementById('botToken').value.trim();
        if (token) {
            BOT_TOKEN = token;
            localStorage.setItem('botToken', token);
            displayChats();
            document.getElementById('tokenModal').style.display = 'none';
        }
    });

    document.getElementById('themeSelect').addEventListener('change', (e) => {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    document.getElementById('sendButton').addEventListener('click', () => {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        if (text) {
            sendMessage(text);
            input.value = '';
        }
    });

    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('sendButton').click();
        }
    });

    document.getElementById('fileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            sendMedia(file);
            e.target.value = '';
        }
    });

    if (BOT_TOKEN) {
        displayChats();
    } else {
        document.getElementById('tokenModal').style.display = 'block';
    }
});

async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        localStorage.setItem('notifications', permission === 'granted');
        updateNotificationButton();
    }
}

function updateNotificationButton() {
    const button = document.getElementById('notifyButton');
    button.style.color = localStorage.getItem('notifications') === 'true' ? 
        'var(--accent)' : 'var(--text-secondary)';
}

function showNotification(title, body) {
    if (localStorage.getItem('notifications') === 'true' && document.hidden) {
        new Notification(title, { body });
    }
}

async function getChats() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const chats = new Map();
        
        data.result.forEach(update => {
            if (update.message) {
                const chat = update.message.chat;
                chats.set(chat.id, {
                    id: chat.id,
                    name: chat.title || `${chat.first_name} ${chat.last_name || ''}`.trim() || chat.username
                });
            }
        });
        
        return Array.from(chats.values());
    } catch (error) {
        console.error('Error fetching chats:', error);
        return [];
    }
}

async function displayChats() {
    const chats = await getChats();
    const chatsContainer = document.getElementById('chatsContainer');
    chatsContainer.innerHTML = '';
    
    chats.forEach(chat => {
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-item';
        if (chat.id === currentChatId) chatElement.classList.add('active');
        chatElement.textContent = chat.name;
        chatElement.addEventListener('click', () => selectChat(chat));
        chatsContainer.appendChild(chatElement);
    });
}

async function getChatMessages(chatId) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        return data.result
            .filter(update => update.message && update.message.chat.id === chatId)
            .map(update => {
                const msg = update.message;
                const botId = BOT_TOKEN.split(':')[0];
                return {
                    id: msg.message_id,
                    text: msg.text || 'Медиафайл',
                    isBot: msg.from.id.toString() === botId,
                    from: msg.from.first_name || (msg.from.id.toString() === botId ? 'Бот' : 'Пользователь'),
                    date: new Date(msg.date * 1000)
                };
            });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

async function displayMessages(chatId) {
    const messages = await getChatMessages(chatId);
    const messagesList = document.getElementById('messagesList');
    
    if (messages.length > 0 &&

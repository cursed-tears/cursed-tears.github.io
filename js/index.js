let BOT_TOKEN = localStorage.getItem('botToken') || '';
let currentChatId = null;

// Инициализация всех обработчиков событий
document.addEventListener('DOMContentLoaded', () => {
    // Загрузка темы
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeSelect').value = savedTheme;

    // Мобильная навигация
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.querySelector('.chats-list').classList.toggle('active');
    });

    document.getElementById('backButton').addEventListener('click', () => {
        document.querySelector('.chats-list').classList.remove('active');
    });

    // Настройки и обновление
    document.getElementById('notifyButton').addEventListener('click', requestNotificationPermission);
    
    document.getElementById('settingsButton').addEventListener('click', () => {
        document.getElementById('tokenModal').style.display = 'block';
    });

    document.getElementById('refreshButton').addEventListener('click', () => {
        if (currentChatId) {
            displayMessages(currentChatId);
        }
        displayChats();
    });

    // Модальное окно
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('tokenModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Сохранение токена
    document.getElementById('saveToken').addEventListener('click', () => {
        const token = document.getElementById('botToken').value;
        if (token) {
            BOT_TOKEN = token;
            localStorage.setItem('botToken', token);
            displayChats();
            document.getElementById('tokenModal').style.display = 'none';
        }
    });

    // Смена темы
    document.getElementById('themeSelect').addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.value);
        localStorage.setItem('theme', e.target.value);
    });

    // Отправка сообщений
    document.getElementById('sendButton').addEventListener('click', () => {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        if (text) {
            sendMessage(text);
            input.value = '';
        }
    });

    // Enter для отправки
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('sendButton').click();
        }
    });

    // Отправка файлов
    document.getElementById('fileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            sendMedia(file);
        }
    });

    // Запуск приложения
    if (BOT_TOKEN) {
        displayChats();
    }
});

// Уведомления
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

// Работа с чатами
async function getChats() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
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
        console.error('Ошибка получения чатов:', error);
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
        chatElement.textContent = chat.name;
        chatElement.addEventListener('click', () => selectChat(chat));
        chatsContainer.appendChild(chatElement);
    });
}

async function getChatMessages(chatId) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
        const data = await response.json();
        return data.result
            .filter(update => update.message && update.message.chat.id === chatId)
            .map(update => ({
                text: update.message.text || 'Медиафайл',
                isBot: false,
                from: update.message.from.first_name || 'Пользователь',
                date: new Date(update.message.date * 1000)
            }));
    } catch (error) {
        console.error('Ошибка получения сообщений:', error);
        return [];
    }
}

async function displayMessages(chatId) {
    const messages = await getChatMessages(chatId);
    const messagesList = document.getElementById('messagesList');
    const lastMessage = messagesList.lastElementChild;
    
    messagesList.innerHTML = '';
    
    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${msg.isBot ? 'outgoing' : 'incoming'}`;
        messageElement.innerHTML = `
            <div class="message-header">${msg.from}</div>
            <div class="message-text">${msg.text}</div>
            <div class="message-time">${msg.date.toLocaleTimeString()}</div>
        `;
        messagesList.appendChild(messageElement);
    });

    if (lastMessage && messagesList.lastElementChild !== lastMessage) {
        const msgText = messagesList.lastElementChild.querySelector('.message-text').textContent;
        showNotification('Новое сообщение', msgText);
    }
    
    messagesList.scrollTop = messagesList.scrollHeight;
}

function selectChat(chat) {
    currentChatId = chat.id;
    document.getElementById('currentChatName').querySelector('span').textContent = chat.name;
    document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    displayMessages(chat.id);
    document.querySelector('.chats-list').classList.remove('active');
}

async function sendMessage(text) {
    if (!currentChatId) return;
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: currentChatId,
                text: text
            })
        });
        
        if (response.ok) {
            displayMessages(currentChatId);
        }
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
    }
}

async function sendMedia(file) {
    if (!currentChatId) return;

    try {
        const formData = new FormData();
        formData.append('chat_id', currentChatId);
        formData.append('document', file);

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            displayMessages(currentChatId);
        }
    } catch (error) {
        console.error('Ошибка отправки файла:', error);
    }
}

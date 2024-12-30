const MAX_CHARS = 1000;
const COOLDOWN_TIME = 60; 
let lastMessageTime = 0;
let cooldownTimer = null;

const messageInput = document.getElementById('messageInput');
const messageInputMobile = document.getElementById('messageInputMobile');
const sendButton = document.getElementById('sendButton');
const sendButtonMobile = document.getElementById('sendButtonMobile');
const charCountPC = document.querySelector('.PC-build .text-wrapper-4');
const charCountMobile = document.querySelector('.mobile-build .text-wrapper-3');
const timerPC = document.querySelector('.PC-build .text-wrapper-5');
const timerMobile = document.querySelector('.mobile-build .text-wrapper-4');

function updateCharCount(input, display) {
    const length = input.value.length;
    display.textContent = `${length}/${MAX_CHARS}`;
}

function updateTimer(timeLeft) {
    const display = `${timeLeft}s`;
    timerPC.textContent = display;
    timerMobile.textContent = display;
    
    if (timeLeft > 0) {
        sendButton.disabled = true;
        sendButtonMobile.disabled = true;
        cooldownTimer = setTimeout(() => updateTimer(timeLeft - 1), 1000);
    } else {
        sendButton.disabled = false;
        sendButtonMobile.disabled = false;
        timerPC.textContent = '0:00s';
        timerMobile.textContent = '0:00s';
    }
}

async function sendMessage(content) {
    const now = Date.now();
    const timeSinceLastMessage = (now - lastMessageTime) / 1000;

    if (timeSinceLastMessage < COOLDOWN_TIME) {
        alert(`Please wait ${Math.ceil(COOLDOWN_TIME - timeSinceLastMessage)} seconds before sending another message`);
        return;
    }

    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            lastMessageTime = now;
            updateTimer(COOLDOWN_TIME);
            messageInput.value = '';
            messageInputMobile.value = '';
            updateCharCount(messageInput, charCountPC);
            updateCharCount(messageInputMobile, charCountMobile);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

messageInput.addEventListener('input', () => updateCharCount(messageInput, charCountPC));
messageInputMobile.addEventListener('input', () => updateCharCount(messageInputMobile, charCountMobile));

sendButton.addEventListener('click', () => sendMessage(messageInput.value));
sendButtonMobile.addEventListener('click', () => sendMessage(messageInputMobile.value));

document.addEventListener('DOMContentLoaded', () => {
    updateCharCount(messageInput, charCountPC);
    updateCharCount(messageInputMobile, charCountMobile);
});

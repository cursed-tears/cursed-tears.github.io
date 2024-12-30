const handleResponsive = () => {
    const isMobile = window.innerWidth <= 1023;
    document.querySelector('.PC-build').style.display = isMobile ? 'none' : 'flex';
    document.querySelector('.mobile-build').style.display = isMobile ? 'flex' : 'none';
};

const addMessageAnimation = (element) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    });
};

document.addEventListener('DOMContentLoaded', () => {
    handleResponsive();
    window.addEventListener('resize', handleResponsive);
    
    fetchMessages();
});

async function fetchMessages() {
    try {
        const response = await fetch('/api/messages');
        const messages = await response.json();
        
        messages.forEach(message => {
            const messageElement = createMessageElement(message);
            addMessageAnimation(messageElement);
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

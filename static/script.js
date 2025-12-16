// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const clearChatButton = document.getElementById('clear-chat');
const exportChatButton = document.getElementById('export-chat');
const showDisclaimerButton = document.getElementById('show-disclaimer');
const disclaimerModal = document.getElementById('disclaimer-modal');
const typingIndicator = document.getElementById('typing-indicator');
const currentTimeElement = document.getElementById('current-time');
const recentTopicsElement = document.getElementById('recent-topics');
const toast = document.getElementById('toast');

// Generate a unique conversation ID
const conversationId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
let recentTopics = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    setInterval(updateTime, 60000); // Update time every minute
    
    // Load disclaimer
    loadDisclaimer();
    
    // Set up event listeners
    sendButton.addEventListener('click', sendMessage);
    clearChatButton.addEventListener('click', clearChat);
    exportChatButton.addEventListener('click', exportChat);
    showDisclaimerButton.addEventListener('click', showDisclaimer);
    
    // Enter key to send message
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-focus input
    userInput.focus();
});

// Update current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateString = now.toLocaleDateString([], {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    currentTimeElement.innerHTML = `${dateString}<br>${timeString}`;
}

// Send message to server
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator(true);
    
    try {
        const response = await fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversation_id: conversationId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Add bot response to chat
            addBotResponse(data.response);
            
            // Add to recent topics if it's a symptom
            if (data.response.type === 'symptom') {
                const symptom = message.toLowerCase().split(' ')[0];
                addRecentTopic(symptom);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        addBotResponse({
            text: "Sorry, I'm having trouble connecting to the server. Please try again.",
            type: "error",
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
    } finally {
        showTypingIndicator(false);
    }
}

// Add user message to chat UI
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message animate__animated animate__fadeIn`;
    
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        ${sender === 'user' ? '' : '<div class="message-avatar"><i class="fas fa-robot"></i></div>'}
        <div class="message-content">
            <div class="message-sender">${sender === 'user' ? 'You' : 'HealthBot AI'}</div>
            <div class="message-text">${formatMessageText(text)}</div>
            <div class="message-timestamp">${timestamp}</div>
        </div>
        ${sender === 'user' ? '<div class="message-avatar"><i class="fas fa-user"></i></div>' : ''}
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add bot response to chat UI
function addBotResponse(response) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message bot-message ${response.type}-message animate__animated animate__fadeIn`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-sender">HealthBot AI</div>
            <div class="message-text">${formatMessageText(response.text)}</div>
            <div class="message-timestamp">${response.timestamp}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Format message text with line breaks and emphasis
function formatMessageText(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
}

// Clear chat history
async function clearChat() {
    if (!confirm('Are you sure you want to clear the chat history?')) return;
    
    try {
        const response = await fetch('/clear_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversationId
            })
        });
        
        if (response.ok) {
            chatMessages.innerHTML = '';
            
            // Add welcome message back
            const welcomeMsg = `
                <div class="message bot-message welcome-message animate__animated animate__fadeIn">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-sender">HealthBot AI</div>
                        <div class="message-text">
                            <p>👋 Hello! I'm your AI health assistant.</p>
                            <p>I can provide general health information and symptom guidance.</p>
                            <p><strong>Please remember:</strong> I'm not a substitute for professional medical advice. For emergencies, call 10177 immediately.</p>
                        </div>
                        <div class="message-timestamp">Just now</div>
                    </div>
                </div>
            `;
            
            chatMessages.innerHTML = welcomeMsg;
            showToast('Chat cleared successfully');
        }
    } catch (error) {
        console.error('Error clearing chat:', error);
        showToast('Error clearing chat');
    }
}

// Export chat as text file
function exportChat() {
    const messages = chatMessages.querySelectorAll('.message-content');
    let exportText = 'HealthBot AI Chat Export\n';
    exportText += 'Generated: ' + new Date().toLocaleString() + '\n\n';
    exportText += '='.repeat(50) + '\n\n';
    
    messages.forEach(msg => {
        const sender = msg.querySelector('.message-sender').textContent;
        const text = msg.querySelector('.message-text').textContent;
        const time = msg.querySelector('.message-timestamp').textContent;
        
        exportText += `[${time}] ${sender}:\n${text}\n\n`;
    });
    
    exportText += '\n' + '='.repeat(50) + '\n';
    exportText += 'End of conversation\n';
    exportText += 'Disclaimer: This chat is for informational purposes only and does not constitute medical advice.';
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthbot-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Chat exported successfully');
}

// Load disclaimer content
async function loadDisclaimer() {
    try {
        const response = await fetch('/get_disclaimer');
        const data = await response.json();
        document.getElementById('disclaimer-content').innerHTML = formatMessageText(data.text);
    } catch (error) {
        console.error('Error loading disclaimer:', error);
        document.getElementById('disclaimer-content').innerHTML = 
            '<p>Unable to load disclaimer. Please remember that this chatbot provides general information only and is not a substitute for professional medical advice.</p>';
    }
}

// Show/hide disclaimer modal
function showDisclaimer() {
    disclaimerModal.style.display = 'flex';
}

function closeModal() {
    disclaimerModal.style.display = 'none';
}

// Quick select from sidebar
function quickSelect(topic) {
    userInput.value = `Tell me about ${topic}`;
    userInput.focus();
    showToast(`Selected: ${topic}`);
}

// Add recent topic
function addRecentTopic(topic) {
    if (recentTopics.size >= 5) {
        const first = Array.from(recentTopics)[0];
        recentTopics.delete(first);
    }
    
    recentTopics.add(topic);
    updateRecentTopics();
}

// Update recent topics display
function updateRecentTopics() {
    recentTopicsElement.innerHTML = '';
    recentTopics.forEach(topic => {
        const topicDiv = document.createElement('div');
        topicDiv.className = 'tip';
        topicDiv.innerHTML = `<i class="fas fa-history"></i><span>${capitalizeFirst(topic)}</span>`;
        topicDiv.onclick = () => quickSelect(topic);
        recentTopicsElement.appendChild(topicDiv);
    });
}

// Capitalize first letter
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show/hide typing indicator
function showTypingIndicator(show) {
    typingIndicator.style.display = show ? 'flex' : 'none';
    if (show) scrollToBottom();
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show toast notification
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

// Handle Enter key press
function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        sendMessage();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === disclaimerModal) {
        closeModal();
    }
};

// Add some initial recent topics
window.addEventListener('load', function() {
    setTimeout(() => {
        addRecentTopic('headache');
        addRecentTopic('fever');
        addRecentTopic('general health');
    }, 1000);
});
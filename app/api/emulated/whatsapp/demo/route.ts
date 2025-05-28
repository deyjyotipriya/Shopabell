import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp Business API Emulator Demo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #128C7E;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .button {
            background: #25D366;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        .button:hover {
            background: #128C7E;
        }
        .input {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-right: 10px;
            width: 200px;
        }
        .response {
            margin-top: 15px;
            padding: 15px;
            background: #e8f5e9;
            border-radius: 5px;
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
        }
        .error {
            background: #ffebee;
            color: #c62828;
        }
        .messages {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            margin-top: 10px;
        }
        .message {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 5px;
        }
        .message.sent {
            background: #dcf8c6;
            margin-left: 20%;
            text-align: right;
        }
        .message.received {
            background: #fff;
            margin-right: 20%;
        }
        .status {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>WhatsApp Business API Emulator Demo</h1>
        
        <div class="section">
            <h2>1. Start Onboarding Flow</h2>
            <input type="text" id="phoneNumber" class="input" placeholder="+919876543210" value="+919876543210">
            <button class="button" onclick="startOnboarding()">Start Onboarding</button>
            <div id="onboardingResponse" class="response" style="display:none;"></div>
        </div>

        <div class="section">
            <h2>2. Send Message (Simulate User Response)</h2>
            <input type="text" id="messageText" class="input" placeholder="Enter message">
            <button class="button" onclick="sendMessage()">Send Message</button>
            <div id="messageResponse" class="response" style="display:none;"></div>
        </div>

        <div class="section">
            <h2>3. Send Template Message</h2>
            <select id="templateName" class="input">
                <option value="order_update">Order Update</option>
                <option value="shipping_update">Shipping Update</option>
            </select>
            <button class="button" onclick="sendTemplate()">Send Template</button>
            <div id="templateResponse" class="response" style="display:none;"></div>
        </div>

        <div class="section">
            <h2>4. Conversation View</h2>
            <button class="button" onclick="getMessages()">Refresh Messages</button>
            <button class="button" onclick="clearMessages()">Clear Conversation</button>
            <div id="conversationState" class="response" style="display:none;"></div>
            <div id="messages" class="messages"></div>
        </div>

        <div class="section">
            <h2>Quick Test Flow</h2>
            <button class="button" onclick="runQuickTest()">Run Complete Onboarding Test</button>
            <div id="quickTestLog" class="response" style="display:none;"></div>
        </div>
    </div>

    <script>
        let currentPhone = '+919876543210';
        
        async function startOnboarding() {
            currentPhone = document.getElementById('phoneNumber').value || '+919876543210';
            try {
                const response = await fetch('/api/emulated/whatsapp/test-onboarding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone_number: currentPhone })
                });
                const data = await response.json();
                showResponse('onboardingResponse', data);
                setTimeout(getMessages, 1000);
            } catch (error) {
                showResponse('onboardingResponse', { error: error.message }, true);
            }
        }

        async function sendMessage() {
            const text = document.getElementById('messageText').value;
            if (!text) return;
            
            try {
                const response = await fetch('/api/emulated/whatsapp/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: currentPhone,
                        type: 'text',
                        text: { body: text }
                    })
                });
                const data = await response.json();
                showResponse('messageResponse', data);
                document.getElementById('messageText').value = '';
                setTimeout(getMessages, 2000);
            } catch (error) {
                showResponse('messageResponse', { error: error.message }, true);
            }
        }

        async function sendTemplate() {
            const templateName = document.getElementById('templateName').value;
            const params = templateName === 'order_update' 
                ? { orderId: '12345', status: 'shipped', trackingLink: 'https://track.example.com/12345' }
                : { orderId: '12345', status: 'out for delivery', trackingId: 'TRK123456', estimatedDelivery: 'Tomorrow, 3 PM' };
            
            try {
                const response = await fetch('/api/emulated/whatsapp/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: currentPhone,
                        template_name: templateName,
                        language: 'en',
                        parameters: params
                    })
                });
                const data = await response.json();
                showResponse('templateResponse', data);
                setTimeout(getMessages, 1000);
            } catch (error) {
                showResponse('templateResponse', { error: error.message }, true);
            }
        }

        async function getMessages() {
            try {
                const response = await fetch(\`/api/emulated/whatsapp/messages?phone_number=\${currentPhone}\`);
                const data = await response.json();
                
                if (data.conversation_state) {
                    showResponse('conversationState', {
                        state: data.conversation_state,
                        total_messages: data.total_messages
                    });
                }
                
                const messagesDiv = document.getElementById('messages');
                messagesDiv.innerHTML = data.messages.map(msg => \`
                    <div class="message \${msg.from === '15550555555' ? 'received' : 'sent'}">
                        <div>\${msg.text?.body || msg.template?.name || 'Interactive message'}</div>
                        <div class="status">\${msg.status || 'sent'} • \${new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                \`).join('');
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }

        async function clearMessages() {
            // Note: This would need a backend endpoint to clear conversation
            document.getElementById('messages').innerHTML = '';
            document.getElementById('conversationState').style.display = 'none';
        }

        async function runQuickTest() {
            const log = document.getElementById('quickTestLog');
            log.style.display = 'block';
            log.textContent = 'Starting quick test...\\n';
            
            try {
                // Start onboarding
                log.textContent += '\\n1. Starting onboarding...';
                await startOnboarding();
                await sleep(2000);
                
                // Select English
                log.textContent += '\\n2. Selecting English...';
                document.getElementById('messageText').value = '1';
                await sendMessage();
                await sleep(2000);
                
                // Enter business name
                log.textContent += '\\n3. Entering business name...';
                document.getElementById('messageText').value = 'My Test Shop';
                await sendMessage();
                await sleep(2000);
                
                // Select category
                log.textContent += '\\n4. Selecting Fashion category...';
                document.getElementById('messageText').value = '1';
                await sendMessage();
                await sleep(2000);
                
                // Enter UPI ID
                log.textContent += '\\n5. Entering UPI ID...';
                document.getElementById('messageText').value = 'testshop@paytm';
                await sendMessage();
                await sleep(2000);
                
                log.textContent += '\\n\\n✅ Onboarding completed! Check the conversation view above.';
            } catch (error) {
                log.textContent += '\\n\\n❌ Error: ' + error.message;
            }
        }

        function showResponse(elementId, data, isError = false) {
            const element = document.getElementById(elementId);
            element.textContent = JSON.stringify(data, null, 2);
            element.className = isError ? 'response error' : 'response';
            element.style.display = 'block';
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Auto-refresh messages every 5 seconds
        setInterval(() => {
            if (document.getElementById('messages').innerHTML) {
                getMessages();
            }
        }, 5000);
    </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
import { v4 as uuidv4 } from 'uuid';

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: {
    type: 'button' | 'list';
    body: {
      text: string;
    };
    action: any;
  };
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ConversationState {
  phoneNumber: string;
  language: 'en' | 'hi' | 'bn' | null;
  stage: 'welcome' | 'language_selection' | 'business_name' | 'category' | 'upi_id' | 'completed';
  businessName?: string;
  category?: string;
  upiId?: string;
  sellerId?: string;
  lastMessageTime: Date;
}

export interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
        messages?: Array<WhatsAppMessage>;
      };
      field: string;
    }>;
  }>;
}

const TRANSLATIONS = {
  en: {
    welcome: "Welcome to Shopabell! 🛍️\n\nI'm here to help you set up your online business on WhatsApp.\n\nPlease select your preferred language:",
    language_prompt: "Please choose your language:\n\n1️⃣ English\n2️⃣ हिंदी\n3️⃣ বাংলা",
    business_name_prompt: "Great! What's the name of your business?",
    category_prompt: "Please select your business category:\n\n1️⃣ Fashion & Clothing\n2️⃣ Electronics\n3️⃣ Home & Kitchen\n4️⃣ Beauty & Personal Care\n5️⃣ Food & Beverages\n6️⃣ Other",
    upi_prompt: "Please enter your UPI ID for receiving payments (e.g., yourname@paytm):",
    success: "Congratulations! 🎉\n\nYour Shopabell business account has been created successfully!\n\nBusiness Name: {businessName}\nCategory: {category}\nUPI ID: {upiId}\n\nYou can now start adding products and receiving orders on WhatsApp!",
    invalid_input: "Invalid input. Please try again.",
    order_update: "Order Update 📦\n\nOrder #{orderId} has been {status}.\n\nTrack your order: {trackingLink}",
    shipping_update: "Shipping Update 🚚\n\nYour order #{orderId} is {status}.\n\nTracking ID: {trackingId}\nEstimated Delivery: {estimatedDelivery}"
  },
  hi: {
    welcome: "Shopabell में आपका स्वागत है! 🛍️\n\nमैं WhatsApp पर आपका ऑनलाइन व्यवसाय स्थापित करने में आपकी मदद करने के लिए यहाँ हूँ।\n\nकृपया अपनी पसंदीदा भाषा चुनें:",
    language_prompt: "कृपया अपनी भाषा चुनें:\n\n1️⃣ English\n2️⃣ हिंदी\n3️⃣ বাংলা",
    business_name_prompt: "बहुत अच्छा! आपके व्यवसाय का नाम क्या है?",
    category_prompt: "कृपया अपनी व्यवसाय श्रेणी चुनें:\n\n1️⃣ फैशन और कपड़े\n2️⃣ इलेक्ट्रॉनिक्स\n3️⃣ घर और रसोई\n4️⃣ सौंदर्य और व्यक्तिगत देखभाल\n5️⃣ खाद्य और पेय\n6️⃣ अन्य",
    upi_prompt: "कृपया भुगतान प्राप्त करने के लिए अपना UPI ID दर्ज करें (जैसे: yourname@paytm):",
    success: "बधाई हो! 🎉\n\nआपका Shopabell व्यवसाय खाता सफलतापूर्वक बनाया गया है!\n\nव्यवसाय का नाम: {businessName}\nश्रेणी: {category}\nUPI ID: {upiId}\n\nअब आप WhatsApp पर उत्पाद जोड़ना और ऑर्डर प्राप्त करना शुरू कर सकते हैं!",
    invalid_input: "अमान्य इनपुट। कृपया पुनः प्रयास करें।",
    order_update: "ऑर्डर अपडेट 📦\n\nऑर्डर #{orderId} {status} हो गया है।\n\nअपना ऑर्डर ट्रैक करें: {trackingLink}",
    shipping_update: "शिपिंग अपडेट 🚚\n\nआपका ऑर्डर #{orderId} {status} है।\n\nट्रैकिंग ID: {trackingId}\nअनुमानित डिलीवरी: {estimatedDelivery}"
  },
  bn: {
    welcome: "Shopabell এ স্বাগতম! 🛍️\n\nআমি এখানে WhatsApp এ আপনার অনলাইন ব্যবসা স্থাপন করতে সাহায্য করতে এসেছি।\n\nঅনুগ্রহ করে আপনার পছন্দের ভাষা নির্বাচন করুন:",
    language_prompt: "অনুগ্রহ করে আপনার ভাষা চয়ন করুন:\n\n1️⃣ English\n2️⃣ हिंदी\n3️⃣ বাংলা",
    business_name_prompt: "দুর্দান্ত! আপনার ব্যবসার নাম কি?",
    category_prompt: "অনুগ্রহ করে আপনার ব্যবসায়ের ধরন নির্বাচন করুন:\n\n1️⃣ ফ্যাশন ও পোশাক\n2️⃣ ইলেকট্রনিক্স\n3️⃣ ঘর ও রান্নাঘর\n4️⃣ সৌন্দর্য ও ব্যক্তিগত যত্ন\n5️⃣ খাদ্য ও পানীয়\n6️⃣ অন্যান্য",
    upi_prompt: "অনুগ্রহ করে পেমেন্ট গ্রহণের জন্য আপনার UPI ID লিখুন (যেমন: yourname@paytm):",
    success: "অভিনন্দন! 🎉\n\nআপনার Shopabell ব্যবসা অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!\n\nব্যবসার নাম: {businessName}\nধরন: {category}\nUPI ID: {upiId}\n\nআপনি এখন WhatsApp এ পণ্য যোগ করা এবং অর্ডার গ্রহণ শুরু করতে পারেন!",
    invalid_input: "অবৈধ ইনপুট। অনুগ্রহ করে আবার চেষ্টা করুন।",
    order_update: "অর্ডার আপডেট 📦\n\nঅর্ডার #{orderId} {status} হয়েছে।\n\nআপনার অর্ডার ট্র্যাক করুন: {trackingLink}",
    shipping_update: "শিপিং আপডেট 🚚\n\nআপনার অর্ডার #{orderId} {status}।\n\nট্র্যাকিং ID: {trackingId}\nআনুমানিক ডেলিভারি: {estimatedDelivery}"
  }
};

const CATEGORIES = {
  '1': 'Fashion & Clothing',
  '2': 'Electronics',
  '3': 'Home & Kitchen',
  '4': 'Beauty & Personal Care',
  '5': 'Food & Beverages',
  '6': 'Other'
};

export class WhatsAppEmulator {
  private conversations: Map<string, ConversationState> = new Map();
  private messages: Map<string, WhatsAppMessage[]> = new Map();
  private webhookUrl?: string;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl;
  }

  setWebhookUrl(url: string) {
    this.webhookUrl = url;
  }

  async sendMessage(message: Omit<WhatsAppMessage, 'id' | 'timestamp'>): Promise<WhatsAppMessage> {
    // Simulate network delay
    await this.simulateDelay();

    const fullMessage: WhatsAppMessage = {
      ...message,
      id: `wamid.${uuidv4()}`,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Store message
    const phoneMessages = this.messages.get(message.to) || [];
    phoneMessages.push(fullMessage);
    this.messages.set(message.to, phoneMessages);

    // Update message status after delay
    setTimeout(() => this.updateMessageStatus(fullMessage.id, 'delivered'), 1000);
    setTimeout(() => this.updateMessageStatus(fullMessage.id, 'read'), 2000);

    // Process automated responses
    if (message.type === 'text' && message.text) {
      this.processIncomingMessage(message.to, message.text.body);
    }

    return fullMessage;
  }

  async updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read' | 'failed') {
    // Find and update message
    for (const [phone, messages] of this.messages.entries()) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.status = status;
        
        // Send webhook
        if (this.webhookUrl) {
          await this.sendWebhook({
            object: 'whatsapp_business_account',
            entry: [{
              id: 'WABA_ID',
              changes: [{
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '15550555555',
                    phone_number_id: 'PHONE_NUMBER_ID'
                  },
                  statuses: [{
                    id: messageId,
                    status,
                    timestamp: new Date().toISOString(),
                    recipient_id: phone
                  }]
                },
                field: 'messages'
              }]
            }]
          });
        }
        break;
      }
    }
  }

  private async processIncomingMessage(phoneNumber: string, message: string) {
    let state = this.conversations.get(phoneNumber);
    
    if (!state) {
      state = {
        phoneNumber,
        language: null,
        stage: 'welcome',
        lastMessageTime: new Date()
      };
      this.conversations.set(phoneNumber, state);
      
      // Send welcome message
      await this.sendAutomatedResponse(phoneNumber, 'welcome', 'en');
      return;
    }

    const trimmedMessage = message.trim().toLowerCase();

    switch (state.stage) {
      case 'welcome':
      case 'language_selection':
        if (['1', 'english'].includes(trimmedMessage)) {
          state.language = 'en';
          state.stage = 'business_name';
          await this.sendAutomatedResponse(phoneNumber, 'business_name_prompt', state.language);
        } else if (['2', 'hindi', 'हिंदी'].includes(trimmedMessage)) {
          state.language = 'hi';
          state.stage = 'business_name';
          await this.sendAutomatedResponse(phoneNumber, 'business_name_prompt', state.language);
        } else if (['3', 'bengali', 'বাংলা'].includes(trimmedMessage)) {
          state.language = 'bn';
          state.stage = 'business_name';
          await this.sendAutomatedResponse(phoneNumber, 'business_name_prompt', state.language);
        } else {
          await this.sendAutomatedResponse(phoneNumber, 'language_prompt', 'en');
        }
        break;

      case 'business_name':
        if (message.length > 0) {
          state.businessName = message;
          state.stage = 'category';
          await this.sendAutomatedResponse(phoneNumber, 'category_prompt', state.language || 'en');
        }
        break;

      case 'category':
        if (CATEGORIES[trimmedMessage as keyof typeof CATEGORIES]) {
          state.category = CATEGORIES[trimmedMessage as keyof typeof CATEGORIES];
          state.stage = 'upi_id';
          await this.sendAutomatedResponse(phoneNumber, 'upi_prompt', state.language || 'en');
        } else {
          await this.sendAutomatedResponse(phoneNumber, 'invalid_input', state.language || 'en');
          await this.sendAutomatedResponse(phoneNumber, 'category_prompt', state.language || 'en');
        }
        break;

      case 'upi_id':
        if (message.includes('@')) {
          state.upiId = message;
          state.sellerId = uuidv4();
          state.stage = 'completed';
          
          // Send success message
          const successMessage = TRANSLATIONS[state.language || 'en'].success
            .replace('{businessName}', state.businessName || '')
            .replace('{category}', state.category || '')
            .replace('{upiId}', state.upiId);
          
          await this.sendMessage({
            from: '15550555555',
            to: phoneNumber,
            type: 'text',
            text: { body: successMessage }
          });
          
          // Create seller account webhook - send as custom payload
          if (this.webhookUrl) {
            await fetch(this.webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                object: 'seller_account',
                entry: [{
                  id: state.sellerId,
                  changes: [{
                    value: {
                      seller_id: state.sellerId,
                      phone_number: phoneNumber,
                      business_name: state.businessName,
                      category: state.category,
                      upi_id: state.upiId,
                      language: state.language,
                      created_at: new Date().toISOString()
                    },
                    field: 'account_created'
                  }]
                }]
              })
            });
          }
        } else {
          await this.sendAutomatedResponse(phoneNumber, 'invalid_input', state.language || 'en');
          await this.sendAutomatedResponse(phoneNumber, 'upi_prompt', state.language || 'en');
        }
        break;
    }

    state.lastMessageTime = new Date();
  }

  private async sendAutomatedResponse(phoneNumber: string, messageKey: string, language: 'en' | 'hi' | 'bn') {
    await this.simulateDelay();
    
    const translations = TRANSLATIONS[language];
    const message = translations[messageKey as keyof typeof translations];
    if (message) {
      await this.sendMessage({
        from: '15550555555',
        to: phoneNumber,
        type: 'text',
        text: { body: message }
      });
    }
  }

  async sendTemplate(
    phoneNumber: string,
    templateName: string,
    language: string,
    parameters: Record<string, string>
  ): Promise<WhatsAppMessage> {
    const state = this.conversations.get(phoneNumber);
    const userLang = (state?.language || 'en') as 'en' | 'hi' | 'bn';
    
    let messageBody = '';
    
    if (templateName === 'order_update') {
      messageBody = TRANSLATIONS[userLang].order_update
        .replace('{orderId}', parameters.orderId || '')
        .replace('{status}', parameters.status || '')
        .replace('{trackingLink}', parameters.trackingLink || '');
    } else if (templateName === 'shipping_update') {
      messageBody = TRANSLATIONS[userLang].shipping_update
        .replace('{orderId}', parameters.orderId || '')
        .replace('{status}', parameters.status || '')
        .replace('{trackingId}', parameters.trackingId || '')
        .replace('{estimatedDelivery}', parameters.estimatedDelivery || '');
    }

    return this.sendMessage({
      from: '15550555555',
      to: phoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        components: [{
          type: 'body',
          parameters: Object.entries(parameters).map(([key, value]) => ({
            type: 'text',
            text: value
          }))
        }]
      },
      text: { body: messageBody } // Include rendered text for display
    });
  }

  getConversationState(phoneNumber: string): ConversationState | undefined {
    return this.conversations.get(phoneNumber);
  }

  getMessages(phoneNumber: string): WhatsAppMessage[] {
    return this.messages.get(phoneNumber) || [];
  }

  clearConversation(phoneNumber: string) {
    this.conversations.delete(phoneNumber);
    this.messages.delete(phoneNumber);
  }

  private async simulateDelay() {
    const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async sendWebhook(payload: WebhookPayload) {
    if (!this.webhookUrl) return;

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }
}

// Global instance
export const whatsappEmulator = new WhatsAppEmulator();
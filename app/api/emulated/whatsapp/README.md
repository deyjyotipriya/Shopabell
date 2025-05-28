# WhatsApp Business API Emulator

This emulator simulates the WhatsApp Business API for testing Shopabell's seller onboarding and messaging features.

## Features

- **Multi-language Support**: English, Hindi, and Bengali
- **Complete Onboarding Flow**: Language selection → Business name → Category → UPI ID → Account creation
- **Message Templates**: Order and shipping update templates
- **Webhook Simulation**: Sends real-time events for message status and account creation
- **Conversation State Management**: Maintains state for each phone number
- **Realistic Delays**: Simulates 1-3 second network delays

## API Endpoints

### 1. Send Message
**POST** `/api/emulated/whatsapp/messages`

Send text, template, or interactive messages.

```json
{
  "to": "+919876543210",
  "type": "text",
  "text": {
    "body": "Hello! Welcome to Shopabell"
  }
}
```

### 2. Get Messages & Conversation State
**GET** `/api/emulated/whatsapp/messages?phone_number=+919876543210`

Retrieve all messages and current conversation state for a phone number.

### 3. Update Message Status
**PUT** `/api/emulated/whatsapp/messages/{messageId}/status`

```json
{
  "status": "delivered"  // sent, delivered, read, failed
}
```

### 4. Test Onboarding Flow
**POST** `/api/emulated/whatsapp/test-onboarding`

Initiates the complete onboarding flow for a phone number.

```json
{
  "phone_number": "+919876543210",  // optional
  "webhook_url": "https://your-webhook-url.com"  // optional
}
```

### 5. Send Template Message
**POST** `/api/emulated/whatsapp/templates`

```json
{
  "to": "+919876543210",
  "template_name": "order_update",
  "language": "en",
  "parameters": {
    "orderId": "12345",
    "status": "shipped",
    "trackingLink": "https://track.example.com/12345"
  }
}
```

### 6. Configure Webhook
**POST** `/api/emulated/whatsapp/webhook`

```json
{
  "webhook_url": "https://your-webhook-url.com"
}
```

## Testing the Onboarding Flow

1. **Start Onboarding**:
```bash
curl -X POST http://localhost:3000/api/emulated/whatsapp/test-onboarding \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543210"}'
```

2. **Simulate User Response** (Select English):
```bash
curl -X POST http://localhost:3000/api/emulated/whatsapp/messages \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+919876543210",
    "type": "text",
    "text": {"body": "1"}
  }'
```

3. **Enter Business Name**:
```bash
curl -X POST http://localhost:3000/api/emulated/whatsapp/messages \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+919876543210",
    "type": "text",
    "text": {"body": "My Fashion Store"}
  }'
```

4. **Select Category** (Fashion & Clothing):
```bash
curl -X POST http://localhost:3000/api/emulated/whatsapp/messages \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+919876543210",
    "type": "text",
    "text": {"body": "1"}
  }'
```

5. **Enter UPI ID**:
```bash
curl -X POST http://localhost:3000/api/emulated/whatsapp/messages \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+919876543210",
    "type": "text",
    "text": {"body": "mystore@paytm"}
  }'
```

6. **Check Conversation State**:
```bash
curl http://localhost:3000/api/emulated/whatsapp/messages?phone_number=+919876543210
```

## Webhook Events

### Message Status Update
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550555555",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "statuses": [{
          "id": "wamid.xxx",
          "status": "delivered",
          "timestamp": "2024-01-01T00:00:00Z",
          "recipient_id": "+919876543210"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### Seller Account Created
```json
{
  "object": "seller_account",
  "entry": [{
    "id": "seller_uuid",
    "changes": [{
      "value": {
        "seller_id": "uuid",
        "phone_number": "+919876543210",
        "business_name": "My Fashion Store",
        "category": "Fashion & Clothing",
        "upi_id": "mystore@paytm",
        "language": "en",
        "created_at": "2024-01-01T00:00:00Z"
      },
      "field": "account_created"
    }]
  }]
}
```

## Available Templates

1. **order_update**: Order status updates with tracking link
2. **shipping_update**: Shipping status with tracking ID and delivery date
3. **welcome_seller**: Marketing message for new sellers

## Business Categories

1. Fashion & Clothing
2. Electronics
3. Home & Kitchen
4. Beauty & Personal Care
5. Food & Beverages
6. Other

## Notes

- Messages automatically progress from `sent` → `delivered` → `read` status
- The emulator maintains conversation state across API calls
- All timestamps are in ISO 8601 format
- Phone numbers should include country code (e.g., +91 for India)
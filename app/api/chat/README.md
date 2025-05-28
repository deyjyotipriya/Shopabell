# Chat API Documentation

This directory contains all the API endpoints for the real-time chat system in Shopabell.

## Endpoints

### 1. Chat Management

#### GET /api/chat
Get all chats for a user
- Query params: `userId`, `userType` (seller/buyer), `status`, `limit`, `offset`
- Returns: List of chats with last message and unread count

#### POST /api/chat/create
Create a new chat session
- Body: `{ sellerId, productId?, buyerPhone? }`
- Returns: `{ chatId, chat, isExisting }`

#### DELETE /api/chat
Archive a chat
- Body: `{ chatId, userId }`
- Returns: `{ success: true }`

### 2. Messages

#### GET /api/chat/[chatId]/messages
Get messages for a chat
- Query params: `limit`, `before` (for pagination)
- Returns: Messages with sender info

#### POST /api/chat/[chatId]/messages
Send a new message
- Body: `{ content, senderId, messageType?, metadata? }`
- Returns: Created message

### 3. Chat Details

#### GET /api/chat/[chatId]
Get chat details with participants and product info
- Returns: Chat object with seller, buyer, and product details

#### PATCH /api/chat/[chatId]
Mark messages as read
- Body: `{ userId }`
- Returns: `{ success: true }`

### 4. Real-time Features

#### GET /api/chat/[chatId]/subscribe
Server-Sent Events endpoint for real-time updates
- Query params: `userId`
- Returns: SSE stream with new messages and updates

#### POST /api/chat/[chatId]/typing
Send typing indicator
- Body: `{ userId, isTyping }`
- Returns: Typing status

### 5. Special Commands

#### POST /api/chat/sell-command
Process /sell command to create checkout link
- Body: `{ chatId, messageId, amount }`
- Returns: `{ checkoutUrl, sessionId, message }`

### 6. File Handling

#### POST /api/chat/upload
Upload file attachment
- Form data: `file`, `chatId`, `userId`
- Returns: `{ attachment: { id, url, fileName, ... } }`

#### DELETE /api/chat/upload
Delete uploaded file
- Body: `{ fileUrl, userId, chatId }`
- Returns: `{ success: true }`

### 7. Templates

#### GET /api/chat/templates
Get quick reply templates
- Query params: `userId`, `userType`
- Returns: Templates grouped by category

#### POST /api/chat/templates
Create custom template
- Body: `{ userId, template: { title, content, category } }`
- Returns: Created template

### 8. Analytics

#### GET /api/chat/analytics
Get chat analytics for sellers
- Query params: `sellerId`, `startDate`, `endDate`
- Returns: Chat metrics, conversion rates, and insights

### 9. Search

#### GET /api/chat/search
Search chats and messages
- Query params: `userId`, `userType`, `query`, `limit`
- Returns: Search results grouped by type

## WebSocket-like Features

The chat system uses a combination of:
1. **Supabase Realtime** for database change notifications
2. **Server-Sent Events** for pushing updates to clients
3. **Polling fallback** for environments that don't support SSE

## Authentication

All endpoints require appropriate authentication:
- Sellers can only access their own chats
- Buyers can only access chats they're participants in
- User verification is done using Supabase auth

## Message Types

- `text`: Regular text messages
- `image`: Image attachments
- `product`: Product cards
- `order`: Order confirmations

## Special Features

1. **Sell Command**: Sellers can create instant checkout links by typing `/sell [amount]`
2. **Typing Indicators**: Real-time typing status
3. **Read Receipts**: Messages marked as read when viewed
4. **File Uploads**: Support for images and PDFs up to 10MB
5. **Quick Replies**: Pre-defined templates for common responses
6. **Search**: Full-text search across messages and metadata

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "status": 400-500
}
```

## Rate Limiting

- Message sending: 60 messages per minute per user
- File uploads: 10 files per minute per user
- API calls: 100 requests per minute per IP
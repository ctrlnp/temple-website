# Environment Configuration Template

Copy this to your `.env` file and fill in your actual values.

```env
# Database
MONGODB_URI=mongodb://localhost:27017/temple-db

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMS Configuration (choose one service)
# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# MSG91
MSG91_AUTH_KEY=your_msg91_auth_key

# TextLocal
TEXTLOCAL_API_KEY=your_textlocal_api_key

# Admin Phone (required for booking SMS notifications)
ADMIN_PHONE=+919876543210

# Server
PORT=5000
NODE_ENV=development
```

# SMS Setup Guide for Marriage Hall Bookings

This guide explains how to set up SMS notifications for marriage hall booking confirmations.

## Current Setup

The booking system currently logs SMS notifications to the console. To send real SMS messages, you need to configure one of the supported SMS services.

## Supported SMS Services

### 1. Twilio (Recommended)

1. **Sign up** at [Twilio](https://www.twilio.com/)
2. **Get your credentials**:
   - Account SID
   - Auth Token
   - Phone Number (buy one from Twilio)

3. **Install dependency**:
   ```bash
   npm install twilio
   ```

4. **Environment variables** (add to `.env` file):
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ADMIN_PHONE=+919876543210
   ```

5. **Update `src/config/sms.js`**:
   Uncomment the Twilio section and comment out the development logging.

### 2. MSG91

1. **Sign up** at [MSG91](https://msg91.com/)
2. **Get your Auth Key**

3. **Install dependency**:
   ```bash
   npm install axios
   ```

4. **Environment variables**:
   ```env
   MSG91_AUTH_KEY=your_auth_key
   ADMIN_PHONE=+919876543210
   ```

5. **Update `src/config/sms.js`**:
   Uncomment the MSG91 section.

### 3. TextLocal

1. **Sign up** at [TextLocal](https://www.textlocal.com/)
2. **Get your API Key**

3. **Install dependency**:
   ```bash
   npm install axios
   ```

4. **Environment variables**:
   ```env
   TEXTLOCAL_API_KEY=your_api_key
   ADMIN_PHONE=+919876543210
   ```

5. **Update `src/config/sms.js`**:
   Uncomment the TextLocal section.

## SMS Messages

### Admin Notification (sent when booking is submitted):
```
New Booking Alert!
Ref: BK202512001
Event: wedding
Date: 12/25/2025
Time: evening
Guests: 100-200
Contact: John Doe (+919876543210)
Amount: ₹25000
```

### Customer Confirmation (sent when booking is confirmed):
```
Booking Confirmed!
Ref: BK202512001
Event: wedding
Date: 12/25/2025
Time: evening
Venue: Annapurneshwari Temple Marriage Hall
Contact: +919876543210
```

## Testing

After setup, test by:
1. Visiting `http://localhost:3000/booking`
2. Filling out and submitting a booking form
3. Check server console for SMS logs (or actual SMS delivery)

## Troubleshooting

- Ensure phone numbers are in international format (+91...)
- Check SMS service account balance/credits
- Verify API keys and credentials
- Check server logs for error messages

## Cost Estimation

- **Twilio**: ~$0.05-0.10 per SMS
- **MSG91**: ~₹0.20-0.50 per SMS
- **TextLocal**: ~₹0.50-1.00 per SMS

Choose based on your location and pricing.

// SMS Configuration
// Replace with your preferred SMS service provider

const sendSMS = async (phoneNumber, message) => {
  try {
    // Example configurations for popular SMS services:

    // 1. Twilio Configuration (recommended)
    /*
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    return { success: true, messageId: result.sid };
    */

    // 2. MSG91 Configuration
    /*
    const axios = require('axios');
    const response = await axios.post('https://api.msg91.com/api/v2/sendsms', {
      sender: 'TEMPLE',
      route: '4',
      country: '91',
      sms: [{
        message: message,
        to: [phoneNumber.replace('+91', '')]
      }]
    }, {
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json'
      }
    });

    return { success: true, messageId: response.data.request_id };
    */

    // 3. TextLocal Configuration
    /*
    const axios = require('axios');
    const response = await axios.post('https://api.textlocal.in/send/', null, {
      params: {
        apikey: process.env.TEXTLOCAL_API_KEY,
        numbers: phoneNumber.replace('+91', ''),
        message: message,
        sender: 'TXTLCL'
      }
    });

    return { success: true, messageId: response.data.messages[0].id };
    */

    // For now, just log the SMS (development mode)
    console.log('📱 SMS Notification:');
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log('---');

    return { success: true, messageId: `dev-${Date.now()}` };

  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };

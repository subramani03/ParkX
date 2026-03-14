const twilio = require("twilio");
const axios = require("axios");
const FormData = require("form-data");

const getTwilioConfig = () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  imgbbApiKey: process.env.IMGBB_API_KEY, // User will need to add this to .env
});

let client = null;

const initTwilio = () => {
  const { accountSid, authToken } = getTwilioConfig();
  
  if (accountSid && authToken) {
    if (!accountSid.startsWith("AC")) {
      console.warn("⚠️  WARNING: TWILIO_ACCOUNT_SID should start with 'AC'. Your SID starts with: " + accountSid.substring(0, 2));
      console.warn("💡 Hint: Find your Account SID on the Twilio Console Dashboard.");
    }
    try {
      client = twilio(accountSid, authToken);
      console.log("✅ Twilio WhatsApp service initialized");
      return true;
    } catch (err) {
      console.error("❌ Twilio initialization failed:", err.message);
      return false;
    }
  }
  console.log("⚠️ Twilio credentials not configured - WhatsApp disabled");
  return false;
};

const formatWhatsAppNumber = (phone) => {
  if (!phone) return null;
  const cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
};

/**
 * Uploads a base64 image string to ImgBB and returns the public URL
 * @param {string} base64String 
 * @returns {Promise<string|null>}
 */
const uploadImage = async (base64String) => {
  const { imgbbApiKey } = getTwilioConfig();
  
  if (!imgbbApiKey) {
    console.warn("⚠️ IMGBB_API_KEY missing in .env - WhatsApp image sending disabled");
    return null;
  }

  try {
    // Remove the data:image/png;base64, prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    
    const form = new FormData();
    form.append("image", base64Data);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, form, {
      headers: form.getHeaders(),
    });

    return response.data.data.url;
  } catch (error) {
    console.error("❌ Image upload failed:", error.response?.data?.error?.message || error.message);
    return null;
  }
};

const sendParkingTicket = async (phone, billData, qrDataUrl) => {
  if (!client) {
    return { success: false, reason: "not_configured" };
  }

  try {
    const formattedPhone = formatWhatsAppNumber(phone);
    const { whatsappNumber } = getTwilioConfig();
    
    let mediaUrl = null;
    if (qrDataUrl) {
      mediaUrl = await uploadImage(qrDataUrl);
    }
    
    const messageContent = `🅿️ *ParkX PARKING TICKET*
━━━━━━━━━━━━━━━━━━

🚗 *Vehicle:* ${billData.vehicleNumber}
📍 *Slot:* ${billData.slotNumber}
📞 *Phone:* ${billData.phone}

🕐 *Entry Time:*
${new Date(billData.entryTime).toLocaleString("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
})}

━━━━━━━━━━━━━━━━━━
📌 *Instructions:*
• Keep this ticket safe
• Show QR code at exit gate
• Charges: ₹20/day

Thank you for choosing ParkX! 🙏`;

    const messageOptions = {
      body: messageContent,
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${formattedPhone}`,
    };

    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }

    const result = await client.messages.create(messageOptions);

    console.log(`✅ WhatsApp ticket sent to ${formattedPhone}: ${result.sid}`);
    if (mediaUrl) console.log(`🖼️  Image included: ${mediaUrl}`);
    
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("❌ WhatsApp send failed:", error.message);
    return { success: false, error: error.message };
  }
};

const sendExitReceipt = async (phone, billData, receiptDataUrl) => {
  if (!client) {
    return { success: false, reason: "not_configured" };
  }

  try {
    const formattedPhone = formatWhatsAppNumber(phone);
    const { whatsappNumber } = getTwilioConfig();
    
    let mediaUrl = null;
    if (receiptDataUrl) {
      mediaUrl = await uploadImage(receiptDataUrl);
    }

    const formatDuration = (minutes) => {
      if (!minutes) return "---";
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ${minutes % 60}m`;
      const days = Math.floor(hours / 24);
      return `${days} day(s) ${hours % 24}h`;
    };

    const messageContent = `🅿️ *ParkX EXIT RECEIPT*
━━━━━━━━━━━━━━━━━━

🚗 *Vehicle:* ${billData.vehicleNumber}
📍 *Slot:* ${billData.slotNumber}

🕐 *Entry:* ${new Date(billData.entryTime).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
🕐 *Exit:* ${new Date(billData.exitTime).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}

⏱️ *Duration:* ${formatDuration(billData.durationMinutes)}

💰 *Amount Paid:* ₹${billData.amount || 0}

━━━━━━━━━━━━━━━━━━
Thank you for parking with ParkX! 🙏
Drive safe! 🚗`;

    const messageOptions = {
      body: messageContent,
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${formattedPhone}`,
    };

    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }

    const result = await client.messages.create(messageOptions);

    console.log(`✅ Exit receipt sent to ${formattedPhone}: ${result.sid}`);
    if (mediaUrl) console.log(`🖼️  Image included: ${mediaUrl}`);
    
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("❌ Exit receipt send failed:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { initTwilio, sendParkingTicket, sendExitReceipt };

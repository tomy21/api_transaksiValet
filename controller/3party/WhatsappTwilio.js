import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendWhatsapp = async (req, res) => {
  const { to, message } = req.body;

  try {
    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Nomor WhatsApp Twilio Anda
      to: `whatsapp:${to}`, // Nomor tujuan dengan format WhatsApp
    });
    res.json({ success: true, sid: response.sid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

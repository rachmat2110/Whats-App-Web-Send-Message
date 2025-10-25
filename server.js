import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "OK" : "MISSING");

app.post("/send-whatsapp", async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: "Nomor HP dan pesan wajib diisi" });
    }

    const formattedPhone = phone.startsWith("whatsapp:")
      ? phone
      : `whatsapp:${phone.startsWith("62") ? phone : "62" + phone.replace(/^0/, "")}`;

    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: formattedPhone,
      body: message,
    });

    console.log("Pesan terkirim:", response.sid);
    res.json({ success: true, sid: response.sid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengirim pesan" });
  }
});

app.listen(3000, () => console.log("Server berjalan di http://localhost:3000"));

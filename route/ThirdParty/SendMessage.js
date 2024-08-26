import express from "express";
import { sendWhatsapp } from "../../controller/3party/WhatsappTwilio.js";

const router = express.Router();

router.post("/send-whatsapp", sendWhatsapp);

export default router;

import express from "express";
import {
  getAllGates,
  getGateById,
  createGate,
  updateGate,
  deleteGate,
} from "../../controller/Ccc/GateController.js";

const router = express.Router();

// Route HTTP untuk Gate
router.get("/gates", (req, res) => getAllGates(req, res));
router.get("/gates/:id", (req, res) => getGateById(req, res));
router.post("/gates", (req, res) => createGate(req, res));
router.put("/gates/:id", (req, res) => updateGate(req, res));
router.delete("/gates/:id", (req, res) => deleteGate(req, res));

// Fungsi untuk mengirim notifikasi WebSocket ke semua client
// export const notifyGateUpdate = (wss, gateData) => {
//   wss.clients.forEach((client) => {
//     if (client.readyState === 1) {
//       // Jika koneksi WebSocket masih terbuka
//       client.send(JSON.stringify(gateData)); // Kirim data ke client WebSocket
//     }
//   });
// };

export default router;

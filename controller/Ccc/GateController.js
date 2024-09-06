import { Gate } from "../../models/OCC/Gate.js";
import { LocationCCC } from "../../models/OCC/Location.js";
import { notifyGateUpdate } from "../../route/OCC/GateRoutes.js";

// Get All Gates
export const getAllGates = async (req, res) => {
  try {
    const gates = await Gate.findAll();

    // Kirim ke semua WebSocket client
    notifyGateUpdate(req.wss, gates); // Memastikan req.wss digunakan
    res.status(200).json(gates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Gate By ID
export const getGateById = async (req, res) => {
  try {
    const gate = await Gate.findByPk(req.params.id, {
      include: [
        {
          model: LocationCCC,
          as: "location", // Alias sesuai yang ditentukan pada relasi
          attributes: ["Name"], // Menyertakan hanya kolom Name
        },
      ],
    });
    if (!gate) {
      return res.status(404).json({ message: "Gate not found" });
    }

    // Kirim ke semua WebSocket client
    // console.log(req.wss);
    notifyGateUpdate(req.wss, gate);
    res.status(200).json(gate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a New Gate
export const createGate = async (req, res) => {
  const { id_location, gate, channel_cctv, arduino, id_tele } = req.body;

  try {
    const newGate = await Gate.create({
      id_location,
      gate,
      channel_cctv,
      arduino,
      id_tele,
    });

    // Kirim ke semua WebSocket client setelah pembuatan gate
    notifyGateUpdate(req.wss, newGate); // Memastikan req.wss digunakan

    res.status(201).json(newGate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Gate By ID
export const updateGate = async (req, res) => {
  const { id_location, gate, channel_cctv, arduino, id_tele } = req.body;

  try {
    const existingGate = await Gate.findByPk(req.params.id);
    if (!existingGate) {
      return res.status(404).json({ message: "Gate not found" });
    }

    // Update fields
    existingGate.id_location = id_location;
    existingGate.gate = gate;
    existingGate.channel_cctv = channel_cctv;
    existingGate.arduino = arduino;
    existingGate.id_tele = id_tele;

    await existingGate.save();

    // Kirim ke semua WebSocket client setelah update
    notifyGateUpdate(req.wss, existingGate); // Memastikan req.wss digunakan

    res.status(200).json(existingGate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Gate By ID (Soft Delete)
export const deleteGate = async (req, res) => {
  try {
    const gate = await Gate.findByPk(req.params.id);
    if (!gate) {
      return res.status(404).json({ message: "Gate not found" });
    }

    await gate.destroy();

    // Kirim notifikasi penghapusan melalui WebSocket
    notifyGateUpdate(req.wss, {
      message: `Gate with ID ${req.params.id} deleted`,
    }); // Memastikan req.wss digunakan

    res.status(200).json({ message: "Gate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import { Op } from "sequelize";
import { Gate } from "../../models/OCC/Gate.js";
import { LocationCCC } from "../../models/OCC/Location.js";
import { notifyGateUpdate } from "../../route/OCC/GateRoutes.js";

// Get All Gates
export const getAllGates = async (req, res) => {
  try {
    // Ambil query params untuk pagination, search, dan sorting
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "id",
      order = "asc",
    } = req.query;

    // Validasi order, hanya menerima 'asc' atau 'desc'
    const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

    // Query untuk pagination
    const offset = (page - 1) * limit;

    // Kondisi pencarian (search by gate name or location Name in LocationCCC)
    const whereCondition = {
      [Op.or]: [
        { gate: { [Op.like]: `%${search}%` } }, // Search by gate name
        { "$location.Name$": { [Op.like]: `%${search}%` } }, // Search by location.Name (kolom 'Name' dari LocationCCC)
      ],
    };

    // Query database dengan pagination, search, dan sorting
    const { rows: gates, count: total } = await Gate.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: LocationCCC,
          as: "location",
          attributes: ["Name"], // Pastikan ini field yang benar di LocationCCC
        },
      ],
      order: [[sortBy, sortOrder]], // Sorting berdasarkan field dan order (asc/desc)
      offset, // Mulai dari data ke berapa
      limit: parseInt(limit), // Jumlah data yang ditampilkan per halaman
    });

    // Mengirim ke semua WebSocket client
    notifyGateUpdate(req.io, gates);

    // Kirim respons dengan data gates, total data, dan informasi pagination
    res.status(200).json({
      success: true,
      message: "Gates retrieved successfully",
      data: gates,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
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
          as: "location",
          attributes: ["Name"],
        },
      ],
    });
    if (!gate) {
      return res.status(404).json({ message: "Gate not found" });
    }

    req.io.emit("gateViewed", { event: "view", data: gate });

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
    notifyGateUpdate(req.io, { event: "create", data: newGate });

    res.status(201).json(newGate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Gate By ID
export const updateGate = async (req, res) => {
  const { id_location, gate, channel_cctv, arduino, id_tele, statusGate } =
    req.body;

  try {
    const existingGate = await Gate.findByPk(req.params.id);
    if (!existingGate) {
      return res.status(404).json({ message: "Gate not found" });
    }

    // Update only the fields that are provided, keep others as they are
    existingGate.id_location = id_location || existingGate.id_location;
    existingGate.gate = gate || existingGate.gate;
    existingGate.channel_cctv = channel_cctv || existingGate.channel_cctv;
    existingGate.statusGate = statusGate || existingGate.statusGate;
    existingGate.arduino = arduino || existingGate.arduino;
    existingGate.id_tele = id_tele || existingGate.id_tele;

    await existingGate.save();

    // Kirim ke semua WebSocket client setelah update
    notifyGateUpdate(req.io, { event: "update", data: existingGate });
    req.io.emit("gateViewed", { event: "view", data: "gate_Open" });

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
    notifyGateUpdate(req.io, { event: "delete", data: { id: req.params.id } });

    res.status(200).json({ message: "Gate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

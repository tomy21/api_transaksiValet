import { Issues } from "../../models/OCC/Issues.js";
import { generateTicketNumber } from "./Generate.js"; // Helper untuk membuat tiket

// CREATE Issue
export const createIssue = async (req, res) => {
  const {
    idLocation,
    category,
    lokasi,
    description,
    id_gate,
    action,
    foto,
    number_plate,
    status,
  } = req.body;
  console.log(req.body);
  try {
    // Buat nomor tiket
    const ticket = await generateTicketNumber(idLocation);

    const newIssue = await Issues.create({
      ticket,
      category,
      lokasi,
      description,
      id_gate,
      action,
      foto,
      number_plate,
      status,
    });

    res.status(201).json({
      status: "success",
      data: newIssue,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// READ All Issues
export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issues.findAll();
    res.status(200).json({
      status: "success",
      data: issues,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// READ Single Issue by ID
export const getIssueById = async (req, res) => {
  const { id } = req.params;

  try {
    const issue = await Issues.findByPk(id);
    if (!issue) {
      return res.status(404).json({
        status: "fail",
        message: "Issue not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: issue,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// UPDATE Issue
export const updateIssue = async (req, res) => {
  const { id } = req.params;
  const {
    category,
    lokasi,
    description,
    id_gate,
    action,
    foto,
    number_plate,
    status,
  } = req.body;

  try {
    const issue = await Issues.findByPk(id);
    if (!issue) {
      return res.status(404).json({
        status: "fail",
        message: "Issue not found",
      });
    }

    // Update data issue
    issue.category = category || issue.category;
    issue.lokasi = lokasi || issue.lokasi;
    issue.description = description || issue.description;
    issue.id_gate = id_gate || issue.id_gate;
    issue.action = action || issue.action;
    issue.foto = foto || issue.foto;
    issue.number_plate = number_plate || issue.number_plate;
    issue.status = status || issue.status;

    await issue.save();

    res.status(200).json({
      status: "success",
      data: issue,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// DELETE Issue
export const deleteIssue = async (req, res) => {
  const { id } = req.params;

  try {
    const issue = await Issues.findByPk(id);
    if (!issue) {
      return res.status(404).json({
        status: "fail",
        message: "Issue not found",
      });
    }

    await issue.destroy(); // Soft delete jika paranoid: true
    res.status(204).json({
      status: "success",
      message: "Issue deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

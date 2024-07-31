// controllers/trxHistoryController.js
import TrxHistoryMemberProducts from "../../../models/v01/member/TrxHistoryMemberProducts.js";
import MemberUserProduct from "../../../models/v01/member/TrxHistoryMemberProducts.js";

export const createTrxHistory = async (req, res) => {
  try {
    const trxHistory = await TrxHistoryMemberProducts.create(req.body);
    res.status(201).json(trxHistory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllTrxHistories = async (req, res) => {
  try {
    const trxHistories = await TrxHistoryMemberProducts.findAll({
      include: {
        model: MemberUserProduct,
        as: "MemberUserProduct", // Use the alias defined in the association
      },
    });
    console.log(trxHistories);
    res.status(200).json(trxHistories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTrxHistoryById = async (req, res) => {
  try {
    const trxHistory = await TrxHistoryMemberProducts.findByPk(req.params.id, {
      include: {
        model: MemberUserProduct,
        as: "MemberUserProduct", // Use the alias defined in the association
      },
    });
    if (trxHistory) {
      res.status(200).json(trxHistory);
    } else {
      res.status(404).json({ error: "Transaction history not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTrxHistory = async (req, res) => {
  try {
    const trxHistory = await TrxHistoryMemberProducts.findByPk(req.params.id);
    if (trxHistory) {
      await trxHistory.update(req.body);
      res.status(200).json(trxHistory);
    } else {
      res.status(404).json({ error: "Transaction history not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTrxHistory = async (req, res) => {
  try {
    const trxHistory = await TrxHistoryMemberProducts.findByPk(req.params.id);
    if (trxHistory) {
      await trxHistory.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ error: "Transaction history not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

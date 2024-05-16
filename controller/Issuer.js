import { RefIssuer } from "../models/RefIssuer.js";

export const getIssuer = async (req, res) => {
  try {
    const getIssuer = await RefIssuer.findAll({
      attributes: ["Id", "IssuerId", "IssuerName"],
    });
    res.json(getIssuer);
  } catch (error) {
    console.log(error);
  }
};

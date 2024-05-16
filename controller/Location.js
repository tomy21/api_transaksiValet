import { Location } from "../models/RefLocation.js";

export const getLocationAll = async (req, res) => {
  try {
    const getLocation = await Location.findAll({
      attributes: ["Id", "Code", "Name"],
    });
    res.json(getLocation);
  } catch (error) {
    console.log(error);
  }
};

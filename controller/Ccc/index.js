import { LocationCCC } from "../../models/OCC/Location.js";

export const getLocations = async (req, res) => {
  try {
    const locations = await LocationCCC.findAll();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

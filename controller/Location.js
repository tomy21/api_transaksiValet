import { Location } from "../models/RefLocation.js";
import { UsersLocations } from "../models/UsersLocation.js";

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

export const getLocationUsers = async (req, res) => {
  const userId = req.query.userId;

  try {
    const userLocations = await UsersLocations.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Location,
          attributes: ["Id", "Code", "Name"],
        },
      ],
    });

    const locations = userLocations.map(
      (userLocation) => userLocation.RefLocation
    );

    res.json(locations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

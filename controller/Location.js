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

export const getLocationAllLocation = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || "";
    const offset = (page - 1) * limit;

    const whereCondition = {
      IsMember: 1,
      ...(searchQuery && {
        [Op.or]: [
          { Name: { [Op.like]: `%${searchQuery}%` } },
          { Address: { [Op.like]: `%${searchQuery}%` } },
        ],
      }),
    };

    const getLocation = await Location.findAndCountAll({
      attributes: ["Id", "Code", "Name", "Address"],
      where: whereCondition,
      limit: limit,
      offset: offset,
    });

    res.json({
      success: true,
      total: getLocation.count,
      page: page,
      pages: Math.ceil(getLocation.count / limit),
      data: getLocation.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
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

import { UsersToken } from "../models/UsersToken.js";
import { Users } from "../models/Users.js";
import jwt from "jsonwebtoken";
import { UsersLocations } from "../models/UsersLocation.js";
import { Location } from "../models/RefLocation.js";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = await UsersToken.findAll({
      where: {
        RefreshToken: refreshToken,
      },
    });
    const users = await Users.findAll({
      where: {
        Id: user[0].UserId,
      },
    });

    const LocationData = await UsersLocations.findAll({
      where: {
        UserId: user[0].UserId,
      },
      include: [
        {
          model: Location,
          attributes: ["Name"],
        },
      ],
    });
    if (!user[0]) return res.sendStatus(403);
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);
        const userId = user[0].UserId;
        const name = users[0].Name;
        const email = users[0].Email;
        const locationCode = LocationData[0].LocationCode;
        const locationName = LocationData[0].RefLocation.Name;
        const accessToken = jwt.sign(
          { userId, name, email, locationCode, locationName },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15s",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

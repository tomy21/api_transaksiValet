import { Location } from "../../RefLocation.js";
import MemberProduct from "./ProductMember.js";

export function initAssociations() {
  MemberProduct.belongsTo(Location, {
    foreignKey: "LocationCode",
    targetKey: "Code",
    as: "Location",
  });

  Location.hasMany(MemberProduct, {
    foreignKey: "LocationCode",
    sourceKey: "Code",
    as: "Products",
  });
}

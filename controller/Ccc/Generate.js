import moment from "moment";

export const generateTicketNumber = async (id_lokasi) => {
  const datePart = moment().format("MMDDYY");

  const count = await Issues.count({
    where: {
      lokasi: id_lokasi,
      createdAt: {
        [Op.between]: [
          moment().startOf("day").toDate(),
          moment().endOf("day").toDate(),
        ],
      },
    },
  });

  const sequence = (count + 1).toString().padStart(3, "0");
  return `${datePart}${id_lokasi}${sequence}`;
};

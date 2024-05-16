import { Qris } from "../models/RefQris.js";

export const getQrisAll = async (req, res) => {
  try {
    const getQris = await Qris.findAll();
    res.json(getQris);
  } catch (error) {
    console.log(error);
  }
};

export const QrisDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Qris.findOne({
      where: {
        Id: id,
      },
      attributes: [
        "LocationCode",
        "TypeValet",
        "Name",
        "QrisCode",
        "NMID",
        "Tariff",
        "CreatedBy",
        "CreatedOn",
        "UpdatedOn",
      ],
    });
    const response = {
      statusCode: 200,
      message: "Data berhasil diambil",
      data: data,
    };
    res.json(response);
  } catch (error) {
    console.log(error);
  }
};

export const addQris = async (req, res) => {
  try {
    const { LocationCode, TypeValet, Name, QrisCode, NMID, Tariff, CreatedBy } =
      req.body;
    await Qris.create({
      LocationCode: LocationCode,
      TypeValet: TypeValet,
      Name: Name,
      QrisCode: QrisCode,
      NMID: NMID,
      Tariff: Tariff,
      CreatedBy: CreatedBy,
    });
    await res.json({ msg: "register berhasil" });
  } catch (error) {
    console.log(error);
  }
};

export const updatedQris = async (req, res) => {
  const { id } = req.params;
  try {
    const { LocationCode, TypeValet, Name, QrisCode, NMID, Tariff } = req.body;
    await Qris.update(
      {
        LocationCode: LocationCode,
        TypeValet: TypeValet,
        Name: Name,
        QrisCode: QrisCode,
        NMID: NMID,
      },
      {
        where: { Id: id },
      }
    );
    await res.json({ msg: "Qris berhasil diupdate" });
  } catch (error) {
    console.log(error);
  }
};

export const softDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const qrisId = await Qris.findByPk(id);
    if (qrisId) {
      await qrisId.update({
        RecordStatus: 0,
        DeletedOn: new Date(),
        DeletedBy: "admin",
      });
      res.json({ msg: "Qris berhasil dihapus secara soft." });
    } else {
      res.status(404).json({ error: "Data tidak ditemukan." });
    }
    await res.json({ msg: "Qris berhasil di delete" });
  } catch (error) {
    console.log(error);
  }
};

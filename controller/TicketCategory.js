import { TicketCategory } from "../models/RefTicketCategory.js";

export const getAllCategory = async (req, res) => {
  try {
    const getTicketCategory = await TicketCategory.findAll();
    res.json(getTicketCategory);
  } catch (error) {
    console.log(error);
  }
};

export const CategoryDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await TicketCategory.findOne({
      where: {
        Id: id,
      },
      attributes: ["Code", "Name", "CreatedBy", "CreatedOn", "UpdatedOn"],
    });
    const response = {
      statusCode: 200,
      message: "Get Data Successfuly",
      data: data,
    };
    res.json(response);
  } catch (error) {
    console.log(error);
  }
};

export const addCategory = async (req, res) => {
  try {
    const { Code, Name, CreatedBy } = req.body;
    await TicketCategory.create({
      Code: Code,
      Name: Name,
      CreatedBy: CreatedBy,
    });
    await res.json({ msg: "Add Data Successfuly" });
  } catch (error) {
    console.log(error);
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const { Code, Name, UpdateBy } = req.body;
    await TicketCategory.update(
      {
        Code: Code,
        Name: Name,
        UpdatedBy: UpdateBy,
        RecordStatus: 1,
      },
      {
        where: { Id: id },
      }
    );
    await res.json({ msg: "Update categody successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const softDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const categoryId = await TicketCategory.findByPk(id);
    if (qrisId) {
      await categoryId.update({
        RecordStatus: 0,
        DeletedOn: new Date(),
        DeletedBy: "admin",
      });
      res.json({ msg: "Deleted successfully" });
    } else {
      res.status(404).json({ error: "Data not found." });
    }
  } catch (error) {
    console.log(error);
  }
};

const Lead = require("../models/Lead");

// Create Lead
const createLead = async (req, res) => {
  try {
    const { customerName, customerPhone, source, product, productName } =
      req.body;

    const lead = await Lead.create({
      customerName,
      customerPhone,
      source,
      product,
      productName,
    });

    res.status(201).json({
      message: "Lead captured successfully",
      lead,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .populate("product", "name");

    res.status(200).json(leads);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
};

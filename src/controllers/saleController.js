const Sale = require("../models/Sale");

// get all sales
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ saleDate: -1 });

    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// get single sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    res.status(200).json(sale);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      message: err.message,
    });
  }
};

//ANALYTICS
//getting top products
const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Sale.aggregate([
      {
        $group: {
          _id: "$productName",

          unitsSold: {
            $sum: "$quantity",
          },

          revenue: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $project: {
          _id: 0,
          productName: "$_id",
          unitsSold: 1,
          revenue: 1,
        },
      },

      {
        $sort: {
          unitsSold: -1,
          revenue: -1,
        },
      },
    ]);

    res.status(200).json(topProducts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//getting revenue trends
const getRevenueTrends = async (req, res) => {
  try {
    const trends = await Sale.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$saleDate",
            },

            month: {
              $month: "$saleDate",
            },
          },

          revenue: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const formattedTrends = trends.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      revenue: item.revenue,
    }));

    res.status(200).json(formattedTrends);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

//getting sales breakdown BY PRODUCT LINE (Shoes / Bags / Clothes) — the
//boutique equivalent of Gleamy's "which furniture line drives our revenue".
//Sale only stores a productName snapshot, so we hop Sale -> Product -> Category
//via two $lookups to reach productType.
const getSalesBreakdown = async (req, res) => {
  try {
    const breakdown = await Sale.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: {
          path: "$productInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $unwind: {
          path: "$categoryInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$categoryInfo.productType", "Uncategorized"] },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          productType: "$_id",
          count: 1,
          revenue: 1,
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ]);

    // Returns an ARRAY of { productType, count, revenue }
    res.status(200).json(breakdown);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// getting customer history
const getCustomerHistory = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    const sales = await Sale.find({
      customerPhone: phone,
    }).sort({
      saleDate: -1,
    });

    if (sales.length === 0) {
      return res.status(404).json({
        message: "No sales found for this customer",
      });
    }

    const totalSpent = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    res.status(200).json({
      customerName: sales[0].customerName,
      customerPhone: phone,

      totalPurchases: sales.length,

      totalSpent,

      purchases: sales,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getAllSales,
  getSaleById,
  getTopProducts,
  getRevenueTrends,
  getSalesBreakdown,
  getCustomerHistory,
};

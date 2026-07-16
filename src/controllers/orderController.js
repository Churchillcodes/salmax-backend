const Order = require("../models/Order");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const normalizeText = require("../utils/normalizeText");

// creating an order
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerLocation,
      product,
      size,
      quantity,
      agreedPrice,
      notes,
    } = req.body;

    if (!product) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (!size) {
      return res.status(400).json({ message: "Size is required" });
    }

    const existingProduct = await Product.findById(product);
    if (!existingProduct || !existingProduct.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const sizeEntry = existingProduct.sizes.find((s) => s.size === size);
    if (!sizeEntry) {
      return res
        .status(400)
        .json({ message: `Size "${size}" is not available for this product` });
    }

    const qty = Number(quantity) || 1;

    if (qty <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than zero",
      });
    }

    if (sizeEntry.quantity < qty) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for this size" });
    }

    if (!agreedPrice || agreedPrice <= 0) {
      return res.status(400).json({
        message: "Valid agreed price is required",
      });
    }

    const order = await Order.create({
      customerName,
      customerPhone,
      customerLocation,
      product,
      size,
      quantity: qty,
      listedPrice: existingProduct.listedPrice,
      agreedPrice,
      notes,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    res.status(500).json({
      message: err.message,
    });
  }
};

// getting all orders
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.status = normalizeText(status);
    }

    const orders = await Order.find(filter)
      .populate("product", "name listedPrice")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// get an order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate(
      "product",
      "name listedPrice category",
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
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

// updating our order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Ready",
      "Delivered",
      "Cancelled",
    ];
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    status = normalizeText(status);

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({
        message: `Order is already ${order.status}`,
      });
    }

    const product = await Product.findById(order.product);

    if (!product) {
      return res.status(404).json({
        message: "Associated product not found",
      });
    }

    // Single linear flow since Salmax is inventory-only - no branching by
    // orderType like Gleamy needed for its custom-order path.
    const validTransitions = {
      Pending: ["Confirmed", "Cancelled"],
      Confirmed: ["Ready", "Cancelled"],
      Ready: ["Delivered", "Cancelled"],
      Delivered: [],
      Cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot move from ${order.status} to ${status}`,
      });
    }

    /*
      Pending -> Confirmed
      Reserve stock by deducting from the ordered size
    */
    if (order.status === "Pending" && status === "Confirmed") {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: product._id,
          sizes: {
            $elemMatch: {
              size: order.size,
              quantity: { $gte: order.quantity },
            },
          },
        },
        {
          $inc: {
            "sizes.$.quantity": -order.quantity,
          },
        },
        {
          new: true,
        },
      );

      if (!updatedProduct) {
        return res.status(400).json({
          message: "Insufficient stock for this size",
        });
      }
    }

    /*
      Confirmed/Ready -> Cancelled
      Return reserved stock to that size
    */
    if (
      ["Confirmed", "Ready"].includes(order.status) &&
      status === "Cancelled"
    ) {
      await Product.findOneAndUpdate(
        { _id: product._id, "sizes.size": order.size },
        { $inc: { "sizes.$.quantity": order.quantity } },
      );
    }

    /*
      Ready -> Delivered
      Create permanent sales record
    */
    if (order.status === "Ready" && status === "Delivered") {
      const existingSale = await Sale.findOne({
        order: order._id,
      });

      if (!existingSale) {
        await Sale.create({
          order: order._id,
          product: product._id,

          productName: product.name,
          size: order.size,

          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerLocation: order.customerLocation,

          quantity: order.quantity,

          listedPrice: order.listedPrice,
          agreedPrice: order.agreedPrice,

          totalAmount: order.quantity * order.agreedPrice,

          saleDate: new Date(),
        });
      }
    }
    const previousStatus = order.status;
    order.status = status;

    await order.save();

    console.log({
      from: previousStatus,
      to: status,
      size: order.size,
      quantity: order.quantity,
    });

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
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

// cancelling an order
const cancelOrder = async (req, res) => {
  try {
    req.body = {
      ...(req.body || {}),
      status: "Cancelled",
    };

    return updateOrderStatus(req, res);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};

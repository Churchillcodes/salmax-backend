require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/dbConn");

const Category = require("../src/models/Category");
const Product = require("../src/models/Product");

if (process.env.NODE_ENV === "production") {
  console.error("Seeding is disabled in production.");
  process.exit(1);
}

const seed = async () => {
  try {
    await connectDB();

    await mongoose.connection.dropDatabase();

    const categories = await Category.insertMany([
      {
        name: "Sneakers",
        productType: "Shoes",
        group: "Men",
        isActive: true,
      },
      {
        name: "Heels",
        productType: "Shoes",
        group: "Ladies",
        isActive: true,
      },
      {
        name: "Handbags",
        productType: "Bags",
        group: null,
        isActive: true,
      },
      {
        name: "Dresses",
        productType: "Clothes",
        group: "Women",
        isActive: true,
      },
    ]);

    await Product.insertMany([
      {
        name: "Classic Sneakers",
        category: categories[0]._id,
        description: "A versatile pair of everyday sneakers for men.",
        listedPrice: 2500,
        negotiable: true,
        sizes: [
          { size: "42", quantity: 10 },
          { size: "43", quantity: 5 },
        ],
        colors: ["Black", "White"],
        images: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            publicId: "sample-1",
          },
        ],
        isActive: true,
      },
      {
        name: "Elegant Heels",
        category: categories[1]._id,
        description: "Stylish heels designed for evening wear.",
        listedPrice: 3200,
        negotiable: false,
        sizes: [
          { size: "36", quantity: 4 },
          { size: "38", quantity: 6 },
        ],
        colors: ["Nude", "Black"],
        images: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/sample2.jpg",
            publicId: "sample-2",
          },
        ],
        isActive: true,
      },
      {
        name: "Leather Handbag",
        category: categories[2]._id,
        description: "Premium leather handbag with roomy compartments.",
        listedPrice: 4500,
        negotiable: true,
        sizes: [{ size: "One Size", quantity: 8 }],
        colors: ["Brown", "Tan"],
        images: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/sample3.jpg",
            publicId: "sample-3",
          },
        ],
        isActive: true,
      },
      {
        name: "Floral Dress",
        category: categories[3]._id,
        description: "Lightweight floral dress for casual outings.",
        listedPrice: 2800,
        negotiable: true,
        sizes: [{ size: "M", quantity: 7 }],
        colors: ["Pink", "Blue"],
        images: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/sample4.jpg",
            publicId: "sample-4",
          },
        ],
        isActive: true,
      },
    ]);

    console.log("Seed data inserted successfully");
    console.log("No users were created.");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seed();

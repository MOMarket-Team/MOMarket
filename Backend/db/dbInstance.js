require("dotenv").config();
const mongoose = require("mongoose");

const dbInstanceConnection = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://khabertkcca:Khabert%2311@cluster0.mzb08dh.mongodb.net/kcca_online_marketing"
    );
    console.log("connection successful");
  } catch (error) {
    console.log(error);
    console.log("connection failed");
  }
};
module.exports = dbInstanceConnection;

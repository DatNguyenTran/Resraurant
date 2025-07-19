const mongoose = require("mongoose");
const dbUri = process.env.DB_URI;
async function connect() {
  try {
    console.log("Connect success!!!");
    await mongoose.connect(dbUri);
  } catch (error) {
    console.log("Connect failure!!!");
  }
}
module.exports = { connect };

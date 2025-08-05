const app = require("../src/app.js");
const connectDB = require("../src/infra/mongoose/mongooseConect.js");

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};

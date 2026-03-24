const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
};
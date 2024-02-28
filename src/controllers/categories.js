const pool = require("../connection");

const listCategories = async (req, res) => {
  try {
    const { rows: categories } = await pool.query(`select * from categories`);

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  listCategories,
};

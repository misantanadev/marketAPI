const pool = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtPassword = require("../jwtPassword");

const register = async (req, res) => {
  const { store_name, email, password } = req.body;

  if (!store_name || !email || !password) {
    return res.status(400).json({
      message: "All fields (store name, email and password) are required!",
    });
  }

  try {
    const emailExists = await pool.query(
      "select * from users where email = $1",
      [email]
    );

    if (emailExists.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "A user with the provided email already exists!" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const query = `insert into users ( store_name, email, password) values ($1, $2, $3) returning *`;

    const { rows } = await pool.query(query, [
      store_name,
      email,
      encryptedPassword,
    ]);

    const { password: _, ...users } = rows[0];

    return res.status(201).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      mensagem: "All fields (email and password) are required!",
    });
  }

  try {
    const { rows, rowCount } = await pool.query(
      "select * from users where email = $1",
      [email]
    );

    if (rowCount === 0) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const { password: userPassword, ...user } = rows[0];

    const correctPassword = await bcrypt.compare(password, userPassword);

    if (!correctPassword) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const token = jwt.sign({ id: user.id }, jwtPassword, {
      expiresIn: "8h",
    });

    return res.json({
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  register,
  login,
};

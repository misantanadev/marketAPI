const jwt = require("jsonwebtoken");
const pool = require("../connection");
const jwtPassword = require("../jwtPassword");

const verifyLogin = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(401)
      .json({ message: "A valid authentication token is required." });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id } = jwt.verify(token, jwtPassword);

    const { rows, rowCount } = await pool.query(
      "select * from users where id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res
        .status(401)
        .json({ message: "A valid authentication token is required." });
    }

    const { password, ...user } = rows[0];

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "A valid authentication token is required." });
  }
};

module.exports = verifyLogin;

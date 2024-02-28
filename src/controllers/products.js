const pool = require("../connection");
const { uploadFile, deleteFile } = require("../storage");
const { randomUUID } = require("node:crypto");

const listProducts = async (req, res) => {
  try {
    const { rows: products } = await pool.query(`select * from products`);

    if (products.rowCount === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const registerProduct = async (req, res) => {
  const { originalname, buffer, mimetype } = req.file;
  const { name, stock, price, category_id, description } = req.body;

  if (!name || !stock || !price || !category_id || !description || !buffer) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const { rows: categories } = await pool.query(`select * from categories`);

  const validCategory = categories.find(
    (category) => category.id === Number(category_id)
  );

  if (!validCategory) {
    return res
      .status(400)
      .json({ message: "The provided category is not valid!" });
  }

  try {
    const imageContent = await uploadFile(
      `imagens/${randomUUID()}/${originalname}`,
      buffer,
      mimetype
    );

    const query = `insert into products (user_id, name, stock, price, category, description, image) values ($1, $2, $3, $4, $5, $6, $7) returning *`;

    const params = [
      req.user.id,
      name,
      stock,
      price,
      validCategory.description,
      description,
      imageContent.url,
    ];

    const { rows } = await pool.query(query, params);

    const product = {
      ...rows[0],
      category_name: validCategory.description,
    };

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const detailProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows, rowCount } = await pool.query(
      `select * from products where id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    const product = rows[0];

    return res.status(200).json({
      ...product,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { originalname, buffer, mimetype } = req.file;
  const { name, stock, price, category_id, description } = req.body;

  const { rows: categories } = await pool.query(`select * from categories`);

  const validCategory = categories.find(
    (category) => category.id === Number(category_id)
  );

  if (!validCategory) {
    return res
      .status(400)
      .json({ message: "The provided category is not valid!" });
  }

  try {
    const { rowCount } = await pool.query(
      `select from products where id = $1 and user_id = $2`,
      [id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    if (!name || !stock || !price || !category_id || !description || !buffer) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const imageContent = await uploadFile(
      `imagens/${randomUUID()}/${originalname}`,
      buffer,
      mimetype
    );

    const query = `update products set name = $1, stock = $2, price = $3, category = $4, description = $5, image = $6 where id = $7 and user_id = $8 returning *`;

    const params = [
      name,
      stock,
      price,
      validCategory.description,
      description,
      imageContent.url,
      id,
      req.user.id,
    ];

    const { rows } = await pool.query(query, params);

    return res.status(204).send(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount, rows } = await pool.query(
      `delete from products where id = $1 and user_id = $2 returning *`,
      [id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    const deletedProduct = rows[0];

    await deleteFile(deletedProduct.image);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  listProducts,
  registerProduct,
  detailProduct,
  updateProduct,
  deleteProduct,
};

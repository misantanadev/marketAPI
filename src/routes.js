const express = require("express");
const { login, register } = require("./controllers/users");
const {
  registerProduct,
  listProducts,
  detailProduct,
  updateProduct,
  deleteProduct,
} = require("./controllers/products");
const multer = require("./multer");
const { listCategories } = require("./controllers/categories");
const verifyLogin = require("./middlewares/verifyLogin");

const routes = express();

routes.post("/login", login);
routes.post("/register", register);
routes.get("/products", listProducts);
routes.get("/product/:id", detailProduct);

routes.use(verifyLogin);

routes.post("/product", multer.single("image"), registerProduct);
routes.delete("/product/:id", deleteProduct);
routes.put("/product/:id", multer.single("image"), updateProduct);
routes.get("/category", listCategories);

module.exports = routes;

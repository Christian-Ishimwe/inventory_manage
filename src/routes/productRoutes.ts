import express from "express"
import { getAllProducts, getProductById, deleteProduct, updateProduct, createProduct } from "../controllers/productController";

const productRoutes = express.Router();

productRoutes.get("/", getAllProducts)
productRoutes.get("/:id", getProductById)
productRoutes.post("/", createProduct)
productRoutes.delete("/:id", deleteProduct)
productRoutes.patch("/:id", updateProduct)


export default productRoutes
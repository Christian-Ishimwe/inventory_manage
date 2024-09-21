import express from "express"
import isLoggedIn from "../middleware/loggedIn";
import { getAllSales, getSaleById, createSale } from "../controllers/salesController";
const salesRoutes = express.Router();


salesRoutes.get("/",getAllSales )
salesRoutes.get("/:id", getSaleById)
salesRoutes.post("/", createSale)

export default salesRoutes
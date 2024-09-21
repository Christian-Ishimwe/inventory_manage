import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import prisma from './utils/prismaDb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import isLoggedIn from './middleware/loggedIn';
import salesRoutes from './routes/salesRoutes';
import productRoutes from './routes/productRoutes';
dotenv.config();

const app= express();
const PORT= process.env.PORT || 3000;
app.use(bodyParser.json())

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({message: "Welcome to Inventory Management API"})
});


app.post("/register", async (req: Request, res: Response) => {
    const {username, password,email} = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({message: "Please provide all credentials"});
    }
    try{
        const hashedPassword= await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
        await prisma.user.create({data: {username, password:hashedPassword, email}});
        return res.status(201).json({message: "User Registered  successfully"});
    }catch(e:any){
        if(e.code === "P2002"){
            return res.status(409).json({message: "User already exists"});
        }
        return res.status(500).json({message: "Something went wrong"});
    }
})

app.post("/login", async (req: Request, res: Response) => {
    const {username, password} = req.body;
    if(!username || !password){
        return res.status(400).json({message: "Please provide  username and password"});
    }
    try{
        const user = await prisma.user.findUnique({where: {username}});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid credentials"});
        }
        const token=jwt.sign({id:user.userId}, process.env.JWT_SECRET_KEY as string, {expiresIn: "10h"});
        return res.status(200).json({message: `Login successful as ${user.username}`, token});
}
    catch(e){
        return res.status(500).json({message: "Something went wrong"});
    }})

app.post("/category", isLoggedIn, async (req: Request, res: Response) => {
    //@ts-ignore
    const data=req.body
    const name= data.name;
    if(!name){
        return res.status(400).json({message: "Please provide category name"});
    }
    const description= data?.description;
    const alreadyExists= await prisma.category.findUnique({where: {name}});
    if(alreadyExists){
        return res.status(409).json({message: "Category already exists"});
    }
    const category= await prisma.category.create({data: {name, description}});
    return res.status(201).json({message: "Category Create Successully", category});
})


app.get("/category", isLoggedIn, async (req: Request, res: Response) => {
    const categories= await prisma.category.findMany();
    if(categories.length === 0){
        return res.status(404).json({message: "No categories found"});
    }
    return res.status(200).json({categories});
})

app.use("/products",isLoggedIn, productRoutes);
app.use("/sales",isLoggedIn,salesRoutes);

// Error handling middleware
app.use((req: Request, res: Response) => {
    return res.status(404).json({message: "Route not found"});
})


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
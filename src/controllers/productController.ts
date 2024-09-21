import prisma from "../utils/prismaDb";
import { Request, Response } from 'express';

export const getAllProducts = async (req: Request, res: Response) => {
    try{
    // @ts-ignore
    const userId= req.user.userId;
    const products= await prisma.product.findMany({where: {userId:userId}});
    if(products.length === 0){
        return res.status(404).json({message: "No products found"});
    }
    return res.status(200).json({products});
    }catch(err:any){
        console.log(err);
        return res.status(500).json({message: "Something went wrong"}); 
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try{
    // @ts-ignore
    const userId= req.user.userId;
    const id= req.params.id;
    const product= await prisma.product.findFirst({where: {userId:userId, productId:id}});
    if(!product){
        return res.status(404).json({message: "Product not found"});
    }
    return res.status(200).json({product});
    }catch(err:any){
        console.log(err);
        return res.status(500).json({message: "Something went wrong"}); 
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try{
    //@ts-ignore
    const userId= req.user.userId;
    const { name, description, price, stock, unit, categoryId, lowStock } = req.body;
    if (!name || !price || !stock || !unit || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newProduct = await prisma.product.create({
    data: {
        name,
        description,
        price,
        stock,
        unit,
        categoryId,
        lowStock,
        userId, 
      },
    });
    return res.status(201).json({newProduct});
    }catch(err:any){
        console.log(err);
        return res.status(500).json({message: "Something went wrong"}); 

    }
    
}

export const deleteProduct = async (req: Request, res: Response) => {
    try{
    // @ts-ignore
    const userId= req.user.userId;
    const id= req.params.id;
    const product= await prisma.product.findFirst({where: {userId:userId, productId:id}});
    if(!product){
        return res.status(404).json({message: "Product not found"});
    }
    await prisma.product.delete({where: {productId:id}});
    return res.status(200).json({message: "Product deleted successfully"});
    }catch(err:any){
        console.log(err);
        return res.status(500).json({message: "Something went wrong"}); 
    }
}

export const updateProduct = async (req: Request, res: Response) => {
     try{
    // @ts-ignore
    const userId= req.user.userId;
    const id= req.params.id;
    const data = req.body;
    if (data === null) {
      return res.status(400).json({ message: 'Nothing to update' });
    }
    const product= await prisma.product.findFirst({where: {userId:userId, productId:id}});
    if(!product){
        return res.status(404).json({message: "Product not found"});
    }
    const updatedProduct= await prisma.product.update({where: {productId:id}, data: data});
    return res.status(200).json({updatedProduct});
    }catch(err:any){
        console.log(err);
        return res.status(500).json({message: "Something went wrong"}); 
    }
}
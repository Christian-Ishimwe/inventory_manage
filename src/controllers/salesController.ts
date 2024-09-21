import { Request, Response } from 'express';

import  prisma from '../utils/prismaDb';

export const getAllSales= async (req: Request, res: Response) => {
    try {
    // @ts-ignore
    const userId = req.user.userId;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    let dateFilter = {};

    if (from && to) {
      dateFilter = { saleDate: { gte: new Date(from), lte: new Date(to) } };
    } else if (from) {
      dateFilter = { saleDate: { gte: new Date(from) } }; 
    } else if (to) {
      dateFilter = { saleDate: { lte: new Date(to) } }; 
    }

    const sales = await prisma.sale.findMany({
      where: { ...dateFilter, userId },
      include: { product: true }
    });

    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales found' });
    }

    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Failed to fetch sales' });
  }
}


export const getSaleById = async (req: Request, res: Response) => {
    try {
    // @ts-ignore
    const userId = req.user.userId;
    const saleId = req.params.id;
    const sale = await prisma.sale.findFirst({
      where: { userId, saleId },
      include: { product: true },
    });
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.status(200).json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ message: 'Failed to fetch sale' });
  }
}

export const createSale = async (req: Request, res: Response) => {
     try {
    const { productId, quantity} = req.body;
    // @ts-ignore
    const userId = req.user.userId;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Missing Product Id or quantity' });
    }

    const product = await prisma.product.findUnique({
      where: { productId, userId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if(product.stock < quantity){
        return res.status(400).json({message: "Not enough stock available"});
    }
    const totalAmount = product.price * quantity;

    const newSale = await prisma.sale.create({
      data: {
        productId,
        userId,
        unitPrice: product.price,
        quantity,
        totalAmount,
      },
    });
    await prisma.product.update({
      where: { productId },
      data: {
        stock: product.stock - quantity,
      },
    });

    res.status(201).json(newSale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Failed to create sale' });
  }
}




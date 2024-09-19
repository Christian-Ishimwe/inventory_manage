import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prismaDb';


const isLoggedIn= async (req: Request, res: Response, next: NextFunction) =>{
    const header= req.headers.authorization
    if(!header){
        return res.status(401).json({message: "Unauthorized"});
    }
    const token = header.split(" ")[1];
    if(!token){
        return res.status(401).json({message: "Token not found"});
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY as string, async (err:any, decoded:any) => {
        if(err){
            return res.status(401).json({message: "Invalid token"});
        } 
        const userId= decoded.id;
        if(!userId){
            return res.status(401).json({message: "Invalid token"});
        }
        const user= await prisma.user.findUnique({where: {userId}});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        //@ts-ignore
        req.user= user
        next()
    })

}  

export default isLoggedIn
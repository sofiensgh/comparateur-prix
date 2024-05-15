"use server"

import { create } from "domain";
import { srapeWebsiteProduct } from "../scrapper";

export async function ScrapAndStoreProduct(productName:string) {
    if(!productName) return;
    try{
        const scrapedProduct = await srapeWebsiteProduct(productName);
    }catch(error:any){
        throw new Error(`Failed to create/update product:${error.message}`)
    }
}
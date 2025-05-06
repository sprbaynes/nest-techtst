import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Product } from './entities/product.entity'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {

  constructor(private configService: ConfigService) {}

  async create(createProductDto: CreateProductDto) {

    const filePath = join(__dirname,this.configService.get<string>('DATA_FILE') || '')
    const productsRaw: Buffer = await readFile(filePath)
    const productsJSON:Product[]  = JSON.parse(productsRaw.toString())
    const productIDs: number[] = productsJSON.map(product => product.id)
    const maxId = Math.max(...productIDs)

    const newId = maxId + 1

    const newProduct = {id:newId,...createProductDto}

    productsJSON.push(newProduct)

    try{
      await writeFile(filePath, JSON.stringify(productsJSON))
    }
    catch(error)
    {
      console.error('Failed to create new Product',error)
      throw new InternalServerErrorException('Failed to create new Product')
    }

    return {id: newId, message: "Product created"}
  }

  async findAll() {
    const filePath = join(__dirname, this.configService.get<string>('DATA_FILE') || '')

    try{
      const productsRaw: Buffer = await readFile(filePath)
      const productsJSON:Product[]  = JSON.parse(productsRaw.toString())

      return productsJSON
    }
    catch(error)
    {
      console.error('Failed to execute product search',error)
      throw new InternalServerErrorException('Failed to execute product search')
    }    
  }

   async findOne(id: number) {

    let product : Product | undefined

    try{
      const productsJSON:Product[]  = await this.findAll()

      product = productsJSON.find( 
        (product)=>{
          return (product.id === id)
        }
      )
    }
    catch(error)
    {
      console.error('Failed to execute product search',error)
      throw new InternalServerErrorException('Failed to execute product search')
    }
    
    if(product)
    {
      return product
    }
    else{
      throw new NotFoundException(`Product with id ${id} not found`)
    }

  }

  async update(id: number, updateProductDto: UpdateProductDto) {  
    let product: Product | undefined
    let productsJSON: Product[] 

    try{
      productsJSON = await this.findAll()
      
      product = productsJSON.find( 
        (product)=>{
          return (product.id === id)
        }
      )
    }
    catch(error)
    {
      console.error('Failed to update product',error)
      throw new InternalServerErrorException('Failed to update product')
    }
  
    if(product)
    {
      try{
        Object.assign(product, updateProductDto)
        const filePath = join(__dirname, this.configService.get<string>('DATA_FILE') || '')
        await writeFile(filePath, JSON.stringify(productsJSON))
      }
      catch(error)
      {
        console.error('Failed to update product',error)
        throw new InternalServerErrorException('Failed to update product')
      }
    }
    else{
      throw new NotFoundException(`Product with id ${id} not found`)
    }
  
    return {id, message: `Product ${id} updated`}
  }

  async remove(id: number) {
    let productsJSON: Product[]

    try{
      productsJSON = await this.findAll()
    }
    catch(error)
    {
      console.error('Failed to remove product',error)
      throw new InternalServerErrorException('Failed to remove product')
    }

    const idx = productsJSON.findIndex(p => p.id === id);

    if (idx !== -1) {
      productsJSON.splice(idx, 1);
      //remove object from array
      const filePath = join(__dirname, this.configService.get<string>('DATA_FILE') || '')

      try{
        await writeFile(filePath, JSON.stringify(productsJSON))
      }catch(error){
        console.error('Failed to remove product',error)
        throw new InternalServerErrorException('Failed to remove product')
      }
    }
    else{
      throw new NotFoundException(`Product with id ${id} not found`)
    }

    return {id, message: `Product ${id} deleted`}
  }
}

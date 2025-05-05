import { Injectable, NotFoundException  } from '@nestjs/common';
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

    await writeFile(filePath, JSON.stringify(productsJSON))

    return {id: newId, message: "Product created"}
  }

  async findAll() {
    const filePath = join(__dirname, this.configService.get<string>('DATA_FILE') || '')
    const productsRaw: Buffer = await readFile(filePath)
    const productsJSON:Product[]  = JSON.parse(productsRaw.toString())

    return productsJSON
  }

   async findOne(id: number) {
    const productsJSON:Product[]  = await this.findAll()

    const product = productsJSON.find( 
      (product)=>{
        return (product.id === id)
      }
    )

    if(product)
    {
      return product
    }
    else{
      throw new NotFoundException(`Product with id ${id} not found`)
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {  
    const productsJSON = await this.findAll()
    const product = productsJSON.find( 
      (product)=>{
        return (product.id === id)
      }
    )

    if(product)
    {
      Object.assign(product, updateProductDto)
      const filePath = join(__dirname, this.configService.get<string>('DATA_FILE') || '')
      await writeFile(filePath, JSON.stringify(productsJSON))
    }
    else{
      throw new NotFoundException(`Product with id ${id} not found`)
    }

    return {id, message: `Product ${id} updated`}
  }

  async remove(id: number) {
    const productsJSON = await this.findAll()

    const idx = productsJSON.findIndex(p => p.id === id);
    if (idx !== -1) {
      productsJSON.splice(idx, 1);
      //remove object from array
      const filePath = join(__dirname, this.configService.get<string>('DATA_FILE') || '')
      await writeFile(filePath, JSON.stringify(productsJSON))
    }
    else{
      throw new NotFoundException(`Product with id ${id} not found`)
    }

    return {id, message: `Product ${id} deleted`}
  }
}

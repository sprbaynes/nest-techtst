import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ConfigModule } from '@nestjs/config';
import { NotFoundException, InternalServerErrorException  } from '@nestjs/common';
import * as fs from 'fs/promises';
import { copyFile} from 'fs/promises'
import { join } from 'path'

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        isGlobal: true, // makes it accessible anywhere without re-importing
        envFilePath: `.env.test`
      })],
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);

    const dataFileBackupPath = join(__dirname, process.env.DATA_FILE_BACKUP || '')
    const dataFilePath = join(__dirname, process.env.DATA_FILE || '')

    await copyFile(dataFileBackupPath, dataFilePath)
  });

  afterAll(async ()=> {
    const dataFileBackupPath = join(__dirname, process.env.DATA_FILE_BACKUP || '')
    const dataFilePath = join(__dirname, process.env.DATA_FILE || '')

    await copyFile(dataFileBackupPath, dataFilePath)
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all products', async () => {
    const products = await service.findAll();

    expect(Array.isArray(products)).toBe(true);
    expect(products).toHaveLength(3)
  });

  it('should return one product by id', async () => {
    const found = await service.findOne(2);
    expect(found).toEqual({
      "id": 2,
      "brand": "Glamour Beauty",
      "category": "beauty",
      "description": "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it's convenient for on-the-go makeup application.",
      "images": [
        "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp"
      ],
      "price": 19.99,
      "stock": 34,
      "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp",
      "title": "Eyeshadow Palette with Mirror"
    });
  });

  it('should should throw NotFoundException when product id doesn\'t exist', async () => {
    expect(async ()=> await service.findOne(1111)).rejects.toThrow(new NotFoundException(`Product with id 1111 not found`))
  });

  it('should remove a product', async () => {
    const productResponse = await service.create({
      "brand": "Velvet Touch",
      "category": "beauty",
      "description": "The Powder Canister is a finely milled setting powder designed to set makeup and control shine. With a lightweight and translucent formula, it provides a smooth and matte finish.",
      "images": [
        "https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp"
      ],
      "price": 14.99,
      "stock": 89,
      "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp",
      "title": "Powder Canister"
    });

    const result = await service.remove(productResponse.id);
    expect(result.message).toEqual(`Product ${productResponse.id} deleted`);
    expect(()=> service.findOne(productResponse.id)).rejects.toThrow(new NotFoundException(`Product with id ${productResponse.id} not found`))
  });

  it('should throw NotFoundException when you try to remove a product that doesn\'t exist', async () => {
    expect(async ()=> await service.remove(1111)).rejects.toThrow(new NotFoundException(`Product with id 1111 not found`))
  });

  it('should create a new product', async ()=>{

    const productToCreate = {
      "brand": "Velvet Touch",
      "category": "beauty",
      "description": "The Powder Canister is a finely milled setting powder designed to set makeup and control shine. With a lightweight and translucent formula, it provides a smooth and matte finish.",
      "images": [
        "https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp"
      ],
      "price": 14.99,
      "stock": 89,
      "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp",
      "title": "Powder Canister"
    }

    const productResponse = await service.create(productToCreate);

    const result = await service.findOne(productResponse.id);
    const products = await service.findAll()

    expect(result).toEqual({id: productResponse.id, ...productToCreate})
    expect(products).toHaveLength(4)
  })

  it('should throw an InternalServerErrorException when creating a new product fails', async ()=>{

    const mockError = Object.assign(new Error('EIO: Generic IO Failure'), {
      code: 'EIO',
    });

    const spy = jest
    .spyOn(fs, 'writeFile')
    .mockRejectedValueOnce(mockError);

    const productToCreate = {
      "brand": "Velvet Touch",
      "category": "beauty",
      "description": "The Powder Canister is a finely milled setting powder designed to set makeup and control shine. With a lightweight and translucent formula, it provides a smooth and matte finish.",
      "images": [
        "https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp"
      ],
      "price": 14.99,
      "stock": 89,
      "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp",
      "title": "Powder Canister"
    }

    expect( async ()=> await service.create(productToCreate) ).rejects.toThrow(InternalServerErrorException)

    const products = await service.findAll()
    expect(products).toHaveLength(3)

    spy.mockRestore();
  })
});

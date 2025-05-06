import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ConfigModule } from '@nestjs/config';
import { copyFile} from 'fs/promises'
import { join } from 'path'
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    jest.resetModules() 

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        isGlobal: true, // makes it accessible anywhere without re-importing
        envFilePath: `.env.test`
      })],
      controllers: [ProductsController],
      providers: [ProductsService],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);

    const dataFileBackupPath = join(__dirname, process.env.DATA_FILE_BACKUP || '')
    const dataFilePath = join(__dirname, process.env.DATA_FILE || '')

    await copyFile(dataFileBackupPath, dataFilePath)
    jest.restoreAllMocks();
  });

  afterAll(async ()=> {
    const dataFileBackupPath = join(__dirname, process.env.DATA_FILE_BACKUP || '')
    const dataFilePath = join(__dirname, process.env.DATA_FILE || '')

    await copyFile(dataFileBackupPath, dataFilePath)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  //GET
  it('should return all products', async () => {
    
    const spy = jest.spyOn(service, 'findAll');

    const result = await controller.findAll();

    expect(spy).toHaveBeenCalled();
    expect(result).toHaveLength(3)
  });

  it('should return one product by id', async () => {   
    const spy = jest.spyOn(service, 'findOne');

    const result = await controller.findOne(1);

    expect(spy).toHaveBeenCalledWith(1);
    expect(result).toEqual(
      {
        "id": 1,
        "brand": "Essence",
        "category": "beauty",
        "description": "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.",
        "images": [
          "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"
        ],
        "price": 9.99,
        "stock": 99,
        "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
        "title": "Essence Mascara Lash Princess"
      }
    )
  });

  //POST
  it('should create a new product', async ()=>{
    const spy = jest.spyOn(service, 'create');

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

    const productResponse = await controller.create(productToCreate);
    expect(spy).toHaveBeenCalledWith(productToCreate)
    expect(typeof productResponse.id).toBe('number')
    expect(productResponse.message).toEqual('Product created')
  })

  //PATCH
  it('should update an existing product', async ()=>{
    const spy = jest.spyOn(service, 'update');    
  
    await controller.update(2, {
      "brand": "Updated brand"
    })
    
    expect(spy).toHaveBeenCalledWith(2, {
      "brand": "Updated brand"
    })
    const found = await controller.findOne(2)
    expect(found.brand).toEqual("Updated brand")
  })
  
  it('should throw NotFoundException when you try to update a product that doesn\'t exist', async () => {
    const spy = jest.spyOn(service, 'update'); 
    await expect(controller.update(1111, {"brand": "Updated brand"})).rejects.toThrow(new NotFoundException(`Product with id 1111 not found`))
    expect(spy).toHaveBeenCalledWith(1111, {
      "brand": "Updated brand"
    })
  });

  //DELETE
  it('should remove a product', async () => {
    const spy = jest.spyOn(service, 'remove'); 
    const result = await controller.remove(1);
    expect(result.message).toEqual(`Product 1 deleted`);
    expect(spy).toHaveBeenCalledWith(1)
    await expect(controller.findOne(1)).rejects.toThrow(new NotFoundException(`Product with id 1 not found`))
  });

  it('should throw NotFoundException when you try to remove a product that doesn\'t exist', async () => {
    const spy = jest.spyOn(service, 'remove'); 
    await expect(controller.remove(1111)).rejects.toThrow(new NotFoundException(`Product with id 1111 not found`))
    expect(spy).toHaveBeenCalledWith(1111)
  });
});

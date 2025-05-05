import { IsArray, ArrayNotEmpty, IsString, IsNumber, IsInt } from 'class-validator';
export class CreateProductDto {
    @IsString()
    brand: string
    @IsString()
    category: string
    @IsString()
    description:string

    @IsArray()
    @ArrayNotEmpty({ message: 'Please provide at least one image URL' })
    @IsString({ each: true })
    images: string[]

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with up to 2 decimal places' })
    price: number

    @IsInt()
    stock: number
    
    @IsString()
    thumbnail: string
    @IsString()
    title: string
}

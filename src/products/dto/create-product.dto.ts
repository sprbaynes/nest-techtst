import { IsArray, ArrayNotEmpty, IsString, IsNumber, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateProductDto {
    @IsString()
    @ApiProperty({ example: 'Garmin' })
    brand: string

    @IsString()
    @ApiProperty({ example: 'GPS Products' })
    category: string

    @IsString()
    @ApiProperty({ example: 'GPS Multi-sport Watch' })
    description:string

    @IsArray()
    @ArrayNotEmpty({ message: 'Please provide at least one image URL' })
    @IsString({ each: true })
    @ApiProperty({
        type: [String],
        example: ["http://google.com/gps-watch.jpg","http://google.com/gps-watch-2.jpg"] 
    })
    images: string[]

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with up to 2 decimal places' })
    @ApiProperty({ example: 2.99 })
    price: number

    @IsInt()
    @ApiProperty({ example: 5 })
    stock: number
    
    @IsString()
    @ApiProperty({ example: 'http://google.com/gps-watch-thumbnail.jpg' })
    thumbnail: string


    @IsString()
    @ApiProperty({ example: 'Fenix 6X Pro' })
    title: string
}

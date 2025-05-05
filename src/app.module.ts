import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true, // makes it accessible anywhere without re-importing
  }),
  ProductsModule],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}

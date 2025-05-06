import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Products CRUD API')
    .setDescription('The Products CRUD API documentation')
    .setVersion('1.0')
    .addTag('products') // optional
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // URL: /api-docs

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
declare global {
  interface ImportMeta {
    webpackHot?: any;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  // Đổi từ module.hot sang import.meta.webpackHot
  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
    import.meta.webpackHot.dispose(() => app.close());
  }
}
bootstrap();

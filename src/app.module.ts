import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { SeedModule } from './seed/seed.module';
import { ProductModule } from './product/product.module';
import { CommonsModule } from './commons/commons.module';
import { ToppingModule } from './topping/topping.module';
import { OrderModule } from './Order/order.module';
import { ReportModule } from './report/report.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    SeedModule,
    ProductModule,
    CommonsModule,
    ToppingModule,
    OrderModule,
    ReportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
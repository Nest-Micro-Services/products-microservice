import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }
  create(_createProductDto: CreateProductDto) {
    return this.product.create({
      data: _createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;

    const totalPages = await this.product.count({
      where: { isAvailable: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          isAvailable: true,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {
        id,
        isAvailable: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Not found');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto;

    console.log(_);

    await this.findOne(id);

    return this.product.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    // const deleteProduct = await this.product.delete({
    //   where: {
    //     id: id,
    //   },
    // });

    console.log(product);

    const deleteProduct = await this.product.update({
      where: {
        id: id,
      },
      data: {
        isAvailable: false,
      },
    });

    return deleteProduct;
  }
}

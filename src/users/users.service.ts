import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { telegramId } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findOrCreate(telegramId: string): Promise<User> {
    let user = await this.findByTelegramId(telegramId);
    if (!user) {
      user = await this.create({ telegramId });
    }
    return user;
  }
}

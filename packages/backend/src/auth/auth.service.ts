import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(wallet: string): Promise<User> {
    let user = await this.usersRepository.findOne({ where: { wallet } });
    if (!user) {
      user = this.usersRepository.create({ wallet });
      await this.usersRepository.save(user);
    }
    return user;
  }
}

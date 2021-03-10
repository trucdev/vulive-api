import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  create(createUserInput: CreateUserInput) {
    return this.userModel.create({
      email: createUserInput.email,
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    return this.userModel.findOne({
      _id: Types.ObjectId.createFromHexString(id),
    });
  }

  findUserByEmail(email: string) {
    return this.userModel.findOne({
      email,
    });
  }

  update(id: string, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}

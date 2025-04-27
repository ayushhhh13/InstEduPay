import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../../services/users/users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
  
  @Controller('users')
  @UseGuards(AuthGuard('jwt'))
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Get()
    @Roles('admin')
    findAll() {
      return this.usersService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.usersService.findOne(id);
    }
  
    @Post()
    @Roles('admin')
    create(@Body() createUserDto: CreateUserDto) {
      return this.usersService.create(createUserDto);
    }
  
    @Put(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
      return this.usersService.update(id, updateUserDto);
    }
  
    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string) {
      return this.usersService.remove(id);
    }
  }
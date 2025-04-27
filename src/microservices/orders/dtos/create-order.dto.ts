import { IsNotEmpty, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StudentInfoDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  email: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  school_id?: string;

  @IsNotEmpty()
  trustee_id?: string;

  @ValidateNested()
  @Type(() => StudentInfoDto)
  @IsNotEmpty()
  student_info: StudentInfoDto;

  @IsNotEmpty()
  gateway_name: string;

  @IsOptional()
  custom_order_id?: string;
  
  @IsNumber()
  @IsOptional()
  amount?: number;
}
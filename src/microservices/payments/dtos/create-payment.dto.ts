import { IsNotEmpty, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StudentInfoDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsNotEmpty()
  @IsString()
  callback_url: string;

  @IsOptional()
  @IsString()
  trustee_id?: string;

  @ValidateNested()
  @Type(() => StudentInfoDto)
  @IsNotEmpty()
  student_info: StudentInfoDto;
}
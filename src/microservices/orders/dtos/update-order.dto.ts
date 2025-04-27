import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StudentInfoDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  id?: string;

  @IsOptional()
  email?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  school_id?: string;

  @IsOptional()
  trustee_id?: string;

  @ValidateNested()
  @Type(() => StudentInfoDto)
  @IsOptional()
  student_info?: StudentInfoDto;

  @IsOptional()
  gateway_name?: string;

  @IsOptional()
  custom_order_id?: string;
}
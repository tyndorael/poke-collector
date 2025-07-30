import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User emaild address',
  })
  @IsEmail({}, { message: 'Email address should be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password',
  })
  @IsString({ message: 'Password needs to be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

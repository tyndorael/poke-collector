import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Email address needs to be valid' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @ApiProperty({ example: 'pokemonmaster', description: 'Username' })
  @IsString({ message: 'Username needs to be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, {
    message: 'Username needs to be at least three characters mininum',
  })
  @MaxLength(20, {
    message: 'Username needs to be least than twenty characters',
  })
  username: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'User password' })
  @IsString({ message: 'Password needs to be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, {
    message: 'Password needs to be at least eight characters mininum',
  })
  password: string;

  @ApiProperty({ example: 'John', description: 'User name' })
  @IsString({ message: 'User name needs to be a string' })
  @IsNotEmpty({ message: 'User name is required' })
  @IsOptional()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString({ message: 'User last name needs to be a string' })
  @IsNotEmpty({ message: 'User last name is required' })
  @IsOptional()
  lastName: string;

  @ApiProperty({
    example: 'America/Santiago',
    description: 'User timezone',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'User timezone needs to be a string' })
  timezone?: string;

  @ApiProperty({
    example: 'es-CL',
    description: 'User locale',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'User locale needs to be a string' })
  locale?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'newuser@example.com',
    description: 'User email address, must be unique',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'newpokemonmaster',
    description: 'Username for the user, must be unique',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    example: 'AnotherSecurePassword!',
    description: 'Password for the user, must be at least 8 characters long',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'Jane',
    description: 'First name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: 'America/New_York',
    description: 'User timezone, e.g., America/New_York',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    example: 'en-US',
    description: 'User locale, e.g., en-US',
    required: false,
  })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({
    type: Object,
    description: 'User settings as a JSON object, e.g., { theme: "dark", notifications: true }',
    required: false,
  })
  @IsOptional()
  settings?: Record<string, any>;
}

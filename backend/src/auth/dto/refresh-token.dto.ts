import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1Ni...',
    description: 'Refresh Token',
  })
  @IsString({ message: 'Refresh token needs to be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}

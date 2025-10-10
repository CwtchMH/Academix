import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class IssueCertificateDto {
  @ApiProperty({
    description: 'Student ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  studentId: string;

  @ApiProperty({
    description: 'Course ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  courseId: string;

  @ApiProperty({
    description: 'Submission ID used as basis for issuance',
    example: '507f1f77bcf86cd799439013',
  })
  @IsMongoId()
  submissionId: string;

  @ApiPropertyOptional({ description: 'Blockchain token ID' })
  @IsOptional()
  @IsString()
  tokenId?: string;

  @ApiPropertyOptional({ description: 'IPFS content hash' })
  @IsOptional()
  @IsString()
  ipfsHash?: string;

  @ApiPropertyOptional({ description: 'Blockchain transaction hash' })
  @IsOptional()
  @IsString()
  transactionHash?: string;

  @ApiPropertyOptional({ description: 'Issued at date (ISO string)' })
  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @ApiPropertyOptional({ description: 'Outdate/expiration date (ISO string)' })
  @IsOptional()
  @IsDateString()
  outdateTime?: string;
}

export class RevokeCertificateDto {
  @ApiPropertyOptional({ description: 'Reason for revocation' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Blockchain transaction hash for revocation',
  })
  @IsOptional()
  @IsString()
  transactionHash?: string;
}

export class CertificatesQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'issued', 'revoked'] })
  @IsOptional()
  @IsEnum(['pending', 'issued', 'revoked'])
  status?: 'pending' | 'issued' | 'revoked';

  @ApiPropertyOptional({ description: 'Filter by student ID' })
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Filter by course ID' })
  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

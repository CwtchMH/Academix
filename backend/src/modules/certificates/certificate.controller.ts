import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificateService } from './certificate.service';
import {
  IssueCertificateDto,
  CertificatesQueryDto,
  RevokeCertificateDto,
} from './dto/certificate.dto';
import { ResponseHelper } from '../../common/dto/response.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Certificates')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('issue')
  @Roles('teacher', 'admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Issue a certificate for a student submission' })
  async issue(@Body() dto: IssueCertificateDto) {
    const created = await this.certificateService.issue(dto);
    return ResponseHelper.success(created, 'Certificate issued');
  }

  @Get()
  @Roles('student', 'teacher', 'admin')
  @ApiOperation({ summary: 'List certificates with filters and pagination' })
  async list(@Query() query: CertificatesQueryDto) {
    const { items, total, page, limit } =
      await this.certificateService.list(query);
    return ResponseHelper.paginated(
      items,
      page || 1,
      limit || 10,
      total,
      'Certificates fetched',
    );
  }

  @Get(':id')
  @Roles('student', 'teacher', 'admin')
  @ApiOperation({ summary: 'Get certificate by ID' })
  async getById(@Param('id') id: string) {
    const cert = await this.certificateService.getById(id);
    return ResponseHelper.success(cert, 'Certificate fetched');
  }

  @Get('student/:studentId')
  @Roles('student', 'teacher', 'admin')
  @ApiOperation({ summary: 'List certificates by student' })
  async getByStudent(
    @Param('studentId') studentId: string,
    @Query() query: CertificatesQueryDto,
  ) {
    const { items, total, page, limit } =
      await this.certificateService.getByStudent(studentId, query);
    return ResponseHelper.paginated(
      items,
      page || 1,
      limit || 10,
      total,
      'Certificates fetched',
    );
  }

  @Get('course/:courseId')
  @Roles('student', 'teacher', 'admin')
  @ApiOperation({ summary: 'List certificates by course' })
  async getByCourse(
    @Param('courseId') courseId: string,
    @Query() query: CertificatesQueryDto,
  ) {
    const { items, total, page, limit } =
      await this.certificateService.getByCourse(courseId, query);
    return ResponseHelper.paginated(
      items,
      page || 1,
      limit || 10,
      total,
      'Certificates fetched',
    );
  }

  @Patch(':id/revoke')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Revoke a certificate' })
  async revoke(@Param('id') id: string, @Body() dto: RevokeCertificateDto) {
    const updated = await this.certificateService.revoke(
      id,
      dto?.reason,
      dto?.transactionHash,
    );
    return ResponseHelper.success(updated, 'Certificate revoked');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Certificate,
  CertificateDocument,
} from '../../database/schemas/certificate.schema';
import {
  IssueCertificateDto,
  CertificatesQueryDto,
} from './dto/certificate.dto';

@Injectable()
export class CertificateService {
  constructor(
    @InjectModel(Certificate.name)
    private readonly certificateModel: Model<CertificateDocument>,
  ) {}

  async issue(dto: IssueCertificateDto): Promise<CertificateDocument> {
    const certificate = new this.certificateModel({
      studentId: new Types.ObjectId(dto.studentId),
      courseId: new Types.ObjectId(dto.courseId),
      submissionId: new Types.ObjectId(dto.submissionId),
      status: 'issued',
      tokenId: dto.tokenId,
      ipfsHash: dto.ipfsHash,
      transactionHash: dto.transactionHash,
      issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : new Date(),
      outdateTime: dto.outdateTime ? new Date(dto.outdateTime) : undefined,
    });
    return await certificate.save();
  }

  async list(query: CertificatesQueryDto) {
    const { page = 1, limit = 10, status, studentId, courseId } = query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (studentId) filter.studentId = new Types.ObjectId(studentId);
    if (courseId) filter.courseId = new Types.ObjectId(courseId);

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.certificateModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.certificateModel.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  async getById(id: string) {
    const cert = await this.certificateModel.findById(id).lean();
    if (!cert) throw new NotFoundException('Certificate not found');
    return cert;
  }

  async getByStudent(studentId: string, query: CertificatesQueryDto) {
    return this.list({ ...query, studentId });
  }

  async getByCourse(courseId: string, query: CertificatesQueryDto) {
    return this.list({ ...query, courseId });
  }

  async revoke(id: string, reason?: string, transactionHash?: string) {
    const cert = await this.certificateModel.findById(id);
    if (!cert) throw new NotFoundException('Certificate not found');
    cert.status = 'revoked';
    if (transactionHash) cert.transactionHash = transactionHash;
    // reason can be stored later if we add a field
    await cert.save();
    return cert.toObject();
  }
}

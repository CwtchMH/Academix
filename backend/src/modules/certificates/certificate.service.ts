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
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { Course, CourseDocument } from 'src/database/schemas/course.schema';
import {
  Submission,
  SubmissionDocument,
} from 'src/database/schemas/submission.schema';

@Injectable()
export class CertificateService {
  constructor(
    @InjectModel(Certificate.name)
    private readonly certificateModel: Model<CertificateDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
  ) {}

  async issue(dto: IssueCertificateDto) {
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

    const savedCertificate = await certificate.save();

    return await this.certificateModel
      .findById(savedCertificate._id)
      .populate('studentId', 'username email fullName role')
      .populate('courseId', 'courseName')
      .populate('submissionId', 'score submittedAt')
      .lean();
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
        .populate('studentId', 'username email fullName role')
        .populate('courseId', 'courseName')
        .populate('submissionId', 'score submittedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.certificateModel.countDocuments(filter),
    ]);
    const dataResponse = items.map((item) => {
      return {
        student: item.studentId || {},
        course: item.courseId || {},
        submission: item.submissionId || {},
        tokenId: item.tokenId || '',
        ipfsHash: item.ipfsHash || '',
        transactionHash: item.transactionHash || '',
        issuedAt: item.issuedAt || '',
        outdateTime: item.outdateTime || '',
        status: item.status || '',
        createdAt: item.createdAt || '',
      };
    });

    return { items: dataResponse, total, page, limit };
  }

  async getById(id: string) {
    const cert = await this.certificateModel
      .findById(id)
      .populate('studentId', 'username email fullName role')
      .populate('courseId', 'courseName')
      .populate('submissionId', 'score submittedAt')
      .lean();
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

    // Return populated data
    return await this.certificateModel
      .findById(id)
      .populate('studentId', 'username email fullName role')
      .populate('courseId', 'courseName')
      .populate('submissionId', 'score submittedAt')
      .lean();
  }
}

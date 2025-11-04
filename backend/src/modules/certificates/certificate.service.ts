import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
import { Exam, ExamDocument } from 'src/database/schemas/exam.schema';
import { BlockchainService } from '../../common/services/blockchain.service';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    @InjectModel(Certificate.name)
    private readonly certificateModel: Model<CertificateDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    @InjectModel(Exam.name)
    private readonly examModel: Model<ExamDocument>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async issue(dto: IssueCertificateDto) {
    const { examId, studentId } = dto;

    const submission = await this.submissionModel.findOne({
      examId: new Types.ObjectId(examId),
      studentId: new Types.ObjectId(studentId),
    });
    if (!submission) throw new NotFoundException('Submission not found');

    const existingCertificate = await this.certificateModel.findOne({
      submissionId: submission._id,
    });
    if (existingCertificate) {
      return await this.certificateModel
        .findById(existingCertificate._id)
        .populate('studentId', 'username email fullName role')
        .populate('courseId', 'courseName')
        .populate('submissionId', 'score submittedAt')
        .lean();
    }

    const exam = await this.examModel.findById(examId);
    if (!exam) throw new NotFoundException('Exam not found');

    const student = await this.userModel.findById(dto.studentId);
    if (!student) throw new NotFoundException('Student not found');

    student.walletAddress = '0x0887e336dcded20063abe111aa67ec1ac8690887';

    const certificate = new this.certificateModel({
      studentId: new Types.ObjectId(dto.studentId),
      courseId: exam.courseId,
      submissionId: submission._id,
      status: 'pending',
      tokenId: undefined,
      ipfsHash: undefined,
      transactionHash: undefined,
      issuedAt: new Date(),
      outdateTime: new Date(),
    });

    const savedCertificate = await certificate.save();

    try {
      // 1. Tạo token ID từ certificate._id (chuyển sang string để dùng làm tokenId)
      // const certificateId = savedCertificate._id as Types.ObjectId;
      // const tokenId = certificateId.toString();
      // random tokenId for testing
      const tokenId = Math.floor(Math.random() * 1000000).toString();
      // 2. Tạo certificate metadata
      // TODO: Implement IPFS service để upload metadata
      // Certificate metadata structure:
      // const course = await this.courseModel.findById(exam.courseId);
      // {
      //   certificateId: tokenId,
      //   studentName: student.fullName,
      //   studentEmail: student.email,
      //   courseName: course?.courseName || 'Unknown Course',
      //   examTitle: exam.title,
      //   score: submission.score,
      //   issuedAt: new Date().toISOString(),
      //   issuer: 'Academix Education Platform',
      // }
      // const ipfsHash = await this.ipfsService.upload(certificateMetadata);

      // 3. Upload certificate metadata lên IPFS
      // Tạm thời dùng placeholder IPFS hash
      const ipfsHash = `QmPlaceholder${tokenId.substring(0, 10)}`; // Placeholder

      // 4. Kiểm tra wallet address của student
      if (!student.walletAddress) {
        const studentIdStr = (student._id as Types.ObjectId).toString();
        this.logger.warn(
          `Student ${studentIdStr} does not have wallet address. Certificate created but not minted on blockchain.`,
        );
        // Nếu không có wallet address, trả về certificate với status 'pending'
        return await this.certificateModel
          .findById(savedCertificate._id)
          .populate('studentId', 'username email fullName role')
          .populate('courseId', 'courseName')
          .populate('submissionId', 'score submittedAt')
          .lean();
      }

      // 5. Mint certificate trên blockchain
      this.logger.log(
        `Minting certificate on blockchain: tokenId=${tokenId}, recipient=${student.walletAddress}`,
      );

      let transactionHash: string | undefined;
      try {
        transactionHash = await this.blockchainService.issueCertificate({
          tokenId: tokenId,
          ipfsHash: ipfsHash,
          recipientAddress: student.walletAddress,
        });

        // 6. Update certificate với tokenId, ipfsHash, transactionHash và status
        savedCertificate.tokenId = tokenId;
        savedCertificate.ipfsHash = ipfsHash;
        savedCertificate.transactionHash = transactionHash;
        savedCertificate.status = 'issued';
        await savedCertificate.save();

        this.logger.log(
          `Certificate minted successfully: tokenId=${tokenId}, txHash=${transactionHash}`,
        );
      } catch (blockchainError: unknown) {
        // Nếu mint trên blockchain fail, kiểm tra xem có transactionHash không
        // Có thể transaction đã được gửi nhưng có lỗi khi parse event
        const errorMessage =
          blockchainError instanceof Error
            ? blockchainError.message
            : 'Unknown error';

        // Kiểm tra xem error message có chứa transaction hash không
        // hoặc có thể extract từ error nếu có
        if (
          errorMessage.includes('serialize') ||
          errorMessage.includes('BigInt')
        ) {
          // Transaction đã thành công nhưng có lỗi khi parse/log
          // Tìm transactionHash từ error hoặc log
          this.logger.warn(
            `Transaction succeeded but event parsing failed: ${errorMessage}. Certificate will be updated if transactionHash is available.`,
          );
          // Không update certificate vì không có transactionHash
        } else {
          // Transaction thực sự failed
          this.logger.error(
            `Error minting certificate on blockchain: ${errorMessage}`,
          );
        }
        // Certificate đã được lưu với status 'pending'
        // Có thể retry mint sau này hoặc manual update với transactionHash
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error in certificate minting process: ${errorMessage}`,
        errorStack,
      );
      // Certificate đã được lưu với status 'pending'
    }

    // Return populated certificate data
    return await this.certificateModel
      .findById(savedCertificate._id)
      .populate('studentId', 'username email fullName role')
      .populate('courseId', 'courseName')
      .populate('submissionId', 'score submittedAt')
      .lean();
  }

  async list(query: CertificatesQueryDto) {
    const {
      page = 1,
      limit = 10,
      status,
      studentId,
      courseId,
      courseName,
      issuedFrom,
      issuedTo,
      teacherId,
    } = query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (studentId) filter.studentId = new Types.ObjectId(studentId);
    // We'll compute courseId filter after considering courseName and teacherId

    // Date range filter on issuedAt
    if (issuedFrom || issuedTo) {
      const dateFilter: Record<string, Date> = {};
      if (issuedFrom) dateFilter.$gte = new Date(issuedFrom);
      if (issuedTo) dateFilter.$lte = new Date(issuedTo);
      filter.issuedAt = dateFilter;
    }

    // Build courseId filter from courseId, courseName, teacherId with intersection logic
    let candidateCourseIds: Types.ObjectId[] | undefined;

    if (courseId) {
      candidateCourseIds = [new Types.ObjectId(courseId)];
    }

    if (courseName) {
      const regex = new RegExp(courseName, 'i');
      const nameMatches = await this.courseModel
        .find({ courseName: regex })
        .select('_id')
        .lean();
      const nameIds = nameMatches.map((c) => c._id as Types.ObjectId);
      candidateCourseIds = candidateCourseIds
        ? candidateCourseIds.filter((id) =>
            nameIds.some((nid) => nid.equals(id)),
          )
        : nameIds;
    }

    if (teacherId) {
      const teacherMatches = await this.courseModel
        .find({ teacherId: new Types.ObjectId(teacherId) })
        .select('_id')
        .lean();
      const teacherIds = teacherMatches.map((c) => c._id as Types.ObjectId);
      candidateCourseIds = candidateCourseIds
        ? candidateCourseIds.filter((id) =>
            teacherIds.some((tid) => tid.equals(id)),
          )
        : teacherIds;
    }

    if (candidateCourseIds) {
      if (candidateCourseIds.length === 0) {
        return { items: [], total: 0, page, limit };
      }
      filter.courseId = { $in: candidateCourseIds };
    }

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

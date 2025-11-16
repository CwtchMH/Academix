import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';

export interface CertificateData {
  studentName: string;
  courseName: string;
  examTitle: string;
  score: number;
  issuedDate: string;
  certificateId?: string;
}

@Injectable()
export class CertificateImageService {
  private readonly logger = new Logger(CertificateImageService.name);
  private readonly width = 1200;
  private readonly height = 800;

  /**
   * Tạo ảnh certificate từ dữ liệu
   * @param data - Dữ liệu certificate
   * @returns Buffer của ảnh PNG
   */
  async generateCertificateImage(data: CertificateData): Promise<Buffer> {
    try {
      const canvas = createCanvas(this.width, this.height);
      const ctx = canvas.getContext('2d');

      // Vẽ background gradient
      this.drawBackground(ctx);

      // Vẽ border và decorative elements
      this.drawBorder(ctx);
      this.drawDecorativeElements(ctx);

      // Vẽ header
      this.drawHeader(ctx);

      // Vẽ nội dung chính
      this.drawMainContent(ctx, data);

      // Vẽ footer
      this.drawFooter(ctx, data.issuedDate);

      // Convert canvas thành buffer (async variant to satisfy lint)
      const buffer = await new Promise<Buffer>((resolve, reject) => {
        canvas.toBuffer((err, result) => {
          if (err || !result) {
            const rejectionReason =
              err instanceof Error
                ? err
                : new Error('Failed to render certificate image.');
            reject(rejectionReason);
            return;
          }
          resolve(result);
        }, 'image/png');
      });
      this.logger.log('Certificate image generated successfully');

      return buffer;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error generating certificate image: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to generate certificate image: ${errorMessage}`);
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    // Gradient background từ xanh dương nhạt đến trắng
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#E3F2FD'); // Light blue
    gradient.addColorStop(0.5, '#F5F5F5'); // Light gray
    gradient.addColorStop(1, '#FFFFFF'); // White

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawBorder(ctx: CanvasRenderingContext2D): void {
    // Outer border
    ctx.strokeStyle = '#1976D2'; // Blue
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, this.width - 80, this.height - 80);

    // Inner border
    ctx.strokeStyle = '#64B5F6'; // Light blue
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, this.width - 120, this.height - 120);
  }

  private drawDecorativeElements(ctx: CanvasRenderingContext2D): void {
    // Corner decorations
    const cornerSize = 60;
    const corners = [
      [40, 40],
      [this.width - 40, 40],
      [40, this.height - 40],
      [this.width - 40, this.height - 40],
    ];

    ctx.strokeStyle = '#1976D2';
    ctx.lineWidth = 4;

    corners.forEach(([x, y]) => {
      // Top-left corner
      if (x === 40 && y === 40) {
        ctx.beginPath();
        ctx.moveTo(x, y + cornerSize);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerSize, y);
        ctx.stroke();
      }
      // Top-right corner
      else if (x === this.width - 40 && y === 40) {
        ctx.beginPath();
        ctx.moveTo(x - cornerSize, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + cornerSize);
        ctx.stroke();
      }
      // Bottom-left corner
      else if (x === 40 && y === this.height - 40) {
        ctx.beginPath();
        ctx.moveTo(x, y - cornerSize);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerSize, y);
        ctx.stroke();
      }
      // Bottom-right corner
      else {
        ctx.beginPath();
        ctx.moveTo(x - cornerSize, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y - cornerSize);
        ctx.stroke();
      }
    });
  }

  private drawHeader(ctx: CanvasRenderingContext2D): void {
    // Title
    ctx.fillStyle = '#1976D2';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('CERTIFICATE OF COMPLETION', this.width / 2, 120);

    // Subtitle
    ctx.fillStyle = '#666666';
    ctx.font = '24px Arial';
    ctx.fillText('This is to certify that', this.width / 2, 200);
  }

  private drawMainContent(
    ctx: CanvasRenderingContext2D,
    data: CertificateData,
  ): void {
    const centerX = this.width / 2;
    let currentY = 280;

    // Student name
    ctx.fillStyle = '#1976D2';
    ctx.font = 'bold 42px Arial';
    ctx.fillText(data.studentName, centerX, currentY);
    currentY += 80;

    // Course completion text
    ctx.fillStyle = '#333333';
    ctx.font = '28px Arial';
    ctx.fillText('has successfully completed the course', centerX, currentY);
    currentY += 60;

    // Course name
    ctx.fillStyle = '#1976D2';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(data.courseName, centerX, currentY);
    currentY += 60;

    // Exam title
    ctx.fillStyle = '#666666';
    ctx.font = '24px Arial';
    ctx.fillText(`Exam: ${data.examTitle}`, centerX, currentY);
    currentY += 50;

    // Score
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 32px Arial';
    const scoreText = `Score: ${data.score.toFixed(1)}%`;
    ctx.fillText(scoreText, centerX, currentY);
  }

  private drawFooter(ctx: CanvasRenderingContext2D, issuedDate: string): void {
    const centerX = this.width / 2;
    const footerY = this.height - 120;

    // Issued date
    ctx.fillStyle = '#666666';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Issued on: ${issuedDate}`, centerX, footerY);

    // Platform name
    ctx.fillStyle = '#1976D2';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Academix Education Platform', centerX, footerY + 40);

    // Certificate ID (nếu có)
    // Note: Certificate ID có thể được thêm vào nếu cần
  }
}

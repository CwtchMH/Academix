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

      // Vẽ border, decorative elements và accent panels
      this.drawBorder(ctx);
      this.drawDecorativeElements(ctx);
      this.drawAccentBar(ctx);

      // Vẽ header
      this.drawHeader(ctx);

      // Vẽ nội dung chính & các điểm nhấn
      this.drawMainContent(ctx, data);
      this.drawSeal(ctx, data.score);
      this.drawSignatureArea(ctx, data);

      // Vẽ footer
      this.drawFooter(ctx, data);

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
    // Gradient background từ tím sang xanh biển tạo cảm giác cao cấp hơn
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#E0E7FF');
    gradient.addColorStop(0.35, '#F5F3FF');
    gradient.addColorStop(1, '#FFFFFF');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Thêm shape mềm mại phía sau tạo chiều sâu
    const abstractGradient = ctx.createLinearGradient(0, 0, this.width, 0);
    abstractGradient.addColorStop(0, 'rgba(124, 58, 237, 0.12)');
    abstractGradient.addColorStop(1, 'rgba(37, 99, 235, 0.15)');

    ctx.fillStyle = abstractGradient;
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.25);
    ctx.bezierCurveTo(
      this.width * 0.3,
      this.height * 0.05,
      this.width * 0.5,
      this.height * 0.45,
      this.width,
      this.height * 0.15,
    );
    ctx.lineTo(this.width, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  }

  private drawBorder(ctx: CanvasRenderingContext2D): void {
    // Outer border với gradient metallic
    const borderGradient = ctx.createLinearGradient(40, 0, this.width - 40, 0);
    borderGradient.addColorStop(0, '#7C3AED');
    borderGradient.addColorStop(1, '#2563EB');

    ctx.lineWidth = 8;
    ctx.strokeStyle = borderGradient;
    ctx.strokeRect(40, 40, this.width - 80, this.height - 80);

    // Inner glass panel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 2;
    ctx.fillRect(70, 70, this.width - 140, this.height - 140);
    ctx.strokeRect(70, 70, this.width - 140, this.height - 140);
  }

  private drawDecorativeElements(ctx: CanvasRenderingContext2D): void {
    // Các đường trang trí mềm mại
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(110, 120);
    ctx.quadraticCurveTo(this.width / 2, 80, this.width - 110, 120);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(110, this.height - 160);
    ctx.quadraticCurveTo(
      this.width / 2,
      this.height - 120,
      this.width - 110,
      this.height - 160,
    );
    ctx.stroke();

    // Dải ribbon góc
    const ribbonGradient = ctx.createLinearGradient(0, 90, 220, 0);
    ribbonGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    ribbonGradient.addColorStop(1, 'rgba(14, 165, 233, 0.25)');

    ctx.fillStyle = ribbonGradient;
    ctx.beginPath();
    ctx.moveTo(70, 70);
    ctx.lineTo(120, 70);
    ctx.lineTo(90, 150);
    ctx.lineTo(70, 120);
    ctx.closePath();
    ctx.fill();
  }

  private drawAccentBar(ctx: CanvasRenderingContext2D): void {
    const barHeight = 70;
    const gradient = ctx.createLinearGradient(70, 70, this.width - 70, 70);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');

    ctx.fillStyle = gradient;
    ctx.fillRect(70, 70, this.width - 140, barHeight);
  }

  private drawHeader(ctx: CanvasRenderingContext2D): void {
    // Title
    ctx.fillStyle = '#312E81';
    ctx.font = 'bold 50px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('CERTIFICATE OF EXCELLENCE', this.width / 2, 120);

    // Subtitle & brand
    ctx.fillStyle = '#6366F1';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText('ACADEMIX INSTITUTE', this.width / 2, 190);

    ctx.fillStyle = '#64748B';
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText('This certifies that', this.width / 2, 230);
  }

  private drawMainContent(
    ctx: CanvasRenderingContext2D,
    data: CertificateData,
  ): void {
    const centerX = this.width / 2;
    let currentY = 300;

    // Student name
    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'bold 54px "Times New Roman", serif';
    ctx.fillText(data.studentName, centerX, currentY);
    currentY += 90;

    // Course completion text
    ctx.fillStyle = '#475569';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText('has successfully completed the course', centerX, currentY);
    currentY += 50;

    // Course name
    ctx.fillStyle = '#312E81';
    ctx.font = 'bold 38px Arial, sans-serif';
    ctx.fillText(data.courseName, centerX, currentY);
    currentY += 70;

    // Exam title
    ctx.fillStyle = '#475569';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText(`Exam: ${data.examTitle}`, centerX, currentY);
    currentY += 50;

    // Score
    const scorePanelX = centerX - 200;
    const scorePanelWidth = 400;
    const scorePanelHeight = 70;

    const scoreGradient = ctx.createLinearGradient(
      scorePanelX,
      currentY,
      scorePanelX + scorePanelWidth,
      currentY,
    );
    scoreGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
    scoreGradient.addColorStop(1, 'rgba(59, 130, 246, 0.15)');

    ctx.fillStyle = scoreGradient;
    ctx.fillRect(scorePanelX, currentY - 45, scorePanelWidth, scorePanelHeight);

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      scorePanelX,
      currentY - 45,
      scorePanelWidth,
      scorePanelHeight,
    );

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 30px Arial, sans-serif';
    const scoreText = `Achieved Score: ${data.score.toFixed(1)}%`;
    ctx.fillText(scoreText, centerX, currentY + 5);
  }

  private drawSeal(ctx: CanvasRenderingContext2D, score: number): void {
    const sealX = this.width - 220;
    const sealY = 260;

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
    ctx.shadowBlur = 20;

    // Outer glow
    ctx.beginPath();
    ctx.arc(sealX, sealY, 90, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(249, 115, 22, 0.18)';
    ctx.fill();

    // Seal body
    ctx.shadowBlur = 0;
    const sealGradient = ctx.createLinearGradient(
      sealX - 60,
      sealY,
      sealX + 60,
      sealY,
    );
    sealGradient.addColorStop(0, '#FDBA74');
    sealGradient.addColorStop(1, '#FB923C');

    ctx.beginPath();
    ctx.arc(sealX, sealY, 70, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF7ED';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = sealGradient;
    ctx.stroke();

    // Inner pattern
    ctx.setLineDash([12, 6]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = sealGradient;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#F97316';
    ctx.font = 'bold 34px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score.toFixed(0)}%`, sealX, sealY);

    ctx.fillStyle = '#FB923C';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('EXCELLENCE', sealX, sealY + 28);

    ctx.restore();
  }

  private drawSignatureArea(
    ctx: CanvasRenderingContext2D,
    data: CertificateData,
  ): void {
    const areaY = this.height - 230;
    const areaHeight = 110;
    const areaWidth = this.width - 180;
    const areaX = 90;

    ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
    ctx.fillRect(areaX, areaY, areaWidth, areaHeight);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(areaX, areaY, areaWidth, areaHeight);

    // Signature line
    const lineY = areaY + areaHeight - 40;
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(areaX + 60, lineY);
    ctx.lineTo(areaX + areaWidth / 2 - 20, lineY);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('Authorized Signature', areaX + 60, lineY + 30);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#475569';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(
      data.certificateId ? `ID: ${data.certificateId}` : 'Academix Platform',
      areaX + areaWidth - 60,
      lineY + 30,
    );
  }

  private drawFooter(
    ctx: CanvasRenderingContext2D,
    data: CertificateData,
  ): void {
    const centerX = this.width / 2;
    const footerY = this.height - 80;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText(`Issued on ${data.issuedDate}`, centerX, footerY);

    ctx.fillStyle = '#312E81';
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillText('Academix Education Platform', centerX, footerY + 40);
  }
}

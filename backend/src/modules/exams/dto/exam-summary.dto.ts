import { ApiProperty } from '@nestjs/swagger';

export class ExamSummaryDto {
  @ApiProperty({
    description: 'Unique identifier of the exam',
    example: '652fd6a7e5a69c0012345678',
  })
  id: string;

  @ApiProperty({
    description: 'Current status of the exam calculated from its schedule',
    enum: ['scheduled', 'active', 'completed'],
    example: 'active',
  })
  status: 'scheduled' | 'active' | 'completed';

  @ApiProperty({
    description: 'Date and time when the exam begins',
    example: '2025-11-12T01:00:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'Date and time when the exam ends',
    example: '2025-11-12T02:30:00.000Z',
  })
  endTime: Date;
}

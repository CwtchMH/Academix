# Face Verification System - Implementation Plan

## 📋 Tổng quan

Tài liệu này mô tả chi tiết cách tích hợp **Face Verification** giữa:
- **FastAPI Service** (face-auth-service) - Xử lý AI
- **NestJS Backend** - Quản lý business logic
- **Next.js Frontend** - Giao diện người dùng

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FLOW TỔNG QUÁT                             │
└─────────────────────────────────────────────────────────────────────────┘

                                ┌─────────────┐
                                │  Cloud      │
                                │  Storage    │
                                └─────┬───────┘
                                      │ Ảnh profile
                                      ▼
┌─────────────┐    REST API    ┌─────────────┐    REST API    ┌─────────────┐
│   Next.js   │ ◄────────────► │   NestJS    │ ◄────────────► │   FastAPI   │
│  Frontend   │                │   Backend   │                │ face-auth   │
└─────────────┘                └──────┬──────┘                └─────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │  PostgreSQL │
                               │  (embedding)│
                               └─────────────┘
```

---

## 📦 Part 1: Update `/validate-profile` API

### 1.1 Response Format

**Success Response:**
```json
{
  "valid": true,
  "message": "Image is valid.",
  "embedding": [0.12, -0.34, 0.56, ...],
  "embedding_version": "arcface_v1"
}
```

**Error Response:**
```json
{
  "valid": false,
  "error_code": "BLUR_DETECTED",
  "reason": "Image is too blurry (score: 45 < 100)."
}
```

**Error Codes:**
| Code | Description |
|------|-------------|
| `BLUR_DETECTED` | Image is too blurry |
| `NO_FACE_DETECTED` | No face detected in image |
| `MULTIPLE_FACES` | Multiple faces detected |
| `FACE_TOO_SMALL` | Face is too small/far |
| `FACE_NOT_FRONTAL` | Face is not looking straight |
| `MOUTH_COVERED` | Mouth area is covered |
| `MASK_DETECTED` | Face mask detected |
| `EMBEDDING_FAILED` | Failed to generate embedding |

### 1.2 File Changes

#### [MODIFY] main.py
- Trả về full embedding thay vì preview
- Thêm field `embedding_version`

---

### 1.3 Hướng dẫn NestJS lưu Embedding

#### Database Schema (PostgreSQL + Prisma)

```prisma
// schema.prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  name            String
  
  // Face Embedding
  faceEmbedding   Float[]  // Array of 512 floats
  embeddingVersion String? // "arcface_v1"
  profileImageUrl String?  // URL ảnh trên Cloud
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### NestJS Service Code

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async validateAndSaveProfile(userId: string, file: Express.Multer.File) {
    // 1. Gọi FastAPI để validate
    const formData = new FormData();
    formData.append('file', new Blob([file.buffer]), file.originalname);
    
    const response = await this.httpService.axiosRef.post(
      'http://localhost:8000/validate-profile',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    
    const result = response.data;
    
    if (!result.valid) {
      throw new BadRequestException(result.reason);
    }
    
    // 2. Upload ảnh lên Cloud (S3, Cloudinary, etc.)
    const imageUrl = await this.uploadToCloud(file);
    
    // 3. Lưu embedding vào DB
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        faceEmbedding: result.embedding,      // Array 512 số
        embeddingVersion: result.embedding_version,
        profileImageUrl: imageUrl,
      },
    });
    
    return { success: true, imageUrl };
  }
}
```

#### Lưu ý quan trọng về Embedding

| Thuộc tính | Giá trị |
|------------|---------|
| Kiểu dữ liệu | `Float[]` (PostgreSQL) hoặc `JSON` (MySQL) |
| Kích thước | 512 số float |
| Dung lượng | ~2KB |
| Bảo mật | Không thể khôi phục ảnh từ embedding |

---

## 📦 Part 2: API `/verify-face` mới

### 2.1 API Specification

```
POST /verify-face
Content-Type: multipart/form-data

Body:
- camera_image: File (ảnh chụp từ webcam)
- stored_embedding: string (JSON array of 512 floats)
- check_liveness: boolean (optional, default: true)

Response:
{
  "verified": true,
  "confidence": 0.92,
  "is_same_person": true,
  "liveness": {
    "is_real": true,
    "spoof_probability": 0.03
  },
  "checks": {
    "blur": "pass",
    "face_count": "pass",
    "face_pose": "pass",
    "liveness": "pass"
  }
}
```

### 2.2 File thay đổi

#### [MODIFY] main.py
- Thêm endpoint `/verify-face`

#### [MODIFY] processors.py
- Thêm hàm `compare_embeddings()`
- Thêm hàm `check_liveness()`

#### [MODIFY] core_ai.py
- Thêm model liveness detection

---

## 🔐 Part 3: Liveness Detection (Anti-Spoofing)

### 3.1 Các phương pháp chống giả mạo

| Phương pháp | Mô tả | Độ khó bypass | Đề xuất |
|-------------|-------|---------------|---------|
| **Passive Liveness** | AI tự detect ảnh giả | Trung bình | ✅ Dùng |
| **Active Liveness** | Yêu cầu user làm hành động (nháy mắt, quay đầu) | Cao | 🔄 Optional |
| **3D Depth** | Dùng camera 3D | Rất cao | ❌ Cần hardware |

### 3.2 Đề xuất: DeepFace Anti-Spoofing (Passive)

**Tại sao chọn:**
- ✅ Tích hợp sẵn trong DeepFace
- ✅ Không cần cài model riêng
- ✅ Passive (user không cần làm gì)
- ✅ Phát hiện: ảnh in, màn hình, video

**Code example:**
```python
from deepface import DeepFace

result = DeepFace.extract_faces(
    img_path=image,
    anti_spoofing=True  # Bật tính năng anti-spoofing
)

# result[0]["is_real"] = True/False
# result[0]["antispoof_score"] = 0.95
```

### 3.3 Flow Verify với Liveness

```
Camera Image
    │
    ▼
┌─────────────────┐
│ 1. Check Blur   │ ──▶ Reject nếu mờ
└────────┬────────┘
         ▼
┌─────────────────┐
│ 2. Check Face   │ ──▶ Reject nếu không có mặt
│    Count        │     hoặc nhiều người
└────────┬────────┘
         ▼
┌─────────────────┐
│ 3. Check Pose   │ ──▶ Reject nếu nghiêng quá
└────────┬────────┘
         ▼
┌─────────────────────────────────┐
│ 4. LIVENESS CHECK (Anti-Spoof) │ ──▶ Reject nếu là ảnh/video
│    DeepFace anti_spoofing=True │
└────────┬────────────────────────┘
         ▼
┌─────────────────┐
│ 5. Get Embedding│
└────────┬────────┘
         ▼
┌─────────────────────────────┐
│ 6. Compare với stored_embedding │
│    Cosine Similarity > 0.6  │
└────────┬────────────────────┘
         ▼
    ✅ VERIFIED
```

---

## 📊 Part 4: NestJS Integration

### 4.1 NestJS Service cho Verify

```typescript
// face-verify.service.ts
@Injectable()
export class FaceVerifyService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async verifyFace(userId: string, cameraImage: Express.Multer.File) {
    // 1. Lấy embedding đã lưu từ DB
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { faceEmbedding: true },
    });
    
    if (!user?.faceEmbedding) {
      throw new BadRequestException('User chưa có ảnh profile');
    }
    
    // 2. Gọi FastAPI verify
    const formData = new FormData();
    formData.append('camera_image', new Blob([cameraImage.buffer]));
    formData.append('stored_embedding', JSON.stringify(user.faceEmbedding));
    formData.append('check_liveness', 'true');
    
    const response = await this.httpService.axiosRef.post(
      'http://localhost:8000/verify-face',
      formData,
    );
    
    return response.data;
  }
}
```

### 4.2 NestJS Controller

```typescript
// face-verify.controller.ts
@Controller('exam')
export class ExamController {
  constructor(private faceVerifyService: FaceVerifyService) {}

  @Post('start')
  @UseInterceptors(FileInterceptor('camera_image'))
  async startExam(
    @UploadedFile() cameraImage: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    // Verify face trước khi cho làm bài
    const verifyResult = await this.faceVerifyService.verifyFace(
      user.id,
      cameraImage,
    );
    
    if (!verifyResult.verified) {
      throw new UnauthorizedException({
        message: 'Xác thực khuôn mặt thất bại',
        reason: verifyResult,
      });
    }
    
    // OK - Cho phép vào thi
    return { allowed: true, examSession: '...' };
  }
}
```

---

## ✅ Verification Plan

### Automated Testing

Không có automated tests hiện tại trong project.

### Manual Testing

**Test 1: Update validate-profile**
1. Restart server: `uvicorn main:app --reload`
2. Gửi ảnh hợp lệ lên `/validate-profile`
3. Kiểm tra response có `embedding` (512 số) và `embedding_version`

**Test 2: Verify với ảnh cùng người**
1. Lưu embedding từ Test 1
2. Chụp ảnh mới từ camera
3. Gọi `/verify-face` với camera_image + stored_embedding
4. Kỳ vọng: `verified: true`, `confidence > 0.6`

**Test 3: Verify với ảnh khác người**
1. Dùng embedding từ Test 1
2. Dùng ảnh của người khác
3. Gọi `/verify-face`
4. Kỳ vọng: `verified: false`, `confidence < 0.5`

**Test 4: Liveness với ảnh giả**
1. Chụp ảnh màn hình đang hiển thị khuôn mặt
2. Gọi `/verify-face` với `check_liveness: true`
3. Kỳ vọng: `liveness.is_real: false`

---

## 📝 Summary of Changes

| File | Thay đổi |
|------|----------|
| `main.py` | Thêm endpoint `/verify-face`, update response `/validate-profile` |
| `processors.py` | Thêm `compare_embeddings()`, `check_liveness()` |
| `core_ai.py` | (Không thay đổi - dùng DeepFace anti_spoofing) |

---

> [!IMPORTANT]
> Sau khi approve plan này, tôi sẽ implement code cho FastAPI.
> Bạn sẽ cần implement phần NestJS dựa trên code example ở trên.

'use client';

import { useState, useEffect, useRef } from 'react';
import { AuthService } from '@/services';
import { isAxiosError, type AxiosError } from 'axios';

interface ErrorResponse {
  message: string | string[];
}

interface FaceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Prop để báo hiệu xác thực thành công
}

export const FaceVerificationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: FaceVerificationModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hook API để gọi /auth/verify-face
  const {
    mutate: verifyFace,
    isPending,
  } = AuthService.usePost<any>( // Dùng `any` cho response
    {
      url: '/verify-face',
    },
    {
      onSuccess: (data) => {
        const success = data?.success;
        console.log('Face verification response:', data);
        if (success) {
          onClose();  
          onSuccess(); // Báo cho trang cha là đã thành công
          console.log('Face verified successfully.');
          alert('Face verified successfully. You may now start your exam.');
          setError(null);
        } else {
          // Thất bại -> giữ modal mở, hiển thị lỗi và cho phép thử lại
          const message = data?.message || 'Face verification failed.';
          const msg = Array.isArray(message) ? message.join(', ') : message;
          setError(msg);
          // Optionally show a non-blocking UI toast instead of alert
          console.warn('Face verification failed:', msg);
          // DON'T call onClose() or onSuccess() so user can retry
        }
      },
      onError: (err: unknown) => {
        if (isAxiosError(err)) {
          const message = err.response?.data?.message || 'Face verification failed.';
          setError(Array.isArray(message) ? message.join(', ') : message);
          return;
        }
        // generic fallback for non-Axios errors
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as any).message)
            : 'Face verification failed.';
        setError(msg);
      },
    },
  );

  // Effect để Bật/Tắt webcam
  useEffect(() => {
    const startStream = async () => {
      setError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360 }, // Yêu cầu kích thước nhỏ
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError(
          'Could not access webcam. Please check permissions and try again.',
        );
      }
    };

    const stopStream = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };

    if (isOpen) {
      startStream();
    } else {
      stopStream();
    }

    // Cleanup khi component unmount
    return () => {
      stopStream();
    };
  }, [isOpen]); // Chỉ chạy khi modal đóng/mở

  // Hàm chụp ảnh và gọi API
  const handleVerifyFace = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Component is not ready.');
      return;
    }

    setError(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set kích thước canvas = kích thước video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Vẽ khung hình hiện tại từ video lên canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // Convert canvas sang base64 (định dạng Gemini có thể đọc)
    const base64Image = canvas.toDataURL('image/jpeg', 0.9); // 90% quality

    // Gọi API
    verifyFace({
      data: {
        webcamImage: base64Image,
      },
    });
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 transform">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-[var(--dark-text)]">
                Face Verification
              </h2>
              <button
                onClick={onClose}
                className="text-[var(--medium-text)] hover:text-[var(--dark-text)] p-1 rounded-full hover:bg-gray-100"
                disabled={isPending}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="mt-2 text-base text-[var(--medium-text)]">
              Please position your face in the center of the camera and press verify.
            </p>

            {/* Video Feed */}
            <div className="mt-6 w-full aspect-video bg-gray-200 rounded-md overflow-hidden border border-gray-300">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Canvas ẩn để chụp ảnh */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hiển thị lỗi */}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>

          {/* Footer Buttons */}
          <div className="bg-gray-50 px-8 py-4 flex justify-end gap-3 rounded-b-lg">
            <button
              onClick={onClose}
              className="btn-secondary px-6 py-2 text-sm font-semibold rounded-md shadow-sm"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyFace}
              className="btn-primary px-6 py-2 text-sm font-semibold rounded-md shadow-sm disabled:opacity-50"
              disabled={isPending || !stream} // Tắt nút khi đang load hoặc chưa có stream
            >
              {isPending ? 'Verifying...' : 'Verify My Face'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
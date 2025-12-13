'use client'

import { useState, useEffect, useRef } from 'react'
import { AuthService } from '@/services'
import { isAxiosError } from 'axios'
import { Icon } from '@/components/atoms/Icon/Icon'

interface FaceVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Processing steps
type ProcessingStep = 'idle' | 'capturing' | 'verifying' | 'done'

export const FaceVerificationModal = ({
  isOpen,
  onClose,
  onSuccess
}: FaceVerificationModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Processing modal state
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle')

  // Hook API để gọi /auth/verify-face
  const { mutate: verifyFace } = AuthService.usePost<any>(
    {
      url: '/verify-face'
    },
    {
      onSuccess: (data) => {
        const success = data?.success
        if (success) {
          setError(null)
          setProcessingStep('done')
          // Hiển thị thông báo thành công trong 2 giây rồi đóng modal
          setTimeout(() => {
            setProcessingStep('idle')
            onClose()
            onSuccess()
          }, 2000)
        } else {
          // Thất bại -> giữ modal mở, hiển thị lỗi và cho phép thử lại
          const message = data?.message || 'Face verification failed.'
          const msg = Array.isArray(message) ? message.join(', ') : message
          setError(msg)
          setProcessingStep('idle')
        }
      },
      onError: (err: unknown) => {
        let msg = 'Face verification failed.'
        if (isAxiosError(err)) {
          const message = err.response?.data?.message || msg
          msg = Array.isArray(message) ? message.join(', ') : message
        } else if (err && typeof err === 'object' && 'message' in err) {
          msg = String((err as any).message)
        }
        setError(msg)
        setProcessingStep('idle')
      }
    }
  )

  // Effect để Bật/Tắt webcam
  useEffect(() => {
    const startStream = async () => {
      setError(null)
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360 }
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error('Error accessing webcam:', err)
        setError(
          'Could not access webcam. Please check permissions and try again.'
        )
      }
    }

    const stopStream = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
    }

    if (isOpen) {
      startStream()
    } else {
      stopStream()
    }

    return () => {
      stopStream()
    }
  }, [isOpen])

  // Hàm chụp ảnh và gọi API
  const handleVerifyFace = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Component is not ready.')
      return
    }

    setError(null)
    setProcessingStep('capturing')
    
    const video = videoRef.current
    const canvas = canvasRef.current

    // Set kích thước canvas = kích thước video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Vẽ khung hình hiện tại từ video lên canvas
    const context = canvas.getContext('2d')
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
    }

    // Convert canvas sang base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.9)

    // Update step and call API
    setProcessingStep('verifying')
    
    verifyFace({
      data: {
        webcamImage: base64Image
      }
    })
  }

  const handleClose = () => {
    if (processingStep === 'idle') {
      setError(null)
      onClose()
    }
  }

  // Get step info for display
  const getStepInfo = () => {
    switch (processingStep) {
      case 'capturing':
        return { title: 'Capturing Image', description: 'Taking a snapshot from camera...' }
      case 'verifying':
        return { title: 'Verifying Face', description: 'AI is checking your identity...' }
      case 'done':
        return { title: 'Verification Successful!', description: 'Redirecting to exam...' }
      default:
        return { title: '', description: '' }
    }
  }

  const stepInfo = getStepInfo()
  const isProcessing = processingStep !== 'idle'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Main Modal - Camera View */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${
          isOpen && !isProcessing
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 transform">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-[var(--dark-text)]">
                Face Verification
              </h2>
              <button
                onClick={handleClose}
                className="text-[var(--medium-text)] hover:text-[var(--dark-text)] p-1 rounded-full hover:bg-gray-100"
              >
                <Icon
                  name="close"
                  className="text-[var(--medium-text)]"
                  size="medium"
                />
              </button>
            </div>
            <p className="mt-2 text-base text-[var(--medium-text)]">
              Please position your face in the center of the camera and press
              verify.
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
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Icon name="failed" className="text-red-600" size="medium" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Verification Failed
                  </p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                  <p className="text-xs text-red-500 mt-2">
                    Please ensure your face is clearly visible and try again.
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"
                >
                  <Icon name="close" className="text-red-400" size="medium" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="bg-gray-50 px-8 py-4 flex justify-end gap-3 rounded-b-lg">
            <button
              onClick={handleClose}
              className="btn-secondary px-6 py-2 text-sm font-semibold rounded-md shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyFace}
              className="btn-primary px-6 py-2 text-sm font-semibold rounded-md shadow-sm disabled:opacity-50"
              disabled={!stream}
            >
              Verify My Face
            </button>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      <div
        className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all ${
          isOpen && isProcessing
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-8">
          <div className="flex flex-col items-center justify-center py-4">
            {processingStep === 'done' ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="check" className="text-green-600" size="large" />
              </div>
            ) : (
              <div className="w-16 h-16 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            )}
            
            <h3 className="mt-6 text-xl font-semibold text-slate-800">
              {stepInfo.title}
            </h3>
            <p className="mt-2 text-sm text-slate-500 text-center">
              {stepInfo.description}
            </p>
            
            {/* Progress steps indicator */}
            <div className="mt-6 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                processingStep === 'capturing' || processingStep === 'verifying' || processingStep === 'done' 
                  ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              <div className={`w-2 h-2 rounded-full ${
                processingStep === 'verifying' || processingStep === 'done' 
                  ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              <div className={`w-2 h-2 rounded-full ${
                processingStep === 'done' 
                  ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


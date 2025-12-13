import { useState } from 'react'
import { Modal, Button, message, Image, Spin } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { ImageUploadArea } from '@/components/molecules'
import { updateProfile, validateProfileImage } from '@/services'
import { useAuth } from '@/stores/auth'
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import './upload-image.css'

interface UploadImageProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess?: (imageUrl: string) => void
  currentImageUrl?: string
}

// Processing steps
type ProcessingStep = 'idle' | 'validating' | 'uploading' | 'saving' | 'done'

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const UploadImage = ({
  isOpen,
  onClose,
  onUploadSuccess,
  currentImageUrl
}: UploadImageProps) => {
  const { setUser } = useAuth()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewImage, setPreviewImage] = useState<string>('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Processing modal state
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle')
  const [processingError, setProcessingError] = useState<string | null>(null)

  // Handlers
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid)
    setFileList(newFileList)
  }

  const handleUpdateImageProfile = async (imageUrl: string) => {
    try {
      const response = await updateProfile({ imageUrl })
      if (response.success) {
        setUser(response.data.user)
        onUploadSuccess?.(imageUrl)
        return true
      } else {
        throw new Error(response.message || 'Failed to update avatar')
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to update profile. Please try again.'
      )
    }
  }

  const handleUpload = async () => {
    // Validation
    if (fileList.length === 0) {
      message.warning('Please select an image to upload')
      return
    }

    const file = fileList[0]
    if (!file.originFileObj) {
      message.error('Invalid file')
      return
    }

    const isImage = file.originFileObj.type.startsWith('image/')
    if (!isImage) {
      message.error('Only image files are allowed!')
      return
    }

    const isLt5M = file.originFileObj.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!')
      return
    }

    // Start processing
    setUploading(true)
    setProcessingStep('validating')
    setProcessingError(null)

    try {
      // Step 1: Convert to Base64
      const base64Image = await getBase64(file.originFileObj as File);

      // Step 2: AI Validation
      await validateProfileImage(base64Image);
      
      // Step 3: Upload to Cloudinary
      setProcessingStep('uploading')
      const formData = new FormData()
      formData.append('file', file.originFileObj)
      formData.append('upload_preset', 'my_images')

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dl9mhhoqs/image/upload',
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json();
      if (!data?.secure_url) {
        throw new Error('Cloudinary upload failed.');
      }

      // Step 4: Update profile
      setProcessingStep('saving')
      await handleUpdateImageProfile(data.secure_url);
      
      // Step 5: Done
      setProcessingStep('done')
      
      // Close modal after 1.5s showing success
      setTimeout(() => {
        setProcessingStep('idle')
        setFileList([])
        onClose()
      }, 1500)
      
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = 
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Upload failed. Please try again.';
      
      setProcessingError(errorMessage)
      setProcessingStep('idle')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setFileList([])
    setProcessingStep('idle')
    setProcessingError(null)
    onClose()
  }

  const handleCloseProcessingModal = () => {
    if (processingStep === 'idle' || processingError) {
      setProcessingStep('idle')
      setProcessingError(null)
    }
  }

  // Upload configuration
  const uploadProps: UploadProps = {
    name: 'image',
    listType: 'picture-card',
    fileList,
    onChange: handleChange,
    onPreview: handlePreview,
    onRemove: handleRemove,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('Only image files are allowed!')
        return false
      }
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!')
        return false
      }
      return false // Prevent auto upload
    },
    maxCount: 1,
    accept: 'image/*'
  }

  // Get step info for display
  const getStepInfo = () => {
    switch (processingStep) {
      case 'validating':
        return { title: 'Validating Image', description: 'AI is checking your photo quality...' }
      case 'uploading':
        return { title: 'Uploading Image', description: 'Uploading to cloud storage...' }
      case 'saving':
        return { title: 'Saving Profile', description: 'Updating your profile...' }
      case 'done':
        return { title: 'Success!', description: 'Your avatar has been updated.' }
      default:
        return { title: '', description: '' }
    }
  }

  const stepInfo = getStepInfo()
  const isProcessing = processingStep !== 'idle'

  return (
    <>
      {/* Main Upload Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-800">
              Upload Avatar
            </span>
          </div>
        }
        open={isOpen && !isProcessing}
        onCancel={handleCancel}
        width={650}
        className="upload-image-modal"
        footer={
          <div className="flex justify-end gap-3 pt-4">
            <Button size="large" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleUpload}
              loading={uploading}
              disabled={fileList.length === 0}
              className="min-w-[100px]"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        }
      >
        <div className="py-4">
          {/* Error Alert */}
          {processingError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">Upload Failed</p>
              <p className="text-sm text-red-600 mt-1">{processingError}</p>
            </div>
          )}
          
          <ImageUploadArea
            currentImageUrl={currentImageUrl}
            uploadProps={uploadProps}
            fileList={fileList}
            showGuidelines={true}
            guidelinesVariant="default"
            layout="vertical"
          />
        </div>
      </Modal>

      {/* Processing Modal */}
      <Modal
        open={isProcessing}
        closable={false}
        footer={null}
        centered
        width={400}
        maskClosable={false}
      >
        <div className="flex flex-col items-center justify-center py-8">
          {processingStep === 'done' ? (
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
          ) : (
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
            />
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
              processingStep === 'validating' || processingStep === 'uploading' || processingStep === 'saving' || processingStep === 'done' 
                ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
            <div className={`w-2 h-2 rounded-full ${
              processingStep === 'uploading' || processingStep === 'saving' || processingStep === 'done' 
                ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
            <div className={`w-2 h-2 rounded-full ${
              processingStep === 'saving' || processingStep === 'done' 
                ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
            <div className={`w-2 h-2 rounded-full ${
              processingStep === 'done' 
                ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        title="Preview Image"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <Image
          alt="preview"
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </>
  )
}

export default UploadImage


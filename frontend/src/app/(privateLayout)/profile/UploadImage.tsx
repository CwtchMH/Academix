import { useState } from 'react'
import { Modal, Button, message, Image } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { ImageUploadArea } from '@/components/molecules'
import { updateProfile, validateProfileImage } from '@/services'
import { useAuth } from '@/stores/auth'
import './upload-image.css'

interface UploadImageProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess?: (imageUrl: string) => void
  currentImageUrl?: string
}

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
  const [messageApi, contextHolder] = message.useMessage();

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
        message.success('Avatar updated successfully!')
        onUploadSuccess?.(imageUrl)
        onClose()
      } else {
        message.error(response.message || 'Failed to update avatar')
      }
    } catch (error: any) {
      message.error(
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

    // Upload to Cloudinary
    setUploading(true)
    let base64Image = '';
    try {
      // Convert sang Base64 ---
      base64Image = await getBase64(file.originFileObj as File);

      // Call AI Validation ---
      messageApi.open({
        key: 'ai-validate',
        type: 'loading',
        content: 'AI is validating your image...',
      });
      await validateProfileImage(base64Image); // Send base64 (including data:...)
      messageApi.success({
        key: 'ai-validate',
        content: 'Image is valid! Uploading...',
      });
      // (If AI succeeds) Upload to Cloudinary
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
      if (data?.secure_url) {
        // (If Cloudinary succeeds) Update profile
        await handleUpdateImageProfile(data.secure_url);
        // (handleUpdateImageProfile already has message.success and onClose)
      } else {
        throw new Error('Cloudinary upload failed.');
      }
    } catch (error: any) {
      // Handle errors (from AI or Cloudinary)
      console.error('Upload error:', error);
      messageApi.destroy('ai-validate'); // Close loading message
      
      // // Display error from AI (400 Bad Request)
      const errorMessage = 
        error.response?.data?.error?.message || // Get detailed message from your error structure
        error.response?.data?.message ||        // Fallback for default NestJS error structure
        'Upload failed. Please try again.';

      // Show errors to users (longer time to read: 10s)
      messageApi.error({
        content: errorMessage,
        duration: 10, 
      });
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setFileList([])
    onClose()
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

  return (
    <>
    {contextHolder}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-800">
              Upload Avatar
            </span>
          </div>
        }
        open={isOpen}
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
      Preview Modal
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

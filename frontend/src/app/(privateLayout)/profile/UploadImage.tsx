import { useState } from "react";
import { Modal, Upload, Button, message, Image, Space, Typography } from "antd";
import { UploadOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { updateProfile } from "@/services";
import { useAuth } from "@/stores/auth";

const { Text } = Typography;

interface UploadImageProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (imageUrl: string) => void;
  currentImageUrl?: string;
}

const UploadImage = ({
  isOpen,
  onClose,
  onUploadSuccess,
  currentImageUrl,
}: UploadImageProps) => {
  const { setUser } = useAuth();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);
  };

  const handleUpdateImageProfile = async (imageUrl: string) => {
    try {
      const response = await updateProfile({
        imageUrl: imageUrl,
      });
      if (response.success) {
        setUser(response.data.user);
        message.success("Image updated successfully!");
        onClose();
      } else {
        message.error(response.message || "Failed to update image");
      }
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng chọn ảnh để upload");
      return;
    }

    const file = fileList[0];
    if (!file.originFileObj) {
      message.error("File không hợp lệ");
      return;
    }

    const isImage = file.originFileObj.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      return;
    }

    const isLt5M = file.originFileObj.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Ảnh phải nhỏ hơn 5MB!");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file.originFileObj);
      formData.append("upload_preset", "my_images");
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dl9mhhoqs/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data?.secure_url) handleUpdateImageProfile(data?.secure_url);
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Upload ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    onClose();
  };

  const uploadProps: UploadProps = {
    name: "image",
    listType: "picture-card",
    fileList: fileList,
    onChange: handleChange,
    onPreview: handlePreview,
    onRemove: handleRemove,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ được upload file ảnh!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Ảnh phải nhỏ hơn 5MB!");
        return false;
      }
      return false;
    },
    maxCount: 1,
    accept: "image/*",
  };

  return (
    <>
      <Modal
        title="Upload Ảnh Đại Diện"
        open={isOpen}
        onCancel={handleCancel}
        width={600}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="upload"
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={fileList.length === 0}
          >
            Upload
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {currentImageUrl && (
            <div>
              <Text strong>Ảnh hiện tại:</Text>
              <div style={{ marginTop: 8 }}>
                <Image
                  src={currentImageUrl}
                  alt="Current avatar"
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                  preview={{
                    mask: <EyeOutlined />,
                  }}
                />
              </div>
            </div>
          )}
          <div>
            <Text strong>Chọn ảnh mới:</Text>
            <div style={{ marginTop: 8 }}>
              <Upload {...uploadProps}>
                {fileList.length >= 1 ? null : (
                  <div style={{ padding: "20px" }}>
                    <UploadOutlined
                      style={{ fontSize: "24px", color: "#1890ff" }}
                    />
                    <div style={{ marginTop: 8 }}>Click để chọn ảnh</div>
                  </div>
                )}
              </Upload>
            </div>
          </div>
          {/* Upload Guidelines */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f6f8fa",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#666",
            }}
          >
            <Text strong>Lưu ý:</Text>
            <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
              <li>Chỉ hỗ trợ định dạng: JPG, PNG, GIF</li>
              <li>Kích thước tối đa: 5MB</li>
              <li>Khuyến nghị tỷ lệ: 1:1 (vuông)</li>
            </ul>
          </div>
        </Space>
      </Modal>
      <Modal
        open={previewOpen}
        title="Xem trước ảnh"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default UploadImage;

export interface EditProfileFormData {
  fullName: string;
  email: string;
  dateOfBirth: string;
}

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

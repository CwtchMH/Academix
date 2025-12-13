# core_ai.py - AI Models Manager
import mediapipe as mp
from transformers import ViTForImageClassification, ViTImageProcessor
import torch
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("core_ai")


class AIModels:
    """Quản lý tất cả AI models dùng cho face validation."""
    
    def __init__(self):
        self.mp_face_detection = None  # Detect số lượng người
        self.mp_face_mesh = None       # Detect landmarks & tính góc
        self.mask_model = None         # ViT mask classifier
        self.mask_processor = None
        self.is_ready = False

    def load_models(self):
        logger.info("⏳ Đang tải AI Models...")
        
        # 1. MediaPipe Face Detection - để đếm số người
        try:
            self.mp_face_detection = mp.solutions.face_detection.FaceDetection(
                model_selection=1,  # 1 = full-range (detect xa hơn)
                min_detection_confidence=0.5
            )
            logger.info("✅ MediaPipe Face Detection Loaded.")
        except Exception as e:
            logger.error(f"❌ Lỗi Face Detection: {e}")

        # 2. MediaPipe Face Mesh - để tính góc mặt (pose)
        try:
            self.mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5
            )
            logger.info("✅ MediaPipe Face Mesh Loaded.")
        except Exception as e:
            logger.error(f"❌ Lỗi Face Mesh: {e}")

        # 3. ViT Mask Detection - Model mới với 99.53% accuracy
        # Model: Hemgg/Facemask-detection (fine-tuned ViT)
        model_name = "Hemgg/Facemask-detection"
        try:
            logger.info(f"⏳ Đang tải Mask Model: {model_name}...")
            self.mask_processor = ViTImageProcessor.from_pretrained(model_name)
            self.mask_model = ViTForImageClassification.from_pretrained(model_name)
            self.mask_model.eval()  # Set to evaluation mode
            logger.info("✅ ViT Mask Classifier Loaded (99.53% accuracy).")
        except Exception as e:
            logger.warning(f"⚠️ Không tải được Mask Classifier: {e}")
            self.mask_model = None
            self.mask_processor = None

        self.is_ready = True
        logger.info("✅ AI Models Ready!")


ai_engine = AIModels()
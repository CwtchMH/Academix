# processors.py - Face Validation Processors
import cv2
import numpy as np
from PIL import Image
import torch
import math

from core_ai import ai_engine


# =============================================================================
# 1. CHECK BLUR
# =============================================================================
def check_blur(img: np.ndarray, threshold: int = 22) -> dict:
    """
    Check if image is too blurry using Laplacian variance.
    
    Default threshold: 50 (lowered from 100 to accommodate webcam quality)
    - Profile images: use threshold=80 for stricter check
    - Webcam/verify: use default 50 for more tolerance
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    score = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    if score < threshold:
        return {
            "valid": False,
            "error_code": "BLUR_DETECTED",
            "reason": f"Image is too blurry (score: {score:.0f} < {threshold})."
        }
    return {"valid": True, "blur_score": score}


# =============================================================================
# 2. CHECK FACE COUNT
# =============================================================================
def check_face_count(img: np.ndarray) -> dict:
    """Check number of faces in image. Requires exactly 1 face."""
    if ai_engine.mp_face_detection is None:
        return {"valid": True, "warning": "Face Detection not loaded"}
    
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = ai_engine.mp_face_detection.process(rgb)
    
    if not results.detections:
        return {
            "valid": False,
            "error_code": "NO_FACE_DETECTED",
            "reason": "No face detected in image."
        }
    
    face_count = len(results.detections)
    if face_count > 1:
        return {
            "valid": False,
            "error_code": "MULTIPLE_FACES",
            "reason": f"Detected {face_count} faces. Only 1 person allowed."
        }
    
    detection = results.detections[0]
    return {"valid": True, "detection": detection}


# =============================================================================
# 3. CHECK FACE SIZE
# =============================================================================
def check_face_size(img: np.ndarray, detection, min_percent: float = 0.03) -> dict:
    """Check if face is large enough (not too far from camera)."""
    h_img, w_img = img.shape[:2]
    bbox = detection.location_data.relative_bounding_box
    
    face_w = bbox.width * w_img
    face_h = bbox.height * h_img
    face_area = face_w * face_h
    img_area = w_img * h_img
    
    face_percent = face_area / img_area
    
    if face_percent < min_percent:
        return {
            "valid": False,
            "error_code": "FACE_TOO_SMALL",
            "reason": f"Face is too small/far ({face_percent:.1%} < {min_percent:.0%})."
        }
    
    return {"valid": True, "face_percent": face_percent}


# =============================================================================
# 4. CHECK FACE POSE
# =============================================================================
def check_face_pose(img: np.ndarray, max_yaw: int = 25, max_pitch: int = 25) -> dict:
    """
    Check if face is looking straight at camera.
    YAW: Left/right rotation
    PITCH: Up/down rotation
    """
    if ai_engine.mp_face_mesh is None:
        return {"valid": True, "warning": "FaceMesh not loaded"}
    
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = ai_engine.mp_face_mesh.process(rgb)
    
    if not results.multi_face_landmarks:
        return {
            "valid": False,
            "error_code": "NO_FACE_DETECTED",
            "reason": "Could not detect facial landmarks."
        }
    
    landmarks = results.multi_face_landmarks[0].landmark
    h, w = img.shape[:2]
    
    # Key landmarks
    nose_tip = landmarks[1]
    left_cheek = landmarks[234]
    right_cheek = landmarks[454]
    forehead = landmarks[10]
    chin = landmarks[152]
    
    # Calculate YAW
    nose_to_left_cheek = abs(nose_tip.x - left_cheek.x)
    nose_to_right_cheek = abs(nose_tip.x - right_cheek.x)
    
    if nose_to_left_cheek > 0.001 and nose_to_right_cheek > 0.001:
        yaw_ratio = min(nose_to_left_cheek, nose_to_right_cheek) / max(nose_to_left_cheek, nose_to_right_cheek)
        yaw_angle = (1 - yaw_ratio) * 60
        
        if nose_to_left_cheek > nose_to_right_cheek:
            yaw = yaw_angle
        else:
            yaw = -yaw_angle
    else:
        yaw = 0
        yaw_ratio = 1
    
    # Calculate PITCH
    forehead_to_nose = abs(forehead.y - nose_tip.y)
    nose_to_chin = abs(nose_tip.y - chin.y)
    
    if nose_to_chin > 0.001:
        pitch_ratio = forehead_to_nose / nose_to_chin
        if pitch_ratio < 0.5:
            pitch = -35
        elif pitch_ratio > 1.6:
            pitch = 35
        else:
            pitch = (pitch_ratio - 1) * 25
    else:
        pitch = 0
        pitch_ratio = 1
    
    print(f"[DEBUG] Pose - yaw_ratio: {yaw_ratio:.2f}, yaw: {yaw:.1f}°, pitch_ratio: {pitch_ratio:.2f}, pitch: {pitch:.1f}°")
    
    if abs(yaw) > max_yaw:
        direction = "right" if yaw > 0 else "left"
        return {
            "valid": False,
            "error_code": "FACE_NOT_FRONTAL",
            "reason": f"Face is turned too much to the {direction} ({abs(yaw):.0f}°). Please look straight at camera."
        }
    
    if abs(pitch) > max_pitch:
        direction = "down" if pitch > 0 else "up"
        return {
            "valid": False,
            "error_code": "FACE_NOT_FRONTAL",
            "reason": f"Face is tilted too much {direction}. Please look straight at camera."
        }
    
    return {"valid": True, "yaw": yaw, "pitch": pitch, "landmarks": landmarks}


# =============================================================================
# 4b. CHECK MOUTH VISIBLE (Backup for mask detection)
# =============================================================================
def check_mouth_visible(img: np.ndarray, landmarks=None) -> dict:
    """Check if mouth area is visible (not covered by mask)."""
    if landmarks is None:
        if ai_engine.mp_face_mesh is None:
            return {"valid": True, "warning": "FaceMesh not loaded"}
        
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = ai_engine.mp_face_mesh.process(rgb)
        
        if not results.multi_face_landmarks:
            return {
                "valid": False,
                "error_code": "NO_FACE_DETECTED",
                "reason": "Could not detect facial landmarks."
            }
        
        landmarks = results.multi_face_landmarks[0].landmark
    
    # Mouth landmarks
    upper_lip = landmarks[13]
    lower_lip = landmarks[14]
    left_mouth = landmarks[61]
    right_mouth = landmarks[291]
    nose_tip = landmarks[1]
    chin = landmarks[152]
    
    mouth_height = abs(lower_lip.y - upper_lip.y)
    mouth_width = abs(right_mouth.x - left_mouth.x)
    face_height = abs(chin.y - nose_tip.y)
    
    mouth_height_ratio = mouth_height / face_height if face_height > 0.001 else 0
    mouth_width_ratio = mouth_width / face_height if face_height > 0.001 else 0
    
    print(f"[DEBUG] Mouth - height_ratio: {mouth_height_ratio:.3f}, width_ratio: {mouth_width_ratio:.3f}")
    
    if mouth_width_ratio < 0.12:
        return {
            "valid": False,
            "error_code": "MOUTH_COVERED",
            "reason": "Mouth area appears to be covered. Please remove mask or any obstruction."
        }
    
    return {"valid": True, "mouth_height_ratio": mouth_height_ratio, "mouth_width_ratio": mouth_width_ratio}


# =============================================================================
# 5. CHECK MASK
# =============================================================================
def check_mask(img: np.ndarray, threshold: float = 0.60) -> dict:
    """
    Check if person is wearing a face mask using ViT model.
    Model: Hemgg/Facemask-detection (99.53% accuracy)
    """
    if ai_engine.mask_model is None or ai_engine.mask_processor is None:
        return {"valid": True, "warning": "Mask model not loaded"}
    
    try:
        h, w = img.shape[:2]
        center_crop = img[h//8:h*7//8, w//8:w*7//8]
        
        pil_img = Image.fromarray(cv2.cvtColor(center_crop, cv2.COLOR_BGR2RGB))
        inputs = ai_engine.mask_processor(images=pil_img, return_tensors="pt")
        
        with torch.no_grad():
            outputs = ai_engine.mask_model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1).squeeze().tolist()
        
        # Model labels: index 0 = "Mask", index 1 = "WithoutMask"
        mask_prob = probs[0] if isinstance(probs, list) else 0
        no_mask_prob = probs[1] if isinstance(probs, list) and len(probs) > 1 else 1
        
        print(f"[DEBUG] Mask Detection (ViT) - mask: {mask_prob:.2%}, no_mask: {no_mask_prob:.2%}")
        
        if mask_prob > threshold:
            return {
                "valid": False,
                "error_code": "MASK_DETECTED",
                "reason": f"Face mask detected ({mask_prob:.0%}). Please remove your mask."
            }
        
        return {"valid": True, "mask_prob": mask_prob}
    
    except Exception as e:
        print(f"[WARN] Mask check error: {e}")
        return {"valid": True, "warning": str(e)}


# =============================================================================
# 6. GET FACE EMBEDDING
# =============================================================================
def get_face_embedding(img: np.ndarray) -> dict:
    """Generate face embedding using DeepFace + ArcFace."""
    try:
        from deepface import DeepFace
        
        embedding_objs = DeepFace.represent(
            img_path=img,
            model_name="ArcFace",
            enforce_detection=False,
            detector_backend="skip"
        )
        
        if not embedding_objs:
            return {
                "valid": False,
                "error_code": "EMBEDDING_FAILED",
                "reason": "Failed to generate face embedding."
            }
        
        return {
            "valid": True,
            "embedding": embedding_objs[0]["embedding"]
        }
    
    except Exception as e:
        print(f"[ERROR] Embedding error: {e}")
        return {
            "valid": False,
            "error_code": "EMBEDDING_FAILED",
            "reason": f"Embedding generation error: {str(e)}"
        }


# =============================================================================
# 7. COMPARE EMBEDDINGS
# =============================================================================
def compare_embeddings(embedding1: list, embedding2: list, threshold: float = 0.6) -> dict:
    """
    Compare two face embeddings using cosine similarity.
    
    Args:
        embedding1: First embedding (stored profile embedding)
        embedding2: Second embedding (camera image embedding)
        threshold: Minimum similarity to be considered same person (default 0.6)
    
    Returns:
        { verified: bool, confidence: float, is_same_person: bool }
    """
    try:
        # Convert to numpy arrays
        emb1 = np.array(embedding1)
        emb2 = np.array(embedding2)
        
        # Normalize vectors
        emb1_norm = emb1 / np.linalg.norm(emb1)
        emb2_norm = emb2 / np.linalg.norm(emb2)
        
        # Cosine similarity
        similarity = np.dot(emb1_norm, emb2_norm)
        
        # Clamp to [0, 1]
        similarity = float(max(0, min(1, similarity)))
        
        is_same_person = similarity >= threshold
        
        print(f"[DEBUG] Embedding comparison - similarity: {similarity:.4f}, threshold: {threshold}, match: {is_same_person}")
        
        return {
            "verified": is_same_person,
            "confidence": round(similarity, 4),
            "is_same_person": is_same_person
        }
    
    except Exception as e:
        print(f"[ERROR] Embedding comparison error: {e}")
        return {
            "verified": False,
            "confidence": 0.0,
            "is_same_person": False,
            "error": str(e)
        }


# =============================================================================
# 8. CHECK LIVENESS (Anti-Spoofing)
# =============================================================================
def check_liveness(img: np.ndarray) -> dict:
    """
    Check if the face is from a real person (not a photo/video/screen).
    Uses DeepFace anti-spoofing feature.
    
    Returns:
        { valid: bool, is_real: bool, spoof_probability: float }
    """
    try:
        from deepface import DeepFace
        
        # Extract faces with anti-spoofing enabled
        result = DeepFace.extract_faces(
            img_path=img,
            detector_backend="opencv",
            enforce_detection=True,
            anti_spoofing=True
        )
        
        if not result:
            return {
                "valid": False,
                "error_code": "NO_FACE_DETECTED",
                "reason": "No face detected for liveness check."
            }
        
        face_data = result[0]
        is_real = face_data.get("is_real", True)
        antispoof_score = face_data.get("antispoof_score", 1.0)
        spoof_probability = 1 - antispoof_score
        
        print(f"[DEBUG] Liveness check - is_real: {is_real}, antispoof_score: {antispoof_score:.4f}")
        
        if not is_real:
            return {
                "valid": False,
                "error_code": "SPOOF_DETECTED",
                "reason": f"Spoofing detected ({spoof_probability:.0%} probability). Please use a real camera, not a photo or screen.",
                "is_real": False,
                "spoof_probability": round(spoof_probability, 4)
            }
        
        return {
            "valid": True,
            "is_real": True,
            "spoof_probability": round(spoof_probability, 4)
        }
    
    except Exception as e:
        print(f"[WARN] Liveness check error: {e}")
        # If liveness check fails, we still allow (fail-open for better UX)
        # In production, you might want to fail-close instead
        return {
            "valid": True,
            "warning": f"Liveness check unavailable: {str(e)}",
            "is_real": None,
            "spoof_probability": None
        }
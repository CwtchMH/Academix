# main.py - Face Profile Validation API
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from contextlib import asynccontextmanager

from core_ai import ai_engine
import processors as proc


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load AI models on startup."""
    ai_engine.load_models()
    yield


app = FastAPI(
    lifespan=lifespan, 
    title="Face Profile Validation API",
    description="API for validating profile images for face authentication"
)


@app.get("/")
def health_check():
    """Check service status."""
    return {"status": "Running", "ai_ready": ai_engine.is_ready}


@app.post("/validate-profile")
async def validate_profile(file: UploadFile = File(...)):
    """
    Validate profile image with 5 criteria:
    1. Image not blurry
    2. Exactly 1 person
    3. Face large enough (not too far)
    4. Face looking straight (not tilted)
    5. No face mask
    
    Returns:
        Success: { valid: true, message, embedding, embedding_version }
        Error: { valid: false, error_code, reason }
    """
    # Read and decode image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(400, "Could not read image file.")

    # =========================================================================
    # STEP 1: Check Blur
    # =========================================================================
    blur_result = proc.check_blur(img)
    if not blur_result["valid"]:
        return blur_result

    # =========================================================================
    # STEP 2: Check Face Count (exactly 1 person)
    # =========================================================================
    face_count_result = proc.check_face_count(img)
    if not face_count_result["valid"]:
        return face_count_result
    
    detection = face_count_result.get("detection")

    # =========================================================================
    # STEP 3: Check Face Size (not too small/far)
    # =========================================================================
    if detection:
        size_result = proc.check_face_size(img, detection)
        if not size_result["valid"]:
            return size_result

    # =========================================================================
    # STEP 4: Check Face Pose (looking straight)
    # =========================================================================
    pose_result = proc.check_face_pose(img)
    if not pose_result["valid"]:
        return pose_result
    
    landmarks = pose_result.get("landmarks")

    # =========================================================================
    # STEP 4b: Check Mouth Visible (backup for mask detection)
    # =========================================================================
    mouth_result = proc.check_mouth_visible(img, landmarks)
    if not mouth_result["valid"]:
        return mouth_result

    # =========================================================================
    # STEP 5: Check Mask (no face mask)
    # =========================================================================
    mask_result = proc.check_mask(img)
    if not mask_result["valid"]:
        return mask_result

    # =========================================================================
    # STEP 6: Get Face Embedding
    # =========================================================================
    embedding_result = proc.get_face_embedding(img)
    if not embedding_result["valid"]:
        return embedding_result

    # All checks passed!
    return {
        "valid": True,
        "message": "Image is valid.",
        "embedding": embedding_result["embedding"],
        "embedding_version": "arcface_v1"
    }


@app.post("/verify-face")
async def verify_face(
    camera_image: UploadFile = File(...),
    stored_embedding: str = None,
    check_liveness: bool = True
):
    """
    Verify if camera image matches stored profile embedding.
    
    Args:
        camera_image: Image captured from webcam
        stored_embedding: JSON string of 512 floats (from validate-profile)
        check_liveness: Whether to check for spoofing (default: true)
    
    Returns:
        Success: { verified: true, confidence, liveness, checks }
        Error: { verified: false, error_code, reason }
    """
    import json
    
    # Parse stored embedding
    if not stored_embedding:
        return {
            "verified": False,
            "error_code": "MISSING_EMBEDDING",
            "reason": "stored_embedding is required."
        }
    
    try:
        profile_embedding = json.loads(stored_embedding)
        if not isinstance(profile_embedding, list) or len(profile_embedding) != 512:
            raise ValueError("Invalid embedding format")
    except (json.JSONDecodeError, ValueError) as e:
        return {
            "verified": False,
            "error_code": "INVALID_EMBEDDING",
            "reason": f"Invalid embedding format: {str(e)}"
        }
    
    # Read and decode camera image
    contents = await camera_image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(400, "Could not read camera image.")
    
    # Track checks status
    checks = {}
    
    # =========================================================================
    # STEP 1: Check Blur
    # =========================================================================
    blur_result = proc.check_blur(img)
    checks["blur"] = "pass" if blur_result["valid"] else "fail"
    if not blur_result["valid"]:
        return {
            "verified": False,
            **blur_result,
            "checks": checks
        }
    
    # =========================================================================
    # STEP 2: Check Face Count
    # =========================================================================
    face_count_result = proc.check_face_count(img)
    checks["face_count"] = "pass" if face_count_result["valid"] else "fail"
    if not face_count_result["valid"]:
        return {
            "verified": False,
            **face_count_result,
            "checks": checks
        }
    
    # =========================================================================
    # STEP 3: Check Face Pose
    # =========================================================================
    pose_result = proc.check_face_pose(img)
    checks["face_pose"] = "pass" if pose_result["valid"] else "fail"
    if not pose_result["valid"]:
        return {
            "verified": False,
            **pose_result,
            "checks": checks
        }
    
    # =========================================================================
    # STEP 4: Liveness Check (Anti-Spoofing)
    # =========================================================================
    liveness_data = {"is_real": None, "spoof_probability": None}
    
    if check_liveness:
        liveness_result = proc.check_liveness(img)
        checks["liveness"] = "pass" if liveness_result["valid"] else "fail"
        liveness_data = {
            "is_real": liveness_result.get("is_real"),
            "spoof_probability": liveness_result.get("spoof_probability")
        }
        
        if not liveness_result["valid"]:
            return {
                "verified": False,
                **liveness_result,
                "liveness": liveness_data,
                "checks": checks
            }
    else:
        checks["liveness"] = "skipped"
    
    # =========================================================================
    # STEP 5: Get Camera Image Embedding
    # =========================================================================
    embedding_result = proc.get_face_embedding(img)
    checks["embedding"] = "pass" if embedding_result["valid"] else "fail"
    if not embedding_result["valid"]:
        return {
            "verified": False,
            **embedding_result,
            "checks": checks
        }
    
    camera_embedding = embedding_result["embedding"]
    
    # =========================================================================
    # STEP 6: Compare Embeddings
    # =========================================================================
    comparison_result = proc.compare_embeddings(profile_embedding, camera_embedding)
    checks["comparison"] = "pass" if comparison_result["verified"] else "fail"
    
    # Return final result
    return {
        "verified": comparison_result["verified"],
        "confidence": comparison_result["confidence"],
        "is_same_person": comparison_result["is_same_person"],
        "liveness": liveness_data,
        "checks": checks
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
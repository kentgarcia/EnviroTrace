from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from typing import List, Optional
from sqlalchemy.orm import Session
import base64
import json
import logging

from app.schemas.gemini_schemas import (
    GeminiTextRequest,
    GeminiImageRequest,
    GeminiMultimodalRequest,
    GeminiResponse,
    GeminiErrorResponse,
    EnvironmentalAnalysisRequest,
    EnvironmentalAnalysisResponse,
    GeminiUsageStats,
    PlateRecognitionRequest,
    PlateRecognitionResponse
)
from app.services.gemini_service import gemini_service
from app.apis.deps import get_current_user, get_db
from app.models.auth_models import User

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/text", response_model=GeminiResponse)
async def generate_text(
    request: GeminiTextRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate text using Gemini API
    
    - **prompt**: Text prompt for generation
    - **model**: Gemini model to use (default: gemini-2.0-flash-lite)
    - **max_tokens**: Maximum tokens to generate
    - **temperature**: Temperature for generation (0.0-2.0)
    """
    try:
        if request.stream:
            raise HTTPException(
                status_code=400, 
                detail="Use /text/stream endpoint for streaming responses"
            )
        
        result = await gemini_service.generate_text(request)
        logger.info(f"Text generation completed for user {current_user.id}")
        return result
        
    except Exception as e:
        logger.error(f"Text generation failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/text/stream")
async def generate_text_stream(
    request: GeminiTextRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate text using Gemini API with streaming response
    
    Returns server-sent events with text chunks
    """
    try:
        async def generate():
            yield "data: {\"status\": \"started\"}\n\n"
            
            async for chunk in gemini_service.generate_text_stream(request):
                chunk_data = {
                    "text": chunk.text,
                    "is_final": chunk.is_final,
                    "chunk_id": chunk.chunk_id
                }
                yield f"data: {json.dumps(chunk_data)}\n\n"
                
                if chunk.is_final:
                    break
            
            yield "data: {\"status\": \"completed\"}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream"
            }
        )
        
    except Exception as e:
        logger.error(f"Streaming text generation failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image/analyze", response_model=GeminiResponse)
async def analyze_image(
    prompt: str = Form(...),
    model: str = Form(default="gemini-2.0-flash-lite"),
    max_tokens: Optional[int] = Form(default=None),
    temperature: Optional[float] = Form(default=None),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze an image with text prompt using Gemini API
    
    - **prompt**: Text prompt for image analysis
    - **image**: Image file to analyze
    - **model**: Gemini model to use
    - **max_tokens**: Maximum tokens to generate
    - **temperature**: Temperature for generation (0.0-2.0)
    """
    try:
        # Validate image file
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail="Uploaded file must be an image"
            )
        
        # Read and encode image
        image_data = await image.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Create request
        request = GeminiImageRequest(
            prompt=prompt,
            image_data=image_base64,
            mime_type=image.content_type,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        result = await gemini_service.analyze_image(request)
        logger.info(f"Image analysis completed for user {current_user.id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image analysis failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image/analyze-json", response_model=GeminiResponse)
async def analyze_image_json(
    request: GeminiImageRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze an image with text prompt using Gemini API (JSON payload)
    
    - **prompt**: Text prompt for image analysis
    - **image_data**: Base64 encoded image data
    - **mime_type**: Image MIME type
    - **model**: Gemini model to use
    - **max_tokens**: Maximum tokens to generate
    - **temperature**: Temperature for generation (0.0-2.0)
    """
    try:
        result = await gemini_service.analyze_image(request)
        logger.info(f"Image analysis (JSON) completed for user {current_user.id}")
        return result
        
    except Exception as e:
        logger.error(f"Image analysis (JSON) failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/multimodal", response_model=GeminiResponse)
async def generate_multimodal(
    request: GeminiMultimodalRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate content with multimodal input (text + multiple images)
    
    - **text_prompt**: Text prompt for generation
    - **images**: List of images with base64 data and mime_type
    - **model**: Gemini model to use
    - **max_tokens**: Maximum tokens to generate
    - **temperature**: Temperature for generation (0.0-2.0)
    """
    try:
        if not request.images:
            raise HTTPException(
                status_code=400,
                detail="At least one image is required for multimodal generation"
            )
        
        result = await gemini_service.generate_multimodal(request)
        logger.info(f"Multimodal generation completed for user {current_user.id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Multimodal generation failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/multimodal/upload")
async def upload_multimodal(
    text_prompt: str = Form(...),
    model: str = Form(default="gemini-2.0-flash-lite"),
    max_tokens: Optional[int] = Form(default=None),
    temperature: Optional[float] = Form(default=None),
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Generate multimodal content with file uploads
    
    - **text_prompt**: Text prompt for generation
    - **images**: Multiple image files
    - **model**: Gemini model to use
    - **max_tokens**: Maximum tokens to generate
    - **temperature**: Temperature for generation (0.0-2.0)
    """
    try:
        # Process uploaded images
        processed_images = []
        for img in images:
            if not img.content_type or not img.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=400,
                    detail=f"File {img.filename} must be an image"
                )
            
            image_data = await img.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            processed_images.append({
                'data': image_base64,
                'mime_type': img.content_type
            })
        
        # Create request
        request = GeminiMultimodalRequest(
            text_prompt=text_prompt,
            images=processed_images,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        result = await gemini_service.generate_multimodal(request)
        logger.info(f"Multimodal upload generation completed for user {current_user.id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Multimodal upload generation failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/environmental/analyze", response_model=EnvironmentalAnalysisResponse)
async def analyze_environmental_data(
    request: EnvironmentalAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Specialized environmental data analysis using Gemini API
    
    - **data_type**: Type of environmental data (air_quality, emissions, tree_health, etc.)
    - **prompt**: Analysis prompt
    - **data_context**: Contextual data for analysis
    - **images**: Optional images for analysis
    - **analysis_focus**: Specific focus area for analysis
    """
    try:
        result = await gemini_service.analyze_environmental_data(request)
        logger.info(f"Environmental analysis completed for user {current_user.id}")
        return result
        
    except Exception as e:
        logger.error(f"Environmental analysis failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/environmental/analyze-upload")
async def analyze_environmental_data_upload(
    data_type: str = Form(...),
    prompt: str = Form(...),
    analysis_focus: Optional[str] = Form(default=None),
    data_context: Optional[str] = Form(default=None),
    images: Optional[List[UploadFile]] = File(default=None),
    current_user: User = Depends(get_current_user)
):
    """
    Environmental analysis with file uploads
    
    - **data_type**: Type of environmental data
    - **prompt**: Analysis prompt
    - **analysis_focus**: Specific focus area
    - **data_context**: JSON string of contextual data
    - **images**: Optional image files
    """
    try:
        # Process contextual data
        context_dict = None
        if data_context:
            try:
                context_dict = json.loads(data_context)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="data_context must be valid JSON"
                )
        
        # Process uploaded images
        processed_images = None
        if images:
            processed_images = []
            for img in images:
                if not img.content_type or not img.content_type.startswith('image/'):
                    raise HTTPException(
                        status_code=400,
                        detail=f"File {img.filename} must be an image"
                    )
                
                image_data = await img.read()
                image_base64 = base64.b64encode(image_data).decode('utf-8')
                processed_images.append({
                    'data': image_base64,
                    'mime_type': img.content_type
                })
        
        # Create request
        request = EnvironmentalAnalysisRequest(
            data_type=data_type,
            prompt=prompt,
            data_context=context_dict,
            images=processed_images,
            analysis_focus=analysis_focus
        )
        
        result = await gemini_service.analyze_environmental_data(request)
        logger.info(f"Environmental analysis (upload) completed for user {current_user.id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Environmental analysis (upload) failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tokens/count", response_model=GeminiUsageStats)
async def count_tokens(
    text: str,
    model: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Count tokens for given text
    
    - **text**: Text to count tokens for
    - **model**: Model to use for token counting (optional)
    """
    try:
        result = await gemini_service.count_tokens(text, model)
        logger.info(f"Token counting completed for user {current_user.id}")
        return result
        
    except Exception as e:
        logger.error(f"Token counting failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recognize-plate", response_model=PlateRecognitionResponse)
async def recognize_license_plate(
    request: PlateRecognitionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Recognize license plate from image and check if vehicle exists in database
    
    - **request**: JSON body with image_data (base64) and mime_type
    """
    try:
        # Extract parameters from request body
        image_data = request.image_data
        mime_type = request.mime_type
        
        if not image_data:
            raise HTTPException(
                status_code=400,
                detail="image_data is required"
            )
        # Create a specialized prompt for license plate recognition
        plate_recognition_prompt = """
        Extract license plate number from this image.

        TASK: Find visible license plate and return ONLY the alphanumeric characters.

        INSTRUCTIONS:
        - Look for rectangular plates on vehicles
        - Extract letters and numbers only
        - If no plate visible, return "NOT_FOUND"
        - Return ONLY the plate characters, no explanation

        EXAMPLES: ABC123, 123ABC, AB123CD
        """
        
        # Create request for Gemini with optimized settings
        request = GeminiImageRequest(
            prompt=plate_recognition_prompt,
            image_data=image_data,
            mime_type=mime_type,
            model="gemini-2.0-flash-lite",
            temperature=0.0,  # Zero temperature for fastest processing
            max_tokens=20  # Reduced tokens for faster response
        )
        
        # Get plate recognition result
        result = await gemini_service.analyze_image(request)
        recognized_text = result.content.strip().upper()
        
        # Debug logging to see what Gemini actually returned
        logger.info(f"Gemini raw response: '{result.content}'")
        logger.info(f"Processed text: '{recognized_text}'")
        
        # Check if plate was found
        if recognized_text == "NOT_FOUND" or not recognized_text:
            logger.warning(f"No license plate detected. Gemini response was: '{result.content}'")
            return {
                "plate_number": None,
                "confidence": 0.0,
                "vehicle_exists": False,
                "message": "No license plate found in the image",
                "ai_response": result.content[:100]
            }
        
        # Clean up the recognized plate number
        import re
        plate_number = re.sub(r'[^A-Z0-9]', '', recognized_text)
        
        logger.info(f"Cleaned plate number: '{plate_number}'")
        
        if not plate_number:
            logger.warning(f"Could not extract valid plate number from: '{recognized_text}'")
            return {
                "plate_number": None,
                "confidence": 0.0,
                "vehicle_exists": False,
                "message": f"Could not extract a valid plate number from the image. Detected text: '{recognized_text}'",
                "ai_response": recognized_text
            }
        
        # Check if vehicle exists in database
        from app.crud.crud_emission import vehicle as vehicle_crud
        
        vehicle = vehicle_crud.get_by_plate_number(db, plate_number=plate_number)
        
        if vehicle:
            # Vehicle found - return vehicle details
            # Safely read dynamic attributes that may not be present on ORM object
            latest_test_result = getattr(vehicle, "latest_test_result", None)
            latest_test_date = getattr(vehicle, "latest_test_date", None)

            vehicle_details = {
                "id": str(vehicle.id),
                "driver_name": vehicle.driver_name,
                "contact_number": vehicle.contact_number,
                "engine_type": vehicle.engine_type,
                "office_id": str(vehicle.office_id),
                "office_name": vehicle.office.name if vehicle.office else None,
                "plate_number": vehicle.plate_number,
                "vehicle_type": vehicle.vehicle_type,
                "wheels": vehicle.wheels,
                "latest_test_result": latest_test_result,
                "latest_test_date": latest_test_date.isoformat() if latest_test_date else None,
            }
            
            return {
                "plate_number": plate_number,
                "confidence": 0.85,  # Could be enhanced with actual confidence scoring
                "vehicle_exists": True,
                "vehicle_id": str(vehicle.id),
                "vehicle_details": vehicle_details
            }
        else:
            # Vehicle not found - suggest creation
            return {
                "plate_number": plate_number,
                "confidence": 0.85,
                "vehicle_exists": False,
                "vehicle_id": None,
                "vehicle_details": None,
                "message": f"License plate '{plate_number}' detected but not found in database",
                "suggest_creation": True,
                "creation_data": {
                    "plate_number": plate_number,
                    "detected_confidence": 0.85
                }
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"License plate recognition failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to recognize license plate: {str(e)}")


@router.get("/health")
async def health_check():
    """
    Check if Gemini service is available
    """
    try:
        if gemini_service.client is None:
            return {
                "status": "unavailable",
                "message": "Gemini client not initialized. Check GOOGLE_API_KEY."
            }
        
        # Try a simple token count to verify connection
        await gemini_service.count_tokens("test")
        
        return {
            "status": "healthy",
            "message": "Gemini service is available"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Gemini service error: {str(e)}"
        }


@router.post("/test-plate-recognition")
async def test_plate_recognition(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Test license plate recognition with a sample image
    """
    try:
        # Create a simple test prompt to verify Gemini is working
        test_request = GeminiTextRequest(
            prompt="What is the capital of France? Reply with just the city name.",
            model="gemini-2.0-flash-lite",
            temperature=0.1,
            max_tokens=10
        )
        
        test_result = await gemini_service.generate_text(test_request)
        
        return {
            "gemini_working": True,
            "test_response": test_result.content,
            "message": "Gemini service is working. Try capturing a clear image of a license plate."
        }
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        return {
            "gemini_working": False,
            "error": str(e),
            "message": "There's an issue with the Gemini service configuration."
        }

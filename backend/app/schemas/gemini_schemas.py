from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Union
from enum import Enum


class GeminiModel(str, Enum):
    """Available Gemini models"""
    GEMINI_2_5_FLASH = "gemini-2.5-flash"
    GEMINI_2_5_PRO = "gemini-2.5-pro"
    GEMINI_2_0_FLASH = "gemini-2.0-flash"
    GEMINI_2_0_FLASH_LITE = "gemini-2.0-flash-lite"
    GEMINI_2_0_PRO = "gemini-2.0-pro"


class ContentType(str, Enum):
    """Content input types"""
    TEXT = "text"
    IMAGE = "image"
    MULTIMODAL = "multimodal"


class GeminiTextRequest(BaseModel):
    """Request for text-only Gemini generation"""
    prompt: str = Field(..., description="Text prompt for generation")
    model: GeminiModel = Field(default=GeminiModel.GEMINI_2_0_FLASH_LITE, description="Gemini model to use")
    max_tokens: Optional[int] = Field(default=None, description="Maximum tokens to generate")
    temperature: Optional[float] = Field(default=None, ge=0.0, le=2.0, description="Temperature for generation")
    stream: bool = Field(default=False, description="Whether to stream the response")


class GeminiImageRequest(BaseModel):
    """Request for image analysis with Gemini"""
    prompt: str = Field(..., description="Text prompt for image analysis")
    image_data: str = Field(..., description="Base64 encoded image data")
    mime_type: str = Field(default="image/jpeg", description="Image MIME type")
    model: GeminiModel = Field(default=GeminiModel.GEMINI_2_0_FLASH_LITE, description="Gemini model to use")
    max_tokens: Optional[int] = Field(default=None, description="Maximum tokens to generate")
    temperature: Optional[float] = Field(default=None, ge=0.0, le=2.0, description="Temperature for generation")


class GeminiMultimodalRequest(BaseModel):
    """Request for multimodal (text + images) Gemini generation"""
    text_prompt: str = Field(..., description="Text prompt for generation")
    images: List[dict] = Field(default=[], description="List of images with data and mime_type")
    model: GeminiModel = Field(default=GeminiModel.GEMINI_2_0_FLASH_LITE, description="Gemini model to use")
    max_tokens: Optional[int] = Field(default=None, description="Maximum tokens to generate")
    temperature: Optional[float] = Field(default=None, ge=0.0, le=2.0, description="Temperature for generation")


class GeminiResponse(BaseModel):
    """Response from Gemini API"""
    model_config = ConfigDict(protected_namespaces=())
    
    content: str = Field(..., description="Generated content")
    model_used: str = Field(..., description="Model that was used for generation")
    content_type: ContentType = Field(..., description="Type of content processed")
    success: bool = Field(default=True, description="Whether the request was successful")
    metadata: Optional[dict] = Field(default=None, description="Additional metadata from the response")


class GeminiErrorResponse(BaseModel):
    """Error response from Gemini API"""
    error: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(default=None, description="Error code if available")
    success: bool = Field(default=False, description="Always false for error responses")


class GeminiStreamChunk(BaseModel):
    """Chunk of streamed response from Gemini"""
    text: str = Field(..., description="Text chunk")
    is_final: bool = Field(default=False, description="Whether this is the final chunk")
    chunk_id: int = Field(..., description="Sequential chunk identifier")


class GeminiUsageStats(BaseModel):
    """Token usage statistics from Gemini API"""
    input_tokens: Optional[int] = Field(default=None, description="Number of input tokens")
    output_tokens: Optional[int] = Field(default=None, description="Number of output tokens")
    total_tokens: Optional[int] = Field(default=None, description="Total tokens used")


class EnvironmentalAnalysisRequest(BaseModel):
    """Specialized request for environmental data analysis"""
    data_type: str = Field(..., description="Type of environmental data (air_quality, emissions, tree_health, etc.)")
    prompt: str = Field(..., description="Analysis prompt")
    data_context: Optional[dict] = Field(default=None, description="Contextual data for analysis")
    images: Optional[List[dict]] = Field(default=None, description="Optional images for analysis")
    analysis_focus: Optional[str] = Field(default=None, description="Specific focus area for analysis")


class EnvironmentalAnalysisResponse(GeminiResponse):
    """Response for environmental analysis"""
    insights: List[str] = Field(default=[], description="Key insights from the analysis")
    recommendations: List[str] = Field(default=[], description="Recommendations based on analysis")
    confidence_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Confidence in the analysis")
    data_quality_assessment: Optional[str] = Field(default=None, description="Assessment of input data quality")


class PlateRecognitionRequest(BaseModel):
    """Request for license plate recognition"""
    image_data: str = Field(..., description="Base64 encoded image data")
    mime_type: str = Field(default="image/jpeg", description="Image MIME type")


class VehicleDetails(BaseModel):
    """Vehicle details structure"""
    id: str
    driver_name: str
    contact_number: Optional[str]
    engine_type: str
    office_id: str
    office_name: Optional[str]
    plate_number: str
    vehicle_type: str
    wheels: int
    latest_test_result: Optional[bool]
    latest_test_date: Optional[str]


class PlateRecognitionResponse(BaseModel):
    """Response for license plate recognition"""
    plate_number: Optional[str] = Field(default=None, description="Recognized plate number, null if no plate detected")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Recognition confidence")
    vehicle_exists: bool = Field(..., description="Whether vehicle exists in database")
    vehicle_id: Optional[str] = Field(default=None, description="Vehicle ID if found")
    vehicle_details: Optional[VehicleDetails] = Field(default=None, description="Vehicle details if found")
    message: Optional[str] = Field(default=None, description="Additional message for user feedback")
    ai_response: Optional[str] = Field(default=None, description="Raw AI response for debugging")
    suggest_creation: Optional[bool] = Field(default=False, description="Whether to suggest creating a new vehicle record")
    creation_data: Optional[dict] = Field(default=None, description="Data to pre-populate vehicle creation form")

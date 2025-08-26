import base64
import io
import logging
from typing import Optional, List, AsyncGenerator, Dict, Any
from PIL import Image

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.gemini_schemas import (
    GeminiTextRequest,
    GeminiImageRequest,
    GeminiMultimodalRequest,
    GeminiResponse,
    GeminiStreamChunk,
    ContentType,
    EnvironmentalAnalysisRequest,
    EnvironmentalAnalysisResponse,
    GeminiUsageStats
)

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for interacting with Google's Gemini API"""
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the Gemini client"""
        if not settings.GOOGLE_API_KEY:
            logger.warning("GOOGLE_API_KEY not set. Gemini features will be disabled.")
            return
        
        try:
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            logger.info("Gemini client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            self.client = None
    
    def _check_client(self):
        """Check if client is available"""
        if not self.client:
            raise Exception("Gemini client not initialized. Please check your GOOGLE_API_KEY.")
    
    async def generate_text(self, request: GeminiTextRequest) -> GeminiResponse:
        """Generate text using Gemini API"""
        self._check_client()
        
        try:
            # Configure generation parameters
            config = {}
            if request.max_tokens:
                config['max_output_tokens'] = request.max_tokens
            if request.temperature is not None:
                config['temperature'] = request.temperature
            
            # Create properly structured content using the official API format
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=request.prompt),
                    ],
                ),
            ]
            
            # Generate content
            response = self.client.models.generate_content(
                model=request.model.value,
                contents=contents,
                config=types.GenerateContentConfig(**config) if config else None
            )
            
            # Debug logging
            logger.info(f"Raw response object: {response}")
            logger.info(f"Response text: {response.text}")
            logger.info(f"Response candidates: {getattr(response, 'candidates', 'N/A')}")
            
            # Handle empty or None response text
            response_text = response.text if response.text is not None else ""
            
            # Try to extract text from candidates if main text is empty
            if not response_text and hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'content') and candidate.content:
                    if hasattr(candidate.content, 'parts') and candidate.content.parts:
                        for part in candidate.content.parts:
                            if hasattr(part, 'text') and part.text:
                                response_text = part.text
                                break
            
            # Log if we get an empty response
            if not response_text:
                logger.warning(f"Empty response from Gemini for prompt: {request.prompt[:50]}...")
                logger.warning(f"Full response object: {response}")
                # Return a default response instead of empty content
                response_text = "I understand your question, but I'm having trouble generating a response right now. Could you please rephrase your question?"
            
            return GeminiResponse(
                content=response_text,
                model_used=request.model.value,
                content_type=ContentType.TEXT,
                success=True,
                metadata={
                    "usage": self._extract_usage_stats(response) if hasattr(response, 'usage_metadata') else None
                }
            )
            
        except Exception as e:
            logger.error(f"Error in text generation: {e}")
            raise Exception(f"Failed to generate text: {str(e)}")
    
    async def generate_text_stream(self, request: GeminiTextRequest) -> AsyncGenerator[GeminiStreamChunk, None]:
        """Generate text using Gemini API with streaming"""
        self._check_client()
        
        try:
            # Configure generation parameters
            config = {}
            if request.max_tokens:
                config['max_output_tokens'] = request.max_tokens
            if request.temperature is not None:
                config['temperature'] = request.temperature
            
            # Create properly structured content using the official API format
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=request.prompt),
                    ],
                ),
            ]
            
            chunk_id = 0
            # Stream content
            for chunk in self.client.models.generate_content_stream(
                model=request.model.value,
                contents=contents,
                config=types.GenerateContentConfig(**config) if config else None
            ):
                # Handle chunk text that might be None
                chunk_text = chunk.text if chunk.text is not None else ""
                if chunk_text:
                    yield GeminiStreamChunk(
                        text=chunk_text,
                        is_final=False,
                        chunk_id=chunk_id
                    )
                    chunk_id += 1
            
            # Send final chunk
            yield GeminiStreamChunk(
                text="",
                is_final=True,
                chunk_id=chunk_id
            )
            
        except Exception as e:
            logger.error(f"Error in streaming text generation: {e}")
            raise Exception(f"Failed to stream text generation: {str(e)}")
    
    async def analyze_image(self, request: GeminiImageRequest) -> GeminiResponse:
        """Analyze image with text prompt using Gemini API"""
        self._check_client()
        
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(request.image_data)
            
            # Configure generation parameters
            config = {}
            if request.max_tokens:
                config['max_output_tokens'] = request.max_tokens
            if request.temperature is not None:
                config['temperature'] = request.temperature
            
            # Create properly structured content using the official API format
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=request.prompt),
                        types.Part.from_bytes(data=image_bytes, mime_type=request.mime_type),
                    ],
                ),
            ]
            
            # Generate content
            response = self.client.models.generate_content(
                model=request.model.value,
                contents=contents,
                config=types.GenerateContentConfig(**config) if config else None
            )
            
            # Handle empty or None response text
            response_text = response.text if response.text is not None else ""
            
            return GeminiResponse(
                content=response_text,
                model_used=request.model.value,
                content_type=ContentType.IMAGE,
                success=True,
                metadata={
                    "image_mime_type": request.mime_type,
                    "usage": self._extract_usage_stats(response) if hasattr(response, 'usage_metadata') else None
                }
            )
            
        except Exception as e:
            logger.error(f"Error in image analysis: {e}")
            raise Exception(f"Failed to analyze image: {str(e)}")
    
    async def generate_multimodal(self, request: GeminiMultimodalRequest) -> GeminiResponse:
        """Generate content with multimodal input (text + multiple images)"""
        self._check_client()
        
        try:
            # Configure generation parameters
            config = {}
            if request.max_tokens:
                config['max_output_tokens'] = request.max_tokens
            if request.temperature is not None:
                config['temperature'] = request.temperature
            
            # Build content parts using official API format
            parts = [types.Part.from_text(text=request.text_prompt)]
            
            # Add images
            for img in request.images:
                image_bytes = base64.b64decode(img['data'])
                parts.append(
                    types.Part.from_bytes(
                        data=image_bytes, 
                        mime_type=img.get('mime_type', 'image/jpeg')
                    )
                )
            
            # Create properly structured content
            contents = [
                types.Content(
                    role="user",
                    parts=parts,
                ),
            ]
            
            # Generate content
            response = self.client.models.generate_content(
                model=request.model.value,
                contents=contents,
                config=types.GenerateContentConfig(**config) if config else None
            )
            
            # Handle empty or None response text
            response_text = response.text if response.text is not None else ""
            
            return GeminiResponse(
                content=response_text,
                model_used=request.model.value,
                content_type=ContentType.MULTIMODAL,
                success=True,
                metadata={
                    "image_count": len(request.images),
                    "usage": self._extract_usage_stats(response) if hasattr(response, 'usage_metadata') else None
                }
            )
            
        except Exception as e:
            logger.error(f"Error in multimodal generation: {e}")
            raise Exception(f"Failed to generate multimodal content: {str(e)}")
    
    async def analyze_environmental_data(self, request: EnvironmentalAnalysisRequest) -> EnvironmentalAnalysisResponse:
        """Specialized analysis for environmental data"""
        self._check_client()
        
        try:
            # Build enhanced prompt for environmental analysis
            enhanced_prompt = self._build_environmental_prompt(request)
            
            # Build content parts
            contents = [enhanced_prompt]
            
            # Add images if provided
            if request.images:
                for img in request.images:
                    image_bytes = base64.b64decode(img['data'])
                    contents.append(
                        types.Part.from_bytes(
                            data=image_bytes, 
                            mime_type=img.get('mime_type', 'image/jpeg')
                        )
                    )
            
            # Generate content with environmental focus
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.3,  # Lower temperature for more focused analysis
                    max_output_tokens=2048
                )
            )
            
            # Handle empty or None response text
            response_text = response.text if response.text is not None else ""
            
            # Parse environmental insights from response
            insights, recommendations = self._parse_environmental_response(response_text)
            
            return EnvironmentalAnalysisResponse(
                content=response_text,
                model_used=settings.GEMINI_MODEL,
                content_type=ContentType.MULTIMODAL if request.images else ContentType.TEXT,
                insights=insights,
                recommendations=recommendations,
                confidence_score=0.85,  # Could be enhanced with actual confidence scoring
                data_quality_assessment=self._assess_data_quality(request),
                metadata={
                    "data_type": request.data_type,
                    "analysis_focus": request.analysis_focus,
                    "usage": self._extract_usage_stats(response) if hasattr(response, 'usage_metadata') else None
                }
            )
            
        except Exception as e:
            logger.error(f"Error in environmental analysis: {e}")
            raise Exception(f"Failed to analyze environmental data: {str(e)}")
    
    def _build_environmental_prompt(self, request: EnvironmentalAnalysisRequest) -> str:
        """Build enhanced prompt for environmental analysis"""
        base_prompt = f"""
As an environmental data analyst and expert, please analyze the following {request.data_type} data.

Analysis Request: {request.prompt}

"""
        
        if request.data_context:
            base_prompt += f"Contextual Data: {request.data_context}\n\n"
        
        if request.analysis_focus:
            base_prompt += f"Focus Area: {request.analysis_focus}\n\n"
        
        base_prompt += """
Please provide:
1. Key insights from the data
2. Environmental implications
3. Actionable recommendations
4. Any concerning trends or patterns
5. Data quality assessment

Format your response clearly with distinct sections for insights and recommendations.
"""
        
        return base_prompt
    
    def _parse_environmental_response(self, response_text: str) -> tuple[List[str], List[str]]:
        """Parse insights and recommendations from environmental analysis response"""
        insights = []
        recommendations = []
        
        # Simple parsing - could be enhanced with more sophisticated NLP
        lines = response_text.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if 'insight' in line.lower() or 'key finding' in line.lower():
                current_section = 'insights'
            elif 'recommendation' in line.lower() or 'suggest' in line.lower():
                current_section = 'recommendations'
            elif line.startswith('- ') or line.startswith('• '):
                if current_section == 'insights':
                    insights.append(line[2:])
                elif current_section == 'recommendations':
                    recommendations.append(line[2:])
        
        # Fallback: extract from numbered lists
        if not insights and not recommendations:
            for line in lines:
                if line.strip().startswith(('1.', '2.', '3.', '4.', '5.')):
                    if 'recommend' in line.lower():
                        recommendations.append(line)
                    else:
                        insights.append(line)
        
        return insights, recommendations
    
    def _assess_data_quality(self, request: EnvironmentalAnalysisRequest) -> str:
        """Assess the quality of input data"""
        quality_factors = []
        
        if request.data_context:
            quality_factors.append("Contextual data provided")
        
        if request.images:
            quality_factors.append(f"{len(request.images)} image(s) included")
        
        if request.analysis_focus:
            quality_factors.append("Specific analysis focus defined")
        
        if quality_factors:
            return f"Good - {', '.join(quality_factors)}"
        else:
            return "Limited - Only text prompt provided"
    
    def _extract_usage_stats(self, response) -> Optional[Dict[str, Any]]:
        """Extract usage statistics from response if available"""
        try:
            if hasattr(response, 'usage_metadata'):
                usage = response.usage_metadata
                return {
                    "prompt_token_count": getattr(usage, 'prompt_token_count', None),
                    "candidates_token_count": getattr(usage, 'candidates_token_count', None),
                    "total_token_count": getattr(usage, 'total_token_count', None)
                }
        except Exception:
            pass
        return None
    
    async def count_tokens(self, text: str, model: str = None) -> GeminiUsageStats:
        """Count tokens for given text"""
        self._check_client()
        
        try:
            model_name = model or settings.GEMINI_MODEL
            response = self.client.models.count_tokens(
                model=model_name,
                contents=text
            )
            
            return GeminiUsageStats(
                input_tokens=response.total_tokens,
                total_tokens=response.total_tokens
            )
            
        except Exception as e:
            logger.error(f"Error counting tokens: {e}")
            raise Exception(f"Failed to count tokens: {str(e)}")


# Global service instance
gemini_service = GeminiService()

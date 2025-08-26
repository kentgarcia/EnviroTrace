"""
Test script for Gemini API integration
Run this to verify the Gemini service is working properly
"""

import asyncio
import base64
import os
from pathlib import Path

# Add the app directory to the path so we can import our modules
import sys
sys.path.append(str(Path(__file__).parent))

from app.services.gemini_service import gemini_service
from app.schemas.gemini_schemas import GeminiTextRequest, GeminiImageRequest
from app.core.config import settings


async def test_gemini_service():
    """Test the Gemini service functionality"""
    
    print("=== Gemini API Integration Test ===\n")
    
    # Check if API key is configured
    if not settings.GOOGLE_API_KEY:
        print("❌ GOOGLE_API_KEY not configured in environment variables")
        print("Please add GOOGLE_API_KEY=your_api_key to your .env file")
        return False
    
    print("✅ API key configured")
    
    # Test client initialization
    if not gemini_service.client:
        print("❌ Gemini client failed to initialize")
        return False
    
    print("✅ Gemini client initialized")
    
    # Test token counting
    try:
        tokens = await gemini_service.count_tokens("Hello, world!")
        print(f"✅ Token counting works: {tokens.total_tokens} tokens")
    except Exception as e:
        print(f"❌ Token counting failed: {e}")
        return False
    
    # Test text generation
    try:
        request = GeminiTextRequest(
            prompt="Explain the importance of environmental monitoring in 2 sentences.",
            model="gemini-2.5-flash",
            max_tokens=100
        )
        
        response = await gemini_service.generate_text(request)
        print(f"✅ Text generation works")
        print(f"Response preview: {response.content[:100]}...")
        
    except Exception as e:
        print(f"❌ Text generation failed: {e}")
        return False
    
    # Test image analysis (with a simple test image)
    try:
        # Create a simple test image (1x1 pixel PNG)
        test_image_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        )
        test_image_b64 = base64.b64encode(test_image_data).decode('utf-8')
        
        request = GeminiImageRequest(
            prompt="What do you see in this image?",
            image_data=test_image_b64,
            mime_type="image/png",
            max_tokens=50
        )
        
        response = await gemini_service.analyze_image(request)
        print(f"✅ Image analysis works")
        print(f"Response preview: {response.content[:100]}...")
        
    except Exception as e:
        print(f"❌ Image analysis failed: {e}")
        return False
    
    print("\n🎉 All tests passed! Gemini API integration is working correctly.")
    return True


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run the test
    success = asyncio.run(test_gemini_service())
    
    if success:
        print("\n📝 Next steps:")
        print("1. Add your Google API key to the .env file")
        print("2. Start your FastAPI server")
        print("3. Test the endpoints at http://localhost:8000/docs")
        print("4. Use the /api/v1/gemini/ endpoints with proper authentication")
    else:
        print("\n❌ Please fix the issues above before proceeding.")

#!/usr/bin/env python3
"""
Test script for plate recognition endpoint
"""
import requests
import base64
import os
from PIL import Image
import io

# Create a simple test image with text
def create_test_image():
    img = Image.new('RGB', (400, 100), color='white')
    # We'll just create a simple colored rectangle as a test
    return img

def image_to_base64(img):
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    img_data = buffer.getvalue()
    return base64.b64encode(img_data).decode('utf-8')

def test_plate_recognition():
    # Create test image
    test_img = create_test_image()
    img_base64 = image_to_base64(test_img)
    
    # Prepare request
    url = "http://localhost:8000/api/v1/gemini/recognize-plate"
    
    # You'll need a valid access token for this test
    headers = {
        "Content-Type": "application/json",
        # "Authorization": "Bearer YOUR_TOKEN_HERE"
    }
    
    payload = {
        "image_data": img_base64,
        "mime_type": "image/jpeg"
    }
    
    print("Testing plate recognition endpoint...")
    print(f"Image data length: {len(img_base64)} characters")
    print(f"Request URL: {url}")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("Success!")
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_plate_recognition()

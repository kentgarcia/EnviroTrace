# License Plate Recognition Feature - Implementation Guide

## Overview

This feature allows users to scan license plates using their mobile device camera, automatically recognize the plate number using Google's Gemini AI, and validate if the vehicle exists in the government emission database. Users can then add emission tests for the recognized vehicle.

## 🎯 Features Implemented

### Mobile App (React Native + Expo)

1. **Camera Interface** (`PlateCaptureCameraComponent.tsx`)

   - Full-screen camera with license plate capture guide
   - Image optimization and compression
   - Permission handling
   - Error handling and user feedback

2. **API Service** (`plate-recognition-service.ts`)

   - Gemini AI integration for plate recognition
   - Vehicle search by plate number
   - Type-safe interfaces

3. **Updated Test Screen** (`AddTestScreen.tsx`)
   - Integrated plate scanning workflow
   - Manual search fallback
   - Vehicle selection UI
   - Test recording with quarter/year selection

### Backend (FastAPI + Python)

1. **Plate Recognition Endpoint** (`/api/v1/gemini/recognize-plate`)

   - Gemini AI-powered OCR
   - Vehicle database lookup
   - Confidence scoring
   - Error handling

2. **Vehicle Search Endpoint** (`/api/v1/emission/vehicles/search/plate/{plate_number}`)
   - Direct plate number lookup
   - Vehicle details retrieval

## 🔧 Technical Implementation

### Mobile App Flow

```
1. User opens AddTestScreen
2. Taps "Scan License Plate" button
3. Camera opens with plate capture guide
4. User takes photo → Image optimized & sent to backend
5. Gemini AI extracts plate number
6. System searches vehicle database
7. If found: Display vehicle details + proceed to test
8. If not found: Show manual search option
9. User completes test with selected quarter/year
```

### Backend Processing

```
1. Receive base64 image from mobile app
2. Send to Gemini AI with specialized OCR prompt
3. Extract and clean plate number (remove spaces, special chars)
4. Search vehicle database by plate number
5. Return recognition result + vehicle details (if found)
```

### Key Components

#### Camera Component Features

- **Visual Guide**: Dashed frame showing optimal plate positioning
- **Image Optimization**: Automatic resize to 1024px width, 80% compression
- **Permission Handling**: Graceful camera permission requests
- **Background Processing**: Shows processing state during recognition

#### API Integration

- **Type Safety**: Full TypeScript interfaces for all API responses
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Fallback Options**: Manual search when recognition fails

#### Backend AI Integration

- **Specialized Prompt**: Optimized for license plate extraction
- **Low Temperature**: 0.1 for consistent recognition results
- **Text Cleaning**: Removes formatting, keeps only alphanumeric
- **Database Integration**: Real-time vehicle lookup

## 📱 User Experience

### Happy Path

1. **Quick Recognition**: Point camera → automatic plate detection
2. **Instant Validation**: Immediate feedback if vehicle exists
3. **Seamless Test Entry**: Pre-filled vehicle data + test recording

### Error Handling

1. **Recognition Failure**: Manual search option
2. **Vehicle Not Found**: Clear messaging + registration guidance
3. **Camera Issues**: Permission requests + troubleshooting

### Visual Design

- **Material Design**: Consistent with app theme
- **Intuitive Icons**: Camera, search, vehicle icons
- **Clear Feedback**: Loading states, success/error messages
- **Accessibility**: Proper labeling and contrast

## 🛠 Setup Requirements

### Backend

1. **Google API Key**: Configure `GOOGLE_API_KEY` in `.env` file
2. **Database**: Ensure vehicle records exist with plate numbers
3. **Dependencies**: `google-genai==1.31.0` already installed

### Mobile App

1. **Camera Permissions**: Automatically requested when needed
2. **Dependencies**: Installed `expo-camera` and `expo-image-manipulator`
3. **Network Access**: Backend API connectivity required

## 🧪 Testing

### Test Data Setup

1. Add test vehicles to database with known plate numbers
2. Use clear, well-lit license plate photos
3. Test with various lighting conditions and angles

### Manual Testing Steps

1. Open AddTestScreen in mobile app
2. Tap "Scan License Plate"
3. Take photo of test plate
4. Verify recognition accuracy
5. Complete test recording workflow

### Error Scenarios

1. Test with unregistered plate numbers
2. Test with poor image quality
3. Test camera permission denial
4. Test network connectivity issues

## 📊 Performance Considerations

### Image Processing

- **Compression**: 80% JPEG quality balances size vs clarity
- **Resize**: 1024px max width reduces processing time
- **Format**: JPEG for smaller payload size

### AI Processing

- **Model**: gemini-2.5-flash for optimal speed/accuracy balance
- **Temperature**: 0.1 for consistent results
- **Token Limit**: 50 tokens for plate number only

### Database Queries

- **Indexed Search**: Plate number field should be indexed
- **Single Query**: Direct plate lookup vs full table scan
- **Caching**: Consider caching frequently accessed vehicles

## 🔒 Security & Privacy

### Data Handling

- **Image Processing**: Images not stored, processed in-memory only
- **API Security**: Authentication required for all endpoints
- **Input Validation**: Plate numbers sanitized before database queries

### Privacy

- **Camera Access**: Only when user initiates plate scanning
- **Data Retention**: No permanent storage of captured images
- **User Consent**: Clear UI indicating when camera is active

## 🚀 Future Enhancements

### AI Improvements

- **Confidence Scoring**: Real confidence metrics from Gemini
- **Multi-language Support**: International plate formats
- **Batch Processing**: Multiple plates in single image

### UX Enhancements

- **Auto-focus**: Automatic focus on license plate area
- **Real-time Recognition**: Live preview recognition
- **History**: Recently recognized plates

### Analytics

- **Recognition Accuracy**: Track success/failure rates
- **Performance Metrics**: Response times and error patterns
- **Usage Statistics**: Most common use cases and improvements

## 📖 API Reference

### Plate Recognition Endpoint

```
POST /api/v1/gemini/recognize-plate
Body: {
  "image_data": "base64_encoded_image",
  "mime_type": "image/jpeg"
}
Response: {
  "plate_number": "ABC123",
  "confidence": 0.85,
  "vehicle_exists": true,
  "vehicle_id": "uuid",
  "vehicle_details": { ... }
}
```

### Vehicle Search Endpoint

```
GET /api/v1/emission/vehicles/search/plate/{plate_number}
Response: {
  "id": "uuid",
  "driver_name": "John Doe",
  "plate_number": "ABC123",
  ...
}
```

## ✅ Success Criteria

- [x] Camera integration working
- [x] Plate recognition via Gemini AI
- [x] Vehicle database validation
- [x] Test recording workflow
- [x] Error handling and fallbacks
- [x] User-friendly interface
- [x] Performance optimization
- [x] Security considerations

The implementation is complete and ready for testing! 🎉

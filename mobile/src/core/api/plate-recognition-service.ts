import apiClient from "./api-client";

export interface PlateRecognitionRequest {
  image_data: string; // Base64 encoded image
  mime_type: string;
}

export interface PlateRecognitionResponse {
  plate_number: string | null;
  confidence: number;
  vehicle_exists: boolean;
  vehicle_id?: string;
  message?: string; // Added to handle "no plate found" messages
  ai_response?: string; // Raw AI response for debugging
  suggest_creation?: boolean; // Whether to suggest creating a new vehicle record
  creation_data?: {
    // Data to pre-populate vehicle creation form
    plate_number: string;
    detected_confidence: number;
  };
  vehicle_details?: {
    id: string;
    driver_name: string;
    contact_number?: string;
    engine_type: string;
    office_id: string;
    office_name?: string;
    plate_number: string;
    vehicle_type: string;
    wheels: number;
    latest_test_result?: boolean | null;
    latest_test_date?: string;
  };
}

export interface VehicleSearchResponse {
  id: string;
  driver_name: string;
  contact_number?: string;
  engine_type: string;
  office_id: string;
  office_name?: string;
  plate_number: string;
  vehicle_type: string;
  wheels: number;
  latest_test_result?: boolean | null;
  latest_test_date?: string;
  created_at: string;
  updated_at: string;
}

export class PlateRecognitionService {
  /**
   * Validate image data quality and size
   */
  private static validateImageData(imageData: string): void {
    if (!imageData || imageData.length < 100) {
      throw new Error("Invalid or empty image data");
    }

    // Check if it's a valid base64 image
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Pattern.test(imageData)) {
      throw new Error("Invalid base64 image format");
    }

    // Check size (warn if too large)
    const sizeInMB = (imageData.length * 3) / 4 / (1024 * 1024);
    if (sizeInMB > 5) {
      console.warn(
        `Large image detected: ${sizeInMB.toFixed(
          2
        )}MB - this may cause performance issues`
      );
    }

    console.log(
      `Image validation passed: ${sizeInMB.toFixed(2)}MB, ${
        imageData.length
      } characters`
    );
  }

  /**
   * Recognize license plate from image and check if vehicle exists
   */
  static async recognizePlate(
    request: PlateRecognitionRequest
  ): Promise<PlateRecognitionResponse> {
    try {
      console.log("Starting plate recognition...");

      // Validate image data
      this.validateImageData(request.image_data);

      console.log("Sending plate recognition request with:", {
        image_data_length: request.image_data?.length || 0,
        mime_type: request.mime_type,
        image_data_preview: request.image_data?.substring(0, 50) + "...", // Show first 50 chars
      });

      const response = await apiClient.post("/gemini/recognize-plate", {
        image_data: request.image_data,
        mime_type: request.mime_type,
      });

      console.log("Plate recognition successful:", {
        plate_number: response.data.plate_number,
        confidence: response.data.confidence,
        vehicle_exists: response.data.vehicle_exists,
      });

      return response.data;
    } catch (error: any) {
      console.error("Error recognizing plate:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
        image_data_length: request.image_data?.length || 0,
      });
      throw error;
    }
  }

  /**
   * Search for vehicle by plate number
   */
  static async searchVehicleByPlate(
    plateNumber: string
  ): Promise<VehicleSearchResponse | null> {
    try {
      const response = await apiClient.get(
        `/emission/vehicles/search/plate/${encodeURIComponent(plateNumber)}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Test Gemini service connectivity
   */
  static async testGeminiService(): Promise<{
    working: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.post("/gemini/test-plate-recognition");
      return {
        working: response.data.gemini_working,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        working: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to test Gemini service",
      };
    }
  }

  /**
   * Get all vehicles with optional search filter
   */
  static async getVehicles(search?: string): Promise<VehicleSearchResponse[]> {
    const params = search ? { search } : {};
    const response = await apiClient.get("/emission/vehicles", { params });
    return response.data;
  }
}

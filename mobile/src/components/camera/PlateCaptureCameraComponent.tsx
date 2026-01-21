import React, { useState, useRef } from "react";
import {
    View,
    StyleSheet,
    Text,
    Alert,
    Dimensions,
    Platform,
} from "react-native";
import { Camera, CameraType, CameraView } from "expo-camera";
import { Button, IconButton, useTheme, ActivityIndicator } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImageManipulator from "expo-image-manipulator";
import Icon from "../icons/Icon";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface PlateCaptureCameraProps {
    onCapture: (imageData: string, mimeType: string) => void;
    onClose: () => void;
    isProcessing?: boolean;
}

export default function PlateCaptureCameraComponent({
    onCapture,
    onClose,
    isProcessing = false,
}: PlateCaptureCameraProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const cameraRef = useRef<CameraView>(null);
    const guideRef = useRef<View>(null);
    const [cameraType, setCameraType] = useState<CameraType>("back");
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    React.useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    const takePicture = async () => {
        if (!cameraRef.current || isCapturing || isProcessing) return;

        try {
            setIsCapturing(true);

            // 1. Get Guide Layout relative to Screen/CameraView
            const guideMeasurements = await new Promise<{ pageX: number, pageY: number, width: number, height: number } | null>((resolve) => {
                if (guideRef.current) {
                    guideRef.current.measure((x, y, width, height, pageX, pageY) => {
                        resolve({ pageX, pageY, width, height });
                    });
                } else {
                    resolve(null);
                }
            });

            const photo = await cameraRef.current.takePictureAsync({
                quality: 1, // Higher quality for OCR
                base64: true,
                skipProcessing: true,
            });

            if (!photo?.uri) {
                Alert.alert("Error", "Failed to capture image");
                return;
            }

            // 2. Calculate Crop Coordinates
            let cropRegion = { originX: 0, originY: 0, width: photo.width, height: photo.height };

            if (guideMeasurements) {
                // Calculate scale factors (Assuming Aspect Fill behavior of CameraView)
                const previewRatio = screenWidth / screenHeight;
                const photoRatio = photo.width / photo.height;
                
                let scale = 1;
                let offsetX = 0;
                let offsetY = 0;

                if (photoRatio > previewRatio) {
                    scale = photo.height / screenHeight;
                    offsetX = (photo.width - (screenWidth * scale)) / 2;
                } else {
                    scale = photo.width / screenWidth;
                    offsetY = (photo.height - (screenHeight * scale)) / 2;
                }

                // Map Guide Rect to Photo Rect
                const cropX = (guideMeasurements.pageX * scale) + offsetX;
                const cropY = (guideMeasurements.pageY * scale) + offsetY;
                const cropW = guideMeasurements.width * scale;
                const cropH = guideMeasurements.height * scale;

                cropRegion = {
                    originX: Math.max(0, cropX),
                    originY: Math.max(0, cropY),
                    width: Math.min(photo.width - Math.max(0, cropX), cropW),
                    height: Math.min(photo.height - Math.max(0, cropY), cropH)
                };
            }

            // 3. Process image: Crop -> Resize -> Compress
            const actions: ImageManipulator.Action[] = [];
            
            // Only crop if we have valid dimensions
            if (guideMeasurements && cropRegion.width > 0 && cropRegion.height > 0) {
                 actions.push({ crop: cropRegion });
            }

            // Resize after crop (optional, to reduce upload size)
            actions.push({ resize: { width: 800 } });

            const manipulatedImage = await ImageManipulator.manipulateAsync(
                photo.uri,
                actions,
                {
                    compress: 0.8,
                    format: ImageManipulator.SaveFormat.JPEG,
                    base64: true,
                }
            );

            if (!manipulatedImage.base64) {
                Alert.alert("Error", "Failed to process image");
                return;
            }

            // Call the callback with the base64 image data
            onCapture(manipulatedImage.base64, "image/jpeg");

        } catch (error) {
            console.error("Error taking picture:", error);
            Alert.alert("Error", "Failed to capture image. Please try again.");
        } finally {
            setIsCapturing(false);
        }
    };

    const toggleCameraType = () => {
        setCameraType(current => (current === "back" ? "front" : "back"));
    };

    if (hasPermission === null) {
        return (
            <View style={[styles.container, { backgroundColor: colors.surface }]}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: colors.surface }]}>
                <Icon name="camera-off" size={64} color={colors.onSurface} />
                <Text style={[styles.permissionText, { color: colors.onSurface }]}>
                    Camera permission is required to capture license plates
                </Text>
                <Button mode="contained" onPress={onClose} style={styles.permissionButton}>
                    Close
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={cameraType}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    <IconButton
                        icon={() => <Icon name="close" size={24} color="white" />}
                        onPress={onClose}
                        iconColor="white"
                        style={styles.headerButton}
                    />
                    <Text style={styles.headerTitle}>Capture License Plate</Text>
                    <IconButton
                        icon={() => <Icon name="flip-camera-ios" size={24} color="white" />}
                        onPress={toggleCameraType}
                        iconColor="white"
                        style={styles.headerButton}
                    />
                </View>

                {/* Overlay with guide */}
                <View style={styles.overlay}>
                    <View style={styles.guideContainer}>
                        <View 
                            ref={guideRef}
                            style={[styles.plateGuide, { borderColor: colors.primary }]}
                        >
                            <Text style={styles.guideText}>
                                Center the license plate in this frame
                            </Text>
                            <Text style={[styles.guideText, { fontSize: 12, marginTop: 4 }]}>
                                Ensure plate is clear, well-lit, and fills most of the frame
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Controls */}
                <View style={[styles.controls, { paddingBottom: insets.bottom }]}>
                    <View style={styles.controlsRow}>
                        <View style={styles.controlButton} />

                        <View style={styles.captureButtonContainer}>
                            {isProcessing ? (
                                <View style={[styles.captureButton, { backgroundColor: colors.surfaceVariant }]}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={[styles.processingText, { color: colors.primary }]}>
                                        Processing...
                                    </Text>
                                </View>
                            ) : (
                                <IconButton
                                    icon={() => (
                                        <Icon
                                            name={isCapturing ? "hourglass-empty" : "camera"}
                                            size={32}
                                            color="white"
                                        />
                                    )}
                                    onPress={takePicture}
                                    disabled={isCapturing || isProcessing}
                                    style={[
                                        styles.captureButton,
                                        {
                                            backgroundColor: isCapturing ? colors.surfaceVariant : colors.primary,
                                            opacity: isCapturing ? 0.6 : 1,
                                        }
                                    ]}
                                />
                            )}
                        </View>

                        <View style={styles.controlButton} />
                    </View>

                    <Text style={styles.instructionText}>
                        {isProcessing
                            ? "Recognizing license plate..."
                            : "Tap the camera button to capture the license plate"
                        }
                    </Text>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    camera: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    headerButton: {
        margin: 0,
    },
    headerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    guideContainer: {
        alignItems: "center",
    },
    plateGuide: {
        width: screenWidth * 0.8,
        height: 120,
        borderWidth: 3,
        borderRadius: 8,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    guideText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        textShadowColor: "rgba(0, 0, 0, 0.8)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    controls: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    controlsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    controlButton: {
        width: 60,
    },
    captureButtonContainer: {
        alignItems: "center",
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    processingText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: "500",
    },
    instructionText: {
        color: "white",
        fontSize: 14,
        textAlign: "center",
        marginTop: 16,
        textShadowColor: "rgba(0, 0, 0, 0.8)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    permissionText: {
        fontSize: 16,
        textAlign: "center",
        marginVertical: 20,
    },
    permissionButton: {
        marginTop: 16,
    },
});

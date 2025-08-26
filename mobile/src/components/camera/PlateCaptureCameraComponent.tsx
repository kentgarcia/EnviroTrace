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

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7, // Reduced quality for faster processing
                base64: true,
                skipProcessing: false,
            });

            if (!photo?.base64) {
                Alert.alert("Error", "Failed to capture image");
                return;
            }

            // Process image with optimized settings for faster license plate recognition
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                photo.uri,
                [
                    { resize: { width: 800 } }, // Reduced size for faster processing while maintaining readability
                ],
                {
                    compress: 0.7, // Balanced compression for speed vs quality
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
                        <View style={[styles.plateGuide, { borderColor: colors.primary }]}>
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

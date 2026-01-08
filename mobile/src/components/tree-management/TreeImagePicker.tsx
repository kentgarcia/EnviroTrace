import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
} from "react-native";
import { Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import Icon from "../icons/Icon";
import GeotaggedCameraComponent from "./GeotaggedCameraComponent";

interface TreeImagePickerProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

interface ImageUploadState {
    uri: string;
    status: "pending" | "compressing" | "compressed" | "error";
    error?: string;
}

export default function TreeImagePicker({
    images,
    onImagesChange,
    maxImages = 10,
    disabled = false,
}: TreeImagePickerProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadStates, setUploadStates] = useState<ImageUploadState[]>([]);
    const [showCamera, setShowCamera] = useState(false);

    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Please grant camera roll permissions to upload photos."
            );
            return false;
        }
        return true;
    };

    const compressImage = async (uri: string): Promise<string> => {
        try {
            const result = await manipulateAsync(
                uri,
                [{ resize: { width: 1920 } }],
                { compress: 0.8, format: SaveFormat.JPEG }
            );
            return result.uri;
        } catch (error) {
            console.error("Error compressing image:", error);
            throw error;
        }
    };

    const pickImages = async () => {
        if (disabled) return;

        // Show selection dialog
        Alert.alert(
            "Add Photo",
            "Choose source",
            [
                { 
                    text: "Camera", 
                    onPress: () => setShowCamera(true),
                    style: "default"
                },
                { 
                    text: "Gallery", 
                    onPress: () => pickFromGallery(),
                    style: "default"
                },
                { 
                    text: "Cancel", 
                    style: "cancel" 
                }
            ]
        );
    };

    const pickFromGallery = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            Alert.alert("Maximum Images", `You can only upload up to ${maxImages} images.`);
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: remainingSlots,
            });

            if (!result.canceled && result.assets.length > 0) {
                setUploading(true);

                // Initialize upload states
                const initialStates: ImageUploadState[] = result.assets.map((asset) => ({
                    uri: asset.uri,
                    status: "pending",
                }));
                setUploadStates(initialStates);

                // Compress all images
                const compressedUris: string[] = [];
                for (let i = 0; i < result.assets.length; i++) {
                    const asset = result.assets[i];
                    
                    setUploadStates((prev) =>
                        prev.map((state, idx) =>
                            idx === i ? { ...state, status: "compressing" } : state
                        )
                    );

                    try {
                        const compressed = await compressImage(asset.uri);
                        compressedUris.push(compressed);
                        
                        setUploadStates((prev) =>
                            prev.map((state, idx) =>
                                idx === i ? { ...state, status: "compressed" } : state
                            )
                        );
                    } catch (error) {
                        setUploadStates((prev) =>
                            prev.map((state, idx) =>
                                idx === i
                                    ? { ...state, status: "error", error: "Compression failed" }
                                    : state
                            )
                        );
                    }
                }

                // Add compressed images to the list
                onImagesChange([...images, ...compressedUris]);
                setUploading(false);
                setUploadStates([]);
            }
        } catch (error) {
            console.error("Error picking images:", error);
            Alert.alert("Error", "Failed to pick images. Please try again.");
            setUploading(false);
            setUploadStates([]);
        }
    };

    const removeImage = (index: number) => {
        if (disabled) return;
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const handleCameraCapture = async (photo: any) => {
        try {
            setShowCamera(false);
            setUploading(true);

            // Camera photo is already compressed and processed
            // Just add it directly to images array
            onImagesChange([...images, photo.uri]);
            setUploading(false);
        } catch (error) {
            console.error("Error processing camera photo:", error);
            Alert.alert("Error", "Failed to process photo");
            setUploading(false);
        }
    };

    const renderUploadProgress = () => {
        if (uploadStates.length === 0) return null;

        return (
            <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Processing images...</Text>
                {uploadStates.map((state, index) => (
                    <View key={index} style={styles.progressItem}>
                        <Text style={styles.progressText}>Image {index + 1}</Text>
                        {state.status === "compressing" && (
                            <View style={styles.progressStatus}>
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text style={styles.progressStatusText}>Compressing...</Text>
                            </View>
                        )}
                        {state.status === "compressed" && (
                            <View style={styles.progressStatus}>
                                <Icon name="CheckCircle2" size={16} color="#22c55e" />
                                <Text style={[styles.progressStatusText, { color: "#22c55e" }]}>
                                    Ready
                                </Text>
                            </View>
                        )}
                        {state.status === "error" && (
                            <View style={styles.progressStatus}>
                                <Icon name="XCircle" size={16} color="#ef4444" />
                                <Text style={[styles.progressStatusText, { color: "#ef4444" }]}>
                                    {state.error || "Error"}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Upload Button */}
            <TouchableOpacity
                style={[styles.uploadButton, disabled && styles.uploadButtonDisabled]}
                onPress={pickImages}
                disabled={disabled || uploading}
            >
                <Icon
                    name="ImagePlus"
                    size={24}
                    color={disabled ? "#9CA3AF" : "#3B82F6"}
                />
                <Text style={[styles.uploadButtonText, disabled && styles.uploadButtonTextDisabled]}>
                    {uploading ? "Processing..." : "Add Photos"}
                </Text>
                <Text style={styles.uploadButtonSubtext}>
                    {images.length}/{maxImages} images
                </Text>
            </TouchableOpacity>

            {/* Upload Progress */}
            {renderUploadProgress()}

            {/* Image Grid */}
            {images.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScroll}
                    contentContainerStyle={styles.imageScrollContent}
                >
                    {images.map((uri, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            <Image source={{ uri }} style={styles.image} />
                            {!disabled && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <Icon name="X" size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Helper Text */}
            <Text style={styles.helperText}>
                Images will be compressed to max 1MB and 1920px for optimal upload
            </Text>

            {/* Camera Modal */}
            <Modal
                visible={showCamera}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <GeotaggedCameraComponent
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    uploadButton: {
        borderWidth: 2,
        borderColor: "#3B82F6",
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        backgroundColor: "#EFF6FF",
    },
    uploadButtonDisabled: {
        borderColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
    },
    uploadButtonText: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: "600",
        color: "#3B82F6",
    },
    uploadButtonTextDisabled: {
        color: "#9CA3AF",
    },
    uploadButtonSubtext: {
        marginTop: 4,
        fontSize: 12,
        color: "#6B7280",
    },
    progressContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
    },
    progressItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    progressText: {
        fontSize: 13,
        color: "#6B7280",
    },
    progressStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    progressStatusText: {
        fontSize: 12,
        color: "#3B82F6",
        fontWeight: "500",
    },
    imageScroll: {
        marginTop: 16,
    },
    imageScrollContent: {
        gap: 12,
    },
    imageWrapper: {
        position: "relative",
        width: 120,
        height: 120,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
    },
    removeButton: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "#EF4444",
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    helperText: {
        marginTop: 8,
        fontSize: 11,
        color: "#6B7280",
        fontStyle: "italic",
    },
});

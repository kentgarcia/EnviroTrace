import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { captureRef } from "react-native-view-shot";
import Icon from "../icons/Icon";
import { useReverseGeocode } from "../../hooks/useReverseGeocode";

interface GeotaggedPhoto {
    uri: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    width: number;
    height: number;
}

interface GeotaggedCameraComponentProps {
    onCapture: (photo: GeotaggedPhoto) => void;
    onClose: () => void;
    hideUploadButton?: boolean;
}

export default function GeotaggedCameraComponent({ onCapture, onClose, hideUploadButton = false }: GeotaggedCameraComponentProps) {
    const cameraRef = useRef<CameraView>(null);
    const previewContainerRef = useRef<View>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
    const [mediaLibraryPermission, setMediaLibraryPermission] = useState<MediaLibrary.PermissionResponse | null>(null);
    
    const [facing, setFacing] = useState<CameraType>("back");
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
    const [acquiringGPS, setAcquiringGPS] = useState(true);
    const [capturing, setCapturing] = useState(false);
    
    // Preview mode
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [previewPhoto, setPreviewPhoto] = useState<GeotaggedPhoto | null>(null);
    const [previewOverlayText, setPreviewOverlayText] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploaded, setUploaded] = useState(false);

    // Reverse geocoding
    const { result: geocodeResult, reverseGeocode } = useReverseGeocode();

    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        try {
            // Request camera permission
            if (!cameraPermission?.granted) {
                const camResult = await requestCameraPermission();
                if (!camResult.granted) {
                    Alert.alert("Permission Denied", "Camera permission is required to take photos.");
                    onClose();
                    return;
                }
            }

            // Request location permission
            const locResult = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(locResult.status);
            
            if (locResult.status !== Location.PermissionStatus.GRANTED) {
                Alert.alert(
                    "Location Permission Required",
                    "GPS location is needed to tag photos with coordinates. Continue without GPS?",
                    [
                        { text: "Cancel", style: "cancel", onPress: onClose },
                        { text: "Continue", onPress: () => setAcquiringGPS(false) }
                    ]
                );
                setAcquiringGPS(false);
                return;
            }

            // Request media library permission
            const mediaResult = await MediaLibrary.requestPermissionsAsync();
            setMediaLibraryPermission(mediaResult);

            if (!mediaResult.granted) {
                console.warn("Media library permission not granted");
            }

            // Get initial location
            await acquireLocation();
        } catch (error) {
            console.error("Permission error:", error);
            Alert.alert("Error", "Failed to request permissions");
            setAcquiringGPS(false);
        }
    };

    const acquireLocation = async () => {
        try {
            setAcquiringGPS(true);
            
            // First try to get last known location for faster response
            const lastKnown = await Location.getLastKnownPositionAsync();
            if (lastKnown) {
                setLocation(lastKnown);
                setGpsAccuracy(lastKnown.coords.accuracy || null);
            }
            
            // Then get current location
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
            });
            setLocation(loc);
            setGpsAccuracy(loc.coords.accuracy || null);
            setAcquiringGPS(false);

            // Get address from coordinates
            reverseGeocode(loc.coords.latitude, loc.coords.longitude);

            // Continue updating location in background
            startLocationUpdates();
        } catch (error) {
            console.error("Location error:", error);
            setAcquiringGPS(false);
            Alert.alert(
                "GPS Error",
                "Could not acquire GPS location. Continue without GPS?",
                [
                    { text: "Retry", onPress: acquireLocation },
                    { text: "Continue", onPress: () => {} }
                ]
            );
        }
    };

    const startLocationUpdates = async () => {
        // Update location every 5 seconds while camera is open
        const interval = setInterval(async () => {
            try {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setLocation(loc);
                setGpsAccuracy(loc.coords.accuracy || null);
            } catch (error) {
                console.error("Location update error:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    };

    const formatCoordinates = (lat: number, lng: number): string => {
        const latDir = lat >= 0 ? "N" : "S";
        const lngDir = lng >= 0 ? "E" : "W";
        return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
    };

    const formatDateTime = (): string => {
        const now = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        
        return `${month} ${day}, ${year} ${displayHours}:${minutes} ${ampm}`;
    };

    const getAccuracyColor = (accuracy: number | null): string => {
        if (!accuracy) return "#6B7280";
        if (accuracy < 20) return "#22c55e";
        if (accuracy < 50) return "#eab308";
        return "#ef4444";
    };

    const getOverlayText = (): string => {
        if (!location) return "📍 Acquiring GPS...";
        
        const coords = formatCoordinates(location.coords.latitude, location.coords.longitude);
        const accuracy = gpsAccuracy ? `±${Math.round(gpsAccuracy)}m` : "";
        const dateTime = formatDateTime();
        const address = geocodeResult?.address || "Fetching address...";
        
        return `📍 ${coords} • ${accuracy}\n${address}\n${dateTime}`;
    };

    const takePicture = async () => {
        if (!cameraRef.current) {
            console.error("Camera ref not available");
            return;
        }

        try {
            setCapturing(true);

            // Capture photo
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
                exif: true,
            });

            if (!photo || !photo.uri) {
                console.error("No photo captured");
                setCapturing(false);
                return;
            }

            console.log("Photo captured:", photo.uri);

            // Save overlay text for preview
            const overlayText = getOverlayText();
            setPreviewOverlayText(overlayText);

            // Compress and resize the photo
            const resized = await manipulateAsync(
                photo.uri,
                [{ resize: { width: 1920 } }],
                { compress: 0.8, format: SaveFormat.JPEG }
            );

            // Create geotagged photo object (will burn overlay when saving)
            const geotaggedPhoto: GeotaggedPhoto = {
                uri: resized.uri,
                latitude: location?.coords.latitude || 0,
                longitude: location?.coords.longitude || 0,
                accuracy: gpsAccuracy || 0,
                timestamp: new Date().toISOString(),
                width: resized.width,
                height: resized.height,
            };

            setPreviewPhoto(geotaggedPhoto);
            setPreviewUri(resized.uri);
            setCapturing(false);
        } catch (error) {
            console.error("Capture error:", error);
            Alert.alert("Error", "Failed to capture photo");
            setCapturing(false);
        }
    };

    const capturePreviewWithOverlay = async (): Promise<string> => {
        try {
            if (!previewContainerRef.current) {
                throw new Error("Preview container ref not available");
            }

            console.log("📸 Capturing preview with overlay...");
            
            // Capture the entire preview view (image + overlay text)
            const uri = await captureRef(previewContainerRef, {
                format: "jpg",
                quality: 0.9,
            });

            console.log("✅ Preview captured with overlay:", uri);
            return uri;
        } catch (error) {
            console.error("Preview capture error:", error);
            throw error;
        }
    };

    const handleSaveToGallery = async () => {
        if (!previewUri) {
            Alert.alert("Error", "No photo to save");
            return;
        }

        try {
            // Check permission first
            if (!mediaLibraryPermission?.granted) {
                const permission = await MediaLibrary.requestPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert("Permission Required", "Media library permission is needed to save photos");
                    return;
                }
                setMediaLibraryPermission(permission);
            }

            setSaving(true);
            
            // Capture preview with overlay burned in
            const finalUri = await capturePreviewWithOverlay();
            
            // Save to gallery
            const asset = await MediaLibrary.createAssetAsync(finalUri);
            console.log("Photo saved:", asset);
            
            setSaved(true);
            setSaving(false);
            
            Alert.alert("Success", "Photo saved to gallery with GPS overlay", [{ text: "OK" }]);
        } catch (error) {
            console.error("Save error:", error);
            setSaving(false);
            Alert.alert("Error", `Failed to save photo: ${error}`);
        }
    };

    const handleUpload = async () => {
        if (!previewPhoto) return;

        try {
            setUploading(true);
            
            // Capture preview with overlay burned in
            const finalUri = await capturePreviewWithOverlay();
            
            // Update photo object with burned overlay
            const finalPhoto: GeotaggedPhoto = {
                ...previewPhoto,
                uri: finalUri,
            };
            
            onCapture(finalPhoto);
            setUploaded(true);
            
            // Close after short delay to show success state
            setTimeout(() => {
                onClose();
            }, 500);
        } catch (error) {
            console.error("Upload error:", error);
            setUploading(false);
            Alert.alert("Error", "Failed to process photo");
        }
    };

    const handleRetake = () => {
        setPreviewUri(null);
        setPreviewPhoto(null);
        setSaved(false);
        setUploaded(false);
    };

    const toggleCameraFacing = () => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    };

    // Camera view
    if (!previewUri) {
        return (
            <View style={styles.container}>
                {cameraPermission?.granted ? (
                    <>
                        <CameraView
                            ref={cameraRef}
                            style={styles.camera}
                            facing={facing}
                        >
                            {/* GPS Overlay at bottom */}
                            <View style={styles.overlayContainer}>
                                <View style={[
                                    styles.overlay,
                                    { backgroundColor: acquiringGPS ? "rgba(59, 130, 246, 0.8)" : "rgba(0, 0, 0, 0.7)" }
                                ]}>
                                    {acquiringGPS ? (
                                        <View style={styles.overlayContent}>
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                            <Text style={styles.overlayText}>Acquiring GPS...</Text>
                                        </View>
                                    ) : (
                                        <Text
                                            style={[
                                                styles.overlayText,
                                                gpsAccuracy && gpsAccuracy > 50 ? { color: "#fbbf24" } : null
                                            ]}
                                        >
                                            {getOverlayText()}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Top controls */}
                            <View style={styles.topControls}>
                                <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                                    <Icon name="X" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                                    <Icon name="RefreshCw" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>

                            {/* Bottom capture button */}
                            <View style={styles.bottomControls}>
                                <TouchableOpacity
                                    style={styles.captureButton}
                                    onPress={takePicture}
                                    disabled={capturing || acquiringGPS}
                                >
                                    {capturing ? (
                                        <ActivityIndicator size="large" color="#FFFFFF" />
                                    ) : (
                                        <View style={styles.captureButtonInner} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* GPS Accuracy Warning */}
                            {!acquiringGPS && gpsAccuracy && gpsAccuracy > 50 && (
                                <View style={styles.warningBanner}>
                                    <Icon name="AlertTriangle" size={16} color="#f59e0b" />
                                    <Text style={styles.warningText}>
                                        Low GPS accuracy (±{Math.round(gpsAccuracy)}m)
                                    </Text>
                                </View>
                            )}
                        </CameraView>
                    </>
                ) : (
                    <View style={styles.permissionContainer}>
                        <Icon name="Camera" size={64} color="#9CA3AF" />
                        <Text style={styles.permissionText}>Camera permission required</Text>
                    </View>
                )}
            </View>
        );
    }

    // Preview view
    return (
        <View style={styles.container}>
            {/* Preview container with overlay - this will be captured */}
            <View 
                ref={previewContainerRef}
                style={styles.previewContainer}
                collapsable={false}
            >
                <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
                
                {/* GPS Overlay at bottom (will be burned into final image) */}
                <View style={styles.previewOverlayContainer}>
                    <View style={styles.previewOverlay}>
                        <Text
                            style={[
                                styles.overlayText,
                                previewPhoto && previewPhoto.accuracy > 50 ? { color: "#fbbf24" } : null
                            ]}
                        >
                            {previewOverlayText}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Top controls */}
            <View style={styles.topControls}>
                <TouchableOpacity style={styles.controlButton} onPress={handleRetake}>
                    <Icon name="RotateCcw" size={24} color="#FFFFFF" />
                    <Text style={styles.controlButtonText}>Retake</Text>
                </TouchableOpacity>
            </View>

            {/* Accuracy warning */}
            {previewPhoto && previewPhoto.accuracy > 50 && (
                <View style={[styles.warningBanner, { top: 80 }]}>
                    <Icon name="AlertTriangle" size={16} color="#f59e0b" />
                    <Text style={styles.warningText}>
                        Low GPS accuracy (±{Math.round(previewPhoto.accuracy)}m) - Consider retaking
                    </Text>
                </View>
            )}

            {/* Action buttons */}
            <View style={styles.previewActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton, saved && styles.actionButtonSuccess]}
                    onPress={handleSaveToGallery}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Icon name={saved ? "CheckCircle2" : "Download"} size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>
                                {saved ? "✓ Saved" : "Save to Gallery"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {!hideUploadButton && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.uploadButton, uploaded && styles.actionButtonSuccess]}
                        onPress={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Icon name={uploaded ? "CheckCircle2" : "Upload"} size={20} color="#FFFFFF" />
                                <Text style={styles.actionButtonText}>
                                    {uploaded ? "✓ Uploaded" : "Upload"}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={onClose}
                >
                    <Icon name="X" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    camera: {
        flex: 1,
    },
    previewContainer: {
        flex: 1,
        backgroundColor: "#000000",
    },
    previewImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    preview: {
        flex: 1,
        backgroundColor: "#000000",
    },
    previewOverlayContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    previewOverlay: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111827",
    },
    permissionText: {
        marginTop: 16,
        fontSize: 16,
        color: "#9CA3AF",
        fontWeight: "500",
    },
    overlayContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    overlay: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    overlayContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    overlayText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
        textShadowColor: "rgba(0, 0, 0, 0.8)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    topControls: {
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    controlButton: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    controlButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    bottomControls: {
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#FFFFFF",
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFFFFF",
    },
    warningBanner: {
        position: "absolute",
        top: 120,
        left: 20,
        right: 20,
        backgroundColor: "rgba(251, 191, 36, 0.9)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    warningText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
        flex: 1,
    },
    previewActions: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        gap: 12,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButton: {
        backgroundColor: "#3B82F6",
    },
    uploadButton: {
        backgroundColor: "#22C55E",
    },
    cancelButton: {
        backgroundColor: "#6B7280",
    },
    actionButtonSuccess: {
        backgroundColor: "#16A34A",
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});

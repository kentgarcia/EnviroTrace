import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import GeotaggedCameraComponent from "../../../components/tree-management/GeotaggedCameraComponent";

export default function CameraScreen() {
    const navigation = useNavigation();

    const handleCapture = (photo: any) => {
        // Photo was uploaded/saved via the camera component
        // Just close the screen
        Alert.alert(
            "Success",
            "Photo has been processed. You can find it in your gallery if you saved it.",
            [{ text: "OK", onPress: () => navigation.goBack() }]
        );
    };

    const handleClose = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <GeotaggedCameraComponent
                onCapture={handleCapture}
                onClose={handleClose}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
});

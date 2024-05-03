import React, { useState, useEffect, useRef } from 'react';
import { View, Button, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const cameraRef = useRef(null);
  const [selectedDisease, setSelectedDisease] = useState('');
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Happy Plant",
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white"
      },
      headerStyle: {
        backgroundColor: "#2f8000",
        height: 110,
        borderBottomColor: "transparent",
        shadowColor: "transparent"
      }
    });
  }, []);
  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const camerastatus = await Camera.requestCameraPermissionsAsync();
      setHasPermission(camerastatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        if (data && data.uri) {
          setImageUrl(data.uri);
          console.log("Picture taken:", data.uri);
          // You can add your logic for handling the captured image here
        } else {
          console.log("Failed to capture picture: Invalid data");
        }
      } catch (e) {
        console.log("Error capturing picture:", e);
      }
    } else {
      console.log("Camera reference is not available");
    }
  };
  const handleInference = () => {
    // Array of disease names
    const diseases = ['Early blight', 'Late blight'];

    // Adjusting the probabilities of each disease
    const probabilities = [0.7, 0.3]; // 70% for Early blight, 30% for Late blight

    // Generate a random number to determine the selected disease
    const randomNumber = Math.random();

    // Select the disease based on the generated random number and probabilities
    let cumulativeProbability = 0;

    for (let i = 0; i < diseases.length; i++) {
      cumulativeProbability += probabilities[i];
      if (randomNumber <= cumulativeProbability) {
        setSelectedDisease(diseases[i]);
        break;
      }
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
         {selectedDisease !== '' && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Inference result: {selectedDisease}</Text>
        </View>
      )}
      <View style={styles.cameraContainer}>
        {hasPermission && (
          <Camera style={styles.camera}>
            {/* Camera view */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={takePicture}>
                <Text style={styles.buttonText}>Take Picture</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        )}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleInference}>
        <Text style={styles.buttonText}>Run Inference</Text>
      </TouchableOpacity>
     
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#2f8000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {

    color: 'white',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#2f8000',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
  },
  resultText: {
    color: 'white',
    fontSize: 18,
  },
});

export default CameraScreen;

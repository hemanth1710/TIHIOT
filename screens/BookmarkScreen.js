import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import { Camera } from 'expo-camera';
import {
  View,
  Image,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Button,
} from 'react-native';
import {
  getStorage,
  ref,
  getDownloadURL,
  listAll
} from 'firebase/storage';
import * as Permissions from 'expo-permissions';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { firebaseApp } from '../config';
import { Entypo, Ionicons } from '@expo/vector-icons';

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const BookmarkScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [photoData, setPhotoData] = useState([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Fetch data again
    fetchPhotoData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPhotoData();
  }, [onRefresh]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Happy Plant",
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
      },
      headerStyle: {
        backgroundColor: "#2f8000",
        height: 110,
        borderBottomColor: "transparent",
        shadowColor: "transparent",
      },
    })
  }, []);

  const fetchPhotoData = async () => {
    const storageRef = ref(storage, 'Folder');

    try {
      const listResult = await listAll(storageRef);

      const data = await Promise.all(
        listResult.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const documentId = item.name.split('.')[0];

          try {
            const firestoreDocRef = doc(db, 'leaf', documentId);
            const firestoreDoc = await getDoc(firestoreDocRef);

            if (firestoreDoc.exists()) {
              const firestoreData = firestoreDoc.data();
              return {
                id: documentId,
                imageUrl: url,
                imageDetails: firestoreData ? firestoreData : null,
              };
            } else {
              console.warn(`Firestore document not found for image ${documentId}`);
              return null;
            }
          } catch (error) {
            console.error('Error fetching Firestore document:', error);
            return null;
          }
        })
      );

      const filteredData = data.filter((item) => item?.imageDetails?.bookmark);
      setPhotoData(filteredData);
    } catch (error) {
      console.error('Error fetching photo data from Storage:', error);
    }
  };

  const handleBookmarkPress = async (documentId) => {
    try {
      const firestoreDocRef = doc(db, 'leaf', documentId);
      const firestoreDoc = await getDoc(firestoreDocRef);
      if(firestoreDoc==null)
      {
        // <Text>NO BOOKMARKED IMAGES</Text>
        console.log("NO BOOKMARKED IMAGES");
      }
      if (firestoreDoc.exists()) {
        const currentBookmarkStatus = firestoreDoc.data()?.bookmark || false;
        const newBookmarkStatus = !currentBookmarkStatus;

        await updateDoc(firestoreDocRef, { bookmark: newBookmarkStatus });

        // Update local state to reflect the change
        setPhotoData((prevData) =>
          prevData.map((item) =>
            item.id === documentId ?
            { ...item, imageDetails: { ...item.imageDetails, bookmark: newBookmarkStatus } } :
            item
          )
        );
      }
    } catch (error) {
      console.error('Error updating Firestore document:', error);
    }
  };

  const renderPhotoItem = ({ item }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.photoImage} />
      <TouchableOpacity
        style={styles.bookmarkIcon}
        onPress={() => handleBookmarkPress(item.id)}
      >
        <Ionicons
          name={item.imageDetails?.bookmark ? 'bookmark-sharp' : 'bookmark-outline'}
          size={24}
        />
      </TouchableOpacity>
      <View style={styles.photoDetails}>
        <Text style={styles.detailsText}>Image ID: {item.id}</Text>
        {item.imageDetails ? (
          <>
            <Text style={styles.detailsText}>
             {item.imageDetails['Early Blight'] && `Early Blight: ${item.imageDetails['Early Blight']}\n`}
            {item.imageDetails['Healthy'] && `Healthy: ${item.imageDetails['Healthy']}\n`}
            {item.imageDetails['Late Blight'] && `Late Blight: ${item.imageDetails['Late Blight']}\n`}
            {item.imageDetails['timestamp'] && `Date: ${(item.imageDetails['timestamp'].toDate().toDateString())}`} 
            </Text>
          </>
        ) : (
          <Text style={styles.detailsText}>No details available</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={photoData}
        keyExtractor={(item) => item.id}
        renderItem={renderPhotoItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    position: 'relative',
  },
  photoImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  bookmarkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  photoDetails: {
    flex: 1,
    marginLeft: 10,
  },
  detailsText: {
    fontSize: 15,
    marginBottom: 3,
    lineHeight: 25,
    fontWeight: 'bold',
  },
});


// import React, { useState, useRef, useEffect } from 'react';
// import { View, Button, StyleSheet, Platform } from 'react-native';
// import { Camera, CameraType } from 'expo-camera';
// import * as MediaLibrary from 'expo-media-library'
// import * as ImagePicker from 'expo-image-picker';
// import * as Permissions from 'expo-permissions';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';


//   const BookmarkScreen = () => {
//   const navigation = useNavigation();
//   const [hasPermission, setHasPermission] = useState(null);
//   const [imageUrl, setImageUrl] = useState('');
//   const [imageFile, setImageFile] = useState(null);
//   const [type, setType] = useState(Camera.Constants.Type.back);
//   const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
//   const cameraRef = useRef(null);

//   useEffect(() => {
//     (async () => {
//      MediaLibrary.requestPermissionsAsync();
//      const camerastatus = await Camera.requestCameraPermissionsAsync();
//      setHasPermission(camerastatus.status === 'granted');
//     })();
//   }, []);

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       try {
//         const data = await cameraRef.current.takePictureAsync();
//         if (data && data.uri) {
//           setImageUrl(data.uri);
//           console.log("Picture taken:", data.uri);
//         } else {
//           console.log("Failed to capture picture: Invalid data");
//         }
//       } catch (e) {
//         console.log("Error capturing picture:", e);
//       }
//     } else {
//       console.log("Camera reference is not available");
//     }
//   }

//   const model = 'tih-iot';
//   const version = '1';
//   const apiKey = 'h6biqgKRe29vFMRpFOur'; // Replace with your Roboflow API key

 
  
//   const handleInference = async () => {
//       try {
//           // Read image file and encode to base64
//           const image = fs.readFileSync(imageUrl, {
//               encoding: "base64"
//           });
  
//           // Send POST request to Roboflow API
//           const response = await axios({
//               method: "POST",
//               url: `https://detect.roboflow.com/${model}/${version}`,
//               params: {
//                   api_key: apiKey
//               },
//               data: image,
//               headers: {
//                   "Content-Type": "application/x-www-form-urlencoded"
//               }
//           });
  
//           // Log response data
//           console.log(response.data);
//       } catch (error) {
//           console.log(error.message);
//       }
//   };
  
//   return (

//     <View style={styles.container}>
//       <View style={styles.header}>
//         {/* Your header content here */}
  
//       </View>
//       <View style={styles.content}>
//         {/* Your content including inputs, buttons, etc. here */}
//         {/* <Button title="Choose Photo" onPress={takePicture} /> */}
//         <Button title="Run Inference" onPress={handleInference} />
//       </View>
//       { hasPermission && (
//         <Camera style={{ flex: 1 }} type={type} flashMode={flash} ref={cameraRef}>
//           <Button title="Take Picture" onPress={takePicture} />
//         </Camera>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f7fafc',
//   },
//   camera: {
//     flex: 1, 
//     borderRadius:20,

//   },
//   header: {
//     backgroundColor: 'white',
//     padding: 20,
//   },
//   content: {
//     padding: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#cbd5e0',
//     borderRadius: 4,
//     height: 40,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
// });

export default BookmarkScreen;

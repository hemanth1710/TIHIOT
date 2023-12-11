import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import {
  View,
  Image,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  getStorage,
  ref,
  getDownloadURL,
  listAll
} from 'firebase/storage';
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
              Dried: {item.imageDetails['Dried']}{'\n'}
              Early Blight: {item.imageDetails['Early Blight']}{'\n'}Healthy: {item.imageDetails['Healthy']}{'\n'}Late Blight: {item.imageDetails['Late Blight']}
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

export default BookmarkScreen;

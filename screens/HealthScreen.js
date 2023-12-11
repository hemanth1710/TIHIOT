import React, { useState, useEffect } from 'react';
import { View, Image, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation} from "@react-navigation/native";
import { useLayoutEffect } from "react";
import { firebaseApp } from '../config';
import { Entypo, Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const HealthScreen = () => {
  const navigation = useNavigation();
  const [photoData, setPhotoData] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
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
      headerRight: () => (
        <TouchableOpacity style={styles.filterIcon} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, filterModalVisible]);

  useEffect(() => {
    const fetchData = async () => {
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

        const filteredData = data.filter((item) => item !== null);

        const sortedData = filteredData.sort((a, b) => (b.imageDetails[selectedFilter] || 0) - (a.imageDetails[selectedFilter] || 0));

        setPhotoData(sortedData);
      } catch (error) {
        console.error('Error fetching photo data from Storage:', error);
      }
    };

    fetchData();
  }, [selectedFilter]);

  const applyFilter = (data, filter) => {
    if (!filter) {
      return data;
    }

    return data.filter((item) => item.imageDetails && item.imageDetails[filter]);
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

  const handleBookmarkPress = async (documentId) => {
    try {
      const firestoreDocRef = doc(db, 'leaf', documentId);
      const firestoreDoc = await getDoc(firestoreDocRef);

      if (firestoreDoc.exists()) {
        const currentBookmarkStatus = firestoreDoc.data()?.bookmark || false;
        const newBookmarkStatus = !currentBookmarkStatus;

        await updateDoc(firestoreDocRef, { bookmark: newBookmarkStatus });

        setPhotoData((prevData) =>
          prevData.map((item) =>
            item.id === documentId
              ? { ...item, imageDetails: { ...item.imageDetails, bookmark: newBookmarkStatus } }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating Firestore document:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photoData}
        keyExtractor={(item) => item.id}
        renderItem={renderPhotoItem}
      />

      {/* Filter Modal */}
      <Modal
        isVisible={filterModalVisible}
        onBackdropPress={() => setFilterModalVisible(false)}
        backdropOpacity={0.5}
      >
        <View style={styles.filterModal}>
          <TouchableOpacity
            style={[styles.filterOption, selectedFilter === 'Early Blight' && styles.selectedFilter]}
            onPress={() => {
              setFilterModalVisible(false);
              setSelectedFilter('Early Blight');
            }}
          >
            <Text style={selectedFilter === 'Early Blight' ? styles.selectedFilterText : styles.filterText}>Early Blight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, selectedFilter === 'Late Blight' && styles.selectedFilter]}
            onPress={() => {
              setFilterModalVisible(false);
              setSelectedFilter('Late Blight');
            }}
          >
            <Text style={selectedFilter === 'Late Blight' ? styles.selectedFilterText : styles.filterText}>Late Blight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, selectedFilter === 'Dried' && styles.selectedFilter]}
            onPress={() => {
              setFilterModalVisible(false);
              setSelectedFilter('Dried');
            }}
          >
            <Text style={selectedFilter === 'Dried' ? styles.selectedFilterText : styles.filterText}>Dried</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, selectedFilter === 'Healthy' && styles.selectedFilter]}
            onPress={() => {
              setFilterModalVisible(false);
              setSelectedFilter('Healthy');
            }}
          >
            <Text style={selectedFilter === 'Healthy' ? styles.selectedFilterText : styles.filterText}>Healthy</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    fontWeight:'bold',
  },
  filterIcon: {
    marginRight: 20,
  },
  filterModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  filterOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  filterText: {
    fontSize: 16,
  },
  selectedFilter: {
    backgroundColor: '#eee',
    fontWeight: 'bold',
    // marginLeft: 5,
  },
  selectedFilterText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign:'center',
  },
});

export default HealthScreen;

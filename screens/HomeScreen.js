import { doc, setDoc } from "firebase/firestore"; 
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect, useEffect, useState } from "react";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { SelectList } from "react-native-dropdown-select-list";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { firebaseApp } from '../config';

import {
  getFirestore
} from 'firebase/firestore';

const db = getFirestore(firebaseApp);

//water usage
const fetchDataFromThingSpeak = async () => {
  const API_KEY = "M4LXVBW4051CF5J2"; // Replace with your ThingSpeak API key
  const CHANNEL_ID = "2263536"; // Replace with your ThingSpeak channel ID
  const URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${API_KEY}`;

  try {
    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const data = await response.json();
    return data.feeds[0]; 
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [isCalendarVisible, setIsCalendarVisible] = React.useState(false);
  const [growthStage, setGrowthStage] = React.useState("select sowing date");
  const [fieldData, setFieldData] = React.useState(null);
  const [distance, setDistance] = React.useState("");

  const handleSubmit = async () => {
    try {
      const plantDocRef = doc(db, "plantDetails", selected); 
      const plantData = {
        plantType: selected,
        sowingDate: selectedDate,
        distanceBetweenPlants: distance,
      };

      // Set the document with the plant data
      await setDoc(plantDocRef, plantData);

      console.log("Data uploaded successfully!");
    } catch (error) {
      console.error("Error uploading data to Firestore:", error);
    }
  };

  const toggleCalendar = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };

  const data = [
    { key: "0", value: "Type your plant", disabled: true },
    { key: "8", value: "Tomato" },
    { key: "9", value: "Potato" },
    { key: "10", value: "Chilly" },
    { key: "11", value: "Brinjal" }
  ];
  //start and end date

  class Stage {
    constructor(name, startDate, endDate, completed = false) {
      this.name = name;
      this.startDate = startDate;
      this.endDate = endDate;
      this.completed = completed;
    }
    markAsCompleted() {
      this.completed = true;
    }
  }
  const stages = [
    { name: "Germination", start: 0, end: 8 },
    { name: "Early Growth", start: 9, end: 38 },
    { name: "Vegetative Growth", start: 39, end: 59 },
    { name: "Flowering", start: 60, end: 79 },
    { name: "Pollination", start: 80, end: 99 },
    { name: "Fruit Formation", start: 100, end: 119 },
    { name: "Ripening", start: 120, end: 150 }
  ];

  const stageInstances = stages.map(stage => {
    const startDate = new Date(selectedDate);
    console.log(selectedDate);
    const startOffset = stage.start;
    const endOffset = stage.end;
  
    const startDay = new Date(startDate.setDate(startDate.getDate() + startOffset));
    const endDay = new Date(startDate.setDate(startDate.getDate() + (endOffset - startOffset)));
    
    
    // Check if the current date is within the stage range
    const currentDate = new Date(); // Current date
    const isCompleted = currentDate > endDay;
  
    return new Stage(stage.name,startDay.toLocaleDateString() ,endDay.toLocaleDateString(), isCompleted);
  });
  

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

  //fetch thingspeak data
  useEffect(() => {
    async function fetchData() {
      const data = await fetchDataFromThingSpeak();
      setFieldData(data);
    }

    fetchData();
  }, []);

  const currentStage = stageInstances.find(
    (stage) => stage.name === "Germination"
  );

  const determineGrowthStage = (date) => {
    const selected = new Date(date);
    // Get today's date
    const today = new Date();
    if (selected > today) {
      setGrowthStage("Future date");
      return; // Exit the function
    }
    // Calculate the difference in days between selectedDate and today
    const differenceInTime = today.getTime() - selected.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    // Define stages
    if (differenceInDays >= 0 && differenceInDays < 9) {
      setGrowthStage("Germination");
    } else if (differenceInDays >= 9 && differenceInDays < 39) {
      setGrowthStage("Early Growth");
    } else if (differenceInDays >= 39 && differenceInDays < 60) {
      setGrowthStage("Vegetative Growth");
    } else if (differenceInDays >= 60 && differenceInDays < 80) {
      setGrowthStage("Flowering");
    } else if (differenceInDays >= 80 && differenceInDays < 100) {
      setGrowthStage("Pollination");
    } else if (differenceInDays >= 100 && differenceInDays < 120) {
      setGrowthStage("Fruit Formation");
    } else if (differenceInDays >= 120 && differenceInDays < 150) {
      setGrowthStage("Ripening");
    }
  };

  const completedStages = stageInstances.filter((stage) => stage.completed);
  const currentDate = new Date();
  const valvePosition = fieldData && fieldData.field1 === 1 ? "On" : "Off";

  return (
    <View>
      <ScrollView>
        <View
          style={{
            margin: 20,
            borderColor: "#FFC72C",
            borderWidth: 3,
            borderRadius: 6
          }}
        >
          {/* Dropdown box */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 10,
              borderColor: "#FFC72C",
              borderWidth: 2,
              paddingVertical: 15,
              flex: 1
            }}
          >
            <Feather name="search" size={24} color="black" />

            <View style={{ flex: 1 }}>
              <SelectList
                setSelected={(val) => setSelected(val)}
                data={data}
                save="value"
              />
            </View>
          </Pressable>

          <Pressable
            onPress={toggleCalendar}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 10,
              borderColor: "#FFC72C",
              borderWidth: 2,
              paddingVertical: 15
            }}
          >
            <Feather name="calendar" size={24} color="black" />
            {isCalendarVisible ? (
              <Calendar
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  toggleCalendar();
                  determineGrowthStage(day.dateString);
                }}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedDotColor: "orange"
                  }
                }}
              />
            ) : (
              // Display selected date or placeholder text when the calendar is not visible
              <Text>
                {selectedDate ? selectedDate : "Select a sowing date"}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 10,
              borderColor: "#FFC72C",
              borderWidth: 2,
              paddingVertical: 15,
              flex: 1
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={24}
              color="black"
            />
            <TextInput
              placeholder="Enter distance between plants(in ft)"
              keyboardType="numeric"
              value={distance}
              onChangeText={(text) => setDistance(text)}
            ></TextInput>
          </Pressable>

          <Pressable
          onPress={handleSubmit}
            style={{
              gap: 10,
              paddingHorizontal: 10,
              borderColor: "#FFC72C",
              borderWidth: 2,
              paddingVertical: 15,
              flex: 1,
              backgroundColor: "#2f8000"
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 15,
                fontWeight: "500",
                color: "white"
              }}
            >
              Submit
            </Text>
          </Pressable>
        </View>

        <Text style={{ marginHorizontal: 20, fontSize: 17, fontWeight: "500" }}>
          Empowering Growth, One Leaf at a Time
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            style={{
              width: 300,
              height: 250,
              marginTop: 10,
              backgroundColor: "#2f8000",
              borderRadius: 10,
              padding: 20,
              marginHorizontal: 20
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 15,
                fontWeight: "bold",
                marginVertical: 7
              }}
            >
              Stages of Growth
            </Text>
            <Text>{growthStage}</Text>
          </Pressable>

          <Pressable
            style={{
              width: 300,
              height: 250,
              marginTop: 10,
              backgroundColor: "#2f8000",
              borderRadius: 10,
              padding: 20,
              marginHorizontal: 20
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 15,
                fontWeight: "bold",
                marginVertical: 7
              }}
            >
              Water usage
            </Text>
            {fieldData && (
              <View>
                <Text
                  style={{ color: "white", fontSize: 15, fontWeight: "500" }}
                >
                  Valve Position:{valvePosition}
                </Text>
                <Text
                  style={{ color: "white", fontSize: 15, fontWeight: "500" }}
                >
                  Total Water Used: {fieldData.field2} L
                </Text>
                <Text
                  style={{ color: "white", fontSize: 15, fontWeight: "500" }}
                >
                  Flow Rate: {fieldData.field3} L/min
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={{
              width: 300,
              height: 250,
              marginTop: 10,
              backgroundColor: "#2f8000",
              borderRadius: 10,
              padding: 20,
              marginHorizontal: 20
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 15,
                fontWeight: "bold",
                marginVertical: 7
              }}
            ></Text>
            <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }}>
              Bot is capturing image at the speed of 2 images/second
            </Text>
          </Pressable>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
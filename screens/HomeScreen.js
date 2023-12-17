import { getVariableDataFromUbidots } from "../get";
import { getVariableDataFromUbidotsSwitch } from "../getSwitch";
import { sendValueToUbidotsSwitch } from "../postSwitch";
import { sendValueToUbidots } from "../post";
import { doc, setDoc } from "firebase/firestore"; 
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
  Button, Switch, TouchableOpacity, Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect, useEffect, useState } from "react";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { SelectList } from "react-native-dropdown-select-list";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { firebaseApp } from '../config';
// import * as maptilersdk from '@maptiler/sdk';
import { FontAwesome } from "@expo/vector-icons";

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
    console.log(data.feeds[data.feeds.length - 1]);
    return data.feeds[data.feeds.length - 1]
    
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
const fetchDataFromThingSpeakLoc= async () => {
  const API_KEY = "GZ672LVUYNM59ZJS"; // Replace with your ThingSpeak API key
  const CHANNEL_ID = "2382415"; // Replace with your ThingSpeak channel ID
  const URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${API_KEY}`;

  try {
    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    const data = await response.json();
    console.log(data.feeds[data.feeds.length-1]);
    // console.log(data.feeds[data.feeds.length-1].field1);
    let latitude=data.feeds[data.feeds.length-1].field1
    // console.log(data.feeds[data.feeds.length-1].field2);
    let longitude=data.feeds[data.feeds.length-1].field2;
    return {latitude, longitude};
    
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const HomeScreen = ( ) => {
  // const { currentUser } = route.params;
  const navigation = useNavigation();
  const [selected, setSelected] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [isCalendarVisible, setIsCalendarVisible] = React.useState(false);
  const [growthStage, setGrowthStage] = React.useState("select sowing date");
  const [fieldData, setFieldData] = React.useState(null);
  const [distance, setDistance] = React. useState("");
  const [refreshing, setRefreshing] = React.useState(false);
  const [isValveOn, setIsValveOn] = React.useState(false);
  const [stageInstances, setStageInstances] = React.useState([]);
  const [isSwitchOn, setIsSwitchOn]=React.useState(false)
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
      },
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 25 }}
          onPress={() => openGoogleMapsApp()}
        >
          <FontAwesome name="map-marker" size={30} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  const openGoogleMapsApp = async() => {
    // Example coordinates (replace with your desired location)
    try {
      const locationData = await fetchDataFromThingSpeakLoc();
  
      if (locationData) {
        const { latitude, longitude } = locationData;
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
  
        if (Platform.OS === 'android') {
          // On Android, use a URI scheme to open Google Maps
          Linking.openURL(`geo:${latitude},${longitude}?q=${latitude},${longitude}`);
        } else {
          // On iOS, use a different URI scheme
          Linking.openURL(`maps://app?daddr=${latitude},${longitude}&dirflg=d`);
        }
      } else {
        console.log("Failed to fetch location data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
};

  useEffect(() => {
    // Fetch initial value from Ubidots when the component mounts
    fetchCurrentValue();
  }, []);
  const fetchCurrentValue = async () => {
    try {
      const currentValue = await getVariableDataFromUbidots();
      const currentSwitchValue= await getVariableDataFromUbidotsSwitch();
      setIsSwitchOn(currentSwitchValue === 1)
      setIsValveOn(currentValue === 1);
    } catch (error) {
      console.error("Error fetching current value:", error);
    }
  };
    const handleToggleSwitch = async () => {
      try {
        // Toggle the value
        const newValue = isValveOn ? 0 : 1;
  
        // Send the updated value to Ubidots
        await sendValueToUbidots(newValue);
  
        // Update the local state
        setIsValveOn(!isValveOn);
      } catch (error) {
        console.error("Error toggling switch:", error);
      }
    };
    const handleToggleSwitchKill = async () => {
      try {
        // Toggle the value
        const newValue = isSwitchOn ? 0 : 1;
  
        // Send the updated value to Ubidots
        await sendValueToUbidotsSwitch(newValue);
  
        // Update the local state
        setIsSwitchOn(!isSwitchOn);
      } catch (error) {
        console.error("Error toggling switch:", error);
      }
    };
  const fetchData = async () => {
    setRefreshing(true); 

    try {
      const data = await fetchDataFromThingSpeak();
      setFieldData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false); // Set refreshing to false when data fetch completes (or encounters an error)
    }
  };


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
    { name: "Ripening", start: 120, end: 150 },
  ];

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
    fetchData(); // Fetch data when the component mounts

    // Set up an interval to fetch data every X milliseconds (e.g., every 5 minutes)
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 2 * 60 * 100); // Adjust the interval as needed previiousy 100 or 1000


    // Clear the interval when the component is unmounted
    return () => clearInterval(refreshInterval);
  }, []);


  const determineGrowthStage = (date) => {
    const selected = new Date(date);
    // Get today's date
    const today = new Date();
    if (selected > today) {
      setGrowthStage("Future date");
      return; // Exit the function
    }
    const formattedDate = new Date(date);
    const fDate = `${formattedDate.getFullYear()}-${String(
      formattedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(formattedDate.getDate()).padStart(2, "0")}`;

    console.log("formatted date is :" + formattedDate);

    const newStageInstances = stages.map((stage) => {
      const startOffset = stage.start;
      const endOffset = stage.end;

      const startDate = fDate; // Use the formatted date here

      const startDay = new Date(startDate);
      startDay.setDate(startDay.getDate() + startOffset);
      const endDay = new Date(startDate);

      endDay.setDate(endDay.getDate() + endOffset);
      // Check if the current date is within the stage range
      const currentDate = new Date(); // Current date
      const isCompleted = currentDate > endDay;

      console.log(stage.name+"-"+startDay.toLocaleDateString("en-GB")+"-"+endDay.toLocaleDateString("en-GB")+":"+isCompleted);
      return new Stage(
        stage.name,
        startDay.toLocaleDateString("en-GB"),//remove en-GB for ios
        endDay.toLocaleDateString("en-GB"),
        isCompleted
      );
    });
    setStageInstances(newStageInstances);
    // Calculate the difference in days between selectedDate and today
    if (formattedDate instanceof Date) {
      const fDate = `${formattedDate.getFullYear()}-${String(
        formattedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(formattedDate.getDate()).padStart(2, "0")}`;
      console.log(fDate);
    } else {
      console.error("selectedDate is not a valid Date object");
      // Handle this case accordingly, such as setting a default date or informing the user about the issue.
    }
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
    }else if (differenceInDays >= 150) {
      setGrowthStage("Completed");
    }
  };

  // const completedStages = stageInstances.filter((stage) => stage.completed);
  // const currentDate = new Date();
  const currentStage =
  stageInstances &&
  stageInstances.find((stage) => stage.name === growthStage);
let nextStage = null;

if (currentStage) {
  const currentIndex = stageInstances.indexOf(currentStage);

  if (currentIndex !== -1 && currentIndex < stageInstances.length - 1) {
    nextStage = stageInstances[currentIndex + 1];
  }
}
console.log(nextStage && nextStage.name +"starting on"+nextStage.startDate);

  const valvePosition = fieldData && fieldData.field1 === "1" ? "Off" : "On";

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
                  // const date = new Date(day.dateString);
                  const selectedDate = new Date(day.dateString);
                  const today = new Date(); // Get today's date
                  if (selectedDate > today) {
                    Alert.alert(
                      'Warning',
                      'Please select a sowing date on or before today',
                      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
                    );
                    return;
                  }
                
                  setSelectedDate(day.dateString);
                  determineGrowthStage(day.dateString);
                  toggleCalendar();
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
        <ScrollView
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
            {stageInstances && stageInstances.length > 0 && (
              <View>
                <Text
                  style={{
                    color: "brown",
                    fontSize: 13,
                    marginVertical: 7
                  }}
                >
                  Completed Stages:
                </Text>
                {stageInstances
                  .filter((stage) => stage.completed)
                  .map((completedStage) => (
                    <Text
                      key={completedStage.name}
                      style={{
                        color: "white",
                        fontSize: 12,
                        marginVertical: 7
                      }}
                    >
                      {completedStage.name}: {completedStage.startDate} -{" "}
                      {completedStage.endDate}
                    </Text>
                  ))}

                <Text style={{
                    color: "#90EE90",
                    fontSize: 13,
                    marginVertical: 7
                  }}>Current stage:</Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    marginVertical: 7
                  }}
                >
                  {growthStage} 
                  {/* ending on {currentStage && currentStage.endDate} */}
                </Text>

                {nextStage && (
                  <React.Fragment>
                    <Text style={{
                        color: "#FFDF00",
                        fontSize: 13,
                        marginVertical: 7
                      }}>Upcoming stage:</Text>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        marginVertical: 7
                      }}
                    >
                      {nextStage.name} starting on {nextStage.startDate}
                    </Text>
                  </React.Fragment>
                )}
              </View>
            )}

          </ScrollView>

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
             <View style={{ position: "absolute", top: 10, right: 10 }}>
            <Switch
              value={!isValveOn}
              onValueChange={handleToggleSwitch}
              ios_backgroundColor="#3e3e3e"
              thumbColor={isValveOn ? "#f4f3f4" : "2f8000"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              
            />
          </View>
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
            <View style={{ position: "absolute", top: 10, right: 10 }}>
            <Switch
              value={!isSwitchOn}
              onValueChange={handleToggleSwitchKill}
              ios_backgroundColor="#3e3e3e"
              thumbColor={isSwitchOn ? "#f4f3f4" : "2f8000"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              
            />
          </View>
          </Pressable>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
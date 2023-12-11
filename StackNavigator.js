import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import HealthScreen from "./screens/HealthScreen";
import BookmarkScreen from "./screens/BookmarkScreen";
import ProfileScreen from "./screens/ProfileScreen";

//home
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

//bookmark
import { Feather } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

//profile
import { Ionicons } from "@expo/vector-icons";

const StackNavigator = () => {
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();
  function BottomTabs() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Entypo name="home" size={24} color="#2f8000" />
              ) : (
                <AntDesign name="home" size={24} color="black" />
              )
          }}
        />

        <Tab.Screen
          name="Health"
          component={HealthScreen}
          options={{
            tabBarLabel: "Health",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name="heartbeat" size={24} color="#2f8000" />
              ) : (
                <FontAwesome name="heartbeat" size={24} color="black" />
              )
          }}
        />
        
         <Tab.Screen
          name="Bookmark"
          component={BookmarkScreen}
          options={{
            tabBarLabel: "Bookmark",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name="bookmark" size={24} color="#2f8000" />
              ) : (
                <Feather name="bookmark" size={24} color="black" />
              )
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="person" size={24} color="#2f8000" />
              ) : (
                <Ionicons name="person-outline" size={24} color="black" />
              )
          }}
        />
      </Tab.Navigator>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={BottomTabs} options={{headerShown:false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
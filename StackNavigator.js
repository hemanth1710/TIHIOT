import { StyleSheet } from "react-native";
import React from "react";
import { NavigationContainer, getFocusedRouteNameFromRoute  } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import CameraScreen from "./screens/Camerascreen";
import HealthScreen from "./screens/HealthScreen";
import BookmarkScreen from "./screens/BookmarkScreen";
import ProfileScreen from "./screens/ProfileScreen";
import QueryScreen from "./screens/QueryScreen";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const StackNavigator = () => {
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();

  
  function BottomTabs() {
    const getroute = (route) => {
      const routename = getFocusedRouteNameFromRoute(route);
      if (routename?.includes('Profile')) {
        return "none";
      }
      return "flex";
    };
    return (
      <Tab.Navigator initialRouteName="Profile">
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
              ),
              tabBarHideOnKeyboard:true
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
              ),
              tabBarHideOnKeyboard:true
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
            ),
              
              tabBarHideOnKeyboard:true
          }}
        />
        {/* <Tab.Screen
    name="Camera"
    component={CameraScreen}
    options={{
      tabBarLabel: "Camera",
      headerShown: false,
      tabBarIcon: ({ focused }) =>
      !focused ? (
        <AntDesign name="camerao" size={24} color="black" />
      ) : (
        <AntDesign name="camera" size={24} color="black" />
      ),
        
      tabBarHideOnKeyboard: true,
    }}
  /> */}
          <Tab.Screen
    name="Query"
    component={QueryScreen}
    options={{
      tabBarLabel: "Query",
      headerShown: false,
      tabBarIcon: ({ focused }) =>
      !focused ? (
        <Ionicons name="leaf-outline" size={24} color="black" />
      ) : (
        <Ionicons name="leaf" size={24} color="black" />
      ),
        
      tabBarHideOnKeyboard: true,
    }}
  />

<Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ route }) => ({
            tabBarStyle: {display:'none'},
            tabBarLabel: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="person" size={24} color="#2f8000" />
              ) : (
                <Ionicons name="person-outline" size={24} color="black" />
              ),
              tabBarHideOnKeyboard:true,
                // Hide the tab bar when "Profile" tab is active
          })}
        />
      </Tab.Navigator>
    );

  }

  return (
    <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
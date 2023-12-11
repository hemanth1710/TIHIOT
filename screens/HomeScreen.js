import { StyleSheet, Text, View } from "react-native";
import { useNavigation} from "@react-navigation/native";
import { useLayoutEffect } from "react";
import React from "react";

const HomeScreen = () => {
  const navigation = useNavigation();
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
  return (
    <View>
      <Text>HomeScreen</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
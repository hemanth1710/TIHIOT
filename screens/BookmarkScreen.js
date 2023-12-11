import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigation} from "@react-navigation/native";
import { useLayoutEffect } from "react";

const BookmarkScreen = () => {
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
      <Text>BookmarkScreen</Text>
    </View>
  );
};

export default BookmarkScreen;

const styles = StyleSheet.create({});
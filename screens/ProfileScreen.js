import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet,Pressable, ScrollView } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut  } from 'firebase/auth';
import { Auth } from "../config";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';


const ProfileScreen = () => {
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const handleSignIn = async () => {
    try {
    const userCredential = await signInWithEmailAndPassword(Auth, email, password);
    const user = userCredential.user;
    console.log('Signed in successfully:', email);
    setCurrentUser(user.email);
    setEmail('');
    setPassword('')
    // Redirect to the Home screen with the user ID as a prop
    navigation.navigate('Home', { currentUser: email });
  } catch (error) {
    console.error('Sign-in error:', error.message);
  }

  };

  const handleSignUp = async () => {
    try {
    const userCredential = await createUserWithEmailAndPassword(Auth, email, password);
      const user = userCredential.user;
      console.log('Signed up successfully:', user.email);
      setCurrentUser(user.email);
      setEmail('');
      setPassword('')
      // Redirect to the Home screen with the user ID as a prop
      navigation.navigate('Home', { currentUser: user.email });
    } catch (error) {
      console.error('Sign-up error:', error.message);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();

    try {
      await signOut(auth);
      // Navigate to the login screen or perform other actions after logout
      console.log('User logged out successfully');
      setCurrentUser(null);
      // Example: navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <ScrollView>
    <View style={{
      paddingTop: 200
    }}>
      
<View style={{
  margin: 10,
  borderColor: "#FFC72C",
  borderWidth: 3,
  borderRadius: 6,
  
}}>
  <View style={{
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    borderColor: "#FFC72C",
    borderWidth: 2,
    paddingVertical: 15
  }}>
    <AntDesign name="user" size={24} color="black" />
    <TextInput
      placeholder="Enter your email"
      value={email}
      onChangeText={(text) => setEmail(text)}
    />
  </View>

  <View style={{
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    borderColor: "#FFC72C",
    borderWidth: 2,
    paddingVertical: 15
  }}>
    <Entypo name="key" size={24} color="black" />
    <TextInput
      placeholder="Enter your Password"
      value={password}
      secureTextEntry
      onChangeText={(text) => setPassword(text)}
    />
  </View>
  <View style={{ flexDirection: "column", justifyContent: "space-around", borderWidth:2,borderColor: "#FFC72C" }}>
    
    <Button title="Sign Up" onPress={handleSignUp} />
  </View>
  <View style={{ flexDirection: "column", justifyContent: "space-around", borderWidth:2,borderColor: "#FFC72C" }}>
    <Button title="Sign In" onPress={handleSignIn} />
  </View>

  <View style={{ flexDirection: "column", justifyContent: "space-around", borderWidth:2,borderColor: "#FFC72C" }}>
        <Button title="Logout" onPress={handleLogout} />
  </View>


</View>
<View style={{ marginVertical: 20, alignItems: "center" }}>
            {currentUser && (
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Current User: {currentUser}</Text>
            )}
          </View>




    </View>
    </ScrollView>
  );
};


export default ProfileScreen;

import React, { useState } from 'react';
import { TextInput} from 'react-native';
import axios from 'axios';
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Button, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';

const QueryScreen = () => {
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
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuery = () => {
    setLoading(true);
    const options = {
      method: 'POST',
      url: 'https://api.gradient.ai/api/models/8186d80d-7ed4-4d29-81cb-f4abdf534f96_model_adapter/complete',
      headers: {
        accept: 'application/json',
        'x-gradient-workspace-id': '79f651dd-0571-4bd9-81aa-c53c7179e990_workspace',
        'content-type': 'application/json',
        authorization: 'Bearer NsgNJvfiFQnGDnwPetQeU6nVlqlPzBN8'
      },
      data: {
        autoTemplate: true,
        query: query
      }
    };

    axios
      .request(options)
      .then(function (response) {
        setResult(response.data);
        console.log(result.data);
        setLoading(false);
      })
      .catch(function (error) {
        console.error(error);
        setLoading(false);
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        {result && (
  <View style={styles.resultContainer}>
    {/* <Text style={styles.resultText}>Generated Output:</Text> */}
    <Text style={styles.resultText}>{result.generatedOutput}</Text>
  </View>

      )}
        <TextInput
        style={styles.input}
        placeholder="Enter your query"
        value={query}
        onChangeText={(text) => setQuery(text)}
        multiline={true} // Enable multiline input
        numberOfLines={4} // Set the number of lines to display initially
        />
      <TouchableOpacity style={styles.button} onPress={handleQuery}>
        <Text style={styles.buttonText}>Run Query</Text>
        </TouchableOpacity>
      {loading && <Text>Loading...</Text>}
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    padding: 10,
    paddingTop: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '100%',
    height: 120, // Adjust the height as needed
  },
  resultContainer: {
    backgroundColor: '#2f8000',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
  },
  resultText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'justify',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#2f8000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default QueryScreen;

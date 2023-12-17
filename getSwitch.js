// get.js
const getVariableDataFromUbidotsSwitch = async () => {
    const API_KEY = "BBFF-qX45fLdKFmCKNOtX9xE3qja45uMi6r"; // Replace with your Ubidots API key
    const variableId = "657ef5b7a6d436000e8fb9a7"; // Replace with your Ubidots variable ID
    const ubidotsEndpoint = `https://industrial.api.ubidots.com/api/v1.6/variables/${variableId}/values?page_size=1`;
    let value = null;
    try {
      const response = await fetch(ubidotsEndpoint, {
        method: "GET",
        headers: {
          "X-Auth-Token": API_KEY,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to get variable data from Ubidots");
      }
  
      const data = await response.json();
      value = data.results[0].value;
      console.log("Variable data from Ubidots:", data.results[0].value);
    } catch (error) {
      console.error("Error getting variable data from Ubidots:", error);
    }
    return value;
  };
  
  // Example usage:
  //   getVariableDataFromUbidots();
  export {getVariableDataFromUbidotsSwitch}
  
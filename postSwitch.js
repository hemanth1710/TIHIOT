const sendValueToUbidotsSwitch = async (value) => {
    const variableId = "657ef5b7a6d436000e8fb9a7"; 
    const API_KEY = "BBFF-qX45fLdKFmCKNOtX9xE3qja45uMi6r"; // Replace with your Ubidots API key
    const ubidotsEndpoint = `https://industrial.api.ubidots.com/api/v1.6/variables/${variableId}/values`;

    try {
        const response = await fetch(ubidotsEndpoint, {
        method: "POST",
        headers: {
            "X-Auth-Token": API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: value }),
        });

        if (!response.ok) {
        throw new Error("Failed to send data to Ubidots");
        }

        console.log("Data sent to Ubidots successfully!", value);
    } catch (error) {
        console.error("Error sending data to Ubidots:", error);
    }
    };
    // const valueToSend = 0; 
    // sendValueToUbidots( valueToSend);
    export {sendValueToUbidotsSwitch}
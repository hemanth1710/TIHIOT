const axios = require("axios");
const fs = require("fs");

const image = fs.readFileSync("screens/test/images.jpeg", {
    encoding: "base64"
});

axios({
    method: "POST",
    url: "https://detect.roboflow.com/tih-iot/42",
    params: {
        api_key: "h6biqgKRe29vFMRpFOur"
    },
    data: image,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
})
.then(function(response) {
    console.log(response.data);
})
.catch(function(error) {
    console.log(error.message);
});
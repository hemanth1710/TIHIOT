import firebase from  'firebase/compat/app'
import {initializeApp} from 'firebase/app';

const firebaseconfig =   {
    apiKey: "AIzaSyBUUb2Tk8i1ftvOu_1o7FDJdbYKhI-7qdk",
    authDomain: "plant-disease-detection-cc0a6.firebaseapp.com",
    projectId: "plant-disease-detection-cc0a6",
    storageBucket: "plant-disease-detection-cc0a6.appspot.com",
    messagingSenderId: "484487052362",
    appId: "1:484487052362:web:523902cc4457485fe27ab3"
}
const firebaseApp = initializeApp(firebaseconfig);

export { firebaseApp };
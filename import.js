const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "testfirestore-5d53a.firebaseapp.com",
});

const firestore = admin.firestore();

const importToFirestore = async (jsonPath, collectionName) => {
  try {
    const jsonData = require(jsonPath);
    const collectionRef = firestore.collection(collectionName);

    await collectionRef.add(jsonData);

    console.log("Yuhuuuu~ import success");
  } catch (error) {
    console.log("Error: ", error);
  }
};

importToFirestore("./data.json", "laporan");

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");
const logging = require("./utils/logging");
const {
  getReceiptsFromExcel,
  getReceiptStatusFromExcel,
} = require("./usecase/get_data_from_excel");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "-",
});

const firestore = admin.firestore();

const importToFirestore = async () => {
  try {
    const receiptIds = getReceiptsFromExcel();
    const statuses = getReceiptStatusFromExcel();
    const collectionRef = firestore.collection("laporan1");

    // await collectionRef.add(jsonData);
    console.log(`Importing ${receiptIds.length} data`);
    for (let index = 0; index < receiptIds.length; index++) {
      const receiptId = receiptIds[index];
      const status = statuses[index];

      if (receiptId == null || !receiptId.includes("P23") || status == null) {
        logging.logError(
          new Error(`Resi pada row ${index + 1} tidak valid`),
          `Resi pada row ${index + 1} tidak valid`
        );
        continue;
      }

      const element = {
        kode: receiptId,
        status: status,
      };
      await collectionRef.add(element);
    }
    console.log(`Import ${receiptIds.length} data success`);
  } catch (error) {
    console.log("Error: ", error);
  }
};

importToFirestore();

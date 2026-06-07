let admin = null;

try {

  const firebaseAdmin =
    require("firebase-admin");

  const serviceAccount =
    require("../firebase/serviceAccount.json");

  firebaseAdmin.initializeApp({
    credential:
      firebaseAdmin.credential.cert(
        serviceAccount
      ),
  });

  admin = firebaseAdmin;

  console.log(
    "✅ Firebase initialized"
  );

} catch (err) {

  console.log(
    "⚠️ Firebase disabled:",
    err.message
  );

}

module.exports = admin;
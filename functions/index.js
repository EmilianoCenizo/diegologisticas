const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.syncUserOnCreate = functions.auth.user().onCreate(async (user) => {
  const userData = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await admin.firestore().collection("users").doc(user.uid).set(userData);
    console.log(`Usuario agregado a Firestore: ${user.uid}`);
  } catch (error) {
    console.error("Error al agregar usuario:", error);
  }
});

exports.syncUserOnDelete = functions.auth.user().onDelete(async (user) => {
  try {
    await admin.firestore().collection("users").doc(user.uid).delete();
    console.log(`Usuario eliminado de Firestore: ${user.uid}`);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
  }
});

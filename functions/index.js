const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.syncUserOnCreate = functions.auth.user().onCreate(async (user) => {
  const userData = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    role: "user",
  };

  try {
    await admin.firestore().collection("users")
        .doc(user.uid)
        .set(userData, {merge: true});
    // <-- merge evita sobreescribir todo si ya existe
    console.log(`Usuario agregado o actualizado en Firestore: ${user.uid}`);
  } catch (error) {
    console.error("Error al agregar/actualizar usuario:", error);
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

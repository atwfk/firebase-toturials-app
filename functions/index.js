const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

//Auth trigger (new user signup)
exports.newUserSignup = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    upvotedOn: [],
  });
});

//Auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
  const doc = admin.firestore().collection("users").doc(user.uid);
  return doc.delete();
});

//Http callable function for adding a request
exports.addRequest = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests!"
    );
  } else {
    const requestLength = 30;
    if (data.text.length > requestLength) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `request must be no more than ${requestLength} characters long!`
      );
    } else {
      return admin.firestore().collection("requests").add({
        text: data.text,
        upvotes: 0,
      });
    }
  }
});

//Upvote callable function
exports.upvote = functions.https.onCall(async (data, context) => {
  //Check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests!"
    );
  } else {
    //Get refs for user doc and request doc
    const user = admin.firestore().collection("users").doc(context.auth.uid);
    const request = admin.firestore().collection("requests").doc(data.id);
    const doc = await user.get();
    //Check if the user hasn't already upvoted the request
    if (doc.data().upvotedOn.includes(data.id)) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "you can only upvote something once!"
      );
    } else {
      //Update user array
      await user.update({
        upvotedOn: [...doc.data().upvotedOn, data.id],
      });
      //Update votes on the request
      return request.update({
        upvotes: admin.firestore.FieldValue.increment(1),
      });
    }
  }
});

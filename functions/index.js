const express = require("express");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const moment = require("moment")
const UserController = require("./controllers/UsersController");
const WorkshopController = require("./controllers/WorkshopController");

admin.initializeApp();

// USER -----------------------------------------------------------------------
const userApp = express();
const userRouter = express.Router();
const userController = new UserController(admin, functions);
userRouter.post("/createUser", userController.createUser);
userRouter.get("/getUsers", userController.getAllUsers);
userRouter.get("/getUser", userController.getUser);
userRouter.put("/updateUser", userController.updateUser);
userRouter.delete("/deleteUser", userController.deleteUser);

userApp.use("/", userRouter);
exports.users = functions.https.onRequest(userApp);

// WORKSHOP -------------------------------------------------------------------
const workshopApp = express();
const workshopRouter = express.Router();
const workshopController = new WorkshopController(admin, functions);
workshopRouter.get("/", workshopController.getShopCount);
workshopRouter.get("/getMembers", workshopController.getMembersInShop);
workshopRouter.post("/checkIn", workshopController.checkIn);
workshopRouter.post("/checkOut", workshopController.checkOut);

workshopApp.use("/", workshopRouter);
exports.shop = functions.https.onRequest(workshopApp);
exports.shopOnCheckIn = functions.firestore
  .document("/shop/{documentId}")
  .onCreate((snap, context) => {
    const data = snap.data();
    // functions.logger.log(
    //   "Member entered shop",
    //   context.params.documentId,
    //   data
    // );

    const user = data;
    const dateNow = new Date();
    user.lastEnteredShop = dateNow;

    // Call to discord bot?
    return admin
      .firestore()
      .collection("users")
      .doc(context.params.documentId)
      .update(user)
      .catch((err) => res.status(500).send(err));
  });

exports.shopOnCheckOut = functions.firestore
  .document("/shop/{documentId}")
  .onDelete(async (snap, context) => {
    const data = snap.data();
    // functions.logger.log(
    //   "Member entered shop",
    //   context.params.documentId,
    //   data
    // );
    
    const _MS_PER_DAY = 1000 * 60 * 60;

    let user = data;



    const lastEnteredShop = moment(user.lastEnteredShop);
    const lastExitedShop = moment();

    user.hours = Math.floor((lastExitedShop - lastEnteredShop) / _MS_PER_DAY) + user.hours;

    functions.logger.log(
      "Member exited shop",
      "date difference: ",
      Math.floor(lastExitedShop.diff(lastEnteredShop) / _MS_PER_DAY)
    );
    
    return admin
      .firestore()
      .collection("users")
      .doc(context.params.documentId)
      .update(user);

    // Call to discord bot?
    // Wed Aug 19 2020 21:22:17 GMT-0400 (Eastern Daylight Time)

  });
  

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });

// Take the text parameter passed to this HTTP endpoint and insert it into
// Cloud Firestore under the path /messages/:documentId/original
// exports.addMessage = functions.https.onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text;
//   // Push the new message into Cloud Firestore using the Firebase Admin SDK.
//   const writeResult = await admin
//     .firestore()
//     .collection("messages")
//     .add({ original: original });
//   // Send back a message that we've succesfully written the message
//   res.json({ result: `Message with ID: ${writeResult.id} added.` });
// });

// // // Listens for new messages added to /messages/:documentId/original and creates an
// // // uppercase version of the message to /messages/:documentId/uppercase
// exports.makeUppercase = functions.firestore
//   .document("/messages/{documentId}")
//   .onCreate((snap, context) => {
//     // Grab the current value of what was written to Cloud Firestore.
//     const original = snap.data().original;

//     // Access the parameter `{documentId}` with `context.params`
//     functions.logger.log("Uppercasing", context.params.documentId, original);

//     const uppercase = original.toUpperCase();

//     // You must return a Promise when performing asynchronous tasks inside a Functions such as
//     // writing to Cloud Firestore.
//     // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.
//     return snap.ref.set({ uppercase }, { merge: true });
//   });

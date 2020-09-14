const express = require("express");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const moment = require("moment-timezone");
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
userRouter.get("/getUserByName", userController.getUserByName);
userRouter.get("/getUserByDiscordId", userController.getUserByDiscordId);
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

// -- USE FOR DISCORD NOTIF. --
exports.shopOnCheckIn = functions.firestore
  .document("/shop/{documentId}")
  .onCreate((snap, context) => {
    const data = snap.data();
    // functions.logger.log(
    //   "Member entered shop",
    //   context.params.documentId,
    //   data
    // );

    const log = {
      status: "Entered Shop",
      user: data,
      time: new moment().tz('America/New_York')
    }

    // Call to discord bot?
    return admin
      .firestore()
      .collection("logs")
      .doc()
      .create(log)
      .catch((err) => res.status(500).send(err));
  });

exports.shopOnCheckOut = functions.firestore
  .document("/shop/{documentId}")
  .onDelete(async (snap, context) => {
    const data = snap.data();

    const lastExitedShop = new moment().tz('America/New_York');
    const lastEnteredShop = new moment(data.lastEnteredShop);

    let user = data;
    user.lastExitedShop = lastExitedShop.format();
    user.hours = lastExitedShop.diff(lastEnteredShop, "hours", true) + data.hours;

    await admin
      .firestore()
      .collection("users")
      .doc(context.params.documentId)
      .update(user)
      .catch((err) => res.status(500).send(err));

    const log = {
      status: "Exited Shop",
      user: user,
      time: new moment().tz('America/New_York')
    }

    return admin
      .firestore()
      .collection("logs")
      .doc()
      .create(log)
      .catch((err) => res.status(500).send(err));

    // Call to discord bot?
  });
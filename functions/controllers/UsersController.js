const moment = require("moment");

class UserController {
  constructor(admin, functions) {
    this.admin = admin;
    this.functions = functions;

    this.createUser = this.createUser.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUser = this.getUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  async createUser(req, res) {
    const id = req.query.id;
    const data = req.body;
    const dateNow = moment();

    const user = {};
    user.name = data.name;
    user.hours = 0;
    user.createdAt = dateNow;
    user.lastEnteredShop = dateNow;
    user.lastExitedShop = dateNow;

    await this.admin
      .firestore()
      .collection("users")
      .doc(id)
      .set(user)
      .then((writeResult) => res.status(201).json(writeResult))
      .catch((err) => res.status(500).send(err));
  }

  async getAllUsers(req, res) {
    const snapshot = await this.admin.firestore().collection("users").get();
    let users = [];
    snapshot.forEach((doc) => {
      let id = doc.id;
      let data = doc.data();
      users.push({ id: id, data: data });
    });
    res.status(200).json(users);
  }

  async getUser(req, res) {
    await this.admin
      .firestore()
      .collection("users")
      .doc(req.query.id)
      .get()
      .then((querySnapshot) => {
        querySnapshot.exists
          ? res
              .status(200)
              .json({ id: querySnapshot.id, data: querySnapshot.data() })
          : res.status(500).send(JSON.stringify("Document Not Found"));
      });
  }

  async updateUser(req, res) {
    const id = req.query.id;
    const body = req.body;
    await this.admin
      .firestore()
      .collection("users")
      .doc(id)
      .update(body)
      .then((writeResult) => res.status(201).json(writeResult))
      .catch((err) => res.status(500).send(err));
  }

  async deleteUser(req, res) {
    const id = req.query.id;
    await this.admin
      .firestore()
      .collection("users")
      .doc(id)
      .delete()
      .then((writeResult) => res.status(201).json(writeResult))
      .catch((err) => handleError(err, res));
  }
}

module.exports = UserController;

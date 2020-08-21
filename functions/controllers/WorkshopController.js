const moment = require("moment-timezone");

class WorkshopController {
  constructor(admin, functions) {
    this.admin = admin;
    this.functions = functions;

    this.getShopCount = this.getShopCount.bind(this);
    this.getMembersInShop = this.getMembersInShop.bind(this);
    this.checkIn = this.checkIn.bind(this);
    this.checkOut = this.checkOut.bind(this);
  }

  async getShopCount(req, res) {
    await this.admin
      .firestore()
      .collection("shop")
      .get()
      .then((querySnapshot) => res.status(200).json(querySnapshot._size))
      .catch((err) => res.status(500).json(err));
  }

  async getMembersInShop(req, res) {
    await this.admin
      .firestore()
      .collection("shop")
      .get()
      .then((querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });

        return res.status(200).json(users);
      })
      .catch((err) => res.status(500).send(err));
  }

  async checkIn(req, res) {
    const id = req.query.id;
    let user = {};
    user = await this.admin
      .firestore()
      .collection("users")
      .doc(req.query.id)
      .get()
      .then((querySnapshot) => {
        user = querySnapshot.data();
        user.lastEnteredShop = moment().tz('America/New_York').format();
        return user;
      });

    await this.admin
      .firestore()
      .collection("shop")
      .doc(id)
      .create(user)
      .then((writeResult) => res.status(201).json(writeResult))
      .catch((err) => res.status(500).send(err));
  }

  async checkOut(req, res) {
    const id = req.query.id;

    await this.admin
      .firestore()
      .collection("shop")
      .doc(id)
      .delete()
      .then((writeResult) => res.status(201).json(writeResult))
      .catch((err) => res.status(500).send(err));
  }
}

module.exports = WorkshopController;

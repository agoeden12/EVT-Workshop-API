class WorkshopController {
  constructor(admin, functions) {
    this.admin = admin;
    this.functions = functions;

    this.getShopCount = this.getShopCount.bind(this);
    this.checkIn = this.checkIn.bind(this);
    this.checkOut = this.checkOut.bind(this);
  }

  async getShopCount(req, res) {
    await this.admin
      .firestore()
      .collection("shop")
      .get()
      .then((querySnapshot) => res.status(201).json(querySnapshot._size))
      .catch((err) => res.status(500).json(err));
  }

  async checkIn(req, res) {
    const id = req.query.id;

    const dateNow = new Date();
    const user = {};
    user.lastEnteredShop = dateNow;

    await this.admin
      .firestore()
      .collection("users")
      .doc(id)
      .update(user)
      .catch((err) => res.status(500).send(err));

    await this.admin
      .firestore()
      .collection("shop")
      .doc(id)
      .create({ref: `users/${id}`})
      .then((writeResult) => {
        res.status(201).json(writeResult)
      })
      .catch((err) => res.status(500).send(err));
  }

  async checkOut(req, res) {}
}

module.exports = WorkshopController;
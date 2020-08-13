class WorkshopController {
  constructor(admin, functions) {
    this.admin = admin;
    this.functions = functions;

    // this.functions.firestore
    //   .document("/shop/{documentId}")
    //   .onCreate((snap, context) => {
    //     const original = snap.data();
    //     functions.logger.log(
    //       "Uppercasing",
    //       context.params.documentId,
    //       original
    //     );

    //     const uppercase = original.toUpperCase();

    //     // You must return a Promise when performing asynchronous tasks inside a Functions such as
    //     // writing to Cloud Firestore.
    //     // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.
    //     return snap.ref.set({ uppercase }, { merge: true });
    //   });

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
        const users = []
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        })

        res.status(200).json(users);
      })
      .catch((err) => res.status(500).send(err));
  }

  async checkIn(req, res) {
    const id = req.query.id;

    let user = {};
    await this.admin
      .firestore()
      .collection("users")
      .doc(req.query.id)
      .get()
      .then((querySnapshot) => {
        user = querySnapshot.data();
        const dateNow = new Date();
        user.lastEnteredShop = dateNow;
      });

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
      .create(user)
      .then((writeResult) => {
        res.status(201).json(writeResult);
      })
      .catch((err) => res.status(500).send(err));
  }

  async checkOut(req, res) {
    const id = req.query.id;

    const dateNow = new Date();
    const user = {};
    user.lastExitedShop = dateNow;

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
      .delete()
      .then((writeResult) => {
        res.status(201).json(writeResult);
      })
      .catch((err) => res.status(500).send(err));
  }
}

module.exports = WorkshopController;

const express = require("express");
const { getDb } = require("../db/db");
const {
  invalidAddress,
  invalidUpdate,
} = require("../validation/addressValidation");
const { ObjectId } = require("mongodb");

const router = express.Router();

// get all addresse
router.get("/", (_req, res) => {

  const db = getDb();
  let addresses = [];
  
  db.collection("addresses")
    .find({})
    .sort({ surname: 1 })
    .forEach((address) => addresses.push(address))
    .then(() => {
      res.status(200).json(addresses);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ Error: "Could not get addresses", "Error message": error });
    });
});


// get address by id
router.get("/:id", (req, res) => {
  const db = getDb();
  const id = req.params.id;

  if (!ObjectId.isValid(id))
    return res.status(400).json({ error: "Invalid ID format" });

  db.collection("addresses")
    .findOne({ _id: new ObjectId(id) })
    .then((address) => {
      if (!address) return res.status(404).json({ error: "address not found" });
      res.status(200).json(address);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ Error: "Could not get address by id", "Error message": error });
    });
});


//create new address
router.post("/", (req, res) => {
  const db = getDb();
  let address = req.body;

  const invalid = invalidAddress(address);
  if (invalid) return res.status(400).json(invalid);

  db.collection("addresses")
    .insertOne(address)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ Error: "Could not create addresses", "Error message": error });
    });
});


// update existing address
router.patch("/:id", (req, res) => {
  const db = getDb();
  let id = req.params.id;
  const updates = req.body;

  const invalid = invalidUpdate(updates);
  if (invalid) return res.status(400).json(invalid);

  if (ObjectId.isValid(id)) {
    let updateQuery = {};

    if (updates.email) updateQuery["email"] = updates.email;

    if (updates.user.name) updateQuery["user.name"] = updates.user.name;

    if (updates.user.fathername)
      updateQuery["user.fathername"] = updates.user.fathername;

    if (updates.user.surname)
      updateQuery["user.surname"] = updates.user.surname;

    db.collection("addresses")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateQuery })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(500).json({
          error: "Could not update the address",
          "Error message": error,
        });
      });
  } else {
    res.status(400).json({ error: "Not valid address id" });
  }
});


// delete address
router.delete("/:id", (req, res) => {
  const db = getDb();
  let id = req.params.id;
  if (ObjectId.isValid(id)) {
    db.collection("addresses")
      .deleteOne({ _id: new ObjectId(id) })
      .then((result) => {
        if (result.deletedCount === 0) {
          return res.status(404).json({ Error: "Address not found" });
        }
        return res.status(200).json({ message: "Address deleted" });
      })
      .catch((error) => {
        res
          .status(500)
          .json({ Error: "Could not delete address", "Error message": error });
      });
  } else {
    res.status(400).json({ error: "Invalid document id" });
  }
});

module.exports = router;

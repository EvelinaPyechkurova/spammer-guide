const express = require("express");
const router = express.Router();
const {getDb} = require("../db/db");
const invalidText = require("../validation/textValidation");

// get all texts
router.get("/", (req, res) => {
    const db = getDb();
    let texts = [];

    db.collection("texts")
    .find({})
    .sort({text: 1})
    .forEach(text => texts.push(text))
    .then(() => {
        res.status(200).json(texts);
    })
    .catch((error) => {
        res.status(500).json({"Error": "Could not get texts", "Error message": error});
    });
});

// create new text
router.post("/", (req, res) => {
    const db = getDb();
    const text = req.body;

    const invalid = invalidText(text);
    
    if(invalid)
        return res.status(400).json(invalid);

    db.collection("texts")
    .insertOne(text)
    .then((result) => {
        res.status(201).json({"message": "text was added successfully", "insertedId": result.insertedId});
    })
    .catch((error) => {
        res.status(500).json({"Error": "Could not add text", "Error message": error});
    });
});

module.exports = router;
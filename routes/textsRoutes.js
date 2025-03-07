const express = require("express");
const router = express.Router();
const {getDb} = require("../db/db");
const invalidText = require("../validation/textValidation");
const { ObjectId } = require("mongodb");

// get all text messages
router.get("/", (_req, res) => {
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


// get text message by id
router.get("/:id", (req, res) => {
    const db = getDb();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) 
        return res.status(400).json({ error: "Invalid ID format" });

    db.collection("texts")
    .findOne({_id : new ObjectId(id)})
    .then((text) => {
        if(!text)
            return res.status(404).json({error: "text not found"});
        res.status(200).json(text);
    })
    .catch((error) => {
        res.status(500).json({"Error": "Could not get text by id", "Error message": error});
    });;
});


// create new text message
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

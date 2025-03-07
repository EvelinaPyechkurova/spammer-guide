const express = require("express");
const sendEmailToList = require("../services/emailService");
const {notEmptyString, invalidAddress} = require("../validation/addressValidation");

const router = express.Router();

// send provided text message to provided addressess
router.post("/send-emails", async (req, res) => {
    const {addressList, text} = req.body;

    for(const address of addressList){
        const invalid = invalidAddress(address);
        if(invalid)
            return res.status(400).json(invalid);
    }

    if(!notEmptyString(text))
        return res.status(400).json({error: "Invalid or missing text message"});

    try{
        await sendEmailToList(addressList, text);
        res.status(200).json({message: "Email send successfully"});
    }catch(error){
        console.log("Error sending emails:", error);
        res.status(500).json({error: "Error sending emails", details: error.message});
    }
});

module.exports = router;
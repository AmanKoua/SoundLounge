const express = require("express");

const app = express();

app.get("/", (req, res) => {
    return res.status(200).json({ message: "SoundLounge backend express test!" });
})

app.listen(8010, () => {
    console.log("Listening on port 8010");
})
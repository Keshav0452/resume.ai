const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "toekn is required tobe added in blacklist."]
    }
},
    {
        timestamps: true
    })

const blacklistTokenModel = mongoose.model("blacklistToken", blacklistTokenSchema);

module.exports = blacklistTokenModel;
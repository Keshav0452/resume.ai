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

blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const blacklistTokenModel = mongoose.model("blacklistToken", blacklistTokenSchema);

module.exports = blacklistTokenModel;
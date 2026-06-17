const mongoose = require("mongoose");

async function connectDb(){
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

module.exports = connectDb;
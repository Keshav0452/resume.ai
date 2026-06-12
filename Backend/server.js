const app = require("./src/app");
const connectDB = require("./src/config/db");
require("dotenv").config();

PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT,()=>{
    console.log(`Server is ruuning at ${PORT}`);
})
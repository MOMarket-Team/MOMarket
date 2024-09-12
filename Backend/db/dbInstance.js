require('dotenv').config()
const mongoose = require ("mongoose")



const dbInstanceConnection = async() => {
try {
    await mongoose.connect(process.env.dburls)
    console.log("connection successful");
    
} catch (error) {
    console.log(error);
    console.log("connection failed");
    
    
}
}
module.exports = dbInstanceConnection
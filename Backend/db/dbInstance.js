require('dotenv').config()
const mongoose = require ("mongoose")



const dbInstanceConnection = async() => {
try {
    await mongoose.connect(process.env.dburls)
} catch (error) {
    console.log(error);
    
}
}
module.exports = dbInstanceConnection
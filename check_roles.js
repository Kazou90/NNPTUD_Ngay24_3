const mongoose = require('mongoose');
const Role = require('./schemas/roles');

mongoose.connect('mongodb://localhost:27017/NNPTUD-S3')
    .then(async () => {
        const roles = await Role.find();
        console.log("Current Roles in DB:");
        console.log(JSON.stringify(roles, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error("Error connecting to DB:", err);
        process.exit(1);
    });

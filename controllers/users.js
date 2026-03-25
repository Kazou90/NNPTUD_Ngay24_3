let userModel = require("../schemas/users");
let bcrypt = require('bcrypt');

module.exports = {
    CreateAnUser: async function (username, password, email, role,session,
        fullName, avatarUrl, status, loginCount
    ) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        })
        await newUser.save({session});
        return newUser;
    },
    FindUserByUsername: async function (username) {
        return await userModel.findOne({
            isDeleted: false,
            username: username
        })
    }, FindUserByEmail: async function (email) {
        return await userModel.findOne({
            isDeleted: false,
            email: email
        })
    },
    FindUserByToken: async function (token) {
        let result =  await userModel.findOne({
            isDeleted: false,
            forgotPasswordToken: token
        })
        if(result.forgotPasswordTokenExp>Date.now()){
            return result;
        }
        return false
    },
    CompareLogin: async function (user, password) {
        if (bcrypt.compareSync(password, user.password)) {
            user.loginCount = 0;
            await user.save()
            return user;
        }
        user.loginCount++;
        if (user.loginCount == 3) {
            user.lockTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
            user.loginCount = 0;
        }
        await user.save()
        return false;
    },
    GetUserById: async function (id) {
        try {
            let user = await userModel.findOne({
                _id: id,
                isDeleted: false
            }).populate('role')
            return user;
        } catch (error) {
            return false;
        }
    },
    ImportUsersFromFile: async function (filePath) {
        const ExcelJS = require('exceljs');
        const roleModel = require('../schemas/roles');
        const mailHandler = require('../utils/mailHandler');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1); // First sheet

        // Generate random password (16 chars)
        function generatePassword() {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
            let pass = "";
            for (let i = 0; i < 16; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return pass;
        }

        const userRole = await roleModel.findOne({ name: 'user' });
        if (!userRole) throw new Error("Role 'user' not found");


        const results = [];
        // Assuming file has headers: username, email
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const username = row.getCell(1).value;
            let emailValue = row.getCell(2).value;
            let email = "";

            if (emailValue) {
                if (typeof emailValue === 'string') email = emailValue;
                else if (emailValue.text) email = emailValue.text;
                else if (emailValue.result) email = emailValue.result;
            }


            if (username && email) {
                const password = generatePassword();
                try {
                    const newUser = await this.CreateAnUser(
                        username, password, email, userRole._id
                    );
                    
                    // Send email
                    await mailHandler.sendMail(
                        email, 
                        "Your account details", 
                        `<p>Welcome! Your username is: <b>${username}</b></p><p>Password: <b>${password}</b></p>`
                    );

                    results.push({ username, email, status: "success" });
                } catch (err) {
                    results.push({ username, email, status: "error", message: err.message });
                }
            }
        }
        return results;
    }
}

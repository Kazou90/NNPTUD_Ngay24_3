const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "b00aa45624602b",
        pass: "53c605247892e6",
    },
});



module.exports = {
    sendMail: async (to, subject, content) => {
        const info = await transporter.sendMail({
            from: 'Admin@project.com',
            to: to,
            subject: subject,
            html: content,
        });

        console.log("Message sent:", info.messageId);
        return info;
    }
}

const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Users');

worksheet.columns = [
    { header: 'Username', key: 'username', width: 20 },
    { header: 'Email', key: 'email', width: 30 }
];

for (let i = 0; i < 100; i++) {
    worksheet.addRow({
        username: `user${i}`,
        email: `user${i}@haha.com`
    });
}

workbook.xlsx.writeFile('user.xlsx')
    .then(() => console.log("user.xlsx created successfully"))
    .catch(err => console.error(err));

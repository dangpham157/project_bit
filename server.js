const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

const { readData, writeData } = require('./db');

app.post('/register', (req, res) => {
    const users = readData(); 
    const newUser = {
        id: Date.now().toString(),
        username: req.body.username, 
        password: req.body.password  
    };
    users.push(newUser);
    writeData(users);
    res.status(201).json(newUser);
});

app.post('/login', (req, res) => {
    const users = readData();
    const user = users.find(u => u.username === req.body.username && u.password === req.body.password);
    
    if (!user) {
        return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng!' });
    }
    res.json({ message: 'Đăng nhập thành công', user: user });
});

app.get('/users', (req, res) => {
    const users = readData();
    res.json(users);
});

app.put('/users/:id', (req, res) => {
   const users = readData();
   const index = users.findIndex(u => u.id === req.params.id);
  
   if (index === -1) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
   }
  
   users[index].username = req.body.username;
   users[index].password = req.body.password;
  
   writeData(users);
   res.json(users[index]);
 });

 app.delete('/users/:id', (req, res) => {
   const users = readData();
   const index = users.findIndex(u => u.id === req.params.id);
  
   if (index === -1) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
   }
  
   users.splice(index, 1);
   writeData(users);
  
   res.json({ message: 'Đã xóa người dùng' });
 });

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
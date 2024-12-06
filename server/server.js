// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中介軟體
app.use(cors());
app.use(bodyParser.json());

// 連接 MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('成功連接到 MongoDB'))
    .catch((error) => console.error('連接 MongoDB 出錯:', error));

// 使用者 Schema 和 Model
const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // 帳號需唯一
    username: { type: String, required: true }, // 使用者名稱，不需唯一
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], required: true },
});



const courseSchema = new mongoose.Schema({
    編號: String,
    學期: String,
    主開課教師姓名: String,
    科目代碼: String,
    系所代碼: String,
    核心四碼: String,
    科目組別: String,
    年級: String,
    上課班組: String,
    科目中文名稱: String,
    授課教師姓名: String,
    上課人數: String,
    男學生上課人數: String,
    女學生上課人數: String,
    學分數: String,
    上課週次: String,
    上課時數: String,
    課別代碼: String,
    課別名稱: String,
    上課地點: String,
    上課星期: String,
    上課節次: String,
    課表備註: String,
    課程中文摘要: String, // 新增課程中文摘要欄位
    課程英文摘要: String
}, { collection: 'courses' });

const User = mongoose.model('User', userSchema);

const Course = mongoose.model('Course', courseSchema);

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// 註冊 API
app.post('/api/register', async (req, res) => {
    const { id, username, password } = req.body;

    // 檢查必填欄位
    if (!id || !username || !password) {
        return res.status(400).json({ message: '帳號、姓名或密碼不可為空' });
    }

    // 檢查長度規範
    if (id.length < 6 || id.length > 20) {
        return res.status(400).json({ message: '帳號必須介於 6 至 20 個字之間' });
    }
    if (username.length < 2 || username.length > 20) {
        return res.status(400).json({ message: '姓名必須介於 2 至 20 個字之間' });
    }
    if (password.length < 6 || password.length > 20) {
        return res.status(400).json({ message: '密碼必須介於 6 至 20 個字之間' });
    }


    try {
        // 預設角色為 student
        const role = 'student';

        // 加密密碼
        const hashedPassword = await bcrypt.hash(password, 10);

        // 創建新用戶

        const newUser = new User({
            id: id.toLowerCase(),
            username,
            password: hashedPassword,
            role
        });

        // 保存至資料庫
        await newUser.save();
        res.status(201).json({ message: '註冊成功' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: '帳號已存在' });
        } else {
            console.error('註冊失敗:', error);
            res.status(500).json({ message: '伺服器錯誤，無法註冊' });
        }
    }

});



// (async () => {
//     try {
//         const hashedPassword = await bcrypt.hash('testpassword', 10);
//         const user = new User({
//             username: 'testuser',
//             password: hashedPassword,
//             role: 'student', // 測試設置角色
//         });
//         await user.save();
//         console.log('測試用戶插入成功');
//     } catch (error) {
//         console.error('測試用戶插入失敗:', error);
//     }
// })();
// 登入
app.post('/api/login', async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ message: '帳號和密碼不可為空' });
    }

    try {
        const user = await User.findOne({
            $or: [
                { id: { $regex: new RegExp(`^${id}$`, 'i') } }, // 忽略大小寫的 id
                // { username: id }                                // 或直接匹配 username
            ]
        });

        if (!user) {
            return res.status(400).json({ message: '用戶不存在' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '密碼錯誤' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: '登入成功', token, role: user.role });
    } catch (error) {
        console.error('登入失敗:', error);
        res.status(500).json({ message: '伺服器錯誤，無法登入' });
    }
});



app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await User.find(); // User 是您的 Mongoose 模型
        res.status(200).json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: '伺服器錯誤，無法獲取帳號列表' });
    }
});

app.post('/api/accounts', async (req, res) => {
    const { id, username, password, role } = req.body;

    if (!id || !username || !password || !role) {
        return res.status(400).json({ message: '所有欄位均為必填' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ id, username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: '帳號新增成功' });
    } catch (error) {
        console.error('Error creating account:', error);
        if (error.code === 11000) {
            res.status(400).json({ message: '帳號已存在' });
        } else {
            res.status(500).json({ message: '伺服器錯誤，無法新增帳號' });
        }
    }
});

app.put('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.body;

    if (!username || !role) {
        return res.status(400).json({ message: '姓名和角色為必填' });
    }

    try {
        const updatedAccount = await User.findOneAndUpdate(
            { id },
            { username, role },
            { new: true }
        );
        if (!updatedAccount) {
            return res.status(404).json({ message: '帳號不存在' });
        }
        res.status(200).json({ message: '帳號更新成功', account: updatedAccount });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: '伺服器錯誤，無法更新帳號' });
    }
});

app.delete('/api/accounts/:id', async (req, res) => {
    const { id } = req.params;
    console.log('傳遞的 ID:', id);

    try {
        const deletedAccount = await User.findOneAndDelete({ id: id.toLowerCase() });
        if (!deletedAccount) {
            return res.status(404).json({ message: '帳號不存在' });
        }
        res.status(200).json({ message: '帳號刪除成功' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: '伺服器錯誤，無法刪除帳號' });
    }
});


app.get('/api/courses', async (req, res) => {
    const {
        semester,
        keyword,
        educationLevels,
        department,
        classType,
        grade,
        period,
        courseCategory,
        teacherCode,
        teacherName,
        classCode,
        className,
        courseCode,
        courseName,
        roomName,
        courseSummary
    } = req.query;

    // 動態構建查詢條件
    let query = {};

    // 學期查詢條件
    if (semester) {
        query.學期 = semester;
    }

    // 關鍵字查詢（科目名稱、授課教師姓名）
    if (keyword) {
        query.$or = [
            { 科目中文名稱: { $regex: keyword, $options: 'i' } },
            { 授課教師姓名: { $regex: keyword, $options: 'i' } },
            { 課程中文摘要: { $regex: keyword, $options: 'i' } }, // 新增摘要查詢
            { 課程英文摘要: { $regex: keyword, $options: 'i' } }  // 新增摘要查詢
        ];
    }

    if (educationLevels) query.學制 = { $in: educationLevels.split(',') };
    if (department) query.系所代碼 = department;
    if (classType) query.課別名稱 = classType;
    if (grade) query.年級 = grade;
    if (period) query.上課節次 = period;
    if (courseCategory) query.課程內容分類 = courseCategory;
    if (teacherCode) query.授課教師代碼 = teacherCode;
    if (teacherName) query.授課教師姓名 = { $regex: teacherName, $options: 'i' };
    if (classCode) query.上課班組 = classCode;
    if (className) query.班級名稱 = { $regex: className, $options: 'i' };
    if (courseCode) query.科目代碼 = courseCode;
    if (courseName) query.科目中文名稱 = { $regex: courseName, $options: 'i' };
    if (roomName) query.上課地點 = { $regex: roomName, $options: 'i' };

    try {
        const courses = await Course.find(query);
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: '伺服器錯誤，無法取得課程資料' });
    }
});


// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器正在 http://localhost:${PORT} 上運行`);
});

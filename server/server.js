// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
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




const User = mongoose.model('User', userSchema);



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

    // 驗證輸入資料
    if (!id || !username || !password || !role) {
        return res.status(400).json({ message: '所有欄位皆為必填' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: '密碼至少需6個字元' });
    }
  
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
         // 新增帳號
         const newAccount = new User({
            id: id.toLowerCase(),
            username,
            password: hashedPassword,
            role,
        });

        await newAccount.save();
        // const newUser = new User({ id, username, password: hashedPassword, role });
        // await newUser.save();
        res.status(201).json({ message: '帳號新增成功' });
    } catch (error) {
        // console.error('Error creating account:', error);
        if (error.code === 11000) {
            res.status(400).json({ message: '帳號已存在' });
        } else {
            console.error('新增帳號失敗:', error);
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






const courseSchema = new mongoose.Schema(
    {
        編號: String,
        學期: String,
        主開課教師姓名: String,
        課程全碼: String, // 更新為新的欄位名稱
        系所代碼: String,
        系所名稱: String, // 新增
        學制: String,     // 新增
        科目代碼: String,
        科目組別: String,
        年級: String,
        上課班組: String,
        科目中文名稱: String,
        科目英文名稱: String, // 新增
        授課教師姓名: String,
        上課人數: String,
        男學生上課人數: String,
        女學生上課人數: String,
        學分數: String,
        上課週次: String,
        上課時數: String, // 修改名稱
        課別代碼: String,
        課別名稱: String,
        上課地點: String,
        上課星期: String,
        上課節次: String,
        課表備註: String,
        課程中文摘要: String, // 新增課程中文摘要欄位
        課程英文摘要: String, // 新增課程英文摘要欄位
        授課教師代碼: String, // 新增欄位
    },
    { collection: 'courses' }
);

module.exports = mongoose.model('Course', courseSchema);

const Course = mongoose.model('Course', courseSchema);

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/');  // 設定上傳文件的目錄
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname);  // 設定上傳後的文件名
//     }
//   });
  
//   const upload = multer({ storage: storage });
  
//   // 處理上傳 CSV 的路由
//   app.post('/api/upload-csv', upload.single('file'), (req, res) => {
//     const results = [];
//     const filePath = path.join(__dirname, req.file.path);
  
//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on('data', (row) => {
//         // 處理 CSV 每行資料並存入資料庫
//         results.push(row);
//       })
//       .on('end', () => {
//         console.log('CSV 檔案解析完成', results);
//         res.json({ message: '檔案上傳並處理成功' });
//       });
//   });
  
  
app.get('/api/courses', async (req, res) => {
    try {
        const {
            semester,
            keyword,
            educationLevels,
            department,
            classType,
            grade,
            teacherName,
            courseCode,
            courseName,
            roomName,
            period
        } = req.query;

        // 查詢條件
        const query = {};

        // 動態增加條件（僅當有對應的查詢參數時才加上）
        if (semester) query.學期 = semester;
        if (keyword) {
            query.$or = [
                { 科目中文名稱: { $regex: keyword, $options: 'i' } },
                { 授課教師姓名: { $regex: keyword, $options: 'i' } },
            ];
        }
        if (educationLevels) query.學制 = { $in: educationLevels.split(',') };
        if (department) query.系所名稱 = { $regex: department, $options: 'i' }; // 支援模糊查詢
        if (classType) query.課別名稱 = classType;
        if (grade) query.年級 = grade;
        if (teacherName) query.授課教師姓名 = { $regex: teacherName, $options: 'i' };
        if (courseCode) query.科目代碼 = courseCode;
        if (courseName) query.科目中文名稱 = { $regex: courseName, $options: 'i' };
        if (roomName) query.上課地點 = { $regex: roomName, $options: 'i' };
        // if (req.query.period) {
        //     const periodConditions = req.query.period.split(';').map((item) => {
        //         const [day, periods] = item.split('-');
        //         return {
        //             上課星期: day,
        //             上課節次: { $in: periods.split(',') },
        //         };
        //     });
        //     query.$and = periodConditions;
        // }

        // 進行查詢
        console.log('Generated Query:', query); // 偵錯用
        const courses = await Course.find(query);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

app.post('/api/courses', async (req, res) => {
    try {
        const {
            科目代碼,
            科目中文名稱,
            學分數,
            系所名稱,
            主開課教師姓名,
            學期,
            學制,
            年級,
            課別名稱,
            課程中文摘要,
            課程英文摘要,
            上課地點,
            授課教師姓名,
            課表備註
        } = req.body;

        // 驗證必填欄位
        if (!科目代碼 || !科目中文名稱 || !學分數 || !系所名稱 || !主開課教師姓名 || !學期 || !學制 || !年級 || !課別名稱 || !課程中文摘要 || !課程英文摘要 || !上課地點 || !授課教師姓名) {
            return res.status(400).json({ error: '缺少必要欄位！' });
        }

        // 建立新課程
        const newCourse = new Course({
            科目代碼,
            科目中文名稱,
            學分數,
            系所名稱,
            主開課教師姓名,
            學期,
            學制,
            年級,
            課別名稱,
            課程中文摘要,
            課程英文摘要,
            上課地點,
            授課教師姓名,
            課表備註
        });

        // 儲存到資料庫
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        console.error('新增課程錯誤：', error);
        res.status(500).json({ error: `新增課程失敗！原因：${error.message}` });
    }
});
app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const deletedCourse = await Course.findByIdAndDelete(id);
      if (!deletedCourse) {
        return res.status(404).json({ message: '課程不存在，無法刪除' });
      }
      res.status(200).json({ message: '課程刪除成功', deletedCourse });
    } catch (error) {
      console.error('刪除課程時出現錯誤:', error);
      res.status(500).json({ message: '刪除課程失敗，請稍後再試' });
    }
  });
  
  app.put('/api/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    const updatedData = req.body;

    try {
        // 查找並更新課程
        const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedData, {
            new: true, // 返回更新後的數據
            runValidators: true, // 確保更新時執行模型驗證
        });

        if (!updatedCourse) {
            return res.status(404).json({ message: '找不到對應的課程' });
        }

        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error('更新課程失敗:', error);
        res.status(500).json({ message: '無法更新課程，請稍後重試。', error: error.message });
    }
});



const favoriteSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    addedAt: { type: Date, default: Date.now }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);


app.post('/api/favorites', async (req, res) => {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
        return res.status(400).json({ message: '用戶ID和課程ID為必填' });
    }

    try {
        const existingFavorite = await Favorite.findOne({ userId, courseId });
        if (existingFavorite) {
            return res.status(400).json({ message: '該課程已收藏' });
        }

        const favorite = new Favorite({ userId, courseId });
        await favorite.save();

        res.status(200).json({ message: '課程已成功收藏' });
    } catch (error) {
        console.error('收藏課程失敗:', error.message);
        res.status(500).json({ message: '伺服器錯誤，無法收藏課程' });
    }
});



app.get('/api/favorites/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // 透過 `populate` 帶出收藏課程的詳細資料
        const favorites = await Favorite.find({ userId }).populate('courseId');

        // 提取課程詳細資訊
        const courses = favorites.map(fav => fav.courseId);

        res.status(200).json(courses);
    } catch (error) {
        console.error('獲取收藏課程失敗:', error);
        res.status(500).json({ message: '無法獲取收藏課程' });
    }
});

app.delete('/api/favorites/:userId/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;

    try {
        await Favorite.findOneAndDelete({ userId, courseId });
        res.status(200).json({ message: '成功取消收藏' });
    } catch (error) {
        console.error('取消收藏失敗:', error);
        res.status(500).json({ message: '無法取消收藏' });
    }
});


app.get('/api/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: '用戶不存在' });

        res.status(200).json({
            id: user.id,
            username: user.username,
            role: user.role
        });
    } catch (error) {
        console.error('獲取用戶資訊失敗:', error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});

app.put('/api/user/change-password/:userId', async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: '用戶不存在' });

        // 驗證舊密碼
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: '舊密碼錯誤' });

        // 更新密碼
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: '密碼修改成功' });
    } catch (error) {
        console.error('修改密碼失敗:', error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});


const scheduleSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    schedule: [
        {
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // 參考 Course 集合
            day: { type: String, required: true },
            timeSlots: { type: [String], required: true }
        }
    ]
});



const Schedule = mongoose.model('Schedule', scheduleSchema);
// 1. 儲存或更新課表

app.post('/api/schedule', async (req, res) => {
    const { userId, schedule } = req.body;

    try {
        console.log('接收到的使用者 ID:', userId);
        console.log('接收到的課表資料:', JSON.stringify(schedule, null, 2));

        // 驗證每個 courseId 是否為有效的 ObjectId
        for (const entry of schedule) {
            if (!mongoose.Types.ObjectId.isValid(entry.courseId)) {
                return res.status(400).json({ message: `無效的課程 ID: ${entry.courseId}` });
            }
        }

        const updatedSchedule = await Schedule.findOneAndUpdate(
            { userId },
            { schedule },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: '課表已儲存', data: updatedSchedule });
    } catch (error) {
        console.error('課表儲存失敗:', error);
        res.status(500).json({ message: '儲存課表時發生錯誤' });
    }
});


// 2. 獲取使用者的課表
app.get('/api/schedule/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // 查詢指定 userId 的課表
        const userSchedule = await Schedule.findOne({ userId }).populate('schedule.courseId');

        if (!userSchedule || !userSchedule.schedule) {
            return res.status(200).json([]); // 如果無資料，返回空陣列
        }

        // 將返回資料轉換成前端需要的格式
        const detailedSchedule = userSchedule.schedule.map((entry) => ({
            courseId: entry.courseId?._id,       // 課程 ID
            courseName: entry.courseId?.科目中文名稱 || "無名稱", // 課程名稱
            teacher: entry.courseId?.授課教師姓名 || "無教師",   // 授課教師
            credits: entry.courseId?.學分數 || 0,       // 學分數
            day: entry.day,                     // 星期幾
            timeSlots: entry.timeSlots          // 節次
        }));

        res.status(200).json(detailedSchedule); // 返回詳細課表
    } catch (error) {
        console.error('獲取課表失敗:', error);
        res.status(500).json({ message: '無法獲取課表資料' });
    }
});





// 課程查詢：根據星期和節次
app.get('/api/courses/:day/:timeSlot', async (req, res) => {
    const { day, timeSlot } = req.params;
    try {
        const courses = await Course.find({
            上課星期: day, // 精確匹配星期
            上課節次: { $regex: `(^|,)${timeSlot}(,|$)` } // 模糊匹配節次
        });

        if (!courses || courses.length === 0) {
            return res.status(200).json([]); // 如果無課程資料，返回空陣列
        }

        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: '查詢課程時發生錯誤' });
    }
});

app.get('/api/course/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: '課程不存在' });
        }
        res.status(200).json({ courseName: course.科目中文名稱 });
    } catch (error) {
        console.error('查詢課程名稱失敗:', error);
        res.status(500).json({ message: '無法查詢課程名稱' });
    }
});

// 收藏課程查詢：根據使用者、星期與節次
app.get('/api/favorites/:userId/:day/:timeSlot', async (req, res) => {
    const { userId, day, timeSlot } = req.params;

    try {
        const favoriteCourses = await Favorite.find({ userId }).populate('courseId');

        if (!favoriteCourses || favoriteCourses.length === 0) {
            return res.status(200).json([]); // 返回空陣列
        }

        // 過濾掉 courseId 為 null 的記錄
        const validFavorites = favoriteCourses.filter((favorite) => favorite.courseId);

        const filteredCourses = validFavorites.filter((favorite) => {
            const course = favorite.courseId;
            return (
                course.上課星期 === day &&
                course.上課節次.split(',').includes(timeSlot)
            );
        });

        res.status(200).json(filteredCourses.map((f) => f.courseId));
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: '查詢收藏課程時發生錯誤' });
    }
});

const teacherSchema = new mongoose.Schema({
    姓名: String, 
    職位: String, 
    電話: String, 
    信箱: String, 
    專長: [String]
});

const Teacher = mongoose.model('Teacher', teacherSchema);

app.get('/api/teacher/:name', async (req, res) => {
    const { name } = req.params;

    try {
        // 查詢資料庫中是否有該教師資料
        const teacher = await Teacher.findOne({ 姓名: name }); // 使用正確的字段名稱

        if (teacher) {
            // 如果找到教師資料，返回該資料
            res.status(200).json({
                success: true,
                data: {
                    name: teacher.姓名,
                    position: teacher.職位,
                    phone: teacher.電話,
                    email: teacher.信箱,
                    expertise: teacher.專長,
                },
            });
        } else {
            // 如果資料庫中無此教師，返回預設資訊
            res.status(200).json({
                success: true,
                data: {
                    name,
                    position: '北護教職',
                    phone: '02-2822-7128',
                    email: `${name}@ntunhs.edu.tw`,
                    expertise: ['未提供'],
                },
            });
        }
    } catch (error) {
        console.error('查詢教師資訊時發生錯誤：', error);
        res.status(500).json({
            success: false,
            message: '伺服器錯誤，請稍後再試。',
        });
    }
});
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-csv', upload.array('files', 5), async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '請上傳檔案' });
    }
  
    try {
      const fileDetails = [];
      const courses = [];
  
      // 處理每個檔案
      for (const file of req.files) {
        const filePath = path.join(__dirname, file.path);
        fileDetails.push({ fileName: file.originalname, fileSize: file.size });
  
        await new Promise((resolve, reject) => {
          const courseData = [];
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
              courseData.push({
                學期: row['學期'],
                主開課教師姓名: row['主開課教師姓名'],
                課程全碼: row['課程全碼'],
                系所代碼: row['系所代碼'],
                系所名稱: row['系所名稱'],
                學制: row['學制'],
                科目代碼: row['科目代碼'],
                科目組別: row['科目組別'],
                年級: row['年級'],
                上課班組: row['上課班組'],
                科目中文名稱: row['科目中文名稱'],
                科目英文名稱: row['科目英文名稱'],
                授課教師姓名: row['授課教師姓名'],
                學分數: row['學分數'],
                上課週次: row['上課週次'],
                課別代碼: row['課別代碼'],
                課別名稱: row['課別名稱'],
                上課地點: row['上課地點'],
                上課星期: row['上課星期'],
                上課節次: row['上課節次'],
                課表備註: row['課表備註'],
                課程中文摘要: row['課程中文摘要'],
                課程英文摘要: row['課程英文摘要'],
              });
            })
            .on('end', () => {
              courses.push(...courseData);
              fs.unlinkSync(filePath); // 刪除上傳的檔案
              resolve();
            })
            .on('error', (error) => {
              console.error('讀取檔案錯誤:', error);
              reject(error);
            });
        });
      }
  
      // 插入所有檔案的課程資料到 MongoDB
      await Course.insertMany(courses);
      res.status(200).json({
        message: '檔案匯入成功',
        fileDetails,
        totalCourses: courses.length,
      });
    } catch (error) {
      console.error('處理檔案失敗:', error);
      res.status(500).json({ message: '處理檔案失敗，請檢查資料格式' });
    }
  });
  
app.listen(PORT, () => {
    console.log(`伺服器正在 http://localhost:${PORT} 上運行`);
});



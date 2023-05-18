const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const conn = require('../16_socket/model/User');

const multer = require('multer');
const path = require('path');

const session = require('express-session');
const dotenv = require('dotenv');
const PORT = 8001;

dotenv.config();
console.log(process.env.SECRET_KEY);

const uploadDetail = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            // destination: 경로 설정
            // done: callback 함수
            done(null, 'uploads/');
        },
        filename(req, file, done) {
            // 가정) apple.png 파일을 업로드
            const ext = path.extname(file.originalname); // file.originalname에서 "확장자" 추출 => png
            // path.basename(file.originalname, ext) => apple (확장자 제거한 파일이름만!!)
            // Date.now() => 현재 시간 (1680309346279)
            // => 1970년 1월 1일 0시 0분 0초를 기준으로 현재까지 경과된 밀리초
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
            // [파일명 + 현재시간.확장자] 형식으로 파일 업로드
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB로 파일 크기 제한
    // 5 * 2^10 = 5KB
    // 5 * 2^10 * 2^10 = 5MB
});

app.set('view engine', 'ejs');
app.use('/views', express.static(__dirname + '/views'));
app.use('/static', express.static(__dirname + '/static'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.urlencoded({ extends: true })) // post요청으로 들어오는 모든 형식의 데이터를 파싱
app.use(express.json()); // json 형태로 데이터를 주고 받음
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}))

// 모든 유저의 데이터
let userInfo = {
};

app.get('/', function (req, res) {
    const sql = `SELECT * FROM socket_user`;
    conn.query(sql, (err, rows) => {
        if (err) throw err;
        userInfo = rows;
    })
    res.render('chat', {
        userInfo: userInfo,
        userid: req.session.userid,
    });
});

app.get('/signup', function (req, res) {
    res.render('signup');
})

app.post('/', (req, res) => {
    const sql = `SELECT * FROM socket_user`;
    conn.query(sql, (err, rows) => {
        if (err) throw err;
        res.send(rows);
    })
})

app.post('/signup/registerUser', (req, res) => {
    const sql = `INSERT INTO socket_user (userid,userpw,nickname,profileImg) VALUES ('${req.body.signId}','${req.body.signPw}','${req.body.signNickname}','${req.body.signProfileImg}');`;

    req.session.destroy((err) => {
        if (err) throw err;
    })

    conn.query(sql, (err, rows) => {
        if (err) throw err;
        res.send('회원가입 완료 !')
    })
})

app.post('/signup/dynamicFile', uploadDetail.single('dynamic-userfile'), (req, res) => {
    console.log(req.file); // 요청의 파일 정보 확인
    res.send(req.file);
})

app.post('/login', (req, res) => {
    const sql = `SELECT * FROM socket_user WHERE userid = '${req.body.userId}' AND userpw = '${req.body.userPw}';`;
    conn.query(sql, (err, rows) => {
        if (err) {
            throw err;
        }
        else if (rows.length > 0) {
            req.session.userid = req.body.userId;
            req.session.userpw = req.body.userPw;
            res.send(true)
        } else {
            res.send(false)
        }
    })
})

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
    })

    res.end();
})

app.post('/modifyProfile', (req, res) => {
    const sql = `UPDATE socket_user SET userid = '${req.body.userid}', userpw='${req.body.userpw}', nickname='${req.body.nickname}' where userid='${req.body.defaultId}';`;
    conn.query(sql, (err, rows) => {
        if (err) throw err;
        res.send(true);
    })
})


let nickObj = userInfo;
// io.on(event_name, callback)
// : socket과 관련된 통신 작업 처리
const updateNickList = () => {
    io.emit('updateNicks', nickObj);
}


io.on('connection', (socket) => {
    // "connection" event
    // - 클라이언트가 접속했을 때 발생하는 이벤트
    // - 콜백으로 socket 객체를 제공

    // 최초 입장시 (연걸)
    // socket.id: 소켓 고유아이디 -> socket은 웹 페이지별로 id생성
    // -> 크롬에서 탭2개 띄우면 socket.id는 각각 생김 (2개)
    socket.emit('userCount', io.engine.clientsCount)

    console.log('⭕ Server Socket Connected >> ', socket.id);

    // 채팅창 입장 안내

    socket.on('setNick', (nickname) => {
        if (Object.values(nickObj).indexOf(nickname) > -1) {
            socket.emit("error", '닉네임이 존재합니다.')
        } else {
            nickObj[socket.id] = nickname;
            io.emit('userComein', `${nickname}님이 입장하셨습니다.`);
            socket.emit('entrySuccess', nickname);
            updateNickList();
            console.log(nickObj);
        }
    })

    socket.on('sendMsg', (msg) => {
        const sendObj = {
            who: nickObj[socket.id],
            msg: msg[0],
            user: nickObj[msg[1]],
        }
        console.log(msg)
        if (msg[1] == 'all') {
            io.emit('getMsg', { who: nickObj[socket.id], msg: msg[0] })
        } else {
            io.to(socket.id).emit('secretMsg', sendObj)
            io.to(msg[1]).emit('secretMsg', sendObj)
        }
    })

    socket.on('disconnect', () => {
        console.log(socket.id + " is out !")
        io.emit('userOut', nickObj[socket.id])
        delete nickObj[`${socket.id}`];
        updateNickList();
    })
});

// 주의) socket 을 사용할 때는 http.listen으로 PORT 열어야 함!!!
http.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
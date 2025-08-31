import express from 'express';
import cors from 'cors';
import mysql from "mysql2";

const app = express(); //웹 서버의 본체 생성 - express의 모든 기능 사용 가능
app.use(cors()); 
//cors(미들웨어) 설정 : 다른 도메인에서 오는 요청 허용
//프론트엔드와 백엔드 서버 주소가 다를 때 cors 설정 필요
app.use(express.json()); //json 형태의 요청 처리 가능

//DB 연결
const db= mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "james",
    database: "board_db"
});

db.connect(err => {
    if(err) console.error("DB connection error:", err);
    else console.log("DB connected");
});

//글 작성 CRUD - CREATE
//HTTP POST 요청 처리 => 새로운 데이터를 서버에 생성(CREATE) EX) 게시글, 댓글, 회원가입
app.post("/api/posts", (req, res) => {
    const { title,content, author } = req.body;
    db.query(
        "INSERT INTO posts (title, content, author) VALUES(?,?,?)",
        [title, content, author],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({id: result.insertId, title,content, author});
        }
    );
});

//글 목록 조회 CRUD - READ, GET 요청
app.get("/api/posts", (req,res) => {
    db.query("SELECT * FROM posts ORDER BY createdAt DESC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

//글 상세 조회 CRUD - READ, GET 요청
app.get("/api/posts/:id", (req,res) => {
    const {id} = req.params;
    db.query("SELECT * FROM posts WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({message: "글이 존재하지 않습니다."});
        res.json(results[0]);
    });
});


//글 수정 CRUD - UPDATE, PUT 요청
app.put("/api/posts/:id", (req,res) => {
    const {id} = req.params;
    const {title, content, author} = req.body;
    db.query(
        "UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?",
        [title, content, author, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({message: "글이 수정되었습니다."})
        }
    );
});

//글 삭제 CRUD - DELETE, DELETE 요청
app.delete("/api/posts/:id", (req,res) => {
    const {id} = req.params;
    db.query("DELETE FROM posts WHERE id = ?", [id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({message: "글이 삭제되었습니다."});
        });
});


//서버 실행
app.listen(4000, () => console.log("Server is runnig on http://localhost:4000"));

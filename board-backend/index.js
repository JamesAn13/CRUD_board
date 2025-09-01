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
// app.get("/api/posts", (req,res) => {
//     db.query("SELECT * FROM posts ORDER BY createdAt DESC", (err, results) => {
//         if (err) return res.status(500).json(err);
//         res.json(results);
//     });
// });

//페이징 처리 추가 - ?page=1&limit=10
//page: 현재 페이지, limit: 페이지당 글 개수 ex) page=2, limit=10 -> 11~20번째 글 조회
//offset = (page - 1) * limit => LIMIT : 가져올 글 개수, OFFSET : 건너뛸 글 개수
app.get("/api/posts", (req,res) => {
    const page = parseInt(req.query.page) || 1; //현재 페이지, 기본값 1
    const limit = parseInt(req.query.limit) || 10; //페이지당 글 개수, 기본값 10
    const offset = (page - 1) * limit; //건너뛸 글 개수

    const postsQuery = "SELECT * FROM posts ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    const totalQuery = "SELECT COUNT(*) AS total FROM posts";

    db.query(postsQuery, [limit, offset], (err,posts) => {
        if (err) return res.status(500).json(err);

        db.query(totalQuery, (err, totalResult) => {
            if (err) return res.status(500).json(err);

            const total = totalResult[0].total;

            res.json({
                posts: posts,
                total: total,
                page: page,
                limit: limit
            });
        });
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

//여기부터 댓글기능
//댓글 가져오기 CRUD - READ, GET 요청
app.get("/api/posts/:postId/comments" ,(req,res) => {
    const { postId } = req.params;
    db.query(
        "SELECT * FROM comments WHERE  postId = ? ORDER BY createdAt DESC",
        [postId],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

//댓글 작성 CRUD - CREATE, POST 요청
app.post("/api/posts/:postId/comments" ,(req,res) => {
    const { postId } = req.params;
    const { author, content } = req.body;

    //유효성 검사, 작성자와 내용이 비어있으면 400 에러 반환
    if (!author || !content) {
        return res.status(400).json({ message: "작성자와 내용을 입력해주세요."});
    }

    db.query(
        "INSERT INTO comments (postId, author, content) VALUES ( ?, ?, ?)",
        [postId, author, content],
        (err, results) => {
            if (err) return res.status(500).json(err);
            //201 Created 상태 코드와 함께 생성된 댓글 정보 반환
            //res.status(201).json({ id: results.insertId, postId, author, content }); //이것도 가능
            res.status(201).json({
                id: results.insertId,
                postId: postId,
                author: author,
                content: content
            });
        }
    );
});

//댓글 삭제 CRUD - DELETE, DELETE 요청
app.delete("/api/posts/:postId/comments/:commentId", (req,res) => {
    const { commentId } = req.params;
    db.query(
        "DELETE FROM comments WHERE id = ?",
        [commentId],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "댓글이 삭제되었습니다."});
        }
    );
});


//서버 실행
app.listen(4000, () => console.log("Server is running on http://localhost:4000"));

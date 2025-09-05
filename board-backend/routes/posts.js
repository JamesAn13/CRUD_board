import express from 'express';
import db from '../db.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();


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
//글 목록 조회 CRUD - READ, GET 요청, 페이징 & 검색 기능 추가
router.get("/", (req,res) => {
    const page = parseInt(req.query.page) || 1; //요청된 페이지, 기본값 1
    const limit = parseInt(req.query.limit) || 10; //페이지당 글 개수, 기본값 10
    const offset = (page - 1) * limit; //건너뛸 글 개수
    const searchTerm = req.query.search || ""; //요청 쿼리에서 검색어 가져오기, 기본값 빈 문자열

    // 검색 기능 추가전 단순히 페이지 가져오기
    // const postsQuery = "SELECT * FROM posts ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    // const totalQuery = "SELECT COUNT(*) AS total FROM posts";
    let postsQuery = "SELECT * FROM posts"; //게시글 목록 조회 쿼리, let으로 선언해 나중에 변경 가능
    let totalQuery = "SELECT COUNT(*) AS total FROM posts";//전체 글 개수 조회 쿼리, 검색 시 페이지네이션 위해 필요
    const queryParams = [];
    const totalQueryParams = [];
    //검색어가 있는 경우, WHERE 절 추가
    if (searchTerm) {
        //검색시 제목과 내용에서 검색(WHERE문)
        const searchQuery = ` WHERE title LIKE ? OR content LIKE ?`;
        postsQuery += searchQuery; //게시글 목록 조회 쿼리에 검색 조건 추가
        totalQuery += searchQuery; //전체 글 개수 조회 쿼리에 검색 조건 추가
        const searchTermWithWildcards = `%${searchTerm}%`;// %searchTerm% 형태로 검색, 단어가 포한된 모든 데이터 찾음
        queryParams.push(searchTermWithWildcards, searchTermWithWildcards);
        totalQueryParams.push(searchTermWithWildcards, searchTermWithWildcards);
    }
    

//쿼리 마지막에 정렬, 페이징 처리 추가
postsQuery += " ORDER BY createdAt DESC LIMIT ? OFFSET ?"; //정렬, 페이징 처리 쿼리 추가
    queryParams.push(limit, offset); //쿼리 파라미터에 limit, offset 추가

    db.query(postsQuery, queryParams, (err,posts) => {
        if (err) return res.status(500).json(err);

        db.query(totalQuery, totalQueryParams, (err, totalResult) => {
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

//글 작성 CRUD - CREATE
//HTTP POST 요청 처리 => 새로운 데이터를 서버에 생성(CREATE) EX) 게시글, 댓글, 회원가입
//authenticateToken 미들웨어 추가, 인증된 사용자만 api사용 가능 -> 두번째 인자 추가
router.post("/", authenticateToken, (req, res) => {
    const { title,content } = req.body; //기존에 author(작성자) 없앰
    const author = req.user.username; //author 정보는 미들웨어를 통해 얻은 req.user에서 username (작성자) 가져옴 -> 즉, 사용자 id

    db.query(
        "INSERT INTO posts (title, content, author) VALUES(?,?,?)", //author -> user_id로 바꿈 (로그인 기능추가하면서 변경)
        [title, content, author],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.status(201).json({
                id: result.insertId,
                title,
                content,
                author: author //작성자(author) 대신 토큰에 있는 username 사용
            });
        }
    );
});

//글 상세 조회 CRUD - READ, GET 요청
router.get("/:id", (req,res) => {
    const {id} = req.params;
    db.query("SELECT * FROM posts WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({message: "글이 존재하지 않습니다."});
        res.json(results[0]);
    });
});


//글 수정 CRUD - UPDATE, PUT 요청
//두번째 인자에 미들웨어를 추가해서, 로그인한 사용자만 수정 요청 가능
router.put("/:id", authenticateToken, (req,res) => {
    const {id} = req.params; //수정할 게시글 ID
    const {title, content} = req.body; //author 이제 안 받음
    const loggedInUsername = req.user.username; //로그인한 사용자 username

    //게시금의 현재 작성자 확인
    db.query("SELECT author FROM posts WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: "글이 존재하지 않습니다."});

        const postAuthor = results[0].author;

        //2.로그인한 사용자 & 게시글 작성자 일치 확인
        if (postAuthor != loggedInUsername) {
            return res.status(403).json({ message: "이 글을 수정할 권한이 없습니다."});
        }
        db.query(
            "UPDATE posts SET title = ?, content = ? WHERE id = ?",
            [title, content, id], // <- id는 게시글의 고유 ID
            (err, result) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "글이 수정되었습니다."})

            }
        );
    });
});

//글 삭제 CRUD - DELETE, DELETE 요청
// db.query("DELETE FROM posts WHERE id = ?", [id],
//         (err, result) => {
//             if (err) return res.status(500).json(err);
//             res.json({message: "글이 삭제되었습니다."});
//         });
//로그인 회원가입 기능 구현후 삭제 권한 부여
router.delete("/:id", authenticateToken, (req,res) => {
    const {id} = req.params;
    const loggedInUsername = req.user.username; //로그인한 사용자의 username

    db.query("SELECT author FROM posts WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({message: "글이 존재하지 않습니다."});

        const postAuthor = results[0].author;

        //로그인한 사용자& 게시글 작성자 일치 확인
        if (postAuthor != loggedInUsername) {
            return res.status(403).json({ message: "이 글을 삭제할 권한이 없습니다."});
        }
        // 권한(O)-> 삭제
        db.query("DELETE FROM posts WHERE id = ?", [id], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({message: "글이 삭제되었습니다."});
        });
    });    
});

export default router;

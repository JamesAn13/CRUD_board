import express from 'express';
import db from '../db.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router( {mergeParams: true} ); //부모 라우트의 매개변수에 접근하기 위해 mergeParams 옵션 사용


//여기부터 댓글기능
//댓글 가져오기 CRUD - READ, GET 요청
router.get("/" ,(req,res) => {
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

//댓글 작성 CRUD - CREATE, POST 요청, /api/posts/:postId/comments
router.post("/" ,(req,res) => {
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
router.delete("/:commentId", authenticateToken, (req,res) => {
    const { commentId } = req.params; //삭제할 댓글의 ID
    const loggedInUsername = req.user.username; //user -> username

    db.query("SELECT author FROM comments WHERE id = ?", [commentId], (err, results) => {
        if(err) return res.status(500).json(err);
        if(results.length === 0) return res.status(404).json({message: "댓글이 존재하지 않습니다."});

        const commentAuthor = results[0].author;

        if(commentAuthor !== loggedInUsername) {
            return res.status(403).json({ message: "이 댓글을 삭제할 권한이 없습니다."})
        }

        db.query(
            "DELETE FROM comments WHERE id = ?",
            [commentId],
            (err, result) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "댓글이 삭제되었습니다."});
            }
        );
    });    
});
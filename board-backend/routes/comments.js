import express from 'express';
import db from '../db.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router( {mergeParams: true} ); //부모 라우트의 매개변수에 접근하기 위해 mergeParams 옵션 사용


//여기부터 댓글기능
//댓글 가져오기 CRUD - READ, GET 요청
router.get("/" , async (req,res) => {
    const { postId } = req.params;
    try {
        const [results] = await db.query(
            "SELECT * FROM comments WHERE  postId = ? ORDER BY createdAt DESC",
            [postId]
        );
        res.json(results);
    } catch (err) {
        console.error("댓글 조회 중 오류 발생:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

//댓글 작성 CRUD - CREATE, POST 요청, /api/posts/:postId/comments
router.post("/" , authenticateToken, async (req,res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const commentAuthor = req.user.username; //토큰에서 추출한 사용자 이름

    if (!content) {
        return res.status(400).json({ message: "댓글 내용을 입력해주세요."});
    }
    try {
        //댓글 작성
        const [commentResult] = await db.query(
            "INSERT INTO comments (postId, author, content) VALUES (?, ?, ?)",
            [postId, commentAuthor, content]
        );
        const commentId = commentResult.insertId;

        //게시글 정보 조회(작성자 ID, 제목)
        const [posts] = await db.query(
            "SELECT author, title FROM posts WHERE id = ?",
            [postId]
        )
        if (posts.length === 0 ) {
            return res.status(404).json({message: "게시글을 찾을 수 없습니다."});
        }
        const postAuthorUsername = posts[0].author; //게시글 작성자이름
        const postTitle = posts[0].title; //게시글 제목

        //게시글 작성자 ID 조회
        const [postAuthors] = await db.query(
            "SELECT id FROM users WHERE username = ?",
            [postAuthorUsername]
        );
        if (postAuthors.length === 0) {
        // 혹시 모를 예외 처리
        return res.status(404).json({ message: "게시글 작성자 정보를 찾을 수 없습니다." });
        }
        const postAuthorId = postAuthors[0].id; // 알림을 받을 사용자의 ID

        //댓글 작성자 ID 조회
        const [commentAuthors] = await db.query(
            "SELECT id FROM users WHERE username = ?",
            [commentAuthor]
        );
        if (commentAuthors.length === 0) {
            return res.status(404).json({ message: "댓글 작성자 정보를 찾을 수 없습니다." });
        }
        const commentAuthorId = commentAuthors[0].id; //댓글 작성자 ID

        if (postAuthorId !== commentAuthorId) {
            //알림 생성
            const notificationMessage = `[${postTitle}] 새로운 댓글이 달렸습니다!`;
            const notificationLink = `/posts/${postId}`; //알림 클릭 시 이동할 링크

            //알림 저장, notifications 테이블에 삽입
            await db.query(
                "INSERT INTO notifications (user_id, type, message, link) VALUES (?, ?, ?, ?)",
                [postAuthorId, 'new_comment', notificationMessage, notificationLink]
            );
        }
        // 댓글 작성 완료 응답
        res.status(201).json({
            id: commentId,
            postId: postId,
            author: commentAuthor,
            content: content
        })
    } catch (error) {
        console.error("댓글 작성 또는 알림 생성 중 오류 발생:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다."});
    }
});

//댓글 삭제 CRUD - DELETE, DELETE 요청
router.delete("/:commentId", authenticateToken, async (req,res) => {
    const { commentId } = req.params; //삭제할 댓글의 ID
    const loggedInUsername = req.user.username; //user -> username

    try {
        const [results] = await db.query("SELECT author FROM comments WHERE id = ?", [commentId]);

        if(results.length === 0) return res.status(404).json({message: "댓글이 존재하지 않습니다."});

        const commentAuthor = results[0].author;

        if(commentAuthor !== loggedInUsername) {
            return res.status(403).json({ message: "이 댓글을 삭제할 권한이 없습니다."})
        }

        await db.query(
            "DELETE FROM comments WHERE id = ?",
            [commentId]
        );
        res.json({ message: "댓글이 삭제되었습니다."});
    } catch (err) {
        console.error("댓글 삭제 중 오류 발생:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

export default router;
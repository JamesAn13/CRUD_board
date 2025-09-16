import express from 'express'; //익스프레스 모듈 불러오기, 라우터 사용 위해 express.Router() 사용
import bcrypt from 'bcrypt'; //비밀번호 암호화
import jwt from 'jsonwebtoken';
import db from '../db.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();


// 회원가입(사용자 인증) - CREATE
router.post("/register", async (req,res) => {
    const { username, password } = req.body;

    if( !username || !password ) {
        return res.status(400).json({ message: "아이디와 비밀번호를 모두 입력해주세요!"})
    }
    
    try {
        //비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10); //10: salt rounds, 보안강도, 높을수록 안전하지만 느려짐, 10~12 권장
        
        //DB에 사용자 정보 저장, 암호화된 비밀번호를 저장
        const [result] = await db.query(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword]
        );
        
        res.status(201).json({ message: "회원가입 성공!", userId: result.insertId }); //201: Created
    } catch (err) {
        //중복된 아이디 처리, MySQL 에러 코드 ER_DUP_ENTRY, 409: Conflict, 중복된 리소스
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "이미 존재하는 아이디입니다."});
        }
        //해시 생성 중 오류 또는 기타 DB 오류
        console.error("회원가입 중 오류 발생:", err);
        res.status(500).json({ message: "서버 오류, 다시 시도해주세요."});
    }
});


// 로그인(사용자 인증) - READ
router.post("/login", async (req,res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: "아이디와 비밀번호를 모두 입력해주세요!"});
    }
    
    try {
        //DB에서 사용자 정보 조회
        const [results] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        
        if (results.length === 0) {
            //아이디가 존재하지 않음
            return res.status(401).json({ message: "존재하지 않는 아이디입니다"}); //401: Unauthorized
        }
        
        //아이디가 존재하면 비밀번호 비교
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            //비밀번호 불일치
            return res.status(401).json({ message: "비밀번호가 일치하지 않습니다."}); //401: Unauthorized
        }
        
        //비밀번호 일치 시 JWT 토큰 발급
        const token = jwt.sign(
            { id: user.id, username: user.username }, //페이로드(payload), 토큰에 담을 정보, 보안에 민감한 정보는 담지 않음
            "your_jwt_secret", //비밀 키(secret key), 실제 서비스에서는 환경 변수로 관리, 복잡한 문자열 사용, 노출되지 않도록 주의
            { expiresIn: "1h" }, //토큰 유효 기간
        );
        
        //토큰 발급 성공, 클라이언트에 로그인 성공 메세지 + 토큰 전달
        res.json({ message: "로그인 성공!", token });

    } catch (error) {
        //DB 조회 또는 비밀번호 비교 중 오류 발생 시
        console.error("로그인 중 오류 발생:", error);
        res.status(500).json({ message: "서버 오류, 다시 시도해주세요."});
    }
});


// 내가 쓴 글 목록 조회, 
router.get("/my-posts", authenticateToken, async (req,res) => {
    const loggedInUsername = req.user.username;

    try {
        const [results] = await db.query(
            "SELECT * FROM posts WHERE author = ? ORDER BY createdAt DESC",
            [loggedInUsername]
        );
        res.json(results);
    } catch (err) {
        console.error("내 글 목록 조회 중 오류 발생:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});



//내가 쓴 댓글 조회
router.get("/my-comments", authenticateToken, async (req,res) => {
    const loggedInUsername = req.user.username;

    //comments & posts 테이블 조인 => 댓글 내용, 해당 게시글 ID, title
    const query = `
        SELECT
            c.id,
            c.content,
            c.createdAt,
            p.id AS postId,
            p.title AS postTitle
        FROM comments c
        JOIN posts p ON c.postId = p.id
        WHERE c.author = ?
        ORDER BY c.createdAt DESC  
    `;
    try {
        const [results] = await db.query(query, [loggedInUsername]);
        res.json(results);
    } catch (err) {
        console.error("내 댓글 조회 중 오류 발생:", err);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

export default router;
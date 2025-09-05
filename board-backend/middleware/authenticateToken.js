import jwt from 'jsonwebtoken';


//인증 미들웨어, it like 문지기! 넌 누구냐?
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; //요청헤더에서 'Authorization' 값 가져옴
    const token = authHeader && authHeader.split(' ')[1]; //

    //토큰 X -> 401 unauthorized 에러
    if (token == null) {
        return res.status(401).json({message: '인증 토큰이 필요합니다.'});
    }

    //토큰 검증
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ messge: '토큰이 유효하지 않습니다.'});
        }
        //토큰 유효 => req(요청) 객체에 사용자 정보 추가
        req.user = user;
        // 다음 미들웨어나 라우트 핸들러로 제어 넘김
        // 검사 끝 다음
        next();
    })
}

export default authenticateToken;
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import tournamentRoutes from './routes/tournaments.js';
import notificationRoutes from './routes/notification.js';


const app = express(); //웹 서버의 본체 생성 - express의 모든 기능 사용 가능

app.use(cors()); 
//cors(미들웨어) 설정 : 다른 도메인에서 오는 요청 허용
//프론트엔드와 백엔드 서버 주소가 다를 때 cors 설정 필요
app.use(express.json()); //json 형태의 요청 처리 가능

app.use('/api', authRoutes); //인증 관련 라우트
app.use('/api/posts', postRoutes); //게시글 관련 라우트
app.use('/api/posts/:postId/comments', commentRoutes); //댓글 관련 라우트
app.use('/api/tournaments', tournamentRoutes); //대회 관련 라우트
app.use('/api/notifications', notificationRoutes); //알림 관련 라우트


//서버 실행
app.listen(4000, () => console.log("Server is running on http://localhost:4000"));

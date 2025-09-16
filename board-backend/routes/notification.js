import express from 'express';
import db from '../db.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// 모든 알림 가져오기 - 인증 필요, GET /api/notifications
// 사용자 ID에 해당하는 알림을 생성일자 내림차순으로 정렬하여 반환합니다.
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // 인증된 사용자의 ID
        const [notifications] = await db.query(
            'SELECT id, type, message, link, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(notifications);
    } catch (error) {
        console.error('알림을 가져오는데 실패했습니다', error);
        res.status(500).json({ message: '서버 오류로 알림을 가져오는데 실패했습니다.' });
    }
});

// 알림 읽음 처리 - 인증 필요, PUT /api/notifications/:id/read
// 특정 알림을 읽음 처리합니다.
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id; // 인증된 사용자의 ID

        const [result] = await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '알림을 찾을 수 없습니다.' });
        }
        res.json({message: '알림 읽음 처리되었습니다.'});
    } catch (error) {
        console.error('알림 읽음 처리에 실패했습니다', error);
        res.status(500).json({ message: '서버 오류로 알림 읽음 처리에 실패했습니다.' });
    }   
});

// 모든 알림 읽음 처리 - 인증 필요, PUT /api/notifications/read-all
// 모든 알림을 읽음 처리합니다.
router.post('/read-all', authenticateToken, async (req, res) => {
    try {
        const userid = req.user.id;
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [userid]
        );
        res.json({message: '모든 알림이 읽음 처리되었습니다.'});
    } catch (error) {
        console.error('모든 알림 읽음 처리에 실패했습니다', error);
        res.status(500).json({ message: '서버 오류로 모든 알림 읽음 처리에 실패했습니다.' });
    }
});

export default router;
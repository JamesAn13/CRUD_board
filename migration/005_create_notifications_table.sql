USE board_db;

CREATE TABLE notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(50) NOT NULL, -- 알림의 종류 (예: 'comment_on_post'=> 'new_comment', 'new_tournament' 다른 update)
      message TEXT NOT NULL, -- 알림 내용
      link VARCHAR(255), -- (선택 사항) 알림 클릭 시 이동할 URL
      is_read BOOLEAN DEFAULT FALSE, -- 알림 읽음 여부 (기본값: 읽지 않음)
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 알림 생성 시간
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- users 테이블의 id를 참조
  );
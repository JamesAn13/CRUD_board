USE board_db;

CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,             -- 대회명
    series VARCHAR(100),                    -- 시리즈명 (예: Super 1000)
    prize VARCHAR(100),                     -- 상금 (예: USD 850,000)
    location VARCHAR(255),                  -- 개최지
    start_date DATE,                        -- 대회 시작일
    end_date DATE,                          -- 대회 종료일
    logo_url VARCHAR(500),                  -- 대회 로고 이미지 URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

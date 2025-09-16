import mysql from 'mysql2/promise';
//DB 연결
//DB 연결 풀 생성
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "james",
    database: "board_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// db.connect(err => {
//     if(err) console.error("DB connection error:", err);
//     else console.log("DB connected");
// });

export default db;
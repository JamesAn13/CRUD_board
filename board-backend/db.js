import mysql from 'mysql2';
//DB 연결
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "james",
    database: "board_db"
});

db.connect(err => {
    if(err) console.error("DB connection error:", err);
    else console.log("DB connected");
});

export default db;
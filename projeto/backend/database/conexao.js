import mysql from "mysql2/promise";
import "dotenv/config";

export const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecotrack",
    waitForConnections: true,
    connectionLimit: 10
});

export async function testarConexao() {
    const conexao = await pool.getConnection();
    try {
        await conexao.query("SELECT 1");
        console.log("Conexão com MySQL realizada!");
    } finally {
        conexao.release();
    }
}

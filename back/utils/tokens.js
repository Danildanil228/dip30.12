const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    console.error("ОШИБКА: JWT_SECRET и REFRESH_TOKEN_SECRET должны быть установлены в .env");
    process.exit(1);
}

const generateTokens = (userPayload) => {
    const accessToken = jwt.sign(userPayload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(
        {
            userId: userPayload.id,
            fingerprint: crypto.randomBytes(16).toString("hex")
        },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    return { accessToken, refreshToken };
};

const hashRefreshToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const saveRefreshToken = async (userId, refreshToken, expiresAt, req) => {
    const hashedToken = hashRefreshToken(refreshToken);
    const userAgent = req.headers["user-agent"] || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;

    const query = `
        INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `;
    const result = await pool.query(query, [userId, hashedToken, userAgent, ipAddress, expiresAt]);
    return result.rows[0].id;
};

const revokeAllUserSessions = async (userId) => {
    const result = await pool.query("UPDATE user_sessions SET revoked = true WHERE user_id = $1 AND revoked = false RETURNING id", [userId]);
    return result.rows.length;
};

const verifyRefreshToken = async (refreshToken, req) => {
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
        return { valid: false, error: "Invalid or expired refresh token" };
    }

    const { userId } = decoded;
    const hashedToken = hashRefreshToken(refreshToken);

    const result = await pool.query(
        `
        SELECT id, user_id, revoked, expires_at
        FROM user_sessions
        WHERE refresh_token_hash = $1 AND user_id = $2
    `,
        [hashedToken, userId]
    );

    if (result.rows.length === 0) {
        return { valid: false, error: "Session not found" };
    }

    const session = result.rows[0];

    if (session.revoked) {
        return { valid: false, error: "Session revoked" };
    }

    if (new Date() > new Date(session.expires_at)) {
        await pool.query("DELETE FROM user_sessions WHERE id = $1", [session.id]);
        return { valid: false, error: "Session expired" };
    }

    return { valid: true, sessionId: session.id, userId: session.user_id };
};

const cleanupExpiredSessions = async () => {
    const result = await pool.query(`
        DELETE FROM user_sessions 
        WHERE expires_at < NOW() OR revoked = true
        RETURNING id
    `);
    return result.rows.length;
};

module.exports = {
    generateTokens,
    saveRefreshToken,
    revokeAllUserSessions,
    verifyRefreshToken,
    cleanupExpiredSessions,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET
};

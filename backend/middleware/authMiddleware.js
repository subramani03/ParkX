const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    const expectedToken = process.env.ADMIN_USERNAME + "!@#123" + process.env.ADMIN_PASSWORD;

    if (!token || token !== expectedToken) {
        return res.status(401).json({ message: "Unauthorized request" });
    }
    next();
};

module.exports = authMiddleware;
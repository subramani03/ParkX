const getExpectedToken = () => {
    return process.env.ADMIN_USERNAME + "!@#123" + process.env.ADMIN_PASSWORD;
};

module.exports = { getExpectedToken };

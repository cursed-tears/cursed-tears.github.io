const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
           req.connection.remoteAddress;
};

const isIPBlocked = async (ip) => {
    try {
        const blockedIP = await BlockedIP.findOne({ ip });
        return !!blockedIP;
    } catch (error) {
        console.error('Error checking IP status:', error);
        return false;
    }
};

module.exports = {
    getClientIP,
    isIPBlocked
};

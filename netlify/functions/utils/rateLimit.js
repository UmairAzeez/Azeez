// Simple in-memory rate limiter
// Note: This resets on function cold starts, but good enough for free tier
const requests = new Map();

function rateLimit(ip, maxRequests = 5, windowMs = 60 * 60 * 1000) {
    const now = Date.now();
    const userRequests = requests.get(ip) || [];

    // Filter out old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
        return {
            allowed: false,
            retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
        };
    }

    // Add current request
    recentRequests.push(now);
    requests.set(ip, recentRequests);

    // Cleanup old entries periodically
    if (requests.size > 1000) {
        for (const [key, times] of requests.entries()) {
            const recent = times.filter(time => now - time < windowMs);
            if (recent.length === 0) {
                requests.delete(key);
            }
        }
    }

    return { allowed: true };
}

module.exports = { rateLimit };

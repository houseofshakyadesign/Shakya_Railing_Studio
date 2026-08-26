const attempts = new Map();

export function rateLimit({ windowMs = 60000, max = 10, message = "Too many requests" } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || now - record.start > windowMs) {
      attempts.set(key, { start: now, count: 1 });
      return next();
    }

    record.count++;
    if (record.count > max) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}

export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of attempts) {
    if (now - record.start > 300000) {
      attempts.delete(key);
    }
  }
}

setInterval(cleanupRateLimits, 300000);

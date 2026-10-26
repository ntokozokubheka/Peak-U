// Express 4 does not catch errors in async routes. Wrap them so errors reach the error handler.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

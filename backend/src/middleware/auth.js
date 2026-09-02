import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  const token = req.cookies?.barberman_admin_session;
  if (!token) return res.status(401).json({ message: 'Nicht angemeldet.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER || 'barberman',
      audience: process.env.JWT_AUDIENCE || 'barberman-admin',
    });
    if (payload.role !== 'admin' || !payload.sub) {
      return res.status(403).json({ message: 'Zugriff verweigert.' });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Sitzung ist abgelaufen.' });
  }
}

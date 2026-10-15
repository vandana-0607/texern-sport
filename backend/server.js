import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();
const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));

const features = [
  { id: 1, name: 'Find & Connect', description: 'Connect athletes, clubs, coaches and academies.' },
  { id: 2, name: 'Performance & Reports', description: 'Keep sporting progress and performance records.' },
  { id: 3, name: 'Payments & Records', description: 'Organise membership and payment records.' },
  { id: 4, name: 'Club & Academy Management', description: 'Manage clubs, teams and memberships.' },
  { id: 5, name: 'Tournament Management', description: 'Organise sports competitions.' },
  { id: 6, name: 'Athlete Passport', description: 'Keep athlete skills and achievements in one profile.' }
];

let poolPromise;
function getPool() {
  if (!process.env.DB_SERVER || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    throw new Error('SQL Server is not configured. Copy .env.example to .env and set your DB values.');
  }
  if (!poolPromise) {
    poolPromise = sql.connect({
      server: process.env.DB_SERVER,
      port: Number(process.env.DB_PORT || 1433),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'SportSphereDB',
      options: {
        encrypt: String(process.env.DB_ENCRYPT || 'false') === 'true',
        trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERTIFICATE || 'true') === 'true'
      },
      pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
    });
  }
  return poolPromise;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'SportSphere API is running.' });
});

app.get('/api/features', (_req, res) => res.json({ items: features }));

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (![name, email, subject, message].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ message: 'Please provide name, email, subject, and message.' });
  }
  if (name.trim().length < 2 || name.length > 100 || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      subject.length > 150 || message.trim().length < 10 || message.length > 5000) {
    return res.status(400).json({ message: 'Please check the form fields and try again.' });
  }

  try {
    const pool = await getPool();
    await pool.request()
      .input('Name', sql.NVarChar(100), name.trim())
      .input('Email', sql.NVarChar(254), email.trim())
      .input('Subject', sql.NVarChar(150), subject.trim())
      .input('Message', sql.NVarChar(sql.MAX), message.trim())
      .query(`INSERT INTO dbo.ContactEnquiries (Name, Email, Subject, Message)
              VALUES (@Name, @Email, @Subject, @Message)`);
    return res.status(201).json({ message: 'Enquiry saved successfully.' });
  } catch (error) {
    // Useful for local learning. Avoid returning internal database details to clients.
    if (error.message?.includes('SQL Server is not configured')) {
      return res.status(503).json({ message: 'Database is not configured yet. Set up SQL Server to save enquiries.' });
    }
    console.error('Contact enquiry error:', error.message);
    return res.status(500).json({ message: 'Could not save your enquiry. Check the backend and database configuration.' });
  }
});

app.use((_req, res) => res.status(404).json({ message: 'API route not found.' }));

app.listen(port, () => {
  console.log(`SportSphere API listening at http://localhost:${port}`);
});

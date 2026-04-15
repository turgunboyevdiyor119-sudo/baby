import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// ── AUTH ────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Username yoki parol xato' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, phone, username, password, role, experience } = req.body;
  try {
    const info = db.prepare(`
      INSERT INTO users (name, phone, username, password, role, experience, status, courseStartDate)
      VALUES (?, ?, ?, ?, ?, ?, 'free', date('now'))
    `).run(name, phone, username, password, role || 'client', experience || 0);
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Username allaqachon mavjud' });
  }
});

// ── WORKERS ─────────────────────────────────────────────────────────────────
app.get('/api/workers', (req, res) => {
  const workers = db.prepare("SELECT * FROM users WHERE role = 'worker' OR role = 'admin'").all();
  workers.forEach(w => {
    w.timeSlots = db.prepare('SELECT * FROM time_slots WHERE workerId = ?').all(w.id);
  });
  res.json(workers);
});

app.post('/api/workers', (req, res) => {
  const { name, username, password, experience } = req.body;
  try {
    const info = db.prepare(`
      INSERT INTO users (name, username, password, experience, role, status, courseStartDate)
      VALUES (?, ?, ?, ?, 'worker', 'free', date('now'))
    `).run(name, username, password, experience);
    
    // Generate initial slots (simplified for demo: tomorrow 9am-5pm)
    const workerId = info.lastInsertRowid;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
    
    const insertSlot = db.prepare('INSERT INTO time_slots (workerId, date, time) VALUES (?, ?, ?)');
    times.forEach(t => insertSlot.run(workerId, dateStr, t));

    const worker = db.prepare('SELECT * FROM users WHERE id = ?').get(workerId);
    worker.timeSlots = db.prepare('SELECT * FROM time_slots WHERE workerId = ?').all(workerId);
    res.json(worker);
  } catch (err) {
    res.status(400).json({ error: 'Xatolik yuz berdi' });
  }
});

app.put('/api/workers/:id', (req, res) => {
  const { name, username, password, experience } = req.body;
  if (password) {
    db.prepare('UPDATE users SET name = ?, username = ?, password = ?, experience = ? WHERE id = ?')
      .run(name, username, password, experience, req.params.id);
  } else {
    db.prepare('UPDATE users SET name = ?, username = ?, experience = ? WHERE id = ?')
      .run(name, username, experience, req.params.id);
  }
  res.json({ success: true });
});

app.delete('/api/workers/:id', (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM time_slots WHERE workerId = ?').run(req.params.id);
  res.json({ success: true });
});

app.put('/api/workers/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// ── BOOKINGS ────────────────────────────────────────────────────────────────
app.get('/api/bookings', (req, res) => {
  const bookings = db.prepare('SELECT * FROM bookings').all();
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const { workerId, clientName, clientPhone, date, time, slotId } = req.body;
  const worker = db.prepare('SELECT name FROM users WHERE id = ?').get(workerId);
  
  db.prepare(`
    INSERT INTO bookings (workerId, workerName, clientName, clientPhone, date, time, slotId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(workerId, worker.name, clientName, clientPhone, date, time, slotId);
  
  db.prepare('UPDATE time_slots SET booked = 1 WHERE id = ?').run(slotId);
  
  res.json({ success: true });
});

// ── SLOTS ───────────────────────────────────────────────────────────────────
app.post('/api/slots', (req, res) => {
  const { workerId, date, time } = req.body;
  db.prepare('INSERT INTO time_slots (workerId, date, time) VALUES (?, ?, ?)').run(workerId, date, time);
  res.json({ success: true });
});

app.delete('/api/slots/:id', (req, res) => {
  db.prepare('DELETE FROM time_slots WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.put('/api/slots/:id/toggle', (req, res) => {
  const { enabled } = req.body;
  db.prepare('UPDATE time_slots SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});

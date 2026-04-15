import db from './db.js';

function seed() {
  console.log('Seeding database...');
  
  // Clear existing
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM time_slots').run();
  db.prepare('DELETE FROM bookings').run();

  // Add Admin
  db.prepare(`
    INSERT INTO users (name, username, password, role)
    VALUES ('Admin', 'admin', 'admin123', 'admin')
  `).run();

  // Initial Workers
  const workers = [
    { name: "Shahnoza Rahimova", user: "shahnoza", pass: "shahnoza123", exp: 5 },
    { name: "Dilofaruz Karimova", user: "dilofaruz", pass: "dilofaruz123", exp: 7 },
  ];

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

  workers.forEach(w => {
    const info = db.prepare(`
      INSERT INTO users (name, username, password, experience, role, status, courseStartDate)
      VALUES (?, ?, ?, ?, 'worker', 'free', ?)
    `).run(w.name, w.user, w.pass, w.exp, dateStr);
    
    const workerId = info.lastInsertRowid;
    times.forEach(t => {
      db.prepare('INSERT INTO time_slots (workerId, date, time) VALUES (?, ?, ?)').run(workerId, dateStr, t);
    });
  });

  console.log('Seeding complete!');
  process.exit(0);
}

seed();

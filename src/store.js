// ── Date helpers ───────────────────────────────────────────────────────────
export function formatDate(date) {
  const d = new Date(date);
  // Use local date to avoid timezone issues
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Returns array of N working-day date strings starting from startDate.
 * Sundays (getDay()===0) are skipped.
 */
export function getWorkingDays(startDate, count) {
  const days = [];
  const current = new Date(startDate);
  // Normalize to midnight local time
  current.setHours(0, 0, 0, 0);
  while (days.length < count) {
    if (current.getDay() !== 0) {   // 0 = Sunday → skip
      days.push(formatDate(new Date(current)));
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/**
 * Count working days (no Sunday) from startDate UP TO AND INCLUDING today.
 */
function workingDaysPassed(startDateStr) {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (today < start) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= today) {
    if (cur.getDay() !== 0) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/**
 * Generate 10-day course slots for a worker.
 * Times: 09:00, 10:00, 11:00, 13:00, 14:00, 15:00 (6 slots/day)
 */
function generateCourseSlots(startDate) {
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
  const days = getWorkingDays(startDate, 10);
  const slots = [];
  let id = Date.now();
  days.forEach(date => {
    times.forEach(time => {
      slots.push({ id: id++, date, time, enabled: true, booked: false });
    });
  });
  return slots;
}

// ── Initial workers ────────────────────────────────────────────────────────
// Course starts today (app first run)
const TODAY = formatDate(new Date());

const initialWorkers = [
  {
    id: 1,
    name: "Shahnoza Rahimova",
    username: "shahnoza",
    password: "shahnoza123",
    experience: 5,
    status: "free",
    photo: null,
    role: "worker",
    courseStartDate: TODAY,
    timeSlots: generateCourseSlots(TODAY),
  },
  {
    id: 2,
    name: "Dilofaruz Karimova",
    username: "dilofaruz",
    password: "dilofaruz123",
    experience: 7,
    status: "free",
    photo: null,
    role: "worker",
    courseStartDate: TODAY,
    timeSlots: generateCourseSlots(TODAY),
  },
  {
    id: 3,
    name: "Dilafruz Nazarova",
    username: "dilafruz1",
    password: "dilafruz1_123",
    experience: 4,
    status: "free",
    photo: null,
    role: "worker",
    courseStartDate: TODAY,
    timeSlots: generateCourseSlots(TODAY),
  },
  {
    id: 4,
    name: "Dilafruz Toshmatova",
    username: "dilafruz2",
    password: "dilafruz2_123",
    experience: 6,
    status: "free",
    photo: null,
    role: "worker",
    courseStartDate: TODAY,
    timeSlots: generateCourseSlots(TODAY),
  },
  {
    id: 5,
    name: "Yulduz Usmonova",
    username: "yulduz",
    password: "yulduz123",
    experience: 8,
    status: "free",
    photo: null,
    role: "worker",
    courseStartDate: TODAY,
    timeSlots: generateCourseSlots(TODAY),
  },
  {
    id: 6,
    name: "Dilnoza Mirzayeva",
    username: "dilnoza",
    password: "dilnoza123",
    experience: 3,
    status: "free",
    photo: null,
    role: "worker",
    courseStartDate: TODAY,
    timeSlots: generateCourseSlots(TODAY),
  },
];

const adminUser = {
  id: 0,
  name: "Admin",
  username: "admin",
  password: "admin123",
  role: "admin",
};

// ── Auto-reset course after 10 working days ─────────────────────────────────
function autoResetCourseIfDone(workers) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let changed = false;

  workers.forEach(w => {
    const passed = workingDaysPassed(w.courseStartDate);
    if (passed >= 10) {
      // Find next working day after today
      const nextStart = new Date(today);
      nextStart.setDate(nextStart.getDate() + 1);
      while (nextStart.getDay() === 0) nextStart.setDate(nextStart.getDate() + 1);

      w.courseStartDate = formatDate(nextStart);
      w.timeSlots = generateCourseSlots(nextStart);
      w.status = 'free';
      changed = true;
    }
  });

  return changed;
}

// ── CRUD ───────────────────────────────────────────────────────────────────
export function getWorkers() {
  const stored = localStorage.getItem('workers');
  let workers;
  if (!stored) {
    workers = initialWorkers;
  } else {
    workers = JSON.parse(stored);
    // Make sure all workers have courseStartDate (migration for old data)
    workers.forEach(w => {
      if (!w.courseStartDate) {
        w.courseStartDate = TODAY;
        if (!w.timeSlots || w.timeSlots.length === 0) {
          w.timeSlots = generateCourseSlots(TODAY);
        }
      }
    });
  }
  // Auto-reset finished courses
  const changed = autoResetCourseIfDone(workers);
  if (changed || !stored) {
    localStorage.setItem('workers', JSON.stringify(workers));
  }
  return workers;
}

export function saveWorkers(workers) {
  localStorage.setItem('workers', JSON.stringify(workers));
}

export function getClients() {
  const stored = localStorage.getItem('clients');
  return stored ? JSON.parse(stored) : [];
}

export function saveClients(clients) {
  localStorage.setItem('clients', JSON.stringify(clients));
}

export function getBookings() {
  const stored = localStorage.getItem('bookings');
  return stored ? JSON.parse(stored) : [];
}

export function saveBookings(bookings) {
  localStorage.setItem('bookings', JSON.stringify(bookings));
}

export function getCurrentUser() {
  const stored = sessionStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
}

export function setCurrentUser(user) {
  if (user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('currentUser');
  }
}

export function login(username, password) {
  if (username === adminUser.username && password === adminUser.password) {
    setCurrentUser(adminUser);
    return adminUser;
  }
  const workers = getWorkers();
  const worker = workers.find(w => w.username === username && w.password === password);
  if (worker) {
    setCurrentUser(worker);
    return worker;
  }
  const clients = getClients();
  const client = clients.find(c => c.username === username && c.password === password);
  if (client) {
    setCurrentUser(client);
    return client;
  }
  return null;
}

export function addBooking(booking) {
  const bookings = getBookings();
  const newBooking = { ...booking, id: Date.now() };
  bookings.push(newBooking);
  saveBookings(bookings);

  // Mark slot as booked
  const workers = getWorkers();
  const workerIdx = workers.findIndex(w => w.id === booking.workerId);
  if (workerIdx !== -1) {
    const slotIdx = workers[workerIdx].timeSlots.findIndex(s => s.id === booking.slotId);
    if (slotIdx !== -1) {
      workers[workerIdx].timeSlots[slotIdx].booked = true;
    }
    saveWorkers(workers);
  }
  return newBooking;
}

/** Admin/Worker: add new worker with auto-generated course slots */
export function createWorker({ name, username, password, experience }) {
  const workers = getWorkers();
  if (workers.find(w => w.username === username)) return null; // already exists
  const newWorker = {
    id: Date.now(),
    name, username, password,
    experience: parseInt(experience) || 0,
    status: 'free',
    photo: null,
    role: 'worker',
    courseStartDate: TODAY,
    timeSlots: generateCourseSlots(TODAY),
  };
  workers.push(newWorker);
  saveWorkers(workers);
  return newWorker;
}

/** Registration: Client */
export function createClient({ name, phone, username, password }) {
  const clients = getClients();
  if (clients.find(c => c.username === username)) return null; // already exists
  const newClient = {
    id: Date.now(),
    name, phone, username, password,
    role: 'client'
  };
  clients.push(newClient);
  saveClients(clients);
  return newClient;
}

/** Get course end date (10 working days from courseStartDate) */
export function getCourseEndDate(courseStartDate) {
  const days = getWorkingDays(courseStartDate, 10);
  return days[days.length - 1];
}

/** Return how many working days remain in the current course */
export function getCourseRemaining(worker) {
  const passed = workingDaysPassed(worker.courseStartDate);
  return Math.max(0, 10 - passed);
}

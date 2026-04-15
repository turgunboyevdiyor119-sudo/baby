const API_URL = 'http://localhost:3000/api';

// ── Date helpers ───────────────────────────────────────────────────────────
export function formatDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function getWorkingDays(startDate, count) {
  const days = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  while (days.length < count) {
    if (current.getDay() !== 0) {
      days.push(formatDate(new Date(current)));
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

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

// ── API CALLS ──────────────────────────────────────────────────────────────
export async function getWorkers() {
  const res = await fetch(`${API_URL}/workers`);
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) return null;
  const user = await res.json();
  setCurrentUser(user);
  return user;
}

export async function createClient(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, role: 'client' })
  });
  return res.json();
}

export async function createWorker(data) {
  const res = await fetch(`${API_URL}/workers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteWorker(id) {
  await fetch(`${API_URL}/workers/${id}`, { method: 'DELETE' });
}

export async function updateWorker(id, data) {
  await fetch(`${API_URL}/workers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function setWorkerStatus(id, status) {
  await fetch(`${API_URL}/workers/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
}

export async function getBookings() {
  const res = await fetch(`${API_URL}/bookings`);
  return res.json();
}

export async function addBooking(booking) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  return res.json();
}

export async function addSlot(workerId, date, time) {
  await fetch(`${API_URL}/slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId, date, time })
  });
}

export async function deleteSlot(id) {
  await fetch(`${API_URL}/slots/${id}`, { method: 'DELETE' });
}

export async function toggleSlot(id, enabled) {
  await fetch(`${API_URL}/slots/${id}/toggle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  });
}

// ── SESSION ───────────────────────────────────────────────────────────────
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

export function getCourseEndDate(courseStartDate) {
  const days = getWorkingDays(courseStartDate, 10);
  return days[days.length - 1];
}

export function getCourseRemaining(worker) {
  const passed = workingDaysPassed(worker.courseStartDate || formatDate(new Date()));
  return Math.max(0, 10 - passed);
}

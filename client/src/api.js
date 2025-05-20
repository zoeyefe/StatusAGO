export async function fetchStatus() {
  const res = await fetch('http://localhost:5000/api/status');
  if (!res.ok) throw new Error('Durum alınamadı');
  return res.json();
} 
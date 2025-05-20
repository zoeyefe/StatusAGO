export async function fetchStatus() {
  const res = await fetch('https://statusago.onrender.com/api/status');
  if (!res.ok) throw new Error('Durum alınamadı');
  return res.json();
} 

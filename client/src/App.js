import React, { useEffect, useState } from 'react';
import './App.css';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/status')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError('Veri alınamadı: ' + e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loader">Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return null;

  const { current, history } = data;
  const labels = history.map((h) => new Date(h.time).toLocaleTimeString());
  const responseTimes = history.map((h) => h.responseTime);
  const sslDays = history.map((h) => h.sslDaysLeft);
  const statuses = history.map((h) => h.status === 'up' ? 1 : 0);

  return (
    <div className="dashboard-container">
      <h1>StatusAGO Dashboard</h1>
      <div className="status-section">
        <div className={`status-indicator ${current.status}`}></div>
        <div>
          <h2>Şu Anki Durum: <span className={current.status}>{current.status === 'up' ? 'ÇALIŞIYOR' : 'KAPALI'}</span></h2>
          <p>Yanıt Süresi: <b>{current.responseTime ?? '-'} ms</b></p>
          <p>SSL Gün Sayısı: <b>{current.sslDaysLeft ?? '-'} gün</b></p>
          <p>Son Güncelleme: <b>{new Date(current.time).toLocaleString()}</b></p>
        </div>
      </div>
      <div className="charts-section">
        <div className="chart-box">
          <h3>Yanıt Süresi (ms)</h3>
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: 'Yanıt Süresi',
                  data: responseTimes,
                  borderColor: '#007bff',
                  backgroundColor: 'rgba(0,123,255,0.1)',
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { display: false } },
            }}
          />
        </div>
        <div className="chart-box">
          <h3>SSL Sertifika Günleri</h3>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: 'SSL Günleri',
                  data: sslDays,
                  backgroundColor: '#28a745',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { display: false } },
            }}
          />
        </div>
        <div className="chart-box">
          <h3>Durum (Up/Down)</h3>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: 'Durum',
                  data: statuses,
                  backgroundColor: statuses.map((s) => (s ? '#28a745' : '#dc3545')),
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { display: false }, y: { min: 0, max: 1, ticks: { stepSize: 1, callback: v => v ? 'UP' : 'DOWN' } } },
            }}
          />
        </div>
      </div>
      <div className="table-section">
        <h3>Son 24 Saatlik Kayıtlar</h3>
        <table>
          <thead>
            <tr>
              <th>Zaman</th>
              <th>Durum</th>
              <th>Yanıt Süresi (ms)</th>
              <th>SSL Gün</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(-50).reverse().map((h, i) => (
              <tr key={i} className={h.status}>
                <td>{new Date(h.time).toLocaleString()}</td>
                <td>{h.status === 'up' ? 'ÇALIŞIYOR' : 'KAPALI'}</td>
                <td>{h.responseTime ?? '-'}</td>
                <td>{h.sslDaysLeft ?? '-'}</td>
                <td>{h.dnsInfo?.address ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer>
        <p>StatusAGO &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;

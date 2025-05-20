import { useEffect, useState } from 'react'
import { fetchStatus } from './api'
import './App.css'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

const COLOR_RED = '#e74c3c'
const COLOR_ORANGE = '#f39c12'
const COLOR_BLUE = '#3498db'
const COLOR_GREEN = '#1ecb4f'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStatus()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="center">Yükleniyor...</div>
  if (error) return <div className="center error">Hata: {error.message}</div>
  if (!data) return <div className="center">Veri yok</div>

  const { current, history } = data

  return (
    <div className="dashboard">
      <h1>AGO Status Panel</h1>
      <div className="status-row">
        <div className="status-box" style={{ borderColor: COLOR_RED }}>
          <h2>Anlık Durum</h2>
          <div className="status-indicator" style={{ background: COLOR_RED, borderColor: COLOR_RED }}></div>
          <div className="status-text">{current.status === 'up' ? 'Çalışıyor' : 'Erişilemiyor'}</div>
          <div>Yanıt Süresi: <b>{
            current.responseTime !== null && current.responseTime !== undefined
              ? `${current.responseTime} ms`
              : 'Bilinmiyor'
          }</b></div>
        </div>
        <div className="status-box" style={{ borderColor: COLOR_ORANGE }}>
          <h2>SSL Sertifika</h2>
          <div className="status-indicator" style={{ background: COLOR_ORANGE, borderColor: COLOR_ORANGE }}></div>
          <div>Kalan Gün: <b>{current.sslDaysLeft ?? '-'}</b></div>
        </div>
        <div className="status-box" style={{ borderColor: COLOR_BLUE }}>
          <h2>DNS</h2>
          <div className="status-indicator" style={{ background: COLOR_BLUE, borderColor: COLOR_BLUE }}></div>
          <div>Adres: <b>{current.dnsInfo?.address ?? '-'}</b></div>
          <div>Family: <b>{current.dnsInfo?.family ?? '-'}</b></div>
        </div>
        <div className="status-box" style={{ borderColor: COLOR_GREEN }}>
          <h2>Ping</h2>
          <div className="status-indicator" style={{ background: COLOR_GREEN, borderColor: COLOR_GREEN }}></div>
          <div>Ping: <b>{
            current.pingMs !== null && current.pingMs !== undefined
              ? `${current.pingMs} ms`
              : 'Bilinmiyor'
          }</b></div>
        </div>
      </div>
      <div className="history-section">
        <h2>Son 24 Saatlik Geçmiş</h2>
        <div className="history-graph-modern">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={history.map(h => ({
              ...h,
              time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_RED} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLOR_RED} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} minTickGap={30} />
              <YAxis tick={{ fontSize: 10 }} width={40} domain={['auto', 'auto']} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip contentStyle={{ borderColor: COLOR_RED }} />
              <Area type="monotone" dataKey="responseTime" stroke={COLOR_RED} fill="url(#colorResp)" name="Yanıt Süresi (ms)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <footer>
        <span>ago.com.tr status created by Efe &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

export default App

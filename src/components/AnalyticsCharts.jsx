import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import './AnalyticsCharts.css';

const COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f97316', '#ef4444'];

export default function AnalyticsCharts() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders/admin/all`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="analytics-loading">Loading analytics...</div>;

  // Revenue per day (last 7 days)
  const revenueByDay = (() => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    orders.forEach(o => {
      const d = new Date(o.purchaseDate || o.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (days[key] !== undefined) days[key] += (o.totalPaid || 0);
    });
    return Object.entries(days).map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }));
  })();

  // Tickets sold per event (top 5)
  const ticketsByEvent = (() => {
    const evtMap = {};
    orders.forEach(o => {
      if (!evtMap[o.eventTitle]) evtMap[o.eventTitle] = 0;
      evtMap[o.eventTitle] += (o.ticketCount || 1);
    });
    return Object.entries(evtMap)
      .map(([name, tickets]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, tickets }))
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5);
  })();

  // Section distribution
  const sectionData = (() => {
    const sMap = {};
    orders.forEach(o => {
      const s = o.section?.name || 'General Admission';
      sMap[s] = (sMap[s] || 0) + 1;
    });
    return Object.entries(sMap).map(([name, value]) => ({ name, value }));
  })();

  const totalRevenue = orders.reduce((s, o) => s + (o.totalPaid || 0), 0);
  const totalTickets = orders.reduce((s, o) => s + (o.ticketCount || 1), 0);

  return (
    <div className="analytics-wrapper">
      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi-card glass-panel">
          <p className="kpi-label">Total Revenue</p>
          <h2 className="kpi-value">${totalRevenue.toFixed(2)}</h2>
        </div>
        <div className="kpi-card glass-panel">
          <p className="kpi-label">Orders Placed</p>
          <h2 className="kpi-value">{orders.length}</h2>
        </div>
        <div className="kpi-card glass-panel">
          <p className="kpi-label">Tickets Sold</p>
          <h2 className="kpi-value">{totalTickets}</h2>
        </div>
        <div className="kpi-card glass-panel">
          <p className="kpi-label">Avg Order Value</p>
          <h2 className="kpi-value">${orders.length ? (totalRevenue / orders.length).toFixed(2) : '0.00'}</h2>
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="chart-card glass-panel">
        <h3>Revenue — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueByDay} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#1a1a1c', border: '1px solid #333', borderRadius: '8px', color: 'white' }}
              formatter={(v) => [`$${v}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-row">
        {/* Tickets per Event */}
        <div className="chart-card glass-panel">
          <h3>Tickets Sold per Event</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ticketsByEvent} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} angle={-20} textAnchor="end" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1a1c', border: '1px solid #333', borderRadius: '8px', color: 'white' }} />
              <Bar dataKey="tickets" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Section Pie Chart */}
        <div className="chart-card glass-panel">
          <h3>Popular Sections</h3>
          {sectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sectionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {sectionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a1c', border: '1px solid #333', borderRadius: '8px', color: 'white' }} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-empty">No section data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";

export const SpamTrendChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-slate-500 text-sm flex items-center justify-center h-full">No trend data available.</div>;

  const formattedData = data.map(d => ({
    ...d,
    displayDate: format(new Date(d.date), "MMM dd")
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSpam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorHam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
          itemStyle={{ color: '#fff', fontSize: '13px' }}
          labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
        />
        <Area type="monotone" dataKey="spam_count" name="Spam Detected" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorSpam)" />
        <Area type="monotone" dataKey="ham_count" name="Clean (Ham)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHam)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export const ProbabilityDistribution = () => {
  const mockData = Array.from({ length: 10 }).map((_, i) => ({
    range: `${(i * 0.1).toFixed(1)}`,
    ham: Math.max(0, 50 - i * 8 + Math.floor(Math.random() * 5)),
    spam: Math.max(0, i * 6 - 10 + Math.floor(Math.random() * 5)),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={mockData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis dataKey="range" stroke="#94a3b8" fontSize={9} tickLine={false} />
        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
        <Bar dataKey="ham" fill="#10b981" radius={[2, 2, 0, 0]} />
        <Bar dataKey="spam" fill="#f43f5e" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

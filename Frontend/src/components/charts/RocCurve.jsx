import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export const RocCurve = ({ auc = 0.99 }) => {
  const curveData = Array.from({ length: 20 }).map((_, i) => {
    const x = i / 19;
    return { fpr: x, tpr: 1 - Math.exp(-20 * x) };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={curveData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="fpr" tickFormatter={(val) => Number(val).toFixed(2)} stroke="#ffffff50" fontSize={11} label={{ value: "FPR", position: "insideBottom", offset: -10, fill: "#94a3b8", fontSize: 10 }} />
        <YAxis stroke="#ffffff50" fontSize={11} label={{ value: "TPR", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }} />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
        <Line type="monotone" dataKey="tpr" name="Sensitivity" stroke="#10b981" strokeWidth={3} dot={false} />
        <Line type="linear" dataKey="fpr" name="Random" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

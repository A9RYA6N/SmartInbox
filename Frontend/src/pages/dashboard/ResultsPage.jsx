import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShieldCheck, AlertTriangle, Zap, Link2, ArrowLeft, Download, 
  CheckCircle2, XCircle, Clock, Cpu
} from "lucide-react";
import { RadialAnalytics } from "../../components/charts/RadialAnalytics";
import { toast } from "react-hot-toast";

export const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) return <Navigate to="/scan" replace />;

  const isSpam = result.prediction === 1;
  const probPct = (result.probability * 100).toFixed(1);
  const confPct = result.confidence !== undefined ? (result.confidence * 100).toFixed(0) : null;

  const handleDownload = () => {
    const rows = [
      ["Message", "Verdict", "Probability (%)", "Model", "Timestamp"],
      [
        `"${(result.text || "").replace(/"/g, '""')}"`,
        isSpam ? "SPAM" : "HAM",
        probPct,
        result.model_version || "v3",
        new Date().toISOString(),
      ],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `smartinbox_${Date.now()}.csv` });
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/scan")}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="inline-flex items-center gap-1.5 badge-blue mb-1">
            <Zap size={11} /> Analysis Complete
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Scan Result</h1>
        </div>
      </div>

      {/* Verdict banner */}
      <div className={`card p-6 border-l-4 ${isSpam ? "border-l-red-500" : "border-l-emerald-500"}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isSpam ? "bg-red-50" : "bg-emerald-50"}`}>
              {isSpam
                ? <XCircle className="w-8 h-8 text-red-500" />
                : <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              }
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Verdict</p>
              <h2 className={`text-3xl font-bold tracking-tight ${isSpam ? "text-red-600" : "text-emerald-600"}`}>
                {isSpam ? "SPAM" : "CLEAN"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {isSpam
                  ? "This message exhibits spam characteristics."
                  : "This message appears to be legitimate."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">{probPct}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Spam probability</p>
            </div>
            {result.latency_ms && (
              <div>
                <p className="text-2xl font-bold text-slate-900">{result.latency_ms.toFixed(0)}<span className="text-sm font-normal">ms</span></p>
                <p className="text-xs text-slate-500 mt-0.5">Latency</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Message + indicators */}
        <div className="lg:col-span-3 space-y-5">
          {/* Original message */}
          <div className="card p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Original Message</p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100 italic">
              "{result.text}"
            </p>
          </div>

          {/* Analysis indicators */}
          <div className="card p-5 space-y-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Analysis Details</p>
            {[
              {
                icon: isSpam ? AlertTriangle : ShieldCheck,
                title: isSpam ? "Suspicious Pattern Detected" : "No Threats Identified",
                desc: isSpam
                  ? "Linguistic markers suggest social engineering or phishing intent."
                  : "Message structure consistent with legitimate communication.",
                color: isSpam ? "text-red-500 bg-red-50" : "text-emerald-600 bg-emerald-50",
              },
              {
                icon: Link2,
                title: isSpam ? "Unusual Character Distribution" : "Natural Language Verified",
                desc: isSpam
                  ? "Obfuscated characters and irregular link patterns detected."
                  : "NLP confirms content matches authentic user-generated patterns.",
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: Cpu,
                title: "Model Version",
                desc: `Classified by model ${result.model_version || "v3"} · Threshold: ${((result.threshold_used || 0.5) * 100).toFixed(0)}%`,
                color: "text-slate-600 bg-slate-100",
              },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`p-2 rounded-lg flex-shrink-0 ${color}`}>
                  <Icon size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Radial chart */}
        <div className="lg:col-span-2">
          <div className="card p-6 flex flex-col items-center justify-center h-full gap-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Confidence Score</p>
            <RadialAnalytics
              percentage={parseFloat(probPct)}
              label={isSpam ? "Spam" : "Clean"}
              color={isSpam ? "#ef4444" : "#10b981"}
            />
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Threshold</p>
                <p className="text-sm font-semibold text-slate-900">
                  {((result.threshold_used || 0.5) * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Latency</p>
                <p className="text-sm font-semibold text-slate-900">
                  {result.latency_ms ? `${result.latency_ms.toFixed(0)}ms` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate("/scan")} className="btn-primary">
          <Zap size={15} /> New Scan
        </button>
        <button onClick={handleDownload} className="btn-secondary">
          <Download size={15} /> Download Report
        </button>
        <button onClick={() => navigate("/history")} className="btn-secondary">
          <Clock size={15} /> View History
        </button>
      </div>
    </div>
  );
};

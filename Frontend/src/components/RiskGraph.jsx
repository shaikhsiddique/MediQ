import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TrendingUp, Activity, CalendarDays } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function RiskGraph({ timeline = [], averageRisk, trendDirection, currentRisk }) {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Risk Analytics",
      subtitle: "Diabetes risk trend across all reports",
      risk: "Risk %",
      average: "Average Risk",
      status: "Trend",
      improving: "Improving",
      increasing: "Increasing",
      stable: "Stable",
      noData: "No report data yet",
      reports: "reports",
      current: "Current",
      start: "Start",
      end: "Latest",
    },
    hi: {
      title: "जोखिम विश्लेषण",
      subtitle: "सभी रिपोर्ट में डायबिटीज जोखिम ट्रेंड",
      risk: "जोखिम %",
      average: "औसत जोखिम",
      status: "ट्रेंड",
      improving: "सुधार",
      increasing: "बढ़ रहा",
      stable: "स्थिर",
      noData: "अभी कोई रिपोर्ट डेटा नहीं",
      reports: "रिपोर्ट",
      current: "वर्तमान",
      start: "प्रारंभ",
      end: "नवीनतम",
    },
  };

  const t = translations[language] || translations.en;

  // Map timeline data to chart format with full date for tooltip
  const chartData = timeline.map((item) => ({
    name: new Date(item.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    risk: parseFloat(item.riskScore) || 0,
    fullDate: item.date,
    originalRisk: parseFloat(item.riskScore) || 0,
  }));

  // Calculate average risk
  const avgRisk =
    averageRisk != null
      ? Math.round(parseFloat(averageRisk))
      : chartData.length > 0
      ? Math.round(
          chartData.reduce((acc, item) => acc + item.risk, 0) / chartData.length
        )
      : 0;

  // Determine trend label and color
  const trendLabel =
    trendDirection === "decreasing"
      ? t.improving
      : trendDirection === "increasing"
      ? t.increasing
      : t.stable;

  const trendColor =
    trendDirection === "decreasing"
      ? "text-green-600"
      : trendDirection === "increasing"
      ? "text-red-600"
      : "text-yellow-600";

  // Custom dot component with wave endpoint highlighting (start and end points)
  const CustomDot = (props) => {
    const { cx, cy, index, payload } = props;
    const isFirstPoint = index === 0;
    const isLastPoint = index === chartData.length - 1;
    const isEndpoint = isFirstPoint || isLastPoint;
    
    // Different styling for start and end points to emphasize the wave journey
    if (isEndpoint) {
      return (
        <g>
          {/* Outer glow ring */}
          <circle 
            cx={cx} 
            cy={cy} 
            r={12} 
            fill={isFirstPoint ? "#22c55e" : "#2563eb"} 
            opacity={0.25} 
          />
          {/* Main endpoint dot */}
          <circle 
            cx={cx} 
            cy={cy} 
            r={8} 
            fill={isFirstPoint ? "#22c55e" : "#2563eb"} 
            stroke="#ffffff" 
            strokeWidth={3} 
          />
          {/* Inner highlight */}
          <circle cx={cx} cy={cy} r={3} fill="#ffffff" opacity={0.9} />
          {/* Small label hint for endpoints */}
          <text 
            x={cx} 
            y={cy - 14} 
            textAnchor="middle" 
            fill={isFirstPoint ? "#16a34a" : "#1d4ed8"} 
            fontSize="10" 
            fontWeight="bold"
            className="text-xs font-semibold"
          >
            {isFirstPoint ? t.start : t.end}
          </text>
        </g>
      );
    }
    
    // Regular data points with wave-like styling
    return (
      <g>
        {/* Outer glow */}
        <circle cx={cx} cy={cy} r={9} fill="#2563eb" opacity={0.2} />
        {/* Main dot */}
        <circle cx={cx} cy={cy} r={6} fill="#2563eb" stroke="#ffffff" strokeWidth={2.5} />
        {/* Inner highlight */}
        <circle cx={cx} cy={cy} r={2.5} fill="#ffffff" opacity={0.9} />
      </g>
    );
  };

  return (
    <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-6 md:p-8 w-full">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-2xl shadow-md">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{t.title}</h2>
            <p className="text-gray-500 mt-1">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <CalendarDays className="w-5 h-5" />
          <span>
            {chartData.length} {t.reports}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-5 mt-8">
        
        {/* Average Risk */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">{t.average}</p>
              <h3 className="text-4xl font-bold text-blue-600 mt-2">
                {avgRisk}%
              </h3>
            </div>
            <div className="bg-blue-500 p-4 rounded-2xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Trend Status */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-3xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-medium">{t.status}</p>
              <h3 className={`text-3xl font-bold mt-2 ${trendColor}`}>
                {trendLabel}
              </h3>
              {currentRisk != null && (
                <p className="text-sm text-gray-500 mt-1">
                  {t.current}: {currentRisk}%
                </p>
              )}
            </div>
            <div className="bg-green-500 p-4 rounded-2xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Graph - Wave Style from Start to End */}
      <div className="mt-10 bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-[28px] p-5 border border-gray-100">
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500 py-16">{t.noData}</p>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart 
              data={chartData}
              margin={{ top: 20, right: 25, left: 0, bottom: 5 }}
            >
              <defs>
                {/* Wave-like gradient that flows from start to end */}
                <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
                <filter id="waveShadow" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2" floodColor="#2563eb"/>
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="5 5" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dx={-8}
                label={{ 
                  value: t.risk, 
                  angle: -90, 
                  position: "insideLeft", 
                  fill: "#3b82f6",
                  fontSize: 12,
                  fontWeight: 600,
                  dx: -10,
                  dy: 40
                }}
              />

              <Tooltip
                formatter={(value) => [`${value}%`, t.risk]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload.fullDate) {
                    const fullDate = new Date(payload[0].payload.fullDate);
                    return fullDate.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    });
                  }
                  return label;
                }}
                contentStyle={{
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(4px)",
                  padding: "10px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
                cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
              />

              {/* Area under the wave - smooth fill */}
              <Area
                type="natural"
                dataKey="risk"
                stroke="none"
                fill="url(#areaGradient)"
              />

              {/* Main wave line - using natural interpolation for smooth, organic wave-like curve */}
              <Line
                type="natural"
                dataKey="risk"
                stroke="url(#waveGradient)"
                strokeWidth={4}
                dot={<CustomDot />}
                activeDot={{ 
                  r: 10, 
                  fill: "#2563eb", 
                  stroke: "#ffffff", 
                  strokeWidth: 4,
                  filter: "drop-shadow(0 2px 6px rgba(37,99,235,0.4))"
                }}
                filter="url(#waveShadow)"
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default RiskGraph;
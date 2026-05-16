import React, { useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  TrendingUp,
  Activity,
  CalendarDays,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";

function RiskGraph() {

  const { language } = useLanguage();

  const [range, setRange] = useState("weekly");

  const translations = {

    en: {
      title: "Risk Analytics",
      subtitle: "Track diabetes risk trends over time",

      weekly: "Weekly",
      monthly: "Monthly",
      threeMonths: "3 Months",
      sixMonths: "6 Months",

      risk: "Risk %",
      average: "Average Risk",
      status: "Current Status",
      improving: "Improving",
    },

    hi: {
      title: "जोखिम विश्लेषण",
      subtitle: "समय के साथ डायबिटीज जोखिम ट्रेंड देखें",

      weekly: "साप्ताहिक",
      monthly: "मासिक",
      threeMonths: "3 महीने",
      sixMonths: "6 महीने",

      risk: "जोखिम %",
      average: "औसत जोखिम",
      status: "वर्तमान स्थिति",
      improving: "सुधार हो रहा है",
    },
  };

  const t = translations[language];

  const graphData = {

    weekly: [
      { name: "Mon", risk: 42 },
      { name: "Tue", risk: 45 },
      { name: "Wed", risk: 40 },
      { name: "Thu", risk: 50 },
      { name: "Fri", risk: 48 },
      { name: "Sat", risk: 44 },
      { name: "Sun", risk: 38 },
    ],

    monthly: [
      { name: "Week 1", risk: 55 },
      { name: "Week 2", risk: 50 },
      { name: "Week 3", risk: 46 },
      { name: "Week 4", risk: 40 },
    ],

    threeMonths: [
      { name: "Jan", risk: 68 },
      { name: "Feb", risk: 62 },
      { name: "Mar", risk: 55 },
    ],

    sixMonths: [
      { name: "Jan", risk: 75 },
      { name: "Feb", risk: 70 },
      { name: "Mar", risk: 65 },
      { name: "Apr", risk: 58 },
      { name: "May", risk: 50 },
      { name: "Jun", risk: 42 },
    ],
  };

  const currentData = graphData[range];

  const avgRisk =
    Math.round(
      currentData.reduce((acc, item) => acc + item.risk, 0) /
      currentData.length
    );

  return (

    <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-6 md:p-8 w-full">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <div className="flex items-center gap-3">

            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-2xl shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>

            <div>

              <h2 className="text-3xl font-bold text-gray-800">
                {t.title}
              </h2>

              <p className="text-gray-500 mt-1">
                {t.subtitle}
              </p>

            </div>
          </div>
        </div>

        {/* Dropdown */}
        <div className="flex items-center gap-3">

          <CalendarDays className="w-5 h-5 text-gray-500" />

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 font-medium"
          >
            <option value="weekly">{t.weekly}</option>
            <option value="monthly">{t.monthly}</option>
            <option value="threeMonths">{t.threeMonths}</option>
            <option value="sixMonths">{t.sixMonths}</option>
          </select>

        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-5 mt-8">

        {/* Average */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-6 border border-blue-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-600 font-medium">
                {t.average}
              </p>

              <h3 className="text-4xl font-bold text-blue-600 mt-2">
                {avgRisk}%
              </h3>

            </div>

            <div className="bg-blue-500 p-4 rounded-2xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>

          </div>
        </div>

        {/* Status */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-3xl p-6 border border-green-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-600 font-medium">
                {t.status}
              </p>

              <h3 className="text-3xl font-bold text-green-600 mt-2">
                {t.improving}
              </h3>

            </div>

            <div className="bg-green-500 p-4 rounded-2xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>

          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="mt-10 bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-[28px] p-5 border border-gray-100">

        <ResponsiveContainer width="100%" height={380}>

          <AreaChart data={currentData}>

            <defs>

              <linearGradient
                id="riskGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#2563eb"
                  stopOpacity={0.4}
                />

                <stop
                  offset="100%"
                  stopColor="#22c55e"
                  stopOpacity={0.05}
                />

              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#d1d5db"
            />

            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 14 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#6b7280", fontSize: 14 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "18px",
                border: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            />

            <Area
              type="monotone"
              dataKey="risk"
              stroke="#2563eb"
              strokeWidth={4}
              fill="url(#riskGradient)"
            />

          </AreaChart>

        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RiskGraph;
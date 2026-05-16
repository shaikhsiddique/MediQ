import React from 'react';
import {
  Activity,
  Heart,
  Shield,
  ChevronRight,
  Bell,
  BarChart3
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

const Landing = () => {

  const { language } = useLanguage();

  const translations = {
    en: {
      badge: "AI-Powered Healthcare for Children",
      title1: "Early Diabetes Risk",
      title2: "Monitoring for Kids",
      description:
        "Advanced AI-powered platform to identify, monitor, and manage Type 1 diabetes risk in children. Real-time alerts, personalized recommendations, and continuous health monitoring for peace of mind.",
      start: "Start Monitoring",
      demo: "Watch Demo",
      monitored: "Children Monitored",
      detection: "Early Detection",
      live: "Live Monitoring",
      dashboard: "Risk Dashboard",
      lowRisk: "Low Risk",
      glucose: "Glucose Level",
      activity: "Activity Level",
      assessment: "AI Assessment",
      good: "Good",
      normal: "Normal"
    },

    hi: {
      badge: "बच्चों के लिए AI आधारित स्वास्थ्य सेवा",
      title1: "शुरुआती डायबिटीज जोखिम",
      title2: "बच्चों की निगरानी",
      description:
        "बच्चों में टाइप 1 डायबिटीज जोखिम की पहचान, निगरानी और प्रबंधन के लिए उन्नत AI प्लेटफॉर्म। रियल-टाइम अलर्ट, व्यक्तिगत सुझाव और निरंतर स्वास्थ्य निगरानी।",
      start: "निगरानी शुरू करें",
      demo: "डेमो देखें",
      monitored: "बच्चों की निगरानी",
      detection: "शुरुआती पहचान",
      live: "लाइव निगरानी",
      dashboard: "जोखिम डैशबोर्ड",
      lowRisk: "कम जोखिम",
      glucose: "ग्लूकोज स्तर",
      activity: "गतिविधि स्तर",
      assessment: "AI मूल्यांकन",
      good: "अच्छा",
      normal: "सामान्य"
    }
  };

  const t = translations[language];

  return (
    <section
      id="home"
      className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen flex items-center"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-6">

            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
              {t.badge}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {t.title1}{" "}

              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {t.title2}
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              {t.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">

              <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all flex items-center justify-center space-x-2">

                <span>{t.start}</span>

                <ChevronRight className="w-5 h-5" />

              </button>

              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all">
                {t.demo}
              </button>

            </div>

            <div className="flex items-center space-x-8 pt-4">

              <div>
                <div className="text-3xl font-bold text-blue-600">
                  10K+
                </div>

                <div className="text-gray-600 text-sm">
                  {t.monitored}
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold text-green-600">
                  98%
                </div>

                <div className="text-gray-600 text-sm">
                  {t.detection}
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold text-blue-600">
                  24/7
                </div>

                <div className="text-gray-600 text-sm">
                  {t.live}
                </div>
              </div>

            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">

            <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl p-8 shadow-2xl">

              <div className="bg-white rounded-2xl p-6 space-y-4">

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold text-gray-800">
                    {t.dashboard}
                  </h3>

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    {t.lowRisk}
                  </span>

                </div>

                <div className="space-y-3">

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">

                    <div className="flex items-center space-x-3">

                      <Activity className="w-5 h-5 text-blue-600" />

                      <span className="text-sm font-medium text-gray-700">
                        {t.glucose}
                      </span>

                    </div>

                    <span className="text-blue-600 font-semibold">
                      95 mg/dL
                    </span>

                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">

                    <div className="flex items-center space-x-3">

                      <Heart className="w-5 h-5 text-green-600" />

                      <span className="text-sm font-medium text-gray-700">
                        {t.activity}
                      </span>

                    </div>

                    <span className="text-green-600 font-semibold">
                      {t.good}
                    </span>

                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">

                    <div className="flex items-center space-x-3">

                      <Shield className="w-5 h-5 text-purple-600" />

                      <span className="text-sm font-medium text-gray-700">
                        {t.assessment}
                      </span>

                    </div>

                    <span className="text-purple-600 font-semibold">
                      {t.normal}
                    </span>

                  </div>

                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
              <Bell className="w-6 h-6 text-green-500" />
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
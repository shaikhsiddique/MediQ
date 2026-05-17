import React from 'react';
import {
  Smartphone,
  BarChart3,
  Shield,
  Bell,
  CheckCircle
} from 'lucide-react';

import { useT } from '../context/LanguageContext';
import { mrHow } from '../locales/mr';

const HowItWorks = () => {

  const translations = {
    en: {
      heading1: "How It",
      heading2: "Works",
      subtitle:
        "Our simple 4-step process ensures comprehensive diabetes risk monitoring for your child",

      automated: "Automated Process",

      cta: "Ready to protect your child's health?",
      trial: "Start Free Trial",

      steps: [
        {
          title: "Connect & Monitor",
          description:
            "Integrate wearable devices or manually input health data including glucose levels, activity, sleep, and dietary habits."
        },

        {
          title: "AI Analysis",
          description:
            "Our advanced AI analyzes patterns, detects anomalies, and identifies early warning signs of Type 1 diabetes risk."
        },

        {
          title: "Risk Assessment",
          description:
            "Get real-time risk classification (Low/Medium/High) with detailed insights and personalized health recommendations."
        },

        {
          title: "Alerts & Action",
          description:
            "Receive instant notifications during high-risk situations with actionable guidance for parents and healthcare providers."
        }
      ]
    },

    hi: {
      heading1: "यह कैसे",
      heading2: "काम करता है",

      subtitle:
        "हमारी आसान 4-स्टेप प्रक्रिया आपके बच्चे के लिए संपूर्ण डायबिटीज जोखिम निगरानी सुनिश्चित करती है",

      automated: "स्वचालित प्रक्रिया",

      cta: "क्या आप अपने बच्चे के स्वास्थ्य की सुरक्षा के लिए तैयार हैं?",
      trial: "फ्री ट्रायल शुरू करें",

      steps: [
        {
          title: "कनेक्ट और मॉनिटर",
          description:
            "वेयरेबल डिवाइस जोड़ें या ग्लूकोज स्तर, गतिविधि, नींद और खानपान की जानकारी मैन्युअली दर्ज करें।"
        },

        {
          title: "AI विश्लेषण",
          description:
            "हमारा उन्नत AI पैटर्न का विश्लेषण करता है, असामान्यताओं का पता लगाता है और शुरुआती चेतावनी संकेत पहचानता है।"
        },

        {
          title: "जोखिम मूल्यांकन",
          description:
            "विस्तृत जानकारी और व्यक्तिगत स्वास्थ्य सुझावों के साथ रियल-टाइम जोखिम वर्गीकरण प्राप्त करें।"
        },

        {
          title: "अलर्ट और कार्रवाई",
          description:
            "उच्च जोखिम की स्थिति में माता-पिता और डॉक्टरों के लिए तुरंत सूचनाएँ और मार्गदर्शन प्राप्त करें।"
        }
      ]
    },
    mr: mrHow,
  };

  const t = useT(translations);

  const steps = [
    {
      number: "01",
      title: t.steps[0].title,
      description: t.steps[0].description,
      icon: <Smartphone className="w-8 h-8" />,
      color: "blue"
    },

    {
      number: "02",
      title: t.steps[1].title,
      description: t.steps[1].description,
      icon: <BarChart3 className="w-8 h-8" />,
      color: "green"
    },

    {
      number: "03",
      title: t.steps[2].title,
      description: t.steps[2].description,
      icon: <Shield className="w-8 h-8" />,
      color: "purple"
    },

    {
      number: "04",
      title: t.steps[3].title,
      description: t.steps[3].description,
      icon: <Bell className="w-8 h-8" />,
      color: "blue"
    }
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-16">

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">

            {t.heading1}{" "}

            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {t.heading2}
            </span>

          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t.subtitle}
          </p>

        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">

          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200"></div>

          {steps.map((step, index) => (

            <div key={index} className="relative">

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all group">

                {/* Step Number */}
                <div
                  className={`absolute -top-4 -right-4 bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`bg-gradient-to-r from-${step.color}-100 to-${step.color}-50 w-16 h-16 rounded-xl flex items-center justify-center text-${step.color}-600 mb-4 group-hover:scale-110 transition-transform`}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>

                <p className="text-gray-600">
                  {step.description}
                </p>

                {/* Footer */}
                <div className="mt-4 flex items-center space-x-2 text-green-600">

                  <CheckCircle className="w-5 h-5" />

                  <span className="text-sm font-medium">
                    {t.automated}
                  </span>

                </div>

              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">

          <p className="text-gray-700 mb-6 text-lg">
            {t.cta}
          </p>

          <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all">
            {t.trial}
          </button>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
import React from 'react';
import {
  Shield,
  Activity,
  Bell,
  Users
} from 'lucide-react';

import { useT } from '../context/LanguageContext';
import { mrAbout } from '../locales/mr';

const AboutUs = () => {

  const translations = {
    en: {
      heading1: "About",
      heading2: "Smart HealthCare",

      subtitle:
        "We're addressing the rising prevalence of diabetes among children in India through innovative AI technology, continuous monitoring, and predictive healthcare analytics.",

      mission: "Our Mission",

      missionText:
        "To significantly improve disease management and reduce emergency complications in children through early risk identification, continuous monitoring, and predictive healthcare analytics. We believe every child deserves access to world-class healthcare technology.",

      features: [
        {
          title: "AI-Powered Detection",
          description:
            "Advanced machine learning algorithms analyze health patterns to detect early warning signs of Type 1 diabetes."
        },

        {
          title: "Real-Time Monitoring",
          description:
            "Continuous tracking of glucose levels, physical activity, sleep patterns, and dietary habits 24/7."
        },

        {
          title: "Smart Alerts",
          description:
            "Instant notifications to parents and healthcare providers when abnormal patterns are detected."
        },

        {
          title: "Family Support",
          description:
            "Multilingual interface supporting rural and urban populations across India with personalized care."
        }
      ]
    },

    hi: {
      heading1: "के बारे में",
      heading2: "स्मार्ट हेल्थकेयर",

      subtitle:
        "हम भारत में बच्चों के बीच बढ़ती डायबिटीज की समस्या को AI तकनीक, निरंतर निगरानी और प्रेडिक्टिव हेल्थकेयर एनालिटिक्स के माध्यम से हल कर रहे हैं।",

      mission: "हमारा मिशन",

      missionText:
        "बच्चों में बीमारी प्रबंधन को बेहतर बनाना और शुरुआती जोखिम पहचान, निरंतर निगरानी और प्रेडिक्टिव हेल्थकेयर एनालिटिक्स के माध्यम से आपातकालीन जटिलताओं को कम करना। हमारा मानना है कि हर बच्चे को विश्व स्तरीय स्वास्थ्य तकनीक मिलनी चाहिए।",

      features: [
        {
          title: "AI आधारित पहचान",
          description:
            "उन्नत मशीन लर्निंग एल्गोरिदम स्वास्थ्य पैटर्न का विश्लेषण करके टाइप 1 डायबिटीज के शुरुआती संकेत पहचानते हैं।"
        },

        {
          title: "रियल-टाइम मॉनिटरिंग",
          description:
            "ग्लूकोज स्तर, शारीरिक गतिविधि, नींद और खानपान की 24/7 निगरानी।"
        },

        {
          title: "स्मार्ट अलर्ट",
          description:
            "असामान्य पैटर्न मिलने पर माता-पिता और डॉक्टरों को तुरंत सूचना।"
        },

        {
          title: "परिवार सहायता",
          description:
            "भारत के ग्रामीण और शहरी क्षेत्रों के लिए बहुभाषी इंटरफेस और व्यक्तिगत देखभाल।"
        }
      ]
    },
    mr: mrAbout,
  };

  const t = useT(translations);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: t.features[0].title,
      description: t.features[0].description,
      color: "blue"
    },

    {
      icon: <Activity className="w-8 h-8" />,
      title: t.features[1].title,
      description: t.features[1].description,
      color: "green"
    },

    {
      icon: <Bell className="w-8 h-8" />,
      title: t.features[2].title,
      description: t.features[2].description,
      color: "purple"
    },

    {
      icon: <Users className="w-8 h-8" />,
      title: t.features[3].title,
      description: t.features[3].description,
      color: "blue"
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">

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

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {features.map((feature, index) => (

            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-2xl hover:shadow-xl transition-all group"
            >

              {/* Icon */}
              <div
                className={`bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600">
                {feature.description}
              </p>

            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 md:p-12 text-white">

          <div className="max-w-4xl mx-auto text-center">

            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {t.mission}
            </h3>

            <p className="text-lg opacity-90 leading-relaxed">
              {t.missionText}
            </p>

          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;
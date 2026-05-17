import React from 'react';
import { Heart } from 'lucide-react';

import { useT } from '../context/LanguageContext';
import { mrFooter } from '../locales/mr';

const Footer = () => {

  const translations = {
    en: {
      description:
        "AI-powered early diabetes risk monitoring for children across India.",

      quickLinks: "Quick Links",

      home: "Home",
      about: "About Us",
      how: "How It Works",
      contact: "Contact",

      resources: "Resources",

      docs: "Documentation",
      api: "API Reference",
      privacy: "Privacy Policy",
      terms: "Terms of Service",

      touch: "Get In Touch",

      copyright:
        "© 2026 Smart HealthCare. All rights reserved. Built for D1-PS2 Hackathon Theme: Smart HealthCare"
    },

    hi: {
      description:
        "भारत भर के बच्चों के लिए AI आधारित शुरुआती डायबिटीज जोखिम निगरानी।",

      quickLinks: "त्वरित लिंक",

      home: "होम",
      about: "हमारे बारे में",
      how: "यह कैसे काम करता है",
      contact: "संपर्क",

      resources: "संसाधन",

      docs: "डॉक्यूमेंटेशन",
      api: "API रेफरेंस",
      privacy: "गोपनीयता नीति",
      terms: "सेवा की शर्तें",

      touch: "संपर्क करें",

      copyright:
        "© 2026 स्मार्ट हेल्थकेयर। सर्वाधिकार सुरक्षित। D1-PS2 हैकाथॉन थीम: स्मार्ट हेल्थकेयर के लिए बनाया गया"
    },
    mr: mrFooter,
  };

  const t = useT(translations);

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>

            <div className="flex items-center space-x-2 mb-4">

              <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>

              <span className="text-xl font-bold">
                Smart HealthCare
              </span>

            </div>

            <p className="text-gray-400 text-sm">
              {t.description}
            </p>

          </div>

          {/* Quick Links */}
          <div>

            <h4 className="font-bold mb-4">
              {t.quickLinks}
            </h4>

            <ul className="space-y-2 text-gray-400">

              <li>
                <a
                  href="#home"
                  className="hover:text-white transition-colors"
                >
                  {t.home}
                </a>
              </li>

              <li>
                <a
                  href="#about"
                  className="hover:text-white transition-colors"
                >
                  {t.about}
                </a>
              </li>

              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  {t.how}
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  {t.contact}
                </a>
              </li>

            </ul>
          </div>

          {/* Resources */}
          <div>

            <h4 className="font-bold mb-4">
              {t.resources}
            </h4>

            <ul className="space-y-2 text-gray-400">

              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  {t.docs}
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  {t.api}
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  {t.privacy}
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  {t.terms}
                </a>
              </li>

            </ul>
          </div>

          {/* Contact */}
          <div>

            <h4 className="font-bold mb-4">
              {t.touch}
            </h4>

            <ul className="space-y-2 text-gray-400 text-sm">

              <li>
                📧 support@smarthealthcare.in
              </li>

              <li>
                📞 +91 1800-XXX-XXXX
              </li>

              <li>
                📍 Pimpri, Maharashtra, India
              </li>

            </ul>

            {/* Social Icons */}
            <div className="flex space-x-4 mt-4">

              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">f</span>
              </div>

              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                <span className="text-sm font-bold">t</span>
              </div>

              <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">in</span>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">

          <p>
            {t.copyright}
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
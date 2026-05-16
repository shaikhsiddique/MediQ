// Login.jsx

import React, { useState } from "react";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Heart,
  User,
  Stethoscope,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
import { authAPI } from "../services/api";
import { useUser } from "../context/UserContext";

function Login() {

  const { language } = useLanguage();

  const navigate = useNavigate();
  const { login } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [role, setRole] = useState("user");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const translations = {

    en: {
      title: "Welcome Back",
      subtitle: "Login to your Smart HealthCare account",

      email: "Email Address",
      password: "Password",

      login: "Login",

      noAccount: "Don't have an account?",
      signup: "Sign Up",

      user: "User",
      doctor: "Doctor",
    },

    hi: {
      title: "वापसी पर स्वागत है",
      subtitle: "अपने Smart HealthCare अकाउंट में लॉगिन करें",

      email: "ईमेल पता",
      password: "पासवर्ड",

      login: "लॉगिन",

      noAccount: "क्या आपका अकाउंट नहीं है?",
      signup: "साइन अप करें",

      user: "यूज़र",
      doctor: "डॉक्टर",
    },
  };

  const t = translations[language];

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isDoctor = role === "doctor";
      const data = isDoctor
        ? await authAPI.loginDoctor({
            email: formData.email,
            password: formData.password,
          })
        : await authAPI.loginPatient({
            email: formData.email,
            password: formData.password,
          });

      const userData = data.user || data.patient || data.doctor;
      const userRole = isDoctor ? "doctor" : "patient";

      login(userData, data.token, userRole);
      navigate(isDoctor ? "/doctor-dashboard" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100">

        {/* Logo */}
        <div className="flex flex-col items-center">

          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-2xl shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mt-5">
            {t.title}
          </h1>

          <p className="text-gray-500 mt-2 text-center">
            {t.subtitle}
          </p>
        </div>

        {/* Role Switch */}
        <div className="grid grid-cols-2 gap-3 mt-8">

          <button
            onClick={() => setRole("user")}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all ${
              role === "user"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700"
            }`}
          >

            <User className="w-5 h-5" />

            {t.user}

          </button>

          <button
            onClick={() => setRole("doctor")}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all ${
              role === "doctor"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700"
            }`}
          >

            <Stethoscope className="w-5 h-5" />

            {t.doctor}

          </button>

        </div>

        {error && (
          <p className="mt-6 text-center text-red-600 bg-red-50 py-3 px-4 rounded-2xl text-sm font-medium">
            {error}
          </p>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          {/* Email */}
          <div>

            <label className="text-sm font-medium text-gray-700">
              {t.email}
            </label>

            <div className="relative mt-2">

              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t.email}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"
              />

            </div>
          </div>

          {/* Password */}
          <div>

            <label className="text-sm font-medium text-gray-700">
              {t.password}
            </label>

            <div className="relative mt-2">

              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={t.password}
                className="w-full pl-12 pr-14 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >

                {
                  showPassword
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />
                }

              </button>

            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-60 disabled:hover:scale-100 ${
              role === "doctor"
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-gradient-to-r from-blue-500 to-cyan-600"
            }`}
          >
            {loading ? "..." : t.login}
          </button>

        </form>

        {/* Signup */}
        <div className="text-center mt-6">

          <p className="text-gray-500">

            {t.noAccount}{" "}

            <Link
              to="/signup"
              className="text-blue-600 font-semibold hover:underline"
            >
              {t.signup}
            </Link>

          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
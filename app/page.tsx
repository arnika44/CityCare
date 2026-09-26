"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageContext";

const languageCodes: Record<string, string> = {
  English: "en",
  Hindi: "hi",
  Marathi: "mr",
  Bengali: "bn",
  Tamil: "ta",
  Telugu: "te",
  Gujarati: "gu",
  Kannada: "kn",
  Malayalam: "ml",
  Punjabi: "pa",
  Odia: "or",
  Assamese: "as",
  Urdu: "ur",
};

export default function Home() {
  const { language, setLanguage } = useLanguage();

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);

    const languageCode = languageCodes[newLanguage];

    if (!languageCode) return;

    const tryTranslate = () => {
      const select = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement | null;

      if (!select) {
        setTimeout(tryTranslate, 300);
        return;
      }

      select.value = languageCode;
      select.dispatchEvent(new Event("change"));
    };

    tryTranslate();
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-4xl text-center">

        {/* Language Selection */}
        <div className="flex justify-end mb-6">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm outline-none"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी</option>
            <option value="Marathi">मराठी</option>
            <option value="Bengali">বাংলা</option>
            <option value="Tamil">தமிழ்</option>
            <option value="Telugu">తెలుగు</option>
            <option value="Gujarati">ગુજરાતી</option>
            <option value="Kannada">ಕನ್ನಡ</option>
            <option value="Malayalam">മലയാളം</option>
            <option value="Punjabi">ਪੰਜਾਬੀ</option>
            <option value="Odia">ଓଡ଼ିଆ</option>
            <option value="Assamese">অসমীয়া</option>
            <option value="Urdu">اردو</option>
          </select>
        </div>

        {/* Logo */}
        <h1 className="text-5xl font-bold text-blue-600">
          CityCare
        </h1>

        <p className="mt-4 text-xl text-gray-900">
          Smart Civic Complaint Management System
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-gray-900">
          How would you like to continue?
        </h2>

        {/* User Types */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">

          {/* Citizen */}
          <Link
            href="/citizen"
            className="rounded-2xl bg-white p-10 shadow-md border hover:shadow-xl transition"
          >
            <div className="text-5xl">👤</div>

            <h3 className="mt-5 text-2xl font-bold text-gray-900">
              Citizen
            </h3>

            <p className="mt-3 text-gray-900">
              Report civic problems, track complaints and give feedback.
            </p>

            <div className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white">
              Continue as Citizen
            </div>
          </Link>

          {/* Admin */}
          <Link
            href="/admin"
            className="rounded-2xl bg-white p-10 shadow-md border hover:shadow-xl transition"
          >
            <div className="text-5xl">🧑‍💼</div>

            <h3 className="mt-5 text-2xl font-bold text-gray-900">
              Admin
            </h3>

            <p className="mt-3 text-gray-900">
              Manage complaints, departments and city operations.
            </p>

            <div className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white">
              Continue as Admin
            </div>
          </Link>

        </div>
      </div>
    </main>
  );
}
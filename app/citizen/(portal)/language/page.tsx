"use client";

import { useLanguage } from "../../../LanguageContext";

const languages = [
  { name: "English", native: "English", code: "en" },
  { name: "Hindi", native: "हिंदी", code: "hi" },
  { name: "Marathi", native: "मराठी", code: "mr" },
  { name: "Bengali", native: "বাংলা", code: "bn" },
  { name: "Tamil", native: "தமிழ்", code: "ta" },
  { name: "Telugu", native: "తెలుగు", code: "te" },
  { name: "Gujarati", native: "ગુજરાતી", code: "gu" },
  { name: "Kannada", native: "ಕನ್ನಡ", code: "kn" },
  { name: "Malayalam", native: "മലയാളം", code: "ml" },
  { name: "Punjabi", native: "ਪੰਜਾਬੀ", code: "pa" },
  { name: "Odia", native: "ଓଡ଼ିଆ", code: "or" },
  { name: "Assamese", native: "অসমীয়া", code: "as" },
  { name: "Urdu", native: "اردو", code: "ur" },
];

export default function LanguagePage() {
  const { language, setLanguage } = useLanguage();

  const changeLanguage = (languageName: string) => {
    setLanguage(languageName);
  };

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Language
          </h2>

          <p className="mt-2 text-gray-700">
            Select your preferred language for the CityCare website.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-md">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-gray-700">
              Current Language
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              {languages.find((item) => item.name === language)?.native ||
                "English"}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900">
              Choose Language
            </h3>

            <p className="mt-1 text-gray-700">
              CityCare supports multiple Indian languages.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {languages.map((item) => {
              const selected = language === item.name;

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => changeLanguage(item.name)}
                  className={`rounded-xl border p-5 text-left transition ${
                    selected
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {item.native}
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {item.name}
                      </p>
                    </div>

                    {selected && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm text-gray-800">
              Your selected language will be saved and used across the
              CityCare website.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
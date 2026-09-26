"use client";

import Script from "next/script";

export default function GoogleTranslate() {
  return (
    <>
      <div
        id="google_translate_element"
        className="fixed -left-[9999px] -top-[9999px]"
      />

      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          window.googleTranslateElementInit = function () {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: "en",
                includedLanguages:
                  "hi,mr,bn,ta,te,gu,kn,ml,pa,or,as,ur,en",
                autoDisplay: false
              },
              "google_translate_element"
            );
          };
        `}
      </Script>
    </>
  );
}
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../public/locales/en.json";
import fr from "../public/locales/fr.json";

const resources = { en, fr };

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false
  }
});

// uncomment below to check for any missing translated text
// i18n.t = () => 'get the banana';

export default i18n;
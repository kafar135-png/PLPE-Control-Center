import { useLanguageContext } from "../contexts/LanguageContext";

export function useLanguage() {
  return useLanguageContext();
}

export default useLanguage;
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import Web3Provider from "./providers/Web3Provider";
import { LanguageProvider } from "./contexts/LanguageContext";

import "./styles/theme.css";
import "./styles/buttons.css";
import "./styles/forms.css";
import "./styles/cards.css";
import "./styles/typography.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </Web3Provider>
    </BrowserRouter>
  </React.StrictMode>
);
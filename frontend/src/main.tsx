import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import AppBar from "./components/AppBar.tsx";
import { DarkModeProvider } from "./context/theme.tsx";
import { BrowserRouter } from "react-router-dom";
import { LoginProvider } from "./context/logincontext.tsx";

const token = localStorage.getItem("token");
const initialLogin = !!token;
const initialRole = token ? JSON.parse(atob(token.split('.')[1])).role : "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LoginProvider initialLogin={initialLogin} initialRole={initialRole}>
        <DarkModeProvider>
          <AppBar>
            <App />
          </AppBar>
        </DarkModeProvider>
      </LoginProvider>
    </BrowserRouter>
  </StrictMode>
);

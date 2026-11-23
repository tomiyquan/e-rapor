import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { BerkasProvider } from "./state/BerkasContext";
import "./styles.css";

const akar = document.getElementById("root");
if (akar) {
  createRoot(akar).render(
    <StrictMode>
      <BerkasProvider>
        <App />
      </BerkasProvider>
    </StrictMode>,
  );
}

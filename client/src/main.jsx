import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store.js";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#1a1a1a", color: "#fff", border: "1px solid #c8a04f" },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

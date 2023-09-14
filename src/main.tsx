import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App.tsx";
import "./index.css";
import { attachReduxDevTools } from "@effector/redux-devtools-adapter";
import { RouterProvider } from "atomic-router-react";
import { router } from "./shared/config";
import { appStarted } from "./shared/config";

// attachReduxDevTools();

appStarted();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </React.StrictMode>
);

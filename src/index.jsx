/**
 * CRITICAL: React must be initialized first!
 * Import react-init.js BEFORE anything else to ensure React is available
 * when downstream modules try to import React.
 */
import './react-init.js';

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);

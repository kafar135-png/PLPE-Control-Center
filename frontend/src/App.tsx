import "./App.css";

import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";

import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import About from "./pages/About";
import HolderProfile from "./pages/HolderProfile";

function App() {
  return (
    <>
      <style>{`
        /* =====================================================
           PLPE OS — MOBILE LAYOUT
           ===================================================== */

        .app {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          min-height: 100vh !important;

          display: flex !important;
          flex-direction: row !important;

          overflow-x: hidden !important;
        }

        .app > .container {
          flex: 1 1 auto !important;
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;

          margin: 0 !important;
          padding: 0 !important;

          overflow-x: hidden !important;
        }

        @media screen and (max-width: 768px) {

          /* -------------------------------
             APP
             ------------------------------- */

          .app {
            display: flex !important;
            flex-direction: row !important;

            width: 100vw !important;
            max-width: 100vw !important;
            min-width: 0 !important;

            margin: 0 !important;
            padding: 0 !important;

            overflow-x: hidden !important;
          }

          /* -------------------------------
             SIDEBAR
             ------------------------------- */

          .app > :first-child {
            position: fixed !important;

            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;

            width: 72px !important;
            min-width: 72px !important;
            max-width: 72px !important;

            height: 100vh !important;

            margin: 0 !important;
            padding: 8px 5px !important;

            z-index: 9999 !important;

            overflow-x: hidden !important;
            overflow-y: auto !important;

            box-sizing: border-box !important;
          }

          /* Hide sidebar text on mobile */
          .app > :first-child span,
          .app > :first-child p,
          .app > :first-child small,
          .app > :first-child h1,
          .app > :first-child h2,
          .app > :first-child h3 {
            max-width: 100% !important;
          }

          /* Sidebar logo */
          .app > :first-child img {
            max-width: 54px !important;
            max-height: 54px !important;

            width: 54px !important;
            height: 54px !important;

            object-fit: contain !important;

            margin-left: auto !important;
            margin-right: auto !important;
          }

          /* Sidebar buttons / links */
          .app > :first-child a,
          .app > :first-child button {
            max-width: 100% !important;
            min-width: 0 !important;

            box-sizing: border-box !important;

            overflow: hidden !important;
          }

          /* -------------------------------
             MAIN CONTAINER
             ------------------------------- */

          .app > .container {
            width: calc(100vw - 72px) !important;
            min-width: 0 !important;
            max-width: calc(100vw - 72px) !important;

            margin-left: 72px !important;
            padding: 0 !important;

            box-sizing: border-box !important;

            overflow-x: hidden !important;
          }

          /* -------------------------------
             ALL CONTENT
             ------------------------------- */

          .app > .container > * {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;

            box-sizing: border-box !important;

            overflow-x: hidden !important;
          }

          /* -------------------------------
             COMMON PAGE WRAPPERS
             ------------------------------- */

          .app .page,
          .app .dashboard,
          .app .analytics,
          .app .holder-profile,
          .app .about {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;

            margin-left: 0 !important;
            margin-right: 0 !important;

            box-sizing: border-box !important;

            overflow-x: hidden !important;
          }

          /* -------------------------------
             GRIDS
             ------------------------------- */

          .app .dashboard,
          .app .analytics,
          .app .profile-grid,
          .app .dashboard-grid,
          .app .analytics-grid,
          .app .stats-grid {
            min-width: 0 !important;
            max-width: 100% !important;
          }

          /* -------------------------------
             CARDS
             ------------------------------- */

          .app .card,
          .app .profile-card,
          .app .stat-card {
            min-width: 0 !important;
            max-width: 100% !important;

            box-sizing: border-box !important;

            overflow: hidden !important;
          }

          /* -------------------------------
             TABLES
             ------------------------------- */

          .app table {
            max-width: 100% !important;
          }

          .app .table-container,
          .app .table-wrapper {
            max-width: 100% !important;
            overflow-x: auto !important;
          }

          /* -------------------------------
             CHARTS
             ------------------------------- */

          .app .portfolio-chart,
          .app .chart,
          .app .chart-container,
          .app .chart-area {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;

            box-sizing: border-box !important;

            overflow: hidden !important;
          }

          /* -------------------------------
             IMAGES
             ------------------------------- */

          .app img {
            max-width: 100% !important;
          }

          /* -------------------------------
             LONG TEXT
             ------------------------------- */

          .app h1,
          .app h2,
          .app h3,
          .app p,
          .app span,
          .app div {
            min-width: 0;
          }

          .app code,
          .app pre {
            max-width: 100% !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }
        }

        /* =====================================================
           SMALL PHONES
           ===================================================== */

        @media screen and (max-width: 480px) {

          .app > :first-child {
            width: 64px !important;
            min-width: 64px !important;
            max-width: 64px !important;
          }

          .app > .container {
            width: calc(100vw - 64px) !important;
            max-width: calc(100vw - 64px) !important;

            margin-left: 64px !important;
          }

          .app > :first-child img {
            width: 48px !important;
            height: 48px !important;
          }
        }
      `}</style>

      <div className="app">
        <Sidebar />

        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/analytics" element={<Analytics />} />

            <Route path="/holder" element={<HolderProfile />} />

            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
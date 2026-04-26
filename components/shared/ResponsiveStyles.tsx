export default function ResponsiveStyles() {
  return (
    <style>{`
      /* Common Nav Layout */
      .app-nav-inner { display:flex; align-items:center; justify-content:space-between; padding:0 1.75rem; height:60px; }
      .app-nav-links { display:flex; align-items:center; gap:0.75rem; }
      .app-nav-hamburger { display:none; background:none; border:none; color:var(--text-primary); cursor:pointer; padding:6px; }
      .app-mobile-menu { display:none; }

      /* Modals */
      .dash-modal-wrap { background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:1rem; position:absolute; right:10px; top:65px; z-index:20; flex-direction:column; gap:0.75rem; box-shadow:var(--shadow-lg); }

      /* Dashboard Grid */
      .dashboard-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2.5rem; }
      
      /* Profile Grid */
      .profile-grid { display:grid; grid-template-columns:280px 1fr; gap:2rem; align-items:start; }

      /* Room Top Bar */
      .room-topbar-left { display:flex; alignItems:center; gap:16px; }
      .room-topbar-center { display:flex; alignItems:center; gap:12px; }
      .room-topbar-right { display:flex; alignItems:center; gap:8px; }
      
      /* Room Participant Grid */
      .room-participant-grid { flex:1; display:grid; gap:8px; padding:12px; overflow:hidden; }

      /* Room Toolbar */
      .room-toolbar-inner { height:72px; display:flex; align-items:center; justify-content:center; gap:10px; border-top:1px solid var(--border-subtle); background:var(--bg-surface); padding: 0 1.5rem; flex-shrink:0; overflow:visible; }

      /* Room AI Sidebar */
      .room-ai-sidebar { width:320px; border-left:1px solid var(--border-subtle); background:var(--bg-surface); display:flex; flex-direction:column; flex-shrink:0; animation:fadeIn 0.25s ease; position:relative; z-index:10; }

      /* Medium Screens (< 1024px) */
      @media (max-width: 1023px) {
        .profile-grid { grid-template-columns: 240px 1fr; gap: 1.5rem; }
      }

      /* Tablet / Small Screens (< 768px) */
      @media (max-width: 767px) {
        /* Globals */
        body { font-size: 15px; }
        
        /* App Navs */
        .app-nav-inner { padding: 0 1.25rem; }
        .app-nav-links { display: none; }
        .app-nav-hamburger { display: flex; align-items: center; border:1px solid var(--border-default); border-radius:var(--radius-md); }
        
        .app-mobile-menu {
          display: flex; flex-direction: column; gap: 0;
          background: var(--bg-surface);
          padding: 0.5rem 1.25rem 1rem;
          position: absolute; top: 60px; left: 0; right: 0; z-index: 50;
          max-height: 400px; opacity: 1; overflow: hidden;
          border-bottom: 1px solid var(--border-subtle);
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, padding 0.3s ease;
        }
        .app-mobile-menu.closed { 
          max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; 
          border-bottom-color: transparent; pointer-events: none;
        }
        .app-mobile-link {
          display:flex; align-items:center; gap:8px;
          padding: 0.875rem 0; border-bottom: 1px solid var(--border-subtle);
          color: var(--text-secondary); font-size: 0.95rem; font-family: var(--font-sans); text-decoration: none;
        }
        .app-mobile-link:last-of-type { border-bottom: none; }

        /* Dashboard specific */
        .dashboard-grid { grid-template-columns: 1fr; }
        .dashboard-main { padding: 1.5rem 1.25rem; }
        
        /* Profile specific */
        .profile-grid { grid-template-columns: 1fr; }
        .profile-left-panel { position: static !important; }
        .profile-main { padding: 1.5rem 1.25rem; }

        /* Room specific */
        .room-topbar-inner { padding:0 0.8rem !important; }
        .room-topbar-title { display: none; } /* Hide 'Sona' mark */
        .room-param-labels { display: none; } /* Hide 'LIVE' text, show dot */
        
        .prejoin-lobby-grid {
          grid-template-columns: 1fr !important;
          gap: 1.5rem !important;
        }

        /* Force single column for video feeds on mobile */
        .room-participant-grid { grid-template-columns: 1fr !important; grid-template-rows: auto !important; }

        /* Slide-up / slide-over mobile drawer for AI Sidebar */
        @keyframes slideInMobile {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .room-ai-sidebar {
          position: absolute;
          top: 0; bottom: 0; right: 0;
          width: 100%;
          max-width: 400px;
          z-index: 50;
          box-shadow: -10px 0 40px rgba(0,0,0,0.8);
          animation: slideInMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }
      }

      /* Extra Small Mobile (< 480px) */
      @media (max-width: 479px) {
        .dashboard-main { padding: 1.25rem 1rem; }
        .profile-main { padding: 1.25rem 1rem; }
        .room-topbar-center { gap: 6px; }
        .room-toolbar-inner { padding: 0 0.5rem; gap: 6px; }
      }

      /* ── Board Tool Palette responsive ────────────────────────── */
      @media (max-width: 767px) {
        .board-tool-palette {
          bottom: 80px !important;
          padding: 6px 10px !important;
          gap: 4px !important;
          border-radius: 12px !important;
          max-width: calc(100vw - 24px);
          overflow-x: auto;
        }
        .board-canvas-wrap {
          touch-action: none;
        }
      }
      @media (max-width: 479px) {
        .board-tool-palette {
          bottom: 76px !important;
          padding: 5px 8px !important;
          gap: 3px !important;
        }
      }
    `}</style>
  );
}

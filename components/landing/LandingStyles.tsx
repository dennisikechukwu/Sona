/* All responsive CSS for the landing page. Edit breakpoints and layout rules here. */
export default function LandingStyles() {
  return (
    <style>{`
      /* NAV */
      .nav-inner      { display:flex; align-items:center; justify-content:space-between; padding:0 2.5rem; height:64px; }
      .nav-links      { display:flex; align-items:center; gap:2rem; }
      .nav-cta        { display:flex; align-items:center; gap:1rem; }
      .nav-hamburger  { display:none; background:none; border:none; color:var(--text-primary); cursor:pointer; padding:6px; }
      .mobile-menu    { display:none; }

      /* HERO */
      .hero-section   { padding:7rem 1.5rem 5rem; }
      .hero-pill      { display:inline-flex; align-items:center; flex-wrap:wrap; gap:10px; }

      /* APP PREVIEW */
      .preview-wrap       { height:520px; display:flex; }
      .preview-sidebar    { width:296px; border-left:1px solid var(--border-subtle); background:var(--bg-base); display:flex; flex-direction:column; flex-shrink:0; }
      .preview-video-grid { flex:1; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:6px; padding:10px; background:#06080c; }

      /* WHAT IS SONA */
      .what-grid { display:grid; grid-template-columns:1fr 1fr; gap:5rem; align-items:center; max-width:1100px; margin:0 auto; }
      .what-img  { order:0; }

      /* PROBLEM / SOLUTION */
      .ps-grid  { display:grid; grid-template-columns:1fr auto 1fr; gap:1.5rem; align-items:start; }
      .ps-arrow { display:flex; align-items:center; justify-content:center; padding-top:3rem; }

      /* HOW IT WORKS */
      .step-row { display:grid; grid-template-columns:60px 1fr 180px; gap:1.5rem; align-items:center; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:1.75rem 2rem; transition:border-color 0.2s; }
      .step-img { display:block; width:100%; height:110px; object-fit:cover; object-position:center; border-radius:var(--radius-md); flex-shrink:0; }

      /* PRICING */
      .pricing-grid    { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; }
      .pricing-featured { transform:scale(1.03); }

      /* FOOTER */
      .footer-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; padding:2rem 2.5rem; }
      .footer-links { display:flex; gap:1.5rem; }

      /* SPIN */
      @keyframes spin { to { transform:rotate(360deg); } }

      /* ── LARGE (< 1280px) ── */
      @media (max-width:1279px) {
        .what-grid { gap:3rem; }
      }

      /* ── MEDIUM-LARGE (< 1024px) ── */
      @media (max-width:1023px) {
        .preview-sidebar  { display:none; }
        .preview-wrap     { height:380px; }
        .pricing-grid     { grid-template-columns:1fr 1fr; }
        .pricing-featured { transform:none; }
      }

      /* ── TABLET (< 768px) ── */
      @media (max-width:767px) {
        .nav-inner     { padding:0 1.25rem; }
        .nav-links     { display:none; }
        .nav-cta-start { display:none; }
        .nav-hamburger { display:flex; align-items:center; }
        .mobile-menu   {
          display:flex; flex-direction:column; gap:0;
          background:var(--bg-surface);
          padding:0.5rem 1.25rem 1rem;
          max-height:400px; opacity:1; overflow:hidden;
          border-bottom:1px solid var(--border-subtle);
          transition:max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, padding 0.3s ease;
        }
        .mobile-menu.closed { 
          max-height:0; opacity:0; padding-top:0; padding-bottom:0; 
          border-bottom-color:transparent; pointer-events:none;
        }
        .mobile-menu-link {
          display:block; padding:0.875rem 0; border-bottom:1px solid var(--border-subtle);
          color:var(--text-secondary); font-size:0.95rem;
          font-family:var(--font-sans); text-decoration:none;
        }
        .mobile-menu-link:last-of-type { border-bottom:none; }
        .mobile-menu-btn {
          margin-top:0.875rem; width:100%; background:var(--accent); color:#000;
          border:none; border-radius:var(--radius-md); padding:0.85rem;
          font-family:var(--font-sans); font-size:0.95rem; font-weight:700; cursor:pointer;
        }

        .hero-section  { padding:5rem 1.25rem 3.5rem; }

        .preview-wrap  { height:260px; }
        .preview-video-grid { grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; }

        .what-grid     { grid-template-columns:1fr; gap:2.5rem; }
        .what-img      { order:-1; }

        .ps-grid       { grid-template-columns:1fr; }
        .ps-arrow      { display:none; }

        .step-row      { grid-template-columns:48px 1fr; padding:1.25rem; }
        .step-img      { display:none; }

        .pricing-grid        { grid-template-columns:1fr; max-width:420px; margin:0 auto; }
        .pricing-featured    { transform:none; }

        .footer-inner  { flex-direction:column; align-items:flex-start; padding:1.5rem 1.25rem; gap:1.25rem; }
        .footer-links  { flex-wrap:wrap; gap:1rem; }
      }

      /* ── MOBILE (< 480px) ── */
      @media (max-width:479px) {
        .hero-section       { padding:4rem 1rem 3rem; }
        .preview-wrap       { height:200px; }
        .preview-video-grid { gap:4px; padding:6px; }
        .step-row           { grid-template-columns:40px 1fr; padding:1rem; gap:0.875rem; }
        .footer-inner       { padding:1.25rem 1rem; }
      }

      /* ── VERY SMALL (< 360px) ── */
      @media (max-width:359px) {
        .hero-section { padding:3.5rem 0.875rem 2.5rem; }
        .nav-inner    { padding:0 1rem; }
      }
    `}</style>
  );
}

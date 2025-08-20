import React, { useEffect, useRef } from "react";

// Default export: a full-screen scene with animated stars, glitch title,
// scanlines, noise bursts, shooting stars, and a drifting sun image.
// Drop this into a React app and ensure the image exists at /images/sun.png
// (or change the src below). Tailwind is optional here; custom CSS covers
// the visual effects.

export default function GalacticCarnivalSunDrift() {
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const noiseRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let rafId = 0;
    let w = 0,
      h = 0,
      t = 0;
    let mouseX = 0,
      mouseY = 0;
    let stars = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.max(120, Math.floor((w * h) / 1800));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 2 + 0.3,
        r: Math.random() * 1.6 + 0.2,
        tw: Math.random() * Math.PI * 2,
        vx: Math.random() * 0.2 + 0.05,
      }));
    }

    function onMouseMove(e) {
      mouseX = e.clientX / w - 0.5;
      mouseY = e.clientY / h - 0.5;
    }

    function frame() {
      t += 1 / 60;
      ctx.clearRect(0, 0, w, h);

      // Nebula backdrop
      const neb = ctx.createRadialGradient(
        w * 0.2,
        h * 0.25,
        0,
        w * 0.2,
        h * 0.25,
        Math.max(w, h)
      );
      neb.addColorStop(0, "rgba(20,0,60,0.35)");
      neb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const s of stars) {
        const drift = s.vx / (s.z * 0.7 + 0.3);
        s.x -= drift;
        s.y += Math.sin(t * 0.5 + s.x * 0.01) * 0.02 * (3 - s.z);
        if (s.x < -5) {
          s.x = w + 5;
          s.y = (s.y + Math.random() * 40 - 20 + h) % h;
        }
        s.tw += 0.03 + s.z * 0.015;
        const a = 0.6 + Math.sin(s.tw) * 0.4;
        const px = s.x + mouseX * 8 * (2.5 - s.z);
        const py = s.y + mouseY * 6 * (2.5 - s.z);
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    resize();
    rafId = requestAnimationFrame(frame);

    // Glitch + noise zaps
    const titleEl = titleRef.current;
    const noiseEl = noiseRef.current;

    let zapTimeout = 0;
    const doZap = () => {
      if (titleEl) titleEl.classList.add("zap");
      if (noiseEl) noiseEl.classList.add("show");
      setTimeout(() => {
        if (titleEl) titleEl.classList.remove("zap");
        if (noiseEl) noiseEl.classList.remove("show");
      }, 220);
    };

    const schedule = () => {
      zapTimeout = window.setTimeout(() => {
        const bursts = 1 + Math.floor(Math.random() * 3);
        let i = 0;
        const chain = () => {
          doZap();
          if (++i < bursts) setTimeout(chain, 120 + Math.random() * 220);
        };
        chain();
        schedule();
      }, 900 + Math.random() * 4500);
    };
    schedule();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      clearTimeout(zapTimeout);
    };
  }, []);

  return (
    <div className="gc-root">
      {/* Stage & animated stars */}
      <div className="stage" aria-hidden>
        <canvas id="stars" ref={canvasRef} />
      </div>

      {/* Noise & scanlines overlays */}
      <div className="noise" id="noise" ref={noiseRef} />
      <div className="scan" aria-hidden="true" />

      {/* HUD chips */}
      <div className="hud">
        <div className="chip">Galactic Carnival</div>
        <div className="chip">FX: ON</div>
      </div>

      {/* Title */}
      <div className="title">
        <div>
          <h1 className="glitch" data-text="GALACTIC CARNIVAL" ref={titleRef}>
            <span>GALACTIC</span> <span>CARNIVAL</span>
          </h1>
          <div className="subtitle">now with a living sky behind it ✦</div>
        </div>
      </div>

      {/* Shooting stars */}
      <div className="shoot" />
      <div className="shoot" />
      <div className="shoot" />

      {/* Drifting sun image */}
      <img src="/images/sun.png" id="sun" alt="Sun" />

      {/* Styles (scoped globally for simplicity) */}
      <style>{`
        :root{
          --bg1:#020015; --bg2:#0b0030; --neon:#76fffb; --mag:#ff2bd6;
        }
        *{box-sizing:border-box}
        html,body,#root,.gc-root{height:100%;}
        body{margin:0}
        .gc-root{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial; color:#fff; background: radial-gradient(120vw 120vh at 15% 20%, var(--bg2), #000 65%), radial-gradient(120vw 120vh at 85% 80%, #14002a, #000 65%), #000; overflow:hidden}

        .stage{position:fixed; inset:0; overflow:hidden; z-index:0}
        canvas#stars{position:absolute; inset:0; display:block}

        .title{position:fixed; inset:0; display:grid; place-items:center; z-index:2; text-align:center; filter:drop-shadow(0 0 12px rgba(118,255,251,.6)) drop-shadow(0 0 48px rgba(118,255,251,.35))}
        h1{font-size:clamp(40px,11vw,160px); line-height:.9; margin:0; letter-spacing:-.02em}
        .glitch{position:relative; color:var(--neon)}
        .glitch::before,.glitch::after{content:attr(data-text); position:absolute; inset:0; mix-blend-mode:screen}
        .glitch::before{left:2px; top:-2px; color:var(--mag); clip-path: polygon(0 2%, 100% 0, 100% 30%, 0 32%)}
        .glitch::after{left:-2px; top:2px; color:#8ef; clip-path: polygon(0 60%, 100% 58%, 100% 100%, 0 100%)}
        @keyframes glitchy{0%,100%{transform:translate(0,0)} 14%{transform:translate(1px,-1px)} 28%{transform:translate(-2px,2px)} 42%{transform:translate(3px,1px)} 56%{transform:translate(-3px,-2px)} 70%{transform:skewX(2deg)} 84%{transform:skewX(-2deg)}}
        .glitch{animation:glitchy 3s infinite steps(10)}
        .subtitle{margin-top:12px; font-size:clamp(14px, 2vw, 24px); opacity:.9; letter-spacing:.2em; text-transform:uppercase}

        .hud{position:fixed; top:10px; left:10px; display:flex; gap:.5rem; z-index:3}
        .chip{background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.15); padding:8px 12px; border-radius:999px; letter-spacing:.08em; text-transform:uppercase; font-size:12px; backdrop-filter: blur(8px)}

        .noise{position:fixed; inset:0; z-index:1; pointer-events:none; opacity:0; mix-blend-mode:screen; transition:opacity 60ms ease}
        .noise::before{content:""; position:absolute; inset:-10%; background:
          repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px),
          radial-gradient(200px 100px at 20% 20%, rgba(255,255,255,.05), transparent 60%),
          radial-gradient(300px 120px at 80% 60%, rgba(255,255,255,.05), transparent 60%);
          filter:contrast(120%)}
        .noise.show{opacity:.22}

        .scan{position:fixed; inset:0; z-index:1; pointer-events:none; background: repeating-linear-gradient(180deg, rgba(255,255,255,.04) 0 2px, transparent 2px 4px); opacity:.06; animation:scanMove 6s linear infinite}
        @keyframes scanMove{from{background-position:0 -200vh} to{background-position:0 200vh}}

        .shoot{position:fixed; top:-10vh; left:-10vw; width:2px; height:2px; background:linear-gradient(90deg, #fff, transparent); opacity:.8; transform:rotate(20deg); filter:drop-shadow(0 0 4px #fff)}
        .shoot:nth-child(1){animation:fall 6s linear infinite}
        .shoot:nth-child(2){animation:fall 7.5s linear infinite .9s}
        .shoot:nth-child(3){animation:fall 9s linear infinite 1.8s}
        @keyframes fall{from{transform:translate(-10vw,-10vh) rotate(20deg)} to{transform:translate(110vw,110vh) rotate(20deg)}}

        #sun{position:fixed; top:50%; left:110%; width:400px; height:auto; transform:translateY(-50%); z-index:1; filter:drop-shadow(0 0 60px rgba(255,230,150,.95)) drop-shadow(0 0 120px rgba(255,200,100,.8)) drop-shadow(0 0 200px rgba(255,160,60,.6)); animation: driftSun 60s linear infinite;}
        @keyframes driftSun{0%{left:110%;} 100%{left:-600px;}}
      `}</style>
    </div>
  );
}

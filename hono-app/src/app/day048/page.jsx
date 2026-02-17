'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────
const W = 800;
const H = 600;
const CX = W / 2;
const CY = H / 2;
const SERVER_R = 38;
const VPN_R = 155;
const PATCH_SPEED = 3.5; // progress per frame while holding

// ─── Helpers ─────────────────────────────────────────────────────────────────
function angleDiff(a, b) {
  // Shortest angular distance, always positive
  let d = Math.abs(a - b) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

function normalizeAngle(a) {
  a = a % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;
  return a;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function VpnDefender() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  // All mutable game state lives in a single ref object to avoid stale closures
  const gRef = useRef({
    state: 'START',   // 'START' | 'PLAYING' | 'GAME_OVER'
    frame: 0,
    score: 0,
    integrity: 100,
    enemies: [],
    vulns: [],
    particles: [],
    mouseDown: false,
    mx: 0,           // canvas-space mouse x
    my: 0,
    idCounter: 0,
    flashAlpha: 0,
  });

  // React display state (updated from RAF loop at low frequency)
  const [displayState, setDisplayState] = useState('START');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayIntegrity, setDisplayIntegrity] = useState(100);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [displayFinalScore, setDisplayFinalScore] = useState(0);

  // ── Game Reset ────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const g = gRef.current;
    g.state = 'PLAYING';
    g.frame = 0;
    g.score = 0;
    g.integrity = 100;
    g.enemies = [];
    g.vulns = [];
    g.particles = [];
    g.flashAlpha = 0;
    g.idCounter = 0;
    setDisplayState('PLAYING');
    setDisplayScore(0);
    setDisplayIntegrity(100);
    setDisplayLevel(1);
  }, []);

  // ── Canvas Mouse Handlers ─────────────────────────────────────────────────
  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Scale from CSS pixels to canvas pixels
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    const pos = getCanvasPos(e);
    gRef.current.mouseDown = true;
    gRef.current.mx = pos.x;
    gRef.current.my = pos.y;
  }, [getCanvasPos]);

  const handleMouseUp = useCallback(() => {
    gRef.current.mouseDown = false;
  }, []);

  const handleMouseMove = useCallback((e) => {
    const pos = getCanvasPos(e);
    gRef.current.mx = pos.x;
    gRef.current.my = pos.y;
  }, [getCanvasPos]);

  // Touch support
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(touch);
    gRef.current.mouseDown = true;
    gRef.current.mx = pos.x;
    gRef.current.my = pos.y;
  }, [getCanvasPos]);

  const handleTouchEnd = useCallback(() => {
    gRef.current.mouseDown = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(touch);
    gRef.current.mx = pos.x;
    gRef.current.my = pos.y;
  }, [getCanvasPos]);

  // ── Main Game Loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tick = () => {
      const g = gRef.current;
      rafRef.current = requestAnimationFrame(tick);

      if (g.state !== 'PLAYING') {
        // Still draw the start/gameover screen background pulse
        drawBackground(ctx, g);
        return;
      }

      g.frame++;
      const level = Math.floor(g.score / 600) + 1;
      const spawnRate = Math.max(18, 60 - level * 5);
      const vulnRate  = Math.max(70, 200 - level * 12);
      const enemySpeed = 1.4 + level * 0.18;

      // ── Spawn Enemies ─────────────────────────────────────────────────
      if (g.frame % spawnRate === 0) {
        const angle = Math.random() * Math.PI * 2;
        // Spawn just outside canvas diagonal
        const spawnDist = Math.hypot(W, H) * 0.55;
        g.idCounter++;
        g.enemies.push({
          id: g.idCounter,
          x: CX + Math.cos(angle) * spawnDist,
          y: CY + Math.sin(angle) * spawnDist,
          // angle toward center: angle + PI would be wrong — the vector toward
          // center is simply the reverse of the spawn direction
          dirAngle: angle + Math.PI,  // direction of travel
          spawnAngle: angle,          // original angle from center
          speed: enemySpeed + (Math.random() - 0.5) * 0.4,
          active: true,
          trail: [],
        });
      }

      // ── Spawn Vulnerabilities ──────────────────────────────────────────
      if (g.frame % vulnRate === 0 && g.vulns.length < 5) {
        // Try to place gap away from existing ones
        let attempts = 0, angle;
        do {
          angle = Math.random() * Math.PI * 2;
          attempts++;
        } while (
          attempts < 20 &&
          g.vulns.some(v => angleDiff(v.angle, angle) < Math.PI / 2)
        );

        g.idCounter++;
        g.vulns.push({
          id: g.idCounter,
          angle: normalizeAngle(angle),
          width: Math.PI / 3,       // 60° gap
          patchProgress: 0,
          isPatching: false,
          age: 0,
        });
      }

      // ── Update Vulnerabilities ─────────────────────────────────────────
      // Determine if mouse is on VPN ring
      const mdx = g.mx - CX;
      const mdy = g.my - CY;
      const mouseDist = Math.hypot(mdx, mdy);
      const mouseOnRing = mouseDist > VPN_R - 35 && mouseDist < VPN_R + 35;
      const mouseAngle = normalizeAngle(Math.atan2(mdy, mdx));

      g.vulns.forEach(v => {
        v.age++;
        v.isPatching = false;
        if (g.mouseDown && mouseOnRing) {
          const d = angleDiff(mouseAngle, v.angle);
          if (d < v.width / 2) {
            v.patchProgress = Math.min(100, v.patchProgress + PATCH_SPEED);
            v.isPatching = true;
          }
        }
      });
      // Remove fully patched
      g.vulns = g.vulns.filter(v => {
        if (v.patchProgress >= 100) {
          // Spawn patch particles
          for (let i = 0; i < 12; i++) {
            const a = v.angle + (Math.random() - 0.5) * v.width;
            g.particles.push({
              x: CX + Math.cos(a) * VPN_R,
              y: CY + Math.sin(a) * VPN_R,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              life: 1,
              color: '#00aaff',
            });
          }
          return false;
        }
        return true;
      });

      // ── Update Enemies ─────────────────────────────────────────────────
      g.enemies.forEach(enemy => {
        if (!enemy.active) return;

        // Move toward center
        const toCenter = Math.atan2(CY - enemy.y, CX - enemy.x);
        enemy.x += Math.cos(toCenter) * enemy.speed;
        enemy.y += Math.sin(toCenter) * enemy.speed;

        // Save trail
        enemy.trail.push({ x: enemy.x, y: enemy.y });
        if (enemy.trail.length > 8) enemy.trail.shift();

        const dist = Math.hypot(enemy.x - CX, enemy.y - CY);

        // ── VPN ring collision ─────────────────────────────────────────
        if (dist <= VPN_R + 6 && dist >= VPN_R - 6) {
          const eAngle = normalizeAngle(Math.atan2(enemy.y - CY, enemy.x - CX));
          let passesThrough = false;

          for (const vuln of g.vulns) {
            if (angleDiff(eAngle, vuln.angle) < vuln.width / 2) {
              passesThrough = true;
              break;
            }
          }

          if (!passesThrough) {
            // Blocked — spawn block particles
            for (let i = 0; i < 6; i++) {
              g.particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: '#00ff88',
              });
            }
            g.score += 5;
            enemy.active = false;
          }
        }

        // ── Server collision ───────────────────────────────────────────
        if (dist < SERVER_R + 6) {
          enemy.active = false;
          g.integrity = Math.max(0, g.integrity - 10);
          g.flashAlpha = 1.0;

          // Spawn damage particles
          for (let i = 0; i < 16; i++) {
            g.particles.push({
              x: CX,
              y: CY,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 1,
              color: '#ff3333',
            });
          }
        }
      });
      g.enemies = g.enemies.filter(e => e.active);

      // ── Update Particles ───────────────────────────────────────────────
      g.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.life -= 0.04;
      });
      g.particles = g.particles.filter(p => p.life > 0);

      // ── Score (passive) ────────────────────────────────────────────────
      if (g.frame % 60 === 0) g.score += 10;

      // ── Flash decay ────────────────────────────────────────────────────
      g.flashAlpha = Math.max(0, g.flashAlpha - 0.06);

      // ── Game Over check ────────────────────────────────────────────────
      if (g.integrity <= 0) {
        g.state = 'GAME_OVER';
        setDisplayFinalScore(g.score);
        setDisplayState('GAME_OVER');
      }

      // ── React state sync (every 10 frames) ────────────────────────────
      if (g.frame % 10 === 0) {
        setDisplayScore(g.score);
        setDisplayIntegrity(g.integrity);
        setDisplayLevel(level);
      }

      // ── Draw ──────────────────────────────────────────────────────────
      draw(ctx, g, level);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // Only run once — all state via gRef

  // ── Draw Functions ────────────────────────────────────────────────────────
  function drawBackground(ctx, g) {
    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, W, H);

    // Subtle animated grid
    const t = Date.now() / 8000;
    ctx.save();
    ctx.strokeStyle = 'rgba(0,200,100,0.07)';
    ctx.lineWidth = 1;
    const GRID = 40;
    for (let x = 0; x < W; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    // Subtle scanlines
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, y, W, 2);
    }
  }

  function draw(ctx, g, level) {
    // Background
    drawBackground(ctx, g);

    // ── Outer glow ring (ambiance) ──────────────────────────────────────
    const grad = ctx.createRadialGradient(CX, CY, VPN_R - 20, CX, CY, VPN_R + 40);
    grad.addColorStop(0, 'rgba(0,255,100,0.05)');
    grad.addColorStop(1, 'rgba(0,255,100,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(CX, CY, VPN_R + 40, 0, Math.PI * 2);
    ctx.fill();

    // ── VPN Ring ───────────────────────────────────────────────────────
    // Build a clip/segment drawing: draw full ring in green, then overlay vuln arcs
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, VPN_R, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff77';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00ff77';
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.restore();

    // ── Vulnerabilities ────────────────────────────────────────────────
    g.vulns.forEach(v => {
      // Pulsing red gap
      const pulse = 0.6 + 0.4 * Math.sin(g.frame * 0.15 + v.id);

      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, VPN_R, v.angle - v.width / 2, v.angle + v.width / 2);
      ctx.strokeStyle = `rgba(255, 30, 60, ${pulse})`;
      ctx.lineWidth = 10;
      ctx.shadowBlur = 20 * pulse;
      ctx.shadowColor = '#ff1e3c';
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Patch progress overlay (blue)
      if (v.patchProgress > 0) {
        const frac = v.patchProgress / 100;
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          CX, CY, VPN_R,
          v.angle - (v.width / 2) * frac,
          v.angle + (v.width / 2) * frac
        );
        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 10;
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#00aaff';
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Small percent label
        ctx.save();
        ctx.fillStyle = '#00aaff';
        ctx.font = 'bold 11px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelR = VPN_R + 22;
        ctx.fillText(
          `${Math.floor(v.patchProgress)}%`,
          CX + Math.cos(v.angle) * labelR,
          CY + Math.sin(v.angle) * labelR
        );
        ctx.restore();
      }

      // Danger warning icon above gap
      const warnR = VPN_R + 18;
      ctx.save();
      ctx.font = `${14 + 3 * Math.sin(g.frame * 0.2)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        '⚠',
        CX + Math.cos(v.angle) * warnR,
        CY + Math.sin(v.angle) * warnR
      );
      ctx.restore();
    });

    // ── Particles ──────────────────────────────────────────────────────
    g.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // ── Enemies ────────────────────────────────────────────────────────
    g.enemies.forEach(enemy => {
      // Trail
      enemy.trail.forEach((pt, i) => {
        const alpha = (i / enemy.trail.length) * 0.5;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ff2244';
        ctx.fill();
        ctx.restore();
      });

      // Enemy body
      ctx.save();
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ff2244';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff0033';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ff8899';
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // ── Server ─────────────────────────────────────────────────────────
    const integ = g.integrity;
    const serverColor = integ > 60 ? '#00ccff' : integ > 25 ? '#ffaa00' : '#ff3333';
    const serverGlow  = integ > 60 ? '#00ccff' : integ > 25 ? '#ff8800' : '#ff0000';

    // Server glow
    const sg = ctx.createRadialGradient(CX, CY, 0, CX, CY, SERVER_R + 20);
    sg.addColorStop(0, serverColor + '55');
    sg.addColorStop(1, 'transparent');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(CX, CY, SERVER_R + 20, 0, Math.PI * 2);
    ctx.fill();

    // Server body
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, SERVER_R, 0, Math.PI * 2);
    ctx.fillStyle = '#0a1525';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = serverColor;
    ctx.shadowBlur = 18;
    ctx.shadowColor = serverGlow;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Server label
    ctx.save();
    ctx.fillStyle = serverColor;
    ctx.font = 'bold 9px "Courier New"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DATA', CX, CY - 7);
    ctx.fillText('SERVER', CX, CY + 4);
    ctx.font = '8px "Courier New"';
    ctx.fillStyle = integ > 50 ? '#00ff88' : '#ff4444';
    ctx.fillText(`${integ}%`, CX, CY + 15);
    ctx.restore();

    // ── Damage Flash Overlay ───────────────────────────────────────────
    if (g.flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = g.flashAlpha * 0.35;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // ── Mouse cursor ring indicator ────────────────────────────────────
    if (g.mouseDown) {
      const mdx = g.mx - CX;
      const mdy = g.my - CY;
      const md = Math.hypot(mdx, mdy);
      if (md > VPN_R - 35 && md < VPN_R + 35) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(g.mx, g.my, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,170,255,0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    }

    // ── HUD: level badge in canvas ─────────────────────────────────────
    ctx.save();
    ctx.font = 'bold 11px "Courier New"';
    ctx.fillStyle = 'rgba(0,255,100,0.5)';
    ctx.textAlign = 'left';
    ctx.fillText(`LVL ${level}`, 12, H - 12);
    ctx.restore();
  }

  // ── Integrity color helper ──────────────────────────────────────────────
  const integrityColor =
    displayIntegrity > 60 ? '#00ff88' :
    displayIntegrity > 25 ? '#ffaa00' : '#ff3333';

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#030508',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Courier New", monospace',
      userSelect: 'none',
      padding: '12px',
    }}>

      {/* Title */}
      <div style={{
        fontSize: 'clamp(14px, 2.5vw, 20px)',
        letterSpacing: '0.25em',
        color: '#00ff77',
        marginBottom: 10,
        textShadow: '0 0 12px #00ff77',
        textTransform: 'uppercase',
      }}>
        ▣ VPN DEFENDER ▣
      </div>

      {/* HUD Bar */}
      <div style={{
        width: '100%',
        maxWidth: W,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        padding: '6px 14px',
        background: 'rgba(0,255,100,0.05)',
        border: '1px solid rgba(0,255,100,0.15)',
        borderRadius: 4,
        fontSize: 'clamp(10px, 1.8vw, 14px)',
        boxSizing: 'border-box',
      }}>
        {/* Integrity bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#aaa' }}>INTEGRITY</span>
          <div style={{
            width: 100, height: 8, background: '#111',
            border: '1px solid #333', borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              width: `${displayIntegrity}%`,
              height: '100%',
              background: integrityColor,
              boxShadow: `0 0 6px ${integrityColor}`,
              transition: 'width 0.2s, background 0.4s',
              borderRadius: 4,
            }} />
          </div>
          <span style={{ color: integrityColor, minWidth: 36 }}>
            {displayIntegrity}%
          </span>
        </div>

        <div style={{ color: '#00ccff', letterSpacing: '0.1em' }}>
          SCORE <span style={{ color: '#fff' }}>{displayScore}</span>
        </div>

        <div style={{ color: '#aaa', letterSpacing: '0.1em' }}>
          LVL <span style={{ color: '#00ff77' }}>{displayLevel}</span>
        </div>
      </div>

      {/* Canvas wrapper */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: W,
        lineHeight: 0,
      }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            width: '100%',
            display: 'block',
            borderRadius: 6,
            border: '1px solid rgba(0,255,100,0.2)',
            boxShadow: '0 0 30px rgba(0,255,100,0.1), inset 0 0 30px rgba(0,0,0,0.5)',
            cursor: displayState === 'PLAYING' ? 'crosshair' : 'default',
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        />

        {/* Overlay: START / GAME OVER */}
        {displayState !== 'PLAYING' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(3,5,8,0.88)',
            borderRadius: 6,
          }}>
            {displayState === 'START' ? (
              <>
                <div style={{
                  fontSize: 'clamp(22px,5vw,40px)',
                  color: '#00ff77',
                  textShadow: '0 0 20px #00ff77',
                  letterSpacing: '0.2em',
                  marginBottom: 16,
                }}>VPN DEFENDER</div>

                <div style={{
                  color: '#888', fontSize: 'clamp(10px,1.6vw,13px)',
                  maxWidth: 400, textAlign: 'center',
                  lineHeight: 1.8, marginBottom: 28,
                  padding: '0 20px',
                }}>
                  <span style={{ color: '#ff4466' }}>RED GAPS</span> = vulnerabilities in your VPN shield.
                  <br />
                  <span style={{ color: '#00aaff' }}>CLICK &amp; HOLD</span> on a gap to patch it.
                  <br />
                  Don't let malware reach the{' '}
                  <span style={{ color: '#00ccff' }}>DATA SERVER</span>.
                </div>

                <button
                  onClick={startGame}
                  style={{
                    padding: '12px 36px',
                    background: 'transparent',
                    border: '2px solid #00ff77',
                    color: '#00ff77',
                    fontSize: 14,
                    letterSpacing: '0.2em',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontFamily: 'Courier New',
                    boxShadow: '0 0 20px rgba(0,255,100,0.3)',
                    transition: 'all 0.2s',
                    borderRadius: 2,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,255,100,0.1)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,100,0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,100,0.3)';
                  }}
                >
                  ▶ START DEFENSE
                </button>
              </>
            ) : (
              <>
                <div style={{
                  fontSize: 'clamp(18px,4vw,32px)',
                  color: '#ff3344',
                  textShadow: '0 0 20px #ff3344',
                  letterSpacing: '0.15em',
                  marginBottom: 10,
                }}>SYSTEM COMPROMISED</div>

                <div style={{
                  color: '#aaa', fontSize: 'clamp(10px,1.6vw,13px)',
                  marginBottom: 6,
                }}>FINAL SCORE</div>

                <div style={{
                  fontSize: 'clamp(28px,6vw,52px)',
                  color: '#fff',
                  textShadow: '0 0 14px #00aaff',
                  marginBottom: 28,
                  letterSpacing: '0.05em',
                }}>
                  {displayFinalScore}
                </div>

                <button
                  onClick={startGame}
                  style={{
                    padding: '12px 36px',
                    background: 'transparent',
                    border: '2px solid #ff3344',
                    color: '#ff3344',
                    fontSize: 14,
                    letterSpacing: '0.2em',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontFamily: 'Courier New',
                    boxShadow: '0 0 20px rgba(255,50,70,0.3)',
                    transition: 'all 0.2s',
                    borderRadius: 2,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,50,70,0.1)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255,50,70,0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255,50,70,0.3)';
                  }}
                >
                  ↺ REBOOT SYSTEM
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 10,
        fontSize: 'clamp(9px,1.4vw,11px)',
        color: '#444',
        textAlign: 'center',
        maxWidth: W,
        letterSpacing: '0.05em',
      }}>
        ⚠ VPN-based perimeter security is fragile by design.
        Zero Trust Architecture is recommended for production environments.
      </div>
    </div>
  );
}
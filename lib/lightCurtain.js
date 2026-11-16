// Light Curtain (lite): same look as before, far cheaper to draw.
// Drop-in replacement: initLightCurtain(container, config) -> returns a stop function.
//
// What changed under the hood:
//  1. The heavy noise only depends on the horizontal position, so it is now computed
//     once per COLUMN (a 2048x1 texture) instead of once per PIXEL.
//  2. The canvas renders at 1x width and ~40% height (the glow is vertically soft) and
//     the browser scales it up.
//  3. The hover / trail / press-ring math is skipped entirely when nobody is hovering.
//  4. Idle frame rate is capped at 30 fps; 60 fps only while the pointer is active.
//  5. Pauses when the tab is hidden or the curtain is scrolled out of view.

const TRAIL = 8, HIST = TRAIL - 1;
const TRAIL_LIFE = 0.62, TRAIL_STEP = 0.022;
const PULSES = 3, PULSE_LIFE = 1.15, PULSE_SPEED = 1.05;
const SWAY_W = 9.5, SWAY_Z = 0.3;

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const NOISE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
float sat(float x) { return clamp(x, 0.0, 1.0); }
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 34.56); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = h21(i), b = h21(i + vec2(1.0, 0.0));
  float c = h21(i + vec2(0.0, 1.0)), d = h21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
`;

// Pass 1: one pixel per column -> n1, n2, n4, yfbm (everything heavy that only depends on x)
const COL_FRAG = NOISE + `
uniform float uCols; uniform float uTime; uniform float uDensity;
uniform float uSway; uniform float uHover; uniform float uReach; uniform float uMouseX;
float fbm5(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return s;
}
void main() {
  float ux = gl_FragCoord.x / uCols;
  float rx = max(uReach, 0.02);
  float dm = ux - uMouseX;
  float nearP = exp(-(dm * dm) / (rx * rx * 4.0));
  float xw = ux - uSway * 0.09 * (0.25 + 0.75 * nearP) * uHover;
  float n1 = fbm5(vec2(xw * 6.5 * uDensity, uTime * 0.045));
  float n2 = fbm5(vec2(xw * 24.0 * uDensity + 3.1, uTime * 0.075));
  float n4 = vnoise(vec2(xw * 70.0 * uDensity, 4.0 + uTime * 0.03));
  float yf = fbm5(vec2(xw * 3.1 * uDensity, 11.0));
  gl_FragColor = vec4(n1, n2, n4, yf);
}
`;

// Pass 2: the picture
const FRAG_SRC = NOISE + `
const int TRAIL = 8;
const int PULSES = 3;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uHover;
uniform float uReach; uniform float uSway; uniform float uRush;
uniform vec3 uTrail[TRAIL]; uniform vec3 uPulse[PULSES];
uniform vec3 uBg; uniform vec3 uBase; uniform vec3 uAccent; uniform vec3 uHigh;
uniform float uDensity; uniform float uWidth; uniform float uSpread; uniform float uStriation;
uniform sampler2D uCol;
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float t = uTime;
  float rx = max(uReach, 0.02);
  float rx2 = rx * rx;

  vec4 cn = texture2D(uCol, vec2(uv.x, 0.5));
  float n1 = cn.x, n2 = cn.y, n4 = cn.z, yf = cn.w;

  float lift = 0.0, blob = 0.0, cenY = 0.0, cenW = 0.0, ring = 0.0;
  if (uHover > 0.001) {
    for (int i = 0; i < TRAIL; i++) {
      vec3 s = uTrail[i];
      float dx = uv.x - s.x;
      float dy = uv.y - s.y;
      float gx = s.z * exp(-(dx * dx) / rx2);
      lift += gx;
      blob += gx * exp(-(dy * dy) / (rx2 * 2.6));
      cenY += gx * s.y;
      cenW += gx;
    }
    for (int i = 0; i < PULSES; i++) {
      vec3 p = uPulse[i];
      float d = abs(uv.x - p.x) - p.y;
      ring += p.z * exp(-(d * d) / 0.0012);
    }
    lift = (min(lift, 2.0) + ring * 0.9) * uHover;
    blob = min(blob, 1.5) * uHover;
  }
  float trailY = cenY / max(cenW, 1e-4);

  float dm = uv.x - uMouse.x;
  float nearP = exp(-(dm * dm) / (rx2 * 4.0));
  float xw = uv.x - uSway * 0.09 * (0.25 + 0.75 * nearP) * uHover;
  float n3 = vnoise(vec2(xw * 210.0 * uDensity, t * 0.04));

  float band = pow(sat(n1 * 1.30 + n2 * 0.80 - 0.58 + lift * 0.34), 1.95);
  band *= 0.62 + 0.70 * n4;
  float yc = 0.50 + 0.24 * uSpread * (yf - 0.5) * 2.0;
  yc = mix(yc, trailY, sat(cenW * 1.1) * uHover * 0.45);
  float wdt = uWidth * (0.22 + 0.28 * n2 + 0.10 * n1) * (1.0 + 0.5 * uRush * sat(lift));
  float prof = exp(-pow(abs(uv.y - yc) / max(wdt, 0.02), 1.75));
  float inten = band * prof * (1.0 - uStriation * 0.5 + uStriation * n3);

  float blend = sat(n1 * 1.30 - n2 * 0.55 + 0.28);
  vec3 c = mix(uBase, uAccent, blend);
  float amber = sat((n2 - 0.70) * 5.2) * sat(n1 * 1.6 - 0.35);
  c = mix(c, uHigh, amber * 0.85);

  vec3 col = uBg;
  col += c * pow(inten, 0.88) * 1.42;
  col += vec3(1.0, 0.94, 1.0) * pow(inten, 4.5) * 0.65;
  col += c * 0.30 * pow(sat(prof * band * 3.0), 0.70);
  col += c * 0.10 * pow(sat(prof * 1.2), 1.3);
  col += mix(uAccent, uHigh, sat(uRush)) * blob * (0.22 + 0.16 * uRush);
  col += mix(uAccent, uHigh, 0.35) * ring * prof * 0.75 * uHover;
  col += vec3(1.0, 0.95, 0.92) * pow(ring, 3.0) * prof * 0.35 * uHover;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function parseColor(input, fb) {
  if (!input) return fb;
  const str = String(input).trim();
  if (str.charAt(0) === "#") {
    let hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255];
    }
    return fb;
  }
  const m = str.match(/[\d.]+/g);
  if (m && m.length >= 3) return [Math.min(255, +m[0]) / 255, Math.min(255, +m[1]) / 255, Math.min(255, +m[2]) / 255];
  return fb;
}
const num = (v, fb) => (typeof v === "number" && isFinite(v) ? v : fb);
const clampN = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

const DEFAULTS = {
  background: "#171F2D",
  baseColor: "#004B49",
  accentColor: "#00D2C4",
  highlight: "#14E81E",
  density: 150,
  speed: 50,
  hover: 100,
  reach: 30,
  curtain: { curtainWidth: 30, spread: 0, striation: 100 },
  // performance knobs
  resolutionY: 0.4, // vertical render scale (the glow is soft vertically)
  maxWidthPx: 1920, // cap on render width in pixels
  idleFps: 30,      // frame rate while nobody is hovering
};

export function initLightCurtain(container, config = {}) {
  if (typeof window === "undefined") return () => {};
  const cfg = { ...DEFAULTS, ...config, curtain: { ...DEFAULTS.curtain, ...(config.curtain || {}) } };

  if (getComputedStyle(container).position === "static") container.style.position = "relative";
  container.style.overflow = "hidden";
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute", inset: "0", width: "100%", height: "100%",
    display: "block", touchAction: "pan-y",
  });
  container.appendChild(canvas);

  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, powerPreference: "low-power" });
  if (!gl) { console.error("LightCurtain: WebGL unavailable"); canvas.remove(); return () => {}; }

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.error("LightCurtain shader:", gl.getShaderInfoLog(sh)); return null; }
    return sh;
  };
  const link = (fragSrc) => {
    const vs = compile(gl.VERTEX_SHADER, VERT_SRC), fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, "a_pos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error("LightCurtain link:", gl.getProgramInfoLog(p)); return null; }
    const cache = {};
    p.u = (n) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(p, n)));
    return p;
  };
  const colProg = link(COL_FRAG), mainProg = link(FRAG_SRC);
  if (!colProg || !mainProg) { canvas.remove(); return () => {}; }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // 2048x1 column-noise texture + framebuffer
  const COLS = gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 2048 ? 2048 : 1024;
  const colTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, colTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, COLS, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colTex, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    console.error("LightCurtain: framebuffer unsupported");
    canvas.remove();
    return () => {};
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const v = {
    density: clampN(num(cfg.density, 150), 10, 150) / 50,
    speed: clampN(num(cfg.speed, 50), 0, 100) / 50,
    cw: clampN(num(cfg.curtain.curtainWidth, 30), 30, 250) / 100,
    spread: clampN(num(cfg.curtain.spread, 0), 0, 200) / 100,
    striation: clampN(num(cfg.curtain.striation, 100), 0, 100) / 100,
    hover: clampN(num(cfg.hover, 100), 0, 200) / 100,
    reach: 0.02 + (clampN(num(cfg.reach, 30), 0, 100) / 100) * 0.18,
  };
  const bg = parseColor(cfg.background, [0.09, 0.122, 0.176]);
  const base = parseColor(cfg.baseColor, [0, 0.294, 0.286]);
  const accent = parseColor(cfg.accentColor, [0, 0.824, 0.769]);
  const high = parseColor(cfg.highlight, [0.078, 0.91, 0.118]);
  const idleGap = 1000 / Math.max(5, cfg.idleFps);

  // pointer model (unchanged)
  const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, onTarget: 0 };
  const hx = new Float32Array(HIST), hy = new Float32Array(HIST);
  const hAge = new Float32Array(HIST).fill(TRAIL_LIFE * 2);
  let head = 0, lastEmitX = 0.5, lastEmitY = 0.5;
  const trailData = new Float32Array(TRAIL * 3);
  const pulseX = new Float32Array(PULSES);
  const pulseAge = new Float32Array(PULSES).fill(PULSE_LIFE * 2);
  let pulseHead = 0;
  const pulseData = new Float32Array(PULSES * 3);
  const sway = { p: 0.5, v: 0 };
  let rush = 0, prevX = 0.5, prevY = 0.5, clock = 0;

  let bw = 1, bh = 1;
  const resize = () => {
    const cw = canvas.clientWidth || 1200, ch = canvas.clientHeight || 800;
    const dpr = Math.min(window.devicePixelRatio || 1, 1);
    const w = Math.max(1, Math.min(Math.round(cw * dpr), cfg.maxWidthPx));
    const h = Math.max(1, Math.round(ch * clampN(cfg.resolutionY, 0.15, 1)));
    if (w !== bw || h !== bh) { bw = w; bh = h; canvas.width = w; canvas.height = h; }
  };
  resize();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(canvas);

  let running = false, raf = 0, last = performance.now(), lastDraw = 0;

  const render = (now) => {
    if (!running) return;
    raf = requestAnimationFrame(render);
    const idle = ptr.onTarget === 0 && ptr.on < 0.02 && rush < 0.01;
    if (idle && now - lastDraw < idleGap) return;
    lastDraw = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock = (clock + dt * v.speed) % 3600;

    ptr.on += (ptr.onTarget - ptr.on) * (1 - Math.exp(-6 * dt));
    const kHead = 1 - Math.exp(-22 * dt);
    ptr.x += (ptr.tx - ptr.x) * kHead;
    ptr.y += (ptr.ty - ptr.y) * kHead;

    const inst = Math.hypot(ptr.tx - prevX, ptr.ty - prevY) / Math.max(dt, 1e-3);
    prevX = ptr.tx; prevY = ptr.ty;
    const rushTarget = clampN(inst / 2.0, 0, 1) * ptr.on;
    rush += (rushTarget - rush) * (1 - Math.exp(-(rushTarget > rush ? 14 : 3.2) * dt));

    sway.v += (-2 * SWAY_Z * SWAY_W * sway.v - SWAY_W * SWAY_W * (sway.p - ptr.x)) * dt;
    sway.p += sway.v * dt;
    const lag = clampN((ptr.x - sway.p) * 3.0, -1, 1);

    const my = 1 - ptr.y;
    if (ptr.on > 0.02 && Math.hypot(ptr.x - lastEmitX, my - lastEmitY) > TRAIL_STEP) {
      head = (head + 1) % HIST;
      hx[head] = ptr.x; hy[head] = my; hAge[head] = 0;
      lastEmitX = ptr.x; lastEmitY = my;
    }
    trailData[0] = ptr.x; trailData[1] = my; trailData[2] = ptr.on;
    for (let i = 0; i < HIST; i++) {
      const idx = (head - i + HIST * 2) % HIST;
      hAge[idx] += dt;
      const a = hAge[idx];
      const w = a >= TRAIL_LIFE ? 0 : Math.pow(1 - a / TRAIL_LIFE, 1.6) * ptr.on * 0.8;
      trailData[(i + 1) * 3] = hx[idx]; trailData[(i + 1) * 3 + 1] = hy[idx]; trailData[(i + 1) * 3 + 2] = w;
    }
    for (let i = 0; i < PULSES; i++) {
      pulseAge[i] += dt;
      const a = pulseAge[i];
      pulseData[i * 3] = pulseX[i];
      pulseData[i * 3 + 1] = a * PULSE_SPEED;
      pulseData[i * 3 + 2] = a >= PULSE_LIFE ? 0 : Math.pow(1 - a / PULSE_LIFE, 2.0);
    }
    const hover = Math.min(1, ptr.on) * v.hover;

    // pass 1: column noise
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, COLS, 1);
    gl.useProgram(colProg);
    gl.uniform1f(colProg.u("uCols"), COLS);
    gl.uniform1f(colProg.u("uTime"), clock);
    gl.uniform1f(colProg.u("uDensity"), v.density);
    gl.uniform1f(colProg.u("uSway"), lag);
    gl.uniform1f(colProg.u("uHover"), hover);
    gl.uniform1f(colProg.u("uReach"), v.reach);
    gl.uniform1f(colProg.u("uMouseX"), ptr.x);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // pass 2: the picture
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, bw, bh);
    gl.useProgram(mainProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, colTex);
    gl.uniform1i(mainProg.u("uCol"), 0);
    gl.uniform2f(mainProg.u("uRes"), bw, bh);
    gl.uniform1f(mainProg.u("uTime"), clock);
    gl.uniform2f(mainProg.u("uMouse"), ptr.x, my);
    gl.uniform1f(mainProg.u("uHover"), hover);
    gl.uniform1f(mainProg.u("uReach"), v.reach);
    gl.uniform1f(mainProg.u("uSway"), lag);
    gl.uniform1f(mainProg.u("uRush"), rush);
    gl.uniform3fv(mainProg.u("uTrail[0]"), trailData);
    gl.uniform3fv(mainProg.u("uPulse[0]"), pulseData);
    gl.uniform3f(mainProg.u("uBg"), bg[0], bg[1], bg[2]);
    gl.uniform3f(mainProg.u("uBase"), base[0], base[1], base[2]);
    gl.uniform3f(mainProg.u("uAccent"), accent[0], accent[1], accent[2]);
    gl.uniform3f(mainProg.u("uHigh"), high[0], high[1], high[2]);
    gl.uniform1f(mainProg.u("uDensity"), v.density);
    gl.uniform1f(mainProg.u("uWidth"), v.cw);
    gl.uniform1f(mainProg.u("uSpread"), v.spread);
    gl.uniform1f(mainProg.u("uStriation"), v.striation);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // run only while the tab is visible AND the curtain is on screen
  let tabVisible = !document.hidden, onScreen = true;
  const update = () => {
    const want = tabVisible && onScreen;
    if (want && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(render); }
    else if (!want && running) { running = false; cancelAnimationFrame(raf); }
  };
  const onVis = () => { tabVisible = !document.hidden; update(); };
  document.addEventListener("visibilitychange", onVis);
  const io = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; update(); }, { threshold: 0 })
    : null;
  if (io) io.observe(container);

  // pointer handling (unchanged: offsetX / offsetWidth, no zoom drift)
  const track = (e) => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    if (w <= 0 || h <= 0) return;
    ptr.tx = clampN(e.offsetX / w, 0, 1);
    ptr.ty = clampN(e.offsetY / h, 0, 1);
    if (ptr.on < 0.02) {
      ptr.x = ptr.tx; ptr.y = ptr.ty;
      sway.p = ptr.tx; sway.v = 0;
      prevX = ptr.tx; prevY = ptr.ty;
      lastEmitX = ptr.tx; lastEmitY = 1 - ptr.ty;
      hAge.fill(TRAIL_LIFE * 2);
    }
    ptr.onTarget = 1;
  };
  const onDown = (e) => {
    track(e);
    pulseHead = (pulseHead + 1) % PULSES;
    pulseX[pulseHead] = ptr.tx;
    pulseAge[pulseHead] = 0;
  };
  const onLeave = () => { ptr.onTarget = 0; };
  canvas.addEventListener("pointermove", track);
  canvas.addEventListener("pointerenter", track);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerleave", onLeave);

  update();

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVis);
    if (io) io.disconnect();
    if (ro) ro.disconnect();
    canvas.removeEventListener("pointermove", track);
    canvas.removeEventListener("pointerenter", track);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointerleave", onLeave);
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
    canvas.remove();
  };
}

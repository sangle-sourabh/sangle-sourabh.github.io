(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(n, a, t) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (t) e.textContent = t; return e; }
  function frame(host, title, cap) { host.className = 'plot inline'; host.innerHTML = '<h2>' + title + '</h2><p class="cap">' + cap + '</p>'; }

  /* Demo 1: mode shapes of a free-free beam */
  function modes(host) {
    frame(host, 'Try it: how a free-free beam vibrates', 'Pick a mode. The beam is drawn with exaggerated motion. The dots are nodes, points that stay still in that mode, so a sensor placed there cannot see it. Illustrative model, not measured data.');
    var svg = el('svg', { viewBox: '0 0 760 200', role: 'img', 'aria-label': 'Animated mode shape of a free-free beam' });
    host.appendChild(svg);
    var BL = [4.7300, 7.8532, 10.9956, 14.1372, 17.2788], n = 1, N = 160, X0 = 40, X1 = 720, YC = 100, AMP = 70, run = !still, t0 = 0;
    svg.appendChild(el('line', { x1: X0, x2: X1, y1: YC, y2: YC, 'class': 'grid' }));
    var beam = el('path', { 'class': 'live' }); svg.appendChild(beam);
    var dots = []; for (var i = 0; i < 6; i++) { var c = el('circle', { r: 6, 'class': 'dot' }); svg.appendChild(c); dots.push(c); }
    function shape(m) {
      var b = BL[m - 1], s = (Math.cosh(b) - Math.cos(b)) / (Math.sinh(b) - Math.sin(b)), v = [], mx = 0;
      for (var k = 0; k <= N; k++) { var x = b * k / N, y = Math.cosh(x) + Math.cos(x) - s * (Math.sinh(x) + Math.sin(x)); v.push(y); mx = Math.max(mx, Math.abs(y)); }
      return v.map(function (y) { return y / mx; });
    }
    var sh = shape(1);
    function draw(ph) {
      var d = '', a = Math.cos(ph);
      for (var k = 0; k <= N; k++) d += (k ? 'L' : 'M') + (X0 + (X1 - X0) * k / N).toFixed(1) + ',' + (YC - AMP * a * sh[k]).toFixed(1);
      beam.setAttribute('d', d);
      var j = 0;
      for (k = 0; k < N; k++) if (sh[k] * sh[k + 1] < 0 && j < 6) {
        var u = (k + sh[k] / (sh[k] - sh[k + 1])) / N; dots[j].setAttribute('cx', X0 + (X1 - X0) * u); dots[j].setAttribute('cy', YC); dots[j].style.display = ''; j++;
      }
      for (; j < 6; j++) dots[j].style.display = 'none';
    }
    var ctl = document.createElement('div'); ctl.className = 'controls';
    ctl.innerHTML = '<span class="readout" id="ml">Mode</span>';
    var btns = [];
    for (i = 1; i <= 5; i++) (function (m) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = m; b.setAttribute('aria-label', 'Mode ' + m);
      b.onclick = function () { n = m; sh = shape(m); upd(); }; ctl.appendChild(b); btns.push(b);
    })(i);
    var pb = document.createElement('button'); pb.type = 'button'; pb.className = 'btn'; pb.textContent = run ? 'Pause' : 'Play';
    pb.onclick = function () { run = !run; pb.textContent = run ? 'Pause' : 'Play'; if (run) loop(); };
    ctl.appendChild(pb);
    var ro = document.createElement('div'); ro.className = 'readout'; ro.setAttribute('aria-live', 'polite'); ctl.appendChild(ro);
    host.appendChild(ctl);
    function upd() {
      btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k + 1 === n); });
      ro.innerHTML = 'Mode ' + n + ' &middot; frequency is <strong>' + Math.pow(BL[n - 1] / BL[0], 2).toFixed(2) + '&times;</strong> the first mode &middot; ' + (n + 1) + ' nodes';
      draw(run ? 0 : 0);
    }
    function loop(ts) { if (!run) return; var t = (ts || 0) / 1000; draw(2 * Math.PI * 0.7 * t); requestAnimationFrame(loop); }
    upd(); if (run) requestAnimationFrame(loop);
  }

  /* Demo 2: poles moving with temperature */
  function poles(host) {
    frame(host, 'Try it: tracking poles as temperature changes', 'A structure with three resonances. As it warms, stiffness drops, so the poles shift in frequency, and damping rises. Tracking poles like this is how impedance measurements can be interpreted and compensated. Illustrative model, not measured data.');
    var g = document.createElement('div'); g.className = 'demo-grid'; host.appendChild(g);
    var s1 = el('svg', { viewBox: '0 0 520 280', role: 'img', 'aria-label': 'Frequency response with three resonances that shift with temperature' });
    var s2 = el('svg', { viewBox: '0 0 300 280', role: 'img', 'aria-label': 'Pole map showing frequency and damping of three poles' });
    g.appendChild(s1); g.appendChild(s2);
    var F = [120, 310, 520], K = [0.00035, 0.0005, 0.0007], W = [1, 0.6, 0.8], Z0 = 0.01, TR = 20;
    function f(i, T) { return F[i] * (1 - K[i] * (T - TR)); }
    function z(T) { return Z0 * (1 + 0.012 * (T - TR)); }
    function mag(fr, T) {
      var re = 0, im = 0, w = 2 * Math.PI * fr;
      for (var i = 0; i < 3; i++) {
        var wi = 2 * Math.PI * f(i, T), a = wi * wi - w * w, b = 2 * z(T) * wi * w, d = a * a + b * b;
        re += W[i] * wi * wi * a / d; im -= W[i] * wi * wi * b / d;
      }
      return 20 * Math.log10(Math.sqrt(re * re + im * im));
    }
    var L = 42, B = 34, T0 = 10, R = 10, YMIN = -50, YMAX = 50;
    function x1(v) { return L + v / 700 * (520 - L - R); }
    function y1(v) { return T0 + (YMAX - Math.max(YMIN, Math.min(YMAX, v))) / (YMAX - YMIN) * (280 - T0 - B); }
    function p1(T) { var d = ''; for (var fr = 0; fr <= 700; fr += 0.5) d += (fr ? 'L' : 'M') + x1(fr).toFixed(1) + ',' + y1(mag(fr, T)).toFixed(1); return d; }
    [-50, 0, 50].forEach(function (v) { s1.appendChild(el('line', { x1: L, x2: 510, y1: y1(v), y2: y1(v), 'class': v === -50 ? 'axis' : 'grid' })); s1.appendChild(el('text', { x: L - 6, y: y1(v) + 4, 'text-anchor': 'end' }, v)); });
    [0, 200, 400, 600].forEach(function (v) { s1.appendChild(el('text', { x: x1(v), y: 262, 'text-anchor': 'middle' }, v)); });
    s1.appendChild(el('text', { x: 280, y: 277, 'text-anchor': 'middle' }, 'Frequency (Hz)'));
    s1.appendChild(el('path', { 'class': 'ghost', d: p1(TR) }));
    var live = el('path', { 'class': 'live' }); s1.appendChild(live);
    var PL = 46, PT = 10, PW = 244, PH = 236;
    function x2(s) { return PL + s / 90 * PW; }
    function y2(fr) { return PT + (1 - fr / 700) * PH; }
    s2.appendChild(el('line', { x1: PL, x2: PL, y1: PT, y2: PT + PH, 'class': 'axis' }));
    s2.appendChild(el('line', { x1: PL, x2: PL + PW, y1: PT + PH, y2: PT + PH, 'class': 'axis' }));
    [0, 200, 400, 600].forEach(function (v) { s2.appendChild(el('text', { x: PL - 6, y: y2(v) + 4, 'text-anchor': 'end' }, v)); });
    s2.appendChild(el('text', { x: PL + PW / 2, y: 272, 'text-anchor': 'middle' }, 'Damping (decay rate, 1/s)'));
    s2.appendChild(el('text', { transform: 'translate(10,' + (PT + PH / 2) + ') rotate(-90)', 'text-anchor': 'middle' }, 'Frequency (Hz)'));
    var gh = [], lv = [], ln = [];
    for (var i = 0; i < 3; i++) {
      ln.push(s2.appendChild(el('line', { 'class': 'ghost' })));
      gh.push(s2.appendChild(el('circle', { r: 6, 'class': 'dotg', cx: x2(2 * Math.PI * F[i] * Z0), cy: y2(F[i]) })));
      lv.push(s2.appendChild(el('circle', { r: 6, 'class': 'dot' })));
    }
    var ctl = document.createElement('div'); ctl.className = 'controls';
    ctl.innerHTML = '<label for="tmp' + Math.random().toString(36).slice(2, 6) + '">Temperature</label>';
    var sl = document.createElement('input'); sl.type = 'range'; sl.min = 0; sl.max = 100; sl.step = 1; sl.value = 60;
    sl.id = ctl.firstChild.getAttribute('for'); ctl.appendChild(sl);
    var ro = document.createElement('div'); ro.className = 'readout'; ro.setAttribute('aria-live', 'polite'); ctl.appendChild(ro); host.appendChild(ctl);
    function upd() {
      var T = +sl.value; live.setAttribute('d', p1(T));
      for (var i = 0; i < 3; i++) {
        var cx = x2(2 * Math.PI * f(i, T) * z(T)), cy = y2(f(i, T));
        lv[i].setAttribute('cx', cx); lv[i].setAttribute('cy', cy);
        ln[i].setAttribute('x1', gh[i].getAttribute('cx')); ln[i].setAttribute('y1', gh[i].getAttribute('cy')); ln[i].setAttribute('x2', cx); ln[i].setAttribute('y2', cy);
      }
      ro.innerHTML = '<strong>' + T + ' &deg;C</strong> &middot; mode 1 moved ' + (f(0, T) - F[0]).toFixed(1) + ' Hz, mode 3 moved ' + (f(2, T) - F[2]).toFixed(1) + ' Hz &middot; dashed = 20 &deg;C';
    }
    sl.addEventListener('input', upd); upd();
  }

  /* Demo 3: part identification from impedance fingerprints */
  function partid(host) {
    frame(host, 'Try it: telling two nearly identical parts apart', 'Each part has a dynamic fingerprint. Part B is made slightly differently, so its resonances land in slightly different places. Raise the measurement noise and the parts get harder to separate. Illustrative model, not measured data.');
    var svg = el('svg', { viewBox: '0 0 760 280', role: 'img', 'aria-label': 'Frequency response fingerprints of two parts' }); host.appendChild(svg);
    var F = [120, 310, 520, 740], DW = [1, -0.7, 1.3, -1], Z = 0.01, L = 48, R = 12, T = 10, B = 40, YMIN = -50, YMAX = 50, FM = 800;
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; }
    var NA = [], NB = []; for (var i = 0; i <= FM; i++) { NA.push(rnd() * 3.46); NB.push(rnd() * 3.46); }
    function mag(fr, d) {
      var re = 0, im = 0, w = 2 * Math.PI * fr;
      for (var k = 0; k < 4; k++) { var wk = 2 * Math.PI * F[k] * (1 + d * DW[k]), a = wk * wk - w * w, b = 2 * Z * wk * w, q = a * a + b * b; re += wk * wk * a / q; im -= wk * wk * b / q; }
      return 20 * Math.log10(Math.sqrt(re * re + im * im));
    }
    function sx(v) { return L + v / FM * (760 - L - R); }
    function sy(v) { return T + (YMAX - Math.max(YMIN, Math.min(YMAX, v))) / (YMAX - YMIN) * (280 - T - B); }
    [-50, 0, 50].forEach(function (v) { svg.appendChild(el('line', { x1: L, x2: 748, y1: sy(v), y2: sy(v), 'class': v === -50 ? 'axis' : 'grid' })); svg.appendChild(el('text', { x: L - 6, y: sy(v) + 4, 'text-anchor': 'end' }, v)); });
    [0, 200, 400, 600, 800].forEach(function (v) { svg.appendChild(el('text', { x: sx(v), y: 258, 'text-anchor': 'middle' }, v)); });
    svg.appendChild(el('text', { x: 400, y: 276, 'text-anchor': 'middle' }, 'Frequency (Hz)'));
    var pb = el('path', { 'class': 'ghost' }), pa = el('path', { 'class': 'live' }); svg.appendChild(pb); svg.appendChild(pa);
    var ctl = document.createElement('div'); ctl.className = 'controls';
    var uid = Math.random().toString(36).slice(2, 6);
    ctl.innerHTML = '<label for="d' + uid + '">Part difference</label><input id="d' + uid + '" type="range" min="0" max="3" step="0.1" value="1.5">' +
      '<label for="n' + uid + '">Measurement noise</label><input id="n' + uid + '" type="range" min="0" max="6" step="0.5" value="1">';
    var ro = document.createElement('div'); ro.className = 'readout'; ro.setAttribute('aria-live', 'polite'); ctl.appendChild(ro); host.appendChild(ctl);
    var sd = ctl.querySelectorAll('input')[0], sn = ctl.querySelectorAll('input')[1];
    function upd() {
      var d = sd.value / 100, nz = +sn.value, da = '', db = '', ss = 0;
      for (var fr = 0; fr <= FM; fr++) {
        var a = mag(fr, 0), b = mag(fr, d); ss += (a - b) * (a - b);
        da += (fr ? 'L' : 'M') + sx(fr).toFixed(1) + ',' + sy(a + NA[fr] * nz).toFixed(1);
        db += (fr ? 'L' : 'M') + sx(fr).toFixed(1) + ',' + sy(b + NB[fr] * nz).toFixed(1);
      }
      pa.setAttribute('d', da); pb.setAttribute('d', db);
      var rms = Math.sqrt(ss / (FM + 1)), ok = rms > 2 * nz;
      ro.innerHTML = 'Fingerprint difference <strong>' + rms.toFixed(1) + ' dB</strong> vs noise <strong>' + nz.toFixed(1) + ' dB</strong> &middot; ' + (d === 0 ? 'identical parts' : ok ? 'easy to tell apart' : 'hard to tell apart') + ' &middot; solid = part A, dashed = part B';
    }
    sd.addEventListener('input', upd); sn.addEventListener('input', upd); upd();
  }

  /* Demo 4: modes of a 7-DOF chain (seated body style) */
  function seated(host) {
    frame(host, 'Try it: modes of a 7-DOF spring-mass chain', 'A seated body can be modeled as masses linked by springs, here 7 of them stacked above the seat. Pick a mode to see how the segments move together. The masses and stiffnesses are generic, not my model, and the motion is drawn sideways so it is easy to see.');
    var n = 7, M = [14, 16, 10, 7, 6, 4, 4], K = [8, 6, 5, 4, 3, 2.5, 2];
    var A = [], V = [], i, j, k;
    for (i = 0; i < n; i++) { A.push([]); V.push([]); for (j = 0; j < n; j++) { var kk = i === j ? K[i] + (i < n - 1 ? K[i + 1] : 0) : (Math.abs(i - j) === 1 ? -K[Math.max(i, j)] : 0); A[i].push(kk / Math.sqrt(M[i] * M[j])); V[i].push(i === j ? 1 : 0); } }
    for (var sw = 0; sw < 80; sw++) {
      var off = 0; for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) off += A[i][j] * A[i][j]; if (off < 1e-20) break;
      for (var p = 0; p < n - 1; p++) for (var q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-14) continue;
        var th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c, x, y;
        for (k = 0; k < n; k++) { x = A[k][p]; y = A[k][q]; A[k][p] = c * x - s * y; A[k][q] = s * x + c * y; }
        for (k = 0; k < n; k++) { x = A[p][k]; y = A[q][k]; A[p][k] = c * x - s * y; A[q][k] = s * x + c * y; }
        for (k = 0; k < n; k++) { x = V[k][p]; y = V[k][q]; V[k][p] = c * x - s * y; V[k][q] = s * x + c * y; }
      }
    }
    var md = []; for (j = 0; j < n; j++) md.push({ lam: A[j][j], col: j });
    md.sort(function (a, b) { return a.lam - b.lam; });
    var modes = md.map(function (m) {
      var u = [], mx = 0; for (i = 0; i < n; i++) { u.push(V[i][m.col] / Math.sqrt(M[i])); mx = Math.max(mx, Math.abs(u[i])); }
      var sg = u[n - 1] < 0 ? -1 : 1; return { f: 5 * Math.sqrt(m.lam / md[0].lam), u: u.map(function (v) { return sg * v / mx; }) };
    });
    var svg = el('svg', { viewBox: '0 0 760 330', role: 'img', 'aria-label': 'Animated mode shape of a seven-mass chain' }); host.appendChild(svg);
    var CX = 380, YB = 290, DY = 38, AMP = 150, cur = 0, run = !still;
    svg.appendChild(el('rect', { x: CX - 90, y: YB + 6, width: 180, height: 8, rx: 3, fill: 'var(--ghost)' }));
    svg.appendChild(el('text', { x: CX + 100, y: YB + 14 }, 'seat'));
    var line = el('polyline', { 'class': 'live', fill: 'none' }); svg.appendChild(line);
    var cs = []; for (i = 0; i < n; i++) { var c0 = el('circle', { r: 6 + M[i] * 0.6, 'class': 'dot' }); svg.appendChild(c0); cs.push(c0); }
    function draw(ph) {
      var pts = [CX + ',' + YB], a = Math.cos(ph);
      for (var m = 0; m < n; m++) { var x = CX + AMP * a * modes[cur].u[m] * 0.6, y = YB - DY * (m + 1); pts.push(x.toFixed(1) + ',' + y); cs[m].setAttribute('cx', x); cs[m].setAttribute('cy', y); }
      line.setAttribute('points', pts.join(' '));
    }
    var ctl = document.createElement('div'); ctl.className = 'controls'; ctl.innerHTML = '<span class="readout">Mode</span>';
    var btns = [];
    for (i = 0; i < n; i++) (function (m) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = m + 1; b.setAttribute('aria-label', 'Mode ' + (m + 1)); b.onclick = function () { cur = m; upd(); }; ctl.appendChild(b); btns.push(b); })(i);
    var pb = document.createElement('button'); pb.type = 'button'; pb.className = 'btn'; pb.textContent = run ? 'Pause' : 'Play';
    pb.onclick = function () { run = !run; pb.textContent = run ? 'Pause' : 'Play'; if (run) requestAnimationFrame(loop); }; ctl.appendChild(pb);
    var ro = document.createElement('div'); ro.className = 'readout'; ro.setAttribute('aria-live', 'polite'); ctl.appendChild(ro); host.appendChild(ctl);
    function upd() { btns.forEach(function (b, m) { b.setAttribute('aria-pressed', m === cur); }); ro.innerHTML = 'Mode ' + (cur + 1) + ' &middot; <strong>' + modes[cur].f.toFixed(1) + ' Hz</strong> (first mode scaled to 5 Hz)'; draw(0); }
    function loop(ts) { if (!run) return; draw(2 * Math.PI * 0.6 * ts / 1000); requestAnimationFrame(loop); }
    upd(); if (run) requestAnimationFrame(loop);
  }
  document.querySelectorAll('.demo').forEach(function (h) { ({ modes: modes, poles: poles, partid: partid, seated: seated })[h.getAttribute('data-demo')](h); });
})();

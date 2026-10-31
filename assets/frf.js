(function () {
  var svg = document.getElementById('frf');
  var slider = document.getElementById('mu');
  var muVal = document.getElementById('muVal');
  var red = document.getElementById('red');
  var NS = 'http://www.w3.org/2000/svg';

  // plot geometry
  var W = 760, H = 300, L = 54, R = 16, T = 12, B = 40;
  var X0 = 0.6, X1 = 1.4, YMIN = -20, YMAX = 40;
  function sx(x) { return L + (x - X0) / (X1 - X0) * (W - L - R); }
  function sy(y) { return T + (YMAX - y) / (YMAX - YMIN) * (H - T - B); }

  // complex helpers
  function cmul(a, b) { return [a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0]]; }
  function cadd(a, b) { return [a[0]+b[0], a[1]+b[1]]; }
  function csub(a, b) { return [a[0]-b[0], a[1]-b[1]]; }
  function cdiv(a, b) { var d = b[0]*b[0] + b[1]*b[1]; return [(a[0]*b[0] + a[1]*b[1]) / d, (a[1]*b[0] - a[0]*b[1]) / d]; }
  function cabs(a) { return Math.sqrt(a[0]*a[0] + a[1]*a[1]); }

  // primary receptance with an absorber (dimensionless)
  var Z1 = 0.01;
  function mag(O, mu) {
    var f = 1 / (1 + mu);
    var z2 = Math.sqrt(3 * mu / (8 * Math.pow(1 + mu, 3)));
    var P = [1 - O*O, 2*Z1*O];
    var A = [f*f - O*O, 2*z2*f*O];
    var C = [f*f, 2*z2*f*O];
    var num = A;
    var den = csub(cmul(P, A), cmul([mu*O*O, 0], C));
    return 20 * Math.log10(cabs(cdiv(num, den)));
  }

  function path(mu) {
    var d = '', N = 400;
    for (var i = 0; i <= N; i++) {
      var O = X0 + (X1 - X0) * i / N;
      var y = Math.max(YMIN, Math.min(YMAX, mag(O, mu)));
      d += (i ? 'L' : 'M') + sx(O).toFixed(1) + ',' + sy(y).toFixed(1);
    }
    return d;
  }
  function peak(mu) {
    var m = -1e9;
    for (var i = 0; i <= 800; i++) m = Math.max(m, mag(X0 + (X1 - X0) * i / 800, mu));
    return m;
  }
  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  // static frame
  [-20, 0, 20, 40].forEach(function (v) {
    svg.appendChild(el('line', { x1: L, x2: W - R, y1: sy(v), y2: sy(v), 'class': v === -20 ? 'axis' : 'grid' }));
    svg.appendChild(el('text', { x: L - 8, y: sy(v) + 4, 'text-anchor': 'end' }, v + ''));
  });
  [0.6, 0.8, 1.0, 1.2, 1.4].forEach(function (v) {
    svg.appendChild(el('text', { x: sx(v), y: H - 20, 'text-anchor': 'middle' }, v.toFixed(1)));
  });
  svg.appendChild(el('text', { x: (L + W - R) / 2, y: H - 3, 'text-anchor': 'middle' }, 'Frequency ratio (excitation / natural frequency)'));
  var yl = el('text', { transform: 'translate(14,' + ((T + H - B) / 2) + ') rotate(-90)', 'text-anchor': 'middle' }, 'Response (dB)');
  svg.appendChild(yl);

  var base = peak(0);
  svg.appendChild(el('path', { 'class': 'ghost', d: path(0) }));
  var live = el('path', { 'class': 'live', d: path(0.04) });
  svg.appendChild(live);

  function update() {
    var mu = parseFloat(slider.value) / 100;
    live.setAttribute('d', path(mu));
    muVal.textContent = slider.value + '%';
    red.textContent = (base - peak(mu)).toFixed(1) + ' dB';
  }
  slider.addEventListener('input', update);
  update();
})();

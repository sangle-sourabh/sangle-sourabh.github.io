(function () {
  document.querySelectorAll('figure.shot').forEach(function (f) {
    var file = f.getAttribute('data-file'), desc = f.getAttribute('data-desc'), src = f.getAttribute('data-src');
    var ph = document.createElement('div');
    ph.className = 'ph';
    ph.innerHTML = '<strong>IMAGE: ' + file + '</strong><span>' + desc + '</span>';
    f.appendChild(ph);
    var img = new Image();
    img.alt = desc;
    img.onload = function () { f.replaceChild(img, ph); f.classList.add('loaded'); };
    img.src = src;
  });
})();

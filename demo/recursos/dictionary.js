(function () {
  var C = [
    {t:'CONOCER', s:'Consejo Nacional de Normalización y Certificación de Competencias Laborales', c:'Competencias', d:'Organismo mexicano que coordina el sistema de Estándares de Competencia y la certificación de personas con base en ellos.', r:['Estándar de Competencia']},
    {t:'CRS', s:'Sistema de referencia de coordenadas', c:'Referencia espacial', d:'Define cómo las coordenadas de un dato se relacionan con lugares reales de la Tierra. Dos capas con distinto CRS pueden no coincidir hasta transformarlas.', r:['SRID','EPSG:4326']},
    {t:'EPSG:4326', s:'WGS 84', c:'Referencia espacial', d:'Código del sistema de coordenadas geográficas WGS 84, expresado en grados de latitud y longitud. Es el que usa el GPS.', e:'SELECT ST_SetSRID(ST_MakePoint(-99.1332, 19.4326), 4326);', r:['CRS','SRID']},
    {t:'Estándar de Competencia', c:'Competencias', d:'Documento que describe lo que se espera que una persona sepa hacer en una función laboral y cómo se evalúa.', r:['CONOCER']},
    {t:'GeoJSON', c:'Formatos', d:'Formato de texto basado en JSON para intercambiar geometrías y sus atributos. Es muy común en aplicaciones web.', e:'{"type": "Point", "coordinates": [-99.1332, 19.4326]}', r:['WKT','Punto']},
    {t:'GeoPackage', s:'.gpkg', c:'Formatos', d:'Estándar abierto del OGC que guarda datos geoespaciales en un solo archivo, sobre una base de datos SQLite.', r:['Shapefile']},
    {t:'Línea', s:'LineString', c:'Geometría', d:'Geometría formada por una secuencia de puntos conectados. Sirve para representar elementos como calles o ríos.', e:'LINESTRING (-99.13 19.43, -99.16 19.40)', r:['Punto','Polígono','WKT']},
    {t:'Polígono', s:'Polygon', c:'Geometría', d:'Geometría que delimita un área con un anillo cerrado: el primer y el último punto son iguales.', e:'POLYGON ((-99.2 19.3, -99.0 19.3, -99.1 19.5, -99.2 19.3))', r:['Punto','Línea','WKT']},
    {t:'PostGIS', c:'Herramientas', d:'Extensión de PostgreSQL que añade tipos de datos y funciones geoespaciales a la base de datos.', e:"SELECT ST_AsText(ST_GeomFromText('POINT (-99.1332 19.4326)', 4326));", r:['SRID','WKT','WKB']},
    {t:'Punto', s:'Point', c:'Geometría', d:'Geometría definida por una sola posición. Sirve para representar elementos como una escuela o una estación.', e:'POINT (-99.1332 19.4326)', r:['Línea','Polígono','WKT']},
    {t:'Ráster', c:'Formatos', d:'Representa el espacio como una cuadrícula de celdas con un valor cada una. Es típico de imágenes de satélite y modelos de elevación.', r:['Vector']},
    {t:'Shapefile', s:'.shp', c:'Formatos', d:'Formato creado por Esri para guardar puntos, líneas o polígonos con sus datos. Necesita al menos sus archivos hermanos: .shp, .shx y .dbf.', r:['GeoPackage','Vector']},
    {t:'SRID', s:'Identificador de referencia espacial', c:'Referencia espacial', d:'Número que indica qué sistema de coordenadas usa una geometría dentro de una base de datos.', e:'SELECT ST_SRID(geom) FROM capa;', r:['CRS','EPSG:4326','PostGIS']},
    {t:'Vector', c:'Formatos', d:'Representa elementos geográficos con geometrías: puntos, líneas y polígonos, normalmente con atributos asociados.', r:['Ráster','Punto','Línea','Polígono']},
    {t:'WKB', s:'Well-Known Binary', c:'Formatos', d:'Representación binaria de una geometría. Es compacta para guardar y transmitir, y suele mostrarse en hexadecimal.', e:'POINT (-99.1332 19.4326) en WKB:\n0101000000F1F44A5986C858C0E63FA4DFBE6E3340', r:['WKT','PostGIS']},
    {t:'WKT', s:'Well-Known Text', c:'Formatos', d:'Representación en texto de una geometría, legible para las personas. Es la forma textual de lo que WKB guarda en binario.', e:'POINT (-99.1332 19.4326)', r:['WKB','Punto','Línea','Polígono']}
  ];
  if (!document.getElementById('gzd-lista')) { return; }
  var TEMAS = ['Todos', 'Formatos', 'Geometría', 'Referencia espacial', 'Herramientas', 'Competencias'];
  var tema = 'Todos', sel = 'WKT';
  var $ = function (id) { return document.getElementById(id); };
  function plano(x) { return x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function nodo(tag, cls, txt) { var n = document.createElement(tag); if (cls) { n.className = cls; } if (txt) { n.textContent = txt; } return n; }
  function visibles() {
    var q = plano($('gzd-buscar').value.trim());
    return C.filter(function (x) {
      return (tema === 'Todos' || x.c === tema) && (!q || plano(x.t + ' ' + (x.s || '') + ' ' + x.d).indexOf(q) >= 0);
    });
  }
  function filtros() {
    var f = $('gzd-filtros'); f.textContent = '';
    TEMAS.forEach(function (t) {
      var n = t === 'Todos' ? C.length : C.filter(function (x) { return x.c === t; }).length;
      var b = nodo('button', 'filtro', t); b.type = 'button';
      b.setAttribute('aria-pressed', String(t === tema));
      b.appendChild(nodo('small', '', String(n)));
      b.onclick = function () {
        tema = t; filtros(); lista();
        [].forEach.call($('gzd-filtros').children, function (x) { if (x.getAttribute('aria-pressed') === 'true') { x.focus(); } });
      };
      f.appendChild(b);
    });
  }
  function lista() {
    var v = visibles(), l = $('gzd-lista'), letra = null, ul = null; l.textContent = '';
    $('gzd-cuenta').textContent = v.length === 1 ? '1 concepto' : v.length + ' conceptos';
    if (!v.length) { l.appendChild(nodo('p', 'vacio', 'No hay conceptos con esa búsqueda. Prueba con otra palabra o elige «Todos».')); $('gzd-ficha').textContent = ''; pintar(); return; }
    if (!v.some(function (x) { return x.t === sel; })) { sel = v[0].t; }
    v.forEach(function (x) {
      var a = plano(x.t).charAt(0).toUpperCase();
      if (a !== letra) { letra = a; l.appendChild(nodo('h3', '', a)); ul = nodo('ul'); l.appendChild(ul); }
      var li = nodo('li'), b = nodo('button', 'termino', x.t); b.type = 'button';
      if (x.t === sel) { b.setAttribute('aria-current', 'true'); }
      b.onclick = function () { sel = x.t; lista(); var a = $('gzd-lista').querySelector('[aria-current=true]'); if (a) { a.focus(); } };
      li.appendChild(b); ul.appendChild(li);
    });
    ficha();
    pintar();
  }
  function ficha() {
    var x = C.filter(function (k) { return k.t === sel; })[0], f = $('gzd-ficha'); f.textContent = '';
    var cab = nodo('header'); cab.appendChild(nodo('span', 'label', x.c)); var tit = nodo('h3', '', x.t); tit.tabIndex = -1; tit.style.outline = 'none'; cab.appendChild(tit);
    if (x.s) { cab.appendChild(nodo('span', 'sig', x.s)); }
    f.appendChild(cab); f.appendChild(nodo('p', 'def', x.d));
    if (x.e) { var e = nodo('div', 'ejemplo'); e.appendChild(nodo('span', 'label', 'Ejemplo')); e.appendChild(nodo('pre', '', x.e)); f.appendChild(e); }
    var r = nodo('div', 'rel'), ch = nodo('div', 'chips'); r.appendChild(nodo('span', 'label', 'Conceptos relacionados'));
    x.r.forEach(function (t) {
      var b = nodo('button', 'chip', t); b.type = 'button';
      b.onclick = function () { tema = 'Todos'; $('gzd-buscar').value = ''; sel = t; filtros(); lista(); $('gzd-ficha').querySelector('h3').focus(); };
      ch.appendChild(b);
    });
    r.appendChild(ch); f.appendChild(r);
  }
  /* ---------- Mapa ---------- */
  var SVG = 'http://www.w3.org/2000/svg', g = $('gzd-grafo');
  var COLOR = {'Formatos': '#0F719F', 'Geometría': '#F25C2E', 'Referencia espacial': '#21A6CC', 'Herramientas': '#FEFEFE', 'Competencias': '#A0BEC6'};
  function svg(tag, at, padre) { var n = document.createElementNS(SVG, tag); for (var k in at) { n.setAttribute(k, at[k]); } if (padre) { padre.appendChild(n); } return n; }
  var N = {}, E = [], W = 760, H = 560;
  C.forEach(function (c, i) { var a = i * 2.399963; N[c.t] = {c: c, x: W / 2 + Math.cos(a) * (40 + i * 13), y: H / 2 + Math.sin(a) * (40 + i * 11), v: {}}; });
  C.forEach(function (c) { c.r.forEach(function (t) {
    if (N[t] && !N[c.t].v[t]) { N[c.t].v[t] = 1; N[t].v[c.t] = 1; E.push({a: N[c.t], b: N[t]}); }
  }); });
  var LN = Object.keys(N).map(function (k) { return N[k]; });
  // El acomodo se calcula de una vez: el mapa aparece quieto y siempre igual.
  for (var it = 0; it < 700; it++) {
    var ks = 1 - it / 700;
    LN.forEach(function (n) { n.fx = (W / 2 - n.x) * .012; n.fy = (H / 2 - n.y) * .016; });
    LN.forEach(function (a, i) { LN.slice(i + 1).forEach(function (b) {
      var dx = a.x - b.x, dy = a.y - b.y, d2 = Math.max(60, dx * dx + dy * dy), f = 21000 / d2, d = Math.sqrt(d2);
      a.fx += f * dx / d; a.fy += f * dy / d; b.fx -= f * dx / d; b.fy -= f * dy / d;
    }); });
    E.forEach(function (e) {
      var dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, d = Math.max(1, Math.sqrt(dx * dx + dy * dy)), f = (d - 118) * .06;
      e.a.fx += f * dx / d; e.a.fy += f * dy / d; e.b.fx -= f * dx / d; e.b.fy -= f * dy / d;
    });
    LN.forEach(function (n) { n.x += n.fx * ks * .6; n.y += n.fy * ks * .6; });
  }
  // Flotación: cada nodo deriva con su propio ritmo lento.
  var reloj = 0, amp = 0, pausado = false, aMano = false;
  LN.forEach(function (n, i) { n.ox = n.oy = n.vx = n.vy = 0; n.pa = 1500 + (i * 137) % 900; n.pb = 1900 + (i * 211) % 1100; n.fa = i * 1.7; n.fb = i * 2.9; });
  var capaE = svg('g', {}, g), capaN = svg('g', {}, g), vb, vb0, foco = null;
  E.forEach(function (e) { e.el = svg('line', {'class': 'arista'}, capaE); });
  LN.forEach(function (n) {
    var grado = Object.keys(n.v).length, r = 6 + grado * 3.4; // a más conexiones, mayor tamaño
    n.r = r;
    n.el = svg('g', {'class': 'nodo', tabindex: '0', role: 'button'}, capaN);
    svg('circle', {'class': 'anillo', r: r + 7}, n.el);
    svg('circle', {r: Math.max(22, r), fill: 'transparent'}, n.el); // área táctil amplia
    svg('circle', {'class': 'forma', r: r, fill: COLOR[n.c.c]}, n.el);
    var tx = svg('text', {y: r + 17}, n.el); tx.textContent = n.c.t;
    n.el.setAttribute('aria-label', n.c.t + ', ' + n.c.c + ', ' + grado + (grado === 1 ? ' relación' : ' relaciones'));
    n.el.addEventListener('mouseenter', function () { foco = n.c.t; pintar(); });
    n.el.addEventListener('mouseleave', function () { foco = null; pintar(); });
    n.el.addEventListener('focus', function () { foco = n.c.t; pintar(); });
    n.el.addEventListener('blur', function () { foco = null; pintar(); });
    n.el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); elegir(n.c.t); } });
    n.el.addEventListener('pointerdown', function (ev) { arrastre = {n: n, x: ev.clientX, y: ev.clientY, movido: false}; ev.stopPropagation(); g.setPointerCapture(ev.pointerId); });
  });
  function elegir(t) { sel = t; lista(); }
  function posicion() {
    LN.forEach(function (n) {
      n.px = n.x + n.ox + Math.sin(reloj / n.pa + n.fa) * 7 * amp;
      n.py = n.y + n.oy + Math.cos(reloj / n.pb + n.fb) * 9 * amp;
      n.el.setAttribute('transform', 'translate(' + n.px.toFixed(2) + ' ' + n.py.toFixed(2) + ')');
    });
    E.forEach(function (e) { e.el.setAttribute('x1', e.a.px); e.el.setAttribute('y1', e.a.py); e.el.setAttribute('x2', e.b.px); e.el.setAttribute('y2', e.b.py); });
  }
  function pintar() {
    var vis = {}; visibles().forEach(function (x) { vis[x.t] = 1; });
    var hay = Object.keys(vis).length > 0, act = foco || sel;
    $('gzd-mapa-vacio').hidden = hay;
    LN.forEach(function (n) {
      var t = n.c.t, dentro = !!vis[t], cerca = t === act || !!n.v[act];
      n.el.setAttribute('class', 'nodo' + (t === sel && hay ? ' sel' : '') + (!dentro ? ' fuera' : (cerca ? '' : ' tenue')));
      n.el.setAttribute('tabindex', dentro ? '0' : '-1');
      if (t === sel && hay) { n.el.setAttribute('aria-current', 'true'); } else { n.el.removeAttribute('aria-current'); }
    });
    E.forEach(function (e) {
      var fuera = !vis[e.a.c.t] || !vis[e.b.c.t], viva = e.a.c.t === act || e.b.c.t === act;
      e.el.setAttribute('class', 'arista' + (fuera ? ' fuera' : (viva ? ' viva' : ' tenue')));
    });
  }
  function aplicar() { g.setAttribute('viewBox', [vb.x, vb.y, vb.w, vb.h].join(' ')); }
  function ajustar() {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    LN.forEach(function (n) { x0 = Math.min(x0, n.x - 60); x1 = Math.max(x1, n.x + 60); y0 = Math.min(y0, n.y - 30); y1 = Math.max(y1, n.y + n.r + 30); });
    vb0 = {x: x0, y: y0, w: x1 - x0, h: y1 - y0};
    vb = {x: x0, y: y0, w: vb0.w, h: vb0.h}; aplicar();
  }
  function zoom(k) {
    var w = vb.w * k, h = vb.h * k;
    if (w < vb0.w * .35 || w > vb0.w * 2) { return; }
    vb.x += (vb.w - w) / 2; vb.y += (vb.h - h) / 2; vb.w = w; vb.h = h; aplicar();
  }
  $('gzd-z-mas').onclick = function () { zoom(.8); };
  $('gzd-z-menos').onclick = function () { zoom(1.25); };
  $('gzd-z-fit').onclick = ajustar;
  // Arrastrar: un nodo lo reacomoda; el fondo mueve el mapa. La rueda sigue desplazando la página.
  var arrastre = null, escala = function () { var r = g.getBoundingClientRect(); return Math.max(vb.w / r.width, vb.h / r.height); };
  g.addEventListener('pointerdown', function (ev) {
    if (arrastre) { return; }
    arrastre = {x: ev.clientX, y: ev.clientY, movido: false};
    if (ev.pointerType === 'mouse') { g.setPointerCapture(ev.pointerId); g.classList.add('mueve'); } else { arrastre = null; }
  });
  g.addEventListener('pointermove', function (ev) {
    if (!arrastre) { return; }
    var dx = ev.clientX - arrastre.x, dy = ev.clientY - arrastre.y;
    if (!arrastre.movido && Math.abs(dx) + Math.abs(dy) < 5) { return; }
    arrastre.movido = true;
    var e = escala();
    if (arrastre.n) {
      arrastre.n.x += dx * e; arrastre.n.y += dy * e;
      Object.keys(arrastre.n.v).forEach(function (t) { var o = N[t]; if (!menos) { o.vx += dx * e * .05; o.vy += dy * e * .05; } });
      posicion();
    }
    else { vb.x -= dx * e; vb.y -= dy * e; aplicar(); }
    arrastre.x = ev.clientX; arrastre.y = ev.clientY;
  });
  function soltar() {
    if (arrastre && arrastre.n && !arrastre.movido) { elegir(arrastre.n.c.t); }
    arrastre = null; g.classList.remove('mueve');
  }
  g.addEventListener('pointerup', soltar);
  g.addEventListener('pointercancel', function () { arrastre = null; g.classList.remove('mueve'); });
  Object.keys(COLOR).forEach(function (t) {
    var li = nodo('li'), s = svg('svg', {viewBox: '-12 -12 24 24', 'aria-hidden': 'true'}, li);
    svg('circle', {r: 9, fill: COLOR[t], stroke: '#14232F', 'stroke-width': 2}, s);
    li.appendChild(document.createTextNode(t)); $('gzd-leyenda').appendChild(li);
  });
  var vista;
  function ponerVista(v) {
    vista = v; $('gzd-cuerpo').setAttribute('data-vista', v);
    [].forEach.call(document.querySelectorAll('.vista'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === v)); });
    try { localStorage.setItem('gz-dic-vista', v); } catch (e) {}
  }
  [].forEach.call(document.querySelectorAll('.vista'), function (b) { b.onclick = function () { ponerVista(b.getAttribute('data-v')); }; });
  var guardada = null;
  try { guardada = localStorage.getItem('gz-dic-vista'); } catch (e) {}
  ponerVista(guardada === 'lista' || guardada === 'mapa' ? guardada : (window.innerWidth < 760 ? 'lista' : 'mapa'));
  // Bucle de flotación: se calma al señalar un nodo y se detiene fuera de pantalla.
  var menos = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, visible = true, previo = 0;
  function pausar(v) { pausado = v; $('gzd-z-flota').textContent = $('gzd-z-flota').getAttribute(v ? 'data-r' : 'data-p'); $('gzd-z-flota').setAttribute('aria-pressed', String(v)); }
  $('gzd-z-flota').onclick = function () { pausar(!pausado); try { localStorage.setItem('gz-dic-flota', pausado ? '0' : '1'); } catch (e) {} };
  var pref = null; try { pref = localStorage.getItem('gz-dic-flota'); } catch (e) {}
  pausar(pref ? pref === '0' : menos);
  if (window.IntersectionObserver) { new IntersectionObserver(function (x) { visible = x[0].isIntersecting; }).observe(g); }
  function cuadro(ahora) {
    var dt = Math.min(50, ahora - previo || 16); previo = ahora;
    if (visible && vista === 'mapa') {
      var meta = (pausado || foco || arrastre) ? 0 : 1;
      amp += (meta - amp) * Math.min(1, dt / 500);
      reloj += dt;
      LN.forEach(function (n) { // los vecinos arrastrados vuelven como en el agua
        n.vx += -n.ox * .012; n.vy += -n.oy * .012; n.vx *= .9; n.vy *= .9; n.ox += n.vx; n.oy += n.vy;
      });
      posicion();
    }
    requestAnimationFrame(cuadro);
  }
  posicion(); ajustar();
  requestAnimationFrame(cuadro);
  $('gzd-buscar').addEventListener('input', lista);
  filtros(); lista();
})();

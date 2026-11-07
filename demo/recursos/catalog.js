(function() {
    var C = GEOZ_CATALOG.courses, R = GEOZ_CATALOG.paths, mode = 'tec', ruta = 0, own = 'all', LOG = GEOZ_CATALOG.logged;
    var ST = {none: ['Disponible', 'st-none'], trial: ['En prueba', 'st-trial'], full: ['Curso completo', 'st-full'], done: ['Terminado', 'st-done'], owned: ['Comprado', 'st-owned']};
    function $(i) { return document.getElementById(i); }
    function by(i) { return C.filter(function(c) { return c.id === i; })[0]; }
    function el(t, k, x) { var e = document.createElement(t); if (k) { e.className = k; } if (x !== undefined) { e.textContent = x; } return e; }
    function leaveControl(key, value, warn) {
        var url = GEOZ_CATALOG.leave + '?' + key + '=' + value;
        if (warn) {
            var a = el('a', 'leave', 'Eliminar de mi biblioteca');
            a.href = url;
            return a;
        }
        var f = el('form'), k = el('input'), s = el('button', 'leave', 'Eliminar de mi biblioteca');
        f.method = 'post';
        f.action = url;
        k.type = 'hidden';
        k.name = 'sesskey';
        k.value = GEOZ_CATALOG.sesskey;
        s.type = 'submit';
        f.appendChild(k);
        f.appendChild(s);
        return f;
    }
    function card(c, order) {
        var a = el('article', 'course'), b = el('div', 'body'), g = el('div', 'tags');
        var cov = el('div', 'cover ' + c.c);
        cov.appendChild(el('span', 'badge ' + ST[c.s][1], ST[c.s][0]));
        a.appendChild(cov);
        if (c.s !== 'none') { a.classList.add('mine'); }
        if (order) { b.appendChild(el('span', 'order', 'Paso ' + order)); }
        b.appendChild(el('h3', '', c.n));
        c.t.forEach(function(t) { g.appendChild(el('span', 'tag', t)); });
        b.appendChild(g);
        var mine = c.s !== 'none' && c.s !== 'owned', l;
        if (c.s === 'owned') {
            l = el('a', 'btn', 'Volver a matricularme');
        } else if (mine) {
            var m = el('div', 'meter'), i = el('i');
            i.style.width = c.p + '%';
            m.appendChild(i);
            m.setAttribute('role', 'img');
            m.setAttribute('aria-label', c.p + ' por ciento de avance');
            b.appendChild(m);
            b.appendChild(el('span', 'state', c.p + ' % completado'));
            l = el('a', c.s === 'done' ? 'btn ghost' : 'btn', c.s === 'done' ? 'Repasar' : 'Continuar');
        } else {
            l = el('a', 'btn accent', 'Probar gratis');
        }
        l.href = c.u;
        var row = el('div', 'acts');
        row.appendChild(l);
        if (c.pay) {
            var u = el('a', 'btn accent', 'Desbloquear');
            u.href = c.pay;
            row.appendChild(u);
        }
        b.appendChild(row);
        if (c.l) { b.appendChild(leaveControl('id', c.id, c.l === 'confirm')); }
        a.appendChild(b);
        return a;
    }
    function pill(x, on, f) { var p = el('button', 'pill', x); p.type = 'button'; p.setAttribute('aria-pressed', on ? 'true' : 'false'); p.onclick = f; return p; }
    function render() {
        var q = $('q').value.trim().toLowerCase(), P = $('pills'), L = $('list'), H = $('pathhead'), rows;
        if (LOG) {
            var O = $('own');
            O.textContent = '';
            [['all', 'Todos'], ['mine', 'Mis cursos'], ['free', 'Disponibles']].forEach(function(k) {
                var n = C.filter(function(c) { return k[0] === 'all' || (k[0] === 'mine') === (c.s !== 'none'); }).length;
                var p = pill(k[1], own === k[0], function() { own = k[0]; render(); });
                p.appendChild(el('small', '', n));
                O.appendChild(p);
            });
        }
        P.textContent = ''; L.textContent = ''; H.textContent = '';
        if ($('tTec')) { $('tTec').setAttribute('aria-selected', mode === 'tec'); $('tRuta').setAttribute('aria-selected', mode === 'ruta'); }
        if (mode === 'tec') {
            rows = C.map(function(c) { return [c]; });
        } else {
            R.forEach(function(r, i) { P.appendChild(pill(r.n, ruta === i, function() { ruta = i; render(); })); });
            var r = R[ruta], h = el('div', 'pathhead');
            h.appendChild(el('h2', '', r.n));
            if (r.d) { h.appendChild(el('p', '', r.d)); }
            h.appendChild(el('span', 'note', r.ids.length + (r.ids.length === 1 ? ' curso' : ' cursos en orden')));
            var own2 = r.ids.map(by).filter(function(c) { return c.l; });
            if (own2.length) {
                var ctl = leaveControl('path', r.id, own2.some(function(c) { return c.l === 'confirm'; }));
                (ctl.querySelector('button') || ctl).textContent = 'Eliminar esta ruta de mi biblioteca';
                h.appendChild(ctl);
            }
            H.appendChild(h);
            rows = r.ids.map(function(i, n) { return [by(i), n + 1]; });
        }
        rows = rows.filter(function(x) { return own === 'all' || (own === 'mine') === (x[0].s !== 'none'); });
        rows = rows.filter(function(x) { return (x[0].n + ' ' + x[0].t.join(' ')).toLowerCase().indexOf(q) >= 0; });
        if (!rows.length) { L.appendChild(el('p', '', 'No hay cursos con esos filtros.')); }
        rows.forEach(function(x) { L.appendChild(card(x[0], x[1])); });
    }
    if ($('tTec')) {
        $('tTec').onclick = function() { mode = 'tec'; render(); };
        $('tRuta').onclick = function() { mode = 'ruta'; render(); };
    }
    var seen = {}, dl = $('techs');
    C.forEach(function(c) { c.t.forEach(function(t) { seen[t] = 1; }); });
    Object.keys(seen).sort().forEach(function(t) { var o = el('option'); o.value = t; dl.appendChild(o); });
    $('q').oninput = render;
    render();
})();

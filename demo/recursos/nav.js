(function() {
    var nav = document.querySelector('.gz .gzside');
    if (!nav) { return; }
    var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
    var home = links[0], locked = false, spy = [];
    links.forEach(function(a) {
        var i = a.href.indexOf('#'), s = i < 0 ? null : document.getElementById(a.href.slice(i + 1));
        if (s) { spy.push({a: a, s: s}); }
    });
    function mark(a) {
        links.forEach(function(l) {
            l.classList.toggle('on', l === a);
            if (l === a) { l.setAttribute('aria-current', 'true'); } else { l.removeAttribute('aria-current'); }
        });
    }
    function current() { return links.filter(function(l) { return l.classList.contains('on'); })[0]; }
    function update() {
        if (locked) { return; }
        var best = null, tied = [];
        spy.forEach(function(x) {
            var t = Math.round(x.s.getBoundingClientRect().top);
            if (t > 140) { return; }
            if (best === null || t > best) { best = t; tied = [x.a]; } else if (t === best) { tied.push(x.a); }
        });
        // Entregas y Competencias comparten fila: se conserva la que ya este marcada.
        mark(!tied.length ? home : (tied.indexOf(current()) >= 0 ? current() : tied[0]));
    }
    function fromHash() {
        var hit = spy.filter(function(x) { return '#' + x.s.id === location.hash; })[0];
        if (hit) { locked = true; mark(hit.a); }
    }
    spy.forEach(function(x) {
        x.a.addEventListener('click', function() { locked = true; mark(x.a); });
    });
    // Tras un clic el destino puede no llegar arriba; el seguimiento vuelve cuando el usuario desplaza.
    ['wheel', 'touchmove', 'keydown'].forEach(function(e) {
        window.addEventListener(e, function() { locked = false; }, {passive: true});
    });
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('hashchange', fromHash);
    update();
    fromHash();
})();

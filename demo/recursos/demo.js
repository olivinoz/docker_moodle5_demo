// Demo estática de G-Academy: simula el flujo sin servidor.
(function () {
  var pagina = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
  var curso = new URLSearchParams(location.search).get('curso');

  var css = document.createElement('style');
  css.textContent =
    '.gzdemo-aviso{position:fixed;left:12px;bottom:12px;z-index:99999;background:#14232F;color:#F2EEE3;font:500 12px/1.4 "IBM Plex Mono",monospace;' +
    'padding:8px 12px;border:2px solid #F25C2E;max-width:calc(100vw - 24px)}.gzdemo-aviso a{color:#F25C2E!important}#theme_boost-drawers-courseindex,.drawer-toggles,[data-toggler="drawers"]{display:none!important}' +
    '.gzdemo-toast{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:100000;background:#F25C2E;color:#14232F;' +
    'font:600 13px/1.4 "IBM Plex Mono",monospace;padding:10px 16px;max-width:calc(100vw - 32px);box-shadow:0 4px 0 #14232F}';
  document.head.appendChild(css);

  var aviso = document.createElement('div');
  aviso.className = 'gzdemo-aviso';
  aviso.innerHTML = 'Demo estática · datos de ejemplo · <a href="index.html">inicio</a>';
  document.body.appendChild(aviso);

  if (pagina === 'acceso' || pagina === 'registro') {
    var formulario = document.querySelector('form.login-form, form.mform');
    if (formulario) {
      var nota = document.createElement('p');
      nota.className = 'gzdemo-nota';
      nota.setAttribute('role', 'note');
      nota.textContent = 'Demo: escribe cualquier dato, o déjalo vacío, y entra.';
      formulario.parentNode.insertBefore(nota, formulario);
      css.textContent += '.gzdemo-nota{grid-column:1/-1;background:#F25C2E;color:#14232F;font:600 13px/1.4 "IBM Plex Mono",monospace;' +
        'padding:10px 14px;margin:0 0 16px;border:2px solid #14232F}';
    }
  }

  var temporizador;
  function avisar(texto) {
    var t = document.querySelector('.gzdemo-toast') || document.body.appendChild(document.createElement('div'));
    t.className = 'gzdemo-toast';
    t.setAttribute('role', 'status');
    t.textContent = texto;
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { t.remove(); }, 3200);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-demo="no"]');
    if (a) {
      e.preventDefault();
      avisar('Esta opción solo funciona en la plataforma completa.');
    }
  }, true);

  document.addEventListener('submit', function (e) {
    var f = e.target;
    e.preventDefault();
    if (pagina === 'acceso' || pagina === 'registro') {
      if (e.submitter && e.submitter.name === 'cancel') {
        location.href = 'index.html';
        return;
      }
      // En la demo cualquier dato sirve: se entra como el usuario de ejemplo.
      location.href = curso ? 'aula-' + curso + '.html' : 'panel.html';
      return;
    }
    if (f.querySelector('input[type="search"]')) { return; }
    avisar('En la demo no se guardan cambios.');
  }, true);
})();

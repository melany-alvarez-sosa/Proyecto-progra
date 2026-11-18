const feed = document.querySelector('main.feed');              // parte de "Inicio"
const botonesNav = document.querySelectorAll('.nav-link');     // botones del menú de la izquierda
const inputBuscar = document.querySelector('.buscador input'); //  barra de búsqueda
const inputPublicar = document.getElementById('texto-publicación');
const botonPublicar = document.getElementById('botón-publicar');
const mensaje = document.getElementById('mensaje');         
const miUsuario = '16.va_l';                                  // mi usuario (el del perfil)

let adjunto = null;     // se guarda la foto/video/canción que se va a publicar
let expandido = { outfits: false, canciones: false };  // para saber si ya tocaron "Ver todos"
let buscando = false;   // para saber si hay algo escrito en el buscador
let guardados = [];     // publicaciones guardadas (para la sección Guardados)
let menuAbierto = null;
function mostrarAviso(texto) {
  const aviso = document.createElement('div');
  aviso.textContent = texto;
  aviso.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#ff8fb8;color:white;padding:10px 20px;border-radius:20px;z-index:9999;font-family:sans-serif;';
  document.body.appendChild(aviso);
  setTimeout(function () { aviso.remove(); }, 2500); // a los 2.5 segundos desaparece
}
// Escribe un mensaje en el id="mensaje" del cuadro de publicar
function mostrarMensaje(texto) {
  mensaje.textContent = texto;
  setTimeout(function () { mensaje.textContent = ''; }, 3000);
}
// Las páginas son las <section class="página"> que están FUERA del <main>
// (así no me confundo con una section que está dentro del main)
function getPaginas() {
  const todas = Array.from(document.querySelectorAll('section.página'));
  return todas.filter(function (p) { return !p.closest('main'); });
}
// Busca una página por su id (Tablero, Mi armario, etc.)
function buscarPagina(nombre) {
  return getPaginas().find(function (p) { return p.id === nombre; });
}
// Oculta o muestra un elemento según sus data-limite, data-busqueda, data-ocultado
// Si alguna dice 'si' se oculta
function refrescar(el) {
  const oculto = el.dataset.limite === 'si' || el.dataset.busqueda === 'si' || el.dataset.ocultado === 'si';
  el.style.display = oculto ? 'none' : '';
}
function mostrarSeccion(nombre) {
  cerrarMenu();
  let pagina = null;
  if (nombre === 'Guardados') {
    pagina = prepararGuardados();   // esta sección no existe en el html, se crea con js
  } else if (nombre !== 'Inicio') {
    pagina = buscarPagina(nombre);
    if (!pagina) {                  // si no existe esa sección no pasa nada
      mostrarAviso('Esta sección todavía no está lista ♡');
      return;
    }
  }
  // primero se esconden todas las páginas
  getPaginas().forEach(function (p) { p.style.display = 'none'; });
  if (nombre === 'Inicio') {
    feed.style.display = '';        // se muestra el inicio
  } else {
    feed.style.display = 'none';    // se esconde el inicio
    pagina.style.display = 'block'; // y se muestra la página que tocaron
  }
  // le pongo la clase "active" solo al botón del menú que tocaron
  botonesNav.forEach(function (b) {
    b.classList.toggle('active', b.dataset.section === nombre);
  });
  window.scrollTo(0, 0); // subir hasta arriba
}
// Perfil de un amigo. Se reconocen por la foto de perfil 
function mostrarPerfilAmigo(src) {
  if (src === 'img/perfil.jpg') {  
    mostrarSeccion('Mi perfil');
    return;
  }
  const pagina = getPaginas().find(function (p) {
    const img = p.querySelector('.encabezado-perfil img');
    return img && img.getAttribute('src') === src;
  });
  if (!pagina) {
    mostrarAviso('No encontré ese perfil :(');
    return;
  }
  cerrarMenu();
  getPaginas().forEach(function (p) { p.style.display = 'none'; });
  feed.style.display = 'none';
  pagina.style.display = 'block';
  botonesNav.forEach(function (b) { b.classList.remove('active'); });
  window.scrollTo(0, 0);
}
// Esta función deja visibles solo 3 outfits y 3 canciones,
// a menos que ya hayan tocado "Ver todos" o estén buscando algo
function aplicarLimites() {
  // Ahora el css es el que esconde del 4to en adelante 
  // Aquí solo se ponen o se quitan unas clases al feed y el css hace el resto
  feed.classList.toggle('ver-todos-outfits', expandido.outfits);
  feed.classList.toggle('ver-todos-canciones', expandido.canciones);
  feed.classList.toggle('buscando', buscando);
}
// Se pone una clase a los outfits y canciones que pasan del tercero (del 4to en adelante)
// El css usa esa clase para esconderlos
function marcarExtras() {
  document.querySelectorAll('main .outfits article').forEach(function (o, i) {
    o.classList.toggle('extra-outfit', i >= 3);   // i empieza en 0, o sea 0,1,2 son los primeros tres
  });
  document.querySelectorAll('main .canción').forEach(function (c, i) {
    c.classList.toggle('extra-cancion', i >= 3);
  });
}
// Qué pasa cuando tocan el botón "Ver todos" de un panel
function tocarVerTodos(boton) {
  const cual = boton.dataset.section; 
if (cual === 'Mi armario') {                 // el de outfits
    expandido.outfits = !expandido.outfits;    // cambia de true a false y viceversa
    boton.textContent = expandido.outfits ? 'Ver menos ←' : 'Ver todos →';
  } else if (cual === 'Playlist vibes') {      // el de canciones
    expandido.canciones = !expandido.canciones;
    boton.textContent = expandido.canciones ? 'Ver menos ←' : 'Ver todos →';
  } else {
    mostrarAviso('Pronto habrá más momentos ♡');  // el de Little Moments no tiene nada más por ahora
  }
  aplicarLimites();
}
// Saca texto "escondido" (los alt de las fotos y los nombres de las canciones)
// para que también se pueda buscar por eso
function textoExtra(el) {
  let t = '';
  el.querySelectorAll('img').forEach(function (i) {
    t += ' ' + (i.alt || '');
    if (el.matches('.canción')) t += ' ' + i.getAttribute('src'); // en las canciones busco por el nombre de la imagen
  });
  el.querySelectorAll('source').forEach(function (s) { t += ' ' + s.getAttribute('src'); });
  return t;
}
inputBuscar.addEventListener('input', function () {
  const q = inputBuscar.value.toLowerCase().trim();
  buscando = q !== '';
  aplicarLimites(); // si están buscando se ignora el límite de 3
  // reviso publicaciones, outfits, canciones y amigos
  document.querySelectorAll('article, .canción, .amigos p').forEach(function (el) {
    if (q === '') {
      el.dataset.busqueda = 'no';
    } else {
      const texto = (el.textContent + ' ' + textoExtra(el)).toLowerCase();
      el.dataset.busqueda = texto.includes(q) ? 'no' : 'si'; // 'si' significa que se oculta
    }
    refrescar(el);
  });
});
//  Publicar (texto, foto, video, canción, outfit) 
// Cámara (foto y video) 
// modo puede ser 'foto' o 'video'
async function abrirCamara(modo) {
  // primero la alerta de permiso, como pidieron
  const dioPermiso = confirm('¿Permitir que Little Things acceda a su cámara?');
  if (!dioPermiso) {
    mostrarMensaje('No diste permiso a la cámara 😔');
    return;
  }
  // por si el navegador no sabe usar la cámara
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    mostrarMensaje('Tu navegador no deja usar la cámara :(');
    return;
  }
  let stream;
  try {
    // si es video también pedimos el micrófono
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: modo === 'video' });
  } catch (error) {
    mostrarMensaje('No pude abrir la cámara... revisa los permisos del navegador');
    console.log(error); // para ver qué pasó en la consola
    return;
  }
  // Se crea la ventanita con js (sin css aparte, todo aquí mismo)
  const fondo = document.createElement('div');
  fondo.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9998;';
  const caja = document.createElement('div');
  caja.style.cssText = 'background:white;padding:15px;border-radius:15px;text-align:center;';
  const video = document.createElement('video');
  video.srcObject = stream;       // aquí se ve lo que graba la cámara
  video.autoplay = true;
  video.muted = true;             // muteado para que no haga eco
  video.playsInline = true;
  video.style.cssText = 'width:400px;max-width:90vw;border-radius:10px;display:block;margin-bottom:10px;';
  const btnAccion = document.createElement('button');
  btnAccion.textContent = modo === 'foto' ? '📸 Tomar foto' : '● Grabar';
  const btnCancelar = document.createElement('button');
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.style.marginLeft = '10px';
  caja.append(video, btnAccion, btnCancelar);
  fondo.appendChild(caja);
  document.body.appendChild(fondo);
  let grabador = null;     // el que graba el video
  let pedazos = [];        // los pedacitos del video que se van guardando
  let descartar = false;   // si cancelan, no guardo nada
  // apaga la cámara y quita la ventanita (importante o la luz de la cámara se queda prendida)
  function cerrar() {
    stream.getTracks().forEach(function (t) { t.stop(); });
    fondo.remove();
  }
  btnCancelar.onclick = function () {
    descartar = true;
    if (grabador && grabador.state === 'recording') grabador.stop();
    cerrar();
  };
  btnAccion.onclick = function () {
    if (modo === 'foto') {
      // dibujo el frame actual del video en un canvas y lo convierto en imagen
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      ponerAdjunto({ tipo: 'imagen', src: canvas.toDataURL('image/jpeg') });
      cerrar();
    } else {
      // modo video: el primer click empieza a grabar, el segundo detiene
      if (!grabador) {
        if (typeof MediaRecorder === 'undefined') {
          mostrarMensaje('Tu navegador no puede grabar video :(');
          cerrar();
          return;
        }
        grabador = new MediaRecorder(stream);
        grabador.ondataavailable = function (e) { pedazos.push(e.data); };
        grabador.onstop = function () {
          if (descartar) return;
          const blob = new Blob(pedazos, { type: 'video/webm' });
          ponerAdjunto({ tipo: 'video', src: URL.createObjectURL(blob) });
          cerrar();
        };
        grabador.start();
        btnAccion.textContent = '■ Detener';
      } else {
        grabador.stop();
      }
    }
  };
}
//  Elegir archivos (canción, outfit, momento) 
// Creo un input de archivos escondido y se "toca" con js
const selectorArchivo = document.createElement('input');
selectorArchivo.type = 'file';
selectorArchivo.style.display = 'none';
document.body.appendChild(selectorArchivo);
let tipoArchivo = ''; // para saber qué estaban eligiendo
function pedirArchivo(accept, tipo) {
  tipoArchivo = tipo;
  selectorArchivo.accept = accept;
  selectorArchivo.value = '';
  selectorArchivo.click();
}
selectorArchivo.addEventListener('change', function () {
  const archivo = selectorArchivo.files[0];
  if (!archivo) return; // si no eligieron nada
  const url = URL.createObjectURL(archivo); // link temporal para ver el archivo
  if (tipoArchivo === 'momento') {
    // los momentos se agregan directo, antes del botón "+"
    const img = document.createElement('img');
    img.src = url;
    img.width = 300;
    img.alt = 'Momento nuevo';
    document.getElementById('agregar-momento').before(img);
    mostrarAviso('¡Momento agregado! ♡');
  } else {
    ponerAdjunto({ tipo: tipoArchivo, src: url, nombre: archivo.name });
  }
});
// Vista previa de lo que se va a publicar 
function ponerAdjunto(obj) {
  adjunto = obj;
  mostrarVistaPrevia();
}
// crea la etiqueta que corresponde (img, video o audio)
function crearMedia(adj, ancho) {
  let el;
  if (adj.tipo === 'video') {
    el = document.createElement('video');
    el.controls = true;
  } else if (adj.tipo === 'audio') {
    el = document.createElement('audio');
    el.controls = true;
  } else {
    el = document.createElement('img'); // foto u outfit
    el.alt = 'Publicación';
  }
  el.src = adj.src;
  el.style.maxWidth = ancho;
  return el;
}
function mostrarVistaPrevia() {
  let caja = document.getElementById('vista-previa');
  if (!caja) {                       // si no existe todavía, se crea
    caja = document.createElement('div');
    caja.id = 'vista-previa';
    caja.style.margin = '10px 0';
    mensaje.before(caja);
  }
  caja.innerHTML = '';               // se limpia lo que había
  if (!adjunto) return;
  caja.appendChild(crearMedia(adjunto, '200px'));
  const quitar = document.createElement('button');
  quitar.textContent = 'Quitar ✕';
  quitar.onclick = function () {
    adjunto = null;
    mostrarVistaPrevia();
  };
  caja.appendChild(quitar);
}
//  Crear la publicación nueva
function publicar() {
  const texto = inputPublicar.value.trim();
  // no se puede publicar vacío
  if (texto === '' && !adjunto) {
    mostrarMensaje('Escribe algo o agrega una foto primero ♡');
    return;
  }
  const post = document.createElement('article');
  post.className = 'publicación';
  // el texto del usuario se pone después con textContent (así no se puede meter código raro)
  post.innerHTML =
    '<header class="encabezado-publicación">' +
      '<img src="img/perfil.jpg" width="300px" class="foto-perfil">' +
      '<div><b>' + MI_USUARIO + ' <em>♡</em></b><small>Ahora</small></div>' +
      '<button class="más-opciones">···</button>' +
    '</header>' +
    '<p class="decripción"></p>' +
    '<div class="fotos"></div>' +
    '<div class="interacción">' +
      '<button class="like">♡ <b>0</b></button>' +
      '<button>☏ <b>0</b></button>' +
      '<button>⇄</button>' +
      '<button class="favoritos">♧</button>' +
    '</div>' +
    '<div class="comentarios">' +
      '<form><input placeholder="Escribe un comentario..."><button>➤</button></form>' +
    '</div>';
}
post.querySelector('.decripción').textContent = texto;
  const zonaFotos = post.querySelector('.fotos');
  if (adjunto) {
    zonaFotos.appendChild(crearMedia(adjunto, '300px'));
  } else {
    zonaFotos.remove(); // si no hay foto, quito el espacio vacío
  }
  // La pongo arriba de todo en el feed (antes de la primera publicación que ya existe)
  const primera = feed.querySelector('article.publicación, article.panel-publicación');
  if (primera) {
    primera.before(post);
  } else {
    feed.appendChild(post);
  }
  // Y una copia en la sección Tablero
  const tablero = buscarPagina('Tablero');
  if (tablero) {
    const primeraTablero = tablero.querySelector('article');
    const copia = post.cloneNode(true);
    if (primeraTablero) primeraTablero.before(copia);
    else tablero.appendChild(copia);
  }
  // Si era un outfit también va a Mi armario
  if (adjunto && adjunto.tipo === 'outfit') {
    const armario = buscarPagina('Mi armario');
    if (armario) {
      const img = document.createElement('img');
      img.src = adjunto.src;
      img.width = 300;
      img.height = 300;
      img.alt = 'Outfit nuevo';
      armario.appendChild(img);
    }
  }
  // Si era una canción también va a la Playlist
  if (adjunto && adjunto.tipo === 'audio') {
    const playlist = buscarPagina('Playlist vibes');
    if (playlist) {
      const lista = playlist.querySelector('.canciones');
      const cancion = document.createElement('div');
      cancion.className = 'canción';
      const nombre = document.createElement('p');
      nombre.textContent = adjunto.nombre || 'Mi canción';
      cancion.appendChild(nombre);
      cancion.appendChild(crearMedia(adjunto, '300px'));
      if (lista) lista.appendChild(cancion);
      else playlist.appendChild(cancion);
    }
  // limpio todo para la próxima publicación
  inputPublicar.value = '';
  adjunto = null;
  mostrarVistaPrevia();
  mostrarMensaje('¡Publicado! ♡');
}
// También se puede publicar con Enter
inputPublicar.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') publicar();
});
// Guarda o quita una publicación de "Guardados"
function alternarGuardado(post) {
  const autor = post.querySelector('header b').textContent.replace('♡', '').trim();
  const p = post.querySelector('.decripción');
  const texto = p ? p.textContent : '(solo fotos)';
  const boton = post.querySelector('.favoritos');

  // busco si ya estaba guardada
  const posicion = guardados.findIndex(function (g) { return g.autor === autor && g.texto === texto; });

  if (posicion >= 0) {
    guardados.splice(posicion, 1); // la quito de la lista
    if (boton) boton.textContent = '♧';
    mostrarAviso('Quitada de guardados');
  } else {
    guardados.push({ autor: autor, texto: texto });
    if (boton) boton.textContent = '♣';
    mostrarAviso('Publicación guardada ♡');
  }
}

// Si la publicación no tiene sección de comentarios, se la creo
function asegurarComentarios(post) {
  let caja = post.querySelector('.comentarios');
  if (!caja) {
    caja = document.createElement('div');
    caja.className = 'comentarios';
    caja.innerHTML = '<form><input placeholder="Escribe un comentario..."><button>➤</button></form>';
    post.appendChild(caja);
  }
  return caja;
}

// Cuando mandan un comentario (uso 'submit' del formulario)
document.addEventListener('submit', function (e) {
  const form = e.target;
  if (!form.closest('.comentarios')) return;
  e.preventDefault(); // para que la página no se recargue
  const input = form.querySelector('input');
  const texto = input.value.trim();
  if (texto === '') return;
  // armo el comentario nuevo igual que los que ya están
  const p = document.createElement('p');
  p.innerHTML = '<img src="img/perfil.jpg" width="100px" class="avatar-pequeño"><span><b></b><br></span>';
  p.querySelector('b').textContent = miUsuario;
  p.querySelector('span').append(texto);
  form.before(p);
  input.value = '';
  // le sumo 1 al contador de comentarios (el botón ☏)
  const post = form.closest('article');
  const acciones = post.querySelector('.interacción, .publicación-acciones');
  if (acciones) {
    const botones = acciones.querySelectorAll('button');
    const contador = botones[1] ? botones[1].querySelector('b') : null;
    if (contador) contador.textContent = parseInt(contador.textContent) + 1;
  }
});
function cerrarMenu() {
  if (menuAbierto) {
    menuAbierto.remove();
    menuAbierto = null;
  }
}

function abrirMenu(boton) {
  // si ya estaba abierto el de este botón, lo cierro y listo
  if (menuAbierto && menuAbierto._boton === boton) {
    cerrarMenu();
    return;
  }
  cerrarMenu();
  const post = boton.closest('article');
  const autor = post.querySelector('header b').textContent.replace('♡', '').trim();
  const yaGuardada = post.querySelector('.favoritos') && post.querySelector('.favoritos').textContent === '♣';
  // lista de opciones: cada una tiene el texto y lo que hace
  const opciones = [
    { texto: yaGuardada ? '♣ Quitar de guardados' : '♧ Guardar publicación', accion: function () { alternarGuardado(post); } },
    { texto: '🔗 Copiar enlace', accion: function () {
        // intento copiar al portapapeles (puede que no funcione en todos los navegadores)
        if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
        mostrarAviso('Enlace copiado ♡');
    } },
    { texto: '🔕 Silenciar a ' + autor, accion: function () { mostrarAviso('Silenciaste a ' + autor); } },
    { texto: '⚑ Reportar', accion: function () { mostrarAviso('Gracias por reportar, lo vamos a revisar'); } },
    { texto: '✕ Ocultar publicación', accion: function () { post.dataset.ocultado = 'si'; refrescar(post); } }
  ];
  // si la publicación es mía, también puedo eliminarla
  if (autor === miUsuario) {
    opciones.push({ texto: '🗑 Eliminar', accion: function () {
        if (confirm('¿Seguro que quieres eliminar esta publicación?')) post.remove();
    } });
  }
  // creo el menú con js
  const menu = document.createElement('div');
  menu.className = 'menu-opciones-lt';
  menu._boton = boton; // me guardo el botón para saber de quién es
  const pos = boton.getBoundingClientRect();
  menu.style.cssText = 'position:absolute;background:white;border:1px solid #ffc0d9;border-radius:12px;padding:5px;z-index:9997;box-shadow:0 4px 12px rgba(0,0,0,0.15);' +
    'top:' + (pos.bottom + window.scrollY) + 'px;left:' + (pos.right + window.scrollX - 200) + 'px;width:200px;';
  opciones.forEach(function (op) {
    const b = document.createElement('button');
    b.textContent = op.texto;
    b.style.cssText = 'display:block;width:100%;text-align:left;background:none;border:none;padding:8px;cursor:pointer;';
    b.onclick = function () {
      op.accion();
      cerrarMenu();
    };
    menu.appendChild(b);
  });
  document.body.appendChild(menu);
  menuAbierto = menu;
}
// con la tecla Esc también se cierra
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') cerrarMenu();
});






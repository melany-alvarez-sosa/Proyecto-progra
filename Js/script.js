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
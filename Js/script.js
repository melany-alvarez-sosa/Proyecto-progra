const feed = document.querySelector('main.feed');              // parte de "Inicio"
const botonesNav = document.querySelectorAll('.nav-link');     // botones del menú de la izquierda
const inputBuscar = document.querySelector('.buscador input'); //  barra de búsqueda
const inputPublicar = document.getElementById('texto-publicación');
const botonPublicar = document.getElementById('botón-publicar');
const mensaje = document.getElementById('mensaje');         
const miUsuario = '16.va_l';                                  // mi usuario (el del perfil)

let adjunto = null;     // aquí guardo la foto/video/canción que quiero publicar
let expandido = { outfits: false, canciones: false };  // para saber si ya tocaron "Ver todos"
let buscando = false;   // para saber si hay algo escrito en el buscador
let guardados = [];     // publicaciones guardadas (para la sección Guardados)
let menuAbierto = null;
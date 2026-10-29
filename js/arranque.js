// Se carga en el <head> sin defer: tiene que correr antes de que la página se pinte.
// Oculta el contenido para animarlo; si main.js no carga en 2 s, lo muestra igual.
document.documentElement.classList.add('js');
setTimeout(function () {
  if (!window.landingLista) document.documentElement.classList.remove('js');
}, 2000);

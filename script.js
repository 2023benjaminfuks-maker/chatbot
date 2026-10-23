// Referencias a los elementos del boceto por sus nombres exactos
const chatSection = document.getElementById('chat');
const opcionesSection = document.getElementById('opciones');
const respuestasSection = document.getElementById('respuestas');

// Estado interno del bot para recordar elecciones del usuario
let arbolDecision = null;
let estadoUsuario = {
  nombre: '',
  elecciones: {}
};

// Cargar el árbol de conversación mediante fetch
fetch('arbol_decision.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo JSON.');
    }
    return response.json();
  })
  .then(data => {
    arbolDecision = data;
    // Iniciar conversación en el nodo inicial
    irANodo('inicio');
  })
  .catch(error => {
    console.error(error);
    mostrarMensajeError(
      'Abrí el proyecto con Live Server o un servidor local para que pueda leer arbol_decision.json'
    );
  });

// Función principal para navegar por los nodos del árbol
function irANodo(idNodo) {
  const nodo = arbolDecision[idNodo];

  if (!nodo) {
    console.error(`El nodo "${idNodo}" no existe en el árbol.`);
    return;
  }

  // Formatear el texto reemplazando variables recordadas
  let textoProcesado = nodo.texto.replace('{nombre}', estadoUsuario.nombre || '');

  // Agregar mensaje del bot al chat
  agregarMensaje(textoProcesado, 'bot');

  // Limpiar panel de opciones
  opcionesSection.innerHTML = '';

  // Renderizar entradas o botones según el tipo de nodo
  if (nodo.tipo === 'input') {
    renderizarInput(nodo);
  } else if (nodo.opciones) {
    renderizarOpciones(nodo.opciones);
  }

  actualizarRespuestasFooter();
}

// Renderizar campo input cuando es necesario ingresar un dato
function renderizarInput(nodo) {
  const container = document.createElement('div');
  container.className = 'input-container';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Escribí tu respuesta acá...';

  const btnEnviar = document.createElement('button');
  btnEnviar.className = 'btn-enviar';
  btnEnviar.textContent = 'Enviar';

  btnEnviar.onclick = () => {
    const valor = input.value.trim();

    // Validaciones del dato ingresado
    if (nodo.validar === 'nombre') {
      const contieneNumeros = /\d/.test(valor);
      if (!valor || contieneNumeros) {
        alert('Por favor, ingresá un nombre válido (solo letras, sin números).');
        return;
      }
      estadoUsuario.nombre = valor;
    }

    agregarMensaje(valor, 'user');
    irANodo(nodo.siguiente);
  };

  container.appendChild(input);
  container.appendChild(btnEnviar);
  opcionesSection.appendChild(container);
}

// Renderizar botones de navegación
function renderizarOpciones(opciones) {
  opciones.forEach(opcion => {
    const btn = document.createElement('button');
    btn.className = 'btn-opcion';
    btn.textContent = opcion.texto;

    btn.onclick = () => {
      // Agregar elección al historial visual
      agregarMensaje(opcion.texto, 'user');

      // Si la opción guarda un recuerdo
      if (opcion.recuerda) {
        Object.assign(estadoUsuario.elecciones, opcion.recuerda);
      }

      // Si requiere reinicio completo del estado
      if (opcion.reset) {
        estadoUsuario = { nombre: '', elecciones: {} };
        chatSection.innerHTML = '';
      }

      irANodo(opcion.siguiente);
    };

    opcionesSection.appendChild(btn);
  });
}

// Agregar globo de mensaje al área de chat
function agregarMensaje(texto, emisor) {
  const msg = document.createElement('div');
  msg.className = `msg msg-${emisor}`;
  msg.textContent = texto;
  chatSection.appendChild(msg);
  chatSection.scrollTop = chatSection.scrollHeight;
}

// Mostrar alerta si falla la lectura del JSON
function mostrarMensajeError(texto) {
  const msg = document.createElement('div');
  msg.className = 'msg msg-error';
  msg.textContent = texto;
  chatSection.appendChild(msg);
}

// Actualizar la sección 'respuestas' (footer) con las elecciones recordadas
function actualizarRespuestasFooter() {
  const elecciones = Object.keys(estadoUsuario.elecciones);
  if (elecciones.length > 0) {
    respuestasSection.innerHTML = `<span>Temas vistos: ${elecciones.join(', ')}</span>`;
  } else {
    respuestasSection.innerHTML = `<span>Bot preparado.</span>`;
  }
}

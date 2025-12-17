// Catálogo de productos
const catalogo = [
  {
    id: 1,
    nombre: "Silla de madera",
    precio: 85990,
    descuentoAplicado: false,
    categoria: "Sillas",
    imagen: "/asset/img/silla/silla.webp",
    descripcion: "Silla de madera ideal para comedor pequeño",
  },

  {
    id: 2,
    nombre: "Mesa de comedor",
    precio: 1200000,
    descuentoAplicado: false,
    categoria: "Comedores",
    imagen: "/asset/img/mesa de comedor/mesaComedor.webp",
    descripcion: "Comedor para una familia",
  },

  {
    id: 3,
    nombre: "Arrimo con Respaldo",
    precio: 270000,
    descuentoAplicado: false,
    categoria: "Arrimos",
    imagen: "/asset/img/arrimo con respaldo/arrimo.webp",
    descripcion: "Hermoso arrimo para la entrada del hogar",
  },
  {
    id: 4,
    nombre: "Arrimo",
    precio: 180000,
    descuentoAplicado: false,
    categoria: "Arrimos",
    imagen: "/asset/img/arrimo/arrimo.webp",
    descripcion: "Un clasico arrimo, ideal para la entrada de un depto mediano",
  },
];

// Variables globales
let carrito = [];
const PASSWORD_MAESTRA = "1234";
let usuarioLogueado = false;
let descuentoAplicado = false;
let codigoDescuentoActual = "";

// Formateador de precios
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(precio);
};

// ============================================
// FUNCIONES DEL CARRITO
// ============================================

// Agregar producto al carrito
function agregarProducto(idProducto) {
  const producto = catalogo.find((p) => p.id === idProducto);
  if (producto) {
    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find((p) => p.id === idProducto);

    if (productoExistente) {
      // Incrementar cantidad si ya existe
      productoExistente.cantidad += 1;
    } else {
      // Crear copia del producto para el carrito
      const productoCarrito = {
        ...producto,
        cantidad: 1,
      };
      carrito.push(productoCarrito);
    }

    guardarCarritoEnStorage();
    actualizarInterfazCarrito();
    mostrarToast(`${producto.nombre} agregado al carrito`, "success");
  }
}

// Quitar producto del carrito
function quitarProducto(idProducto) {
  const index = carrito.findIndex((p) => p.id === idProducto);
  if (index >= 0) {
    const producto = carrito[index];
    carrito.splice(index, 1);
    guardarCarritoEnStorage();
    actualizarInterfazCarrito();
    mostrarToast(`${producto.nombre} eliminado del carrito`, "warning");
  }
}

// Cambiar cantidad de un producto
function cambiarCantidad(idProducto, cambio) {
  const producto = carrito.find((p) => p.id === idProducto);
  if (producto) {
    const nuevaCantidad = producto.cantidad + cambio;
    if (nuevaCantidad > 0) {
      producto.cantidad = nuevaCantidad;
      guardarCarritoEnStorage();
      actualizarInterfazCarrito();
    } else if (nuevaCantidad === 0) {
      quitarProducto(idProducto);
    }
  }
}

// Aplicar descuento
function aplicarDescuento(codigoDescuento) {
  if (codigoDescuento === "DESC15") {
    descuentoAplicado = true;
    codigoDescuentoActual = codigoDescuento;
    guardarCarritoEnStorage();
    actualizarInterfazCarrito();
    mostrarToast("¡Descuento del 15% aplicado!", "success");
    return true;
  } else {
    descuentoAplicado = false;
    codigoDescuentoActual = "";
    guardarCarritoEnStorage();
    actualizarInterfazCarrito();
    if (codigoDescuento) {
      mostrarToast("Código de descuento inválido", "danger");
    }
    return false;
  }
}

// Aplicar descuento desde el input
function aplicarDescuentoCarrito() {
  const codigoInput = document.getElementById("codigo-descuento");
  const aplicado = aplicarDescuento(codigoInput.value.trim().toUpperCase());
  if (aplicado) {
    codigoInput.value = "";
    codigoInput.disabled = true;
  }
}

// Calcular subtotal
function calcularSubtotal() {
  return carrito.reduce(
    (total, producto) => total + producto.precio * producto.cantidad,
    0
  );
}

// Calcular total con descuento
function calcularTotal() {
  const subtotal = calcularSubtotal();
  if (descuentoAplicado) {
    return Math.round(subtotal * 0.85); // 15% de descuento
  }
  return subtotal;
}

// Vaciar carrito completo
function vaciarCarrito() {
  if (carrito.length > 0 && confirm("¿Estás seguro de vaciar el carrito?")) {
    carrito = [];
    descuentoAplicado = false;
    codigoDescuentoActual = "";
    document.getElementById("codigo-descuento").disabled = false;
    document.getElementById("codigo-descuento").value = "";
    guardarCarritoEnStorage();
    actualizarInterfazCarrito();
    mostrarToast("Carrito vaciado", "info");
  }
}

// Actualizar toda la interfaz del carrito
function actualizarInterfazCarrito() {
  renderizarCarrito();
  actualizarContadorCarrito();
  actualizarTotalCarrito();
}

// Renderizar tabla del carrito - CORREGIDO
function renderizarCarrito() {
  const tbody = document.getElementById("tabla-carrito");
  const carritoVacio = document.getElementById("carrito-vacio");

  if (carrito.length === 0) {
    tbody.innerHTML = "";
    // Clonar el elemento carrito-vacio para asegurar que esté presente
    const carritoVacioClon = carritoVacio.cloneNode(true);
    carritoVacioClon.id = "carrito-vacio";
    tbody.appendChild(carritoVacioClon);
    carritoVacioClon.style.display = "";
    return;
  }

  // Limpiar tabla
  tbody.innerHTML = "";

  // Generar filas para cada producto en el carrito
  carrito.forEach((producto) => {
    const tr = document.createElement("tr");
    tr.className = "fade-in";
    tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${producto.imagen}" alt="${producto.nombre}" 
                         class="img-thumbnail me-3" style="width: 60px; height: 60px; object-fit: cover;">
                    <div>
                        <strong>${producto.nombre}</strong><br>
                        <small class="text-muted">${
                          producto.descripcion
                        }</small>
                    </div>
                </div>
            </td>
            <td>${formatearPrecio(producto.precio)}</td>
            <td>
                <div class="input-group input-group-sm" style="width: 120px;">
                    <button class="btn btn-outline-secondary" type="button" 
                            onclick="cambiarCantidad(${
                              producto.id
                            }, -1)">-</button>
                    <input type="text" class="form-control text-center" 
                           value="${producto.cantidad}" readonly>
                    <button class="btn btn-outline-secondary" type="button" 
                            onclick="cambiarCantidad(${
                              producto.id
                            }, 1)">+</button>
                </div>
            </td>
            <td>${formatearPrecio(producto.precio * producto.cantidad)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="quitarProducto(${
                  producto.id
                })">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Actualizar contador del carrito en navbar
function actualizarContadorCarrito() {
  const totalItems = carrito.reduce(
    (total, producto) => total + producto.cantidad,
    0
  );
  document.getElementById("contador-carrito").textContent = totalItems;

  // Habilitar/deshabilitar botón vaciar carrito
  const btnVaciar = document.querySelector("#carrito button.btn-danger");
  if (btnVaciar) {
    btnVaciar.disabled = totalItems === 0;
  }
}

// Actualizar totales del carrito
function actualizarTotalCarrito() {
  const subtotal = calcularSubtotal();
  const total = calcularTotal();
  const descuento = subtotal - total;

  document.getElementById("subtotal").textContent = formatearPrecio(subtotal);
  document.getElementById("total").textContent = formatearPrecio(total);

  // Mostrar/ocultar fila de descuento
  const filaDescuento = document.getElementById("fila-descuento");
  const celdaDescuento = document.getElementById("descuento");

  if (descuentoAplicado && descuento > 0) {
    filaDescuento.style.display = "";
    celdaDescuento.textContent = `-${formatearPrecio(descuento)}`;
  } else {
    filaDescuento.style.display = "none";
  }
}

// ============================================
// STORAGE FUNCTIONS
// ============================================

// Guardar carrito en localStorage
function guardarCarritoEnStorage() {
  const carritoData = {
    items: carrito,
    descuento: descuentoAplicado,
    codigo: codigoDescuentoActual,
  };
  localStorage.setItem("carritoEcommerce", JSON.stringify(carritoData));
}

// Cargar carrito desde localStorage
function cargarCarritoDesdeStorage() {
  const carritoData = localStorage.getItem("carritoEcommerce");
  if (carritoData) {
    const data = JSON.parse(carritoData);
    carrito = data.items || [];
    descuentoAplicado = data.descuento || false;
    codigoDescuentoActual = data.codigo || "";

    // Habilitar/deshabilitar input de descuento
    if (descuentoAplicado) {
      document.getElementById("codigo-descuento").disabled = true;
    }
  }
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

// Mostrar modal de autenticación
function mostrarModal(tipo) {
  // Primero cerramos cualquier modal abierto
  const modalExistente = bootstrap.Modal.getInstance(
    document.getElementById("modalAuth")
  );
  if (modalExistente) {
    modalExistente.hide();
  }

  const modalElement = document.getElementById("modalAuth");
  const modal = new bootstrap.Modal(modalElement);
  const titulo = document.getElementById("modalTitulo");
  const btnAutenticar = document.getElementById("btn-autenticar");

  if (tipo === "login") {
    titulo.textContent = "Iniciar Sesión";
    btnAutenticar.textContent = "Ingresar";
    btnAutenticar.setAttribute("data-tipo", "login");
  } else {
    titulo.textContent = "Registrarse";
    btnAutenticar.textContent = "Registrar";
    btnAutenticar.setAttribute("data-tipo", "registro");
  }

  // Limpiar formulario
  document.getElementById("usuario").value = "";
  document.getElementById("password").value = "";
  document.getElementById("mensaje-error").style.display = "none";

  modal.show();
}

// Procesar autenticación
function procesarAutenticacion() {
  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value;
  const tipo = document
    .getElementById("btn-autenticar")
    .getAttribute("data-tipo");

  if (!usuario || !password) {
    mostrarError("Por favor completa todos los campos");
    return;
  }

  if (tipo === "login") {
    iniciarSesion(usuario, password);
  } else {
    registrarUsuario(usuario, password);
  }
}

// Iniciar sesión
function iniciarSesion(usuario, password) {
  if (password === PASSWORD_MAESTRA) {
    usuarioLogueado = true;
    actualizarEstadoUsuario(usuario);
    localStorage.setItem("usuarioEcommerce", usuario);

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalAuth")
    );
    if (modal) {
      modal.hide();
    }

    // Mostrar mensaje de bienvenida
    document.getElementById(
      "mensaje-bienvenida"
    ).textContent = `¡Bienvenido ${usuario}!`;
    document.getElementById("mensaje-bienvenida").style.display = "block";

    mostrarToast("Sesión iniciada correctamente", "success");
    console.log(`Usuario logueado: ${usuario}`);
  } else {
    mostrarError("Contraseña incorrecta. Intenta con 1234");
  }
}

// Registrar usuario (simulación)
function registrarUsuario(usuario, password) {
  if (password === PASSWORD_MAESTRA) {
    usuarioLogueado = true;
    actualizarEstadoUsuario(usuario);
    localStorage.setItem("usuarioEcommerce", usuario);

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalAuth")
    );
    if (modal) {
      modal.hide();
    }

    // Mostrar mensaje de bienvenida
    document.getElementById(
      "mensaje-bienvenida"
    ).textContent = `¡Cuenta creada y sesión iniciada, ${usuario}!`;
    document.getElementById("mensaje-bienvenida").style.display = "block";

    mostrarToast("Usuario registrado y sesión iniciada", "success");
    console.log(`Usuario registrado: ${usuario}`);
  } else {
    mostrarError("Para registro usa la contraseña maestra: 1234");
  }
}

// Cerrar sesión
function cerrarSesion() {
  usuarioLogueado = false;
  actualizarEstadoUsuario("");
  localStorage.removeItem("usuarioEcommerce");
  document.getElementById("mensaje-bienvenida").style.display = "none";
  mostrarToast("Sesión cerrada correctamente", "info");
}

// Actualizar estado del usuario en navbar
function actualizarEstadoUsuario(nombreUsuario) {
  const estadoUsuario = document.getElementById("estado-usuario");
  const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

  if (usuarioLogueado && nombreUsuario) {
    estadoUsuario.textContent = nombreUsuario;
    estadoUsuario.className = "text-success fw-bold";
    if (btnCerrarSesion) btnCerrarSesion.style.display = "block";
  } else {
    estadoUsuario.textContent = "Cuenta";
    estadoUsuario.className = "";
    if (btnCerrarSesion) btnCerrarSesion.style.display = "none";
  }
}

// Mostrar error en modal
function mostrarError(mensaje) {
  const errorDiv = document.getElementById("mensaje-error");
  errorDiv.textContent = mensaje;
  errorDiv.style.display = "block";
}

// ============================================
// FUNCIONES DE INTERFAZ
// ============================================

// Mostrar toast (notificación)
function mostrarToast(mensaje, tipo = "info") {
  // Crear toast dinámicamente
  const toastContainer = document.createElement("div");
  toastContainer.className = "position-fixed top-0 end-0 p-3";
  toastContainer.style.zIndex = "9999";

  const toastId = "toast-" + Date.now();
  toastContainer.innerHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${tipo} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

  document.body.appendChild(toastContainer);

  // Mostrar toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 3000,
  });
  toast.show();

  // Eliminar toast después de ocultarse
  toastElement.addEventListener("hidden.bs.toast", function () {
    if (toastContainer.parentNode) {
      toastContainer.remove();
    }
  });
}

// Renderizar catálogo de productos
function renderizarCatalogo() {
  const contenedor = document.getElementById("lista-productos");

  if (!contenedor) return;

  contenedor.innerHTML = catalogo
    .map(
      (producto) => `
        <div class="col-md-3 col-sm-6 mb-4">
            <div class="card card-producto h-100">
                <img src="${producto.imagen}" class="card-img-top" alt="${
        producto.nombre
      }">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-secondary mb-2 align-self-start">${
                      producto.categoria
                    }</span>
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text text-muted small">${
                      producto.descripcion
                    }</p>
                    <div class="mt-auto">
                        <p class="card-text fs-4 fw-bold text-primary">${formatearPrecio(
                          producto.precio
                        )}</p>
                        <button class="btn btn-primary w-100" onclick="agregarProducto(${
                          producto.id
                        })">
                            <i class="bi bi-cart-plus me-2"></i> Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Inicializar aplicación
function inicializarApp() {
  // Cargar datos desde localStorage
  cargarCarritoDesdeStorage();

  // Cargar usuario desde localStorage
  const usuarioGuardado = localStorage.getItem("usuarioEcommerce");
  if (usuarioGuardado) {
    usuarioLogueado = true;
    actualizarEstadoUsuario(usuarioGuardado);
    document.getElementById(
      "mensaje-bienvenida"
    ).textContent = `¡Bienvenido de nuevo ${usuarioGuardado}!`;
    document.getElementById("mensaje-bienvenida").style.display = "block";
  }

  // Renderizar catálogo
  renderizarCatalogo();

  // Inicializar carrito
  actualizarInterfazCarrito();

  // Configurar eventos
  const codigoDescuentoInput = document.getElementById("codigo-descuento");
  if (codigoDescuentoInput) {
    codigoDescuentoInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        aplicarDescuentoCarrito();
      }
    });
  }

  // Configurar formulario de autenticación para enviar con Enter
  const formAuth = document.getElementById("formAuth");
  if (formAuth) {
    formAuth.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        procesarAutenticacion();
      }
    });
  }

  console.log("Aplicación inicializada correctamente");
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Esperar a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // Pequeño delay para asegurar que Bootstrap esté cargado
  setTimeout(inicializarApp, 100);
});

// ===============================
// CATÁLOGO
// ===============================
const catalogo = [
  {
    id: 1,
    nombre: "Silla de madera",
    precio: 85990,
    categoria: "Sillas",
    imagen: "/asset/img/silla/silla.webp",
    descripcion: "Silla de madera ideal para comedor pequeño",
  },
  {
    id: 2,
    nombre: "Mesa de comedor",
    precio: 1200000,
    categoria: "Comedores",
    imagen: "/asset/img/mesa de comedor/mesaComedor.webp",
    descripcion: "Comedor para una familia",
  },
  {
    id: 3,
    nombre: "Arrimo con Respaldo",
    precio: 270000,
    categoria: "Arrimos",
    imagen: "/asset/img/arrimo con respaldo/arrimo.webp",
    descripcion: "Hermoso arrimo para la entrada del hogar",
  },
  {
    id: 4,
    nombre: "Arrimo",
    precio: 180000,
    categoria: "Arrimos",
    imagen: "/asset/img/arrimo/arrimo.webp",
    descripcion: "Un clasico arrimo, ideal para la entrada de un depto mediano",
  },
];

// ===============================
// ESTADO GLOBAL
// ===============================
const PASSWORD_MAESTRA = "1234";

let carrito = [];
let descuentoAplicado = false;
let usuarioLogueado = false;

// ===============================
// UTILIDADES
// ===============================
const $ = (id) => document.getElementById(id);

const precioCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(valor);

// ===============================
// STORAGE
// ===============================
function guardarEstado() {
  localStorage.setItem(
    "ecommerceTM",
    JSON.stringify({ carrito, descuentoAplicado })
  );
}

function cargarEstado() {
  const data = JSON.parse(localStorage.getItem("ecommerceTM"));
  if (data) {
    carrito = data.carrito || [];
    descuentoAplicado = data.descuentoAplicado || false;
    if (descuentoAplicado) $("codigo-descuento").disabled = true;
  }
}

// ===============================
// CARRITO
// ===============================
function agregarProducto(id) {
  const prod = catalogo.find((p) => p.id === id);
  const item = carrito.find((p) => p.id === id);

  item ? item.cantidad++ : carrito.push({ ...prod, cantidad: 1 });

  guardarEstado();
  renderCarrito();
}

function quitarProducto(id) {
  carrito = carrito.filter((p) => p.id !== id);
  guardarEstado();
  renderCarrito();
}

function cambiarCantidad(id, cambio) {
  const prod = carrito.find((p) => p.id === id);
  if (!prod) return;

  prod.cantidad += cambio;
  if (prod.cantidad <= 0) quitarProducto(id);

  guardarEstado();
  renderCarrito();
}

function aplicarDescuentoCarrito() {
  if ($("codigo-descuento").value === "DESC15") {
    descuentoAplicado = true;
    $("codigo-descuento").disabled = true;
    guardarEstado();
    renderCarrito();
  }
}

// ===============================
// RENDER
// ===============================
function renderCatalogo() {
  $("lista-productos").innerHTML = catalogo
    .map(
      (p) => `
    <div class="col-md-3 col-sm-6 mb-4">
      <div class="card h-100 card-producto">
        <img src="${p.imagen}" class="card-img-top">
        <div class="card-body d-flex flex-column">
          <span class="badge bg-secondary mb-2">${p.categoria}</span>
          <h5>${p.nombre}</h5>
          <p class="small text-muted">${p.descripcion}</p>
          <div class="mt-auto">
            <p class="fw-bold text-primary fs-5">${precioCLP(p.precio)}</p>
            <button class="btn btn-primary w-100"
              onclick="agregarProducto(${p.id})">
              <i class="bi bi-cart-plus"></i> Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function renderCarrito() {
  const tbody = $("tabla-carrito");

  if (carrito.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4">
          <i class="bi bi-cart-x display-1 text-muted"></i>
          <p>Tu carrito está vacío</p>
        </td>
      </tr>`;
    $("contador-carrito").textContent = 0;
    $("subtotal").textContent = "$0";
    $("total").textContent = "$0";
    return;
  }

  let subtotal = 0;
  let items = 0;

  tbody.innerHTML = carrito
    .map((p) => {
      subtotal += p.precio * p.cantidad;
      items += p.cantidad;

      return `
      <tr>
        <td>${p.nombre}</td>
        <td>${precioCLP(p.precio)}</td>
        <td>
          <button onclick="cambiarCantidad(${p.id},-1)">-</button>
          ${p.cantidad}
          <button onclick="cambiarCantidad(${p.id},1)">+</button>
        </td>
        <td>${precioCLP(p.precio * p.cantidad)}</td>
        <td>
          <button class="btn btn-sm btn-danger"
            onclick="quitarProducto(${p.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join("");

  const total = descuentoAplicado ? subtotal * 0.85 : subtotal;

  $("contador-carrito").textContent = items;
  $("subtotal").textContent = precioCLP(subtotal);
  $("total").textContent = precioCLP(total);
}

// ===============================
// LOGIN
// ===============================
function procesarAutenticacion() {
  const usuario = $("usuario").value.trim();
  const pass = $("password").value;

  if (pass !== PASSWORD_MAESTRA) {
    $("mensaje-error").style.display = "block";
    return;
  }

  usuarioLogueado = true;
  localStorage.setItem("usuarioEcommerce", usuario);
  $("estado-usuario").textContent = usuario;
  bootstrap.Modal.getInstance($("modalAuth")).hide();
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  cargarEstado();
  renderCatalogo();
  renderCarrito();
});

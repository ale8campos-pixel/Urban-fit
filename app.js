
const N8N_WEBHOOK_URL =
  "https://alecampos08.app.n8n.cloud/webhook/urban-fit-pedidos";
  
// Catálogo de productos
const products = [
  {
    id: 1,
    name: "Camiseta Essential",
    category: "Básicos",
    price: 8500,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2,
    name: "Camiseta Oversize",
    category: "Básicos",
    price: 10500,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3,
    name: "Hoodie Urban",
    category: "Sudaderas",
    price: 22900,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "Pantalón Cargo",
    category: "Pantalones",
    price: 19900,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "Blusa Minimal",
    category: "Mujer",
    price: 9900,
    image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "Leggings Flex",
    category: "Deportivo",
    price: 13900,
    image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 7,
    name: "Tenis Street",
    category: "Calzado",
    price: 29900,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 8,
    name: "Gorra Urban",
    category: "Accesorios",
    price: 6500,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80"
  }
];

// Carrito de compras
const cart = [];

// Formato de moneda costarricense
const money = amount =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0
  }).format(amount);

// Mostrar productos
function renderProducts() {
  document.getElementById("products").innerHTML = products.map(product => `
    <article class="product-card">
      <img
        class="product-image"
        src="${product.image}"
        alt="${product.name}"
        loading="lazy"
      >

      <div class="product-info">
        <p>${product.category}</p>
        <h3>${product.name}</h3>
        <p class="product-price">${money(product.price)}</p>

        <label for="size-${product.id}">Talla</label>
        <select id="size-${product.id}">
          <option>S</option>
          <option selected>M</option>
          <option>L</option>
          <option>XL</option>
          <option>Única</option>
        </select>

        <label for="qty-${product.id}">Cantidad</label>
        <input
          id="qty-${product.id}"
          type="number"
          min="1"
          max="10"
          value="1"
        >

        <button
          class="button"
          type="button"
          onclick="addToCart(${product.id})"
        >
          AGREGAR AL CARRITO
        </button>
      </div>
    </article>
  `).join("");
}

// Agregar producto al carrito
function addToCart(id) {
  const product = products.find(item => item.id === id);
  const size = document.getElementById(`size-${id}`).value;
  const quantity = Number(
    document.getElementById(`qty-${id}`).value
  );

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    alert("Selecciona una cantidad entre 1 y 10.");
    return;
  }

  const existingItem = cart.find(
    item => item.id === id && item.size === size
  );

  if (existingItem) {
    if (existingItem.quantity + quantity > 10) {
      alert("Máximo 10 unidades por producto y talla.");
      return;
    }

    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      size,
      quantity
    });
  }

  renderCart();
}

// Cambiar cantidad de un producto
function changeQuantity(index, amount) {
  if (!cart[index]) return;

  const newQuantity = cart[index].quantity + amount;

  if (newQuantity <= 0) {
    cart.splice(index, 1);
  } else if (newQuantity > 10) {
    alert("Máximo 10 unidades por producto y talla.");
    return;
  } else {
    cart[index].quantity = newQuantity;
  }

  renderCart();
}

// Eliminar producto del carrito
function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

// Actualizar carrito y totales
function renderCart() {
  const count = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const shipping = subtotal === 0 || subtotal >= 40000 ? 0 : 2000;
  const total = subtotal + shipping;

  document.getElementById("cart-count").textContent = count;
  document.getElementById("subtotal").textContent = money(subtotal);
  document.getElementById("shipping").textContent = money(shipping);
  document.getElementById("total").textContent = money(total);

  document.getElementById("cart-items").innerHTML = cart.length
    ? cart.map((item, index) => `
        <div class="cart-item">
          <div>
            <p><strong>${item.name}</strong></p>
            <p>Talla: ${item.size} · Cantidad: ${item.quantity}</p>
            <p>${money(item.price * item.quantity)}</p>
          </div>

          <div class="cart-actions">
            <button
              type="button"
              onclick="changeQuantity(${index}, -1)"
            >−</button>

            <button
              type="button"
              onclick="changeQuantity(${index}, 1)"
            >+</button>

            <button
              type="button"
              onclick="removeItem(${index})"
            >Eliminar</button>
          </div>
        </div>
      `).join("")
    : "<p>Tu carrito está vacío. ¡Explora la colección!</p>";
}

// Enviar pedido a n8n
document.getElementById("order-form").addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const form = event.currentTarget;
    const message = document.getElementById("message");

    if (cart.length === 0) {
      message.textContent = "Agrega productos antes de confirmar.";
      return;
    }

    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    const shipping = subtotal >= 40000 ? 0 : 2000;

    const order = {
      customer: form.elements["customer"].value.trim(),
      email: form.elements["email"].value.trim(),
      phone: form.elements["phone"].value.trim(),
      address: form.elements["address"].value.trim(),

      products: cart.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      })),

      subtotal,
      shipping,
      total: subtotal + shipping,
      createdAt: new Date().toISOString()
    };

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    message.textContent = "Enviando pedido...";

    try {
 const response = await fetch(N8N_WEBHOOK_URL, {
  method: "POST",
  body: new URLSearchParams({
    payload: JSON.stringify(order)
  })
});

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      message.textContent =
        "¡Pedido enviado correctamente a URBAN FIT!";

      // Vaciar el carrito después del envío exitoso
      cart.length = 0;
      renderCart();
      form.reset();

    } catch (error) {
      console.error("Error al enviar el pedido:", error);

      message.textContent =
        "No se pudo enviar el pedido. Revisa n8n y la conexión.";

    } finally {
      submitButton.disabled = false;
    }
  }
);

// Inicializar la página
renderProducts();
renderCart();
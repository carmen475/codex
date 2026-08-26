import "./styles.css";

const services = [
  {
    id: "service-one",
    name: "Service Package One",
    price: 49,
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80",
    description: "Replace this placeholder with your first real service.",
  },
  {
    id: "service-two",
    name: "Service Package Two",
    price: 89,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    description: "Use this card for another service, session, or package.",
  },
  {
    id: "service-three",
    name: "Service Package Three",
    price: 129,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80",
    description: "Edit the service list when your real offers are ready.",
  },
];

const state = {
  cart: { "service-one": 1 },
  step: "cart",
  customer: { name: "", email: "", address: "", city: "", state: "", zip: "" },
  payment: { name: "", number: "", exp: "", cvc: "", zip: "" },
  errors: {},
  order: null,
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const app = document.querySelector("#app");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cartItems() {
  return services.filter((service) => state.cart[service.id]).map((service) => ({ ...service, qty: state.cart[service.id] }));
}

function totals() {
  const subtotal = cartItems().reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.07 * 100) / 100;
  return { subtotal, tax, total: subtotal + tax };
}

function setStep(step) {
  state.step = step;
  state.errors = {};
  render();
}

function updateQty(id, change) {
  const next = (state.cart[id] || 0) + change;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = next;
  render();
}

function errorFor(name) {
  return state.errors[name] ? `<p class="error" id="${name}-error">${state.errors[name]}</p>` : "";
}

function attrsFor(name) {
  return state.errors[name] ? `aria-invalid="true" aria-describedby="${name}-error"` : "";
}

function validateCustomer() {
  const e = {};
  if (!state.customer.name.trim()) e.name = "Enter a name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customer.email)) e.email = "Enter a valid email.";
  if (!state.customer.address.trim()) e.address = "Enter an address.";
  if (!state.customer.city.trim()) e.city = "Enter a city.";
  if (!state.customer.state.trim()) e.state = "Enter a state.";
  if (!/^\d{5}$/.test(state.customer.zip)) e.zip = "Enter a 5-digit ZIP.";
  state.errors = e;
  return Object.keys(e).length === 0;
}

function validatePayment() {
  const e = {};
  const digits = state.payment.number.replace(/\D/g, "");
  const exp = state.payment.exp.match(/^(\d{2})\/(\d{2})$/);
  if (!state.payment.name.trim()) e.cardName = "Enter the name on the card.";
  if (digits.length !== 16) e.cardNumber = "Use a 16-digit test card.";
  if (!exp || Number(exp[1]) < 1 || Number(exp[1]) > 12) e.exp = "Use MM/YY format.";
  if (!/^\d{3,4}$/.test(state.payment.cvc)) e.cvc = "Use a 3 or 4 digit CVC.";
  if (!/^\d{5}$/.test(state.payment.zip)) e.billingZip = "Enter a 5-digit billing ZIP.";
  state.errors = e;
  return Object.keys(e).length === 0;
}

function submitCustomer(event) {
  event.preventDefault();
  if (validateCustomer()) setStep("payment");
  else render();
}

function submitPayment(event) {
  event.preventDefault();
  if (!validatePayment()) {
    render();
    return;
  }
  const digits = state.payment.number.replace(/\D/g, "");
  if (digits.endsWith("0002")) {
    state.step = "failed";
  } else {
    state.order = { id: `ORDER-${Date.now().toString().slice(-6)}`, totals: totals() };
    state.step = "success";
  }
  state.errors = {};
  render();
}

function summary() {
  const t = totals();
  return `
    <dl class="summary">
      <div><dt>Subtotal</dt><dd>${money.format(t.subtotal)}</dd></div>
      <div><dt>Estimated tax</dt><dd>${money.format(t.tax)}</dd></div>
      <div class="total"><dt>Total</dt><dd>${money.format(t.total)}</dd></div>
    </dl>
  `;
}

function serviceList() {
  return `
    <section class="products" aria-labelledby="services-title">
      <div class="heading">
        <p>Services</p>
        <h2 id="services-title">Placeholder service packages</h2>
      </div>
      <div class="grid">
        ${services
          .map(
            (service) => `
              <article class="product">
                <img src="${service.image}" alt="" loading="lazy" />
                <div class="product-body">
                  <h3>${service.name}</h3>
                  <p>${service.description}</p>
                </div>
                <div class="product-footer">
                  <strong>${money.format(service.price)}</strong>
                  <button data-action="add" data-id="${service.id}">Add</button>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function cartPanel() {
  const items = cartItems();
  return `
    <section class="panel" aria-labelledby="cart-title">
      <div class="heading">
        <p>Step 1</p>
        <h2 id="cart-title">Service order</h2>
      </div>
      ${
        items.length
          ? items
              .map(
                (item) => `
                  <div class="line">
                    <div><strong>${item.name}</strong><span>${money.format(item.price)} each</span></div>
                    <div class="qty">
                      <button aria-label="Remove one ${item.name}" data-action="down" data-id="${item.id}">-</button>
                      <span>${item.qty}</span>
                      <button aria-label="Add one ${item.name}" data-action="up" data-id="${item.id}">+</button>
                    </div>
                  </div>
                `,
              )
              .join("")
          : `<p class="muted">Your service order is empty.</p>`
      }
      ${summary()}
      <button class="primary full" data-action="details" ${items.length ? "" : "disabled"}>Continue to client details</button>
    </section>
  `;
}

function detailsForm() {
  const c = state.customer;
  return `
    <form class="panel form" data-form="details" novalidate>
      <div class="heading"><p>Step 2</p><h2>Client details</h2></div>
      <label>Full name<input name="name" value="${escapeHtml(c.name)}" ${attrsFor("name")} />${errorFor("name")}</label>
      <label>Email<input name="email" type="email" value="${escapeHtml(c.email)}" ${attrsFor("email")} />${errorFor("email")}</label>
      <label>Service or billing address<input name="address" value="${escapeHtml(c.address)}" ${attrsFor("address")} />${errorFor("address")}</label>
      <div class="row">
        <label>City<input name="city" value="${escapeHtml(c.city)}" ${attrsFor("city")} />${errorFor("city")}</label>
        <label>State<input name="state" maxlength="2" value="${escapeHtml(c.state)}" ${attrsFor("state")} />${errorFor("state")}</label>
        <label>ZIP<input name="zip" inputmode="numeric" value="${escapeHtml(c.zip)}" ${attrsFor("zip")} />${errorFor("zip")}</label>
      </div>
      <div class="actions">
        <button type="button" data-action="cart">Back</button>
        <button class="primary" type="submit">Continue to payment</button>
      </div>
    </form>
  `;
}

function paymentForm() {
  const p = state.payment;
  return `
    <form class="panel form" data-form="payment" novalidate>
      <div class="heading"><p>Step 3</p><h2>Safe test payment</h2></div>
      <p class="notice">Simulation only. Success card: <strong>4242 4242 4242 4242</strong>. Decline card: <strong>4000 0000 0000 0002</strong>.</p>
      <label>Name on card<input name="cardName" value="${escapeHtml(p.name)}" ${attrsFor("cardName")} />${errorFor("cardName")}</label>
      <label>Card number<input name="cardNumber" inputmode="numeric" value="${escapeHtml(p.number)}" ${attrsFor("cardNumber")} />${errorFor("cardNumber")}</label>
      <div class="row two">
        <label>Expiration<input name="exp" placeholder="12/30" value="${escapeHtml(p.exp)}" ${attrsFor("exp")} />${errorFor("exp")}</label>
        <label>CVC<input name="cvc" inputmode="numeric" value="${escapeHtml(p.cvc)}" ${attrsFor("cvc")}</label>
      </div>
      <label>Billing ZIP<input name="billingZip" inputmode="numeric" value="${escapeHtml(p.zip)}" ${attrsFor("billingZip")} />${errorFor("billingZip")}</label>
      ${summary()}
      <div class="actions">
        <button type="button" data-action="details">Back</button>
        <button class="primary" type="submit">Place test booking</button>
      </div>
    </form>
  `;
}

function resultPanel(success) {
  return `
    <section class="panel result ${success ? "" : "failed"}">
      <p class="badge">${success ? "Booking created" : "Payment declined"}</p>
      <h2>${success ? "Service checkout completed safely" : "Test payment failed"}</h2>
      <p>${success ? `Booking ${state.order.id} was created. No real charge was made.` : "The simulated bank declined this test card. Try the success card to finish the flow."}</p>
      ${success ? summary() : ""}
      <button class="primary full" data-action="restart">${success ? "Start another test" : "Try again"}</button>
    </section>
  `;
}

function activePanel() {
  if (state.step === "details") return detailsForm();
  if (state.step === "payment") return paymentForm();
  if (state.step === "success") return resultPanel(true);
  if (state.step === "failed") return resultPanel(false);
  return cartPanel();
}

function render() {
  const count = cartItems().reduce((sum, item) => sum + item.qty, 0);
  app.innerHTML = `
    <header>
      <div><p>Replace with your service business name</p><h1>Service Checkout Starter</h1></div>
      <button class="cart" data-action="cart">Order <span>${count}</span></button>
    </header>
    <main>
      <section class="hero">
        <p>Safe checkout demo</p>
        <h2>A starter checkout flow you can customize for your service business.</h2>
        <p>Service packages, order edits, client validation, simulated payment success, and simulated decline are included.</p>
      </section>
      <div class="layout">
        ${serviceList()}
        ${activePanel()}
      </div>
    </main>
  `;
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || button.disabled) return;
  const { action, id } = button.dataset;
  if (action === "add" || action === "up") updateQty(id, 1);
  if (action === "down") updateQty(id, -1);
  if (["cart", "details", "payment"].includes(action)) setStep(action);
  if (action === "restart") {
    state.cart = { "service-one": 1 };
    state.step = "cart";
    state.customer = { name: "", email: "", address: "", city: "", state: "", zip: "" };
    state.payment = { name: "", number: "", exp: "", cvc: "", zip: "" };
    state.errors = {};
    state.order = null;
    render();
  }
});

app.addEventListener("input", (event) => {
  const field = event.target;
  if (!field.name) return;
  if (field.closest("[data-form='details']")) state.customer[field.name] = field.value;
  if (field.closest("[data-form='payment']")) {
    const key = { cardName: "name", cardNumber: "number", billingZip: "zip" }[field.name] || field.name;
    state.payment[key] = field.value;
  }
});

app.addEventListener("submit", (event) => {
  if (event.target.matches("[data-form='details']")) submitCustomer(event);
  if (event.target.matches("[data-form='payment']")) submitPayment(event);
});

render();

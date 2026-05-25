// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
const cartKey = "matrixCart";
const orderKey = "matrixOrders";

function getCart() {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
}

function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const countElement = document.getElementById("cartCount");
    const cart = getCart();
    let total = 0;

    cart.forEach(item => {
        total += item.amount;
    });

    if (countElement) {
        countElement.textContent = total;
    }
}

function showToast(text) {
    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = text;
    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 2000);
}

function formatMoney(value) {
    return new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR"
    }).format(value);
}

function addToCart(id, name, price) {
    const cart = getCart();
    let product = cart.find(item => item.id === id);

    if (product) {
        product.amount++;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            amount: 1
        });
    }

    saveCart(cart);
    showToast(name + " is toegevoegd.");
}

function renderCart() {
    const emptyCart = document.getElementById("emptyCart");
    const cartTable = document.getElementById("cartTable");
    const cartLines = document.getElementById("cartLines");
    const cartTotal = document.getElementById("cartTotal");
    const orderButton = document.getElementById("placeOrderButton");

    if (!cartLines) {
        return;
    }

    const cart = getCart();
    cartLines.innerHTML = "";

    if (cart.length === 0) {
        emptyCart.classList.remove("hidden");
        cartTable.classList.add("hidden");
        orderButton.classList.add("hidden");
        return;
    }

    emptyCart.classList.add("hidden");
    cartTable.classList.remove("hidden");
    orderButton.classList.remove("hidden");

    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.amount;
        total += subtotal;

        cartLines.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${formatMoney(item.price)}</td>
                <td>
                    <button class="small-button" onclick="changeAmount('${item.id}', -1)">-</button>
                    ${item.amount}
                    <button class="small-button" onclick="changeAmount('${item.id}', 1)">+</button>
                </td>
                <td>${formatMoney(subtotal)}</td>
                <td><button class="small-button danger" onclick="removeFromCart('${item.id}')">Verwijderen</button></td>
            </tr>
        `;
    });

    cartTotal.textContent = formatMoney(total);
}

function changeAmount(id, change) {
    let cart = getCart();
    let product = cart.find(item => item.id === id);

    if (!product) {
        return;
    }

    product.amount += change;

    if (product.amount <= 0) {
        cart = cart.filter(item => item.id !== id);
    }

    saveCart(cart);
    renderCart();
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    renderCart();
}

function placeOrder() {
    const cart = getCart();

    if (cart.length === 0) {
        return;
    }

    const orders = JSON.parse(localStorage.getItem(orderKey)) || [];
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.amount;
    });

    orders.push({
        number: "ORD-" + (orders.length + 1),
        date: new Date().toLocaleDateString("nl-NL"),
        products: cart.map(item => item.amount + "x " + item.name).join(", "),
        total: total
    });

    localStorage.setItem(orderKey, JSON.stringify(orders));
    saveCart([]);
    renderCart();
    showToast("Bestelling geplaatst.");
}

function renderHistory() {
    const emptyHistory = document.getElementById("emptyHistory");
    const historyTable = document.getElementById("historyTable");
    const historyLines = document.getElementById("historyLines");

    if (!historyLines) {
        return;
    }

    const orders = JSON.parse(localStorage.getItem(orderKey)) || [];
    historyLines.innerHTML = "";

    if (orders.length === 0) {
        emptyHistory.classList.remove("hidden");
        historyTable.classList.add("hidden");
        return;
    }

    emptyHistory.classList.add("hidden");
    historyTable.classList.remove("hidden");

    orders.forEach(order => {
        historyLines.innerHTML += `
            <tr>
                <td>${order.number}</td>
                <td>${order.date}</td>
                <td>${order.products}</td>
                <td>${formatMoney(order.total)}</td>
            </tr>
        `;
    });
}

function filterProducts() {
    const searchInput = document.getElementById("searchInput");
    const categorySelect = document.getElementById("categorySelect");
    const products = document.querySelectorAll(".product-card");

    if (!searchInput || !categorySelect) {
        return;
    }

    const searchText = searchInput.value.toLowerCase();
    const category = categorySelect.value;

    products.forEach(product => {
        const name = product.dataset.name;
        const number = product.dataset.number.toLowerCase();
        const productCategory = product.dataset.category;

        const matchesSearch = name.includes(searchText) || number.includes(searchText);
        const matchesCategory = category === "alles" || category === productCategory;

        if (matchesSearch && matchesCategory) {
            product.classList.remove("hidden");
        } else {
            product.classList.add("hidden");
        }
    });
}

document.querySelectorAll(".add-button").forEach(button => {
    button.addEventListener("click", () => {
        addToCart(
            button.dataset.id,
            button.dataset.name,
            Number(button.dataset.price)
        );
    });
});

const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const orderButton = document.getElementById("placeOrderButton");

if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
}

if (categorySelect) {
    categorySelect.addEventListener("change", filterProducts);
}

if (orderButton) {
    orderButton.addEventListener("click", placeOrder);
}

updateCartCount();
renderCart();
renderHistory();
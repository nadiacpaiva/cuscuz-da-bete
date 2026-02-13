let cart = [];
const DELIVERY_FEE = 7.50;
const statusLoja = document.getElementById('status-loja');

function checkOpeningHours() {
    const now = new Date();
    const day = now.getDay(); 
    const hour = now.getHours();
    const isOpenDay = [5, 6, 0].includes(day);
    const isOpenHour = (hour >= 18 && hour < 21);

    if (isOpenDay && isOpenHour) {
        statusLoja.textContent = "ABERTO";
        statusLoja.classList.add('open');
    } else {
        statusLoja.textContent = "FECHADO";
        statusLoja.classList.add('closed');
    }
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
    updateCartUI(); // Garante que o total esteja certo ao abrir
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        updateCartUI();
    });
});

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalValue = document.getElementById('cart-total-value');
    const deliveryFeeDisplay = document.getElementById('delivery-fee-display');
    const isDelivery = document.querySelector('input[name="order-type"]:checked').value === "Delivery";
    
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    let count = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        count += item.quantity;
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <div><strong>${item.name}</strong><br>${item.quantity}x R$ ${item.price.toFixed(2)}</div>
                <div><span>R$ ${itemTotal.toFixed(2)}</span><button class="remove-item" onclick="removeFromCart(${index})">❌</button></div>
            </div>`;
    });

    // Cálculo do Total com Taxa Condicional
    let totalFinal = subtotal;
    if (isDelivery && cart.length > 0) {
        totalFinal += DELIVERY_FEE;
        deliveryFeeDisplay.style.display = 'block';
    } else {
        deliveryFeeDisplay.style.display = 'none';
    }

    cartCount.textContent = count;
    cartTotalValue.textContent = totalFinal.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function toggleAddress(show) {
    document.getElementById('address-fields').style.display = show ? 'block' : 'none';
    updateCartUI(); // Recalcula o total para somar/remover a taxa
}

function finalizeOrder() {
    const clientName = document.getElementById('client-name').value;
    const orderType = document.querySelector('input[name="order-type"]:checked').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;
    const totalDisplay = document.getElementById('cart-total-value').textContent;

    if (cart.length === 0) { alert("Carrinho vazio!"); return; }
    if (clientName.trim() === "") { alert("Informe seu nome!"); return; }
    
    let addressInfo = "";
    let phoneInfo = "";

    if (orderType === "Delivery") {
        const clientPhone = document.getElementById('client-phone').value;
        const number = document.getElementById('house-number').value;

        // Validações apenas para Delivery
        if (clientPhone.trim() === "") { alert("Telefone obrigatório para Delivery!"); return; }
        if (!number) { alert("Número da casa obrigatório!"); return; }

        phoneInfo = `\n📞 *Telefone:* ${clientPhone}`;
        addressInfo = `\n📍 *Endereço:* ${document.getElementById('street').value}, Nº ${number} (${document.getElementById('complement').value})`;
    }

    // Montagem da Mensagem
    let message = `*PEDIDO - CUSCUZ DA BETE*\n`;
    message += `👤 *Cliente:* ${clientName}${phoneInfo}\n`; // Telefone aparece aqui se for delivery
    message += `--------------------------\n`;
    cart.forEach(item => {
        message += `✅ ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `--------------------------\n`;
    if(orderType === "Delivery") message += `🚚 *Taxa de Entrega:* R$ 7,50\n`;
    message += `💰 *Total Geral:* R$ ${totalDisplay}\n`;
    message += `🛵 *Tipo:* ${orderType}${addressInfo}\n`;
    message += `💳 *Pagamento:* ${payment}\n`;
    message += `🕒 *Tempo Estimado:* 30 a 40 min`;

    window.open(`https://wa.me/5516997958489?text=${encodeURIComponent(message)}`, '_blank');
}

window.onload = () => { checkOpeningHours(); };

function toggleMenu() {
  const navLinks = document.querySelector(".nav-links");
  const menuToggle = document.querySelector(".menu-toggle");

  navLinks.classList.toggle("active");

  // Troca ícone
  if (navLinks.classList.contains("active")) {
    menuToggle.textContent = "✖";
  } else {
    menuToggle.textContent = "☰";
  }
}

// Fecha menu ao clicar em um link
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    const navLinks = document.querySelector(".nav-links");
    const menuToggle = document.querySelector(".menu-toggle");

    navLinks.classList.remove("active");
    menuToggle.textContent = "☰";
  });
});


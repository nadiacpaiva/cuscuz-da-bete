let cart = [];
const DELIVERY_FEE = 7.50;
const statusLoja = document.getElementById('status-loja');

// Lista de adicionais configurada conforme solicitado
const EXTRA_OPTIONS = [
    { name: "Ovo", price: 3.00 },
    { name: "Bacon", price: 8.00 },
    { name: "Carne seca", price: 8.00 },
    { name: "Creme de queijo", price: 5.00 },
    { name: "Calabresa", price: 5.00 }
];

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
    updateCartUI();
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        
        // Agora cada item no carrinho tem um ID único para os adicionais não misturarem
        cart.push({ 
            id: Date.now() + Math.random(), 
            name, 
            price, 
            quantity: 1, 
            extras: [] 
        });
        
        updateCartUI();
    });
});

function toggleExtra(itemIndex, extraName, extraPrice) {
    const item = cart[itemIndex];
    const extraIdx = item.extras.findIndex(e => e.name === extraName);

    if (extraIdx > -1) {
        item.extras.splice(extraIdx, 1);
    } else {
        item.extras.push({ name: extraName, price: extraPrice });
    }
    updateCartUI();
}

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
        let extrasTotal = item.extras.reduce((acc, curr) => acc + curr.price, 0);
        const itemTotal = (item.price + extrasTotal) * item.quantity;
        subtotal += itemTotal;
        count += item.quantity;

        // Verifica se o item é um Cuscuz para mostrar os adicionais
        // Se o nome NÃO tiver "Cuscuz", ele ignora a renderização dos extras
        const isCuscuz = item.name.toLowerCase().includes("cuscuz");

        let extrasHtml = '';
        if (isCuscuz) {
            extrasHtml = EXTRA_OPTIONS.map(opt => {
                const checked = item.extras.some(e => e.name === opt.name) ? 'checked' : '';
                return `
                    <div class="extra-option">
                        <label><input type="checkbox" ${checked} onchange="toggleExtra(${index}, '${opt.name}', ${opt.price})"> ${opt.name}</label>
                        <span>+R$ ${opt.price.toFixed(2)}</span>
                    </div>`;
            }).join('');
        }

        cartItemsContainer.innerHTML += `
            <div class="cart-item-wrapper"> 
                <div class="item-main-info" style="display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>${item.name}</strong></div> 
                    <div>
                        <span style="font-weight: bold;">R$ ${itemTotal.toFixed(2)}</span>
                        <button class="remove-item" onclick="removeFromCart(${index})" style="background:none; border:none; cursor:pointer; margin-left:10px;">❌</button>
                    </div>
                </div>
                
                ${isCuscuz ? `
                <div class="extras-container">
                    <p>✨ <strong>Deixe seu cuscuz mais completo:</strong></p>
                    ${extrasHtml}
                </div>` : ''}
            </div>`;
    });

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
    updateCartUI();
}

function finalizeOrder() {
    const clientName = document.getElementById('client-name').value;
    const orderType = document.querySelector('input[name="order-type"]:checked').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;
    const totalDisplay = document.getElementById('cart-total-value').textContent;
    const observation = document.getElementById('order-observation').value;

    if (cart.length === 0) { alert("Carrinho vazio!"); return; }
    if (clientName.trim() === "") { alert("Informe seu nome!"); return; }
    
    let addressInfo = "";
    let phoneInfo = "";

    if (orderType === "Delivery") {
        const clientPhone = document.getElementById('client-phone').value;
        const number = document.getElementById('house-number').value;
        const street = document.getElementById('street').value;

        if (clientPhone.trim() === "") { alert("Telefone obrigatório para Delivery!"); return; }
        if (street.trim() === "" || !number) { alert("Endereço e Número são obrigatórios!"); return; }

        phoneInfo = `\n📞 *Telefone:* ${clientPhone}`;
        addressInfo = `\n📍 *Endereço:* ${street}, Nº ${number} (${document.getElementById('complement').value})`;
    }

    let message = `*PEDIDO - CUSCUZ DA BETE*\n`;
    message += `👤 *Cliente:* ${clientName}${phoneInfo}\n`;
    message += `--------------------------\n`;
    
    cart.forEach(item => {
        message += `✅ *${item.name}*\n`;
        if (item.extras.length > 0) {
            message += `   _Adicionais: ${item.extras.map(e => e.name).join(', ')}_\n`;
        }
        message += `   Qtd: ${item.quantity} - R$ ${((item.price + item.extras.reduce((a,b) => a+b.price, 0)) * item.quantity).toFixed(2)}\n\n`;
    });

    if (observation.trim() !== "") {
        message += `📝 *Obs:* ${observation}\n`;
    }

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
  menuToggle.textContent = navLinks.classList.contains("active") ? "✖" : "☰";
}

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelector(".nav-links").classList.remove("active");
    document.querySelector(".menu-toggle").textContent = "☰";
  });
});

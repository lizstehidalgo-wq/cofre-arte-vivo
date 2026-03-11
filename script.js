/* ═══════════════════════════════════════════════════════
   COFRE ARTE VIVO — Interactive Scripts
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Scroll-aware navbar ───
    const nav = document.getElementById('main-nav');
    if (nav) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            nav.classList.toggle('nav--scrolled', currentScroll > 40);
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ─── FUNCTIONAL SEARCH ───
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.product-card');
            const noResults = document.getElementById('no-results');
            let matchCount = 0;

            cards.forEach(card => {
                const name = (card.dataset.name || '').toLowerCase();
                const category = (card.dataset.category || '').toLowerCase();
                const desc = (card.dataset.description || '').toLowerCase();
                const matches = !query || name.includes(query) || category.includes(query) || desc.includes(query);
                card.style.display = matches ? '' : 'none';
                if (matches) matchCount++;
            });

            if (noResults) {
                noResults.style.display = (query && matchCount === 0) ? 'block' : 'none';
            }

            // Scroll to catalog when searching
            if (query.length === 1) {
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // ─── Intersection Observer — fade-up animations ───
    const animatedElements = document.querySelectorAll('[data-animate]');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );
        animatedElements.forEach((el) => observer.observe(el));
    }

    // ─── Category Tabs Filtering ───
    const categoryTabs = document.querySelectorAll('.category-tab');
    const productCards = document.querySelectorAll('.product-card');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;

            // UI Update
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filtering
            let visibleCount = 0;
            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            const noResults = document.getElementById('no-results');
            if (noResults) {
                noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
            }
        });
    });


    // ─── Shopping Basket Logic ───
    let basket = JSON.parse(localStorage.getItem('cofre_basket')) || [];
    const basketToggle = document.getElementById('basket-toggle');
    const basketToggleBottom = document.getElementById('basket-toggle-bottom');
    const basketPanel = document.getElementById('basket-panel');
    const basketClose = document.getElementById('basket-close');
    const basketOverlay = document.getElementById('basket-overlay');
    const basketItemsContainer = document.getElementById('basket-items');
    const basketTotalAmount = document.getElementById('basket-total-amount');
    const basketCountLabel = document.querySelector('.basket-count');
    const basketCheckoutBtn = document.getElementById('basket-checkout');

    const updateBasketUI = () => {
        // Update count
        basketCountLabel.textContent = basket.length;
        basketCountLabel.classList.add('basket-animate');
        setTimeout(() => basketCountLabel.classList.remove('basket-animate'), 500);

        // Update items list
        if (basket.length === 0) {
            basketItemsContainer.innerHTML = '<div class="basket-empty">Tu canasta está vacía.</div>';
            basketTotalAmount.textContent = '$0.00';
            basketCheckoutBtn.disabled = true;
            basketCheckoutBtn.style.opacity = '0.5';
        } else {
            let total = 0;
            basketItemsContainer.innerHTML = basket.map((item, index) => {
                total += parseFloat(item.price);
                return `
                    <div class="basket-item">
                        <div class="basket-item__info">
                            <span class="basket-item__name">${item.name}</span>
                            <span class="basket-item__price">$${item.price}</span>
                            <button class="basket-item__remove" onclick="window.removeFromBasket(${index})">Eliminar</button>
                        </div>
                    </div>
                `;
            }).join('');
            basketTotalAmount.textContent = `$${total.toFixed(2)}`;
            basketCheckoutBtn.disabled = false;
            basketCheckoutBtn.style.opacity = '1';
        }

        // Save to local storage
        localStorage.setItem('cofre_basket', JSON.stringify(basket));
    };

    // Global function for removal
    window.removeFromBasket = (index) => {
        basket.splice(index, 1);
        updateBasketUI();
    };

    // Panel functions
    const openBasket = () => {
        if (!basketPanel) return;
        basketPanel.classList.add('is-open');
        basketOverlay.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    };

    const closeBasket = () => {
        if (!basketPanel) return;
        basketPanel.classList.remove('is-open');
        basketOverlay.classList.remove('is-active');
        document.body.style.overflow = '';
    };

    // Toast Function
    const showToast = (message) => {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="material-symbols-outlined toast__icon">check_circle</span>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    // Product Modal Functions
    const productModal = document.getElementById('product-modal');
    const productModalClose = document.getElementById('product-modal-close');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalLight = document.getElementById('modal-light');
    const modalWater = document.getElementById('modal-water');
    const modalGift = document.getElementById('modal-gift');
    const modalPrice = document.getElementById('modal-price');
    const modalAddBtn = document.getElementById('modal-add-btn');

    let currentModalProductId = null;

    const openProductModal = (card) => {
        if (!productModal) return;

        const data = card.dataset;
        currentModalProductId = data.id;

        modalImg.src = card.querySelector('img').src;
        modalTitle.textContent = data.name;
        modalDesc.textContent = data.description || "Un tesoro botánico ecuatoriano cuidadosamente seleccionado.";
        modalLight.textContent = data.careLight || "Luz filtrada";
        modalWater.textContent = data.careWater || "Riego moderado";
        modalGift.textContent = data.gift || "Un regalo lleno de vida";
        modalPrice.textContent = `$${data.price}`;

        productModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    const closeProductModal = () => {
        if (!productModal) return;
        productModal.classList.remove('is-open');
        if (!basketPanel || !basketPanel.classList.contains('is-open')) {
            document.body.style.overflow = '';
        }
    };

    if (productModalClose) productModalClose.addEventListener('click', closeProductModal);
    if (productModal) productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
    });

    modalAddBtn.addEventListener('click', () => {
        const card = document.querySelector(`.product-card[data-id="${currentModalProductId}"]`);
        if (card) {
            const item = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: card.dataset.price
            };
            basket.push(item);
            updateBasketUI();
            showToast(`¡${item.name} añadido!`);
            closeProductModal();
        }
    });

    // Add to basket buttons click handler (including Temu buttons)
    document.querySelectorAll('.add-to-basket').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            // Look for data on the button itself or the closest parent container
            const source = button.dataset.id ? button : button.closest('.product-card, .flash-sale__item');
            if (!source) return;

            const item = {
                id: source.dataset.id,
                name: source.dataset.name,
                price: source.dataset.price
            };
            basket.push(item);
            updateBasketUI();
            showToast(`¡${item.name} añadido!`);
        });
    });





    // Click on product card images to open modal
    document.querySelectorAll('.product-card__img-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            openProductModal(wrapper.closest('.product-card'));
        });
    });

    // Panel controls
    const basketContinue = document.getElementById('basket-continue');
    if (basketToggle && basketPanel && basketClose && basketOverlay) {
        basketToggle.addEventListener('click', openBasket);
        if (basketToggleBottom) basketToggleBottom.addEventListener('click', openBasket);
        basketClose.addEventListener('click', closeBasket);
        basketOverlay.addEventListener('click', closeBasket);
        if (basketContinue) {
            basketContinue.addEventListener('click', closeBasket);
        }
    }

    // Checkout
    if (basketCheckoutBtn) {
        basketCheckoutBtn.addEventListener('click', () => {
            if (basket.length === 0) return;

            let message = "¡Hola Cofre Arte Vivo! 🌿 Quiero hacer un pedido:\n\n";
            let total = 0;
            basket.forEach((item, i) => {
                message += `${i + 1}. *${item.name}* - $${item.price}\n`;
                total += parseFloat(item.price);
            });
            message += `\n*Total: $${total.toFixed(2)}*\n\n¿Me podrían confirmar disponibilidad?`;

            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/593979487687?text=${encodedMessage}`, '_blank');

            // Clear basket after checkout?
            // basket = [];
            // updateBasketUI();
            // closePanel();
        });
    }

    // Initial UI update
    updateBasketUI();

    // ════════════ COUNTDOWN TIMERS ════════════
    const startMultiCountdowns = () => {
        const timeTargets = [
            { h: 'top-h', m: 'top-m', s: 'top-s' },
            { h: 'flash-h', m: 'flash-m', s: 'flash-s' },
            { h: 'exclusive-h', m: 'exclusive-m', s: 'exclusive-s' }
        ];

        let time = 2 * 3600 + 45 * 60 + 12; // Time in seconds

        const updateAll = () => {
            const h = Math.floor(time / 3600).toString().padStart(2, '0');
            const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
            const s = (time % 60).toString().padStart(2, '0');

            timeTargets.forEach(target => {
                const hEl = document.getElementById(target.h);
                const mEl = document.getElementById(target.m);
                const sEl = document.getElementById(target.s);
                if (hEl) hEl.textContent = h;
                if (mEl) mEl.textContent = m;
                if (sEl) sEl.textContent = s;
            });

            if (time > 0) time--;
        };

        setInterval(updateAll, 1000);
        updateAll();
    };
    startMultiCountdowns();

    // ─── Animation on Scroll Intersection ───
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // ════════════ REGISTRATION MODAL LOGIC ════════════
    const regModal = document.getElementById('reg-modal');
    const regForm = document.getElementById('reg-form');
    const regClose = document.getElementById('reg-close');

    const showRegModal = () => {
        if (!localStorage.getItem('cofre_user_registered')) {
            // Se muestra INMEDIATAMENTE al inicio
            setTimeout(() => {
                if (regModal) regModal.classList.add('active');
            }, 0);
        }
    };

    // Botones manuales para abrir registro/cupón
    const navCouponBtn = document.getElementById('nav-coupon-btn');
    const mobileCouponBtn = document.getElementById('mobile-coupon-btn');

    [navCouponBtn, mobileCouponBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (regModal) regModal.classList.add('active');
            });
        }
    });

    if (regClose) {
        regClose.addEventListener('click', () => {
            regModal.classList.remove('active');
        });
    }

    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const phone = document.getElementById('reg-phone').value;
            const birthday = document.getElementById('reg-birthday').value;

            const submitBtn = regForm.querySelector('button');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'PROCESANDO...';
            submitBtn.disabled = true;

            // ─── 1. DATOS A GUARDAR ───
            const userData = { name, email, phone, birthday, registeredAt: new Date().toISOString() };
            localStorage.setItem('cofre_user_data', JSON.stringify(userData));
            localStorage.setItem('cofre_user_registered', 'true');

            const showSuccessState = () => {
                regForm.style.display = 'none';
                const successEl = document.getElementById('reg-success');
                if (successEl) successEl.classList.add('active');
                regModal.classList.add('active');

                const copyBtn = document.getElementById('reg-copy-btn');
                const couponText = document.getElementById('coupon-display').innerText;

                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        navigator.clipboard.writeText(couponText).then(() => {
                            const originalCopyText = copyBtn.innerText;
                            copyBtn.innerText = '¡COPIADO! ✅';
                            copyBtn.style.background = '#27AE60';
                            setTimeout(() => {
                                copyBtn.innerText = originalCopyText;
                                copyBtn.style.background = '#cc0000';
                            }, 2000);
                        });
                    });
                }
            };

            // ─── 2. ENVIAR A GOOGLE SHEETS (PANEL ADMINISTRADOR) ───
            // URL de Apps Script conectada al Google Sheets
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-fGKq7K6W8tcHjuJGPw7eSwkz3tv00OpjAsG5lnJjYENylrjbe-NfE4kejMDRl_z0/exec';

            if (SCRIPT_URL) {
                // Si la URL está configurada, enviamos los datos en silencio
                fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                }).catch(err => console.error("Error guardando en Sheets:", err));
            }

            // ─── 3. ENVIAR A WHATSAPP DIRECTO ───
            const waNumber = "593979487687"; // Tu número
            const message = `¡Hola! Me acabo de registrar en Cofre Arte Vivo para obtener mi cupón. 🎁%0A%0A*Mis datos:*%0A👤 Nombre: ${name}%0A📧 Correo: ${email}%0A📱 Teléfono: ${phone}%0A🎂 Cumpleaños: ${birthday}%0A👉 Cupón desbloqueado: *COFRE20*`;
            const waUrl = `https://wa.me/${waNumber}?text=${message}`;

            showSuccessState();
            showToast(`¡Bienvenido ${name}! Generando tu cupón...`);
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;

            // Abrir WhatsApp
            setTimeout(() => {
                window.open(waUrl, '_blank');
            }, 800);
        });
    }

    showRegModal();

    document.querySelectorAll('.product-card, .flash-sale__item').forEach(el => {
        scrollObserver.observe(el);
    });

});

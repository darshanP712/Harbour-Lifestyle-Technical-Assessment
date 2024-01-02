class CartUpsellDrawer extends HTMLElement { 
    constructor() {
      super();
    
      this._visibility = false;
      this.id = this.dataset.id;
      this.url = this.dataset.url;
    }
  
    connectedCallback() {
    
      this.style.display = 'block';
      
      // Add to cart to new upsell call
      const DrawerAddbuttons = document.querySelectorAll('product-form .cart_quick-add__submit');
      DrawerAddbuttons.forEach(Addbutton => {
        Addbutton.addEventListener('click', event => {
          const NewUpsellID = Addbutton.getAttribute("data-id");
          const ChangeUpsellID = document.querySelector('cart-upsell-drawer');
          ChangeUpsellID.setAttribute("id",NewUpsellID);
          ChangeUpsellID.setAttribute("data-id",NewUpsellID);      
    
          fetch(`${this.url}?section_id=custom-drawer-upsell&product_id=${this.id}&limit=10&intent=related`)
          .then((response) => response.text())
          .then((text) => { 
            const html = document.createElement('div');
            html.innerHTML = text;
            const upSell = html.querySelector('cart-upsell-drawer');
            if (upSell && upSell.innerHTML.trim().length) {
              this.innerHTML = upSell.innerHTML;
            }  
          })
          .catch((e) => {
            console.error(e);
          });
          
        });
      });    
    }  
  }
  customElements.define('cart-upsell-drawer', CartUpsellDrawer);
  
  // header cart click to hidden sections
  const MiniCartIcon = document.getElementById('cart-icon-bubble');
  MiniCartIcon.addEventListener('click', event => {
    const upSellDisplay = document.querySelector('cart-upsell-drawer');
    upSellDisplay.style.display = 'none';
  });
  
  // product-form override and call to cart-upsell-drawer
  class ProductFormNew extends HTMLElement {
    constructor() {
      super();
  
      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      this.submitButton = this.querySelector('[type="submit"]');
      if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
      this.hideErrors = this.dataset.hideErrors === 'true';
    }
  
    onSubmitHandler(evt) {
      evt.preventDefault();
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;
      this.handleErrorMessage();
      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');
  
      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];
  
      const formData = new FormData(this.form);
      if (this.cart) {
        formData.append(
          'sections',
          this.cart.getSectionsToRender().map((section) => section.id)
        );
        formData.append('sections_url', window.location.pathname);
        this.cart.setActiveElement(document.activeElement);
      }
      config.body = formData;
  
      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            publish(PUB_SUB_EVENTS.cartError, {
              source: 'product-form',
              productVariantId: formData.get('id'),
              errors: response.errors || response.description,
              message: response.message,
            });
            this.handleErrorMessage(response.description);
  
            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
            return;
          } else if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }
       
          if (!this.error)
            publish(PUB_SUB_EVENTS.cartUpdate, { source: 'product-form', productVariantId: formData.get('id') });
          this.error = false;
          const quickAddModal = this.closest('quick-add-modal');
          if (quickAddModal) {
            document.body.addEventListener(
              'modalClosed',
              () => {
                setTimeout(() => {
                  this.cart.renderContents(response);
                });
              },
              { once: true }
            );
            quickAddModal.hide(true);
          } else {
            this.cart.renderContents(response);
          }
          // fire upsell event start
            this.cartUpSellDrawer = document.querySelector('cart-upsell-drawer');
            this.cartUpSellDrawer.connectedCallback();            
          // fire upsell event end
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }
  
    handleErrorMessage(errorMessage = false) {
      if (this.hideErrors) return;
  
      this.errorMessageWrapper =
        this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');
  
      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);
  
      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  }
  customElements.get('product-form') || customElements.define('product-form', ProductFormNew);
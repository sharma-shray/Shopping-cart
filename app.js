const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "3zgpbdb61tjq",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "0JUISauSCv-FrS2ZfDd9jsI_CMQ78w6mWo8PNcvHBiU"
});

//variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItem = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productDOM = document.querySelector(".products-center");
// cart
let cart = [];
//buttons
let buttonsDOM = [];
//for fetching products
class Products {
  //async is used so that it return
  // the value only after the fetching completes
  async getProducts() {
    try {
      //fetch from contentful
      let contentful = await client.getEntries({
        content_type: "comfyHouseProducts"
      });
      //Fetch from JSON and convert
      // let result = await fetch("products.json");
      //let data = await result.json();
      let products = contentful.items;
      products = products.map(item => {
        const { id } = item.sys;
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//UI products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
            <article class="product">
                <div class="img-container">
                    <img
                        src=${product.image}
                        alt="product"
                        class="product-img"
                    />
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
            </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
        `;
    });
    productDOM.innerHTML = result;
  }
  getBagButtons() {
    cart = Storage.getCart();
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      //find all elements which are already in the cart by using global cart
      let inCart = cart.find(item => item.id === id);
      //if the item is in the cart then we disable the add to cart button.
      //one time event only when refreshing page
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        add to bag`;
        button.disabled = false;
      }
      //Real time button disable
      button.addEventListener("click", event => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get product from products-----------------------------------------------
        let cartItem = Storage.getProduct(id);
        cartItem = { ...cartItem, amount: 1 };
        //add to cart
        cart = [...cart, cartItem];
        // save the cart in localstorage
        Storage.saveCart(cart);
        //set cart values
        this.setCart(cart);
        //displaying items in cart
        this.displayItemsInCart(cart);
        // show cart
        this.showCart();
      });
    });
  }
  setCart(cart) {
    let totalPrice = 0;
    let totalQuantity = 0;
    cart.forEach(element => {
      totalPrice += element.price * element.amount;
      totalQuantity += element.amount;
    });
    cartItem.innerText = totalQuantity;
    cartTotal.innerText = totalPrice;
  }

  displayItemsInCart(cart) {
    let items = [];
    cart.forEach(item => {
      items += `<div class="cart-item">
      <img src=${item.image} alt="Image" />
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item amount">${item.amount}</p>
        <i class="fas fa-chevron-down"data-id=${item.id}></i>
      </div>
  </div>`;
    });
    cartContent.innerHTML = items;
    this.quantityControls(cart);
  }

  quantityControls(cart) {
    let quantityInc = [...document.querySelectorAll(".fa-chevron-up")];
    let quantityDec = [...document.querySelectorAll(".fa-chevron-down")];
    let removeBtn = [...document.querySelectorAll(".remove-item")];

    quantityInc.forEach(increase => {
      increase.addEventListener("click", event => {
        cart.forEach(element => {
          if (element.id === event.target.dataset.id) {
            element.amount += 1;
            this.setCart(cart);
            Storage.saveCart(cart);
            this.displayItemsInCart(cart);
          }
        });
      });
    });

    quantityDec.forEach(decrease => {
      decrease.addEventListener("click", event => {
        cart.forEach(element => {
          if (element.id === event.target.dataset.id) {
            if (element.amount === 1) {
              cart.splice(cart.indexOf(element), 1);
              this.setCart(cart);
              Storage.saveCart(cart);
              this.resetBtns(element.id);
            } else {
              element.amount -= 1;
              this.setCart(cart);
              Storage.saveCart(cart);
            }
            this.displayItemsInCart(cart);
          }
        });
      });
    });

    removeBtn.forEach(removeItem => {
      removeItem.addEventListener("click", event => {
        cart.forEach(element => {
          cart.splice(cart.indexOf(element), 1);
          this.setCart(cart);
          Storage.saveCart(cart);
          this.displayItemsInCart(cart);
        });
      });
    });
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  resetBtns(id = null) {
    let Btns = buttonsDOM;
    if (id === null) {
      Btns.forEach(Btn => {
        Btn.innerHTML = `<i class="fas fa-shopping-cart"></i>
        add to bag`;
        Btn.disabled = false;
      });
    } else {
      Btns.forEach(Btn => {
        if (Btn.dataset.id === id) {
          Btn.innerHTML = `<i class="fas fa-shopping-cart"></i>
        add to bag`;
          Btn.disabled = false;
        }
      });
    }
  }
  setupAPP() {
    this.setCart(Storage.getCart());

    cartBtn.addEventListener("click", () => {
      this.displayItemsInCart(Storage.getCart());
      this.showCart();
    });

    closeCartBtn.addEventListener("click", () => {
      cartOverlay.classList.remove("transparentBcg");
      cartDOM.classList.remove("showCart");
      // this.getBagButtons();----------this line is causing issues.
    });
    clearCartBtn.addEventListener("click", () => {
      let cart = [];
      this.setCart(cart);
      Storage.saveCart(cart);
      this.displayItemsInCart(cart);
      this.resetBtns();
    });
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    if (localStorage.getItem("cart")) {
      cart = JSON.parse(localStorage.getItem("cart"));
    } else {
      cart = [];
    }
    return cart;
  }
}
/*arrow functions used as a practice because
of the fix of .this scope in EC6
DOMcontent loaded is used because we do not want to use 
load as we want to wait only till the DOM structure is loaded
 and load also waits till images and resources are loaded.*/
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup
  ui.setupAPP();
  //get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      /*the products are saved locally as 
    they will be available only after fetch completion*/
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
    });
});

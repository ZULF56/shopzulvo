const products = [

  // MEN
  {name:"Black Hoodie", price:89, image:"images/men-1.jpg"},
  {name:"Premium T-Shirt", price:49, image:"images/men-2.jpg"},
  {name:"Cargo Pants", price:69, image:"images/men-3.jpg"},
  {name:"Oversized Tee", price:45, image:"images/men-4.jpg"},
  {name:"Denim Jacket", price:99, image:"images/men-5.jpg"},
  {name:"Street Hoodie", price:79, image:"images/men-6.jpg"},
  {name:"Joggers", price:55, image:"images/men-7.jpg"},
  {name:"Luxury Shirt", price:65, image:"images/men-8.jpg"},
  {name:"Classic Polo", price:59, image:"images/men-9.jpg"},
  {name:"Slim Jeans", price:75, image:"images/men-10.jpg"},
  {name:"Winter Jacket", price:120, image:"images/men-11.jpg"},
  {name:"Casual Shirt", price:60, image:"images/men-12.jpg"},

  // WOMEN
  {name:"Women's Dress", price:95, image:"images/women-1.jpg"},
  {name:"Fashion Top", price:45, image:"images/women-2.jpg"},
  {name:"Women's Hoodie", price:75, image:"images/women-3.jpg"},
  {name:"Luxury Abaya", price:110, image:"images/women-4.jpg"},
  {name:"Stylish Jeans", price:70, image:"images/women-5.jpg"},
  {name:"Premium Jacket", price:99, image:"images/women-6.jpg"},

  // KIDS
  {name:"Kids Hoodie", price:35, image:"images/kids-1.jpg"},
  {name:"Kids T-Shirt", price:25, image:"images/kids-2.jpg"},
  {name:"Kids Dress", price:30, image:"images/kids-3.jpg"},
  {name:"Kids Jacket", price:45, image:"images/kids-4.jpg"},
  {name:"Kids Set", price:50, image:"images/kids-5.jpg"}
];

const productGrid = document.getElementById("product-grid");

if (productGrid) {
  products.forEach(product => {
    productGrid.innerHTML += `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>$${product.price}</p>
        <button>Add to Cart</button>
      </div>
    `;
  });
          }

console.log("Welcome to ZULVO");

let cartCount = 0;

function shopNow() {
    document.getElementById("products").scrollIntoView({
        behavior: "smooth"
    });
}

function addToCart(productName) {
    cartCount++;
    document.getElementById("cart-count").textContent = cartCount;
    alert(productName + " added to cart!");
}

window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.style.background = "#000";
    } else {
        header.style.background = "#111";
    }
});

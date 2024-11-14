const apiEndpoint = "http://localhost:3000/api/";
const serverBaseURL = "http://localhost:3000";

let productsArray = [];
let cart = [];
let currentItem = null;

async function getAllProducts() {
    const apiUrl = apiEndpoint + "products";
    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Bad network response");
        }

        const data = await response.json(); // Wait for the JSON parsing to complete
        productsArray = data; // Set productsArray to the actual data
        return data;
    } catch (error) {
        console.log("ERROR:", error);
    }
}

function getProductById(id) {
    return productsArray.find(product => product.id === id);
}


//function that loads all products from DB and displays on frontend
function loadProductPictures(){
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

        productsArray.forEach(product =>{
            // Create a new img element
            const img = document.createElement('img');
            img.src = `${serverBaseURL}/pictures/${product.articleNumber}.jpg`;
            img.alt = product.name;
            img.addEventListener('click', function() {
             openModal(product);
            });
         
            gallery.appendChild(img);
        })


}

function openModal(item) {
    currentItem = item;
    document.getElementById('itemName').textContent = item.name;
    document.getElementById('quantity').value = 1; // Reset quantity to 1
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function addToCart() {
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput.value);

    // Check if the item is already in the cart
    const existingItem = cart.find(entry => entry.productId === currentItem.id);
    
    if (existingItem) {
        existingItem.quantity += quantity; // Update the quantity
    } else {
        cart.push({ productId: currentItem.id, quantity: quantity });
    }
    updateCartDisplay();
    closeModal();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('order-list');
    cartItems.innerHTML = '';
    cart.forEach((entry) => {
        const product = entry; 
        const productName = getProductById(product.productId).name;
        const productQuantity = product.quantity;
        console.log(productQuantity);
        const listItem = document.createElement('li');
        listItem.textContent = `${productName} - Quantity: ${productQuantity}`;
        cartItems.appendChild(listItem);
    });
}

function sendOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
    } else {
        // Here you can implement the order submission logic, such as sending data to the server
        alert("Order sent successfully!");
        cart = [];
        updateCartDisplay();
    }
}

async function initialize() {
    await getAllProducts();
    loadProductPictures();
}

initialize();
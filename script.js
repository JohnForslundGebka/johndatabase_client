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
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Bad network response");
    }

    const data = await response.json(); // Wait for the JSON parsing to complete
    productsArray = data; // Set productsArray to the actual data
    return data;
  } catch (error) {
    console.log("ERROR:", error);
    return null;
  }
}

async function getOrderInformationFromID (orderID) {
    const apiUrl = apiEndpoint + "orders/" + orderID;
    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
             Accept: "application/json",
            }, 
        });
       
        if (!response.ok){
            throw new Error("Bad network response");
        }
        const data = await response.json();

        return data;
        
    } catch (error) {
    console.log("ERROR:", error);
  }
}

function getProductById(id) {
  return productsArray.find((product) => product.id === id);
}

function getCartPrice() {
  let totalPrice = 0;
  cart.forEach((entry) => {
    const product = getProductById(entry.productId);
    const productPrice = parseFloat(product.price);
    totalPrice += productPrice * entry.quantity;
  });
  return totalPrice;
}

//function that loads all products from DB and displays on frontend
function loadProductPictures() {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  productsArray.forEach((product) => {
    // Create a new img element
    const img = document.createElement("img");
    img.src = `${serverBaseURL}/pictures/${product.articleNumber}.jpg`;
    img.alt = product.name;
    img.addEventListener("click", function () {
      openModal(product);
    });

    gallery.appendChild(img);
  });
}

function openModal(item) {
  currentItem = item;
  document.getElementById("itemName").textContent = item.name;
  document.getElementById("quantity").value = 1; // Reset quantity to 1
  document.getElementById("modal").style.display = "flex";

  const productInfoDiv = document.getElementById("product-info");
  productInfoDiv.innerHTML = `
        <p><strong>Article Number:</strong> ${item.articleNumber}</p>
        <p><strong>Price:</strong> $${item.price}</p>
        <p>${item.description}</p>
    `;
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function addToCart() {
  const quantityInput = document.getElementById("quantity");
  const quantity = parseInt(quantityInput.value);

  // Check if the item is already in the cart
  const existingItem = cart.find((entry) => entry.productId === currentItem.id);

  if (existingItem) {
    existingItem.quantity += quantity; // Update the quantity
  } else {
    cart.push({ productId: currentItem.id, quantity: quantity });
  }
  updateCartDisplay();
  closeModal();
}

function updateCartDisplay() {
  const cartItems = document.getElementById("order-list");
  cartItems.innerHTML = "";
  cart.forEach((entry) => {
    const product = entry;
    const productName = getProductById(product.productId).name;
    const productQuantity = product.quantity;
    console.log(productQuantity);
    const listItem = document.createElement("li");
    listItem.textContent = `${productName} - Quantity: ${productQuantity}`;
    cartItems.appendChild(listItem);
  });

  // Calculate and display the total price
  const cartPriceElement = document.getElementById("order-message");
  const totalPrice = getCartPrice();
  cartPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
}

function sendOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
  } else {
    const apiUrl = apiEndpoint + "orders";
    // Prepare the data to send
    const orderData = {
      products: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to submit order");
        }
        return response.json();
      })
      .then((data) => {
        // Extract the order ID from the response
        const orderId = data.order_id;
        alert(`Order placed successfully! Your Order ID is ${orderId}`);
        cart = [];
        updateCartDisplay();
      })
      .catch(error=>{
        console.error("ERROR:", error);
        alert("There was a problem submitting your order");
      });
  }
}

async function lookUpOrder(){
    const orderInfo = document.getElementById("order-details");
    orderInfo.innerHTML = "";
    const textInput = document.getElementById("order-id"); 
    const orderIdNumber = textInput.value.trim();

    if (orderIdNumber === "") {
        alert("Please enter a valid Order ID.");
        return;
    }
    
    const orderData = await getOrderInformationFromID(orderIdNumber);
    if (orderData) {
        displayOrderDetails(orderData);
    } else {
        orderInfo.innerHTML = "<p>Order not found. Please check the Order ID and try again.</p>";
    } 
}

function displayOrderDetails(orderData) {
    const orderInfo = document.getElementById("order-details");
    orderInfo.innerHTML = ""; // Clear previous content

    // Display Order ID
    const orderIdElement = document.createElement('h3');
    orderIdElement.textContent = `Order ID: ${orderData.orderId}`;
    orderInfo.appendChild(orderIdElement);

    // Display Products
    const productList = document.createElement('ul');
    orderData.products.forEach(product => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${product.name}</strong><br>
            Article Number: ${product.articleNumber}<br>
            Price: $${parseFloat(product.price).toFixed(2)}<br>
            Quantity: ${product.quantity}<br>
            Subtotal: $${(parseFloat(product.price) * product.quantity).toFixed(2)}
        `;
        productList.appendChild(listItem);
    });
    orderInfo.appendChild(productList);

    // Calculate and Display Total Price
    const totalPrice = orderData.products.reduce((total, product) => {
        return total + parseFloat(product.price) * product.quantity;
    }, 0);

    const totalPriceElement = document.createElement('p');
    totalPriceElement.innerHTML = `<strong>Total Price:</strong> $${totalPrice.toFixed(2)}`;
    orderInfo.appendChild(totalPriceElement);
}

async function initialize() {
  await getAllProducts();
  loadProductPictures();
}

initialize();

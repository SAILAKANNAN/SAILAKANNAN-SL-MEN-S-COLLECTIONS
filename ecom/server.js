const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.static('public'));

// Database connection
mongoose.connect('mongodb+srv://slmenscollection:kanna2006@cluster0.2kfapar.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// User Schema
const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Product Count Schema
const productCountSchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 }
});

const ProductCount = mongoose.model('ProductCount', productCountSchema);

// Product Schema with base64 image storage
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    description: String,
    price: Number,
    offerPercentage: Number,
    mrp: Number,
    size: [String],
    mainImage: {
        data: String, // base64 encoded image
        contentType: String // MIME type
    },
    additionalImages: [{
        data: String,
        contentType: String
    }],
    createdAt: { type: Date, default: Date.now }
});

// Order Schema
// Order Schema
const orderSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    customerName: String,  // Add this line
    size: String,
    price: Number,
    mrp: Number,
    quantity: { type: Number, default: 1 },
    phone: String,
    street: String,
    area: String,
    pincode: String,
    district: String,
    state: String,
    paymentMethod: { type: String, default: 'COD' },
    status: { type: String, default: 'Pending' },
    orderedAt: { type: Date, default: Date.now }
});

// Models
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// Routes

// Home Page
app.get('/', (req, res) => {
    if (req.cookies.adminLoggedIn === 'true') {
        return res.redirect('/admin');
    }
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MyShop - E-Commerce Store</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <!-- Animate.css -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
            <style>
                :root {
                    --primary-color: #4e73df;
                    --secondary-color: #f8f9fc;
                    --accent-color: #ff6b6b;
                    --dark-color: #2c3e50;
                    --light-color: #f8f9fa;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: var(--secondary-color);
                    color: var(--dark-color);
                }
                
                .navbar-brand {
                    font-weight: 700;
                    font-size: 1.8rem;
                }
                
                .nav-link {
                    font-weight: 500;
                    position: relative;
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: var(--primary-color);
                    transition: width 0.3s ease;
                }
                
                .nav-link:hover::after {
                    width: 100%;
                }
                
                .search-box {
                    background-color: rgba(255, 255, 255, 0.9);
                    border-radius: 30px;
                    padding: 8px 15px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .search-input {
                    border: none;
                    background: transparent;
                    outline: none;
                }
                
                .search-btn {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 20px;
                    padding: 5px 15px;
                    transition: all 0.3s;
                }
                
                .search-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                
                .product-card {
                    border: none;
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                    background: white;
                    margin-bottom: 20px;
                }
                
                .product-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                }
                
                .product-img {
                    height: 200px;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                
                .product-card:hover .product-img {
                    transform: scale(1.05);
                }
                
                .price {
                    font-weight: 700;
                    color: var(--primary-color);
                }
                
                .original-price {
                    text-decoration: line-through;
                    color: #6c757d;
                }
                
                .discount-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--accent-color);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-weight: bold;
                }
                
                footer {
                    background: var(--dark-color);
                    color: white;
                    padding: 40px 0 20px;
                }
                
                .footer-links a {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .footer-links a:hover {
                    color: white;
                }
                
                .social-icons a {
                    color: white;
                    font-size: 1.5rem;
                    margin-right: 15px;
                    transition: transform 0.3s;
                }
                
                .social-icons a:hover {
                    transform: translateY(-5px);
                }
                
                .back-to-top {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background: var(--primary-color);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s;
                    z-index: 999;
                }
                
                .back-to-top.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .back-to-top:hover {
                    background: var(--accent-color);
                    transform: translateY(-5px);
                }
                
                /* Pulse animation for featured products */
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(78, 115, 223, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(78, 115, 223, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(78, 115, 223, 0); }
                }
                
                .featured {
                    animation: pulse 2s infinite;
                    border: 2px solid var(--primary-color);
                }
                
                /* Hero Section */
                .hero-section {
                    background: linear-gradient(135deg, var(--primary-color), #224abe);
                    position: relative;
                    overflow: hidden;
                }
                
                .hero-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80') center/cover;
                    opacity: 0.15;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 1;
                }
                
                /* Responsive adjustments */
                @media (max-width: 767.98px) {
                    .navbar-brand {
                        font-size: 1.5rem;
                    }
                    
                    .product-img {
                        height: 150px;
                    }
                    
                    .hero-section {
                        padding: 2rem 0;
                    }
                    
                    .display-4 {
                        font-size: 2.5rem;
                    }
                }
                
                @media (max-width: 575.98px) {
                    .product-col {
                        flex: 0 0 50%;
                        max-width: 50%;
                    }
                    
                    .search-box {
                        margin-top: 1rem;
                        width: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Navigation Bar -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="/">SL MEN'S</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/contact">Contact Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/return-refund">Return & Refund</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/shipping-policy">Shipping Policy</a>
                            </li>
                        </ul>
                        
                    
                        
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="/login">
                                    <i class="fas fa-user me-1"></i> Login
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <!-- Hero Section -->
            <div class="hero-section text-white py-5">
                <div class="container text-center py-5 hero-content animate__animated animate__fadeIn">
                    <h1 class="display-4 fw-bold mb-4">Welcome to MyShop</h1>
                    <p class="lead mb-4">Discover amazing products at unbeatable prices</p>
                    <a href="#products" class="btn btn-light btn-lg px-4">Shop Now</a>
                </div>
            </div>
            
            <!-- Products Section -->
            <div class="container my-5" id="products">
                <h2 class="text-center mb-5 animate__animated animate__fadeInUp">Our Products</h2>
                <div class="row g-4" id="products-container">
                    <!-- Products will be loaded here -->
                </div>
            </div>
            
            <!-- Footer -->
            <footer class="mt-5">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <h5>SL MEN'S COLLECTIONS</h5>
                            <p>Your one-stop destination for all your shopping needs. Quality products at affordable prices.</p>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="/">Home</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/login">Login</a></li>
                            </ul>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Categories</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="#">Electronics</a></li>
                                <li><a href="#">Fashion</a></li>
                                <li><a href="#">Home & Kitchen</a></li>
                                <li><a href="#">Beauty</a></li>
                            </ul>
                        </div>
                        <div class="col-md-4 mb-4">
                            <h5>Connect With Us</h5>
                            <div class="social-icons">
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                            </div>
                            <div class="mt-3">
                                <p><i class="fas fa-envelope me-2"></i> slmenscollection@gmail.com</p>
                                <p><i class="fas fa-phone me-2"></i> 8610999612</p>
                            </div>
                        </div>
                    </div>
                    <hr class="my-4 bg-light">
                    <div class="row">
                        <div class="col-md-6 text-center text-md-start">
                            <p class="mb-0">&copy; 2025 SL MEN'S COLLECTIONS. All rights reserved.</p>
                        </div>
                        <div class="col-md-6 text-center text-md-end">
                            <p class="mb-0">
                                <a href="#" class="text-white me-3">Privacy Policy</a>
                                <a href="#" class="text-white">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
            
            <!-- Back to Top Button -->
            <a href="#" class="back-to-top animate__animated animate__fadeIn">
                <i class="fas fa-arrow-up"></i>
            </a>
            
            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            
            <script>
                // Load products on page load
                document.addEventListener('DOMContentLoaded', function() {
                    fetch('/api/products')
                        .then(response => response.json())
                        .then(products => {
                            const container = document.getElementById('products-container');
                            
                            products.forEach(product => {
                                const productDiv = document.createElement('div');
                                productDiv.className = 'col-6 col-md-4 col-lg-3';
                                productDiv.innerHTML = \`
                                    <div class="product-card h-100">
                                        <div class="position-relative">
                                            <img src="\${product.mainImage.data}" alt="\${product.name}" class="product-img w-100">
                                            <span class="discount-badge">\${product.offerPercentage}% OFF</span>
                                        </div>
                                        <div class="p-3">
                                            <h5 class="mb-2">\${product.name}</h5>
                                            <p class="text-muted small mb-2">\${product.description.substring(0, 60)}...</p>
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span class="price">₹\${product.price}</span>
                                                    <span class="original-price small ms-2">₹\${product.mrp}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                \`;
                                
                                productDiv.addEventListener('click', () => {
                                    window.location.href = \`/product/\${product._id}\`;
                                });
                                
                                container.appendChild(productDiv);
                            });
                        });
                    
                    // Back to top button
                    const backToTopButton = document.querySelector('.back-to-top');
                    
                    window.addEventListener('scroll', () => {
                        if (window.pageYOffset > 300) {
                            backToTopButton.classList.add('active');
                        } else {
                            backToTopButton.classList.remove('active');
                        }
                    });
                    
                    backToTopButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// About Us Page
app.get('/about', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>About Us - SL Men's Collections</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
            <style>
                .navbar-brand {
                    font-weight: bold;
                    font-size: 1.8rem;
                }
                .nav-link {
                    font-size: 1.1rem;
                    margin-right: 15px;
                }
                .hero-section {
                    background-color: #f8f9fa;
                    padding: 3rem 0;
                    margin-bottom: 2rem;
                }
                footer {
                    background-color: #343a40;
                    color: white;
                    padding: 2rem 0;
                    margin-top: 3rem;
                }
                .contact-info p {
                    margin-bottom: 0.5rem;
                }
                .policy-card {
                    margin-bottom: 2rem;
                    border-left: 4px solid #0d6efd;
                }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                    <a class="navbar-brand" href="/">SL MEN'S </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/contact">Contact Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/return-refund">Return & Refund</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/shipping-policy">Shipping Policy</a>
                            </li>
                        </ul>
                        <div class="d-flex">
                            <a href="/login" class="btn btn-outline-light">Login</a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div class="hero-section">
                <div class="container text-center">
                    <h1 class="display-4">About Our Company</h1>
                </div>
            </div>
            
            <div class="container">
                <div class="row">
                    <div class="col-lg-8 mx-auto">
                        <div class="card shadow-sm mb-4">
                            <div class="card-body">
                                <h2 class="card-title">Welcome to SL Men's Collections</h2>
                                <p class="card-text lead">We are a premier men's clothing store offering high-quality apparel to our valued customers.</p>
                                <p class="card-text">With years of experience in the fashion industry, we pride ourselves on providing exceptional products and customer service. Our collection includes a wide range of clothing suitable for all occasions and needs.</p>
                                <p class="card-text">At SL Men's Collections, we believe in quality, affordability, and customer satisfaction above all else.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer class="footer">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4">
                            <h5>SL Men's Collections</h5>
                            <p>NO:2-4/25, Sowndamman Kovil Street,<br>
                            Elampillai, Salem-637502.<br>
                            Tamil Nadu, India</p>
                        </div>
                        <div class="col-md-4">
                            <h5>Contact Info</h5>
                            <p><i class="bi bi-telephone"></i> Phone: 8610999612</p>
                            <p><i class="bi bi-envelope"></i> Email: slmenscollection@gmail.com</p>
                        </div>
                        <div class="col-md-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled">
                                <li><a href="/about" class="text-white">About Us</a></li>
                                <li><a href="/contact" class="text-white">Contact Us</a></li>
                                <li><a href="/return-refund" class="text-white">Return & Refund Policy</a></li>
                                <li><a href="/shipping-policy" class="text-white">Shipping Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <hr class="mt-4 bg-light">
                    <div class="text-center">
                        <p>&copy; ${new Date().getFullYear()} SL Men's Collections. All rights reserved.</p>
                    </div>
                </div>
            </footer>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

app.get('/contact', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contact Us - SL Men's Collections</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
            <style>
                .navbar-brand {
                    font-weight: bold;
                    font-size: 1.8rem;
                }
                .nav-link {
                    font-size: 1.1rem;
                    margin-right: 15px;
                }
                .hero-section {
                    background-color: #f8f9fa;
                    padding: 3rem 0;
                    margin-bottom: 2rem;
                }
                .contact-info {
                    margin-bottom: 2rem;
                }
                .contact-card {
                    transition: transform 0.3s;
                }
                .contact-card:hover {
                    transform: translateY(-5px);
                }
                footer {
                    background-color: #343a40;
                    color: white;
                    padding: 2rem 0;
                    margin-top: 3rem;
                }
                .contact-info p {
                    margin-bottom: 0.5rem;
                }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                    <a class="navbar-brand" href="/">SL MEN'S </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/contact">Contact Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/return-refund">Return & Refund</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/shipping-policy">Shipping Policy</a>
                            </li>
                        </ul>
                        <div class="d-flex">
                            <a href="/login" class="btn btn-outline-light">Login</a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div class="hero-section">
                <div class="container text-center">
                    <h1 class="display-4">Contact Us</h1>
                    <p class="lead">We'd love to hear from you</p>
                </div>
            </div>
            
            <div class="container">
                <div class="row">
                    <div class="col-lg-6 mx-auto">
                        <div class="card contact-card shadow-sm mb-4">
                            <div class="card-body">
                                <h2 class="card-title">Our Contact Information</h2>
                                <div class="contact-info">
                                    <p><i class="bi bi-envelope-fill"></i> <strong>Email:</strong> slmenscollection@gmail.com</p>
                                    <p><i class="bi bi-telephone-fill"></i> <strong>Phone:</strong> 8610999612</p>
                                    <p><i class="bi bi-geo-alt-fill"></i> <strong>Address:</strong> NO:2-4/25, Sowndamman Kovil Street, Elampillai, Salem-637502, Tamil Nadu</p>
                                </div>
                                <h3>Business Hours</h3>
                                <p>Monday - Sunday: 9:00 AM - 8:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer class="footer">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4">
                            <h5>SL Men's Collections</h5>
                            <p>NO:2-4/25, Sowndamman Kovil Street,<br>
                            Elampillai, Salem-637502.<br>
                            Tamil Nadu, India</p>
                        </div>
                        <div class="col-md-4">
                            <h5>Contact Info</h5>
                            <p><i class="bi bi-telephone"></i> Phone: 8610999612</p>
                            <p><i class="bi bi-envelope"></i> Email: slmenscollection@gmail.com</p>
                        </div>
                        <div class="col-md-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled">
                                <li><a href="/about" class="text-white">About Us</a></li>
                                <li><a href="/contact" class="text-white">Contact Us</a></li>
                                <li><a href="/return-refund" class="text-white">Return & Refund Policy</a></li>
                                <li><a href="/shipping-policy" class="text-white">Shipping Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <hr class="mt-4 bg-light">
                    <div class="text-center">
                        <p>&copy; ${new Date().getFullYear()} SL Men's Collections. All rights reserved.</p>
                    </div>
                </div>
            </footer>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

app.get('/return-refund', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Return & Refund Policy - SL Men's Collections</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
            <style>
                .navbar-brand {
                    font-weight: bold;
                    font-size: 1.8rem;
                }
                .nav-link {
                    font-size: 1.1rem;
                    margin-right: 15px;
                }
                .hero-section {
                    background-color: #f8f9fa;
                    padding: 3rem 0;
                    margin-bottom: 2rem;
                }
                footer {
                    background-color: #343a40;
                    color: white;
                    padding: 2rem 0;
                    margin-top: 3rem;
                }
                .policy-card {
                    margin-bottom: 2rem;
                    border-left: 4px solid #0d6efd;
                }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                    <a class="navbar-brand" href="/">SL MEN'S </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/contact">Contact Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/return-refund">Return & Refund</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/shipping-policy">Shipping Policy</a>
                            </li>
                        </ul>
                        <div class="d-flex">
                            <a href="/login" class="btn btn-outline-light">Login</a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div class="hero-section">
                <div class="container text-center">
                    <h1 class="display-4">Return & Refund Policy</h1>
                </div>
            </div>
            
            <div class="container">
                <div class="row">
                    <div class="col-lg-8 mx-auto">
                        <div class="card policy-card shadow-sm mb-4">
                            <div class="card-body">
                                <h2 class="card-title">Our Return & Refund Policy</h2>
                                <div class="policy-content">
                                    <p>We offer a 7-day return policy. We will provide exchange or refund based on customer preference and stock availability.</p>
                                    
                                    <h4 class="mt-4">Refund Methods</h4>
                                    <p>We provide refunds through:</p>
                                    <ul>
                                        <li>GPay</li>
                                        <li>PhonePe</li>
                                        <li>Bank Transfer</li>
                                    </ul>
                                    <p>Refunds will be processed based on customer preference and will be done within 48 hours from the time of receiving the return shipment.</p>
                                    
                                    <h4 class="mt-4">Return Conditions</h4>
                                    <ul>
                                        <li>Items must be unused, unworn, and in their original condition with all tags attached</li>
                                        <li>Original proof of purchase must be provided</li>
                                        <li>Return shipping costs are the responsibility of the customer unless the return is due to our error</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer class="footer">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4">
                            <h5>SL Men's Collections</h5>
                            <p>NO:2-4/25, Sowndamman Kovil Street,<br>
                            Elampillai, Salem-637502.<br>
                            Tamil Nadu, India</p>
                        </div>
                        <div class="col-md-4">
                            <h5>Contact Info</h5>
                            <p><i class="bi bi-telephone"></i> Phone: 8610999612</p>
                            <p><i class="bi bi-envelope"></i> Email: slmenscollection@gmail.com</p>
                        </div>
                        <div class="col-md-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled">
                                <li><a href="/about" class="text-white">About Us</a></li>
                                <li><a href="/contact" class="text-white">Contact Us</a></li>
                                <li><a href="/return-refund" class="text-white">Return & Refund Policy</a></li>
                                <li><a href="/shipping-policy" class="text-white">Shipping Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <hr class="mt-4 bg-light">
                    <div class="text-center">
                        <p>&copy; ${new Date().getFullYear()} SL Men's Collections. All rights reserved.</p>
                    </div>
                </div>
            </footer>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

app.get('/shipping-policy', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Shipping Policy - SL Men's Collections</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
            <style>
                .navbar-brand {
                    font-weight: bold;
                    font-size: 1.8rem;
                }
                .nav-link {
                    font-size: 1.1rem;
                    margin-right: 15px;
                }
                .hero-section {
                    background-color: #f8f9fa;
                    padding: 3rem 0;
                    margin-bottom: 2rem;
                }
                footer {
                    background-color: #343a40;
                    color: white;
                    padding: 2rem 0;
                    margin-top: 3rem;
                }
                .policy-card {
                    margin-bottom: 2rem;
                    border-left: 4px solid #0d6efd;
                }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                    <a class="navbar-brand" href="/">SL MEN'S </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/contact">Contact Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/return-refund">Return & Refund</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/shipping-policy">Shipping Policy</a>
                            </li>
                        </ul>
                        <div class="d-flex">
                            <a href="/login" class="btn btn-outline-light">Login</a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div class="hero-section">
                <div class="container text-center">
                    <h1 class="display-4">Shipping Policy</h1>
                </div>
            </div>
            
            <div class="container">
                <div class="row">
                    <div class="col-lg-8 mx-auto">
                        <div class="card policy-card shadow-sm mb-4">
                            <div class="card-body">
                                <h2 class="card-title">Our Shipping Policy</h2>
                                <div class="policy-content">
                                    <h4 class="mt-4">Prepaid Orders</h4>
                                    <ul>
                                        <li>We ship all our prepaid orders on the same day</li>
                                        <li>Shipping partners: Professional Courier, ST Courier, or India Post</li>
                                        <li>Delivery time: 2 to 5 days based on customer location</li>
                                        <li>Free shipping for all prepaid orders</li>
                                    </ul>
                                    
                                    <h4 class="mt-4">Cash on Delivery (COD) Orders</h4>
                                    <ul>
                                        <li>All COD orders are shipped through India Post</li>
                                        <li>Delivery time: 3 to 7 days based on customer location</li>
                                        <li>Flat ₹100 delivery charge for all COD orders</li>
                                    </ul>
                                    
                                    <h4 class="mt-4">Additional Information</h4>
                                    <ul>
                                        <li>Shipping partner is selected based on customer location and preference</li>
                                        <li>Delivery times are estimates and may vary due to circumstances beyond our control</li>
                                        <li>Tracking information will be provided for all orders</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer class="footer">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4">
                            <h5>SL Men's Collections</h5>
                            <p>NO:2-4/25, Sowndamman Kovil Street,<br>
                            Elampillai, Salem-637502.<br>
                            Tamil Nadu, India</p>
                        </div>
                        <div class="col-md-4">
                            <h5>Contact Info</h5>
                            <p><i class="bi bi-telephone"></i> Phone: 8610999612</p>
                            <p><i class="bi bi-envelope"></i> Email: slmenscollection@gmail.com</p>
                        </div>
                        <div class="col-md-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled">
                                <li><a href="/about" class="text-white">About Us</a></li>
                                <li><a href="/contact" class="text-white">Contact Us</a></li>
                                <li><a href="/return-refund" class="text-white">Return & Refund Policy</a></li>
                                <li><a href="/shipping-policy" class="text-white">Shipping Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <hr class="mt-4 bg-light">
                    <div class="text-center">
                        <p>&copy; ${new Date().getFullYear()} SL Men's Collections. All rights reserved.</p>
                    </div>
                </div>
            </footer>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});
// Login Page
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login - MyShop</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <!-- Animate.css -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
            <style>
                :root {
                    --primary-color: #4e73df;
                    --secondary-color: #f8f9fc;
                    --accent-color: #ff6b6b;
                    --dark-color: #2c3e50;
                    --light-color: #f8f9fa;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: var(--secondary-color);
                    color: var(--dark-color);
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
                
                /* Navbar styles */
                .navbar-brand {
                    font-weight: 700;
                    font-size: 1.8rem;
                }
                
                .nav-link {
                    font-weight: 500;
                    position: relative;
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: var(--primary-color);
                    transition: width 0.3s ease;
                }
                
                .nav-link:hover::after {
                    width: 100%;
                }
                
                /* Login Page Specific Styles */
                .login-container {
                    max-width: 500px;
                    margin: 2rem auto;
                    padding: 2rem;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    background: white;
                    position: relative;
                    overflow: hidden;
                }
                
                .login-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 5px;
                    height: 100%;
                    background: var(--primary-color);
                }
                
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .form-control:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
                }
                
                .btn-login {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                    padding: 0.5rem 1.5rem;
                    font-weight: 500;
                    transition: all 0.3s;
                }
                
                .btn-login:hover {
                    background-color: #3a5bc7;
                    border-color: #3a5bc7;
                    transform: translateY(-2px);
                }
                
                /* Footer styles */
                footer {
                    background: var(--dark-color);
                    color: white;
                    padding: 40px 0 20px;
                    margin-top: auto;
                }
                
                .footer-links a {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .footer-links a:hover {
                    color: white;
                }
                
                .social-icons-footer a {
                    color: white;
                    font-size: 1.5rem;
                    margin-right: 15px;
                    transition: transform 0.3s;
                }
                
                .social-icons-footer a:hover {
                    transform: translateY(-5px);
                }
                
                /* Responsive adjustments */
                @media (max-width: 767.98px) {
                    .navbar-brand {
                        font-size: 1.5rem;
                    }
                    
                    .login-container {
                        margin: 1rem;
                        padding: 1.5rem;
                    }
                }
                
                @media (max-width: 575.98px) {
                    .login-container {
                        margin: 1rem 0.5rem;
                        padding: 1rem;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Navigation Bar -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="/">MyShop</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/contact">Contact Us</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link active" href="/login">
                                    <i class="fas fa-user me-1"></i> Login
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <!-- Main Content -->
            <main class="flex-grow-1">
                <div class="container my-5">
                    <div class="login-container animate__animated animate__fadeInUp">
                        <div class="login-header">
                            <h2>Admin Login</h2>
                            ${req.query.error ? '<div class="alert alert-danger">Invalid credentials</div>' : ''}
                        </div>
                        
                        <form action="/login" method="POST">
                            <div class="mb-4">
                                <label for="phone" class="form-label">Phone</label>
                                <input type="text" class="form-control" id="phone" name="phone" required>
                            </div>
                            
                            <div class="mb-4">
                                <label for="password" class="form-label">Password</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="password" name="password" required>
                                    <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="d-grid">
                                <button type="submit" class="btn btn-login btn-lg">Login</button>
                            </div>
                             <div class="text-center mt-3">
                <p>Don't have an account? <a href="/register">Register here</a></p>
            </div>
                        </form>
                    </div>
                </div>
            </main>
            
            <!-- Footer -->
            <footer>
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 mb-4">
                            <h5>MyShop</h5>
                            <p>Your one-stop destination for all your shopping needs. Quality products at affordable prices.</p>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Quick Links</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="/">Home</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/login">Login</a></li>
                            </ul>
                        </div>
                        <div class="col-md-2 mb-4">
                            <h5>Categories</h5>
                            <ul class="list-unstyled footer-links">
                                <li><a href="#">Electronics</a></li>
                                <li><a href="#">Fashion</a></li>
                                <li><a href="#">Home & Kitchen</a></li>
                                <li><a href="#">Beauty</a></li>
                            </ul>
                        </div>
                        <div class="col-md-4 mb-4">
                            <h5>Connect With Us</h5>
                            <div class="social-icons-footer">
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                            </div>
                        </div>
                    </div>
                    <hr class="my-4 bg-light">
                    <div class="row">
                        <div class="col-md-6 text-center text-md-start">
                            <p class="mb-0">&copy; 2023 MyShop. All rights reserved.</p>
                        </div>
                        <div class="col-md-6 text-center text-md-end">
                            <p class="mb-0">
                                <a href="#" class="text-white me-3">Privacy Policy</a>
                                <a href="#" class="text-white">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
            
            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            
            <script>
                // Toggle password visibility
                document.getElementById('togglePassword').addEventListener('click', function() {
                    const passwordInput = document.getElementById('password');
                    const icon = this.querySelector('i');
                    
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        passwordInput.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Login POST

// Registration Page
app.get('/register', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Register | SL MEN'S</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
            <style>
                :root {
                    --primary-color: #343a40;
                    --secondary-color: #6c757d;
                    --accent-color: #0d6efd;
                }
                
                body {
                    background-color: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .navbar-brand {
                    font-weight: 700;
                    letter-spacing: 1px;
                }
                
                .register-container {
                    max-width: 500px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .form-control:focus {
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }
                
                .btn-primary {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                    padding: 0.5rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .btn-primary:hover {
                    background-color: #495057;
                    border-color: #495057;
                    transform: translateY(-1px);
                }
                
                .form-label {
                    font-weight: 500;
                    color: var(--secondary-color);
                }
                
                .input-group-text {
                    background-color: #e9ecef;
                }
                
                @media (max-width: 576px) {
                    .register-container {
                        margin: 1rem;
                        padding: 1.5rem;
                    }
                    
                    body {
                        padding-top: 0;
                    }
                    
                    .navbar {
                        padding: 0.5rem 1rem;
                    }
                }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
                <div class="container">
                    <a class="navbar-brand" href="/">
                        <i class="bi bi-shop"></i> SL MEN'S
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/login">
                                    <i class="bi bi-box-arrow-in-right"></i> Login
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <div class="container">
                <div class="register-container">
                    <h2 class="text-center mb-4">
                        <i class="bi bi-person-plus"></i> Create Account
                    </h2>
                    
                    <form action="/register" method="POST" id="registerForm">
                        <div class="mb-3">
                            <label for="phone" class="form-label">Phone Number</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="bi bi-phone"></i>
                                </span>
                                <input type="tel" class="form-control" id="phone" name="phone" 
                                       placeholder="Enter your phone number" required
                                       pattern="[0-9]{10,15}" title="Please enter a valid phone number">
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="email" class="form-label">Email Address</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="bi bi-envelope"></i>
                                </span>
                                <input type="email" class="form-control" id="email" name="email" 
                                       placeholder="Enter your email" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="bi bi-lock"></i>
                                </span>
                                <input type="password" class="form-control" id="password" name="password" 
                                       placeholder="Create a password" required
                                       minlength="6" title="Password must be at least 6 characters">
                            </div>
                            <div class="form-text">Must be at least 6 characters</div>
                        </div>
                        
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="terms" required>
                            <label class="form-check-label" for="terms">
                                I agree to the <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal">Terms and Conditions</a>
                            </label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-100 mt-2">
                            <i class="bi bi-person-plus"></i> Register
                        </button>
                    </form>
                    
                    <div class="mt-4 text-center">
                        <p class="mb-2">Already have an account? <a href="/login" class="text-decoration-none">Sign in</a></p>
                        <a href="/" class="btn btn-outline-secondary btn-sm">
                            <i class="bi bi-arrow-left"></i> Back to Home
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Terms and Conditions Modal -->
            <div class="modal fade" id="termsModal" tabindex="-1" aria-labelledby="termsModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="termsModalLabel">Terms and Conditions</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>By creating an account, you agree to our terms of service and privacy policy.</p>
                            <p>Your personal information will be used to provide and improve our services. We will never share your information with third parties without your consent.</p>
                            <p>You are responsible for maintaining the confidentiality of your account and password.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">I Understand</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <script>
                // Client-side form validation
                document.getElementById('registerForm').addEventListener('submit', function(e) {
                    const password = document.getElementById('password').value;
                    const terms = document.getElementById('terms').checked;
                    
                    if (password.length < 6) {
                        alert('Password must be at least 6 characters');
                        e.preventDefault();
                        return false;
                    }
                    
                    if (!terms) {
                        alert('You must agree to the terms and conditions');
                        e.preventDefault();
                        return false;
                    }
                    
                    return true;
                });
            </script>
        </body>
        </html>
    `);
});

// Handle Registration
app.post('/register', async (req, res) => {
    try {
        const { phone, email, password } = req.body;
        
        // Basic validation
        if (!phone || !email || !password) {
            return res.status(400).send(`
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error!</strong> All fields are required.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    <div class="mt-2">
                        <a href="/register" class="btn btn-sm btn-outline-danger">Go back</a>
                    </div>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            `);
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
        if (existingUser) {
            return res.status(409).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Registration Failed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <!-- Bootstrap Icons -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
        <style>
            body {
                background: #f8f9fa;
                font-family: 'Segoe UI', sans-serif;
            }
            .container {
                max-width: 600px;
                margin-top: 80px;
                padding: 20px;
            }
            .alert {
                box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                background-color: #fef2f2;
            }
            .btn-close {
                position: absolute;
                top: 20px;
                right: 20px;
            }
            .btn-sm {
                min-width: 130px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="alert alert-danger alert-dismissible fade show position-relative" role="alert">
                <h4 class="alert-heading">
                    <i class="bi bi-exclamation-triangle-fill text-danger"></i> Registration Failed
                </h4>
                <p>User with this phone number or email already exists.</p>
                <hr>
                <div class="d-flex justify-content-between">
                    <a href="/login" class="btn btn-sm btn-success">
                        <i class="bi bi-box-arrow-in-right"></i> Login instead
                    </a>
                    <a href="/register" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-arrow-counterclockwise"></i> Try again
                    </a>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
        <!-- Bootstrap JS -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
`);

        }
        
        // Create new user
        const user = new User({ phone, email, password });
        await user.save();
        
        // Redirect to home page with success message
        res.redirect('/?registration=success');
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Error | SL MEN'S</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        :root {
            --error-color: #dc3545;
            --error-bg: #f8d7da;
            --error-border: #f5c2c7;
        }
        
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .error-container {
            max-width: 600px;
            margin: 2rem auto;
            padding: 2rem;
            border-radius: 10px;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .error-alert {
            border-left: 5px solid var(--error-color);
            animation: fadeIn 0.3s ease-in-out;
        }
        
        .error-heading {
            color: var(--error-color);
        }
        
        .error-details {
            font-size: 0.9rem;
            background-color: var(--error-bg);
            border: 1px solid var(--error-border);
            border-radius: 5px;
            padding: 10px;
            margin-top: 15px;
            word-break: break-word;
        }
        
        .btn-outline-secondary {
            border-color: #6c757d;
        }
        
        @media (max-width: 768px) {
            .error-container {
                margin: 1rem;
                padding: 1.5rem;
            }
            
            .btn-group-responsive {
                flex-direction: column;
                gap: 10px;
            }
            
            .btn-group-responsive .btn {
                width: 100%;
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="/">
                <i class="bi bi-shop"></i> SL MEN'S
            </a>
        </div>
    </nav>
    
    <div class="container">
        <div class="error-container">
            <div class="alert alert-danger error-alert alert-dismissible fade show" role="alert">
                <div class="d-flex align-items-center">
                    <i class="bi bi-exclamation-octagon-fill fs-3 me-3"></i>
                    <div>
                        <h4 class="alert-heading error-heading mb-2">Registration Error</h4>
                        <p class="mb-3">We encountered an issue while processing your registration request.</p>
                    </div>
                </div>
                
                <div class="error-details mb-3">
                    <strong>Details:</strong> ${error.message}
                </div>
                
                <hr>
                
                <div class="d-flex flex-wrap btn-group-responsive justify-content-between">
                    <a href="/" class="btn btn-outline-secondary">
                        <i class="bi bi-house"></i> Return Home
                    </a>
                    <a href="/register" class="btn btn-primary">
                        <i class="bi bi-arrow-repeat"></i> Try Again
                    </a>
                    <button type="button" class="btn btn-outline-danger" data-bs-dismiss="alert">
                        <i class="bi bi-x-circle"></i> Dismiss
                    </button>
                </div>
                
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            
            <div class="text-center mt-4 text-muted">
                <small>If the problem persists, please contact support.</small>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Auto-dismiss alert after 10 seconds
        setTimeout(() => {
            const alert = document.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 10000);
    </script>
</body>
</html>
`);
    }
});
// Login POST
app.post('/login', (req, res) => {
    const { phone, password } = req.body;
    if (phone === 'slmenscollections' && password === 'nagarjun') {
        res.cookie('adminLoggedIn', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000 });
        res.redirect('/admin');
    } else {
        res.redirect('/login?error=1');
    }
});

// Logout
app.get('/logout', (req, res) => {
    res.clearCookie('adminLoggedIn');
    res.redirect('/');
});

// Admin Dashboard
app.get('/admin', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    try {
        // Fetch statistics from the database
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();
        const pendingOrderCount = await Order.countDocuments({ status: 'pending' });
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Admin Dashboard</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <style>
                    .card-img-top {
                        height: 200px;
                        object-fit: contain;
                    }
                    .stat-card {
                        transition: transform 0.3s;
                    }
                    .stat-card:hover {
                        transform: translateY(-5px);
                    }
                    .product-card {
                        transition: all 0.3s;
                    }
                    .product-card:hover {
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    }
                    .original-price {
                        text-decoration: line-through;
                        color: #6c757d;
                    }
                    .discount-badge {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                    }
                    .empty-state {
                        padding: 3rem;
                        text-align: center;
                        color: #6c757d;
                    }
                </style>
            </head>
            <body>
                 <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/admin">MyShop Admin</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link active" href="/admin">Dashboard</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/orders">Orders</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/users">Users</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/add-product">Add Product</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/product-analysis">Product Analysis</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">Logout</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                
                <div class="container-fluid mt-4">
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="card stat-card bg-primary text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 class="card-title">Total Products</h5>
                                            <h2 class="mb-0">${productCount}</h2>
                                        </div>
                                        <i class="fas fa-boxes fa-3x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card stat-card bg-success text-white">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 class="card-title">Total Orders</h5>
                                            <h2 class="mb-0">${orderCount}</h2>
                                        </div>
                                        <i class="fas fa-shopping-cart fa-3x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card stat-card bg-warning text-dark">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 class="card-title">Pending Orders</h5>
                                            <h2 class="mb-0">${pendingOrderCount}</h2>
                                        </div>
                                        <i class="fas fa-clock fa-3x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h2 class="mb-0">Products</h2>
                            <a href="/admin/add-product" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Add Product
                            </a>
                        </div>
                        <div class="card-body">
                            <div class="row" id="products-container">
                                <div class="col-12 text-center">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    async function loadProducts() {
                        try {
                            const response = await fetch('/api/products');
                            
                            if (!response.ok) {
                                throw new Error('Failed to fetch products');
                            }
                            
                            const products = await response.json();
                            const container = document.getElementById('products-container');
                            
                            if (!Array.isArray(products)) {
                                throw new Error('Invalid products data');
                            }
                            
                      if (products.length === 0) {
    container.innerHTML =
        '<div class="col-12 empty-state">' +
            '<i class="fas fa-box-open fa-4x mb-3"></i>' +
            '<h3>No Products Found</h3>' +
            '<p>Get started by adding your first product</p>' +
            '<a href="/admin/add-product" class="btn btn-primary">' +
                '<i class="fas fa-plus"></i> Add Product' +
            '</a>' +
        '</div>';
    return;
}

                            
                            container.innerHTML = '';
                            
                            products.forEach(product => {
                                // Safely handle potentially undefined fields
                                const name = product.name || 'Unnamed Product';
                                const description = product.description ? 
                                    (product.description.length > 50 ? 
                                        product.description.substring(0, 50) + '...' : 
                                        product.description) : 
                                    'No description available';
                                const price = product.price || 0;
                                const mrp = product.mrp || price;
                                const offerPercentage = product.offerPercentage || 0;
                                const imageUrl = product.mainImage?.data || 'https://via.placeholder.com/300?text=No+Image';
                                
                                const productCol = document.createElement('div');
                                productCol.className = 'col-md-4 col-lg-3 mb-4';
                                
                                productCol.innerHTML = \`
                                    <div class="card product-card h-100">
                                        \${offerPercentage > 0 ? 
                                            \`<span class="badge bg-danger discount-badge">\${offerPercentage}% OFF</span>\` : ''}
                                        <img src="\${imageUrl}" class="card-img-top p-3" alt="\${name}">
                                        <div class="card-body">
                                            <h5 class="card-title">\${name}</h5>
                                            <p class="card-text text-muted">\${description}</p>
                                            <div class="mb-2">
                                                <span class="fw-bold">₹\${price.toFixed(2)}</span>
                                                \${price < mrp ? 
                                                    \`<span class="original-price ms-2">₹\${mrp.toFixed(2)}</span>\` : ''}
                                            </div>
                                        </div>
                                        <div class="card-footer bg-transparent">
                                            <div class="d-flex justify-content-between">
                                                <a href="/admin/edit-product/\${product._id}" class="btn btn-sm btn-outline-primary">
                                                    <i class="fas fa-edit"></i> Edit
                                                </a>
                                                <button onclick="deleteProduct('\${product._id}')" class="btn btn-sm btn-outline-danger">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                \`;
                                container.appendChild(productCol);
                            });
                        } catch (error) {
                            const container = document.getElementById('products-container');
                            container.innerHTML = \`
                                <div class="col-12">
                                    <div class="alert alert-danger">
                                        <i class="fas fa-exclamation-triangle me-2"></i>
                                        Error loading products: \${error.message}
                                        <button onclick="loadProducts()" class="btn btn-sm btn-outline-primary ms-3">
                                            <i class="fas fa-sync-alt"></i> Retry
                                        </button>
                                    </div>
                                </div>
                            \`;
                            console.error('Error loading products:', error);
                        }
                    }
                    
                    function deleteProduct(id) {
                        if (confirm('Are you sure you want to delete this product?')) {
                            fetch(\`/api/products/\${id}\`, {
                                method: 'DELETE'
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Failed to delete product');
                                }
                                // Show success message and reload products
                                const container = document.getElementById('products-container');
                                container.innerHTML = \`
                                    <div class="col-12">
                                        <div class="alert alert-success">
                                            <i class="fas fa-check-circle me-2"></i>
                                            Product deleted successfully!
                                            <button onclick="loadProducts()" class="btn btn-sm btn-outline-primary ms-3">
                                                <i class="fas fa-sync-alt"></i> Refresh
                                            </button>
                                        </div>
                                    </div>
                                \`;
                                // Reload products after 2 seconds
                                setTimeout(loadProducts, 2000);
                            })
                            .catch(error => {
                                alert('Error deleting product: ' + error.message);
                                console.error('Delete error:', error);
                            });
                        }
                    }
                    
                    // Initial load
                    loadProducts();
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.status(500).send(`
            <div class="alert alert-danger">
                <h1>Internal Server Error</h1>
                <p>${error.message}</p>
                <a href="/admin" class="btn btn-primary">Try Again</a>
            </div>
        `);
    }
});
app.get('/admin/users', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    try {
        const users = await User.find().sort({ createdAt: -1 });
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>User Management | Admin Dashboard</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
                <style>
                    :root {
                        --primary-color: #343a40;
                        --secondary-color: #6c757d;
                        --accent-color: #0d6efd;
                    }
                    
                    body {
                        background-color: #f8f9fa;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    }
                    
                    .admin-navbar {
                        background-color: var(--primary-color);
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .admin-container {
                        padding: 20px;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 0 15px rgba(0,0,0,0.05);
                        margin-top: 20px;
                    }
                    
                    .table-responsive {
                        overflow-x: auto;
                    }
                    
                    .table th {
                        background-color: var(--primary-color);
                        color: white;
                        position: sticky;
                        top: 0;
                    }
                    
                    .table-hover tbody tr:hover {
                        background-color: rgba(13, 110, 253, 0.1);
                    }
                    
                    .badge-admin {
                        background-color: var(--accent-color);
                    }
                    
                    @media (max-width: 768px) {
                        .admin-container {
                            padding: 15px;
                            margin: 10px;
                        }
                        
                        .table-responsive {
                            border: 0;
                        }
                        
                        .table thead {
                            display: none;
                        }
                        
                        .table tr {
                            display: block;
                            margin-bottom: 20px;
                            border: 1px solid #dee2e6;
                            border-radius: 5px;
                        }
                        
                        .table td {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 1px solid #dee2e6;
                        }
                        
                        .table td::before {
                            content: attr(data-label);
                            font-weight: bold;
                            margin-right: 15px;
                            color: var(--secondary-color);
                        }
                    }
                </style>
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark admin-navbar">
                    <div class="container">
                        <a class="navbar-brand" href="/admin">
                            <i class="bi bi-speedometer2"></i> Admin Dashboard
                        </a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="adminNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/users">
                                        <i class="bi bi-people-fill"></i> Users
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/product-analysis">
                                        <i class="bi bi-graph-up"></i> Product Analysis
                                    </a>
                                </li>
                            </ul>
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link text-danger" href="/admin/logout">
                                        <i class="bi bi-box-arrow-right"></i> Logout
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                
                <div class="container admin-container">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="mb-0">
                            <i class="bi bi-people-fill"></i> User Management
                        </h2>
                        <span class="badge bg-primary rounded-pill">${users.length} users</span>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th><i class="bi bi-phone"></i> Phone</th>
                                    <th><i class="bi bi-envelope"></i> Email</th>
                                    <th><i class="bi bi-calendar"></i> Joined</th>
                                    <th><i class="bi bi-clock-history"></i> Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map(user => `
                                    <tr>
                                        <td data-label="Phone">${user.phone || 'N/A'}</td>
                                        <td data-label="Email">${user.email || 'N/A'}</td>
                                        <td data-label="Joined">${new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td data-label="Last Active">${user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send(`
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill"></i> Error loading users: ${error.message}
            </div>
        `);
    }
});

app.get('/admin/product-analysis', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    try {
        // Get product counts by category
        const products = await Product.aggregate([
            { $group: { 
                _id: "$category", 
                count: { $sum: 1 },
                totalPrice: { $sum: "$price" },
                avgPrice: { $avg: "$price" }
            }}
        ]);
        
        // Update or create ProductCount documents
        for (const product of products) {
            await ProductCount.findOneAndUpdate(
                { category: product._id },
                { $set: { 
                    count: product.count, 
                    totalPrice: product.totalPrice,
                    avgPrice: product.avgPrice
                }},
                { upsert: true, new: true }
            );
        }
        
        // Get all product counts
        const productCounts = await ProductCount.find().sort({ count: -1 });
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Product Analysis | Admin Dashboard</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
                <style>
                    /* Same styles as users page */
                    :root {
                        --primary-color: #343a40;
                        --secondary-color: #6c757d;
                        --accent-color: #0d6efd;
                    }
                    
                    body {
                        background-color: #f8f9fa;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    }
                    
                    .admin-navbar {
                        background-color: var(--primary-color);
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .admin-container {
                        padding: 20px;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 0 15px rgba(0,0,0,0.05);
                        margin-top: 20px;
                    }
                    
                    .table-responsive {
                        overflow-x: auto;
                    }
                    
                    .table th {
                        background-color: var(--primary-color);
                        color: white;
                        position: sticky;
                        top: 0;
                    }
                    
                    .progress {
                        height: 25px;
                    }
                    
                    .progress-bar {
                        background-color: var(--accent-color);
                    }
                    
                    @media (max-width: 768px) {
                        .admin-container {
                            padding: 15px;
                            margin: 10px;
                        }
                        
                        .table-responsive {
                            border: 0;
                        }
                        
                        .table thead {
                            display: none;
                        }
                        
                        .table tr {
                            display: block;
                            margin-bottom: 20px;
                            border: 1px solid #dee2e6;
                            border-radius: 5px;
                        }
                        
                        .table td {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 1px solid #dee2e6;
                        }
                        
                        .table td::before {
                            content: attr(data-label);
                            font-weight: bold;
                            margin-right: 15px;
                            color: var(--secondary-color);
                        }
                    }
                </style>
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark admin-navbar">
                    <div class="container">
                        <a class="navbar-brand" href="/admin">
                            <i class="bi bi-speedometer2"></i> Admin Dashboard
                        </a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="adminNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/users">
                                        <i class="bi bi-people-fill"></i> Users
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link active" href="/admin/product-analysis">
                                        <i class="bi bi-graph-up"></i> Product Analysis
                                    </a>
                                </li>
                            </ul>
                            <ul class="navbar-nav ms-auto">
                                <li class="nav-item">
                                    <a class="nav-link text-danger" href="/admin/logout">
                                        <i class="bi bi-box-arrow-right"></i> Logout
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                
                <div class="container admin-container">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="mb-0">
                            <i class="bi bi-graph-up"></i> Product Analysis
                        </h2>
                        <span class="badge bg-primary rounded-pill">${productCounts.length} categories</span>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th><i class="bi bi-tag"></i> Category</th>
                                    <th><i class="bi bi-box-seam"></i> Count</th>
                                    <th><i class="bi bi-currency-rupee"></i> Total Value</th>
                                    <th><i class="bi bi-currency-exchange"></i> Avg Price</th>
                                    <th><i class="bi bi-bar-chart"></i> Distribution</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productCounts.map(pc => {
                                    const totalProducts = productCounts.reduce((sum, item) => sum + item.count, 0);
                                    const percentage = ((pc.count / totalProducts) * 100).toFixed(1);
                                    return `
                                        <tr>
                                            <td data-label="Category">${pc.category || 'Uncategorized'}</td>
                                            <td data-label="Count">${pc.count}</td>
                                            <td data-label="Total Value">₹${pc.totalPrice.toFixed(2)}</td>
                                            <td data-label="Avg Price">₹${pc.avgPrice ? pc.avgPrice.toFixed(2) : '0.00'}</td>
                                            <td data-label="Distribution">
                                                <div class="d-flex align-items-center">
                                                    <div class="progress flex-grow-1 me-2">
                                                        <div class="progress-bar" role="progressbar" style="width: ${percentage}%" 
                                                            aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                                                    </div>
                                                    <small>${percentage}%</small>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-primary text-white">
                                    <i class="bi bi-pie-chart"></i> Products by Category
                                </div>
                                <div class="card-body">
                                    <canvas id="categoryChart" height="200"></canvas>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-primary text-white">
                                    <i class="bi bi-currency-rupee"></i> Value by Category
                                </div>
                                <div class="card-body">
                                    <canvas id="valueChart" height="200"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script>
                    // Prepare data for charts
                    const categories = ${JSON.stringify(productCounts.map(pc => pc.category || 'Uncategorized'))};
                    const counts = ${JSON.stringify(productCounts.map(pc => pc.count))};
                    const values = ${JSON.stringify(productCounts.map(pc => pc.totalPrice))};
                    
                    // Category distribution chart
                    const ctx1 = document.getElementById('categoryChart').getContext('2d');
                    new Chart(ctx1, {
                        type: 'pie',
                        data: {
                            labels: categories,
                            datasets: [{
                                data: counts,
                                backgroundColor: [
                                    '#0d6efd', '#6610f2', '#6f42c1', '#d63384', 
                                    '#fd7e14', '#ffc107', '#20c997', '#198754'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }
                    });
                    
                    // Value distribution chart
                    const ctx2 = document.getElementById('valueChart').getContext('2d');
                    new Chart(ctx2, {
                        type: 'bar',
                        data: {
                            labels: categories,
                            datasets: [{
                                label: 'Total Value (₹)',
                                data: values,
                                backgroundColor: '#0d6efd',
                                borderColor: '#0a58ca',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send(`
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill"></i> Error loading product analysis: ${error.message}
            </div>
        `);
    }
});
// Admin Orders Page
// Admin Orders Page
app.get('/admin/orders', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    const orders = await Order.find().sort({ orderedAt: -1 }).populate('productId');
    
    let ordersHTML = '';
    for (const order of orders) {
        const product = await Product.findById(order.productId);
        const productImage = product ? product.mainImage.data : '';
        
        ordersHTML += `
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-2">
                            ${productImage ? `<img src="${productImage}" class="img-fluid rounded" alt="Product Image">` : '<div class="text-center py-4 bg-light">No Image</div>'}
                        </div>
                        <div class="col-md-8">
                            <h3>Order #${order._id}</h3>
                            <p><strong>Customer:</strong> ${order.customerName}</p>
                            <p><strong>Product:</strong> ${order.productName}</p>
                            <p><strong>Size:</strong> ${order.size}</p>
                            <p><strong>Price:</strong> ₹${order.price}</p>
                            <p><strong>Quantity:</strong> ${order.quantity}</p>
                              <p><strong>Delivery Charge: 100</strong></p>

                            <p><strong>Total:</strong> ₹${order.price * order.quantity +100}</p>
                            <hr>
                            <h5>Customer Details</h5>
                            <p><strong>Phone:</strong> ${order.phone}</p>
                            <p><strong>Address:</strong> ${order.street}, ${order.area}, ${order.district}, ${order.state} - ${order.pincode}</p>
                            <p><strong>Ordered At:</strong> ${new Date(order.orderedAt).toLocaleString()}</p>
                        </div>
                        <div class="col-md-2">
                            <form action="/admin/orders/update-status" method="POST">
                                <input type="hidden" name="orderId" value="${order._id}">
                                <div class="form-group">
                                    <label for="status"><strong>Status</strong></label>
                                    <select class="form-control" name="status" id="status" onchange="this.form.submit()">
                                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    res.send(`  
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Orders | MyShop</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
            <style>
                .order-card {
                    transition: all 0.3s ease;
                }
                .order-card:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                }
                .navbar {
                    background-color: #212529 !important;
                }
                .navbar-brand {
                    font-weight: bold;
                }
                .nav-link {
                    color: rgba(255, 255, 255, 0.85);
                }
                .nav-link:hover, .nav-link.active {
                    color: white;
                }
            </style>
        </head>
        <body>
            <!-- Navigation Bar -->
            <nav class="navbar navbar-expand-lg navbar-dark mb-4">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/admin">
                        <i class="bi bi-shop me-2"></i>MyShop Admin
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/admin">
                                    <i class="bi bi-house-door me-1"></i>Dashboard
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/admin/orders">
                                    <i class="bi bi-list-check me-1"></i>Orders
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/admin/add-product">
                                    <i class="bi bi-plus-circle me-1"></i>Add Product
                                </a>
                            </li>
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="/logout">
                                    <i class="bi bi-box-arrow-right me-1"></i>Logout
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <div class="container-fluid">
                <div class="row">
                    <main class="col-12">
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
                            <h1 class="h2">Orders Management</h1>
                            <div class="btn-toolbar mb-2 mb-md-0">
                                <div class="btn-group me-2">
                                    <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="container mt-4">
                            ${ordersHTML || '<div class="alert alert-info">No orders found.</div>'}
                        </div>
                    </main>
                </div>
            </div>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <script>
                // Auto-submit form when status changes
                document.querySelectorAll('select[name="status"]').forEach(select => {
                    select.addEventListener('change', function() {
                        this.form.submit();
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// Status update route remains the same
app.post('/admin/orders/update-status', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    try {
        const { orderId, status } = req.body;
        await Order.findByIdAndUpdate(orderId, { status });
        res.redirect('/admin/orders');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.redirect('/admin/orders');
    }
});
// Add Product Page
app.get('/admin/add-product', (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Add Product</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .navbar-brand {
                    font-weight: bold;
                }
                .product-form {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 0 15px rgba(0,0,0,0.1);
                    padding: 2rem;
                    margin-top: 2rem;
                }
                .form-header {
                    border-bottom: 1px solid #eee;
                    padding-bottom: 1rem;
                    margin-bottom: 2rem;
                }
                .form-label {
                    font-weight: 500;
                }
                .nav-divider {
                    border-left: 1px solid #dee2e6;
                    height: 24px;
                    margin: 0 1rem;
                }
                @media (max-width: 768px) {
                    .navbar-nav {
                        margin-top: 1rem;
                    }
                    .nav-divider {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                    <a class="navbar-brand" href="/admin">MyShop Admin</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/admin">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/admin/orders">Orders</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/admin/add-product">Add Product</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="/logout">Logout</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="product-form">
                            <div class="form-header">
                                <h2 class="mb-0">Add New Product</h2>
                            </div>
                            <form id="productForm">
                                <div class="mb-3">
                                    <label class="form-label">Product Name</label>
                                    <input type="text" class="form-control" name="name" required>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Category</label>
                                        <input type="text" class="form-control" name="category" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Sizes (comma separated)</label>
                                        <input type="text" class="form-control" name="size" required placeholder="S,M,L,XL">
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" name="description" rows="3" required></textarea>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Price</label>
                                        <input type="number" class="form-control" name="price" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Offer Percentage</label>
                                        <input type="number" class="form-control" name="offerPercentage" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">MRP</label>
                                        <input type="number" class="form-control" name="mrp" required>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Main Image</label>
                                    <input type="file" class="form-control" id="mainImage" accept="image/*">
                                    <div class="form-text">This will be the primary display image</div>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="form-label">Additional Images</label>
                                    <input type="file" class="form-control" id="additionalImages" multiple accept="image/*">
                                    <div class="form-text">You can select multiple images</div>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-primary btn-lg" onclick="addProduct()">
                                        Add Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            <script>
                function addProduct() {
                    const form = document.getElementById('productForm');
                    const formData = new FormData(form);
                    
                    // Get main image
                    const mainImageInput = document.getElementById('mainImage');
                    const mainImageFile = mainImageInput.files[0];
                    const mainImagePromise = new Promise((resolve) => {
                        if (mainImageFile) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                formData.set('mainImageData', e.target.result.split(',')[1]);
                                formData.set('mainImageType', mainImageFile.type);
                                resolve();
                            };
                            reader.readAsDataURL(mainImageFile);
                        } else {
                            resolve();
                        }
                    });
                    
                    // Get additional images
                    const additionalImagesInput = document.getElementById('additionalImages');
                    const additionalImagesFiles = additionalImagesInput.files;
                    const additionalImagesPromises = [];
                    
                    for (let i = 0; i < additionalImagesFiles.length; i++) {
                        additionalImagesPromises.push(new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                formData.append('additionalImagesData', e.target.result.split(',')[1]);
                                formData.append('additionalImagesType', additionalImagesFiles[i].type);
                                resolve();
                            };
                            reader.readAsDataURL(additionalImagesFiles[i]);
                        }));
                    }
                    
                    // Convert sizes to array
                    const sizes = formData.get('size').split(',').map(s => s.trim());
                    formData.set('size', JSON.stringify(sizes));
                    
                    // Show loading state
                    const submitBtn = document.querySelector('button[onclick="addProduct()"]');
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding Product...';
                    
                    // Wait for all images to be processed
                    Promise.all([mainImagePromise, ...additionalImagesPromises])
                        .then(() => {
                            fetch('/api/products', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(Object.fromEntries(formData))
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    alert('Product added successfully!');
                                    window.location.href = '/admin';
                                } else {
                                    alert('Error adding product: ' + data.message);
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert('Error adding product');
                            })
                            .finally(() => {
                                submitBtn.disabled = false;
                                submitBtn.textContent = 'Add Product';
                            });
                        });
                }
            </script>
        </body>
        </html>
    `);
});
// Edit Product Page
app.get('/admin/edit-product/:id', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        res.send(`
            <html>
            <head>
                <title>Edit Product</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
                <style>
                    .product-image {
                        max-width: 100px;
                        max-height: 100px;
                        margin-right: 10px;
                        margin-bottom: 10px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        padding: 5px;
                    }
                    .image-preview-container {
                        display: flex;
                        flex-wrap: wrap;
                        margin-bottom: 15px;
                    }
                    .nav-divider {
                        border-left: 1px solid #dee2e6;
                        margin: 0 10px;
                        height: 24px;
                    }
                    .form-section {
                        background-color: #f8f9fa;
                        border-radius: 5px;
                        padding: 15px;
                        margin-bottom: 15px;
                    }
                    /* Mobile-specific styles */
                    @media (max-width: 768px) {
                        .navbar-brand {
                            font-size: 1rem;
                        }
                        .form-section {
                            padding: 12px;
                        }
                        .product-image {
                            max-width: 80px;
                            max-height: 80px;
                        }
                        h2 {
                            font-size: 1.5rem;
                        }
                        h4 {
                            font-size: 1.2rem;
                        }
                        .btn {
                            padding: 0.5rem 1rem;
                            font-size: 0.9rem;
                        }
                        .container {
                            padding-left: 10px;
                            padding-right: 10px;
                        }
                    }
                    @media (max-width: 576px) {
                        .product-image {
                            max-width: 60px;
                            max-height: 60px;
                        }
                        .form-section {
                            padding: 10px;
                        }
                        .col-md-6, .col-md-4, .col-md-12 {
                            padding-left: 5px;
                            padding-right: 5px;
                        }
                        .row.g-3 {
                            margin-left: -5px;
                            margin-right: -5px;
                        }
                        .row.g-3 > [class^="col-"] {
                            padding-left: 5px;
                            padding-right: 5px;
                        }
                        .form-control, .form-select {
                            font-size: 0.9rem;
                            padding: 0.375rem 0.5rem;
                        }
                        .btn {
                            width: 100%;
                            margin-bottom: 10px;
                        }
                        .d-md-flex {
                            display: block !important;
                        }
                        .me-md-2 {
                            margin-right: 0 !important;
                        }
                    }
                </style>
            </head>
            <body>
                <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="/admin">MyShop Admin</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/orders">Orders</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/admin/add-product">Add Product</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link" href="/logout">Logout</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                
                <div class="container">
                    <div class="row mb-3">
                        <div class="col">
                            <h2>Edit Product</h2>
                        </div>
                    </div>
                    
                    <form id="productForm">
                        <div class="form-section">
                            <h4 class="mb-3">Basic Information</h4>
                            <div class="row g-2">
                                <div class="col-md-6">
                                    <label class="form-label">Product Name</label>
                                    <input type="text" class="form-control" name="name" value="${product.name}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Category</label>
                                    <input type="text" class="form-control" name="category" value="${product.category}" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" name="description" rows="3" required>${product.description}</textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4 class="mb-3">Pricing</h4>
                            <div class="row g-2">
                                <div class="col-md-4">
                                    <label class="form-label">Price</label>
                                    <input type="number" class="form-control" name="price" value="${product.price}" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">MRP</label>
                                    <input type="number" class="form-control" name="mrp" value="${product.mrp}" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Offer Percentage</label>
                                    <input type="number" class="form-control" name="offerPercentage" value="${product.offerPercentage}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4 class="mb-3">Sizes</h4>
                            <div class="row">
                                <div class="col-md-6">
                                    <label class="form-label">Sizes (comma separated)</label>
                                    <input type="text" class="form-control" name="size" value="${product.size.join(',')}" required placeholder="S,M,L,XL">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4 class="mb-3">Images</h4>
                            <div class="row g-2">
                                <div class="col-md-6">
                                    <label class="form-label">Current Main Image</label>
                                    <div class="image-preview-container">
                                        <img src="${product.mainImage.data}" class="product-image">
                                    </div>
                                    <label class="form-label">Change Main Image</label>
                                    <input type="file" class="form-control" id="mainImage" accept="image/*">
                                </div>
                            </div>
                            
                            <div class="row g-2 mt-2">
                                <div class="col-md-12">
                                    <label class="form-label">Current Additional Images</label>
                                    <div class="image-preview-container">
                                        ${product.additionalImages.map(img => `<img src="${img.data}" class="product-image">`).join('')}
                                    </div>
                                    <label class="form-label">Change Additional Images (multiple)</label>
                                    <input type="file" class="form-control" id="additionalImages" multiple accept="image/*">
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                            <button type="button" class="btn btn-secondary me-md-2 mb-2" onclick="window.location.href='/admin'">Cancel</button>
                            <button type="button" class="btn btn-primary mb-2" onclick="updateProduct('${product._id}')">
                                <i class="bi bi-save"></i> Update Product
                            </button>
                        </div>
                    </form>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    function updateProduct(id) {
                        const form = document.getElementById('productForm');
                        const formData = new FormData(form);
                        
                        // Get main image
                        const mainImageInput = document.getElementById('mainImage');
                        const mainImageFile = mainImageInput.files[0];
                        const mainImagePromise = new Promise((resolve) => {
                            if (mainImageFile) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    formData.set('mainImageData', e.target.result.split(',')[1]);
                                    formData.set('mainImageType', mainImageFile.type);
                                    resolve();
                                };
                                reader.readAsDataURL(mainImageFile);
                            } else {
                                resolve();
                            }
                        });
                        
                        // Get additional images
                        const additionalImagesInput = document.getElementById('additionalImages');
                        const additionalImagesFiles = additionalImagesInput.files;
                        const additionalImagesPromises = [];
                        
                        for (let i = 0; i < additionalImagesFiles.length; i++) {
                            additionalImagesPromises.push(new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    formData.append('additionalImagesData', e.target.result.split(',')[1]);
                                    formData.append('additionalImagesType', additionalImagesFiles[i].type);
                                    resolve();
                                };
                                reader.readAsDataURL(additionalImagesFiles[i]);
                            }));
                        }
                        
                        // Convert sizes to array
                        const sizes = formData.get('size').split(',').map(s => s.trim());
                        formData.set('size', JSON.stringify(sizes));
                        
                        // Wait for all images to be processed
                        Promise.all([mainImagePromise, ...additionalImagesPromises])
                            .then(() => {
                                fetch(\`/api/products/\${id}\`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(Object.fromEntries(formData))
                                })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        alert('Product updated successfully!');
                                        window.location.href = '/admin';
                                    } else {
                                        alert('Error updating product: ' + data.message);
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                    alert('Error updating product');
                                });
                            });
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error loading product');
    }
});

// View Product Page
app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        res.send(`
            <html>
            <head>
                <title>${product.name} | SRI NAGALAKSHMI TEXTILES</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
                <style>
                    /* Custom Styles */
                    .navbar-brand {
                        font-weight: 700;
                        color: #d9230f !important;
                    }
                    .product-image-main {
                        max-width: 100%;
                        height: auto;
                        border: 1px solid #dee2e6;
                        border-radius: 0.25rem;
                    }
                    .product-thumbnail {
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border: 1px solid #dee2e6;
                        border-radius: 0.25rem;
                        margin-right: 5px;
                        margin-bottom: 5px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    @media (min-width: 768px) {
                        .product-thumbnail {
                            width: 80px;
                            height: 80px;
                            margin-right: 10px;
                            margin-bottom: 10px;
                        }
                    }
                    .product-thumbnail:hover {
                        border-color: #0d6efd;
                        transform: scale(1.05);
                    }
                    .price-section {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 0.25rem;
                        margin: 15px 0;
                    }
                    .current-price {
                        font-size: 1.25rem;
                        font-weight: bold;
                        color: #dc3545;
                    }
                    @media (min-width: 768px) {
                        .current-price {
                            font-size: 1.5rem;
                        }
                    }
                    .original-price {
                        text-decoration: line-through;
                        color: #6c757d;
                    }
                    .discount-badge {
                        font-size: 0.9rem;
                        background-color: #dc3545;
                        color: white;
                    }
                    .size-option {
                        position: relative;
                    }
                    .size-option input[type="radio"] {
                        position: absolute;
                        opacity: 0;
                    }
                    .size-option label {
                        display: inline-block;
                        padding: 8px 12px;
                        border: 1px solid #dee2e6;
                        border-radius: 0.25rem;
                        margin-right: 8px;
                        margin-bottom: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        min-width: 40px;
                        text-align: center;
                    }
                    @media (min-width: 768px) {
                        .size-option label {
                            padding: 8px 15px;
                            margin-right: 10px;
                            margin-bottom: 10px;
                        }
                    }
                    .size-option input[type="radio"]:checked + label {
                        border-color: #0d6efd;
                        background-color: rgba(13, 110, 253, 0.1);
                        font-weight: bold;
                    }
                    .quantity-selector {
                        width: 100%;
                    }
                    @media (min-width: 768px) {
                        .quantity-selector {
                            width: 100px;
                        }
                    }
                    .footer {
                        background-color: #343a40;
                        color: white;
                        padding: 30px 0;
                        margin-top: 30px;
                    }
                    .footer a {
                        color: #adb5bd;
                        text-decoration: none;
                    }
                    .footer a:hover {
                        color: white;
                    }
                    .social-icons a {
                        color: white;
                        font-size: 1.25rem;
                        margin-right: 10px;
                    }
                    .nav-link {
                        font-weight: 500;
                    }
                    .whatsapp-float {
                        position: fixed;
                        width: 50px;
                        height: 50px;
                        bottom: 20px;
                        right: 20px;
                        background-color: #25d366;
                        color: #FFF;
                        border-radius: 50px;
                        text-align: center;
                        font-size: 24px;
                        box-shadow: 2px 2px 3px #999;
                        z-index: 100;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    @media (min-width: 768px) {
                        .whatsapp-float {
                            width: 60px;
                            height: 60px;
                            bottom: 40px;
                            right: 40px;
                            font-size: 30px;
                        }
                    }
                    
                    /* Mobile-specific styles */
                    @media (max-width: 767px) {
                        h1 {
                            font-size: 1.75rem;
                        }
                        .price-section {
                            padding: 10px;
                        }
                        .footer {
                            padding: 20px 0;
                            margin-top: 20px;
                        }
                        .footer .col-md-4 {
                            margin-bottom: 20px;
                        }
                        .btn-lg {
                            padding: 0.5rem 1rem;
                            font-size: 1rem;
                        }
                        .navbar-brand {
                            font-size: 1.1rem;
                        }
                    }
                    
                    /* Improved touch targets */
                    .btn, .product-thumbnail, .size-option label {
                        touch-action: manipulation;
                    }
                </style>
            </head>
            <body>
                <!-- Navigation Bar -->
                <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                    <div class="container">
                        <a class="navbar-brand" href="/">
                            <i class="bi bi-shop"></i> SL MEN'S
                        </a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/about">About Us</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/contact">Contact</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link" href="/login">
                                        <i class="bi bi-person"></i> Login
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <!-- Main Product Content -->
                <div class="container my-3 my-md-5">
                    <div class="row">
                        <!-- Product Images -->
                        <div class="col-md-6 mb-4 mb-md-0">
                            <div class="mb-3">
                                <img src="${product.mainImage.data}" alt="${product.name}" class="product-image-main img-fluid" id="mainProductImage">
                            </div>
                            <div class="d-flex flex-wrap">
                                <img src="${product.mainImage.data}" alt="${product.name}" class="product-thumbnail" 
                                     onclick="document.getElementById('mainProductImage').src = this.src">
                                ${product.additionalImages.map(img => `
                                    <img src="${img.data}" alt="${product.name}" class="product-thumbnail" 
                                         onclick="document.getElementById('mainProductImage').src = this.src">
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Product Details -->
                        <div class="col-md-6">
                            <h1 class="mb-2 mb-md-3">${product.name}</h1>
                            <p class="text-muted mb-3 mb-md-4">${product.category}</p>
                            
                            <div class="price-section mb-3 mb-md-4">
                                <div class="d-flex align-items-center">
                                    <span class="current-price me-2">₹${product.price}</span>
                                    <span class="original-price me-2">₹${product.mrp}</span>
                                    <span class="badge discount-badge">${product.offerPercentage}% OFF</span>
                                </div>
                                <small class="text-success">Inclusive of all taxes</small>
                            </div>
                            
                            <div class="mb-3 mb-md-4">
                                <h3>Description</h3>
                                <p class="text-muted">${product.description}</p>
                            </div>
                            
                            <form id="buyForm" action="/checkout" method="POST" class="mb-4 mb-md-5">
                                <input type="hidden" name="productId" value="${product._id}">
                                <input type="hidden" name="productName" value="${product.name}">
                                <input type="hidden" name="price" value="${product.price}">
                                <input type="hidden" name="mrp" value="${product.mrp}">
                                
                                <div class="mb-3 mb-md-4">
                                    <h5 class="mb-2 mb-md-3">Select Size</h5>
                                    <div class="d-flex flex-wrap">
                                        ${product.size.map(s => `
                                            <div class="size-option">
                                                <input type="radio" id="size-${s}" name="size" value="${s}" required>
                                                <label for="size-${s}">${s}</label>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <small class="text-muted">Select a size to proceed</small>
                                </div>
                                
                                <div class="mb-3 mb-md-4">
                                    <h5 class="mb-2 mb-md-3">Quantity</h5>
                                    <input type="number" class="form-control quantity-selector" name="quantity" value="1" min="1" max="10">
                                </div>
                                
                                <div class="d-grid gap-2">
                                <p><strong>Delivery Charge: 100</strong></p>
                                    <button type="submit" class="btn btn-danger btn-lg">

                                        <i class="bi bi-lightning-fill"></i> Buy Now
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="footer">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-4 mb-4 mb-md-0">
                                <h5>SL MEN'S COLLECTIONS</h5>
                                <p>Your one-stop shop for quality textiles and clothing.</p>
                                <div class="social-icons">
                                    <a href="#"><i class="bi bi-facebook"></i></a>
                                    <a href="#"><i class="bi bi-instagram"></i></a>
                                    <a href="#"><i class="bi bi-twitter"></i></a>
                                </div>
                            </div>
                            <div class="col-md-4 mb-4 mb-md-0">
                                <h5>Quick Links</h5>
                                <ul class="list-unstyled">
                                    <li><a href="/">Home</a></li>
                                    <li><a href="/products">Products</a></li>
                                    <li><a href="/about">About Us</a></li>
                                    <li><a href="/contact">Contact</a></li>
                                </ul>
                            </div>
                            <div class="col-md-4">
                                <h5>Contact Us</h5>
                                <ul class="list-unstyled">
                                    <li><i class="bi bi-envelope"></i> slmenscollection@gmail.com</li>
                                    <li><i class="bi bi-telephone"></i> 8610999612</li>
                                    <li><i class="bi bi-geo-alt"></i> 2-4/25, 
SOWNDAMMAN KOVIL STREET,
ELAMPILLAI,
SALEM-637502., TN</li>
                                </ul>
                            </div>
                        </div>
                        <hr class="my-3 my-md-4 bg-secondary">
                        <div class="row">
                            <div class="col-md-6 text-center text-md-start mb-2 mb-md-0">
                                <p class="mb-0">&copy; ${new Date().getFullYear()} SL MEN'S COLLECTIONS. All rights reserved.</p>
                            </div>
                            <div class="col-md-6 text-center text-md-end">
                                <p class="mb-0">Designed with <i class="bi bi-heart-fill text-danger"></i> for textile lovers</p>
                            </div>
                        </div>
                    </div>
                </footer>

                <!-- WhatsApp Float Button -->
                <a href="https://wa.me/918610999612" class="whatsapp-float" target="_blank" aria-label="Chat on WhatsApp">
                    <i class="bi bi-whatsapp"></i>
                </a>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    // Function to handle adding to cart
                    function addToCart(productId) {
                        const form = document.getElementById('buyForm');
                        const size = form.querySelector('input[name="size"]:checked');
                        
                        if (!size) {
                            alert('Please select a size first');
                            return;
                        }
                        
                        const quantity = form.querySelector('input[name="quantity"]').value;
                        
                        // Here you would typically make an AJAX call to add to cart
                        fetch('/api/cart', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                productId: productId,
                                size: size.value,
                                quantity: quantity
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert('Product added to cart successfully!');
                            } else {
                                alert('Error: ' + data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Error adding to cart');
                        });
                    }
                    
                    // Initialize tooltips
                    document.addEventListener('DOMContentLoaded', function() {
                        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                        tooltipTriggerList.map(function (tooltipTriggerEl) {
                            return new bootstrap.Tooltip(tooltipTriggerEl);
                        });
                        
                        // Prevent zooming on double-tap for mobile
                        let lastTouchEnd = 0;
                        document.addEventListener('touchend', function(event) {
                            const now = (new Date()).getTime();
                            if (now - lastTouchEnd <= 300) {
                                event.preventDefault();
                            }
                            lastTouchEnd = now;
                        }, false);
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error loading product');
    }
});
// Checkout Page
app.post('/checkout', async (req, res) => {
    const { productId, productName, price, mrp, size, quantity } = req.body;
    
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.send(`
            <html>
            <head>
                <title>Checkout | SRI NAGALAKSHMI TEXTILES</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
                <style>
                    .navbar-brand {
                        font-weight: 700;
                        color: #d9230f !important;
                    }
                    .checkout-container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 0 15px;
                    }
                    .address-form {
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        padding: 20px;
                    }
                    .order-summary {
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 0 15px rgba(0,0,0,0.1);
                        padding: 20px;
                        margin-top: 20px;
                    }
                    .product-image-checkout {
                        width: 70px;
                        height: 70px;
                        object-fit: cover;
                        border-radius: 4px;
                    }
                    .payment-method {
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 15px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .payment-method:hover {
                        border-color: #0d6efd;
                    }
                    .payment-method.selected {
                        border-color: #0d6efd;
                        background-color: rgba(13, 110, 253, 0.05);
                    }
                    .payment-method input[type="radio"] {
                        margin-right: 10px;
                    }
                    .total-amount {
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: #d9230f;
                    }
                    .footer {
                        background-color: #343a40;
                        color: white;
                        padding: 30px 0;
                        margin-top: 30px;
                    }
                    .whatsapp-float {
                        position: fixed;
                        width: 50px;
                        height: 50px;
                        bottom: 20px;
                        right: 20px;
                        background-color: #25d366;
                        color: #FFF;
                        border-radius: 50px;
                        text-align: center;
                        font-size: 24px;
                        box-shadow: 2px 2px 3px #999;
                        z-index: 100;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    /* Mobile-specific styles */
                    @media (max-width: 576px) {
                        .checkout-container {
                            padding: 0 10px;
                        }
                        .address-form, .order-summary {
                            padding: 15px;
                        }
                        .product-image-checkout {
                            width: 60px;
                            height: 60px;
                        }
                        .btn-lg {
                            padding: 0.5rem 1rem;
                            font-size: 1rem;
                        }
                        .navbar-brand {
                            font-size: 1rem;
                        }
                        .footer {
                            padding: 20px 0;
                            font-size: 0.9rem;
                        }
                        .whatsapp-float {
                            width: 40px;
                            height: 40px;
                            font-size: 20px;
                            bottom: 15px;
                            right: 15px;
                        }
                    }
                    @media (max-width: 768px) {
                        .row.g-4 {
                            gap: 15px !important;
                        }
                        .mb-3, .mb-4 {
                            margin-bottom: 1rem !important;
                        }
                        h2 {
                            font-size: 1.5rem;
                        }
                        h3 {
                            font-size: 1.3rem;
                        }
                        h5 {
                            font-size: 1.1rem;
                        }
                    }
                </style>
            </head>
            <body>
                <!-- Navigation Bar -->
                <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                    <div class="container">
                        <a class="navbar-brand" href="/">
                            <i class="bi bi-shop"></i> SL MEN'S 
                        </a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/products">Products</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/about">About Us</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/contact">Contact</a>
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link" href="/login">
                                        <i class="bi bi-person"></i> Login
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <!-- Main Checkout Content -->
                <div class="container py-4 checkout-container">
                    <div class="row g-3">
                        <!-- Delivery Address Form -->
                        <div class="col-lg-7">
                            <div class="address-form">
                                <h2 class="mb-3"><i class="bi bi-truck"></i> Delivery Address</h2>
                                <form action="/complete-order" method="POST">
                                    <input type="hidden" name="productId" value="${productId}">
                                    <input type="hidden" name="productName" value="${productName}">
                                    <input type="hidden" name="price" value="${price}">
                                    <input type="hidden" name="mrp" value="${mrp}">
                                    <input type="hidden" name="size" value="${size}">
                                    <input type="hidden" name="quantity" value="${quantity || 1}">
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Phone Number</label>
                                        <input type="tel" class="form-control" name="phone" required>
                                    </div>
                                    <div class="mb-3">
    <label class="form-label">Full Name</label>
    <input type="text" class="form-control" name="fullName" required>
</div>
                                    <div class="mb-3">
                                        <label class="form-label">Street Address</label>
                                        <input type="text" class="form-control" name="street" required>
                                    </div>
                                    <div class="row g-2 mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Area Name</label>
                                            <input type="text" class="form-control" name="area" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Pincode</label>
                                            <input type="text" class="form-control" name="pincode" required>
                                        </div>
                                    </div>
                                    <div class="row g-2 mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">District</label>
                                            <input type="text" class="form-control" name="district" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">State</label>
                                            <input type="text" class="form-control" name="state" required>
                                        </div>
                                    </div>
                                    
                                    <h3 class="mb-3"><i class="bi bi-credit-card"></i> Payment Method</h3>
                                    <div class="payment-method selected">
                                        <input type="radio" name="paymentMethod" value="COD" checked id="cod">
                                        <label for="cod" class="w-100">
                                            <strong>Cash on Delivery (COD)</strong>
                                            <p class="mb-0 text-muted">Pay when you receive your order</p>
                                            
                                        </label>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary btn-lg w-100 mt-2">
                                        <i class="bi bi-check-circle"></i> Complete Order
                                    </button>
                                </form>
                            </div>
                        </div>
                        
                        <!-- Order Summary -->
                        <div class="col-lg-5">
                            <div class="order-summary">
                                <h2 class="mb-3"><i class="bi bi-receipt"></i> Order Summary</h2>
                                
                                <div class="d-flex mb-3">
                                    <img src="${product.mainImage.data}" alt="${productName}" class="product-image-checkout me-3">
                                    <div>
                                        <h5>${productName}</h5>
                                        <p class="mb-1 text-muted">Size: ${size}</p>
                                        <p class="mb-0 text-muted">Quantity: ${quantity || 1}</p>
                                    </div>
                                </div>
                                
                                <hr>
                                
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Product Price:</span>
                                    <span>₹${price}</span>
                                </div>
                                
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Delivery:</span>
                                    <span class="text-success">100</span>
                                </div>
                                
                                <hr>
                                
                                <div class="d-flex justify-content-between">
                                    <span class="fw-bold">Total Amount:</span>
                                    <span class="total-amount">₹${price * (quantity || 1)+100}</span>
                                </div>
                                
                                <div class="alert alert-success mt-3">
                                    <i class="bi bi-check-circle"></i> Your order is eligible for FREE delivery
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="footer">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-4 mb-4 mb-md-0">
                                <h5>SL MEN'S COLLECTIONS</h5>
                                <p>Your one-stop shop for quality textiles and clothing.</p>
                                <div class="social-icons">
                                    <a href="#" class="text-white me-2"><i class="bi bi-facebook"></i></a>
                                    <a href="#" class="text-white me-2"><i class="bi bi-instagram"></i></a>
                                    <a href="#" class="text-white"><i class="bi bi-twitter"></i></a>
                                </div>
                            </div>
                            <div class="col-md-4 mb-4 mb-md-0">
                                <h5>Quick Links</h5>
                                <ul class="list-unstyled">
                                    <li><a href="/" class="text-white">Home</a></li>
                                    <li><a href="/products" class="text-white">Products</a></li>
                                    <li><a href="/about" class="text-white">About Us</a></li>
                                    <li><a href="/contact" class="text-white">Contact</a></li>
                                </ul>
                            </div>
                            <div class="col-md-4">
                                <h5>Contact Us</h5>
                                <ul class="list-unstyled">
                                    <li><i class="bi bi-envelope"></i> slmenscollection@gmail.com</li>
                                    <li><i class="bi bi-telephone"></i> 8610999612</li>
                                    <li><i class="bi bi-geo-alt"></i> 2-4/25, 
SOWNDAMMAN KOVIL STREET,
ELAMPILLAI,
SALEM-637502., TN</li>
                                </ul>
                            </div>
                        </div>
                        <hr class="my-3 bg-secondary">
                        <div class="row">
                            <div class="col-md-6 text-center text-md-start">
                                <p class="mb-0">&copy; ${new Date().getFullYear()} SL MEN'S COLLECTIONS. All rights reserved.</p>
                            </div>
                            <div class="col-md-6 text-center text-md-end">
                                <p class="mb-0">Designed with <i class="bi bi-heart-fill text-danger"></i> for textile lovers</p>
                            </div>
                        </div>
                    </div>
                </footer>

                <!-- WhatsApp Float Button -->
                <a href="https://wa.me/918610999612" class="whatsapp-float" target="_blank" aria-label="Chat on WhatsApp">
                    <i class="bi bi-whatsapp"></i>
                </a>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    // Highlight selected payment method
                    document.querySelectorAll('.payment-method').forEach(method => {
                        method.addEventListener('click', function() {
                            document.querySelectorAll('.payment-method').forEach(m => {
                                m.classList.remove('selected');
                            });
                            this.classList.add('selected');
                            const radio = this.querySelector('input[type="radio"]');
                            radio.checked = true;
                        });
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Error loading product details');
    }
});
// Complete Order
app.post('/complete-order', async (req, res) => {
    try {
        const { productId, productName, price, mrp, size, quantity, phone, fullName, street, area, pincode, district, state, paymentMethod } = req.body;
        
        const order = new Order({
            productId,
            productName,
            customerName: fullName,
            price,
            mrp,
            size,
            quantity,
            phone,
            street,
            area,
            pincode,
            district,
            state,
            paymentMethod
        });
        
        await order.save();
        
        const totalAmount = price * quantity;
        
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .order-confirmation {
            padding: 20px;
        }
        .success-icon {
            font-size: 4rem;
            color: #28a745;
            margin-bottom: 20px;
        }
        .confirmation-card {
            border: none;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .card-title {
            color: #2c3e50;
            font-weight: 600;
        }
        .btn-continue {
            background-color: #2c3e50;
            color: white;
            padding: 10px 25px;
            border-radius: 30px;
            font-weight: 500;
            transition: all 0.3s;
        }
        .btn-continue:hover {
            background-color: #1a252f;
            transform: translateY(-2px);
        }
        .order-details p {
            margin-bottom: 0.5rem;
        }
        @media (max-width: 576px) {
            .success-icon {
                font-size: 3rem;
            }
            .card-body {
                padding: 1.25rem;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="#">SL MEN'S COLLECTIONS</a>
        </div>
    </nav>

    <div class="container my-4 my-md-5">
        <div class="row justify-content-center">
            <div class="col-12 col-md-8 text-center order-confirmation">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 class="mb-3">Order Confirmed!</h2>
                <p class="lead mb-4">Thank you for your purchase, ${fullName}!</p>
                <p class="text-muted mb-4">Your order ID is: <strong>${order._id}</strong></p>
                
                <div class="card mx-auto mb-4 confirmation-card">
                    <div class="card-body text-start p-3 p-md-4 order-details">
                        <h5 class="card-title mb-3">Order Summary</h5>
                        <hr class="my-2">
                        <p><strong>Customer Name:</strong> ${fullName}</p>
                        <p><strong>Order ID:</strong> ${order._id}</p>
                        <p><strong>Product:</strong> ${productName} (${size})</p>
                        <p><strong>Quantity:</strong> ${quantity}</p>
                         <p><strong>Delivery Charge: 100</strong> </p>
                        <p><strong>Total Amount:</strong> ₹${totalAmount + 100}</p>
                        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                        <p><strong>Delivery Address:</strong> ${street}, ${area}, ${district}, ${state} - ${pincode}</p>
                    </div>
                </div>
                
                <div class="d-grid gap-2 d-md-block mb-4">
                    <a href="/" class="btn btn-continue">
                        <i class="fas fa-arrow-left me-2"></i>Continue Shopping
                    </a>
                </div>
                
                <div class="alert alert-info mt-3 text-start">
                    <i class="fas fa-info-circle me-2"></i>
                    We've sent the order details to your registered mobile number ${phone}.
                </div>
            </div>
        </div>
    </div>

    <footer class="bg-dark text-white py-4 mt-5">
        <div class="container text-center">
            <p class="mb-0">&copy; 2025 SL MEN'S COLLECTIONS. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
        `);
    } catch (error) {
        res.status(500).send(`
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>
                Error completing order: ${error.message}
            </div>
        `);
    }
});
// Search Products


// API Routes
app.delete('/api/products/:id', async (req, res) => {
    try {
        // Find the product first to get its category and price
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        // Update product count for the category before deleting
        await ProductCount.findOneAndUpdate(
            { category: product.category },
            { $inc: { count: -1, totalPrice: -product.price } }
        );
        
        // Now delete the product
        await product.remove();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add new product
app.post('/api/products', async (req, res) => {
    try {
        const { name, category, description, price, offerPercentage, mrp, size, 
                mainImageData, mainImageType, additionalImagesData = [], additionalImagesType = [] } = req.body;
        
        // Create main image object
        const mainImage = {
            data: `data:${mainImageType};base64,${mainImageData}`,
            contentType: mainImageType
        };
        
        // Create additional images array
        const additionalImages = [];
        if (Array.isArray(additionalImagesData)) {
            for (let i = 0; i < additionalImagesData.length; i++) {
                additionalImages.push({
                    data: `data:${additionalImagesType[i]};base64,${additionalImagesData[i]}`,
                    contentType: additionalImagesType[i]
                });
            }
        } else if (additionalImagesData) {
            // Handle case when only one additional image is provided
            additionalImages.push({
                data: `data:${additionalImagesType};base64,${additionalImagesData}`,
                contentType: additionalImagesType
            });
        }
        
        // Create product
        const product = new Product({
            name,
            category,
            description,
            price: parseFloat(price),
            offerPercentage: parseFloat(offerPercentage),
            mrp: parseFloat(mrp),
            size: JSON.parse(size),
            mainImage,
            additionalImages
        });
        
        await product.save();
        
        // Update product count for the category
        const productCount = await ProductCount.findOneAndUpdate(
            { category: product.category },
            { $inc: { count: 1, totalPrice: product.price } },
            { upsert: true, new: true }
        );
        
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, category, description, price, offerPercentage, mrp, size, 
                mainImageData, mainImageType, additionalImagesData = [], additionalImagesType = [] } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        // Store original values for count updates
        const originalCategory = product.category;
        const originalPrice = product.price;
        
        // Update fields
        product.name = name || product.name;
        product.category = category || product.category;
        product.description = description || product.description;
        product.price = parseFloat(price) || product.price;
        product.offerPercentage = parseFloat(offerPercentage) || product.offerPercentage;
        product.mrp = parseFloat(mrp) || product.mrp;
        product.size = JSON.parse(size) || product.size;
        
        // Update main image if provided
        if (mainImageData && mainImageType) {
            product.mainImage = {
                data: `data:${mainImageType};base64,${mainImageData}`,
                contentType: mainImageType
            };
        }
        
        // Update additional images if provided
        if (additionalImagesData.length > 0) {
            product.additionalImages = [];
            if (Array.isArray(additionalImagesData)) {
                for (let i = 0; i < additionalImagesData.length; i++) {
                    product.additionalImages.push({
                        data: `data:${additionalImagesType[i]};base64,${additionalImagesData[i]}`,
                        contentType: additionalImagesType[i]
                    });
                }
            } else {
                product.additionalImages.push({
                    data: `data:${additionalImagesType};base64,${additionalImagesData}`,
                    contentType: additionalImagesType
                });
            }
        }
        
        // Handle product count updates if category or price changed
        if (category && category !== originalCategory) {
            // Category changed - update both old and new category counts
            await ProductCount.findOneAndUpdate(
                { category: originalCategory },
                { $inc: { count: -1, totalPrice: -originalPrice } }
            );
            
            await ProductCount.findOneAndUpdate(
                { category: product.category },
                { $inc: { count: 1, totalPrice: product.price } },
                { upsert: true }
            );
        } else if (price && parseFloat(price) !== originalPrice) {
            // Only price changed - update price difference
            const priceDiff = parseFloat(price) - originalPrice;
            await ProductCount.findOneAndUpdate(
                { category: product.category },
                { $inc: { totalPrice: priceDiff } }
            );
        }
        
        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

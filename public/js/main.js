// ============================================
// THE OUTRAGE - Main JavaScript
// ============================================

// Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('active');
  document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : 'auto';
}

// Cart Functions
function openCart() {
  window.location.href = '/cart';
}

function openSearch() {
  const searchTerm = prompt('Search for products:');
  if (searchTerm) {
    // Implement search functionality
    alert('Search functionality - Add search API endpoint');
  }
}

function openWishlist() {
  alert('Wishlist functionality coming soon!');
}

// Update Cart Count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(el => {
    el.textContent = count;
  });
}

// Load Products
async function loadProducts(filterType, containerId, limit = false, gender = null, categoryId = null, brandId = null) {
  try {
    let url = '/api/products?';
    
    if (filterType === 'featured') {
      url += 'featured=1';
    } else if (filterType === 'new_arrival') {
      url += 'new_arrival=1';
    } else if (filterType === 'sale') {
      url += 'sale=1';
    } else if (filterType === 'gender' && gender) {
      url += `gender=${gender}`;
    } else if (filterType === 'category' && categoryId) {
      url += `category=${categoryId}`;
    } else if (filterType === 'brand' && brandId) {
      url += `brand=${brandId}`;
    }

    const response = await fetch(url);
    const products = await response.json();

    if (limit) {
      products.splice(8);
    }

    displayProducts(products, containerId);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Display Products
function displayProducts(products, containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted);">No products found.</p>';
    return;
  }

  container.innerHTML = products.map(product => {
    const sizes = JSON.parse(product.sizes || '[]');
    const discount = product.discount > 0 ? `<span class="discount-badge">-${product.discount}%</span>` : '';
    const isNew = product.new_arrival ? `<span class="new-badge">NEW</span>` : '';
    
    return `
      <div class="product-card" onclick="window.location.href='/product/${product.id}'">
        <div class="product-card-image">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x500?text=Product+Image'">
          ${discount}
          ${isNew}
        </div>
        <div class="product-card-content">
          <p class="product-card-brand">${product.brand_name}</p>
          <h3 class="product-card-title">${product.name}</h3>
          <div class="product-card-price">
            <span class="original-price">PKR ${product.original_price}</span>
            <span class="sale-price">PKR ${product.sale_price}</span>
          </div>
          <div class="product-card-sizes">
            ${sizes.slice(0, 4).map(size => `<span class="size-tag">${size}</span>`).join('')}
          </div>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Quick Add to Cart
async function quickAddToCart(productId) {
  try {
    const response = await fetch(`/api/product/${productId}`);
    const product = await response.json();

    const sizes = JSON.parse(product.sizes || '[]');
    if (sizes.length === 0) {
      alert('No sizes available');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand_name,
      price: product.sale_price,
      image: product.image,
      size: sizes[0],
      quantity: 1
    };

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(item => item.id === cartItem.id && item.size === cartItem.size);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Added to cart!');
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Intersection Observer for Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.product-card, .category-card, .brand-card');
  
  animatedElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    observer.observe(el);
  });
});

// Header Scroll Effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll && currentScroll > 100) {
    header.style.transform = 'translateY(-100%)';
  } else {
    header.style.transform = 'translateY(0)';
  }

  lastScroll = currentScroll;
});

// Image Lazy Loading
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Console Message
console.log('%c THE OUTRAGE ', 'background: #111111; color: #D4AF37; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Premium Export Quality Branded Clothing ', 'color: #BDBDBD; font-size: 14px;');

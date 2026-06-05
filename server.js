const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'outrage-luxury-fashion-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));
app.use(express.static('public'));
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Initialize database tables and sample data
function initializeDatabase() {
  db.serialize(() => {
    // Admins table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      slug TEXT,
      gender TEXT
    )`);

    // Brands table
    db.run(`CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      slug TEXT,
      image TEXT
    )`);

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      brand_id INTEGER,
      category_id INTEGER,
      description TEXT,
      original_price REAL,
      sale_price REAL,
      discount INTEGER,
      image TEXT,
      images TEXT,
      sizes TEXT,
      stock INTEGER,
      gender TEXT,
      featured INTEGER DEFAULT 0,
      new_arrival INTEGER DEFAULT 0,
      sale_item INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      phone TEXT,
      city TEXT,
      address TEXT,
      total REAL,
      items TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default admin
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)`, 
      ['admin', hashedPassword]);

    // Insert sample categories
    const categories = [
      { name: 'T-Shirts', slug: 't-shirts', gender: 'men' },
      { name: 'Polo T-Shirts', slug: 'polo-t-shirts', gender: 'men' },
      { name: 'Shirts', slug: 'shirts', gender: 'men' },
      { name: 'Shorts', slug: 'shorts', gender: 'men' },
      { name: 'Trousers', slug: 'trousers', gender: 'men' },
      { name: 'T-Shirts', slug: 't-shirts', gender: 'women' },
      { name: 'Shorts', slug: 'shorts', gender: 'women' },
      { name: 'Trousers', slug: 'trousers', gender: 'women' },
      { name: 'T-Shirts', slug: 't-shirts', gender: 'junior' },
      { name: 'Polo T-Shirts', slug: 'polo-t-shirts', gender: 'junior' },
      { name: 'Shorts', slug: 'shorts', gender: 'junior' },
      { name: 'Trousers', slug: 'trousers', gender: 'junior' }
    ];

    categories.forEach(cat => {
      db.run(`INSERT OR IGNORE INTO categories (name, slug, gender) VALUES (?, ?, ?)`,
        [cat.name, cat.slug, cat.gender]);
    });

    // Insert sample brands
    const brands = ['Mango', 'Levis', 'Zara', 'MAN', 'Fold Up', 'Breakout', 'Engine', 'H&M'];
    brands.forEach(brand => {
      db.run(`INSERT OR IGNORE INTO brands (name, slug) VALUES (?, ?)`,
        [brand, brand.toLowerCase().replace(/\s+/g, '-')]);
    });

    // Insert sample products
    const sampleProducts = [
      {
        name: 'Classic Cotton T-Shirt',
        brand_id: 1,
        category_id: 1,
        description: 'Premium quality cotton t-shirt from Mango. Comfortable and stylish.',
        original_price: 2500,
        sale_price: 1500,
        discount: 40,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        images: '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"]',
        sizes: '["S","M","L","XL"]',
        stock: 50,
        gender: 'men',
        featured: 1,
        new_arrival: 1
      },
      {
        name: 'Polo Shirt Premium',
        brand_id: 2,
        category_id: 2,
        description: 'Elegant polo shirt from Levis. Perfect for casual and semi-formal occasions.',
        original_price: 3500,
        sale_price: 2200,
        discount: 37,
        image: 'https://images.unsplash.com/photo-1625910513413-5fc66588e60a?w=600',
        images: '["https://images.unsplash.com/photo-1625910513413-5fc66588e60a?w=600","https://images.unsplash.com/photo-1625910513413-5fc66588e60a?w=600"]',
        sizes: '["S","M","L","XL"]',
        stock: 30,
        gender: 'men',
        featured: 1
      },
      {
        name: 'Casual Shirt',
        brand_id: 3,
        category_id: 3,
        description: 'Stylish casual shirt from Zara. Made with premium fabric.',
        original_price: 4000,
        sale_price: 2800,
        discount: 30,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
        images: '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"]',
        sizes: '["S","M","L","XL"]',
        stock: 25,
        gender: 'men',
        featured: 1
      },
      {
        name: 'Denim Shorts',
        brand_id: 4,
        category_id: 4,
        description: 'Classic denim shorts from MAN. Comfortable fit.',
        original_price: 3000,
        sale_price: 2000,
        discount: 33,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600',
        images: '["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600","https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600"]',
        sizes: '["S","M","L","XL"]',
        stock: 40,
        gender: 'men',
        featured: 1
      },
      {
        name: 'Formal Trousers',
        brand_id: 5,
        category_id: 5,
        description: 'Premium formal trousers from Fold Up. Perfect for office wear.',
        original_price: 4500,
        sale_price: 3200,
        discount: 29,
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
        images: '["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600","https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600"]',
        sizes: '["30","32","34","36"]',
        stock: 35,
        gender: 'men',
        featured: 1
      },
      {
        name: 'Women T-Shirt',
        brand_id: 6,
        category_id: 6,
        description: 'Stylish women t-shirt from Breakout. Soft and comfortable.',
        original_price: 2200,
        sale_price: 1400,
        discount: 36,
        image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
        images: '["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600","https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600"]',
        sizes: '["S","M","L","XL"]',
        stock: 45,
        gender: 'women',
        featured: 1,
        new_arrival: 1
      },
      {
        name: 'Women Shorts',
        brand_id: 7,
        category_id: 7,
        description: 'Comfortable women shorts from Engine. Perfect for summer.',
        original_price: 2800,
        sale_price: 1800,
        discount: 36,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
        images: '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600","https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600"]',
        sizes: '["S","M","L","XL"]',
        stock: 30,
        gender: 'women',
        featured: 1
      },
      {
        name: 'Junior T-Shirt',
        brand_id: 8,
        category_id: 9,
        description: 'Cool t-shirt for kids from H&M. Fun and comfortable.',
        original_price: 1800,
        sale_price: 1200,
        discount: 33,
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600',
        images: '["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600","https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600"]',
        sizes: '["S","M","L"]',
        stock: 50,
        gender: 'junior',
        featured: 1,
        new_arrival: 1
      }
    ];

    sampleProducts.forEach(product => {
      db.run(`INSERT OR IGNORE INTO products 
        (name, brand_id, category_id, description, original_price, sale_price, discount, image, images, sizes, stock, gender, featured, new_arrival) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.name, product.brand_id, product.category_id, product.description, 
         product.original_price, product.sale_price, product.discount, product.image,
         product.images, product.sizes, product.stock, product.gender, product.featured, product.new_arrival]);
    });

    console.log('Database initialized successfully');
  });
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/men', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'men.html'));
});

app.get('/women', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'women.html'));
});

app.get('/junior', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'junior.html'));
});

app.get('/brands', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'brands.html'));
});

app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'product.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'privacy-policy.html'));
});

app.get('/terms-conditions', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'terms-conditions.html'));
});

// Admin routes
app.get('/admin', (req, res) => {
  if (req.session.admin) {
    res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
  } else {
    res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
  }
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

// API Routes
app.get('/api/products', (req, res) => {
  const { gender, category, brand, featured, new_arrival, sale } = req.query;
  let query = 'SELECT p.*, b.name as brand_name, c.name as category_name FROM products p LEFT JOIN brands b ON p.brand_id = b.id LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
  const params = [];

  if (gender) {
    query += ' AND p.gender = ?';
    params.push(gender);
  }
  if (category) {
    query += ' AND p.category_id = ?';
    params.push(category);
  }
  if (brand) {
    query += ' AND p.brand_id = ?';
    params.push(brand);
  }
  if (featured) {
    query += ' AND p.featured = 1';
  }
  if (new_arrival) {
    query += ' AND p.new_arrival = 1';
  }
  if (sale) {
    query += ' AND p.sale_item = 1';
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/product/:id', (req, res) => {
  db.get('SELECT p.*, b.name as brand_name, c.name as category_name FROM products p LEFT JOIN brands b ON p.brand_id = b.id LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', 
    [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(row);
    }
  });
});

app.get('/api/categories', (req, res) => {
  const { gender } = req.query;
  let query = 'SELECT * FROM categories';
  const params = [];

  if (gender) {
    query += ' WHERE gender = ?';
    params.push(gender);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/brands', (req, res) => {
  db.all('SELECT * FROM brands', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/orders', (req, res) => {
  const { customer_name, phone, city, address, total, items } = req.body;
  db.run('INSERT INTO orders (customer_name, phone, city, address, total, items) VALUES (?, ?, ?, ?, ?, ?)',
    [customer_name, phone, city, address, total, JSON.stringify(items)], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true, orderId: this.lastID });
    }
  });
});

// Admin API
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err || !admin) {
      res.json({ success: false, message: 'Invalid credentials' });
    } else {
      if (bcrypt.compareSync(password, admin.password)) {
        req.session.admin = admin;
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Invalid credentials' });
      }
    }
  });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/admin/products', (req, res) => {
  db.all('SELECT p.*, b.name as brand_name, c.name as category_name FROM products p LEFT JOIN brands b ON p.brand_id = b.id LEFT JOIN categories c ON p.category_id = c.id', 
    [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/admin/products', (req, res) => {
  const { name, brand_id, category_id, description, original_price, sale_price, discount, image, sizes, stock, gender, featured, new_arrival } = req.body;
  db.run('INSERT INTO products (name, brand_id, category_id, description, original_price, sale_price, discount, image, sizes, stock, gender, featured, new_arrival) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, brand_id, category_id, description, original_price, sale_price, discount, image, JSON.stringify(sizes), stock, gender, featured, new_arrival], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true, productId: this.lastID });
    }
  });
});

app.put('/api/admin/products/:id', (req, res) => {
  const { name, brand_id, category_id, description, original_price, sale_price, discount, image, sizes, stock, gender, featured, new_arrival } = req.body;
  db.run('UPDATE products SET name = ?, brand_id = ?, category_id = ?, description = ?, original_price = ?, sale_price = ?, discount = ?, image = ?, sizes = ?, stock = ?, gender = ?, featured = ?, new_arrival = ? WHERE id = ?',
    [name, brand_id, category_id, description, original_price, sale_price, discount, image, JSON.stringify(sizes), stock, gender, featured, new_arrival, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

app.delete('/api/admin/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/api/admin/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      rows.forEach(row => {
        row.items = JSON.parse(row.items);
      });
      res.json(rows);
    }
  });
});

app.put('/api/admin/orders/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// SEO files
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://theoutrage.com/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://theoutrage.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://theoutrage.com/men</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://theoutrage.com/women</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://theoutrage.com/junior</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://theoutrage.com/brands</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://theoutrage.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`);
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Middleware to parse large JSON (since merchants upload base64 images of products)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Helper to load/save JSON database
function getDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const defaultState = {
        products: [],
        orders: [],
        customers: [],
        merchants: [],
        affiliates: [],
        visits: { total: 0, daily: {} }
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2));
      return defaultState;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (!parsed.affiliates) {
      parsed.affiliates = [];
    }
    if (!parsed.visits) {
      parsed.visits = { total: 0, daily: {} };
    }
    if (!parsed.productViews) {
      parsed.productViews = {};
    }
    return parsed;
  } catch (error) {
    console.error("Error reading database file:", error);
    return {
      products: [],
      orders: [],
      customers: [],
      merchants: [],
      affiliates: [],
      visits: { total: 0, daily: {} }
    };
  }
}

function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// ==================== API ROUTES ====================

// Test API Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// 1. Fetch All Unified Products (Default products + Merchant-uploaded products)
app.get("/api/products", (req, res) => {
  const db = getDB();
  res.json({ success: true, products: db.products || [] });
});

// 2. Add New Merchant Product
app.post("/api/products/add", (req, res) => {
  try {
    const { product } = req.body;
    if (!product || !product.title || !product.price) {
      res.status(400).json({ success: false, message: "Invalid product parameters." });
      return;
    }

    const db = getDB();
    const newProduct = {
      ...product,
      id: product.id || `merchant-prod-${Date.now()}`,
      rating: parseFloat(product.rating) || 5.0,
      reviewsCount: parseInt(product.reviewsCount) || 0,
      inStock: product.inStock !== false
    };

    db.products = [newProduct, ...(db.products || [])];
    saveDB(db);

    res.json({ success: true, product: newProduct });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Update Existing Product (Admin/Merchant owner)
app.post("/api/products/update", (req, res) => {
  try {
    const { product } = req.body;
    if (!product || !product.id) {
      res.status(400).json({ success: false, message: "Missing product ID." });
      return;
    }

    const db = getDB();
    db.products = (db.products || []).map((p: any) => p.id === product.id ? { ...p, ...product } : p);
    saveDB(db);

    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Delete Product (Merchant owner)
app.post("/api/products/delete", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ success: false, message: "Missing product ID." });
      return;
    }

    const db = getDB();
    db.products = (db.products || []).filter((p: any) => p.id !== id);
    saveDB(db);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4.1. Increment product view counter and get current total
app.post("/api/products/view", (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: "Missing product ID." });
      return;
    }

    const db = getDB();
    if (!db.productViews) {
      db.productViews = {};
    }

    const getBaseline = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash % 150) + 45;
    };

    if (db.productViews[productId] === undefined) {
      db.productViews[productId] = getBaseline(productId);
    } else {
      db.productViews[productId] += 1;
    }

    saveDB(db);

    res.json({ success: true, views: db.productViews[productId] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4.5. Universal Product Sync (Sync products state from Admin Panel)
app.post("/api/admin/products/sync", (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      res.status(400).json({ success: false, message: "Invalid products array." });
      return;
    }
    const db = getDB();
    db.products = products;
    saveDB(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Customer - Register
app.post("/api/customers/register", (req, res) => {
  try {
    const { name, phone, password, avatar } = req.body;
    if (!name || !phone || !password) {
      res.status(400).json({ success: false, message: "সব তথ্য প্রদান করুন।" });
      return;
    }

    const db = getDB();
    const cleanPhone = phone.trim().replace(/\s+/g, "");

    // Validate 11-digit mobile number
    if (!cleanPhone.match(/^[0-9]{11}$/)) {
      res.status(400).json({ success: false, message: "দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।" });
      return;
    }

    // Duplicate check
    const duplicate = (db.customers || []).find((c: any) => c.phone === cleanPhone);
    if (duplicate) {
      res.status(400).json({ success: false, message: "এই মোবাইল নম্বর দিয়ে ইতিমধ্যে গ্রাহক অ্যাকাউন্ট তৈরি করা হয়েছে।" });
      return;
    }

    // Password uniqueness check
    const isPasswordUsed =
      (db.customers || []).some((c: any) => c.password === password) ||
      (db.merchants || []).some((m: any) => m.password === password) ||
      ((db.affiliates || [])).some((a: any) => a.password === password);

    if (isPasswordUsed) {
      res.status(400).json({ success: false, message: "নিরাপত্তার স্বার্থে এই পাসওয়ার্ডটি ইতিমধ্যে আরেকটি অ্যাকাউন্টে ব্যবহার করা হয়েছে। অনুগ্রহ করে অন্য পাসওয়ার্ড দিন।" });
      return;
    }

    const newUser = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone,
      password: password,
      avatar: avatar || ""
    };

    db.customers = [newUser, ...(db.customers || [])];
    saveDB(db);

    res.json({ success: true, user: { name: newUser.name, phone: newUser.phone, avatar: newUser.avatar } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Customer - Login
app.post("/api/customers/login", (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      res.status(400).json({ success: false, message: "ফোন ও পাসওয়ার্ড আবশ্যক।" });
      return;
    }

    const db = getDB();
    const cleanPhone = phone.trim().replace(/\s+/g, "");

    const foundUser = (db.customers || []).find((c: any) => c.phone === cleanPhone && c.password === password);
    if (!foundUser) {
      res.status(400).json({ success: false, message: "ভুল ফোন নম্বর অথবা পাসওয়ার্ড প্রদান করেছেন!" });
      return;
    }

    // Get orders placed by this customer phone across sessions
    const customerOrders = (db.orders || []).filter((o: any) => o.phone.trim().replace(/\s+/g, "") === cleanPhone);

    res.json({
      success: true,
      user: {
        name: foundUser.name,
        phone: foundUser.phone,
        avatar: foundUser.avatar || ""
      },
      orders: customerOrders
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Merchant - Register (Daraz style vendor signup)
app.post("/api/merchants/register", (req, res) => {
  try {
    const { name, shopName, phone, password, address, avatar } = req.body;
    if (!name || !shopName || !phone || !password) {
      res.status(400).json({ success: false, message: "সব তথ্য প্রদান করা আবশ্যক।" });
      return;
    }

    const db = getDB();
    const cleanPhone = phone.trim().replace(/\s+/g, "");

    // Validate 11-digit mobile number
    if (!cleanPhone.match(/^[0-9]{11}$/)) {
      res.status(400).json({ success: false, message: "দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।" });
      return;
    }

    // Duplicate check
    const duplicate = (db.merchants || []).find((m: any) => m.phone === cleanPhone);
    if (duplicate) {
      res.status(400).json({ success: false, message: "এই মোবাইল নম্বর দিয়ে ইতিমধ্যে বিক্রেতা/মার্চেন্ট অ্যাকাউন্ট তৈরি করা হয়েছে।" });
      return;
    }

    // Password uniqueness check
    const isPasswordUsed =
      (db.customers || []).some((c: any) => c.password === password) ||
      (db.merchants || []).some((m: any) => m.password === password) ||
      ((db.affiliates || [])).some((a: any) => a.password === password);

    if (isPasswordUsed) {
      res.status(400).json({ success: false, message: "নিরাপত্তার স্বার্থে এই পাসওয়ার্ডটি ইতিমধ্যে আরেকটি অ্যাকাউন্টে ব্যবহার করা হয়েছে। অনুগ্রহ করে অন্য পাসওয়ার্ড দিন।" });
      return;
    }

    const newMerchant = {
      id: `merchant-${Date.now()}`,
      name: name.trim(),
      shopName: shopName.trim(),
      phone: cleanPhone,
      password: password,
      address: address || "",
      avatar: avatar || ""
    };

    db.merchants = [newMerchant, ...(db.merchants || [])];
    saveDB(db);

    res.json({
      success: true,
      merchant: {
        name: newMerchant.name,
        shopName: newMerchant.shopName,
        phone: newMerchant.phone,
        avatar: newMerchant.avatar,
        address: newMerchant.address
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Merchant - Login
app.post("/api/merchants/login", (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      res.status(400).json({ success: false, message: "ফোন ও পাসওয়ার্ড আবশ্যক।" });
      return;
    }

    const db = getDB();
    const cleanPhone = phone.trim().replace(/\s+/g, "");

    const foundMerchant = (db.merchants || []).find((m: any) => m.phone === cleanPhone && m.password === password);
    if (!foundMerchant) {
      res.status(400).json({ success: false, message: "ভুল মার্চেন্ট ফোন নম্বর অথবা পাসওয়ার্ড!" });
      return;
    }

    // Filter products and orders corresponding to this merchant
    const merchantProducts = (db.products || []).filter((p: any) => p.merchantPhone === cleanPhone);

    res.json({
      success: true,
      merchant: {
        name: foundMerchant.name,
        shopName: foundMerchant.shopName,
        phone: foundMerchant.phone,
        avatar: foundMerchant.avatar || "",
        address: foundMerchant.address || ""
      },
      products: merchantProducts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Sync/Fetch Global Orders (useful for real-time order tracking)
app.get("/api/orders", (req, res) => {
  const db = getDB();
  res.json({ success: true, orders: db.orders || [] });
});

// 10. Add/Sync places order
app.post("/api/orders/add", (req, res) => {
  try {
    const { order } = req.body;
    if (!order || !order.customerName || !order.phone) {
      res.status(400).json({ success: false, message: "Invalid order payload." });
      return;
    }

    const db = getDB();
    const newOrder = {
      ...order,
      id: order.id || `ord-${Date.now()}`,
      timestamp: order.timestamp || new Date().toISOString()
    };

    db.orders = [newOrder, ...(db.orders || [])];

    // Credit affiliate if ordered through an affiliate link
    if (order.affiliatePhone) {
      if (!db.affiliates) db.affiliates = [];
      const affIdx = db.affiliates.findIndex((a: any) => a.phone === order.affiliatePhone);
      if (affIdx !== -1) {
        // Calculate total affiliate earning from items
        let addedEarning = 0;
        (order.cartItems || []).forEach((item: any) => {
          const prodObj = (db.products || []).find((p: any) => String(p.id) === String(item.productId));
          if (prodObj) {
            // Priority 1: Direct ৳ amount
            if (prodObj.affiliateCommission !== undefined && prodObj.affiliateCommission >= 0) {
              addedEarning += item.quantity * prodObj.affiliateCommission;
            } else {
              // Priority 2: Percentage commission
              const commissionRate = prodObj.affCommission > 0 ? (prodObj.affCommission / 100) : 0.08;
              addedEarning += (item.price * item.quantity) * commissionRate;
            }
          } else {
            // Default 8% fallback
            addedEarning += (item.price * item.quantity) * 0.08;
          }
        });
        db.affiliates[affIdx].earnings = (db.affiliates[affIdx].earnings || 0) + Math.round(addedEarning);
        db.affiliates[affIdx].salesCount = (db.affiliates[affIdx].salesCount || 0) + 1;
      }
    }

    saveDB(db);

    res.json({ success: true, order: newOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10b. Admin Orders Sync
app.post("/api/admin/orders/sync", (req, res) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      res.status(400).json({ success: false, message: "Invalid orders array." });
      return;
    }
    const db = getDB();
    db.orders = orders;
    saveDB(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10a. Affiliate - Register
app.post("/api/affiliates/register", (req, res) => {
  try {
    const { name, phone, password, avatar } = req.body;
    if (!name || !phone || !password) {
      res.status(400).json({ success: false, message: "সব তথ্য প্রদান করুন।" });
      return;
    }

    const db = getDB();
    const cleanPhone = phone.trim().replace(/\s+/g, "");

    // Validate 11-digit mobile number
    if (!cleanPhone.match(/^[0-9]{11}$/)) {
      res.status(400).json({ success: false, message: "দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।" });
      return;
    }

    if (!db.affiliates) db.affiliates = [];
    const duplicate = db.affiliates.find((c: any) => c.phone === cleanPhone);
    if (duplicate) {
      res.status(400).json({ success: false, message: "এই মোবাইল নম্বর দিয়ে ইতিমধ্যে এফিলিয়েট অ্যাকাউন্ট তৈরি করা হয়েছে।" });
      return;
    }

    // Password uniqueness check
    const isPasswordUsed =
      (db.customers || []).some((c: any) => c.password === password) ||
      (db.merchants || []).some((m: any) => m.password === password) ||
      ((db.affiliates || [])).some((a: any) => a.password === password);

    if (isPasswordUsed) {
      res.status(400).json({ success: false, message: "নিরাপত্তার স্বার্থে এই পাসওয়ার্ডটি ইতিমধ্যে আরেকটি অ্যাকাউন্টে ব্যবহার করা হয়েছে। অনুগ্রহ করে অন্য পাসওয়ার্ড দিন।" });
      return;
    }

    const newUser = {
      id: `aff-${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone,
      password: password,
      avatar: avatar || "",
      earnings: 0,
      clicks: 0,
      salesCount: 0
    };

    db.affiliates.unshift(newUser);
    saveDB(db);

    res.json({
      success: true,
      affiliate: {
        name: newUser.name,
        phone: newUser.phone,
        avatar: newUser.avatar,
        earnings: newUser.earnings,
        clicks: newUser.clicks,
        salesCount: newUser.salesCount
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10b. Affiliate - Login
app.post("/api/affiliates/login", (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      res.status(400).json({ success: false, message: "ফোন ও পাসওয়ার্ড আবশ্যক।" });
      return;
    }

    const db = getDB();
    const cleanPhone = phone.trim().replace(/\s+/g, "");

    if (!db.affiliates) db.affiliates = [];
    const foundAff = db.affiliates.find((a: any) => a.phone === cleanPhone && a.password === password);
    if (!foundAff) {
      res.status(400).json({ success: false, message: "ভুল ফোন নম্বর অথবা পাসওয়ার্ড প্রদান করেছেন!" });
      return;
    }

    res.json({
      success: true,
      affiliate: {
        name: foundAff.name,
        phone: foundAff.phone,
        avatar: foundAff.avatar || "",
        earnings: foundAff.earnings || 0,
        clicks: foundAff.clicks || 0,
        salesCount: foundAff.salesCount || 0
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10c. Affiliate - Track Click
app.post("/api/affiliates/track-click", (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ success: false });
      return;
    }
    const db = getDB();
    if (!db.affiliates) db.affiliates = [];
    const affIdx = db.affiliates.findIndex((a: any) => a.phone === phone);
    if (affIdx !== -1) {
      db.affiliates[affIdx].clicks = (db.affiliates[affIdx].clicks || 0) + 1;
      saveDB(db);
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// 10d. Customer - Update Avatar
app.post("/api/customers/update-avatar", (req, res) => {
  try {
    const { phone, avatar } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: "ফোন নম্বর আবশ্যক।" });
      return;
    }
    const db = getDB();
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!db.customers) db.customers = [];
    const customer = db.customers.find((c: any) => c.phone === cleanPhone);
    if (!customer) {
      res.status(404).json({ success: false, message: "গ্রাহক খুঁজে পাওয়া যায়নি।" });
      return;
    }
    customer.avatar = avatar || "";
    saveDB(db);
    res.json({ success: true, avatar: customer.avatar });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10e. Merchant - Update Avatar
app.post("/api/merchants/update-avatar", (req, res) => {
  try {
    const { phone, avatar } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: "ফোন নম্বর আবশ্যক।" });
      return;
    }
    const db = getDB();
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!db.merchants) db.merchants = [];
    const merchant = db.merchants.find((m: any) => m.phone === cleanPhone);
    if (!merchant) {
      res.status(404).json({ success: false, message: "মার্চেন্ট খুঁজে পাওয়া যায়নি।" });
      return;
    }
    merchant.avatar = avatar || "";
    saveDB(db);
    res.json({ success: true, avatar: merchant.avatar });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10f. Affiliate - Update Avatar
app.post("/api/affiliates/update-avatar", (req, res) => {
  try {
    const { phone, avatar } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: "ফোন নম্বর আবশ্যক।" });
      return;
    }
    const db = getDB();
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!db.affiliates) db.affiliates = [];
    const affiliate = db.affiliates.find((a: any) => a.phone === cleanPhone);
    if (!affiliate) {
      res.status(404).json({ success: false, message: "এফিলিয়েট খুঁজে পাওয়া যায়নি।" });
      return;
    }
    affiliate.avatar = avatar || "";
    saveDB(db);
    res.json({ success: true, avatar: affiliate.avatar });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

// Image Visual Search API Route
app.post("/api/search-by-image", async (req, res) => {
  try {
    const { image, catalogProducts } = req.body;
    if (!image) {
      res.status(400).json({ success: false, message: "কোনো ইমেজ ফাইল পাওয়া যায়নি! Please provide a valid product image." });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Robust fallback if no server secret key is injected
      res.json({
        success: true,
        detectedObject: "e-commerce product (Key missing fallback)",
        keywords: ["shirt", "watch", "shoe", "dress"]
      });
      return;
    }

    let mimeType = "image/jpeg";
    let base64Data = image;

    if (image.includes(";base64,")) {
      const parts = image.split(";base64,");
      mimeType = parts[0].replace("data:", "");
      base64Data = parts[1];
    }

    let catalogInstructions = "";
    if (catalogProducts && Array.isArray(catalogProducts) && catalogProducts.length > 0) {
      const simplifiedCatalog = catalogProducts.map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description ? p.description.substring(0, 80) + "..." : ""
      }));
      catalogInstructions = `\nCompare the uploaded image to this catalog list of items: \n${JSON.stringify(simplifiedCatalog)}\nDetermine if the image represents or closely matches one of these products. If there is a high-confidence match from our catalog, the VERY first keyword in the 'keywords' array MUST be the EXACT title of that matching product, and 'detectedObject' should be that product title, so a exact title text search can locate it immediately. If there is no specific product found, fallback to accurate generic categories.`;
    }

    const systemPrompt = `Analyze this product image. Your task is to identify the main customer object shown (e.g. 'watch', 'shirt', 'appliances', 'jewelry'). ${catalogInstructions} Return a JSON object with: 1. 'detectedObject': simple name in English or the exact title of the matched product. 2. 'keywords': an array of 4-6 specific search terms in both English and Bengali (e.g. ['watch', 'ঘড়ি', 'luxury', 'fittings']) to match existing products in the catalog.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        systemPrompt
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedObject: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["detectedObject", "keywords"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText.trim());

    res.json({
      success: true,
      detectedObject: data.detectedObject || "Product",
      keywords: data.keywords || []
    });
  } catch (err: any) {
    console.error("Visual Search processing error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to analyze image" });
  }
});

// ==================== VISITOR ANALYTICS ENDPOINTS ====================
app.post("/api/visit", (req, res) => {
  try {
    const db = getDB();
    if (!db.visits) {
      db.visits = { total: 0, daily: {} };
    }
    
    // Increment total count
    db.visits.total = (db.visits.total || 0) + 1;
    
    // Bangladesh local date (GMT+6)
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const bdTime = new Date(utc + (3600000 * 6));
    const bdDateStr = bdTime.toISOString().split("T")[0]; // YYYY-MM-DD
    
    if (!db.visits.daily) {
      db.visits.daily = {};
    }
    db.visits.daily[bdDateStr] = (db.visits.daily[bdDateStr] || 0) + 1;
    
    saveDB(db);
    res.json({ success: true, total: db.visits.total, today: db.visits.daily[bdDateStr] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/visits/stats", (req, res) => {
  try {
    const db = getDB();
    res.json({ success: true, stats: db.visits || { total: 0, daily: {} } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/admin/accounts", (req, res) => {
  try {
    const db = getDB();
    res.json({
      success: true,
      customers: db.customers || [],
      merchants: db.merchants || [],
      affiliates: db.affiliates || []
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ====================================================

// ==================== SEO ROUTING ====================

// 1. Robots.txt Configuration
app.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "zshopbd.com";
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header("Content-Type", "text/plain");
  res.status(200).send(robots);
});

// 2. Dynamic XML Sitemap Generator
app.get("/sitemap.xml", (req, res) => {
  const host = req.headers.host || "zshopbd.com";
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const db = getDB();
  const products = db.products || [];
  const currentDate = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Add Product detail dynamic URLs for search indexing
  products.forEach((prod: any) => {
    const prodUrl = `${baseUrl}/?product=${prod.id}`;
    // Clean strings of special characters to prevent xml parsing issues
    const titleSafe = prod.title
      ? prod.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
      : "";

    xml += `
  <url>
    <loc>${prodUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
    ${prod.image ? `
    <image:image>
      <image:loc>${prod.image}</image:loc>
      <image:title>${titleSafe}</image:title>
    </image:image>` : ""}
  </url>`;
  });

  xml += `\n</urlset>`;

  res.header("Content-Type", "application/xml");
  res.status(200).send(xml);
});

// ====================================================

// Vite Middleware integrating or Production static folder setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

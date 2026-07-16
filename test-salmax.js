/**
 * Salmax backend - automated end-to-end test script.
 *
 * Runs the exact same test flow that was in the Postman collection, but
 * needs nothing except Node itself (uses the built-in fetch, Node 18+).
 *
 * Usage:
 *   node test-salmax.js
 *
 * Optional:
 *   BASE_URL=http://localhost:4000 node test-salmax.js   (if not port 3500)
 *   node test-salmax.js /path/to/image.jpg               (to also test image upload)
 */

const readline = require("readline");

const BASE_URL = process.env.BASE_URL || "http://localhost:3500";
const IMAGE_PATH = process.argv[2] || null;

let passed = 0;
let failed = 0;

function check(label, condition, extra = "") {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
    passed++;
  } else {
    console.log(`  \x1b[31m✗ ${label}\x1b[0m ${extra}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

async function req(method, path, { body, token, isForm } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some endpoints (204, plain text) won't return JSON
  }
  return { status: res.status, data };
}

function pause(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(`\n${message}\nPress Enter once done...`, () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  console.log(`Testing Salmax backend at ${BASE_URL}\n`);

  // Unique-ish suffix so re-running the script doesn't collide with
  // "already exists" errors from a previous run.
  const suffix = Date.now().toString().slice(-5);
  const adminUsername = `salmaxadmin${suffix}`;
  const adminEmail = `admin${suffix}@salmax.co.ke`;

  // ---------- 1. AUTH ----------
  section("1. Auth");

  const register = await req("POST", "/auth/register", {
    body: {
      username: adminUsername,
      email: adminEmail,
      password: "TestPass123!",
    },
  });
  check(
    "Register user -> 201",
    register.status === 201,
    `(got ${register.status})`,
  );

  await pause(
    `Go to MongoDB Atlas -> users collection -> find "${adminUsername}" -> edit roles to:\n` +
      `  { "User": 2001, "Admin": 5150 }`,
  );

  const login = await req("POST", "/auth/login", {
    body: { username: adminUsername, password: "TestPass123!" },
  });
  check("Login -> 200", login.status === 200, `(got ${login.status})`);
  const token = login.data?.accessToken;
  check("Login returns accessToken", Boolean(token));

  if (!token) {
    console.log(
      "\nNo access token - can't continue without Admin auth. Stopping here.",
    );
    console.log(`Passed: ${passed}  Failed: ${failed}`);
    return;
  }

  // ---------- 2. CATEGORIES ----------
  section("2. Categories");

  let categoryIdMenShoes;

  const catMen = await req("POST", "/categories", {
    token,
    body: {
      name: "Official",
      productType: "Shoes",
      group: "Men",
    },
  });

  if (catMen.status === 201) {
    categoryIdMenShoes = catMen.data?.category?._id;

    check("Create category (Men Shoes/Official) -> 201", true);
  } else if (catMen.status === 409) {
    const existingCats = await req(
      "GET",
      "/categories?productType=Shoes&group=Men",
    );

    const existingCategory = existingCats.data?.find(
      (c) =>
        c.name === "Official" && c.productType === "Shoes" && c.group === "Men",
    );

    categoryIdMenShoes = existingCategory?._id;

    check(
      "Category already exists (reusing existing category)",
      Boolean(categoryIdMenShoes),
      `(could not find existing category id)`,
    );
  } else {
    check(
      "Create category (Men Shoes/Official)",
      false,
      `(got ${catMen.status})`,
    );
  }

  if (!categoryIdMenShoes) {
    console.log(
      "\nUnable to obtain category ID. Stopping test because product creation depends on it.",
    );

    console.log(`Passed: ${passed}  Failed: ${failed}`);

    return;
  }

  // ---------- 3. PRODUCTS ----------
  section("3. Products");

  const createProduct = await req("POST", "/products", {
    token,
    body: {
      name: `Classic Oxford Shoe ${suffix}`,
      category: categoryIdMenShoes,
      description: "Handcrafted leather oxford shoe, formal wear.",
      listedPrice: 3500,
      negotiable: true,
      sizes: [
        { size: "42", quantity: 10 },
        { size: "43", quantity: 5 },
      ],
      colors: ["Black", "Brown"],
    },
  });
  if (createProduct.status !== 201) {
    console.log("\nProduct creation response:");
    console.dir(createProduct.data, { depth: null });
  }
  check(
    "Create product -> 201",
    createProduct.status === 201,
    `(got ${createProduct.status})`,
  );
  const productId = createProduct.data?.newProduct?._id;
  if (!productId) {
    console.log(
      "\nProduct creation failed. Skipping stock, order, and sales lifecycle tests.",
    );

    console.log("Product response:");
    console.dir(createProduct.data, { depth: null });

    console.log(`Passed: ${passed}  Failed: ${failed}`);

    return;
  }
  check(
    "totalQuantity virtual = 15",
    createProduct.data?.newProduct?.totalQuantity === 15,
    `(got ${createProduct.data?.newProduct?.totalQuantity})`,
  );

  const badCategoryProduct = await req("POST", "/products", {
    token,
    body: {
      name: "Ghost Product",
      category: "64f000000000000000000000",
      description: "Should fail validation.",
      listedPrice: 1000,
      sizes: [{ size: "M", quantity: 5 }],
    },
  });
  check(
    "Product with invalid category -> 400",
    badCategoryProduct.status === 400,
    `(got ${badCategoryProduct.status})`,
  );

  const lowStock = await req("GET", "/products/low-stock", { token });
  const flaggedSize43 = lowStock.data?.some(
    (p) => p._id === productId && p.lowStockSizes?.some((s) => s.size === "43"),
  );
  check("Size 43 (qty 5) shows up as low stock", flaggedSize43);

  const increase = await req("PATCH", `/products/${productId}/increase-stock`, {
    token,
    body: { size: "43", quantity: 10 },
  });
  const size43After = increase.data?.product?.sizes?.find(
    (s) => s.size === "43",
  );
  check(
    "Increase stock: size 43 now 15",
    size43After?.quantity === 15,
    `(got ${size43After?.quantity})`,
  );

  const reduce = await req("PATCH", `/products/${productId}/reduce-stock`, {
    token,
    body: { size: "42", quantity: 3 },
  });
  const size42After = reduce.data?.product?.sizes?.find((s) => s.size === "42");
  check(
    "Reduce stock: size 42 now 7",
    size42After?.quantity === 7,
    `(got ${size42After?.quantity})`,
  );

  const overReduce = await req("PATCH", `/products/${productId}/reduce-stock`, {
    token,
    body: { size: "42", quantity: 9999 },
  });
  check(
    "Reduce beyond available stock -> 400",
    overReduce.status === 400,
    `(got ${overReduce.status})`,
  );

  if (IMAGE_PATH) {
    try {
      const fs = require("fs");
      const fileBuffer = fs.readFileSync(IMAGE_PATH);
      const form = new FormData();
      form.append(
        "images",
        new Blob([fileBuffer]),
        IMAGE_PATH.split("/").pop(),
      );
      const upload = await req("POST", `/products/${productId}/images`, {
        token,
        body: form,
        isForm: true,
      });
      check(
        "Upload product image -> 200",
        upload.status === 200,
        `(got ${upload.status})`,
      );
    } catch (err) {
      console.log(`  (skipped image upload: ${err.message})`);
    }
  } else {
    console.log(
      "  (skipped image upload - pass an image path as an argument to test this: node test-salmax.js ./photo.jpg)",
    );
  }

  const archive = await req("DELETE", `/products/${productId}`, { token });
  check(
    "Archive product -> 200",
    archive.status === 200,
    `(got ${archive.status})`,
  );

  const publicGetArchived = await req("GET", `/products/${productId}`);
  check(
    "Archived product hidden from public GET -> 404",
    publicGetArchived.status === 404,
    `(got ${publicGetArchived.status})`,
  );

  const restore = await req("PATCH", `/products/${productId}/restore`, {
    token,
  });
  check(
    "Restore product -> 200",
    restore.status === 200,
    `(got ${restore.status})`,
  );

  // ---------- 4. ORDERS ----------
  section("4. Orders (stock lifecycle)");

  const beforeOrder = await req("GET", `/products/${productId}`);
  const size42Before = beforeOrder.data?.sizes?.find(
    (s) => s.size === "42",
  )?.quantity;

  const createOrder = await req("POST", "/orders", {
    token,
    body: {
      customerName: "Jane Wanjiru",
      customerPhone: "0712345678",
      customerLocation: "Nairobi CBD",
      product: productId,
      size: "42",
      quantity: 2,
      agreedPrice: 3300,
      notes: "Negotiated via WhatsApp",
    },
  });
  check(
    "Create order -> 201",
    createOrder.status === 201,
    `(got ${createOrder.status})`,
  );
  const orderId = createOrder.data?.order?._id;

  const badSizeOrder = await req("POST", "/orders", {
    token,
    body: {
      customerName: "Test Case",
      customerPhone: "0712345678",
      product: productId,
      size: "50",
      quantity: 1,
      agreedPrice: 3000,
    },
  });
  check(
    "Order for nonexistent size -> 400",
    badSizeOrder.status === 400,
    `(got ${badSizeOrder.status})`,
  );

  const afterCreateStillSame = await req("GET", `/products/${productId}`);
  const size42AfterCreate = afterCreateStillSame.data?.sizes?.find(
    (s) => s.size === "42",
  )?.quantity;
  check(
    "Stock unchanged right after order creation (not reserved yet)",
    size42AfterCreate === size42Before,
  );

  const confirm = await req("PATCH", `/orders/${orderId}/status`, {
    token,
    body: { status: "Confirmed" },
  });
  check(
    "Pending -> Confirmed -> 200",
    confirm.status === 200,
    `(got ${confirm.status})`,
  );

  const impossibleOrder = await req("POST", "/orders", {
    token,
    body: {
      customerName: "Oversell Test",
      customerPhone: "0700000000",
      product: productId,
      size: "42",
      quantity: 999,
      agreedPrice: 3000,
    },
  });
  check(
    "Order exceeding available stock -> 400",
    impossibleOrder.status === 400,
    `(got ${impossibleOrder.status})`,
  );

  const invalidTransition = await req("PATCH", `/orders/${orderId}/status`, {
    token,
    body: { status: "Delivered" },
  });

  check(
    "Cannot skip Confirmed -> Delivered",
    invalidTransition.status === 400,
    `(got ${invalidTransition.status})`,
  );

  const afterConfirm = await req("GET", `/products/${productId}`);
  const size42AfterConfirm = afterConfirm.data?.sizes?.find(
    (s) => s.size === "42",
  )?.quantity;
  check(
    `Stock reserved on Confirm: size 42 dropped by 2 (${size42Before} -> ${size42AfterConfirm})`,
    size42AfterConfirm === size42Before - 2,
  );

  const ready = await req("PATCH", `/orders/${orderId}/status`, {
    token,
    body: { status: "Ready" },
  });
  check(
    "Confirmed -> Ready -> 200",
    ready.status === 200,
    `(got ${ready.status})`,
  );

  const salesBefore = await req("GET", "/sales", { token });
  const saleCountBefore = salesBefore.data?.length || 0;

  const delivered = await req("PATCH", `/orders/${orderId}/status`, {
    token,
    body: { status: "Delivered" },
  });
  check(
    "Ready -> Delivered -> 200",
    delivered.status === 200,
    `(got ${delivered.status})`,
  );

  const salesAfter = await req("GET", "/sales", { token });
  check(
    "A new Sale record was created on Delivered",
    (salesAfter.data?.length || 0) === saleCountBefore + 1,
  );

  const cancelDelivered = await req("PATCH", `/orders/${orderId}/cancel`, {
    token,
  });
  check(
    "Cancelling a Delivered order -> 400",
    cancelDelivered.status === 400,
    `(got ${cancelDelivered.status})`,
  );

  // Second order to test cancel + stock return
  const beforeOrder2 = await req("GET", `/products/${productId}`);
  const size43Before = beforeOrder2.data?.sizes?.find(
    (s) => s.size === "43",
  )?.quantity;

  const order2 = await req("POST", "/orders", {
    token,
    body: {
      customerName: "Peter Otieno",
      customerPhone: "0798765432",
      product: productId,
      size: "43",
      quantity: 1,
      agreedPrice: 3400,
    },
  });
  const orderId2 = order2.data?.order?._id;

  const confirm2 = await req("PATCH", `/orders/${orderId2}/status`, {
    token,
    body: { status: "Confirmed" },
  });
  const orderStateAfterConfirm2 = await req("GET", `/orders/${orderId2}`, {
    token,
  });
  const afterConfirm2 = await req("GET", `/products/${productId}`);
  const size43AfterConfirm = afterConfirm2.data?.sizes?.find(
    (s) => s.size === "43",
  )?.quantity;
  check(
    "Second order Confirm reserves size 43 stock",
    size43AfterConfirm === size43Before - 1,
    `(confirm PATCH returned ${confirm2.status}: ${JSON.stringify(confirm2.data?.message || confirm2.data)}; ` +
      `order.status is now "${orderStateAfterConfirm2.data?.status}"; ` +
      `size 43 went ${size43Before} -> ${size43AfterConfirm}, full sizes array: ${JSON.stringify(afterConfirm2.data?.sizes)})`,
  );

  const cancel2 = await req("PATCH", `/orders/${orderId2}/cancel`, { token });
  const orderStateAfterCancel2 = await req("GET", `/orders/${orderId2}`, {
    token,
  });
  check(
    "Cancel confirmed order -> 200",
    cancel2.status === 200,
    `(got ${cancel2.status}: ${JSON.stringify(cancel2.data?.message || cancel2.data)}; order.status was "${orderStateAfterConfirm2.data?.status}" going in)`,
  );

  const afterCancel2 = await req("GET", `/products/${productId}`);
  const size43AfterCancel = afterCancel2.data?.sizes?.find(
    (s) => s.size === "43",
  )?.quantity;
  check(
    `Cancel returns reserved stock: size 43 back to ${size43Before} (got ${size43AfterCancel})`,
    size43AfterCancel === size43Before,
    `(order.status after cancel: "${orderStateAfterCancel2.data?.status}", full sizes array: ${JSON.stringify(afterCancel2.data?.sizes)})`,
  );

  // ---------- 5. SALES & ANALYTICS ----------
  section("5. Sales & Analytics");

  const allSales = await req("GET", "/sales", { token });
  check("Get all sales -> 200", allSales.status === 200);

  const topProducts = await req("GET", "/sales/analytics/top-products", {
    token,
  });
  check("Top products -> 200", topProducts.status === 200);

  const revenueTrends = await req("GET", "/sales/analytics/revenue-trends", {
    token,
  });
  check("Revenue trends -> 200", revenueTrends.status === 200);

  const breakdown = await req("GET", "/sales/analytics/sales-breakdown", {
    token,
  });
  const shoesEntry = breakdown.data?.find((b) => b.productType === "Shoes");
  check(
    "Sales breakdown includes Shoes with count >= 1",
    shoesEntry && shoesEntry.count >= 1,
  );

  const customerHistory = await req(
    "GET",
    "/sales/analytics/customer-history?phone=0712345678",
    { token },
  );
  check(
    "Customer history for Jane Wanjiru -> 200",
    customerHistory.status === 200,
    `(got ${customerHistory.status})`,
  );
  check(
    "Customer history totalPurchases >= 1",
    (customerHistory.data?.totalPurchases || 0) >= 1,
  );

  // ---------- 6. LEADS ----------
  section("6. Leads");

  const lead = await req("POST", "/leads", {
    body: {
      customerName: "Grace Mwikali",
      customerPhone: "0722334455",
      source: "WhatsApp",
      product: productId,
      productName: "Classic Oxford Shoe",
    },
  });
  check(
    "Create lead (public, no token) -> 201",
    lead.status === 201,
    `(got ${lead.status})`,
  );

  if (lead.status !== 201) {
    console.log("\nLead creation error:");
    console.dir(lead.data, { depth: null });
  }

  const allLeads = await req("GET", "/leads", { token });
  check(
    "Get all leads (admin) -> 200 and includes new lead",
    allLeads.status === 200 && allLeads.data?.length >= 1,
    `(status ${allLeads.status}, ${Array.isArray(allLeads.data) ? `${allLeads.data.length} lead(s) returned` : JSON.stringify(allLeads.data)})`,
  );

  // ---------- 7. DASHBOARD ----------
  section("7. Dashboard");

  const summary = await req("GET", "/dashboard/summary", { token });
  check("Dashboard summary -> 200", summary.status === 200);
  check("deliveredOrders >= 1", (summary.data?.deliveredOrders || 0) >= 1);
  check("cancelledOrders >= 1", (summary.data?.cancelledOrders || 0) >= 1);

  const revenue = await req("GET", "/dashboard/revenue", { token });
  check(
    "Dashboard revenue -> 200 and totalRevenue > 0",
    revenue.status === 200 && revenue.data?.totalRevenue > 0,
  );

  const leadAnalytics = await req("GET", "/dashboard/leads", { token });
  check("Dashboard lead analytics -> 200", leadAnalytics.status === 200);

  // ---------- SUMMARY ----------
  console.log(`\n\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("\nScript crashed:", err);
  console.error(
    "(Most likely cause: server not running, or BASE_URL/port mismatch)",
  );
  process.exitCode = 1;
});

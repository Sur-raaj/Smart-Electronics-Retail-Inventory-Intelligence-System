/**
 * Mock Data for Owner Dashboard
 * Structured to match Django REST Framework response format.
 * All field names use snake_case. Dates in ISO 8601 format.
 * Currency in INR (₹).
 */

// ──────────────────────────────────────
// 1. Sales Overview KPIs
// ──────────────────────────────────────
export const mockSalesOverview = {
  total_revenue: 8924567.90,
  total_profit: 2677370.37,
  total_items_sold: 12847,
  total_orders: 5432,
  avg_order_value: 1643.07,
  profit_margin: 30.1,
  revenue_change: 12.5,
  profit_change: 8.3,
  total_customers: 3421,
  period_start: '2025-01-15',
  period_end: '2025-02-15',
};

// ──────────────────────────────────────
// 2. Revenue Trend (30 days)
// ──────────────────────────────────────
const generateTrend = () => {
  const data = [];
  const base = new Date('2025-01-15');
  for (let i = 0; i < 30; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const revenue = Math.round((250000 + Math.random() * 150000) * 100) / 100;
    data.push({
      period: d.toISOString().split('T')[0],
      revenue,
      profit: Math.round(revenue * (0.25 + Math.random() * 0.1) * 100) / 100,
      order_count: Math.floor(150 + Math.random() * 100),
      items_sold: Math.floor(300 + Math.random() * 200),
    });
  }
  return data;
};

export const mockRevenueTrend = generateTrend();

// ──────────────────────────────────────
// 3. Top 10 Products
// ──────────────────────────────────────
export const mockTopProducts = [
  { rank: 1, product_id: 101, name: 'iPhone 15 Pro Max', brand: 'Apple', category: 'Smartphones', total_quantity_sold: 1247, total_revenue: 1870500, total_profit: 561150, profit_margin: 30.0 },
  { rank: 2, product_id: 102, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Smartphones', total_quantity_sold: 986, total_revenue: 1282800, total_profit: 359184, profit_margin: 28.0 },
  { rank: 3, product_id: 103, name: 'MacBook Pro 16"', brand: 'Apple', category: 'Laptops', total_quantity_sold: 534, total_revenue: 1335000, total_profit: 400500, profit_margin: 30.0 },
  { rank: 4, product_id: 104, name: 'Dell XPS 15', brand: 'Dell', category: 'Laptops', total_quantity_sold: 420, total_revenue: 756000, total_profit: 189000, profit_margin: 25.0 },
  { rank: 5, product_id: 105, name: 'iPad Pro 12.9"', brand: 'Apple', category: 'Tablets', total_quantity_sold: 678, total_revenue: 881400, total_profit: 264420, profit_margin: 30.0 },
  { rank: 6, product_id: 106, name: 'Sony WH-1000XM5', brand: 'Sony', category: 'Headphones', total_quantity_sold: 1532, total_revenue: 459600, total_profit: 137880, profit_margin: 30.0 },
  { rank: 7, product_id: 107, name: 'Apple Watch Ultra 2', brand: 'Apple', category: 'Smart Watches', total_quantity_sold: 892, total_revenue: 713600, total_profit: 178400, profit_margin: 25.0 },
  { rank: 8, product_id: 108, name: 'Canon EOS R6 Mark II', brand: 'Canon', category: 'Cameras', total_quantity_sold: 234, total_revenue: 585000, total_profit: 146250, profit_margin: 25.0 },
  { rank: 9, product_id: 109, name: 'Samsung Galaxy Tab S9', brand: 'Samsung', category: 'Tablets', total_quantity_sold: 567, total_revenue: 453600, total_profit: 113400, profit_margin: 25.0 },
  { rank: 10, product_id: 110, name: 'DJI Mini 4 Pro', brand: 'DJI', category: 'Drones', total_quantity_sold: 312, total_revenue: 312000, total_profit: 78000, profit_margin: 25.0 },
];

// ──────────────────────────────────────
// 4. Category Performance
// ──────────────────────────────────────
export const mockCategoryPerformance = [
  { category_id: 1, category_name: 'Smartphones', product_count: 45, total_revenue: 3153300, percentage: 35.3 },
  { category_id: 2, category_name: 'Laptops', product_count: 32, total_revenue: 2091000, percentage: 23.4 },
  { category_id: 3, category_name: 'Tablets', product_count: 18, total_revenue: 1335000, percentage: 15.0 },
  { category_id: 4, category_name: 'Smart Watches', product_count: 15, total_revenue: 713600, percentage: 8.0 },
  { category_id: 5, category_name: 'Headphones', product_count: 28, total_revenue: 459600, percentage: 5.2 },
  { category_id: 6, category_name: 'Cameras', product_count: 12, total_revenue: 585000, percentage: 6.6 },
  { category_id: 7, category_name: 'Drones', product_count: 8, total_revenue: 312000, percentage: 3.5 },
  { category_id: 8, category_name: 'Gaming', product_count: 10, total_revenue: 275068, percentage: 3.0 },
];

// ──────────────────────────────────────
// 5. Products List (for Product Management)
// ──────────────────────────────────────
export const mockProducts = [
  { product_id: 1, name: 'iPhone 15 Pro Max', category_name: 'Smartphones', brand: 'Apple', cost_price: 104999, selling_price: 149999, stock_quantity: 45, reorder_level: 10, status: 'Active', image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100' },
  { product_id: 2, name: 'Samsung Galaxy S24 Ultra', category_name: 'Smartphones', brand: 'Samsung', cost_price: 89999, selling_price: 129999, stock_quantity: 32, reorder_level: 10, status: 'Active', image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100' },
  { product_id: 3, name: 'MacBook Pro 16"', category_name: 'Laptops', brand: 'Apple', cost_price: 174999, selling_price: 249900, stock_quantity: 18, reorder_level: 5, status: 'Active', image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100' },
  { product_id: 4, name: 'Dell XPS 15', category_name: 'Laptops', brand: 'Dell', cost_price: 124999, selling_price: 179999, stock_quantity: 22, reorder_level: 5, status: 'Active', image_url: null },
  { product_id: 5, name: 'iPad Pro 12.9"', category_name: 'Tablets', brand: 'Apple', cost_price: 89999, selling_price: 129999, stock_quantity: 28, reorder_level: 8, status: 'Active', image_url: null },
  { product_id: 6, name: 'Sony WH-1000XM5', category_name: 'Headphones', brand: 'Sony', cost_price: 19999, selling_price: 29999, stock_quantity: 67, reorder_level: 15, status: 'Active', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100' },
  { product_id: 7, name: 'Apple Watch Ultra 2', category_name: 'Smart Watches', brand: 'Apple', cost_price: 59999, selling_price: 89999, stock_quantity: 35, reorder_level: 10, status: 'Active', image_url: null },
  { product_id: 8, name: 'Canon EOS R6 Mark II', category_name: 'Cameras', brand: 'Canon', cost_price: 174999, selling_price: 249999, stock_quantity: 8, reorder_level: 5, status: 'Active', image_url: null },
  { product_id: 9, name: 'Samsung Galaxy Tab S9', category_name: 'Tablets', brand: 'Samsung', cost_price: 55999, selling_price: 79999, stock_quantity: 41, reorder_level: 10, status: 'Active', image_url: null },
  { product_id: 10, name: 'DJI Mini 4 Pro', category_name: 'Drones', brand: 'DJI', cost_price: 69999, selling_price: 99999, stock_quantity: 15, reorder_level: 5, status: 'Active', image_url: null },
  { product_id: 11, name: 'AirPods Pro 2', category_name: 'Headphones', brand: 'Apple', cost_price: 17499, selling_price: 24999, stock_quantity: 0, reorder_level: 20, status: 'Out of Stock', image_url: null },
  { product_id: 12, name: 'PS5 Slim', category_name: 'Gaming', brand: 'Sony', cost_price: 39999, selling_price: 54999, stock_quantity: 12, reorder_level: 8, status: 'Active', image_url: null },
  { product_id: 13, name: 'Nintendo Switch OLED', category_name: 'Gaming', brand: 'Nintendo', cost_price: 24999, selling_price: 34999, stock_quantity: 0, reorder_level: 10, status: 'Out of Stock', image_url: null },
  { product_id: 14, name: 'Google Pixel 8 Pro', category_name: 'Smartphones', brand: 'Google', cost_price: 69999, selling_price: 99999, stock_quantity: 25, reorder_level: 8, status: 'Active', image_url: null },
  { product_id: 15, name: 'Bose QuietComfort Ultra', category_name: 'Headphones', brand: 'Bose', cost_price: 24999, selling_price: 34999, stock_quantity: 48, reorder_level: 12, status: 'Active', image_url: null },
  { product_id: 16, name: 'LG C4 OLED 55"', category_name: 'Display', brand: 'LG', cost_price: 89999, selling_price: 134999, stock_quantity: 6, reorder_level: 3, status: 'Active', image_url: null },
  { product_id: 17, name: 'Lenovo ThinkPad X1 Carbon', category_name: 'Laptops', brand: 'Lenovo', cost_price: 119999, selling_price: 169999, stock_quantity: 14, reorder_level: 5, status: 'Active', image_url: null },
  { product_id: 18, name: 'OnePlus 12', category_name: 'Smartphones', brand: 'OnePlus', cost_price: 44999, selling_price: 64999, stock_quantity: 38, reorder_level: 10, status: 'Active', image_url: null },
  { product_id: 19, name: 'JBL Charge 5', category_name: 'Speakers', brand: 'JBL', cost_price: 11999, selling_price: 17999, stock_quantity: 52, reorder_level: 15, status: 'Active', image_url: null },
  { product_id: 20, name: 'GoPro Hero 12', category_name: 'Cameras', brand: 'GoPro', cost_price: 29999, selling_price: 44999, stock_quantity: 19, reorder_level: 8, status: 'Active', image_url: null },
];

// ──────────────────────────────────────
// 6. Orders List
// ──────────────────────────────────────
export const mockOrders = [
  { order_id: 1001, user_name: 'Rahul Sharma', user_email: 'rahul@example.com', user_phone: '+977 9812345678', order_date: '2025-02-14T14:30:00Z', items_count: 2, total_amount: 179998, tax_amount: 17999, shipping_cost: 0, discount_amount: 5000, grand_total: 192997, status: 'Delivered', payment_method: 'Credit Card', payment_status: 'Completed', tracking_number: 'TRK123456789', shipping_address: 'Sankhamul, Kathmandu' },
  { order_id: 1002, user_name: 'Priya Patel', user_email: 'priya@example.com', user_phone: '+977 9823456789', order_date: '2025-02-13T11:20:00Z', items_count: 1, total_amount: 249900, tax_amount: 24990, shipping_cost: 0, discount_amount: 0, grand_total: 274890, status: 'Shipped', payment_method: 'UPI', payment_status: 'Completed', tracking_number: 'TRK987654321', shipping_address: 'Patan, Lalitpur' },
  { order_id: 1003, user_name: 'Arun Kumar', user_email: 'arun@example.com', user_phone: '+977 9834567890', order_date: '2025-02-12T09:45:00Z', items_count: 3, total_amount: 94997, tax_amount: 9499, shipping_cost: 500, discount_amount: 2000, grand_total: 102996, status: 'Processing', payment_method: 'Debit Card', payment_status: 'Completed', tracking_number: null, shipping_address: 'Bhaktapur' },
  { order_id: 1004, user_name: 'Sneha Thapa', user_email: 'sneha@example.com', user_phone: '+977 9845678901', order_date: '2025-02-11T16:15:00Z', items_count: 1, total_amount: 149999, tax_amount: 14999, shipping_cost: 0, discount_amount: 10000, grand_total: 154998, status: 'Pending', payment_method: 'Cash on Delivery', payment_status: 'Pending', tracking_number: null, shipping_address: 'Pokhara, Kaski' },
  { order_id: 1005, user_name: 'Bikash Rai', user_email: 'bikash@example.com', user_phone: '+977 9856789012', order_date: '2025-02-10T08:00:00Z', items_count: 2, total_amount: 64998, tax_amount: 6499, shipping_cost: 0, discount_amount: 0, grand_total: 71497, status: 'Delivered', payment_method: 'Credit Card', payment_status: 'Completed', tracking_number: 'TRK456789123', shipping_address: 'Biratnagar, Morang' },
  { order_id: 1006, user_name: 'Anita Gurung', user_email: 'anita@example.com', user_phone: '+977 9867890123', order_date: '2025-02-09T13:30:00Z', items_count: 1, total_amount: 89999, tax_amount: 8999, shipping_cost: 0, discount_amount: 5000, grand_total: 93998, status: 'Cancelled', payment_method: 'UPI', payment_status: 'Refunded', tracking_number: null, shipping_address: 'Chitwan' },
  { order_id: 1007, user_name: 'Sagar Shrestha', user_email: 'sagar@example.com', user_phone: '+977 9878901234', order_date: '2025-02-08T10:45:00Z', items_count: 4, total_amount: 112996, tax_amount: 11299, shipping_cost: 0, discount_amount: 3000, grand_total: 121295, status: 'Delivered', payment_method: 'Net Banking', payment_status: 'Completed', tracking_number: 'TRK789123456', shipping_address: 'Lalitpur' },
  { order_id: 1008, user_name: 'Deepa Maharjan', user_email: 'deepa@example.com', user_phone: '+977 9889012345', order_date: '2025-02-07T15:20:00Z', items_count: 1, total_amount: 34999, tax_amount: 3499, shipping_cost: 500, discount_amount: 0, grand_total: 38998, status: 'Shipped', payment_method: 'Credit Card', payment_status: 'Completed', tracking_number: 'TRK321654987', shipping_address: 'Butwal, Rupandehi' },
  { order_id: 1009, user_name: 'Roshan Khadka', user_email: 'roshan@example.com', user_phone: '+977 9890123456', order_date: '2025-02-06T12:10:00Z', items_count: 2, total_amount: 204998, tax_amount: 20499, shipping_cost: 0, discount_amount: 15000, grand_total: 210497, status: 'Processing', payment_method: 'EMI', payment_status: 'Completed', tracking_number: null, shipping_address: 'Dharan, Sunsari' },
  { order_id: 1010, user_name: 'Manisha Tamang', user_email: 'manisha@example.com', user_phone: '+977 9801234567', order_date: '2025-02-05T09:00:00Z', items_count: 1, total_amount: 17999, tax_amount: 1799, shipping_cost: 200, discount_amount: 0, grand_total: 19998, status: 'Delivered', payment_method: 'UPI', payment_status: 'Completed', tracking_number: 'TRK654987321', shipping_address: 'Hetauda, Makwanpur' },
];

// ──────────────────────────────────────
// 7. Categories
// ──────────────────────────────────────
export const mockCategories = [
  { id: 1, name: 'Smartphones' },
  { id: 2, name: 'Laptops' },
  { id: 3, name: 'Tablets' },
  { id: 4, name: 'Smart Watches' },
  { id: 5, name: 'Headphones' },
  { id: 6, name: 'Cameras' },
  { id: 7, name: 'Drones' },
  { id: 8, name: 'Gaming' },
  { id: 9, name: 'Speakers' },
  { id: 10, name: 'Display' },
  { id: 11, name: 'Accessories' },
  { id: 12, name: 'Smart Home' },
];

// ──────────────────────────────────────
// 8. Suppliers
// ──────────────────────────────────────
export const mockSuppliers = [
  { id: 1, name: 'Apple Inc.', rating: 4.8 },
  { id: 2, name: 'Samsung Electronics', rating: 4.5 },
  { id: 3, name: 'Sony Corporation', rating: 4.6 },
  { id: 4, name: 'Dell Technologies', rating: 4.3 },
  { id: 5, name: 'Lenovo Group', rating: 4.2 },
  { id: 6, name: 'Canon Inc.', rating: 4.4 },
  { id: 7, name: 'DJI Technology', rating: 4.7 },
  { id: 8, name: 'Bose Corporation', rating: 4.5 },
  { id: 9, name: 'JBL (Harman)', rating: 4.3 },
  { id: 10, name: 'Nintendo Co.', rating: 4.6 },
];

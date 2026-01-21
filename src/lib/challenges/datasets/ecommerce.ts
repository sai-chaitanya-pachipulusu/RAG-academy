import { Dataset } from "./types";

/**
 * E-commerce Product Catalog Dataset
 * 
 * Use case: Product search, recommendation systems, customer support
 * Real-world inspiration: Amazon, Shopify, eBay search systems
 */
export const ECOMMERCE_DATASET: Dataset = {
  id: "ecommerce-products",
  name: "E-commerce Product Catalog",
  description: "Product listings with descriptions, categories, and customer queries for semantic search.",
  docs: [
    {
      id: "prod_laptop_001",
      content: "MacBook Pro 14-inch M3 Pro chip. 18GB unified memory, 512GB SSD. Liquid Retina XDR display with ProMotion. Up to 17 hours battery life. Perfect for professional video editing and software development.",
      metadata: { category: "electronics", subcategory: "laptops", price: 1999, rating: 4.8, stock: 45 },
    },
    {
      id: "prod_laptop_002",
      content: "Dell XPS 15 with Intel Core i7-13700H. 16GB DDR5 RAM, 512GB NVMe SSD. 15.6-inch OLED 3.5K display. Windows 11 Pro. Ideal for business professionals and creative work.",
      metadata: { category: "electronics", subcategory: "laptops", price: 1599, rating: 4.5, stock: 32 },
    },
    {
      id: "prod_headphones_001",
      content: "Sony WH-1000XM5 wireless noise-canceling headphones. Industry-leading noise cancellation with 8 microphones. 30-hour battery life. Multipoint connection. Exceptional sound quality with LDAC.",
      metadata: { category: "electronics", subcategory: "audio", price: 399, rating: 4.7, stock: 120 },
    },
    {
      id: "prod_headphones_002",
      content: "Apple AirPods Pro 2nd generation with MagSafe charging case. Active noise cancellation and transparency mode. Adaptive Audio. Personalized Spatial Audio. H2 chip for powerful sound.",
      metadata: { category: "electronics", subcategory: "audio", price: 249, rating: 4.6, stock: 200 },
    },
    {
      id: "prod_chair_001",
      content: "Herman Miller Aeron ergonomic office chair. Size B (medium). Graphite frame with PostureFit SL. Fully adjustable arms. Breathable mesh for all-day comfort. 12-year warranty.",
      metadata: { category: "furniture", subcategory: "office", price: 1395, rating: 4.9, stock: 15 },
    },
    {
      id: "prod_chair_002",
      content: "Secretlab Titan Evo 2022 gaming chair. NEO Hybrid Leatherette. 4-way L-ADAPT lumbar support. Magnetic memory foam head pillow. Full metal 4D armrests. Supports up to 285 lbs.",
      metadata: { category: "furniture", subcategory: "gaming", price: 519, rating: 4.7, stock: 78 },
    },
    {
      id: "prod_monitor_001",
      content: "LG 27GP950-B 4K gaming monitor. 27-inch Nano IPS display. 144Hz refresh rate with G-SYNC and FreeSync Premium Pro. 1ms response time. HDMI 2.1 for console gaming.",
      metadata: { category: "electronics", subcategory: "monitors", price: 799, rating: 4.5, stock: 42 },
    },
    {
      id: "prod_keyboard_001",
      content: "Keychron Q1 Pro wireless mechanical keyboard. 75% layout with knob. Hot-swappable Gateron G Pro switches. QMK/VIA programmable. Aluminum CNC machined body. Bluetooth 5.1.",
      metadata: { category: "electronics", subcategory: "peripherals", price: 199, rating: 4.8, stock: 156 },
    },
    {
      id: "prod_desk_001",
      content: "Uplift V2 standing desk. 60x30 inch bamboo top. Electric height adjustment from 25.3 to 50.9 inches. Advanced keypad with 4 memory presets. Whisper-quiet motors. 355 lb capacity.",
      metadata: { category: "furniture", subcategory: "office", price: 699, rating: 4.6, stock: 28 },
    },
    {
      id: "prod_webcam_001",
      content: "Logitech Brio 4K Ultra HD webcam. HDR with RightLight 3. 5x digital zoom. Windows Hello certified. Works with Microsoft Teams, Zoom, Google Meet. Privacy shutter included.",
      metadata: { category: "electronics", subcategory: "webcams", price: 199, rating: 4.4, stock: 89 },
    },
    {
      id: "prod_coffee_001",
      content: "Breville Barista Express espresso machine. Integrated conical burr grinder with 16 settings. 15 bar Italian pump. 67oz water tank. Steam wand for microfoam milk texturing.",
      metadata: { category: "appliances", subcategory: "coffee", price: 749, rating: 4.6, stock: 34 },
    },
    {
      id: "prod_vacuum_001",
      content: "Dyson V15 Detect cordless vacuum. Laser reveals microscopic dust. Piezo sensor counts particles. LCD screen shows real-time data. Up to 60 minutes runtime. HEPA filtration.",
      metadata: { category: "appliances", subcategory: "cleaning", price: 749, rating: 4.7, stock: 67 },
    },
  ],
  queries: [
    {
      id: "q_laptop_dev",
      text: "best laptop for coding and software development",
      relevantDocs: ["prod_laptop_001", "prod_laptop_002"],
    },
    {
      id: "q_headphones_travel",
      text: "wireless headphones with good noise cancellation for flights",
      relevantDocs: ["prod_headphones_001", "prod_headphones_002"],
    },
    {
      id: "q_ergonomic_wfh",
      text: "comfortable office chair for working from home all day",
      relevantDocs: ["prod_chair_001", "prod_chair_002"],
    },
    {
      id: "q_gaming_setup",
      text: "high refresh rate monitor for competitive gaming",
      relevantDocs: ["prod_monitor_001"],
    },
    {
      id: "q_typing_experience",
      text: "premium mechanical keyboard for typing enthusiasts",
      relevantDocs: ["prod_keyboard_001"],
    },
    {
      id: "q_standing_desk",
      text: "motorized desk that goes up and down for standing",
      relevantDocs: ["prod_desk_001"],
    },
    {
      id: "q_video_calls",
      text: "webcam for professional video conferencing",
      relevantDocs: ["prod_webcam_001"],
    },
    {
      id: "q_home_coffee",
      text: "espresso machine for making cafe quality coffee at home",
      relevantDocs: ["prod_coffee_001"],
    },
  ],
};

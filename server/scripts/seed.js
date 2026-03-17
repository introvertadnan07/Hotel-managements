import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

// ── Models (adjust paths if yours differ) ────────────────────────────────────
import Hotel from "../models/Hotel.js";
import Room  from "../models/Room.js";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}

// ── Hotel + Room Data ─────────────────────────────────────────────────────────
const seedData = [
  {
    hotel: {
      name:    "The Grand Mumbai Palace",
      address: "Marine Drive, Nariman Point, Mumbai",
      city:    "Mumbai",
      contact: "+91 22 6654 3210",
    },
    rooms: [
      {
        roomType:       "Luxury Room",
        category:       "Luxury",
        pricePerNight:  8500,
        baseGuests:     2,
        maxGuests:      3,
        extraGuestPrice:1200,
        beds:           1,
        bathrooms:      1,
        description:    "Breathtaking sea-facing room with floor-to-ceiling windows overlooking Marine Drive. Features a king-size bed, premium minibar, and 24-hour butler service.",
        amenities:      ["Free Wifi", "Air Conditioning", "Free Breakfast", "Room Service", "Mountain View"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
        ],
      },
      {
        roomType:       "Family Suite",
        category:       "Premium",
        pricePerNight:  12000,
        baseGuests:     4,
        maxGuests:      6,
        extraGuestPrice:800,
        beds:           3,
        bathrooms:      2,
        description:    "Expansive family suite with separate living area, two bedrooms, and a private kitchenette. Perfect for families exploring the financial capital of India.",
        amenities:      ["Free Wifi", "Air Conditioning", "Free Breakfast", "Room Service", "Gym Access"],
        images: [
          "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80",
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
          "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
        ],
      },
    ],
  },
  {
    hotel: {
      name:    "Royal Heritage Jaipur",
      address: "Civil Lines, Near Albert Hall, Jaipur",
      city:    "Jaipur",
      contact: "+91 141 4102 100",
    },
    rooms: [
      {
        roomType:       "Double Bed Room",
        category:       "Premium",
        pricePerNight:  4500,
        baseGuests:     2,
        maxGuests:      3,
        extraGuestPrice:700,
        beds:           1,
        bathrooms:      1,
        description:    "A regal room inspired by Rajput architecture, featuring handcrafted furniture, intricate mirror work, and a view of the pink city skyline.",
        amenities:      ["Free Wifi", "Air Conditioning", "Free Breakfast", "Swimming Pool"],
        images: [
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
          "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&q=80",
          "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
        ],
      },
      {
        roomType:       "Luxury Room",
        category:       "Luxury",
        pricePerNight:  7200,
        baseGuests:     2,
        maxGuests:      2,
        extraGuestPrice:0,
        beds:           1,
        bathrooms:      1,
        description:    "Palace-inspired luxury room with a private courtyard, hand-painted murals, and traditional Rajasthani decor. Includes complimentary folk dance performance.",
        amenities:      ["Free Wifi", "Air Conditioning", "Free Breakfast", "Room Service", "Swimming Pool"],
        images: [
          "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80",
          "https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&q=80",
          "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
        ],
      },
    ],
  },
  {
    hotel: {
      name:    "Serenity Backwaters Kochi",
      address: "Fort Kochi, Marine Drive, Kochi",
      city:    "Kochi",
      contact: "+91 484 2215 675",
    },
    rooms: [
      {
        roomType:       "Single Bed Room",
        category:       "Budget",
        pricePerNight:  1800,
        baseGuests:     1,
        maxGuests:      2,
        extraGuestPrice:500,
        beds:           1,
        bathrooms:      1,
        description:    "Cozy room with traditional Kerala wooden architecture, overlooking the serene backwaters. Includes complimentary Ayurvedic welcome drink.",
        amenities:      ["Free Wifi", "Air Conditioning", "Free Breakfast"],
        images: [
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80",
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
        ],
      },
      {
        roomType:       "Double Bed Room",
        category:       "Standard",
        pricePerNight:  3200,
        baseGuests:     2,
        maxGuests:      4,
        extraGuestPrice:600,
        beds:           1,
        bathrooms:      1,
        description:    "Elegant room with a private balcony facing the Chinese fishing nets. Wake up to stunning sunrise views over the Arabian Sea.",
        amenities:      ["Free Wifi", "Air Conditioning", "Free Breakfast", "Mountain View"],
        images: [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
          "https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800&q=80",
          "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800&q=80",
        ],
      },
    ],
  },
  {
    hotel: {
      name:    "Himalayan View Resort Shimla",
      address: "Mall Road, Near Ridge, Shimla",
      city:    "Shimla",
      contact: "+91 177 2812 345",
    },
    rooms: [
      {
        roomType:       "Double Bed Room",
        category:       "Standard",
        pricePerNight:  3800,
        baseGuests:     2,
        maxGuests:      3,
        extraGuestPrice:600,
        beds:           1,
        bathrooms:      1,
        description:    "Warm and cozy room with panoramic Himalayan views, a fireplace, and hand-woven Himachali blankets. Perfect for a winter mountain retreat.",
        amenities:      ["Free Wifi", "Free Breakfast", "Mountain View", "Room Service"],
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
        ],
      },
      {
        roomType:       "Family Suite",
        category:       "Premium",
        pricePerNight:  6500,
        baseGuests:     3,
        maxGuests:      5,
        extraGuestPrice:800,
        beds:           2,
        bathrooms:      2,
        description:    "Spacious family suite with two bedrooms and a living area with floor-to-ceiling windows overlooking snow-capped peaks. Includes bonfire evenings.",
        amenities:      ["Free Wifi", "Free Breakfast", "Mountain View", "Room Service", "Gym Access"],
        images: [
          "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
          "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?w=800&q=80",
          "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&q=80",
        ],
      },
    ],
  },
  {
    hotel: {
      name:    "Cyber Hub Stay Hyderabad",
      address: "Hitech City, Madhapur, Hyderabad",
      city:    "Hyderabad",
      contact: "+91 40 6660 5500",
    },
    rooms: [
      {
        roomType:       "Single Bed Room",
        category:       "Standard",
        pricePerNight:  2200,
        baseGuests:     1,
        maxGuests:      2,
        extraGuestPrice:500,
        beds:           1,
        bathrooms:      1,
        description:    "Modern business-ready room in the heart of Hyderabad's tech corridor. Equipped with high-speed WiFi, ergonomic workspace, and city skyline views.",
        amenities:      ["Free Wifi", "Air Conditioning", "Gym Access"],
        images: [
          "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80",
          "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80",
          "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&q=80",
        ],
      },
      {
        roomType:       "Luxury Room",
        category:       "Luxury",
        pricePerNight:  9500,
        baseGuests:     2,
        maxGuests:      3,
        extraGuestPrice:1500,
        beds:           1,
        bathrooms:      1,
        description:    "Executive luxury suite with panoramic views of HITEC City, a Nizam-inspired interior, premium business amenities and private lounge access.",
        amenities:      ["Free Wifi", "Air Conditioning", "Free Breakfast", "Room Service", "Swimming Pool", "Gym Access"],
        images: [
          "https://unsplash.com/photos/brown-wooden-lounge-chairs-near-pool-surrounded-by-palm-trees-vmIWr0NnpCQ",
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
          "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
        ],
      },
    ],
  },
  {
    hotel: {
      name:    "Bengal Crown Kolkata",
      address: "Park Street, Central Kolkata",
      city:    "Kolkata",
      contact: "+91 33 2229 8800",
    },
    rooms: [
      {
        roomType:       "Double Bed Room",
        category:       "Standard",
        pricePerNight:  2800,
        baseGuests:     2,
        maxGuests:      3,
        extraGuestPrice:500,
        beds:           1,
        bathrooms:      1,
        description:    "Heritage-style room in the cultural capital of India. Features colonial-era furniture, high ceilings, and is just steps away from Park Street's vibrant dining scene.",
        amenities:      ["Free Wifi", "Air Conditioning", "Free Breakfast"],
        images: [
          "https://unsplash.com/photos/3d-render-of-commercial-building-interior-and-reception-1FLlNc1C-2s",
          "https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800&q=80",
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
        ],
      },
      {
        roomType:       "Family Suite",
        category:       "Premium",
        pricePerNight:  5500,
        baseGuests:     4,
        maxGuests:      6,
        extraGuestPrice:700,
        beds:           2,
        bathrooms:      2,
        description:    "Grand family suite inspired by the Zamindari era, with ornate Bengal craftsmanship. Includes a private dining room and personal chef for Bengali cuisine.",
        amenities:      ["Free Wifi", "Air Conditioning", "Free Breakfast", "Room Service", "Swimming Pool"],
        images: [
          "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
          "https://images.unsplash.com/photo-1560185127-6a9d1c18b9a2?w=800&q=80",
        ],
      },
    ],
  },
];

// ── Run Seed ──────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    let hotelsCreated = 0;
    let roomsCreated  = 0;
    let skipped       = 0;

    for (const { hotel: hotelData, rooms: roomsData } of seedData) {

      // Check if hotel already exists
      const existing = await Hotel.findOne({ name: hotelData.name });
      if (existing) {
        console.log(`⏭  Skipping "${hotelData.name}" — already exists`);
        skipped++;
        continue;
      }

      // Create hotel with a dummy owner clerkId (update this if you want real ownership)
      const hotel = await Hotel.create({
        ...hotelData,
        owner: "seed_owner_demo", // Change to your real Clerk user ID if needed
      });

      hotelsCreated++;
      console.log(`🏨 Created hotel: ${hotel.name} (${hotel.city})`);

      // Create rooms for this hotel
      for (const roomData of roomsData) {
        await Room.create({ ...roomData, hotel: hotel._id });
        roomsCreated++;
        console.log(`   🛏  Added room: ${roomData.roomType} — ₹${roomData.pricePerNight}/night`);
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Seed complete!`);
    console.log(`   Hotels created : ${hotelsCreated}`);
    console.log(`   Rooms created  : ${roomsCreated}`);
    console.log(`   Hotels skipped : ${skipped} (already existed)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (error) {
    console.error("❌ Seed failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

seed();
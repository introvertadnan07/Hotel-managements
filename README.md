<<<<<<< HEAD
<div align="center">

<img src="https://img.shields.io/badge/AnumiflyStay-Hotel%20Booking%20Platform-0f172a?style=for-the-badge&logoColor=white" alt="AnumiflyStay" />

# 🏨 AnumiflyStay

### A Full-Stack Hotel Booking & Management Platform

**Discover · Book · Manage — All in One Place**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-2563eb?style=for-the-badge)](https://anumifly.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-0f172a?style=for-the-badge&logo=github)](https://github.com/introvertadnan07/Hotel-managements)
[![License](https://img.shields.io/badge/License-MIT-16a34a?style=for-the-badge)](LICENSE)

</div>

---

## 📸 Preview

> *A premium hotel booking experience with powerful owner tools, AI features, and seamless payments*

---

## ✨ Features

### 👤 For Guests
- 🔍 **Search & Filter** — Browse rooms by city, price range, and room type
- ❤️ **Wishlist** — Save favorite rooms for later
- ⚖️ **Compare Rooms** — Compare up to 2 rooms side-by-side
- 🎟️ **Coupon Codes** — Apply promo codes for discounts
- 💳 **Stripe Payments** — Secure online payments
- 📧 **Email Invoice** — Automatic PDF invoice on booking confirmation
- 📅 **Booking Management** — View, track, and cancel bookings
- 🌙 **Dark Mode** — Full dark mode support

### 🏨 For Hotel Owners
- 🏢 **Multi-Hotel Support** — Register and manage multiple hotels
- 🛏️ **Room Management** — Add rooms with images, amenities, pricing
- 📊 **Analytics Dashboard** — Revenue charts, occupancy rate, booking trends
- 🤖 **AI Price Suggestion** — Get AI-powered competitive pricing recommendations
- ✨ **AI Description Generator** — Generate compelling room descriptions
- 🔄 **Availability Toggle** — Control room availability in real-time
- 📆 **Bookings Calendar** — Visual calendar view of all bookings

### 🛡️ For Admins
- 👥 **User Management** — View, edit roles, delete users
- 🏨 **Hotel Verification** — Verify/unverify hotel listings
- 📋 **Booking Overview** — Monitor all platform bookings
- 📈 **Platform Statistics** — Total revenue, bookings, and hotel stats

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | Clerk |
| **Payments** | Stripe |
| **Image Hosting** | Cloudinary |
| **Email** | Nodemailer + Gmail |
| **PDF Generation** | PDFKit (memory buffer) |
| **AI** | Anthropic Claude API |
| **Maps** | React Leaflet |
| **Charts** | Recharts |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Clerk account
- Stripe account
- Cloudinary account
- Gmail App Password

### 1. Clone the Repository

```bash
git clone https://github.com/introvertadnan07/Hotel-managements.git
cd Hotel-managements
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

```bash
npm run dev
```

### 4. Open in Browser

```
http://localhost:5173
```

---

## 📁 Project Structure

```
Hotel-managements/
├── client/                      # React Frontend
│   └── src/
│       ├── assets/              # Images, icons
│       ├── components/          # Reusable components
│       │   └── hotelOwner/      # Owner-specific components
│       ├── context/             # AppContext (global state)
│       └── pages/
│           └── hotelOwner/      # Owner dashboard pages
│
└── server/                      # Express Backend
    ├── controllers/             # Business logic
    ├── middleware/              # Auth & admin middleware
    ├── models/                  # Mongoose schemas
    ├── routes/                  # API route definitions
    └── utils/                   # Email, PDF, Cloudinary helpers
```

---

## 🔌 API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/hotels` | Register hotel | Owner |
| `GET` | `/api/hotels/owner` | Get owner's hotels | Owner |
| `POST` | `/api/rooms` | Add room | Owner |
| `GET` | `/api/rooms` | Get all rooms | Public |
| `POST` | `/api/bookings/book` | Create booking | Guest |
| `GET` | `/api/bookings/user` | Get user bookings | Guest |
| `GET` | `/api/bookings/hotel` | Get hotel bookings | Owner |
| `POST` | `/api/bookings/stripe-payment` | Stripe checkout | Guest |
| `POST` | `/api/bookings/validate-coupon` | Validate coupon | Guest |
| `POST` | `/api/wishlist/toggle` | Toggle wishlist | Guest |
| `GET` | `/api/ai/price-suggestion/:id` | AI price suggestion | Owner |
| `GET` | `/api/ai/generate-description/:id` | AI description | Owner |
| `GET` | `/api/admin/stats` | Platform stats | Admin |

---

## 🗄️ Database Schema

```
User         → clerkId, email, username, role
Hotel        → name, address, city, contact, owner
Room         → hotel, roomType, category, description,
               pricePerNight, baseGuests, maxGuests,
               extraGuestPrice, beds, bathrooms,
               amenities, images, isAvailable
Booking      → user, room, hotel, checkIn, checkOut,
               totalPrice, isPaid, status, couponCode
Review       → user, room, rating, comment
Wishlist     → user, rooms[]
Coupon       → code, discountType, discountValue,
               maxUsage, usedCount, expiryDate
Newsletter   → email, subscribedAt
```

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| **Guest** | Browse, wishlist, book, review rooms |
| **Hotel Owner** | Register hotels, manage rooms, view analytics |
| **Admin** | Full platform management access |

> To make yourself Admin: MongoDB Atlas → users collection → set `role` to `"admin"`

---

## 🌟 Key Implementation Highlights

- **Vercel-Compatible PDF** — Invoice PDFs generated in memory (no filesystem writes)
- **Multi-Hotel Support** — One account can own multiple hotels
- **Stripe Webhooks** — Payment confirmation handled server-side
- **Dark Mode (Tailwind v4)** — Uses `@variant dark` syntax throughout
- **AI Integration** — Claude API powers pricing and description features
- **Role-Based Access** — Middleware guards protect owner and admin routes
- **Cloudinary Upload** — Images streamed via buffer, no temp file storage

---

## 📦 Environment Variables Summary

### Server
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password |

### Client
| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

---

## 🚢 Deployment

### Backend (Vercel)
1. Connect GitHub repo to Vercel
2. Set **Root Directory** to `server`
3. Add all environment variables
4. Deploy

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set **Root Directory** to `client`
3. Add `VITE_BACKEND_URL` and `VITE_CLERK_PUBLISHABLE_KEY`
4. Deploy

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Md Adnan Qaisar**

[![GitHub](https://img.shields.io/badge/GitHub-introvertadnan07-0f172a?style=flat&logo=github)](https://github.com/introvertadnan07)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by Md Adnan Qaisar**

*If you found this project helpful, please give it a ⭐*

</div>
=======
# AnumiflyStay
>>>>>>> 5f03fac34f2e9cd024036c85f103cd864d077c83

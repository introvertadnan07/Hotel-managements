import logo from "./logo.svg";
import searchIcon from "./searchIcon.svg";
import userIcon from "./userIcon.svg";
import calenderIcon from "./calenderIcon.svg";
import locationIcon from "./locationIcon.svg";
import starIconFilled from "./starIconFilled.svg";
import arrowIcon from "./arrowIcon.svg";
import starIconOutlined from "./starIconOutlined.svg";
import instagramIcon from "./instagramIcon.svg";
import facebookIcon from "./facebookIcon.svg";
import twitterIcon from "./twitterIcon.svg";
import linkendinIcon from "./linkendinIcon.svg";
import freeWifiIcon from "./freeWifiIcon.svg";
import freeBreakfastIcon from "./freeBreakfastIcon.svg";
import roomServiceIcon from "./roomServiceIcon.svg";
import mountainIcon from "./mountainIcon.svg";
import poolIcon from "./poolIcon.svg";
import homeIcon from "./homeIcon.svg";
import closeIcon from "./closeIcon.svg";
import locationFilledIcon from "./locationFilledIcon.svg";
import heartIcon from "./heartIcon.svg";
import badgeIcon from "./badgeIcon.svg";
import menuIcon from "./menuIcon.svg";
import closeMenu from "./closeMenu.svg";
import guestsIcon from "./guestsIcon.svg";

import roomImg1 from "./roomImg1.png";
import roomImg2 from "./roomImg2.png";
import roomImg3 from "./roomImg3.png";
import roomImg4 from "./roomImg4.png";

import regImage from "./regImage.png";

import exclusiveOfferCardImg1 from "./exclusiveOffer1.png";
import exclusiveOfferCardImg2 from "./exclusiveOffer2.png";
import exclusiveOfferCardImg3 from "./exclusiveOffer3.png";

import addIcon from "./addIcon.svg";
import dashboardIcon from "./dashboardIcon.svg";
import listIcon from "./listIcon.svg";
import uploadArea from "./uploadArea.svg";
import totalBookingIcon from "./totalBookingIcon.svg";
import totalRevenueIcon from "./totalRevenueIcon.svg";

// ✅ LOWERCASE FILENAMES
import adnanImage from "./adnan.jpg";
import anumImage from "./anum.jpg";


// Hosted fallback
import hostedDefaultImage from "./anum.jpg";

export const assets = {
  logo,
  searchIcon,
  userIcon,
  calenderIcon,
  locationIcon,
  starIconFilled,
  arrowIcon,
  starIconOutlined,
  instagramIcon,
  facebookIcon,
  twitterIcon,
  linkendinIcon,
  freeWifiIcon,
  freeBreakfastIcon,
  roomServiceIcon,
  mountainIcon,
  poolIcon,
  closeIcon,
  homeIcon,
  locationFilledIcon,
  heartIcon,
  badgeIcon,
  menuIcon,
  closeMenu,
  guestsIcon,
  regImage,
  addIcon,
  dashboardIcon,
  listIcon,
  uploadArea,
  totalBookingIcon,
  totalRevenueIcon,

  exclusiveOffer1: exclusiveOfferCardImg1,
  exclusiveOffer2: exclusiveOfferCardImg2,
  exclusiveOffer3: exclusiveOfferCardImg3,

  hostedDefaultImage,
};

export const cities = [
  "Dubai",
  "Singapore",
  "New York",
  "Chennai",
  "Mumbai",
  "Kochi",
  "Patna",
  "Ranchi",
  "Hyderabad"
];

export const exclusiveOffers = [
  {
    _id: 1,
    title: "Summer Escape Package",
    description: "Enjoy a complimentary night and daily breakfast",
    priceOff: 25,
    expiryDate: "Aug 31",
    image: exclusiveOfferCardImg1,
  },
  {
    _id: 2,
    title: "Romantic Getaway",
    description: "Special couples package including spa treatment",
    priceOff: 20,
    expiryDate: "Sep 20",
    image: exclusiveOfferCardImg2,
  },
  {
    _id: 3,
    title: "Luxury Retreat",
    description:
      "Book 60 days in advance and save on your stay at any of our luxury properties worldwide.",
    priceOff: 30,
    expiryDate: "Sep 25",
    image: exclusiveOfferCardImg3,
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Faizan Naseem",
    address: "Barcelona, Spain",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    rating: 5,
    review:
      "I've used many booking platforms before, but none compare to the personalized experience and attention to detail that QuickStay provides.",
  },
 
  {
    id: 3,
    name: "Anum Rahi",
    address: "Kolkata, India",
    image: anumImage,
    rating: 5,
    review:
      "Amazing service! I always find the best luxury accommodations through QuickStay.",
  },
  {
    id: 4,
    name: "Md Adnan Qaisar",
    address: "Kochi, India",
    image: adnanImage,
    rating: 5,
    review:
      "A seamless booking experience with top-tier accommodations.",
  },
];

export const facilityIcons = {
  "Free WiFi": freeWifiIcon,
  "Free Breakfast": freeBreakfastIcon,
  "Free Service": roomServiceIcon,
  "Mountain View": mountainIcon,
  "Pool Access": poolIcon,
};

export const roomCommonData = [
  {
    icon: homeIcon,
    title: "Clean & Safe Stay",
    description: "A well-maintained and hygienic space just for you.",
  },
  {
    icon: badgeIcon,
    title: "Enhanced Cleaning",
    description: "This host follows strict cleaning standards.",
  },
  {
    icon: locationFilledIcon,
    title: "Excellent Location",
    description: "90% of guests rated the location 5 stars.",
  },
  {
    icon: heartIcon,
    title: "Smooth Check-In",
    description: "100% of guests gave check-in a 5-star rating.",
  },
];

export const roomsDummyData = [
  {
    _id: "1",
    roomType: "Double Bed",
    pricePerNight: 399,
    amenities: ["Room Service", "Mountain View", "Pool Access"],
    images: [roomImg1, roomImg2, roomImg3, roomImg4],
    isAvailable: true,
  },
];

export const userBookingsDummyData = [
  {
    _id: "b1",
    hotel: {
      name: "Urbanza Suites",
      address: "Main Road 123 Street, 23 Colony",
    },
    room: {
      roomType: "Double Bed",
      images: [roomImg1],
    },
    checkInDate: "2026-02-20",
    checkOutDate: "2026-02-25",
    guests: 2,
    totalPrice: 998,
    isPaid: false,
  },
];
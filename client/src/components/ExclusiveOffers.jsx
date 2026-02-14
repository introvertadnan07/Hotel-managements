import React from "react";
import { assets } from "../assets/assets";

const ExclusiveOffers = () => {
  const offers = [
    {
      id: 1,
      title: "Summer Escape Deal",
      description: "Enjoy up to 30% off on luxury rooms this summer.",
      image: assets.exclusiveOffer1,
    },
    {
      id: 2,
      title: "Weekend Special",
      description: "Book a weekend stay and get complimentary breakfast.",
      image: assets.exclusiveOffer2,
    },
    {
      id: 3,
      title: "Honeymoon Package",
      description: "Romantic room setup with exclusive couple benefits.",
      image: assets.exclusiveOffer3,
    },
  ];

  return (
    <div className="px-6 md:px-16 lg:px-24 py-16">
      <h2 className="text-2xl md:text-3xl font-playfair text-gray-800">
        Exclusive Offers
      </h2>

      <p className="text-gray-500 mt-2">
        Handpicked deals crafted for unforgettable stays
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={offer.image}
              alt={offer.title}
              className="w-full h-40 object-cover"
            />

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {offer.title}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {offer.description}
              </p>

              <button className="mt-4 text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                View Offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExclusiveOffers;

import React from "react";
import Title from "./Title";
import { assets, exclusiveOffers } from "../assets/assets";

const ExclusiveOffers = () => {
  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 pt-20 pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full">
        <Title
          align="left"
          title="Exclusive Offers"
          subTitle="Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories."
        />

        <button className="group flex items-center gap-2 text-sm font-medium cursor-pointer max-md:mt-12">
          View All Offers
          <img
            src={assets.arrowIcon}
            alt="arrow-icon"
            className="transition-all group-hover:translate-x-1"
          />
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-16">
        {exclusiveOffers.map((item) => (
          <div
            key={item._id}
            className="group relative flex flex-col justify-between min-h-[280px] p-6 rounded-xl text-white bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <p className="px-3 py-1 absolute top-4 left-4 text-xs bg-white text-gray-800 font-medium rounded-full">
              {item.priceOff}% OFF
            </p>

            <div>
              <p className="text-lg font-semibold">{item.title}</p>
              <p className="text-sm text-white/90 mt-1">
                {item.description}
              </p>
              <p className="text-xs text-white/70 mt-3">
                Expires {item.expiryDate}
              </p>
            </div>

            <button className="flex items-center gap-2 font-medium cursor-pointer mt-6">
              View offers
              <img
                src={assets.arrowIcon}
                alt="arrow-icon"
                className="invert transition-all group-hover:translate-x-1"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExclusiveOffers;

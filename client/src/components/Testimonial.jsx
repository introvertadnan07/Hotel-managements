import React from "react";
import Title from "./Title";
import { testimonials } from "../assets/assets";
import StarRating from "./StarRating";

const Testimonial = () => {
  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 dark:bg-gray-900 pt-20 pb-24 transition-colors duration-300">
      <Title
        title="What Our Guests Say"
        subTitle="Discover why discerning travelers consistently choose AnumiflyStay for their exclusive and luxurious accommodations around the world."
      />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 mb-10 w-full">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-sm transition-colors duration-300"
          >
            {/* User */}
            <div className="flex items-center gap-3">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-playfair text-lg dark:text-white">
                  {testimonial.name}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {testimonial.address}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-4">
              <StarRating rating={testimonial.rating} />
            </div>

            {/* Review */}
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm leading-relaxed">
              "{testimonial.review}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
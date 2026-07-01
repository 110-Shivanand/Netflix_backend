import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import MovieCard from "../movie/MovieCard";
import ShowCard  from "../show/ShowCard";
import "./ContentRow.css";

export default function ContentRow({ title, items = [], type = "movie" }) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: dir * 600, behavior: "smooth" });
    }
  };

  if (!items.length) return null;

  return (
    <div className="content-row">
      <div className="content-row__header">
        <h2 className="content-row__title">{title}</h2>
      </div>

      <div className="content-row__slider">
        {/* Left arrow */}
        <button
          className="content-row__arrow content-row__arrow--left"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
        >
          <span className="content-row__arrow-icon">
            <FaChevronLeft />
          </span>
        </button>

        {/* Scroll track */}
        <div className="content-row__track" ref={trackRef}>
          {items.map((item) => (
            <div key={item.id} className="content-row__item">
              {type === "movie"
                ? <MovieCard movie={item} />
                : <ShowCard  show={item}  />
              }
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          className="content-row__arrow content-row__arrow--right"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
        >
          <span className="content-row__arrow-icon">
            <FaChevronRight />
          </span>
        </button>
      </div>
    </div>
  );
}

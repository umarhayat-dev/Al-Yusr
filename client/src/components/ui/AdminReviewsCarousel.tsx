import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const AdminReviewsCarousel = ({ handleApprove, handleDelete }) => {
  const [currentReview, setCurrentReview] = useState(0);
  const intervalRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["pending-reviews"],
    queryFn: async () => {
      const response = await fetch("/api/admin/pending-reviews");
      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Carousel auto-play logic
  useEffect(() => {
    if (reviews.length > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
      }, 7000);
    }

    return () => clearInterval(intervalRef.current);
  }, [reviews.length, isHovered]);

  const nextReview = () =>
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  const prevReview = () =>
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <div className="relative w-full">
      {isLoading ? (
        <div className="text-center text-slate-500 py-8">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-slate-500 py-8">
          No pending reviews
        </div>
      ) : (
        <Card
          className="rounded-2xl card-hover"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="font-semibold text-slate-900 text-lg">
                {reviews[currentReview]?.name}
              </div>
              <div className="text-slate-600">
                {reviews[currentReview]?.location}
              </div>
              {reviews[currentReview]?.date && (
                <div className="text-sm text-slate-500">
                  {new Date(reviews[currentReview].date).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < reviews[currentReview]?.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="relative mb-6 text-left max-w-2xl mx-auto">
              <Quote className="absolute left-0 top-0 w-6 h-6 text-blue-300 opacity-60" />
              <blockquote className="text-lg text-slate-600 italic leading-relaxed pl-8">
                {reviews[currentReview]?.comment}
              </blockquote>
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => handleApprove(reviews[currentReview])}
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Approve
              </button>
              <button
                onClick={() => handleDelete(reviews[currentReview])}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {reviews.length > 1 && !isLoading && (
        <>
          <button
            onClick={prevReview}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-primary-600 hover:text-primary-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-primary-600 hover:text-primary-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default AdminReviewsCarousel;

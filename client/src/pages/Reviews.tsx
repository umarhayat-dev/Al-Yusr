import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Review } from "@shared/schema";

export default function Reviews() {
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="w-4 h-4" />
                    ))}
                  </div>
                  <Skeleton className="h-20 w-full mb-6" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            What Our Students Say
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Real stories from students who have transformed their lives through our courses
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reviews.map((review) => (
            <Card key={review.id} className="shadow-sm border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{review.name}</div>
                    <div className="text-sm text-slate-600">{review.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Rating */}
        <Card className="text-center border border-slate-200">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Overall Student Rating</h3>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-4xl font-bold text-primary-600">{averageRating}</div>
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <div className="text-slate-600">Based on {reviews.length} reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {reviews.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💭</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No reviews yet</h3>
            <p className="text-slate-600">
              Be the first to share your experience with our courses!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Heart, Eye, Star, User, ChevronLeft, ChevronRight, Plus, Quote } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isValidEmail, getEmailInputClass } from "@/lib/utils";
import { useFormSubmission } from "@/lib/firebaseSubmission";
import type { Review } from "@shared/schema";

export default function About() {
  const [currentReview, setCurrentReview] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    location: '',
    rating: 5,
    comment: ''
  });
  const [emailInteracted, setEmailInteracted] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define review type for Google Sheets data
  interface GoogleSheetsReview {
    id: number;
    name: string;
    location: string;
    rating: number;
    comment: string;
    createdAt: string;
  }

  // Fetch approved reviews from Firebase RTDB
  const { data: reviews = [], isLoading, error } = useQuery<GoogleSheetsReview[]>({
    queryKey: ["approved-reviews"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/approved-reviews');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        // Transform Firebase data to match expected format
        return data.map((review: any) => ({
          id: review.id,
          name: review.name,
          location: review.location || review.residence || 'Global',
          rating: review.rating || 5,
          comment: review.comment || review.testimony || review.review,
          createdAt: review.timestamp || review.createdAt
        }));
      } catch (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry failed requests
  });

  const { submitForm } = useFormSubmission();

  const handleReviewSubmit = async (reviewData: any) => {
    const result = await submitForm("reviews", reviewData);
    
    if (result.success) {
      setIsReviewModalOpen(false);
      setReviewForm({ name: '', email: '', location: '', rating: 5, comment: '' });
      queryClient.invalidateQueries({ queryKey: ["google-sheets-reviews"] });
    }
  };

  // Auto-sliding carousel
  useEffect(() => {
    if (reviews.length > 0) {
      const interval = setInterval(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#013626] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              About <span className="text-green-200">AlYusr Institute</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              Dedicated to authentic Islamic education and community building worldwide
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              AlYusr Institute has been dedicated to providing quality Islamic education 
              to students worldwide. Our mission is to make authentic Islamic knowledge accessible to everyone, 
              regardless of their location or background.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We've created a global community committed to learning and growing together in faith and knowledge,
              serving students from diverse backgrounds with authentic Islamic education.
            </p>

            {/* Mission & Values */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#013626]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-[#013626]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Our Mission</h3>
                  <p className="text-gray-600">
                    To spread authentic Islamic knowledge and make quality education accessible to Muslims worldwide
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#013626]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-[#013626]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Our Values</h3>
                  <p className="text-gray-600">
                    Excellence in teaching, authentic scholarship, inclusive learning environment, and spiritual growth
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#013626]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-[#013626]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Our Vision</h3>
                  <p className="text-gray-600">
                    To become the leading online Islamic education platform, fostering a global community of learners
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="relative">
              <div className="bg-gradient-to-br from-[#013626] to-[#5a1313] rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-6 opacity-80">📚</div>
                  <h3 className="text-2xl font-semibold mb-4">Excellence in Islamic Education</h3>
                  <p className="text-blue-100 mb-8">
                    Combining traditional Islamic scholarship with modern teaching methods
                  </p>
                  
                  <p className="text-black font-semibold">
                    Combining traditional Islamic scholarship with modern teaching methods to provide 
                    authentic and accessible Islamic education worldwide.
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}

            </div>
          </div>
        </div>

        {/* Student Reviews Carousel */}
        <div className="mt-16">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">What Our Students Say</h2>
              <p className="text-xl text-slate-600">
                Real testimonials from our amazing student community
              </p>
            </div>
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#013626] hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Review
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Share Your Experience</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                      className="col-span-3"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm({...reviewForm, email: e.target.value})}
                      onBlur={() => setEmailInteracted(true)}
                      className={`col-span-3 ${getEmailInputClass(reviewForm.email, emailInteracted)}`}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={reviewForm.location}
                      onChange={(e) => setReviewForm({...reviewForm, location: e.target.value})}
                      className="col-span-3"
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rating" className="text-right">
                      Rating
                    </Label>
                    <div className="col-span-3 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 cursor-pointer ${
                            i < reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                          onClick={() => setReviewForm({...reviewForm, rating: i + 1})}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="comment" className="text-right pt-2">
                      Review
                    </Label>
                    <Textarea
                      id="comment"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                      className="col-span-3"
                      placeholder="Share your experience with AlYusr Institute..."
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-[#013626] hover:bg-green-800"
                    onClick={() => handleReviewSubmit(reviewForm)}
                    disabled={!reviewForm.name || !reviewForm.comment}
                  >
                    Submit Review
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <Card className="rounded-2xl card-hover">
              <CardContent className="p-8 text-center">
                {isLoading ? (
                  <div className="py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#013626] mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading reviews...</p>
                  </div>
                ) : error ? (
                  <div className="py-12">
                    <p className="text-slate-600 mb-4">Reviews are currently unavailable.</p>
                    <p className="text-sm text-slate-500 mb-4">
                      To display authentic review data, please either:
                    </p>
                    <ul className="text-sm text-slate-500 mb-4 text-left list-disc list-inside">
                      <li>Enable Google Sheets API access in your Google Cloud Console</li>
                      <li>Make the spreadsheet publicly readable (Share → Anyone with the link → Viewer)</li>
                      <li>Provide a Google Sheets API key with proper permissions</li>
                    </ul>
                    <details className="text-left">
                      <summary className="cursor-pointer text-sm font-medium text-slate-700 mb-2">Technical Details</summary>
                      <p className="text-xs text-slate-500 bg-slate-100 p-3 rounded">
                        Error: {error instanceof Error ? error.message : 'Unknown error'}
                      </p>
                    </details>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="py-12">
                    <p className="text-slate-600 mb-4">No approved reviews found in the spreadsheet.</p>
                  </div>
                ) : (
                  <>
                    {/* Name, Location & Date at top */}
                    <div className="mb-6">
                      <div className="font-semibold text-slate-900 text-lg">{reviews[currentReview]?.name}</div>
                      <div className="text-slate-600">{reviews[currentReview]?.location}</div>
                      {reviews[currentReview]?.createdAt && (
                        <div className="text-sm text-slate-500">
                          {new Date(reviews[currentReview].createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                    </div>

                    {/* Star rating */}
                    <div className="flex items-center justify-center gap-1 mb-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < reviews[currentReview]?.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Quote with aligned quote mark */}
                    <div className="relative mb-8 text-left max-w-2xl mx-auto">
                      <Quote className="absolute left-0 top-0 w-8 h-8 text-blue-300 opacity-60" />
                      <blockquote className="text-xl text-slate-600 italic leading-relaxed pl-12">
                        {reviews[currentReview]?.comment}
                      </blockquote>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Navigation Arrows */}
            {reviews.length > 1 && (
              <>
                <button
                  onClick={prevReview}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-primary-600 hover:text-primary-700"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextReview}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-primary-600 hover:text-primary-700"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {reviews.length > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReview(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentReview ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Content */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Our Commitment to Excellence</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="rounded-2xl card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-lg font-semibold mb-2">Quality Education</h3>
                <p className="text-slate-600">
                  Our curriculum is designed by Islamic scholars and education experts to ensure 
                  authentic and comprehensive learning.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-lg font-semibold mb-2">Global Community</h3>
                <p className="text-slate-600">
                  Connect with fellow students from around the world and build lasting 
                  relationships in our diverse learning community.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl card-hover">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold mb-2">Modern Technology</h3>
                <p className="text-slate-600">
                  Learn using cutting-edge technology and interactive tools designed 
                  to enhance your educational experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

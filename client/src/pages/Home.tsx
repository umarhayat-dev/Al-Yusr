import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  BookOpen,
  Users,
  Clock,
  Globe,
  Heart,
  Award,
  ArrowRight,
  Mail,
  CheckCircle
} from "lucide-react";
import heroImage from "@assets/aiease_1748944958675-Picsart-AiImageEnhancer.jpg";

interface HomeProps {
  onBookDemoClick: () => void;
  onConsultationClick: () => void;
}

export default function Home({ onBookDemoClick, onConsultationClick }: HomeProps) {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/submit-newsletter", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Successful!",
        description: "Thank you for subscribing to our newsletter.",
        variant: "default",
      });
      setEmail("");
    },
    onError: () => {
      toast({
        title: "Subscription Failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    newsletterMutation.mutate(email);
  };

  const features = [
    {
      icon: BookOpen,
      title: "Expert Islamic Scholars",
      description: "Learn from qualified scholars with deep knowledge of Quran, Hadith, and Islamic jurisprudence",
    },
    {
      icon: Clock,
      title: "Flexible Learning",
      description: "Study at your own pace with 24/7 access to course materials and recorded sessions",
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Join a diverse community of learners from around the world united in faith and knowledge",
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Courses available in multiple languages to serve our diverse Muslim community",
    },
    {
      icon: Award,
      title: "Certified Programs",
      description: "Receive internationally recognized certificates upon completion of your studies",
    },
    {
      icon: Heart,
      title: "Personalized Guidance",
      description: "One-on-one mentorship and personalized learning paths tailored to your goals",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative min-h-[70vh] flex items-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black-olive mb-6 leading-tight">
              Begin Your Journey in 
              <span className="block text-reseda-green">Islamic Knowledge</span>
            </h1>
            <p className="text-xl md:text-2xl text-black-olive mb-8 max-w-2xl leading-relaxed">
              Discover authentic Islamic education through comprehensive courses designed 
              by qualified scholars. Learn Quran, Arabic, Islamic history, and more from 
              the comfort of your home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => window.location.href = "/courses"}
                className="bg-reseda-green text-champagne-pink hover:bg-black-olive px-8 py-4 text-lg font-semibold rounded-lg inline-flex items-center justify-center group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={onBookDemoClick}
                variant="outline"
                className="bg-sage text-black-olive border-sage hover:bg-buff px-8 py-4 text-lg font-semibold rounded-lg inline-flex items-center justify-center"
              >
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-champagne-pink">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black-olive mb-4">
              Why Choose AlYusr Institute?
            </h2>
            <p className="text-xl text-reseda-green max-w-3xl mx-auto">
              Experience premium Islamic education with our comprehensive approach to learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border-0 shadow-lg bg-white"
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-reseda-green rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8 text-champagne-pink" />
                    </div>
                    <h3 className="text-xl font-bold text-black-olive mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-ash-gray leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-desert-sand p-8 rounded-2xl shadow-lg border-l-4 border-reseda-green">
              <h2 className="text-3xl md:text-4xl font-bold text-black-olive mb-8">
                Our Mission & Values
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#013626] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Authentic Education</h3>
                    <p className="text-gray-600">
                      Providing genuine Islamic knowledge based on Quran and authentic Sunnah
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#5a1313] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Global Accessibility</h3>
                    <p className="text-gray-600">
                      Making Islamic education accessible to Muslims worldwide through technology
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#013626] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Community Building</h3>
                    <p className="text-gray-600">
                      Fostering a strong community of learners united in faith and knowledge
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-64 h-64 mx-auto bg-[#013626] rounded-full flex items-center justify-center shadow-2xl">
                <BookOpen className="w-32 h-32 text-white opacity-80" />
              </div>
              <p className="text-lg text-gray-600 mt-8 italic">
                "And say: My Lord, increase me in knowledge"
                <span className="block text-sm mt-2 text-[#013626] font-semibold">
                  - Quran 20:114
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-black-olive border-0 shadow-2xl">
              <CardContent className="p-8 md:p-12 text-center text-champagne-pink">
                <Mail className="w-16 h-16 mx-auto mb-6 opacity-80" />
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Get Monthly Insights on Islamic Learning
                </h3>
                <p className="text-xl mb-8 opacity-90">
                  Receive inspiring content, course updates, and spiritual guidance monthly in your inbox
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-6 py-4 rounded-lg text-black-olive focus:ring-2 focus:ring-reseda-green focus:outline-none"
                      disabled={newsletterMutation.isPending}
                    />
                    <Button 
                      type="submit"
                      disabled={newsletterMutation.isPending}
                      className="bg-reseda-green hover:bg-sage px-8 py-4 font-semibold rounded-lg whitespace-nowrap"
                    >
                      {newsletterMutation.isPending ? "Subscribing..." : "Subscribe Now"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-champagne-pink">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black-olive mb-4">
            Ready to Begin Your Islamic Learning Journey?
          </h2>
          <p className="text-xl text-reseda-green mb-8 max-w-3xl mx-auto">
            Join thousands of students worldwide who have transformed their lives through authentic Islamic education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = "/courses"}
              className="bg-reseda-green hover:bg-black-olive text-champagne-pink px-8 py-4 text-lg font-semibold rounded-lg inline-flex items-center justify-center group"
            >
              Explore Courses
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={onConsultationClick}
              variant="outline"
              className="border-sage text-sage hover:bg-buff hover:text-black-olive px-8 py-4 text-lg font-semibold rounded-lg"
            >
              Book Free Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
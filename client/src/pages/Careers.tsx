import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Clock, GraduationCap, Heart, MapPin, DollarSign } from "lucide-react";
import { getJobsFromRTDB } from "@/lib/firebase";

export default function Careers() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    getJobsFromRTDB((jobsData) => {
      setJobs(jobsData);
    });
  }, []);

  const benefits = [
    {
      icon: Globe,
      title: "Global Impact",
      description: "Teach students from around the world and make a meaningful difference in their spiritual journey",
      color: "bg-[#013626]/10 text-[#013626]"
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Work from anywhere with flexible hours that fit your lifestyle and commitments",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: GraduationCap,
      title: "Professional Growth",
      description: "Continuous learning opportunities and professional development in Islamic education",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Heart,
      title: "Supportive Community",
      description: "Join a team of dedicated educators passionate about Islamic knowledge and teaching",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#013626] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Join Our <span className="text-green-200">Team</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              Be part of our mission to spread Islamic knowledge and make a positive impact on students' lives
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Current Openings */}
          <div className="max-w-2xl mx-auto text-center">
            <Card className="rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-12">
                <div className="text-6xl mb-8">🕐</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Current Openings</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We don't have any openings right now — check back soon, InshaAllah.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Join Us?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <Card key={index} className="group hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border-0 shadow-lg bg-white">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${benefit.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Competitive Compensation</h3>
                  <p className="text-gray-600">
                    We offer competitive salaries and performance-based bonuses to attract and retain top talent.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">🌟</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Growth Opportunities</h3>
                  <p className="text-gray-600">
                    Professional development programs and opportunities to advance your career in Islamic education.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Supportive Environment</h3>
                  <p className="text-gray-600">
                    Work with a collaborative team that values your contributions and supports your success.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
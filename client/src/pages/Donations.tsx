import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { GraduationCap, Building2, Heart, ChevronDown } from "lucide-react";

export default function Donations() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const donationCategories = [
    {
      id: 1,
      title: "Sponsor a Student",
      description:
        "Give a student access to Islamic education, learning materials, and mentorship for one year.",
      amount: "From $25/month",
      icon: GraduationCap,
      color: "hsl(77, 9%, 43%)", // reseda-green
      buttonColor: "bg-reseda-green hover:bg-black-olive",
    },
    {
      id: 2,
      title: "Donate to Sudan",
      description:
        "Help send food, education, and medicine to families suffering from crisis.",
      amount: "Any amount",
      icon: Building2,
      color: "hsl(77, 9%, 43%)", // reseda-green
      buttonColor: "bg-reseda-green hover:bg-black-olive",
    },
  ];

  const faqItems = [
    {
      question: "How is my donation used?",
      answer:
        "Your donations directly support Islamic education programs, scholarship funds, course development, and humanitarian aid. We maintain full transparency and provide regular updates on fund usage.",
    },
    {
      question: "Can I donate on behalf of someone else?",
      answer:
        "Absolutely! You can make donations in honor or memory of someone else. Please include their name in the donation notes, and we can send acknowledgment if requested.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes, we use industry-standard SSL encryption and work with trusted payment processors like Stripe and PayPal to ensure your payment information is completely secure.",
    },
    {
      question: "Can I set up recurring donations?",
      answer:
        "Yes, you can set up monthly, quarterly, or annual recurring donations. This helps us plan better and ensures consistent support for our programs.",
    },
  ];

  const handleDonate = (category: string) => {
    alert(
      `Thank you for your interest in donating to ${category}. This would connect to a secure payment processor.`,
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Hadith Quote */}
      <section className="py-16 bg-black-olive text-champagne-pink">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              Give in the Way of Allah
            </h1>
            <blockquote className="text-xl md:text-2xl font-medium mb-4 italic">
              "The believer's shade on the Day of Resurrection will be his
              charity."
            </blockquote>
            <p className="text-lg opacity-90">
              - Prophet Muhammad (peace be upon him), Hadith
            </p>
          </div>
        </div>
      </section>

      {/* Donation Categories */}
      <section className="py-16 bg-champagne-pink">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black-olive mb-4">
              Choose Your Path of Giving
            </h2>
            <p className="text-xl text-reseda-green max-w-3xl mx-auto">
              Every contribution helps spread authentic Islamic knowledge and
              supports those in need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto justify-center">
            {donationCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={category.id}
                  className="group hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl border-0 shadow-lg bg-white overflow-hidden flex flex-col h-full"
                >
                  <div
                    className="h-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: category.color }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6 text-center flex-1">
                      {category.description}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mb-6 text-center">
                      {category.amount}
                    </p>
                    <Button
                      onClick={() => handleDonate(category.title)}
                      className={`w-full ${category.buttonColor} text-white font-semibold py-3 rounded-lg transition-all duration-300 mt-auto`}
                    >
                      Donate Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-[#f5fdf7]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Common questions about donations and how they help
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index} className="bg-white border-0 shadow-sm">
                  <Collapsible
                    open={openFaq === index}
                    onOpenChange={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 text-left">
                            {item.question}
                          </h3>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              openFaq === index ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="px-6 pb-6 pt-0">
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[#013626] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Making a Difference Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of generous supporters who are helping spread Islamic
            knowledge worldwide
          </p>
          <Button
            onClick={() => handleDonate("General")}
            className="bg-white text-[#013626] hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg"
          >
            Choose Your Donation
          </Button>
        </div>
      </section>
    </div>
  );
}

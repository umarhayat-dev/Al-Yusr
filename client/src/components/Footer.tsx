import { MessageCircle } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import logoImage from "@assets/logo_w_1748522480431.jpg";

export default function Footer() {
  return (
    <footer className="bg-black-olive text-champagne-pink py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and name */}
          <div className="flex items-center space-x-3">
            <img src={logoImage} alt="AlYusr Institute Logo" className="w-8 h-8 rounded object-contain" />
            <span className="text-lg font-bold">AlYusr Institute</span>
          </div>

          {/* Right side - Social media icons */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://chat.whatsapp.com/BmuFEVxplD9KwUtf0qGDbc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a 
              href="https://www.facebook.com/ayinstitute" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaFacebook className="h-5 w-5" />
            </a>
            <a 
              href="https://www.instagram.com/ayinstitute?igsh=MWtjZmlmbjZzMGhvag==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
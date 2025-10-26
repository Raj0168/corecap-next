import { MapPin, Mail } from "lucide-react";

const ContactUs = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <h1 className="text-3xl font-semibold mb-3">Contact Us</h1>
      <hr className="my-4 border-gray-300" />

      {/* Description */}
      <p className="text-gray-700 mb-8">
        Have questions about our courses, facing a technical glitch, or just
        want to say hi? We’re all ears! Reach out to the CorecapMaths team using
        any of the methods below and we’ll get back to you as soon as possible.
      </p>

      {/* Contact Info */}
      <div className="space-y-4">
        {/* Location */}
        <div className="flex items-center gap-3">
          <MapPin className="text-blue-600 w-5 h-5" />
          <span className="text-gray-800">Mumbai</span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3">
          <Mail className="text-gray-500 w-5 h-5" />
          <a
            href="mailto:corecapmath@gmail.com"
            className="text-blue-600 hover:underline"
          >
            corecapmath@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

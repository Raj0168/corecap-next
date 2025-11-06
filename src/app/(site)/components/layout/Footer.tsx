"use client";

import React from "react";
import {
  CreditCard,
  Instagram,
  Facebook,
  Youtube,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const links = [
    "Privacy Policy",
    "Terms of Service",
    "Contact Us",
    "About Us",
    "Cancellation and Refund",
  ];

  return (
    <footer className="bg-[#0a2342] text-white border-t-4 border-yellow-400 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img
              loading="lazy"
              src="/logo-l.webp"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="hidden md:inline text-xl font-semibold tracking-wide text-yellow-400">
            CoreCap&nbsp;<span className="text-white">Maths</span>
          </span>
        </div>

        <div className="flex flex-wrap justify-start sm:justify-center gap-4">
          {links.map((text) => (
            <Link
              key={text}
              href={`/info/${text.toLowerCase().replace(/ /g, "-")}`}
              className="text-white hover:text-yellow-400 transition-colors"
            >
              {text}
            </Link>
          ))}
        </div>

        {/* Payment & Socials */}
        <div className="flex flex-col sm:items-end gap-2">
          {/* Payment */}
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-yellow-400" />
            <p className="text-white text-sm">
              Secure Payment with{" "}
              <a
                href="https://payu.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-yellow-400 hover:underline"
              >
                PayU <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </p>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white text-sm">Follow us:</span>
            <a
              href="https://www.instagram.com/corecapmaths/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-500 transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/share/corecapmaths"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-500 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-6 text-center text-gray-300 text-sm">
        © {new Date().getFullYear()} CorecapMaths. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

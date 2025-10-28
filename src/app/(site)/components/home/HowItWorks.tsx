"use client";

import React from "react";
import { Folder, Download, Clock } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Folder className="w-12 h-12 text-white" />,
      title: "Choose Chapter",
      desc: "Select the chapter you want to revise quickly.",
      bgColor: "bg-[#1A2A49]",
      lineColor: "bg-gradient-to-r from-[#1A2A49] to-[#FFD600]",
    },
    {
      icon: <Download className="w-12 h-12 text-white" />,
      title: "Download PDF",
      desc: "Get compact PDFs with only essential content.",
      bgColor: "bg-[#1A2A49]",
      lineColor: "bg-gradient-to-r from-[#FFD600] to-[#1A2A49]",
    },
    {
      icon: <Clock className="w-12 h-12 text-white" />,
      title: "Start Revising",
      desc: "Study anytime, anywhere at your convenience.",
      bgColor: "bg-[#1A2A49]",
    },
  ];

  return (
    <section className="bg-white px-6 py-16">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A2A49] mb-12 md:mb-16">
          How It Works
        </h2>

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center w-full lg:flex-1 relative"
            >
              {/* Card */}
              <div
                className={`p-8 rounded-xl shadow-xl flex flex-col items-center gap-4 w-full sm:w-3/4 md:w-2/3 lg:w-full hover:scale-[1.03] transform transition-transform duration-300 ${step.bgColor}`}
              >
                {step.icon}
                <h3 className="text-white font-bold text-lg md:text-xl">
                  {step.title}
                </h3>
                <p className="text-white text-base md:text-lg">{step.desc}</p>
              </div>

              {/* Horizontal connecting line (only on large screens) */}
              {idx < steps.length - 1 && (
                <div
                  className={`hidden lg:block absolute top-1/2 left-full h-1 w-24 ${step.lineColor} transform -translate-y-1/2 rounded`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical connecting lines */}
        <div className="lg:hidden mt-10 flex flex-col items-center gap-6">
          {steps.slice(0, -1).map((step, idx) => (
            <div
              key={idx}
              className={`h-1 w-24 sm:w-32 ${step.lineColor} rounded`}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

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
    <section className="bg-white px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A2A49] mb-16">
          How It Works
        </h2>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center md:flex-1 relative"
            >
              {/* Card */}
              <div
                className={`p-8 rounded-xl shadow-xl flex flex-col items-center gap-4 w-64 md:w-72 hover:scale-105 transform transition-transform ${step.bgColor}`}
              >
                {step.icon}
                <h3 className="text-white font-bold text-lg">{step.title}</h3>
                <p className="text-white text-lg">{step.desc}</p>
              </div>

              {/* Connecting Line
              {idx < steps.length - 1 && (
                <div
                  className={`hidden md:block absolute top-1/2 left-full h-1 w-24 ${step.lineColor} transform -translate-y-1/2 rounded`}
                ></div>
              )} */}
            </div>
          ))}
        </div>

        {/* Mobile: vertical lines */}
        {/* <div className="md:hidden mt-8 flex flex-col items-center gap-6">
          {steps.slice(0, -1).map((step, idx) => (
            <div
              key={idx}
              className={`h-1 w-32 ${step.lineColor} rounded`}
            ></div>
          ))}
        </div> */}
      </div>
    </section>
  );
};

export default HowItWorks;

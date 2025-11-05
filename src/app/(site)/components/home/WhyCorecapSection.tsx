"use client";

import React from "react";
import { CheckCircle, FileText, Lightbulb, Slash } from "lucide-react";

const WhyCorecapSection = () => {
  const items = [
    {
      icon: <CheckCircle className="text-yellow-400 w-10 h-10" />,
      text: "Only essential concepts",
    },
    {
      icon: <FileText className="text-yellow-400 w-10 h-10" />,
      text: "Must-do questions with solution, reasoning & approach",
    },
    {
      icon: <Lightbulb className="text-yellow-400 w-10 h-10" />,
      text: "Created by experienced educators",
    },
    {
      icon: <Slash className="text-yellow-400 w-10 h-10" />,
      text: "No distractions, just revision",
    },
  ];

  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A2A49] mb-10">
          Why CoreCap Maths?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          {items.map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="mb-2 flex justify-center">{item.icon}</div>
              <p className="text-[#1A2A49] font-semibold text-lg md:text-base">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyCorecapSection;

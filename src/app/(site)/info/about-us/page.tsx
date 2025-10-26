"use client";

import React from "react";

const AboutUs = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <h1 className="text-3xl font-semibold mb-3">About CorecapMaths</h1>
      <hr className="my-4 border-gray-300" />

      {/* Paragraphs */}
      <p className="text-gray-700 mb-4">
        At <strong>CorecapMaths</strong>, we believe that strong fundamentals
        are the secret to mastering mathematics—and we are here to help you
        build them from the ground up.
      </p>

      <p className="text-gray-700 mb-4">
        Our platform is built for students, teachers, and self-learners alike.
        With structured courses, visual explanations, chapter-wise breakdowns,
        and progress tracking, CorecapMaths gives you the tools you need to
        succeed at your own pace.
      </p>

      <p className="text-gray-700 mb-4">
        Thanks for choosing CorecapMaths. We’re glad to be a part of your
        learning journey!
      </p>

      {/* Subtitle */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-800">
          Let’s build strong maths foundations—together.
        </h2>
      </div>
    </div>
  );
};

export default AboutUs;

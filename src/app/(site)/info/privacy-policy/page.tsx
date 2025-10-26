import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <h1 className="text-3xl font-semibold mb-3">
        CorecapMaths Privacy Policy
      </h1>
      <hr className="my-4 border-gray-300" />

      {/* Intro paragraph */}
      <p className="text-gray-700 mb-4">
        At <strong>CorecapMaths</strong>, your learning journey is important—but
        so is your privacy. When you use our platform, you are trusting us with
        your data. This page is all about how we use it, protect it, and respect
        it. Think of it as our promise to keep your information as safe as your
        final exam answers.
      </p>

      {/* What We Collect */}
      <h2 className="text-xl font-semibold mt-6 mb-2">What We Collect</h2>
      <p className="text-gray-700 mb-4">
        <strong>Personal Details</strong>: When you sign up or enroll in a
        course, we collect your name, email, and other essentials—just enough to
        keep your account running smoothly and make sure you are getting the
        right content.
      </p>

      {/* Data Sharing */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Data Sharing</h2>
      <p className="text-gray-700 mb-4">
        We do <strong>not</strong> sell your data—ever. We only share your
        information with trusted services like payment processors (e.g.
        PayU) and cloud hosting providers (like AWS) that help us run
        CorecapMaths securely and efficiently.
      </p>

      {/* Security Measures */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Security Measures</h2>
      <p className="text-gray-700 mb-4">
        Your data is protected using top-tier technologies like{" "}
        <strong>NGINX</strong>, <strong>Certbot</strong>, and our{" "}
        <strong>Spring Boot backend</strong> hosted on secure{" "}
        <strong>AWS EC2</strong> servers. We also use HTTPS to make sure your
        communication is encrypted end-to-end.
      </p>

      {/* Your Rights */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Rights</h2>
      <p className="text-gray-700 mb-4">
        You are the boss of your data. Want to see what we have got? Update it?
        Delete it? Just email us at{" "}
        <a
          href="mailto:corecapmath@gmail.com"
          className="text-blue-600 hover:underline"
        >
          corecapmath@gmail.com
        </a>{" "}
        and we will handle it—no forms, no fuss.
      </p>

      {/* Children’s Privacy */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Children’s Privacy</h2>
      <p className="text-gray-700 mb-4">
        Our platform is intended for educational use by individuals generally
        above the age of 13. We do not knowingly collect personal information
        from children under 13 without parental or guardian consent. If you
        believe that a child has provided us with personal information without
        proper consent, please contact us immediately.
      </p>

      {/* Contact */}
      <div className="mt-4 text-gray-700">
        <p>
          Got more questions? Reach out anytime at{" "}
          <a
            href="mailto:corecapmath@gmail.com"
            className="text-blue-600 hover:underline"
          >
            corecapmath@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

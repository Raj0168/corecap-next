const TermsOfService = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <h1 className="text-3xl font-semibold mb-3">
        CorecapMaths Terms of Service
      </h1>
      <hr className="my-4 border-gray-300" />

      {/* Intro paragraph */}
      <p className="text-gray-700 mb-4">
        These terms are not meant to be scary—just a way to make sure everyone
        using <strong>CorecapMaths</strong> is on the same page. If you are
        exploring courses, purchasing content, or just poking around, you are
        agreeing to the terms below. Let us keep it fair and fun!
      </p>

      {/* Sections */}
      {[
        {
          title: "1. Acceptance of Terms",
          content:
            "By using CorecapMaths, you are agreeing to these terms. If something does not sit right with you, feel free to close the tab—no pressure, no judgment.",
        },
        {
          title: "2. Course Access & Purchases",
          content:
            "When you buy a course or a chapter, you get access through your account. We will confirm your order via email, and once it is processed, you will have full access. We reserve the right to cancel or refund an order if there is a technical hiccup or misuse of the platform.",
        },
        {
          title: "3. Refunds",
          content:
            "If you are not satisfied, you can request a refund within the window mentioned on our site. We believe in fairness—so just reach out, and we will work it out together.",
        },
        {
          title: "4. Payments",
          content:
            "All payments are processed securely using a trusted provider - PayU. Your card details are never stored on our servers. Prices are displayed clearly, and you will be charged exactly what you see at checkout.",
        },
        {
          title: "5. Account Usage",
          content:
            "You are responsible for keeping your login details safe. Please do not share your account or course materials—Corecap is built for individual learners, not group sharing.",
        },
        {
          title: "6. Intellectual Property",
          content:
            "All content on Corecap—including videos, notes, illustrations, and branding—is owned by us. Please do not copy, distribute, or resell our content. Respect the effort we put into every course we create.",
        },
        {
          title: "7. Limitations of Liability",
          content:
            "We do our best to keep everything running smoothly, but sometimes things go wrong. If the site is down or something breaks, we are not liable for any indirect losses. But we will always try to fix it fast.",
        },
        {
          title: "8. Governing Law",
          content:
            "These terms are governed by the laws of India. Any disputes will be resolved in accordance with local laws in a respectful and fair manner.",
        },
        {
          title: "9. Changes to These Terms",
          content:
            "We might update these terms occasionally to reflect changes in our platform. If we do, we will post the updated version here. By continuing to use CorecapMaths, you are agreeing to the latest version.",
        },
        {
          title: "10. Contact Us",
          content:
            "Got questions? Feedback? Reach out anytime—we are happy to chat! Email us at ",
          email: "corecapmath@gmail.com",
        },
      ].map((section, index) => (
        <div key={index} className="mt-6">
          <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
          <p className="text-gray-700">
            {section.content}
            {section.email && (
              <a
                href={`mailto:${section.email}`}
                className="text-blue-600 hover:underline"
              >
                {section.email}
              </a>
            )}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TermsOfService;

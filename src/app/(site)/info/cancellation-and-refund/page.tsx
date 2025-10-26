const CancellationAndRefund = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <h1 className="text-3xl font-semibold mb-3">
        CorecapMaths Cancellation & Refund Policy
      </h1>
      <hr className="my-4 border-gray-300" />

      {/* Intro paragraph */}
      <p className="text-gray-700 mb-4">
        At <strong>CorecapMaths</strong>, we strive to deliver a high-quality
        learning experience. However, we understand that circumstances may
        change. This policy outlines how cancellations and refunds are handled
        fairly and transparently.
      </p>

      {/* 7-Day Refund Guarantee */}
      <h2 className="text-xl font-semibold mt-6 mb-2">
        7-Day Refund Guarantee
      </h2>
      <p className="text-gray-700 mb-4">
        We offer a full refund if a cancellation request is made within{" "}
        <strong>7 days</strong> of your original purchase date, provided the
        course or service has not been extensively accessed or completed. This
        guarantee is our way of ensuring that your investment in learning is
        risk-free.
      </p>

      {/* Cancellation Policy */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Cancellation Policy</h2>
      <p className="text-gray-700 mb-4">
        You can cancel your enrollment or subscription at any time through your
        CorecapMaths account or by contacting our support team. Cancellations
        made after 7 days will not be eligible for a refund unless explicitly
        stated otherwise in a promotional offer or agreement.
      </p>

      {/* Refund Eligibility */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Refund Eligibility</h2>
      <p className="text-gray-700 mb-2">
        To be eligible for a refund, the following conditions must be met:
      </p>
      <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
        <li>The request must be made within 7 days of purchase.</li>
        <li>
          You must not have completed more than 20% of the course or accessed
          most of the material.
        </li>
        <li>
          Courses purchased under special discounts or promotions are
          non-refundable.
        </li>
      </ul>

      {/* Refund Process */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Refund Process</h2>
      <p className="text-gray-700 mb-4">
        If your refund request is approved, the amount will be credited back to
        your original payment method within 7–10 business days. Please note that
        the processing time may vary depending on your payment provider or bank.
      </p>

      {/* Exceptions */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Exceptions</h2>
      <p className="text-gray-700 mb-4">
        CorecapMaths reserves the right to reject refund requests that do not
        comply with this policy or in cases of misuse. All refund-related
        decisions made by the CorecapMaths support team are final and binding.
      </p>

      {/* Contact */}
      <div className="mt-4 text-gray-700">
        <p>
          For any concerns or refund-related queries, feel free to contact us at{" "}
          <a
            href="mailto:corecapmath@gmail.com"
            className="text-blue-600 hover:underline"
          >
            corecapmath@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default CancellationAndRefund;

"use client";
export default function GoogleButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  function handleGoogle() {
    window.location.href = "/api/auth/oauth/google/start";
  }

  return (
    <button
      type="button"
      onClick={handleGoogle}
      className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      {label}
    </button>
  );
}

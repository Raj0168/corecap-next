import AuthCard from "../../components/auth/AuthCard";
import ForgotForm from "../../components/auth/ForgotForm";

export default function ResetPage() {
  return (
    <AuthCard title="Reset Password">
      <p className="text-sm text-gray-500 text-center mb-4">
        Forgot your password? We'll help you recover access.
      </p>
      <ForgotForm />
    </AuthCard>
  );
}

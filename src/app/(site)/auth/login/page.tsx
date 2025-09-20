import AuthCard from "../../components/auth/AuthCard";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard title="Login to Your Account">
      <p className="text-sm text-gray-500 text-center mb-4">
        Welcome back — access your courses, track progress, and continue
        learning.
      </p>
      <LoginForm />
    </AuthCard>
  );
}

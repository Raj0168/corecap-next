// app/auth/login/page.tsx
import AuthCard from "../../components/auth/AuthCard";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome Back :)"
      imageUrl="/login-image.webp" 
    >
      <p className="text-gray-500 text-center mb-6">
        To keep connected, please login with your personal info.
      </p>
      <LoginForm />
    </AuthCard>
  );
}

import AuthCard from "../../components/auth/AuthCard";
import RegisterForm from "../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard title="Create an Account" imageUrl="/image-1.webp" >
      <p className="text-sm text-gray-500 text-center mb-4">
        Join our community and start learning top-rated courses.
      </p>
      <RegisterForm />
    </AuthCard>
  );
}

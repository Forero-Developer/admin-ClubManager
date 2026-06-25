import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin } from "./hooks/useLogin";

// Esquema de validación del formulario
const loginSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { token, setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  // Si ya hay token, redirigir
  if (token) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-card border border-border">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
            SA
          </div>
          <h1 className="text-2xl font-bold text-text">Inicia Sesión</h1>
          <p className="text-text-secondary mt-2">
            Panel de Administración Central
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">
              Correo Electrónico
            </label>
            <Input
              type="email"
              placeholder="admin@sportclub.com"
              disabled={loginMutation.isPending}
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Contraseña</label>
            <Input
              type="password"
              placeholder="••••••••"
              disabled={loginMutation.isPending}
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={loginMutation.isPending}
            >
              Entrar al Panel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

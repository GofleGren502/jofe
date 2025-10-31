import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type LoginForm = {
  username: string;
  password: string;
};

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("language") === "kk" ? "Қате" : "Ошибка",
        description: error.message || (t("language") === "kk" ? "Кіру сәтсіз аяқталды" : "Вход не удался"),
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Baby className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">KinderCare</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {t("language") === "kk" ? "Жүйеге кіру" : "Вход в систему"}
            </CardTitle>
            <CardDescription>
              {t("language") === "kk" 
                ? "Өз есептік жазбаңызға кіру үшін деректерді енгізіңіз"
                : "Введите данные для входа в свой аккаунт"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  {t("language") === "kk" ? "Электрондық пошта" : "Электронная почта"}
                </Label>
                <Input
                  id="username"
                  type="email"
                  placeholder={t("language") === "kk" ? "your@email.kz" : "your@email.kz"}
                  {...register("username", { 
                    required: t("language") === "kk" ? "Электрондық пошта міндетті" : "Электронная почта обязательна" 
                  })}
                  disabled={loginMutation.isPending}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("language") === "kk" ? "Құпия сөз" : "Пароль"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { 
                    required: t("language") === "kk" ? "Құпия сөз міндетті" : "Пароль обязателен" 
                  })}
                  disabled={loginMutation.isPending}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending 
                  ? (t("language") === "kk" ? "Күте тұрыңыз..." : "Загрузка...")
                  : (t("language") === "kk" ? "Кіру" : "Войти")
                }
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                {t("language") === "kk" 
                  ? "Демо тіркелгілер:"
                  : "Демо аккаунты:"
                }
              </p>
              <p className="mt-2">
                {t("language") === "kk" ? "Ата-ана" : "Родитель"}: parent@demo.kz / demo123
              </p>
              <p>
                {t("language") === "kk" ? "Тәрбиеші" : "Воспитатель"}: teacher@demo.kz / demo123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

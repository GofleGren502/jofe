import { Button } from "@/components/ui/button";
import { Baby, Video, MessageSquare, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  const { t } = useTranslation();

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
            <Button asChild data-testid="button-login">
              <a href="/api/login">{t("login")}</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t("language") === "kk" 
              ? "Балаларыңыздың бақытты күндерін бақылаңыз"
              : "Прозрачность и безопасность для ваших детей"
            }
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t("language") === "kk"
              ? "Заманауи платформа балабақшалар мен отбасылар үшін: видеобақылау, онлайн төлемдер, тәрбиешілермен чат және толық ақпарат"
              : "Современная платформа для детских садов и семей с видеонаблюдением, онлайн-платежами, чатом с воспитателями и полной прозрачностью"
            }
          </p>
          <Button size="lg" asChild data-testid="button-get-started">
            <a href="/api/login">{t("login")}</a>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-card border rounded-lg p-6 text-center hover-elevate transition-shadow">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">
              {t("language") === "kk" ? "Видеобақылау" : "Видеонаблюдение"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("language") === "kk"
                ? "Балаларыңызды тікелей эфирде қараңыз"
                : "Наблюдайте за детьми в реальном времени"
              }
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 text-center hover-elevate transition-shadow">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-500/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">
              {t("language") === "kk" ? "Тәрбиешімен чат" : "Чат с воспитателем"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("language") === "kk"
                ? "Нақты уақытта хабарласу"
                : "Общение в реальном времени"
              }
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 text-center hover-elevate transition-shadow">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">
              {t("language") === "kk" ? "Онлайн төлемдер" : "Онлайн-платежи"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("language") === "kk"
                ? "Қауіпсіз және жылдам төлемдер"
                : "Безопасные и быстрые оплаты"
              }
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 text-center hover-elevate transition-shadow">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Baby className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">
              {t("language") === "kk" ? "Баланың күні" : "День ребёнка"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("language") === "kk"
                ? "Тамақтану, ұйқы, белсенділік - барлық мәліметтер"
                : "Питание, сон, активность - вся информация"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 KinderCare. {t("language") === "kk" ? "Барлық құқықтар қорғалған" : "Все права защищены"}.</p>
        </div>
      </footer>
    </div>
  );
}

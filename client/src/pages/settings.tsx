import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Monitor, Users, LogOut, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { TrustedContact } from "@shared/schema";

export default function Settings() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const { data: trustedContacts } = useQuery<TrustedContact[]>({
    queryKey: ["/api/trusted-contacts"],
  });
  
  const { data: sessions } = useQuery<any[]>({
    queryKey: ["/api/sessions"],
  });
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" data-testid="text-settings-title">
          {t("settings")}
        </h1>
      </div>
      
      <div className="space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("language")}
            </CardTitle>
            <CardDescription>
              {currentLanguage === "kk" 
                ? "Интерфейс тілін таңдаңыз"
                : "Выберите язык интерфейса"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">{t("language")}</Label>
              <Select 
                value={currentLanguage} 
                onValueChange={(value: "ru" | "kk") => changeLanguage(value)}
              >
                <SelectTrigger id="language" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="kk">Қазақша</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Timezone Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {t("timezone")}
            </CardTitle>
            <CardDescription>
              {currentLanguage === "kk"
                ? "Барлық уақыт белгілері Asia/Almaty уақыт белдеуінде көрсетіледі"
                : "Все временные метки отображаются в часовом поясе Asia/Almaty"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>{t("timezone")}</Label>
              <Input value="Asia/Almaty" disabled className="bg-muted" />
            </div>
          </CardContent>
        </Card>
        
        {/* Trusted Contacts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("trustedContacts")}
                </CardTitle>
                <CardDescription>
                  {currentLanguage === "kk"
                    ? "Балаңызды алуға рұқсат етілген адамдар"
                    : "Люди, которым разрешено забирать вашего ребёнка"
                  }
                </CardDescription>
              </div>
              <Button size="sm" data-testid="button-add-trusted-contact">
                <Plus className="h-4 w-4 mr-2" />
                {t("add")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {trustedContacts && trustedContacts.length > 0 ? (
              <div className="space-y-3">
                {trustedContacts.map((contact) => (
                  <Card key={contact.id} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{contact.fullName}</h4>
                            {!contact.isActive && (
                              <Badge variant="secondary" className="text-xs">
                                {t("inactive")}
                              </Badge>
                            )}
                          </div>
                          {contact.relationship && (
                            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          )}
                          {contact.phone && (
                            <p className="text-sm text-muted-foreground mt-1">{contact.phone}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="flex-shrink-0"
                          data-testid={`button-delete-contact-${contact.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t("noData")}</p>
                <Button className="mt-4" data-testid="button-add-first-contact">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addTrustedContact")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  {t("activeSessions")}
                </CardTitle>
                <CardDescription>
                  {currentLanguage === "kk"
                    ? "Сіздің белсенді құрылғыларыңыз"
                    : "Ваши активные устройства"
                  }
                </CardDescription>
              </div>
              {sessions && sessions.length > 1 && (
                <Button variant="destructive" size="sm" data-testid="button-logout-all">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logoutAll")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">
                          {currentLanguage === "kk" ? "Ағымдағы құрылғы" : "Текущее устройство"}
                        </h4>
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-300">
                          {currentLanguage === "kk" ? "Белсенді" : "Активно"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Chrome on Windows • Almaty, Kazakhstan
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentLanguage === "kk" ? "Соңғы белсенділік" : "Последняя активность"}: {currentLanguage === "kk" ? "дәл қазір" : "только что"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

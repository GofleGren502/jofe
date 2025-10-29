import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Baby, CreditCard, MessageSquare, TrendingUp, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDateInAlmaty, getNowInAlmaty } from "@/lib/formatters";
import { useState } from "react";
import type { Child, Invoice, Message } from "@shared/schema";

function MiniCalendar() {
  const { currentLanguage } = useLanguage();
  const [currentDate, setCurrentDate] = useState(getNowInAlmaty());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = currentLanguage === "kk" 
    ? ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"]
    : ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  
  const dayNames = currentLanguage === "kk"
    ? ["Жс", "Дс", "Сс", "Ср", "Бс", "Жм", "Сн"]
    : ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === currentDate.getDate() && 
      currentDate.getMonth() === getNowInAlmaty().getMonth() &&
      currentDate.getFullYear() === getNowInAlmaty().getFullYear();
    
    days.push(
      <button
        key={day}
        className={`h-8 flex items-center justify-center rounded-md text-sm transition-colors hover-elevate ${
          isToday ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"
        }`}
        data-testid={`calendar-day-${day}`}
      >
        {day}
      </button>
    );
  }
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={previousMonth}
            data-testid="button-calendar-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={nextMonth}
            data-testid="button-calendar-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div 
            key={day} 
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  // Fetch data for dashboard cards
  const { data: children, isLoading: loadingChildren } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });
  
  const { data: invoices, isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });
  
  const { data: messages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", "recent"],
  });
  
  // Get today's child activity (mock for now)
  const todayChild = children?.[0];
  
  // Get pending invoices
  const pendingInvoices = invoices?.filter(inv => inv.status === "pending") || [];
  const totalDue = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  
  // Get unread messages
  const unreadMessages = messages?.filter(m => !m.readReceipts?.length) || [];
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" data-testid="text-dashboard-title">
          {t("dashboard")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {formatDateInAlmaty(getNowInAlmaty(), "EEEE, d MMMM yyyy", currentLanguage)}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Your Child Today */}
        <Card className="hover:shadow-lg transition-shadow" data-testid="card-child-today">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">
                {t("yourChildToday")}
              </CardTitle>
              {todayChild && (
                <CardDescription>
                  {todayChild.firstName} {todayChild.lastName}
                </CardDescription>
              )}
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Baby className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingChildren ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : todayChild ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {t("checkIn")}: 08:30
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentLanguage === "kk" 
                    ? "Тамақ: 100%, Ұйқы: 2 сағ, Белсенділік: Ойын"
                    : "Питание: 100%, Сон: 2ч, Активность: Игры"
                  }
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="text-sm font-medium group" asChild>
              <Link href={todayChild ? `/children/${todayChild.id}/day` : "/children"} data-testid="link-view-child-day">
                {t("viewDetails")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Card 2: Payments */}
        <Card className="hover:shadow-lg transition-shadow" data-testid="card-payments">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">
                {t("paymentsCard")}
              </CardTitle>
              <CardDescription>
                {pendingInvoices.length > 0 
                  ? `${pendingInvoices.length} ${currentLanguage === "kk" ? "шот" : "счетов"}`
                  : currentLanguage === "kk" ? "Барлығы төленді" : "Всё оплачено"
                }
              </CardDescription>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingInvoices ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : pendingInvoices.length > 0 ? (
              <div>
                <p className="text-3xl font-bold">{formatCurrency(totalDue, currentLanguage)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentLanguage === "kk" ? "Төлеуге" : "К оплате"}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                {currentLanguage === "kk" ? "Төлемдер жоқ" : "Нет платежей"}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="text-sm font-medium group" asChild>
              <Link href="/billing" data-testid="link-view-billing">
                {t("viewDetails")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Card 3: Messages */}
        <Card className="hover:shadow-lg transition-shadow" data-testid="card-messages">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">
                {t("messagesCard")}
              </CardTitle>
              <CardDescription>
                {unreadMessages.length > 0
                  ? `${unreadMessages.length} ${currentLanguage === "kk" ? "жаңа" : "новых"}`
                  : currentLanguage === "kk" ? "Жаңа хабарламалар жоқ" : "Нет новых сообщений"
                }
              </CardDescription>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingMessages ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm line-clamp-2">{messages[0].content}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateInAlmaty(messages[0].createdAt, "HH:mm", currentLanguage)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="text-sm font-medium group" asChild>
              <Link href="/chat" data-testid="link-view-chat">
                {t("viewDetails")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Card 4: Analytics/Overview */}
        <Card className="hover:shadow-lg transition-shadow" data-testid="card-analytics">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">
                {currentLanguage === "kk" ? "Шолу" : "Обзор"}
              </CardTitle>
              <CardDescription>
                {currentLanguage === "kk" ? "Негізгі көрсеткіштер" : "Ключевые показатели"}
              </CardDescription>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {currentLanguage === "kk" ? "Қатысу" : "Посещаемость"}
                </span>
                <span className="font-semibold">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {currentLanguage === "kk" ? "Активті күндер" : "Активных дней"}
                </span>
                <span className="font-semibold">18/20</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="text-sm font-medium group" asChild>
              <Link href="/children" data-testid="link-view-children">
                {t("viewDetails")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Mini Calendar */}
      <div className="max-w-sm">
        <MiniCalendar />
      </div>
    </div>
  );
}

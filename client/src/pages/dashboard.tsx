import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Baby, CreditCard, MessageSquare, TrendingUp, ArrowRight, ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDateInAlmaty, getNowInAlmaty } from "@/lib/formatters";
import { useState } from "react";
import type { Child, Invoice, Message, Event } from "@shared/schema";

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
  
  // Fetch upcoming events
  const { data: events, isLoading: loadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Get today's child activity (mock for now)
  const todayChild = children?.[0];
  
  // Get pending invoices
  const pendingInvoices = invoices?.filter(inv => inv.status === "pending") || [];
  const totalDue = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  
  // Get unread messages
  const unreadMessages = messages?.filter(m => !m.readReceipts?.length) || [];
  
  // Get upcoming events (next 5)
  const upcomingEvents = events?.filter(event => new Date(event.startDate) >= new Date()).slice(0, 5) || [];
  
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
      
      {/* Calendar and Events Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <MiniCalendar />
        </div>
        
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {currentLanguage === "kk" ? "Болашақ оқиғалар" : "Предстоящие события"}
            </CardTitle>
            <CardDescription>
              {currentLanguage === "kk" 
                ? "Балабақшаның жоспарланған іс-шаралары"
                : "Запланированные мероприятия детского сада"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const eventTypeLabels: Record<string, { ru: string; kk: string }> = {
                    holiday: { ru: "Праздник", kk: "Мереке" },
                    event: { ru: "Мероприятие", kk: "Іс-шара" },
                    activity: { ru: "Активность", kk: "Белсенділік" },
                    parent_meeting: { ru: "Родительское собрание", kk: "Ата-ана жиналысы" },
                    excursion: { ru: "Экскурсия", kk: "Экскурсия" },
                  };
                  
                  const eventTypeColors: Record<string, string> = {
                    holiday: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                    event: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                    activity: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                    parent_meeting: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                    excursion: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
                  };
                  
                  return (
                    <div key={event.id} className="border-l-2 border-primary pl-4 py-2" data-testid={`event-${event.id}`}>
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge className={`text-xs ${eventTypeColors[event.eventType] || ""}`}>
                          {eventTypeLabels[event.eventType]?.[currentLanguage] || event.eventType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDateInAlmaty(event.startDate, "d MMM, HH:mm", currentLanguage)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">
                  {currentLanguage === "kk" 
                    ? "Жақын арада жоспарланған оқиғалар жоқ"
                    : "Нет запланированных событий"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

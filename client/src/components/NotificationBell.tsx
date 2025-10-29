import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";
import { formatRelativeTime } from "@/lib/formatters";
import { useLanguage } from "@/hooks/useLanguage";

export function NotificationBell() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const paymentNotifications = notifications.filter(n => n.type === "payment");
  const messageNotifications = notifications.filter(n => n.type === "message");
  const eventNotifications = notifications.filter(n => n.type === "event");
  
  const renderNotificationItem = (notification: Notification) => {
    const isUrgent = notification.priority === "urgent";
    
    return (
      <div
        key={notification.id}
        className={`p-4 hover-elevate transition-colors border-b last:border-b-0 ${
          !notification.isRead ? "border-l-4 border-l-primary" : ""
        } ${isUrgent ? "bg-destructive/5" : ""}`}
        data-testid={`notification-${notification.id}`}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatRelativeTime(notification.createdAt, currentLanguage)}
            </p>
          </div>
          {isUrgent && (
            <Badge variant="destructive" className="text-xs">
              {t("important")}
            </Badge>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
          aria-label={t("notifications")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium"
              data-testid="notification-badge"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-96 p-0"
        data-testid="notifications-dropdown"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">{t("notifications")}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8"
            data-testid="button-mark-all-read"
          >
            {t("markAllRead")}
          </Button>
        </div>
        
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="payments" data-testid="tab-notifications-payments">
              {t("payments")}
            </TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-notifications-messages">
              {t("messagesCard")}
            </TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-notifications-events">
              {t("events")}
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px]">
            <TabsContent value="payments" className="m-0">
              {paymentNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  {t("noData")}
                </div>
              ) : (
                paymentNotifications.map(renderNotificationItem)
              )}
            </TabsContent>
            
            <TabsContent value="messages" className="m-0">
              {messageNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  {t("noData")}
                </div>
              ) : (
                messageNotifications.map(renderNotificationItem)
              )}
            </TabsContent>
            
            <TabsContent value="events" className="m-0">
              {eventNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  {t("noData")}
                </div>
              ) : (
                eventNotifications.map(renderNotificationItem)
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  CreditCard,
  MessageSquare,
  Settings,
  Baby,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const menuItems = [
    {
      title: t("dashboard"),
      icon: LayoutDashboard,
      url: "/",
      testId: "link-dashboard",
    },
    {
      title: t("children"),
      icon: Baby,
      url: "/children",
      testId: "link-children",
    },
    {
      title: t("staff"),
      icon: UsersRound,
      url: "/staff",
      testId: "link-staff",
    },
    {
      title: t("payments"),
      icon: CreditCard,
      url: "/billing",
      testId: "link-payments",
    },
    {
      title: t("chats"),
      icon: MessageSquare,
      url: "/chat",
      testId: "link-chats",
    },
    {
      title: t("settings"),
      icon: Settings,
      url: "/settings",
      testId: "link-settings",
    },
  ];

  const getInitials = (user: typeof user) => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return null;
    
    const roleColors: Record<string, string> = {
      parent: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      teacher: "bg-green-500/10 text-green-700 dark:text-green-300",
      admin: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
      network_owner: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    };
    
    return (
      <Badge 
        variant="secondary" 
        className={`text-xs ${roleColors[role] || ""}`}
      >
        {t(role === "network_owner" ? "networkOwner" : role === "admin" ? "adminRole" : role)}
      </Badge>
    );
  };

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarHeader className="p-4 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-2 h-auto hover-elevate"
              data-testid="button-user-menu"
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-semibold truncate">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || t("loading")}
                  </p>
                  {user?.currentRole && getRoleBadge(user.currentRole)}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" data-testid="link-profile-settings">
                <Settings className="mr-2 h-4 w-4" />
                {t("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/api/logout" data-testid="button-logout">
                {t("logout")}
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== "/" && location.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={item.testId}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

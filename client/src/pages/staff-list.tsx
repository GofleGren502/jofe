import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Staff, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function StaffList() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: staff, isLoading } = useQuery<(Staff & { user: User })[]>({
    queryKey: ["/api/staff"],
  });
  
  const filteredStaff = staff?.filter(member => {
    if (!searchQuery) return true;
    const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });
  
  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "S";
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "on_leave": return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-staff-title">
            {t("staff")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredStaff?.length || 0} {currentLanguage === "kk" ? "қызметкер" : "сотрудников"}
          </p>
        </div>
        <Button data-testid="button-add-staff">
          <Plus className="h-4 w-4 mr-2" />
          {t("addStaff")}
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={currentLanguage === "kk" ? "Қызметкерлерді іздеу" : "Поиск сотрудников"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-staff"
        />
      </div>
      
      {/* Staff Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredStaff && filteredStaff.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => (
            <Card 
              key={member.id} 
              className="hover-elevate transition-shadow"
              data-testid={`card-staff-${member.id}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Avatar className="w-16 h-16 rounded-lg">
                    <AvatarImage src={member.user.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary rounded-lg">
                      {getInitials(member.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold truncate">
                      {member.user.firstName} {member.user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {t(member.position || "teacher")}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`mt-2 text-xs ${getStatusColor(member.status)}`}
                      data-testid={`badge-status-${member.id}`}
                    >
                      {t(member.status)}
                    </Badge>
                  </div>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span className="truncate">{member.phone}</span>
                  </div>
                )}
                {member.user.email && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{member.user.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("noData")}</h3>
          <p className="text-sm text-muted-foreground">
            {currentLanguage === "kk" 
              ? "Қызметкерлер табылмады"
              : "Сотрудники не найдены"
            }
          </p>
        </Card>
      )}
    </div>
  );
}

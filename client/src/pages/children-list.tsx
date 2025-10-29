import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, AlertCircle, Pill, FileText } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Child, ChildAllergy, ChildMedication, ChildDocument } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function ChildrenList() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  
  const { data: children, isLoading } = useQuery<(Child & {
    allergies?: ChildAllergy[];
    medications?: ChildMedication[];
    documents?: ChildDocument[];
  })[]>({
    queryKey: ["/api/children"],
  });
  
  const filteredChildren = children?.filter(child => {
    const matchesSearch = searchQuery === "" || 
      `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === "all" || child.groupId.toString() === selectedGroup;
    return matchesSearch && matchesGroup;
  });
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };
  
  const hasExpiringDocs = (documents?: ChildDocument[]) => {
    if (!documents) return false;
    return documents.some(doc => doc.status === "expiring_soon" || doc.status === "expired");
  };
  
  const hasAllergies = (allergies?: ChildAllergy[]) => {
    return allergies && allergies.length > 0;
  };
  
  const hasMedications = (medications?: ChildMedication[]) => {
    return medications && medications.some(m => m.isActive);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-children-title">
            {t("children")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredChildren?.length || 0} {currentLanguage === "kk" ? "бала" : "детей"}
          </p>
        </div>
        <Button data-testid="button-add-child">
          <Plus className="h-4 w-4 mr-2" />
          {t("addChild")}
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchChildren")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-children"
          />
        </div>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-[200px]" data-testid="select-group-filter">
            <SelectValue placeholder={t("filterByGroup")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allGroups")}</SelectItem>
            <SelectItem value="1">{currentLanguage === "kk" ? "Қарлығаш топ" : "Группа Ласточка"}</SelectItem>
            <SelectItem value="2">{currentLanguage === "kk" ? "Күн топ" : "Группа Солнышко"}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Children Grid */}
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
      ) : filteredChildren && filteredChildren.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChildren.map((child) => (
            <Link 
              key={child.id} 
              href={`/children/${child.id}/day`}
            >
              <Card 
                className="p-4 hover-elevate transition-shadow cursor-pointer"
                data-testid={`card-child-${child.id}`}
              >
                <div className="flex gap-4">
                  <Avatar className="w-16 h-16 rounded-lg">
                    <AvatarImage src={child.photoUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary rounded-lg">
                      {getInitials(child.firstName, child.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold truncate">
                        {child.firstName} {child.lastName}
                      </h3>
                      <div className="flex gap-1 flex-shrink-0">
                        {hasAllergies(child.allergies) && (
                          <div 
                            className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center"
                            title={t("allergies")}
                            data-testid={`badge-allergy-${child.id}`}
                          >
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                        )}
                        {hasMedications(child.medications) && (
                          <div 
                            className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center"
                            title={t("medications")}
                            data-testid={`badge-medication-${child.id}`}
                          >
                            <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        {hasExpiringDocs(child.documents) && (
                          <div 
                            className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center"
                            title={t("documentExpiring")}
                            data-testid={`badge-document-${child.id}`}
                          >
                            <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentLanguage === "kk" ? "Қарлығаш топ" : "Группа Ласточка"}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className="mt-2 text-xs"
                      data-testid={`badge-status-${child.id}`}
                    >
                      {child.status === "active" ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("noData")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {currentLanguage === "kk" 
              ? "Балалар табылмады. Іздеу параметрлерін өзгертіп көріңіз."
              : "Дети не найдены. Попробуйте изменить параметры поиска."
            }
          </p>
        </Card>
      )}
    </div>
  );
}

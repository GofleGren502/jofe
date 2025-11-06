import { useParams, useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  Clock,
  Utensils,
  Moon,
  Activity,
  AlertCircle,
  Pill,
  FileText,
  Upload,
  Download,
  CreditCard,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { 
  Child, 
  DailyActivity, 
  ChildHealth, 
  ChildAllergy, 
  ChildMedication,
  ChildDocument,
  Invoice,
  AttendanceRecord,
  ExtraClass,
  ExtraClassEnrollment,
  ExtraClassAttendance,
  ExtraClassPerformance,
} from "@shared/schema";
import { formatTimeInAlmaty, formatDateInAlmaty, formatDuration, formatCurrency } from "@/lib/formatters";

export default function ChildProfile() {
  const { id, tab = "day" } = useParams<{ id: string; tab: string }>();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  const { data: child, isLoading } = useQuery<Child>({
    queryKey: ["/api/children", id],
  });
  
  const { data: dailyActivities } = useQuery<DailyActivity[]>({
    queryKey: ["/api/children", id, "activities"],
  });
  
  const { data: healthData } = useQuery<ChildHealth & {
    allergies: ChildAllergy[];
    medications: ChildMedication[];
  }>({
    queryKey: ["/api/children", id, "health"],
  });
  
  const { data: documents } = useQuery<ChildDocument[]>({
    queryKey: ["/api/children", id, "documents"],
  });
  
  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["/api/children", id, "invoices"],
  });
  
  const { data: attendance } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/children", id, "attendance"],
  });
  
  const { data: extraClasses } = useQuery<Array<{
    enrollment: ExtraClassEnrollment;
    class: ExtraClass | null;
  }>>({
    queryKey: ["/api/children", id, "extra-classes"],
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  if (!child) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">{t("noData")}</h3>
        </Card>
      </div>
    );
  }
  
  const getInitials = () => {
    return `${child.firstName[0]}${child.lastName[0]}`.toUpperCase();
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sleep": return <Moon className="h-4 w-4" />;
      case "meal": return <Utensils className="h-4 w-4" />;
      case "activity": return <Activity className="h-4 w-4" />;
      case "medication": return <Pill className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  const getDocumentStatusColor = (status: string | null) => {
    switch (status) {
      case "valid": return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "expiring_soon": return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
      case "expired": return "bg-red-500/10 text-red-700 dark:text-red-300";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        onClick={() => setLocation("/children")}
        data-testid="button-back-to-children"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("children")}
      </Button>
      
      {/* Child Header Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24 rounded-lg">
              <AvatarImage src={child.photoUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold" data-testid="text-child-name">
                    {child.firstName} {child.lastName}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentLanguage === "kk" ? "Қарлығаш топ" : "Группа Ласточка"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {healthData?.allergies && healthData.allergies.length > 0 && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {t("allergies")}
                    </Badge>
                  )}
                  {healthData?.medications && healthData.medications.some(m => m.isActive) && (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      <Pill className="h-3 w-3 mr-1" />
                      {t("medications")}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">{currentLanguage === "kk" ? "Жас" : "Возраст"}</p>
                  <p className="font-medium">
                    {new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} {currentLanguage === "kk" ? "жас" : "лет"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{currentLanguage === "kk" ? "Күйі" : "Статус"}</p>
                  <p className="font-medium">{child.status === "active" ? t("active") : t("inactive")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{currentLanguage === "kk" ? "Тіркелді" : "Зачислен"}</p>
                  <p className="font-medium">
                    {child.enrollmentDate ? formatDateInAlmaty(child.enrollmentDate, "dd.MM.yyyy", currentLanguage) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setLocation(`/children/${id}/${v}`)}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="day" data-testid="tab-day">
            <Clock className="h-4 w-4 mr-2" />
            {t("day")}
          </TabsTrigger>
          <TabsTrigger value="attendance" data-testid="tab-attendance">
            <Calendar className="h-4 w-4 mr-2" />
            {currentLanguage === "kk" ? "Қатысу" : "Посещаемость"}
          </TabsTrigger>
          <TabsTrigger value="health" data-testid="tab-health">
            <AlertCircle className="h-4 w-4 mr-2" />
            {t("health")}
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">
            <FileText className="h-4 w-4 mr-2" />
            {t("documents")}
          </TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">
            <CreditCard className="h-4 w-4 mr-2" />
            {t("billing")}
          </TabsTrigger>
        </TabsList>
        
        {/* Day Tab */}
        <TabsContent value="day">
          <Card>
            <CardHeader>
              <CardTitle>{t("day")}</CardTitle>
              <CardDescription>
                {formatDateInAlmaty(new Date(), "EEEE, d MMMM", currentLanguage)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyActivities && dailyActivities.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="relative space-y-4">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                    {dailyActivities.map((activity) => (
                      <div key={activity.id} className="relative pl-12" data-testid={`activity-${activity.id}`}>
                        <div className="absolute left-2 top-2 w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center">
                          {getActivityIcon(activity.activityType)}
                        </div>
                        <Card className="hover-elevate">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{t(activity.activityType)}</span>
                                  {activity.activityType === "meal" && activity.appetite !== null && (
                                    <Badge variant="secondary" className="text-xs">
                                      {t("appetite")}: {activity.appetite}%
                                    </Badge>
                                  )}
                                  {activity.activityType === "sleep" && activity.duration && (
                                    <Badge variant="secondary" className="text-xs">
                                      {formatDuration(activity.duration, currentLanguage)}
                                    </Badge>
                                  )}
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground font-mono">
                                {formatTimeInAlmaty(activity.time, "HH:mm", currentLanguage)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("noData")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <div className="space-y-6">
            {/* Regular Attendance */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentLanguage === "kk" ? "Балабақшаға қатысу" : "Посещаемость детского сада"}
                </CardTitle>
                <CardDescription>
                  {currentLanguage === "kk" ? "Соңғы 30 күн" : "Последние 30 дней"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attendance && attendance.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {attendance.filter(a => a.checkInTime).length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentLanguage === "kk" ? "Қатысқан" : "Посетил"}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {Math.round((attendance.filter(a => a.checkInTime).length / attendance.length) * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentLanguage === "kk" ? "Қатысу" : "Процент"}
                        </p>
                      </div>
                    </div>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {attendance.slice(0, 10).map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`attendance-${record.id}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${record.checkInTime ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <div>
                                <p className="font-medium">{formatDateInAlmaty(record.date, "dd MMMM yyyy", currentLanguage)}</p>
                                {record.checkInTime && record.checkOutTime && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatTimeInAlmaty(record.checkInTime, "HH:mm", currentLanguage)} - {formatTimeInAlmaty(record.checkOutTime, "HH:mm", currentLanguage)}
                                  </p>
                                )}
                              </div>
                            </div>
                            {record.checkInTime && (
                              <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                {currentLanguage === "kk" ? "✓ Болды" : "✓ Присутствовал"}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">{t("noData")}</p>
                )}
              </CardContent>
            </Card>

            {/* Extra Classes */}
            {extraClasses && extraClasses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentLanguage === "kk" ? "Қосымша сабақтар" : "Дополнительные занятия"}
                  </CardTitle>
                  <CardDescription>
                    {currentLanguage === "kk" ? "Қатысу және үлгерім" : "Посещаемость и успеваемость"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {extraClasses.map(({ enrollment, class: extraClass }) => {
                      if (!extraClass) return null;
                      
                      const { data: classAttendance } = useQuery<ExtraClassAttendance[]>({
                        queryKey: ["/api/enrollments", enrollment.id, "attendance"],
                      });
                      
                      const { data: performance } = useQuery<ExtraClassPerformance[]>({
                        queryKey: ["/api/enrollments", enrollment.id, "performance"],
                      });
                      
                      const attendanceRate = classAttendance && classAttendance.length > 0
                        ? Math.round((classAttendance.filter(a => a.attended).length / classAttendance.length) * 100)
                        : 0;
                      
                      const latestPerformance = performance?.[0];
                      
                      return (
                        <Card key={enrollment.id} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">{extraClass.name}</h4>
                                <p className="text-sm text-muted-foreground">{extraClass.schedule}</p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {extraClass.classType === "english" ? (currentLanguage === "kk" ? "Ағылшын" : "Английский") : 
                                 extraClass.classType === "music" ? (currentLanguage === "kk" ? "Музыка" : "Музыка") : 
                                 extraClass.classType}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 rounded-lg bg-background">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {currentLanguage === "kk" ? "Қатысу" : "Посещаемость"}
                                </p>
                                <p className="text-2xl font-bold">{attendanceRate}%</p>
                                <p className="text-xs text-muted-foreground">
                                  {classAttendance?.filter(a => a.attended).length || 0} / {classAttendance?.length || 0} {currentLanguage === "kk" ? "сабақ" : "занятий"}
                                </p>
                              </div>
                              
                              <div className="p-3 rounded-lg bg-background">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {currentLanguage === "kk" ? "Үлгерім" : "Успеваемость"}
                                </p>
                                {latestPerformance ? (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <p className="text-2xl font-bold">{latestPerformance.grade || latestPerformance.score}</p>
                                      {latestPerformance.score && (
                                        <span className="text-sm text-muted-foreground">({latestPerformance.score}/100)</span>
                                      )}
                                    </div>
                                    {latestPerformance.teacherComments && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {latestPerformance.teacherComments}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    {currentLanguage === "kk" ? "Әлі жоқ" : "Пока нет"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Health Tab */}
        <TabsContent value="health">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("allergies")}</CardTitle>
              </CardHeader>
              <CardContent>
                {healthData?.allergies && healthData.allergies.length > 0 ? (
                  <div className="space-y-3">
                    {healthData.allergies.map((allergy) => (
                      <Card key={allergy.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <span className="font-medium">{allergy.allergen}</span>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    allergy.severity === "severe" ? "bg-red-500/10 text-red-700 dark:text-red-300" :
                                    allergy.severity === "moderate" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" :
                                    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                                  }`}
                                >
                                  {allergy.severity}
                                </Badge>
                              </div>
                              {allergy.protocol && (
                                <p className="text-sm text-muted-foreground mt-1">{allergy.protocol}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("noData")}</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("medications")}</CardTitle>
              </CardHeader>
              <CardContent>
                {healthData?.medications && healthData.medications.filter(m => m.isActive).length > 0 ? (
                  <div className="space-y-3">
                    {healthData.medications.filter(m => m.isActive).map((med) => (
                      <Card key={med.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                              <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{med.medicationName}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {med.dosage} • {med.frequency}
                              </p>
                              {med.administrationTime && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {currentLanguage === "kk" ? "Уақыт" : "Время"}: {med.administrationTime}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("noData")}</p>
                )}
              </CardContent>
            </Card>
            
            {healthData && (
              <Card>
                <CardHeader>
                  <CardTitle>{currentLanguage === "kk" ? "Қосымша ақпарат" : "Дополнительная информация"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {healthData.bloodType && (
                    <div>
                      <p className="text-sm font-medium">{currentLanguage === "kk" ? "Қан тобы" : "Группа крови"}</p>
                      <p className="text-sm text-muted-foreground">{healthData.bloodType}</p>
                    </div>
                  )}
                  {healthData.dietRestrictions && (
                    <div>
                      <p className="text-sm font-medium">{t("dietRestrictions")}</p>
                      <p className="text-sm text-muted-foreground">{healthData.dietRestrictions}</p>
                    </div>
                  )}
                  {healthData.emergencyContactName && (
                    <div>
                      <p className="text-sm font-medium">{t("emergencyContact")}</p>
                      <p className="text-sm text-muted-foreground">
                        {healthData.emergencyContactName} • {healthData.emergencyContactPhone}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{t("documents")}</CardTitle>
                  <CardDescription>{documents?.length || 0} {currentLanguage === "kk" ? "құжат" : "документов"}</CardDescription>
                </div>
                <Button data-testid="button-upload-document">
                  <Upload className="h-4 w-4 mr-2" />
                  {t("uploadDocument")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="hover-elevate" data-testid={`document-${doc.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="font-medium truncate">{doc.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {doc.fileName} • {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ""}
                              </p>
                              {doc.expiryDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t("expiresOn")}: {formatDateInAlmaty(doc.expiryDate, "dd.MM.yyyy", currentLanguage)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getDocumentStatusColor(doc.status)}`}
                            >
                              {t(doc.status || "pending")}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("noDocuments")}</p>
                  <Button className="mt-4" data-testid="button-upload-first-document">
                    <Upload className="h-4 w-4 mr-2" />
                    {t("uploadDocument")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>{t("billing")}</CardTitle>
              <CardDescription>{invoices?.length || 0} {currentLanguage === "kk" ? "шот" : "счетов"}</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} className="hover-elevate" data-testid={`invoice-${invoice.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">#{invoice.invoiceNumber}</span>
                              <Badge 
                                variant="secondary"
                                className={`text-xs ${
                                  invoice.status === "paid" ? "bg-green-500/10 text-green-700 dark:text-green-300" :
                                  invoice.status === "overdue" ? "bg-red-500/10 text-red-700 dark:text-red-300" :
                                  "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                }`}
                              >
                                {t(invoice.status || "pending")}
                              </Badge>
                            </div>
                            {invoice.description && (
                              <p className="text-sm text-muted-foreground">{invoice.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("dueDate")}: {formatDateInAlmaty(invoice.dueDate, "dd.MM.yyyy", currentLanguage)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(invoice.amount, currentLanguage)}</p>
                            {invoice.status === "pending" && (
                              <Button size="sm" className="mt-2">
                                {t("payNow")}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("noData")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

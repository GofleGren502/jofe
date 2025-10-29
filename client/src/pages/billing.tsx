import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, FileText, Package, Calendar, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Invoice, Subscription, AdditionalService } from "@shared/schema";
import { formatCurrency, formatDateInAlmaty } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

export default function Billing() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  const { data: invoices, isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });
  
  const { data: subscriptions, isLoading: loadingSubscriptions } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });
  
  const { data: services, isLoading: loadingServices } = useQuery<AdditionalService[]>({
    queryKey: ["/api/services"],
  });
  
  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "pending": return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
      case "overdue": return "bg-red-500/10 text-red-700 dark:text-red-300";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" data-testid="text-billing-title">
          {t("payments")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentLanguage === "kk" ? "Төлемдер мен жазылымдарды басқару" : "Управление платежами и подписками"}
        </p>
      </div>
      
      <Tabs defaultValue="invoices">
        <TabsList className="grid w-full grid-cols-3 mb-6 max-w-md">
          <TabsTrigger value="invoices" data-testid="tab-invoices">
            <FileText className="h-4 w-4 mr-2" />
            {t("invoices")}
          </TabsTrigger>
          <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
            <CreditCard className="h-4 w-4 mr-2" />
            {t("subscriptions")}
          </TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">
            <Package className="h-4 w-4 mr-2" />
            {t("services")}
          </TabsTrigger>
        </TabsList>
        
        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>{t("invoices")}</CardTitle>
              <CardDescription>
                {invoices?.length || 0} {currentLanguage === "kk" ? "шот" : "счетов"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-20 w-full" />
                    </Card>
                  ))}
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} className="hover-elevate" data-testid={`invoice-${invoice.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">#{invoice.invoiceNumber}</span>
                              <Badge 
                                variant="secondary"
                                className={`text-xs ${getInvoiceStatusColor(invoice.status)}`}
                              >
                                {t(invoice.status)}
                              </Badge>
                            </div>
                            {invoice.description && (
                              <p className="text-sm text-muted-foreground">{invoice.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {t("dueDate")}: {formatDateInAlmaty(invoice.dueDate, "dd.MM.yyyy", currentLanguage)}
                                </span>
                              </div>
                              {invoice.paidAt && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>
                                    {t("paidOn")}: {formatDateInAlmaty(invoice.paidAt, "dd.MM.yyyy", currentLanguage)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold">{formatCurrency(invoice.amount, currentLanguage)}</p>
                            {invoice.status === "pending" && (
                              <Button size="sm" className="mt-2" data-testid={`button-pay-${invoice.id}`}>
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
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("noData")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>{t("subscriptions")}</CardTitle>
              <CardDescription>
                {subscriptions?.length || 0} {currentLanguage === "kk" ? "жазылым" : "подписок"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubscriptions ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-24 w-full" />
                    </Card>
                  ))}
                </div>
              ) : subscriptions && subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((subscription) => (
                    <Card key={subscription.id} className="hover-elevate" data-testid={`subscription-${subscription.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{subscription.planName}</span>
                              {subscription.isAutoCharge && (
                                <Badge variant="secondary" className="text-xs">
                                  {t("autoCharge")}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("nextBilling")}: {subscription.nextBillingDate 
                                ? formatDateInAlmaty(subscription.nextBillingDate, "dd.MM.yyyy", currentLanguage)
                                : "-"
                              }
                            </p>
                            <Badge 
                              variant="secondary"
                              className={`mt-2 text-xs ${
                                subscription.status === "active" ? "bg-green-500/10 text-green-700 dark:text-green-300" :
                                "bg-gray-500/10 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {t(subscription.status)}
                            </Badge>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold">
                              {formatCurrency(subscription.monthlyAmount, currentLanguage)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {currentLanguage === "kk" ? "айына" : "в месяц"}
                            </p>
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
        
        {/* Services Tab */}
        <TabsContent value="services">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingServices ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-48 w-full" />
                </Card>
              ))
            ) : services && services.length > 0 ? (
              services.filter(s => s.isActive).map((service) => (
                <Card key={service.id} className="hover-elevate" data-testid={`service-${service.id}`}>
                  {service.imageUrl && (
                    <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                      <img 
                        src={service.imageUrl} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.description && (
                      <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t("amount")}</span>
                        <span className="font-bold text-lg">{formatCurrency(service.price, currentLanguage)}</span>
                      </div>
                      {(service.ageMin || service.ageMax) && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t("ageRange")}</span>
                          <span className="text-sm">
                            {service.ageMin && service.ageMax 
                              ? `${service.ageMin}-${service.ageMax} ${currentLanguage === "kk" ? "жас" : "лет"}`
                              : service.ageMin 
                                ? `${service.ageMin}+ ${currentLanguage === "kk" ? "жас" : "лет"}`
                                : `${service.ageMax} ${currentLanguage === "kk" ? "дейін" : "до"}`
                            }
                          </span>
                        </div>
                      )}
                      <Button className="w-full" data-testid={`button-book-${service.id}`}>
                        {t("bookService")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">{t("noData")}</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

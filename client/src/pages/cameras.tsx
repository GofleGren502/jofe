import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Video, 
  Play, 
  Pause, 
  Download, 
  AlertCircle, 
  Clock,
  Activity,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Settings,
  Calendar
} from "lucide-react";

type Camera = {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "reconnecting";
  quality: "HD" | "FHD" | "4K";
  latency: number;
  viewers: number;
};

type TimelineEvent = {
  id: string;
  type: "sleep" | "meal" | "walk" | "activity";
  time: string;
  duration?: number;
};

export default function Cameras() {
  const { t, i18n } = useTranslation();
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [clipStart, setClipStart] = useState([0]);
  const [clipEnd, setClipEnd] = useState([30]);
  const [linkExpiry, setLinkExpiry] = useState("7");

  // Mock camera data
  const cameras: Camera[] = [
    {
      id: "cam1",
      name: t("nurseryGroup"),
      location: t("classroom"),
      status: "online",
      quality: "FHD",
      latency: 1.2,
      viewers: 3,
    },
    {
      id: "cam2",
      name: t("playground"),
      location: t("walk"),
      status: "online",
      quality: "HD",
      latency: 1.8,
      viewers: 5,
    },
    {
      id: "cam3",
      name: t("diningRoom"),
      location: t("meal"),
      status: "offline",
      quality: "FHD",
      latency: 0,
      viewers: 0,
    },
    {
      id: "cam4",
      name: t("bedroom"),
      location: t("sleep"),
      status: "reconnecting",
      quality: "HD",
      latency: 3.5,
      viewers: 2,
    },
  ];

  // Mock timeline events
  const timelineEvents: TimelineEvent[] = [
    { id: "e1", type: "meal", time: "09:00", duration: 30 },
    { id: "e2", type: "activity", time: "10:00", duration: 45 },
    { id: "e3", type: "walk", time: "11:00", duration: 60 },
    { id: "e4", type: "meal", time: "12:30", duration: 30 },
    { id: "e5", type: "sleep", time: "13:30", duration: 120 },
    { id: "e6", type: "activity", time: "16:00", duration: 45 },
  ];

  const getStatusBadge = (status: Camera["status"]) => {
    const variants = {
      online: "bg-green-500/10 text-green-700 dark:text-green-300",
      offline: "bg-red-500/10 text-red-700 dark:text-red-300",
      reconnecting: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
    };

    const labels = {
      online: t("onlineStatus"),
      offline: t("signalLost"),
      reconnecting: t("reconnecting"),
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {status === "online" && <Wifi className="h-3 w-3 mr-1" />}
        {status === "offline" && <WifiOff className="h-3 w-3 mr-1" />}
        {status === "reconnecting" && <Activity className="h-3 w-3 mr-1 animate-pulse" />}
        {labels[status]}
      </Badge>
    );
  };

  const getEventIcon = (type: TimelineEvent["type"]) => {
    const icons = {
      sleep: "😴",
      meal: "🍽️",
      walk: "🚶",
      activity: "🎨",
    };
    return icons[type];
  };

  const getEventLabel = (type: TimelineEvent["type"]) => {
    const labels = {
      sleep: t("sleep"),
      meal: t("meal"),
      walk: t("walk"),
      activity: t("activity"),
    };
    return labels[type];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-cameras-title">
            {t("cameras")}
          </h1>
          <p className="text-muted-foreground">
            {t("cameraDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="button-settings">
            <Settings className="h-4 w-4 mr-2" />
            {t("settings")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live" data-testid="tab-live">
            <Video className="h-4 w-4 mr-2" />
            {t("liveView")}
          </TabsTrigger>
          <TabsTrigger value="archive" data-testid="tab-archive">
            <Calendar className="h-4 w-4 mr-2" />
            {t("archive")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera List */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="font-semibold text-lg">{t("allCameras")}</h2>
              {cameras.map((camera) => (
                <Card
                  key={camera.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCamera?.id === camera.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedCamera(camera)}
                  data-testid={`card-camera-${camera.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{camera.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {camera.location}
                        </CardDescription>
                      </div>
                      {getStatusBadge(camera.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{camera.quality}</span>
                      {camera.status === "online" && (
                        <>
                          <span>
                            {t("latency")}: {camera.latency}s
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {camera.viewers}
                          </span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Video Player */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {selectedCamera?.name || t("selectCamera")}
                      </CardTitle>
                      {selectedCamera && (
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {getStatusBadge(selectedCamera.status)}
                          <Badge variant="outline">{selectedCamera.quality}</Badge>
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrivacyMode(!privacyMode)}
                        data-testid="button-privacy-mode"
                      >
                        {privacyMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={!selectedCamera || selectedCamera.status === "offline"}
                            data-testid="button-export"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t("exportClip")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t("exportSettings")}</DialogTitle>
                            <DialogDescription>
                              {t("exportDialogDescription")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>{t("clipDuration")}</Label>
                              <div className="flex items-center gap-4">
                                <Slider
                                  value={clipStart}
                                  onValueChange={setClipStart}
                                  max={300}
                                  step={5}
                                  className="flex-1"
                                />
                                <span className="text-sm w-16">{clipStart[0]}s</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <Slider
                                  value={clipEnd}
                                  onValueChange={setClipEnd}
                                  max={300}
                                  step={5}
                                  className="flex-1"
                                />
                                <span className="text-sm w-16">{clipEnd[0]}s</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="face-blur">{t("faceBlur")}</Label>
                              <Switch id="face-blur" defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="watermark">{t("watermark")}</Label>
                              <Switch id="watermark" defaultChecked />
                            </div>

                            <div className="space-y-2">
                              <Label>{t("linkExpiry")}</Label>
                              <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 {t("days")}</SelectItem>
                                  <SelectItem value="7">7 {t("days")}</SelectItem>
                                  <SelectItem value="30">30 {t("days")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <Button className="w-full" data-testid="button-generate-link">
                              {t("generateLink")}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Mock Video Player */}
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    {selectedCamera ? (
                      <>
                        {selectedCamera.status === "offline" ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <WifiOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-lg font-semibold">{t("signalLost")}</p>
                            </div>
                          </div>
                        ) : selectedCamera.status === "reconnecting" ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
                              <p className="text-lg font-semibold">{t("reconnecting")}</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Simulated video feed */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white/70">
                                  <Video className="h-20 w-20 mx-auto mb-4" />
                                  <p className="text-sm">
                                    {t("liveDemo")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Privacy overlay */}
                            {privacyMode && (
                              <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                                {t("privacyMode")}
                              </div>
                            )}

                            {/* Quality indicators */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                              <Badge variant="secondary" className="bg-black/50 text-white border-0">
                                <Activity className="h-3 w-3 mr-1" />
                                {t("latency")}: {selectedCamera.latency}s
                              </Badge>
                              <Badge variant="secondary" className="bg-black/50 text-white border-0">
                                {t("qualityIndicator")}: {selectedCamera.quality}
                              </Badge>
                            </div>

                            {/* Controls */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                              <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => setIsPlaying(!isPlaying)}
                                data-testid="button-play-pause"
                              >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Video className="h-16 w-16 mx-auto mb-4" />
                          <p>{t("selectCamera")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Events */}
              {selectedCamera && selectedCamera.status === "online" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("timelineEvents")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {timelineEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          data-testid={`timeline-event-${event.id}`}
                        >
                          <span className="text-2xl">{getEventIcon(event.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{getEventLabel(event.type)}</p>
                            <p className="text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {event.time}
                              {event.duration && ` • ${event.duration} ${t("minutes")}`}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" data-testid={`button-goto-${event.id}`}>
                            {t("playback")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("archive")}</CardTitle>
              <CardDescription>
                {t("archiveDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">
                    {t("archiveInterface")}
                  </p>
                  <p className="text-sm mt-2">
                    {t("selectDateTime")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {t("technicalInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <p>
            <strong>
              {t("supportedFormats")}
            </strong>{" "}
            {t("formatsList")}
          </p>
          <p>
            <strong>{t("archiveRetention")}:</strong> 7-30 {t("days")} ({t("gardenSettings")})
          </p>
          <p>
            <strong>{t("maxSessions")}:</strong> 3-10 ({t("gardenParams")})
          </p>
          <p>
            <strong>{t("privacyMode")}:</strong> {t("autoFaceBlur")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

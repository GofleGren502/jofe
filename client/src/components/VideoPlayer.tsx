import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  Moon,
  Utensils,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  cameraName: string;
  streamUrl?: string;
  className?: string;
}

// Mock timeline events
const mockEvents = [
  { time: 300, type: "meal", label: "Обед" },
  { time: 600, type: "sleep", label: "Сон" },
  { time: 900, type: "activity", label: "Игры" },
];

export function VideoPlayer({ cameraName, streamUrl, className = "" }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(1200); // 20 minutes mock
  const [quality, setQuality] = useState("720p");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleTimeChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case "meal": return <Utensils className="h-3 w-3" />;
      case "sleep": return <Moon className="h-3 w-3" />;
      case "activity": return <Activity className="h-3 w-3" />;
      default: return null;
    }
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Video Area */}
      <div className="relative aspect-video bg-black">
        {/* Mock Video Feed */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-center text-white/70">
            <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm">{cameraName}</p>
            <p className="text-xs mt-1">Mock Video Stream</p>
          </div>
        </div>
        
        {/* Quality Badge */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-black/50 backdrop-blur hover:bg-black/70"
                data-testid="button-video-quality"
              >
                <Settings className="h-3 w-3 mr-1" />
                {quality}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setQuality("1080p")}>
                1080p HD
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuality("720p")}>
                720p
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQuality("480p")}>
                480p
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Timeline with Event Markers */}
          <div className="relative mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleTimeChange}
              className="cursor-pointer"
              data-testid="slider-video-timeline"
            />
            {/* Event Markers */}
            <div className="absolute -top-8 left-0 right-0 h-6">
              {mockEvents.map((event, idx) => {
                const position = (event.time / duration) * 100;
                return (
                  <div
                    key={idx}
                    className="absolute -translate-x-1/2 group"
                    style={{ left: `${position}%` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {getEventIcon(event.type)}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="mt-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        {event.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
                data-testid="button-video-play"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
                data-testid="button-video-mute"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              data-testid="button-video-fullscreen"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

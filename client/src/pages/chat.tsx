import { useState } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, Pin, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ChatThread, Message, User } from "@shared/schema";
import { formatRelativeTime, formatTimeInAlmaty } from "@/lib/formatters";
import { useAuth } from "@/hooks/useAuth";

export default function Chat() {
  const { threadId } = useParams<{ threadId?: string }>();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: threads } = useQuery<ChatThread[]>({
    queryKey: ["/api/chat/threads"],
  });
  
  const { data: messages } = useQuery<(Message & { sender: User })[]>({
    queryKey: ["/api/chat/threads", threadId, "messages"],
    enabled: !!threadId,
  });
  
  const selectedThread = threads?.find(t => t.id.toString() === threadId);
  
  const filteredThreads = threads?.filter(thread => {
    if (!searchQuery) return true;
    return thread.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    // Send message via API (will be implemented in backend)
    console.log("Sending message:", messageText);
    setMessageText("");
  };
  
  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-7rem)]">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Conversations List */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-3" data-testid="text-chats-title">
                {t("chats")}
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={currentLanguage === "kk" ? "Іздеу" : "Поиск"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-chats"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {filteredThreads && filteredThreads.length > 0 ? (
                  filteredThreads.map((thread) => (
                    <Link key={thread.id} href={`/chat/${thread.id}`}>
                      <div 
                        className={`p-4 hover-elevate transition-colors cursor-pointer ${
                          threadId === thread.id.toString() ? "bg-accent" : ""
                        }`}
                        data-testid={`thread-${thread.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {thread.title?.[0]?.toUpperCase() || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                              {thread.isPinned && (
                                <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                              )}
                              <h3 className="font-medium truncate">
                                {thread.title || (currentLanguage === "kk" ? "Чат" : "Чат")}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {currentLanguage === "kk" 
                                ? "Соңғы хабарлама..."
                                : "Последнее сообщение..."
                              }
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeTime(thread.updatedAt, currentLanguage)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    {t("noData")}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
        
        {/* Chat Area */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          <Card className="h-full flex flex-col">
            {threadId && selectedThread ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold" data-testid="text-chat-title">
                        {selectedThread.title || (currentLanguage === "kk" ? "Чат" : "Чат")}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {currentLanguage === "kk" ? "Желі" : "Онлайн"}
                      </p>
                    </div>
                    {selectedThread.isPinned && (
                      <Badge variant="secondary">
                        <Pin className="h-3 w-3 mr-1" />
                        {t("pinned")}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages && messages.length > 0 ? (
                      messages.map((message) => {
                        const isOwnMessage = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                            data-testid={`message-${message.id}`}
                          >
                            <div className={`flex gap-3 max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src={message.sender.profileImageUrl || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(message.sender)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                                <div
                                  className={`rounded-2xl p-3 ${
                                    isOwnMessage
                                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                                      : "bg-muted rounded-tl-sm"
                                  }`}
                                >
                                  {message.isImportant && (
                                    <Badge variant="destructive" className="mb-2 text-xs">
                                      {t("important")}
                                    </Badge>
                                  )}
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {message.content}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">
                                  {formatTimeInAlmaty(message.createdAt, "HH:mm", currentLanguage)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>{currentLanguage === "kk" ? "Хабарламалар жоқ" : "Нет сообщений"}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message Composer */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      data-testid="button-attach-file"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder={t("sendMessage")}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                      data-testid="input-message"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!messageText.trim()}
                      data-testid="button-send-message"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">
                    {currentLanguage === "kk" 
                      ? "Чатты таңдаңыз"
                      : "Выберите чат для начала общения"
                    }
                  </p>
                  <p className="text-sm">
                    {currentLanguage === "kk"
                      ? "Сол жақтағы тізімнен чатты таңдаңыз"
                      : "Выберите чат из списка слева"
                    }
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

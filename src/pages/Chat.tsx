import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  MessageCircle,
  Clock,
  FileText,
  Pill,
  Activity,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const Chat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "Hello! 👋 I'm your medical AI assistant. I can analyze your uploaded prescription files and help you with information about your medical history, medicines, and health records. What would you like to know today?",
      timestamp: "10:30 AM",
      suggestions: [
        "What medicines did I take according to my uploaded prescriptions?",
        "Analyze my prescription files",
        "Are there any medicine interactions to worry about?",
        "Summarize my medical records"
      ]
    }
  ]);

  const quickQuestions = [
    {
      icon: Pill,
      question: "What medicines am I taking according to my prescriptions?",
      category: "Medicines"
    },
    {
      icon: FileText,
      question: "Analyze my uploaded prescription files",
      category: "Analysis"
    },
    {
      icon: Activity,
      question: "Summarize my medical records",
      category: "Summary"
    },
    {
      icon: Clock,
      question: "When should I schedule my next checkup?",
      category: "Scheduling"
    }
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !user) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Call the medical AI edge function
      const { data, error } = await supabase.functions.invoke('medical-ai-chat', {
        body: {
          message: message,
          userId: user.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      const aiResponse = data?.response || data?.fallback || "I'm sorry, I couldn't process your request at the moment.";

      const aiMessage: Message = {
        id: messages.length + 2,
        type: "ai",
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Error calling AI:', error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        type: "ai",
        content: "I'm sorry, I encountered an error while processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <span>AI Medical Assistant</span>
            </h1>
            <p className="text-muted-foreground">Ask me anything about your health records</p>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            Online
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Questions */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickQuestions.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleQuickQuestion(item.question)}
                    >
                      <div className="flex items-start space-x-3">
                        <IconComponent className="h-4 w-4 mt-1 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{item.question}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✅ Prescription file analysis</p>
                <p>✅ Medicine tracking & interactions</p>
                <p>✅ Medical record insights</p>
                <p>✅ AI-powered health Q&A</p>
                <p>✅ Secure data processing</p>
                <p>✅ Real-time medical assistance</p>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Medical AI Assistant</p>
                    <p className="text-xs text-muted-foreground">Trained on medical data</p>
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex max-w-[80%] space-x-3 ${msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={msg.type === "user" ? "bg-secondary" : "bg-primary text-primary-foreground"}>
                            {msg.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`space-y-2 ${msg.type === "user" ? "text-right" : ""}`}>
                          <div className={`rounded-lg p-4 ${
                            msg.type === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}>
                            <p className="whitespace-pre-line">{msg.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                          
                          {msg.suggestions && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {msg.suggestions.map((suggestion, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex space-x-3">
                  <Input
                    placeholder="Ask about your prescription files, medicines, or health records..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Ask me to "analyze my prescription files" or "what medicines am I taking?" based on your uploads
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
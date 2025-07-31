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
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const Chat = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "Hello Sameer! 👋 I'm your medical AI assistant. I can help you with information about your medical history, medicines, and health records. What would you like to know today?",
      timestamp: "10:30 AM",
      suggestions: [
        "What medicines did I take last month?",
        "Show my recent medical reports",
        "Any medicine interactions to worry about?",
        "When was my last cardiology checkup?"
      ]
    }
  ]);

  const quickQuestions = [
    {
      icon: Pill,
      question: "What medicines am I currently taking?",
      category: "Medicines"
    },
    {
      icon: FileText,
      question: "Show my latest medical reports",
      category: "Records"
    },
    {
      icon: Activity,
      question: "What was my diagnosis at Manipal Hospital?",
      category: "History"
    },
    {
      icon: Clock,
      question: "When should I schedule my next checkup?",
      category: "Scheduling"
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "";
      
      if (message.toLowerCase().includes("medicine")) {
        aiResponse = "Based on your records, you're currently taking:\n\n• **Aspirin 75mg** - Once daily for heart health\n• **Atorvastatin 20mg** - Once daily (evening) for cholesterol\n\nBoth were prescribed by Dr. Rajesh Kumar at Manipal Hospital on January 15th, 2024. Would you like more details about any of these medicines?";
      } else if (message.toLowerCase().includes("report") || message.toLowerCase().includes("record")) {
        aiResponse = "Here are your recent medical reports:\n\n• **Chest X-Ray** (Jan 15, 2024) - Normal\n• **ECG Report** (Jan 8, 2024) - Shows mild irregularities\n• **Blood Test** (Jan 10, 2024) - All parameters within normal range\n\nAll reports are from Manipal Hospital, Bangalore. Would you like me to explain any specific results?";
      } else if (message.toLowerCase().includes("interaction")) {
        aiResponse = "⚠️ **Important Medicine Interaction Alert:**\n\nI found a potential HIGH RISK interaction between Aspirin and Warfarin in our database. If you're considering Warfarin, please consult Dr. Rajesh Kumar first as this combination increases bleeding risk.\n\nYour current medicines (Aspirin + Atorvastatin) are safe to take together.";
      } else if (message.toLowerCase().includes("checkup") || message.toLowerCase().includes("appointment")) {
        aiResponse = "Based on your last cardiology visit on January 15th, 2024:\n\n**Recommended next checkup:** April 15th, 2024 (3 months follow-up)\n\n**Reason:** Monitor chest pain treatment progress and heart health\n\nWould you like me to help you find Dr. Rajesh Kumar's contact information for scheduling?";
      } else {
        aiResponse = "I understand you're asking about your medical history. I can help you with:\n\n• Medicine information and interactions\n• Medical report summaries\n• Appointment scheduling recommendations\n• Treatment history from different hospitals\n\nCould you be more specific about what you'd like to know? For example, ask about your medicines, reports, or appointments.";
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        type: "ai",
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1500);

    setMessage("");
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
              <div className="bg-gradient-to-br from-primary to-primary-dark p-2 rounded-lg">
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
                <p>✅ Medicine tracking & interactions</p>
                <p>✅ Medical report analysis</p>
                <p>✅ Appointment scheduling</p>
                <p>✅ Health history timeline</p>
                <p>✅ Multi-hospital data sync</p>
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
                    placeholder="Ask about your medicines, reports, or health history..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-gradient-to-r from-primary to-primary-dark"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Ask specific questions like "What medicines am I taking?" or "Show my latest reports"
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
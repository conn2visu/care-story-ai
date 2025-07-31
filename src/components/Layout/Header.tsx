import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Activity, 
  FileText, 
  Pill, 
  MessageCircle, 
  Settings,
  Heart
} from "lucide-react";

export const Header = () => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Activity },
    { name: "Records", href: "/records", icon: FileText },
    { name: "Medicines", href: "/medicines", icon: Pill },
    { name: "AI Assistant", href: "/chat", icon: MessageCircle },
  ];

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MedHistory AI</h1>
              <p className="text-xs text-muted-foreground">Your Health Companion</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const IconComponent = item.icon;
              
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="flex items-center space-x-2 px-4"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                S
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">Sameer</p>
              <p className="text-xs text-muted-foreground">Patient</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
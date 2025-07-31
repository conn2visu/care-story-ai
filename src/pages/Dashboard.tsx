import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  FileText, 
  Pill, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Clock
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Medical Records",
      value: "12",
      subtitle: "Documents uploaded",
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Current Medicines",
      value: "3",
      subtitle: "Active prescriptions",
      icon: Pill,
      color: "text-secondary"
    },
    {
      title: "Last Checkup",
      value: "2 weeks",
      subtitle: "Manipal Hospital",
      icon: Calendar,
      color: "text-success"
    },
    {
      title: "Health Score",
      value: "85%",
      subtitle: "Improving trend",
      icon: TrendingUp,
      color: "text-warning"
    }
  ];

  const recentActivities = [
    {
      type: "medicine",
      title: "Added Aspirin 75mg",
      time: "2 hours ago",
      icon: Pill
    },
    {
      type: "record",
      title: "Uploaded ECG Report",
      time: "1 day ago", 
      icon: FileText
    },
    {
      type: "checkup",
      title: "Visited Manipal Hospital",
      time: "2 weeks ago",
      icon: Heart
    }
  ];

  const alerts = [
    {
      type: "warning",
      message: "Medicine interaction detected between Aspirin and Warfarin",
      action: "Review"
    },
    {
      type: "info",
      message: "Schedule your next cardiology checkup",
      action: "Schedule"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, Sameer!</h2>
              <p className="text-primary-foreground/80">
                Your health data is organized and ready. How can I help you today?
              </p>
            </div>
            <Heart className="h-16 w-16 text-primary-foreground/20" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.subtitle}
                      </p>
                    </div>
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-accent">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Health Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Health Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'warning' 
                      ? 'bg-warning/10 border-warning' 
                      : 'bg-primary/10 border-primary'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground mb-2">
                    {alert.message}
                  </p>
                  <Button size="sm" variant="outline">
                    {alert.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col space-y-2" variant="outline">
                <Plus className="h-6 w-6" />
                <span>Upload Medical Record</span>
              </Button>
              <Button className="h-20 flex flex-col space-y-2" variant="outline">
                <Pill className="h-6 w-6" />
                <span>Add Medicine</span>
              </Button>
              <Button className="h-20 flex flex-col space-y-2" variant="outline">
                <Heart className="h-6 w-6" />
                <span>Ask AI Assistant</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
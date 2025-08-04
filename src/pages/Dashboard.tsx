import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState([
    {
      title: "Medical Records",
      value: "0",
      subtitle: "Documents uploaded",
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Current Medicines",
      value: "0",
      subtitle: "Active prescriptions",
      icon: Pill,
      color: "text-secondary"
    },
    {
      title: "Last Checkup",
      value: "N/A",
      subtitle: "No records yet",
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
  ]);

  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch prescriptions count
      const { data: prescriptions, error: prescError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch medicines count
      const { data: medicines, error: medError } = await supabase
        .from('medicines')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      // Fetch recent activities
      const { data: activities, error: actError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch health alerts
      const { data: healthAlerts, error: alertError } = await supabase
        .from('health_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (prescError || medError || actError || alertError) {
        console.error('Error fetching dashboard data:', { prescError, medError, actError, alertError });
      }

      // Update stats
      setStats(prev => [
        { ...prev[0], value: String(prescriptions?.length || 0) },
        { ...prev[1], value: String(medicines?.length || 0) },
        { ...prev[2], value: prescriptions?.length ? getLastCheckupText(prescriptions) : "N/A", subtitle: prescriptions?.length ? "Last prescription" : "No records yet" },
        { ...prev[3] }
      ]);

      // Update activities
      setRecentActivities(activities || []);
      
      // Update alerts
      setAlerts(healthAlerts || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastCheckupText = (prescriptions: any[]) => {
    if (!prescriptions.length) return "N/A";
    const latest = prescriptions.sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())[0];
    const daysDiff = Math.floor((Date.now() - new Date(latest.upload_date).getTime()) / (1000 * 3600 * 24));
    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "Yesterday";
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    return `${Math.floor(daysDiff / 30)} months ago`;
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('health_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter((alert: any) => alert.id !== alertId));
      toast({
        title: "Alert marked as read",
        description: "The alert has been dismissed"
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive"
      });
    }
  };

  const handleScheduleCheckup = () => {
    toast({
      title: "Scheduling Feature",
      description: "Checkup scheduling will be available soon"
    });
  };

  const oldStats = [
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
              {loading ? (
                <div className="text-center text-muted-foreground">Loading activities...</div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <p>No recent activities</p>
                  <p className="text-xs mt-1">Start by uploading medical records or adding medicines</p>
                </div>
              ) : (
                recentActivities.map((activity: any, index) => {
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'medicine': return Pill;
                      case 'record': return FileText;
                      case 'prescription': return FileText;
                      case 'checkup': return Heart;
                      default: return Clock;
                    }
                  };
                  
                  const IconComponent = getActivityIcon(activity.type);
                  const timeAgo = new Date(activity.created_at).toLocaleDateString();
                  
                  return (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-accent">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{timeAgo}</p>
                      </div>
                    </div>
                  );
                })
              )}
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
              {loading ? (
                <div className="text-center text-muted-foreground">Loading alerts...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <p>No health alerts</p>
                  <p className="text-xs mt-1">You're all up to date!</p>
                </div>
              ) : (
                alerts.map((alert: any, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'warning' || alert.type === 'critical'
                        ? 'bg-warning/10 border-warning' 
                        : 'bg-primary/10 border-primary'
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground mb-2">
                      {alert.message}
                    </p>
                    <div className="flex space-x-2">
                      {alert.type === 'reminder' && (
                        <Button size="sm" variant="outline" onClick={handleScheduleCheckup}>
                          Schedule
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkAlertAsRead(alert.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))
              )}
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
              <Button 
                className="h-20 flex flex-col space-y-2" 
                variant="outline"
                onClick={() => navigate('/records')}
              >
                <Plus className="h-6 w-6" />
                <span>Upload Medical Record</span>
              </Button>
              <Button 
                className="h-20 flex flex-col space-y-2" 
                variant="outline"
                onClick={() => navigate('/medicines')}
              >
                <Pill className="h-6 w-6" />
                <span>Add Medicine</span>
              </Button>
              <Button 
                className="h-20 flex flex-col space-y-2" 
                variant="outline"
                onClick={() => navigate('/chat')}
              >
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
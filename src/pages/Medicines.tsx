import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Pill, 
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Medicines = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const currentMedicines = [
    {
      id: 1,
      name: "Aspirin",
      dosage: "75mg",
      frequency: "Once daily",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      purpose: "Blood thinner for heart health",
      prescribedBy: "Dr. Rajesh Kumar",
      status: "Active",
      sideEffects: ["Stomach irritation", "Easy bruising"],
      instructions: "Take with food"
    },
    {
      id: 2,
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily (evening)",
      startDate: "2024-01-10",
      endDate: "Ongoing",
      purpose: "Cholesterol management",
      prescribedBy: "Dr. Rajesh Kumar",
      status: "Active",
      sideEffects: ["Muscle pain", "Liver issues"],
      instructions: "Take in the evening"
    },
    {
      id: 3,
      name: "Pantoprazole",
      dosage: "40mg",
      frequency: "Once daily (morning)",
      startDate: "2024-01-15",
      endDate: "2024-01-30",
      purpose: "Acid reflux protection",
      prescribedBy: "Dr. Rajesh Kumar",
      status: "Completed",
      sideEffects: ["Headache", "Diarrhea"],
      instructions: "Take 30 minutes before breakfast"
    }
  ];

  const medicineInteractions = [
    {
      medicines: ["Aspirin", "Warfarin"],
      severity: "High",
      description: "Increased bleeding risk when taken together",
      recommendation: "Consult doctor before combining"
    }
  ];

  const handleAddMedicine = () => {
    toast({
      title: "Add Medicine Feature",
      description: "Medicine tracking will be available once Supabase is connected for data storage.",
    });
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "completed": return "bg-secondary text-secondary-foreground";
      case "discontinued": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredMedicines = currentMedicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medicine Tracker</h1>
            <p className="text-muted-foreground">Manage your medications and track interactions</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-secondary to-success"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>

        {/* Interaction Alerts */}
        {medicineInteractions.length > 0 && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span>Medicine Interactions Detected</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {medicineInteractions.map((interaction, index) => (
                <div key={index} className="p-4 rounded-lg bg-background border border-destructive/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">
                      {interaction.medicines.join(" + ")}
                    </p>
                    <Badge className={getSeverityColor(interaction.severity)}>
                      {interaction.severity} Risk
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {interaction.description}
                  </p>
                  <p className="text-sm font-medium text-destructive">
                    ⚠️ {interaction.recommendation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines by name or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Medicine Tabs */}
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Medicines</TabsTrigger>
            <TabsTrigger value="history">Medicine History</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="grid gap-4">
              {filteredMedicines.filter(m => m.status === "Active").map((medicine) => (
                <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-start space-x-4">
                        <div className="bg-secondary/20 p-3 rounded-lg">
                          <Pill className="h-6 w-6 text-secondary" />
                        </div>
                        <div className="space-y-3 flex-1">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">
                              {medicine.name} {medicine.dosage}
                            </h3>
                            <p className="text-sm text-muted-foreground">{medicine.purpose}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Frequency:</span>
                              <span className="font-medium">{medicine.frequency}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Started:</span>
                              <span className="font-medium">{new Date(medicine.startDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(medicine.status)}>
                              {medicine.status}
                            </Badge>
                            <Badge variant="outline">
                              {medicine.prescribedBy}
                            </Badge>
                          </div>

                          <div className="text-sm">
                            <p className="text-muted-foreground mb-1">
                              <strong>Instructions:</strong> {medicine.instructions}
                            </p>
                            {medicine.sideEffects.length > 0 && (
                              <p className="text-muted-foreground">
                                <strong>Side Effects:</strong> {medicine.sideEffects.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Mark Taken
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {currentMedicines.filter(m => m.status === "Completed").map((medicine) => (
                <Card key={medicine.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="h-8 w-8 text-success" />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {medicine.name} {medicine.dosage}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {medicine.purpose} • Completed on {new Date(medicine.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reminders">
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Medicine reminders will be available soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Medicine Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Medicine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicineName">Medicine Name</Label>
                  <Input id="medicineName" placeholder="e.g., Aspirin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input id="dosage" placeholder="e.g., 75mg" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once daily</SelectItem>
                      <SelectItem value="twice">Twice daily</SelectItem>
                      <SelectItem value="thrice">Three times daily</SelectItem>
                      <SelectItem value="asneeded">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescriber">Prescribed By</Label>
                  <Input id="prescriber" placeholder="Doctor's name" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose / Condition</Label>
                <Input id="purpose" placeholder="What is this medicine for?" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea id="instructions" placeholder="Special instructions for taking this medicine" />
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleAddMedicine}>
                  Add Medicine
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Medicines;
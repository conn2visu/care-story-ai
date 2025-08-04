import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Pill, 
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Upload,
  FileText
} from "lucide-react";

const Medicines = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [medicineFile, setMedicineFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedicines();
    }
  }, [user]);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast({
        title: "Error",
        description: "Failed to load medicines",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('medicine-files')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('medicine-files')
      .getPublicUrl(filePath);

    return { filePath, fileName: file.name, fileUrl: publicUrl };
  };

  const handleAddMedicine = async (formData: any) => {
    if (!user) return;
    
    setUploading(true);
    try {
      let fileData = null;
      
      if (medicineFile) {
        fileData = await handleFileUpload(medicineFile);
      }

      const { error } = await supabase
        .from('medicines')
        .insert({
          user_id: user.id,
          name: formData.name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          purpose: formData.purpose,
          prescriber: formData.prescriber,
          instructions: formData.instructions,
          file_url: fileData?.fileUrl,
          file_name: fileData?.fileName,
          start_date: formData.startDate || new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      // Create activity
      await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          type: 'medicine',
          title: `Added ${formData.name}`,
          description: `Added new medicine: ${formData.name} ${formData.dosage}`
        });

      toast({
        title: "Success",
        description: "Medicine added successfully!"
      });
      
      setShowAddForm(false);
      setMedicineFile(null);
      fetchMedicines();
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-success text-success-foreground";
      case "completed": return "bg-secondary text-secondary-foreground";
      case "paused": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredMedicines = medicines.filter((medicine: any) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.purpose && medicine.purpose.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const activeMedicines = filteredMedicines.filter((med: any) => med.status === 'active');
  const completedMedicines = filteredMedicines.filter((med: any) => med.status === 'completed');

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
            {loading ? (
              <div className="text-center text-muted-foreground">Loading medicines...</div>
            ) : activeMedicines.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>No active medicines found</p>
                <p className="text-xs mt-1">Click "Add Medicine" to get started</p>
              </div>
            ) : (
              activeMedicines.map((medicine: any) => (
                <Card key={medicine.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{medicine.name}</h3>
                        <p className="text-sm text-muted-foreground">{medicine.dosage} • {medicine.frequency}</p>
                      </div>
                      <Badge className={getStatusColor(medicine.status)}>
                        {medicine.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Purpose</p>
                        <p className="text-sm text-muted-foreground">{medicine.purpose || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Prescribed by</p>
                        <p className="text-sm text-muted-foreground">{medicine.prescriber || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground mb-1">Instructions</p>
                      <p className="text-sm text-muted-foreground">{medicine.instructions || 'No specific instructions'}</p>
                    </div>
                    
                    {medicine.file_url && (
                      <div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(medicine.file_url, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Attachment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {completedMedicines.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>No completed medicines in history</p>
                <p className="text-xs mt-1">Medicines you've finished will appear here</p>
              </div>
            ) : (
              completedMedicines.map((medicine: any) => (
                <Card key={medicine.id} className="hover:shadow-md transition-shadow opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{medicine.name}</h3>
                        <p className="text-sm text-muted-foreground">{medicine.dosage} • {medicine.frequency}</p>
                      </div>
                      <Badge className={getStatusColor(medicine.status)}>
                        {medicine.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Purpose</p>
                        <p className="text-sm text-muted-foreground">{medicine.purpose || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {medicine.start_date} to {medicine.end_date || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
          <AddMedicineForm 
            onSubmit={handleAddMedicine}
            onCancel={() => setShowAddForm(false)}
            uploading={uploading}
            medicineFile={medicineFile}
            setMedicineFile={setMedicineFile}
          />
        )}
      </div>
    </div>
  );
};

// Add Medicine Form Component
const AddMedicineForm = ({ onSubmit, onCancel, uploading, medicineFile, setMedicineFile }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    purpose: '',
    prescriber: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage || !formData.frequency) {
      return;
    }
    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedicineFile(e.target.files[0]);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Add New Medicine</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medicine-name">Medicine Name *</Label>
              <Input 
                id="medicine-name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter medicine name" 
                required
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosage *</Label>
              <Input 
                id="dosage" 
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 500mg" 
                required
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency *</Label>
              <Input 
                id="frequency" 
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="e.g., Twice daily" 
                required
              />
            </div>
            <div>
              <Label htmlFor="prescriber">Prescribed by</Label>
              <Input 
                id="prescriber" 
                value={formData.prescriber}
                onChange={(e) => setFormData(prev => ({ ...prev, prescriber: e.target.value }))}
                placeholder="Doctor's name" 
              />
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input 
                id="start-date" 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input 
              id="purpose" 
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="What is this medicine for?" 
            />
          </div>
          
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea 
              id="instructions" 
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Special instructions for taking this medicine"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="medicine-file">Prescription/Medicine File (Optional)</Label>
            <Input 
              id="medicine-file" 
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="mt-1"
            />
            {medicineFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {medicineFile.name}
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button type="submit" disabled={uploading}>
              {uploading ? "Adding..." : "Add Medicine"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Medicines;
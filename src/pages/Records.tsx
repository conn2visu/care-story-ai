import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  FileText, 
  Calendar, 
  Search,
  Filter,
  Download,
  Eye,
  Hospital,
  Stethoscope,
  Activity,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Records = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const medicalRecords = [
    {
      id: 1,
      title: "Chest X-Ray Report",
      date: "2024-01-15",
      hospital: "Manipal Hospital, Bangalore",
      type: "Diagnostic",
      status: "Normal",
      doctor: "Dr. Rajesh Kumar",
      category: "Cardiology"
    },
    {
      id: 2,
      title: "Blood Test - Complete Panel",
      date: "2024-01-10",
      hospital: "Manipal Hospital, Bangalore", 
      type: "Lab Report",
      status: "Reviewed",
      doctor: "Dr. Priya Sharma",
      category: "General"
    },
    {
      id: 3,
      title: "ECG Report",
      date: "2024-01-08",
      hospital: "Manipal Hospital, Bangalore",
      type: "Diagnostic",
      status: "Abnormal",
      doctor: "Dr. Rajesh Kumar",
      category: "Cardiology"
    },
    {
      id: 4,
      title: "Prescription - Chest Pain Treatment",
      date: "2024-01-15",
      hospital: "Manipal Hospital, Bangalore",
      type: "Prescription",
      status: "Active",
      doctor: "Dr. Rajesh Kumar", 
      category: "Cardiology"
    }
  ];

  // Load prescriptions from Supabase
  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prescriptions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image (JPG, PNG) or PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadPrescription = async () => {
    if (!selectedFile || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload prescriptions.",
          variant: "destructive",
        });
        return;
      }

      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName);

      // Save prescription record to database
      const { error: dbError } = await supabase
        .from('prescriptions')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          doctor_name: doctorName.trim() || null,
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Prescription uploaded successfully.",
      });

      // Reset form and close dialog
      setTitle("");
      setDescription("");
      setDoctorName("");
      setSelectedFile(null);
      setUploadDialogOpen(false);
      
      // Reload prescriptions
      loadPrescriptions();
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = () => {
    setUploadDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "normal": return "bg-success text-success-foreground";
      case "abnormal": return "bg-destructive text-destructive-foreground";
      case "active": return "bg-primary text-primary-foreground";
      case "reviewed": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "cardiology": return <Activity className="h-4 w-4" />;
      case "general": return <Stethoscope className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredRecords = medicalRecords.filter(record =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
            <p className="text-muted-foreground">Manage and view your health documents</p>
          </div>
          <Button onClick={handleFileUpload} className="bg-gradient-to-r from-primary to-primary-dark">
            <Upload className="h-4 w-4 mr-2" />
            Upload Record
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records, hospitals, or doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
            <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
            <TabsTrigger value="lab">Lab Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          {getCategoryIcon(record.category)}
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground text-lg">
                            {record.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(record.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Hospital className="h-3 w-3" />
                              <span>{record.hospital}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Stethoscope className="h-3 w-3" />
                              <span>{record.doctor}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{record.type}</Badge>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                            <Badge variant="outline">{record.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="diagnostic">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Diagnostic reports will be filtered here</p>
            </div>
          </TabsContent>

          <TabsContent value="prescription">
            <div className="grid gap-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading prescriptions...</p>
                </div>
              ) : prescriptions.length > 0 ? (
                prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-start space-x-4">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-foreground text-lg">
                              {prescription.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(prescription.upload_date).toLocaleDateString()}</span>
                              </div>
                              {prescription.doctor_name && (
                                <div className="flex items-center space-x-1">
                                  <Stethoscope className="h-3 w-3" />
                                  <span>{prescription.doctor_name}</span>
                                </div>
                              )}
                            </div>
                            {prescription.description && (
                              <p className="text-sm text-muted-foreground">{prescription.description}</p>
                            )}
                            <div className="flex space-x-2">
                              <Badge variant="outline">Prescription</Badge>
                              <Badge className={getStatusColor(prescription.status)}>
                                {prescription.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(prescription.file_url, '_blank')}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open(prescription.file_url, '_blank')}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No prescriptions uploaded yet. Click "Upload Record" to add your first prescription.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lab">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Lab reports will be filtered here</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Upload Zone */}
        <Card className="border-2 border-dashed border-border hover:border-primary transition-colors">
          <CardContent className="p-12 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              Upload Medical Records
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here, or click to browse
            </p>
            <Button onClick={handleFileUpload}>
              Choose Files
            </Button>
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Prescription</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Blood Pressure Medication"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional notes or details"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="doctor">Doctor Name</Label>
                <Input
                  id="doctor"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              
              <div>
                <Label htmlFor="file">File *</Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: JPG, PNG, PDF (max 5MB)
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={uploadPrescription}
                  disabled={isUploading || !selectedFile || !title.trim()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Records;
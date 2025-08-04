-- Add additional fields to profiles table for comprehensive user information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS medical_notes TEXT;

-- Create medicines table for tracking user medications
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  purpose TEXT,
  prescriber TEXT,
  instructions TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on medicines table
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Create policies for medicines table
CREATE POLICY "Users can view their own medicines" 
ON public.medicines 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medicines" 
ON public.medicines 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medicines" 
ON public.medicines 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medicines" 
ON public.medicines 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create health_alerts table for notifications and scheduling
CREATE TABLE IF NOT EXISTS public.health_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'critical', 'reminder')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on health_alerts table
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for health_alerts table
CREATE POLICY "Users can view their own health alerts" 
ON public.health_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health alerts" 
ON public.health_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health alerts" 
ON public.health_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health alerts" 
ON public.health_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create activities table for tracking user actions
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('medicine', 'record', 'checkup', 'alert', 'prescription')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activities table
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities table
CREATE POLICY "Users can view their own activities" 
ON public.activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_medicines_updated_at
BEFORE UPDATE ON public.medicines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_alerts_updated_at
BEFORE UPDATE ON public.health_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policy for medicine files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medicine-files', 'medicine-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for medicine files storage
CREATE POLICY "Users can view their own medicine files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'medicine-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own medicine files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'medicine-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own medicine files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'medicine-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own medicine files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'medicine-files' AND auth.uid()::text = (storage.foldername(name))[1]);
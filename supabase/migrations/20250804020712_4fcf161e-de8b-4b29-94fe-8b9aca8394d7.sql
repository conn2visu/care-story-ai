-- Add missing columns to profiles table for enhanced profile functionality
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT,
ADD COLUMN date_of_birth DATE,
ADD COLUMN emergency_contact TEXT,
ADD COLUMN medical_notes TEXT;
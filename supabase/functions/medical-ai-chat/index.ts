import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  message: string;
  userId: string;
}

function generateMedicalResponse(message: string, medicalContext: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Analyze user's question and provide relevant response
  if (lowerMessage.includes('medicine') || lowerMessage.includes('medication') || lowerMessage.includes('drug')) {
    if (medicalContext.includes('No medical records found')) {
      return "I don't see any prescription records in your account yet. Once you upload your prescription files, I'll be able to help you track your medications, check for interactions, and provide detailed information about your medicines. Please upload your prescription documents first.";
    }
    
    const medicationMatches = medicalContext.match(/Medications: ([^}]+)/g);
    if (medicationMatches && medicationMatches.length > 0) {
      const medications = medicationMatches.map(match => match.replace('Medications: ', '')).filter(med => med !== 'Not specified');
      if (medications.length > 0) {
        return `Based on your uploaded prescriptions, here are your medications:\n\n${medications.join('\n')}\n\n⚠️ Important: Always consult your healthcare provider before making any changes to your medication regimen. If you have questions about dosages, side effects, or interactions, please speak with your doctor or pharmacist.`;
      }
    }
    
    return "I can see your prescription records but the medication details need to be extracted. Please ensure your prescription images are clear and contain medication names. Always consult your healthcare provider for specific medication guidance.";
  }
  
  if (lowerMessage.includes('analyze') || lowerMessage.includes('summary') || lowerMessage.includes('record')) {
    if (medicalContext.includes('No medical records found')) {
      return "You haven't uploaded any medical records yet. To get started:\n\n1. Go to the 'Records' section\n2. Click 'Upload New Record'\n3. Upload your prescription files, lab reports, or medical documents\n\nOnce uploaded, I'll be able to analyze your medical history and provide insights about your health records.";
    }
    
    const prescriptionCount = (medicalContext.match(/- Title:/g) || []).length;
    return `I've analyzed your ${prescriptionCount} uploaded medical record(s). Here's a summary:\n\n${medicalContext}\n\n📋 Key Points:\n• Keep all your medical records organized in one place\n• Regular follow-ups with healthcare providers are important\n• Always inform new doctors about your complete medical history\n\n⚠️ This summary is for informational purposes only. Please consult your healthcare provider for medical advice.`;
  }
  
  if (lowerMessage.includes('interaction') || lowerMessage.includes('side effect')) {
    return "For drug interactions and side effects, I recommend:\n\n🔍 **Drug Interaction Checkers:**\n• Consult your pharmacist - they're experts in medication interactions\n• Ask your doctor when prescribed new medications\n• Keep an updated list of all medications you take\n\n⚠️ **Important Safety Notes:**\n• Never stop medications without consulting your healthcare provider\n• Report any unusual symptoms to your doctor immediately\n• Inform all healthcare providers about your complete medication list\n\nThis information is educational only - always seek professional medical advice.";
  }
  
  if (lowerMessage.includes('schedule') || lowerMessage.includes('remind') || lowerMessage.includes('when')) {
    return "For medication scheduling and reminders:\n\n⏰ **Medication Management Tips:**\n• Set phone alarms for consistent timing\n• Use pill organizers for weekly planning\n• Take medications with meals if recommended\n• Never skip doses without consulting your doctor\n\n📱 **Helpful Tools:**\n• Medication reminder apps\n• Pharmacy automatic refill services\n• Calendar notifications\n\n⚠️ Always follow your doctor's specific instructions for timing and dosage.";
  }
  
  if (lowerMessage.includes('doctor') || lowerMessage.includes('appointment') || lowerMessage.includes('checkup')) {
    return "For medical appointments and healthcare:\n\n📅 **Scheduling Regular Checkups:**\n• Annual physical exams are important\n• Follow your doctor's recommended visit schedule\n• Prepare questions before appointments\n• Bring your medication list and medical records\n\n🏥 **When to See a Doctor:**\n• New or worsening symptoms\n• Medication side effects\n• Questions about your treatment plan\n• Routine preventive care\n\n⚠️ If you have urgent medical concerns, contact your healthcare provider immediately or seek emergency care.";
  }
  
  // Default response
  return `Thank you for your question about your medical records. I'm here to help you understand your health information and manage your medical documents.

🔍 **What I can help with:**
• Analyzing your uploaded prescription files
• Explaining medication information from your records  
• Summarizing your medical history
• Providing general health education

📋 **Your Current Records:** ${medicalContext.includes('No medical records found') ? 'No records uploaded yet' : `${(medicalContext.match(/- Title:/g) || []).length} record(s) available`}

⚠️ **Important:** This information is for educational purposes only. Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment decisions.

Feel free to ask specific questions about your uploaded medical records or request an analysis of your prescription files!`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId }: RequestBody = await req.json();
    
    if (!message || !userId) {
      throw new Error('Message and userId are required');
    }

    // Initialize Supabase client
    const supabaseUrl = "https://cdswwdkcnrvoqfgizrtf.supabase.co";
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceKey) {
      throw new Error('Supabase service key not found');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user's prescriptions
    const { data: prescriptions, error: prescError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (prescError) {
      console.error('Error fetching prescriptions:', prescError);
      throw new Error('Failed to fetch user prescriptions');
    }

    console.log(`Found ${prescriptions?.length || 0} prescriptions for user`);

    // Prepare context from user's medical data
    const medicalContext = prescriptions?.length > 0 
      ? `User's Medical Records:
${prescriptions.map(p => `
- Title: ${p.title}
- Upload Date: ${new Date(p.upload_date).toLocaleDateString()}
- Doctor: ${p.doctor_name || 'Not specified'}
- Description: ${p.description || 'No description'}
- Status: ${p.status}
- Medications: ${p.medication_names?.join(', ') || 'Not specified'}
`).join('\n')}` 
      : "No medical records found for this user.";

    // Generate AI response based on medical context
    const aiResponse = generateMedicalResponse(message, medicalContext);

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        context: `Based on ${prescriptions?.length || 0} medical records`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in medical-ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: "I'm sorry, I'm having trouble accessing your medical data right now. Please try asking your question again, or contact your healthcare provider for medical advice."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
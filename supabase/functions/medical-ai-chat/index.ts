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

    // Call OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const systemPrompt = `You are a medical AI assistant helping users understand their medical records and prescriptions. 

IMPORTANT GUIDELINES:
- Always provide helpful, accurate medical information
- Remind users to consult healthcare professionals for medical decisions
- Be empathetic and supportive
- Focus on explaining medical information clearly
- If asked about drug interactions, provide general information but emphasize consulting a doctor
- Never provide specific medical diagnoses or treatment recommendations

USER'S MEDICAL DATA:
${medicalContext}

When answering questions, reference the user's actual medical records when relevant. If the user asks about medicines, appointments, or medical history, use the data provided above.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

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
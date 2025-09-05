import OpenAI from 'openai';
import { supabase } from '../config/supabase';

// Initialize OpenAI client
const openai = import.meta.env.VITE_OPENAI_API_KEY ? new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, move this to server-side
}) : null;

// AI Service for generating personalized scripts and summaries
const generatePersonalizedScript = async (scenario, userState, userDetails = {}) => {
  try {
    // First try to get from database cache
    const { data: cachedScript } = await supabase
      .from('scripts')
      .select('script_text')
      .eq('scenario', scenario)
      .eq('language', userDetails.language || 'en')
      .eq('type', 'ai_generated')
      .single();

    if (cachedScript) {
      return cachedScript.script_text.replace(/\{state\}/g, userState);
    }

    // Generate new script using OpenAI (if available)
    if (openai) {
      const prompt = `Generate a professional, respectful de-escalation script for a ${scenario.replace('_', ' ')} scenario in ${userState}. 

The script should:
- Be respectful and non-confrontational
- Assert constitutional rights clearly
- Include state-specific considerations for ${userState}
- Mention the right to record (where legal)
- Ask key questions about detention status
- Be practical for real-world use
- Be approximately 100-150 words

Context: ${userDetails.context || 'General police interaction'}
User background: ${userDetails.background || 'Average citizen'}

Return only the script text, formatted for speaking aloud.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a legal rights expert specializing in police interactions. Generate clear, respectful scripts that help citizens exercise their constitutional rights safely."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const generatedScript = completion.choices[0].message.content;

      // Cache the generated script
      await supabase
        .from('scripts')
        .insert([
          {
            scenario,
            script_text: generatedScript,
            language: userDetails.language || 'en',
            type: 'ai_generated'
          }
        ]);

      return generatedScript;
    }
  } catch (error) {
    console.error('AI script generation error:', error);
    
    // Fallback to predefined scripts
    const baseScripts = {
      traffic_stop: `Good day, officer. I understand you've stopped me for a traffic matter. I want to be respectful and cooperative while exercising my constitutional rights.

I'm informing you that I will be recording this interaction for both of our protection, which is my legal right in ${userState}.

My hands are visible and I will move slowly. If you need me to reach for documents, please let me know when it's safe to do so.

Am I free to leave, or am I being detained? If I'm being detained, could you please tell me the specific reason?`,
      
      pedestrian_stop: `Hello, officer. I want to be respectful and cooperative.

I'm exercising my right to record this interaction for documentation purposes.

Could you please tell me why I'm being stopped? Am I free to leave?

I prefer to exercise my right to remain silent beyond identifying myself as required by ${userState} law. I do not consent to any searches of my person or belongings.

If you're detaining me, I'd like to know the specific reasonable suspicion or probable cause.`
    };

    return baseScripts[scenario] || baseScripts.traffic_stop;
  }
};

const generateRightsSummary = async (userState, currentContext = {}) => {
  try {
    // Try to get state-specific rights from database
    const { data: rightsData } = await supabase
      .from('rights_guides')
      .select('content')
      .eq('state', userState)
      .single();

    let stateSpecificRights = '';
    if (rightsData) {
      stateSpecificRights = rightsData.content;
    } else if (openai) {
      // Generate state-specific rights using AI
      const prompt = `Generate a concise, accurate summary of police interaction rights specific to ${userState}. Include:

1. Constitutional rights that apply
2. State-specific laws and requirements
3. Recording laws in ${userState}
4. Stop and identify requirements
5. Search and seizure protections
6. Key statutes or case law references

Format as bullet points, be factual and legally accurate. Focus on practical information citizens need during police interactions.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a legal expert specializing in constitutional law and state-specific police interaction rights. Provide accurate, up-to-date legal information."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3 // Lower temperature for more factual responses
      });

      stateSpecificRights = completion.choices[0].message.content;
    } else {
      // Fallback when OpenAI is not available
      stateSpecificRights = `**Your Rights in ${userState}:**
• You have the right to remain silent
• You can refuse searches of your person, car, or home without a warrant
• You have the right to record police interactions in public
• You can ask "Am I free to leave?"
• If arrested, you have the right to an attorney

**Key Points:**
• Check local "Stop and Identify" laws for ${userState}
• Recording police is generally legal in public spaces
• Vehicle searches typically require consent or probable cause
• Know your local statutes and precedents

**Important:**
• Stay calm and respectful during interactions
• Keep hands visible at all times
• Don't physically resist even if you believe the stop is unlawful
• Document everything you can safely observe`;
    }

    const summary = `🚨 EMERGENCY RIGHTS SUMMARY - ${userState}

📍 Location: ${userState}
⏰ Generated: ${new Date().toLocaleString()}
${currentContext.timestamp ? `📅 Incident Time: ${new Date(currentContext.timestamp).toLocaleString()}` : ''}

🔑 YOUR RIGHTS IN ${userState}:
${stateSpecificRights}

🆘 EMERGENCY CONTACTS:
• Emergency: 911
• ACLU Know Your Rights: 1-877-6-PROFILE
• Legal Aid Hotline: 211 (dial for local resources)
• Civil Rights Violations: FBI 1-800-CALL-FBI

📱 IMPORTANT REMINDERS:
• Stay calm and respectful
• Keep hands visible
• Don't resist physically
• Remember: You can remain silent
• Ask: "Am I free to leave?"
• Document everything possible

📋 CONTEXT:
${currentContext.location ? `• Location: ${currentContext.location}` : ''}
${currentContext.scenario ? `• Situation: ${currentContext.scenario}` : ''}
${currentContext.witnesses ? `• Witnesses: ${currentContext.witnesses}` : ''}

Generated by KnowYourRights AI - Stay informed, stay safe.
Share this with trusted contacts immediately if needed.`;

    return summary;
  } catch (error) {
    console.error('Rights summary generation error:', error);
    
    // Fallback summary
    const summary = `🚨 EMERGENCY RIGHTS SUMMARY - ${userState}

📍 Location: ${userState}
⏰ Generated: ${new Date().toLocaleString()}

🔑 KEY RIGHTS:
• Right to remain silent
• Right to refuse searches (without warrant)
• Right to record police interactions
• Right to ask "Am I free to leave?"
• Right to an attorney if arrested

⚖️ ${userState}-SPECIFIC NOTES:
• Check local "Stop and Identify" laws
• Recording police is generally legal in public
• Vehicle searches require consent or warrant
• Know your local statutes and precedents

🆘 EMERGENCY CONTACTS:
• Police: 911
• Legal Aid: [Local number]
• ACLU: 1-877-6-PROFILE

📱 Share this with trusted contacts immediately if needed.

Generated by KnowYourRights AI - Stay informed, stay safe.`;

    return summary;
  }
};

export { generatePersonalizedScript, generateRightsSummary };

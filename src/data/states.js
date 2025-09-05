export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 
  'West Virginia', 'Wisconsin', 'Wyoming'
];

export const RIGHTS_DATA = {
  "California": {
    title: "California Police Interaction Rights",
    content: `
**Your Rights in California:**
• You have the right to remain silent
• You can refuse searches of your person, car, or home without a warrant
• You have the right to record police interactions in public
• You can ask "Am I free to leave?"
• If arrested, you have the right to an attorney

**Key Points:**
• California requires consent for vehicle searches (except specific circumstances)
• You must provide ID if driving, but not as a pedestrian
• Recording police is protected under CA law when not interfering

**Relevant Statutes:**
• CA Penal Code § 148.6 (False reports)
• CA Vehicle Code § 12951 (License requirements)
• 1st Amendment protections for recording
    `,
    lastUpdated: "2024-01-15"
  },
  "Texas": {
    title: "Texas Police Interaction Rights",
    content: `
**Your Rights in Texas:**
• You have the right to remain silent
• You can refuse searches without a warrant
• You can record police in public spaces
• You must identify yourself if lawfully arrested
• You have the right to an attorney

**Key Points:**
• Texas has "Stop and Identify" laws - must provide name if lawfully detained
• Vehicle searches require consent or probable cause
• Open carry is legal with proper licensing

**Relevant Statutes:**
• TX Penal Code § 38.02 (Failure to Identify)
• TX Code of Criminal Procedure Art. 14.03
• TX Government Code Ch. 423 (Recording)
    `,
    lastUpdated: "2024-01-15"
  },
  "New York": {
    title: "New York Police Interaction Rights",
    content: `
**Your Rights in New York:**
• You have the right to remain silent
• You can refuse searches without a warrant
• You have the right to record police interactions
• You can ask if you're free to leave
• You have the right to an attorney

**Key Points:**
• NY does not have "Stop and Identify" laws
• Police cannot search without consent, warrant, or exigent circumstances
• Recording police is legal as long as you don't interfere

**Relevant Statutes:**
• NY CPL § 140.50 (Stop and frisk)
• NY Penal Law § 195.05 (Obstructing governmental administration)
• 1st Amendment recording protections
    `,
    lastUpdated: "2024-01-15"
  }
};

export const DE_ESCALATION_SCRIPTS = {
  "traffic_stop": {
    english: {
      title: "Traffic Stop De-escalation",
      script: `"Good [morning/afternoon/evening], officer. I understand you've stopped me. I want to cooperate fully while exercising my rights. 

Before we proceed, I want to inform you that I will be recording this interaction for both of our protection, which is my legal right.

I have my hands visible and will move slowly. If you need me to reach for my license and registration, please let me know when it's safe to do so.

Am I free to leave, or am I being detained?"`
    },
    spanish: {
      title: "Alto de Tráfico - Reducción de Tensiones",
      script: `"Buenos [días/tardes/noches], oficial. Entiendo que me ha detenido. Quiero cooperar completamente mientras ejerzo mis derechos.

Antes de proceder, quiero informarle que estaré grabando esta interacción para la protección de ambos, lo cual es mi derecho legal.

Tengo mis manos visibles y me moveré lentamente. Si necesita que alcance mi licencia y registro, por favor avíseme cuándo es seguro hacerlo.

¿Soy libre de irme, o estoy siendo detenido?"`
    }
  },
  "pedestrian_stop": {
    english: {
      title: "Pedestrian Stop De-escalation",
      script: `"Hello, officer. I want to be respectful and cooperative. 

I'm exercising my right to record this interaction. 

Could you please tell me why I'm being stopped? Am I free to leave?

I prefer to exercise my right to remain silent beyond providing this information. I'm not consenting to any searches.

If you're detaining me, I'd like to know the specific reason."`
    },
    spanish: {
      title: "Alto Peatonal - Reducción de Tensiones", 
      script: `"Hola, oficial. Quiero ser respetuoso y cooperativo.

Estoy ejerciendo mi derecho a grabar esta interacción.

¿Podría decirme por favor por qué me está deteniendo? ¿Soy libre de irme?

Prefiero ejercer mi derecho a permanecer en silencio más allá de proporcionar esta información. No consiento a ninguna búsqueda.

Si me está deteniendo, me gustaría conocer la razón específica."`
    }
  }
};
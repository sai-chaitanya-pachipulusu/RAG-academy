import { Dataset } from "./types";

/**
 * Medical Knowledge Base Dataset
 * 
 * Use case: Clinical decision support, patient education, symptom checking
 * Real-world inspiration: UpToDate, WebMD, Mayo Clinic
 * 
 * Note: This is educational/demo data only, not for actual medical use.
 */
export const MEDICAL_DATASET: Dataset = {
  id: "medical-knowledge",
  name: "Medical Knowledge Base",
  description: "Medical conditions, symptoms, and treatments for healthcare information retrieval.",
  docs: [
    {
      id: "med_diabetes_001",
      content: "Type 2 Diabetes Mellitus is a chronic metabolic disorder characterized by insulin resistance and relative insulin deficiency. Symptoms include increased thirst (polydipsia), frequent urination (polyuria), unexplained weight loss, fatigue, and blurred vision. Risk factors include obesity, sedentary lifestyle, family history, and age over 45.",
      metadata: { category: "endocrine", condition: "diabetes", severity: "chronic" },
    },
    {
      id: "med_diabetes_002",
      content: "Treatment for Type 2 Diabetes typically begins with lifestyle modifications: weight loss of 5-7%, regular physical activity (150 min/week moderate exercise), and dietary changes (reduced refined carbohydrates, increased fiber). First-line medication is usually Metformin, starting at 500mg twice daily. Target HbA1c is generally below 7%.",
      metadata: { category: "endocrine", condition: "diabetes", type: "treatment" },
    },
    {
      id: "med_hypertension_001",
      content: "Hypertension (High Blood Pressure) is defined as sustained blood pressure ≥130/80 mmHg. Often called the 'silent killer' as it frequently has no symptoms. Long-term complications include stroke, heart attack, kidney disease, and vision loss. Risk factors include high sodium diet, obesity, stress, and family history.",
      metadata: { category: "cardiovascular", condition: "hypertension", severity: "chronic" },
    },
    {
      id: "med_hypertension_002",
      content: "Hypertension treatment follows a stepped approach. Lifestyle modifications: DASH diet, sodium reduction (<2300mg/day), regular exercise, weight loss, limiting alcohol. First-line medications include ACE inhibitors (lisinopril), ARBs (losartan), calcium channel blockers (amlodipine), and thiazide diuretics (hydrochlorothiazide).",
      metadata: { category: "cardiovascular", condition: "hypertension", type: "treatment" },
    },
    {
      id: "med_migraine_001",
      content: "Migraine is a neurological condition characterized by recurrent moderate to severe headaches, often unilateral and pulsating. Associated symptoms include nausea, vomiting, photophobia (light sensitivity), and phonophobia (sound sensitivity). Some patients experience aura: visual disturbances, sensory changes, or speech difficulties before the headache.",
      metadata: { category: "neurology", condition: "migraine", severity: "episodic" },
    },
    {
      id: "med_migraine_002",
      content: "Migraine treatment includes acute and preventive strategies. Acute treatment: NSAIDs (ibuprofen), triptans (sumatriptan) for moderate-severe attacks. Preventive medications for ≥4 attacks/month: beta-blockers (propranolol), antidepressants (amitriptyline), anticonvulsants (topiramate), or CGRP inhibitors (erenumab). Lifestyle: identify triggers, regular sleep, hydration.",
      metadata: { category: "neurology", condition: "migraine", type: "treatment" },
    },
    {
      id: "med_anxiety_001",
      content: "Generalized Anxiety Disorder (GAD) involves persistent, excessive worry about various aspects of daily life for at least 6 months. Physical symptoms include restlessness, fatigue, difficulty concentrating, muscle tension, and sleep disturbances. GAD affects approximately 3% of the population and is more common in women.",
      metadata: { category: "psychiatry", condition: "anxiety", severity: "chronic" },
    },
    {
      id: "med_anxiety_002",
      content: "GAD treatment combines psychotherapy and medication. Cognitive Behavioral Therapy (CBT) is first-line, teaching techniques to identify and change negative thought patterns. Medications include SSRIs (sertraline, escitalopram) as first-line, SNRIs (venlafaxine, duloxetine), and buspirone. Benzodiazepines only for short-term use due to dependence risk.",
      metadata: { category: "psychiatry", condition: "anxiety", type: "treatment" },
    },
    {
      id: "med_asthma_001",
      content: "Asthma is a chronic respiratory condition characterized by airway inflammation, bronchospasm, and mucus production. Symptoms include wheezing, shortness of breath, chest tightness, and coughing (especially at night). Triggers include allergens, exercise, cold air, respiratory infections, and irritants like smoke.",
      metadata: { category: "pulmonology", condition: "asthma", severity: "chronic" },
    },
    {
      id: "med_asthma_002",
      content: "Asthma treatment follows a stepwise approach based on severity. All patients need a rescue inhaler (albuterol/salbutamol). Persistent asthma requires controller medications: inhaled corticosteroids (ICS) like fluticasone are first-line. Add-on therapies include long-acting beta-agonists (LABA), leukotriene modifiers, or biologics for severe cases.",
      metadata: { category: "pulmonology", condition: "asthma", type: "treatment" },
    },
    {
      id: "med_gerd_001",
      content: "Gastroesophageal Reflux Disease (GERD) occurs when stomach acid frequently flows back into the esophagus. Symptoms include heartburn, regurgitation, difficulty swallowing, and chronic cough. Risk factors include obesity, hiatal hernia, pregnancy, smoking, and certain foods (spicy, citrus, caffeine).",
      metadata: { category: "gastroenterology", condition: "gerd", severity: "chronic" },
    },
    {
      id: "med_gerd_002",
      content: "GERD treatment starts with lifestyle modifications: elevate head of bed, avoid eating 3 hours before sleep, weight loss, avoid trigger foods. Medications: antacids for occasional symptoms, H2 blockers (famotidine) for mild-moderate, proton pump inhibitors (omeprazole, pantoprazole) for moderate-severe. Surgery (fundoplication) for refractory cases.",
      metadata: { category: "gastroenterology", condition: "gerd", type: "treatment" },
    },
  ],
  queries: [
    {
      id: "q_diabetes_symptoms",
      text: "what are the symptoms of type 2 diabetes",
      relevantDocs: ["med_diabetes_001"],
    },
    {
      id: "q_diabetes_treatment",
      text: "how is diabetes treated with medication and lifestyle changes",
      relevantDocs: ["med_diabetes_002"],
    },
    {
      id: "q_high_bp_risks",
      text: "what complications can high blood pressure cause",
      relevantDocs: ["med_hypertension_001"],
    },
    {
      id: "q_bp_medications",
      text: "what medications are used to treat hypertension",
      relevantDocs: ["med_hypertension_002"],
    },
    {
      id: "q_migraine_aura",
      text: "what is migraine aura and what visual symptoms occur",
      relevantDocs: ["med_migraine_001"],
    },
    {
      id: "q_migraine_prevention",
      text: "how to prevent frequent migraines",
      relevantDocs: ["med_migraine_002"],
    },
    {
      id: "q_anxiety_therapy",
      text: "what therapy is recommended for anxiety disorder",
      relevantDocs: ["med_anxiety_002"],
    },
    {
      id: "q_asthma_triggers",
      text: "what triggers asthma attacks",
      relevantDocs: ["med_asthma_001"],
    },
    {
      id: "q_acid_reflux_lifestyle",
      text: "how to manage acid reflux without medication",
      relevantDocs: ["med_gerd_002"],
    },
  ],
};

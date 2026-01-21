import { Dataset } from "./types";

/**
 * Legal Documents Dataset
 * 
 * Use case: Contract analysis, legal research, compliance checking
 * Real-world inspiration: Westlaw, LexisNexis, Harvey AI
 */
export const LEGAL_DATASET: Dataset = {
  id: "legal-contracts",
  name: "Legal Contracts & Clauses",
  description: "Contract clauses and legal provisions for document analysis and question answering.",
  docs: [
    {
      id: "clause_nda_001",
      content: "CONFIDENTIALITY. The Receiving Party agrees to hold in strict confidence all Confidential Information disclosed by the Disclosing Party. Confidential Information shall not be disclosed to any third party without prior written consent. This obligation shall survive termination for a period of five (5) years.",
      metadata: { type: "nda", section: "confidentiality", jurisdiction: "delaware" },
    },
    {
      id: "clause_nda_002",
      content: "EXCEPTIONS TO CONFIDENTIALITY. The confidentiality obligations shall not apply to information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was rightfully in possession of the Receiving Party prior to disclosure; (c) is independently developed by the Receiving Party without use of Confidential Information.",
      metadata: { type: "nda", section: "exceptions", jurisdiction: "delaware" },
    },
    {
      id: "clause_indemnity_001",
      content: "INDEMNIFICATION. The Service Provider shall indemnify, defend, and hold harmless the Client from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising from: (a) breach of this Agreement; (b) negligence or willful misconduct; (c) violation of applicable law.",
      metadata: { type: "services", section: "indemnification", jurisdiction: "california" },
    },
    {
      id: "clause_limitation_001",
      content: "LIMITATION OF LIABILITY. IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, REGARDLESS OF THE CAUSE OF ACTION. THE TOTAL LIABILITY OF EITHER PARTY SHALL NOT EXCEED THE FEES PAID IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.",
      metadata: { type: "services", section: "liability", jurisdiction: "california" },
    },
    {
      id: "clause_termination_001",
      content: "TERMINATION FOR CONVENIENCE. Either party may terminate this Agreement for any reason upon thirty (30) days prior written notice to the other party. Upon termination, Client shall pay for all services rendered through the effective date of termination.",
      metadata: { type: "services", section: "termination", jurisdiction: "new_york" },
    },
    {
      id: "clause_termination_002",
      content: "TERMINATION FOR CAUSE. Either party may terminate this Agreement immediately upon written notice if the other party: (a) materially breaches any provision and fails to cure within thirty (30) days after notice; (b) becomes insolvent or files for bankruptcy; (c) ceases to conduct business in the normal course.",
      metadata: { type: "services", section: "termination", jurisdiction: "new_york" },
    },
    {
      id: "clause_ip_001",
      content: "INTELLECTUAL PROPERTY. All intellectual property rights in pre-existing materials shall remain with the original owner. Work Product created by Service Provider specifically for Client shall be owned by Client upon full payment. Service Provider retains rights to general knowledge, skills, and experience.",
      metadata: { type: "services", section: "ip_ownership", jurisdiction: "delaware" },
    },
    {
      id: "clause_force_majeure_001",
      content: "FORCE MAJEURE. Neither party shall be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to: acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemic, or strikes.",
      metadata: { type: "general", section: "force_majeure", jurisdiction: "general" },
    },
    {
      id: "clause_data_protection_001",
      content: "DATA PROTECTION. Service Provider shall implement appropriate technical and organizational measures to protect Personal Data against unauthorized access, accidental loss, or destruction. Service Provider shall process Personal Data only in accordance with Client's documented instructions and applicable data protection laws including GDPR and CCPA.",
      metadata: { type: "data", section: "privacy", jurisdiction: "eu_us" },
    },
    {
      id: "clause_governing_law_001",
      content: "GOVERNING LAW AND JURISDICTION. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles. Any disputes shall be resolved exclusively in the state or federal courts located in Wilmington, Delaware.",
      metadata: { type: "general", section: "governing_law", jurisdiction: "delaware" },
    },
    {
      id: "clause_assignment_001",
      content: "ASSIGNMENT. Neither party may assign or transfer this Agreement without the prior written consent of the other party, except that either party may assign this Agreement to a successor in connection with a merger, acquisition, or sale of all or substantially all of its assets.",
      metadata: { type: "general", section: "assignment", jurisdiction: "general" },
    },
    {
      id: "clause_non_compete_001",
      content: "NON-COMPETITION. During the term of this Agreement and for a period of twelve (12) months thereafter, the Contractor agrees not to directly or indirectly engage in any business that competes with the Company's business within the geographic territory where the Company operates.",
      metadata: { type: "employment", section: "non_compete", jurisdiction: "california" },
    },
  ],
  queries: [
    {
      id: "q_confidential_duration",
      text: "how long does the confidentiality obligation last after contract ends",
      relevantDocs: ["clause_nda_001"],
    },
    {
      id: "q_public_info_exception",
      text: "what information is not covered by confidentiality",
      relevantDocs: ["clause_nda_002"],
    },
    {
      id: "q_liability_cap",
      text: "what is the maximum liability and damages I can recover",
      relevantDocs: ["clause_limitation_001"],
    },
    {
      id: "q_end_contract_early",
      text: "can I cancel the contract before it expires",
      relevantDocs: ["clause_termination_001", "clause_termination_002"],
    },
    {
      id: "q_who_owns_work",
      text: "who owns the intellectual property and deliverables",
      relevantDocs: ["clause_ip_001"],
    },
    {
      id: "q_natural_disaster",
      text: "what happens if there is a pandemic or natural disaster",
      relevantDocs: ["clause_force_majeure_001"],
    },
    {
      id: "q_gdpr_compliance",
      text: "how is personal data protected under this agreement",
      relevantDocs: ["clause_data_protection_001"],
    },
    {
      id: "q_which_state_law",
      text: "which state law governs the contract disputes",
      relevantDocs: ["clause_governing_law_001"],
    },
  ],
};

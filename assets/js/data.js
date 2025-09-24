// NAVI Baseline 1.4a — config + keys + sample data
const NAVI_CONFIG = { NOVA_OFFERS_URL: "" };
const KEYS = {
  RESUME_TEXT: 'navi_resume_text',
  LETTER_TEXT: 'navi_letter_text',
  RESUME_TS:   'navi_resume_ts',
  LETTER_TS:   'navi_letter_ts',
  INTEL_LIST:  'navi_company_intel_list'
};

// Nova data (optional injection)
window.NOVA_RESULTS = window.NOVA_RESULTS || {
  traits: ["Strategic", "Empathetic", "Detail-Oriented", "Visionary", "Collaborative"],
  alignedRoles: ["Process Engineer", "Innovation Manager", "Business Intelligence Lead"]
};

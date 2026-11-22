export const MINISTRY_LOGO_MAP = {
  'Human Capital': '/logo/ministries/human-capital.png',
  'Talent Growth': '/logo/ministries/talent-growth.png',
  'Creative Enterprise': '/logo/ministries/creative-enterprise.png',
  'Student Advocacy & Welfare': '/logo/ministries/student-advocacy.png',
  'Inter-Agency Affairs': '/logo/ministries/inter-agency.png',
  'Studies & Strategic Action': '/logo/ministries/studies-action.png',
  'Social Equity & Environment': '/logo/ministries/social-equity.png',
  'Administration & Finance': '/logo/ministries/admin-finance.png',
  'Creative Media & Information': '/logo/ministries/creative-media.png',
  'IT Solutions': '/logo/ministries/it-solutions.png',
};

export const getMinistryLogo = (ministryName) => {
  if (!ministryName) return null;
  return MINISTRY_LOGO_MAP[ministryName] || null;
};

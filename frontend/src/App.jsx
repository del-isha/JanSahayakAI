import React, { useState, useEffect, useRef } from 'react';

// API Client Helper
const api = async (path, options = {}) => {
  const res = await fetch('/api' + path, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
};

const formPost = (data) => {
  const f = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v != null) f.append(k, v);
  });
  return { method: 'POST', body: f };
};

const jsonPost = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// SVG Icons
const ICONS = {
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  coins: <><circle cx="12" cy="12" r="9"/><path d="M9 9h6M9 12h6M9 15h4"/></>,
  doc: <><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h6M9 16h6"/></>,
  bell: <><path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/></>,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>,
  users: <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 5a3.5 3.5 0 010 7M18 14c2 .7 3 2.5 3 5"/></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></>,
  list: <path d="M5 7h14M5 12h14M5 17h14"/>,
  check: <path d="M5 12l5 5L20 7"/>,
  msg: <path d="M4 5h16v11H9l-5 4z"/>,
  scale: <path d="M12 4v16M6 20h12M5 8h14M5 8l-3 7a3 3 0 006 0zM19 8l-3 7a3 3 0 006 0z"/>,
  home: <path d="M4 11l8-7 8 7v9H4z"/>,
  bld: <><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2"/></>,
  cal: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></>,
  file: <path d="M7 3h8l4 4v14H7z"/>,
  folder: <path d="M3 6h6l2 2h10v11H3z"/>,
  gift: <><rect x="4" y="9" width="16" height="11"/><path d="M12 9v11M4 13h16M12 9c-3 0-4-4-1-4s1 4 1 4zm0 0c3 0 4-4 1-4"/></>,
  alert: <><path d="M12 4l9 16H3zM12 10v4M12 17v.5"/></>,
  chart: <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>,
  gear: <><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>,
};

function Icon({ name, style }) {
  return (
    <svg viewBox="0 0 24 24" style={style}>
      {ICONS[name] || ICONS.doc}
    </svg>
  );
}

const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
};

const STATUS_BADGE = {
  'Completed': 'b-ok',
  'confirmed': 'b-ok',
  'Confirmed': 'b-ok',
  'potentially_eligible': 'b-ok',
  'Potentially Eligible': 'b-ok',
  'Overdue': 'b-bad',
  'not_eligible': 'b-bad',
  'Not Eligible': 'b-bad',
  'Urgent': 'b-bad',
  'Action Required': 'b-warn',
  'Pending action': 'b-warn',
  'more_info_needed': 'b-warn',
  'More Information Needed': 'b-warn',
  'Pending Verification': 'b-warn',
  'In Progress': '',
  'Upcoming': 'b-mu',
  'needs_verification': '',
  'Needs Official Verification': '',
  'Draft': 'b-mu',
  'approved_by_citizen': 'b-ok',
  'awaiting_citizen_approval': 'b-warn'
};

const PRIORITY_BADGE = {
  Urgent: 'b-bad',
  High: 'b-bad',
  Medium: 'b-warn',
  Low: 'b-mu',
};

const SCHEME_LABELS = {
  confirmed: 'Confirmed',
  potentially_eligible: 'Potentially Eligible',
  more_info_needed: 'More Information Needed',
  not_eligible: 'Not Eligible',
  needs_verification: 'Needs Official Verification',
};

// Citizen Profiles
const SAMPLE_CITIZENS = {
  'delisha': {
    id: 'delisha',
    name: 'Delisha',
    age: 20,
    gender: 'female',
    occupation: '2nd Year College Student',
    occKey: 'student',
    income: 240000,
    state: 'Punjab',
    district: 'SAS Nagar (Mohali)',
    familyCategory: 'General',
    aadhaarVerified: true,
    hasGirlChild: false,
    isTaxPayer: false,
    propertyBuyer: false,
    desc: '2nd Year College Student exploring merit scholarships, tuition fee waivers & AI research programs'
  },
  'novalabs': {
    id: 'novalabs',
    name: 'KS ORIGIN COLLECTIVE PRIVATE LIMITED',
    role: 'Founder',
    type: 'company',
    cin: 'U47912HR2026PTC149798',
    pan: 'AANCK1913C',
    tan: 'RTKK14690E',
    incorpDate: '28 August 2026',
    address: 'Ho.No. 994, Sector 10, Sector 15 Panchkula, Panchkula- 134113, Haryana',
    authority: 'Registrar of Companies, Central Registration Centre (CRC), Manesar',
    registrar: 'KM Narayanan',
    age: 1,
    turnover: 0.5,
    gender: 'other',
    occupation: 'Private Limited Company (E-Commerce & Collective Trading)',
    occKey: 'business',
    income: 5000000,
    state: 'Haryana',
    district: 'Panchkula',
    familyCategory: 'General',
    aadhaarVerified: true,
    hasGirlChild: false,
    isTaxPayer: true,
    propertyBuyer: false,
    desc: 'KS ORIGIN COLLECTIVE PRIVATE LIMITED · CIN: U47912HR2026PTC149798'
  },
  'rajesh': {
    id: 'rajesh',
    name: 'Rajesh Kumar',
    age: 34,
    gender: 'male',
    occupation: 'Salaried Professional',
    occKey: 'salaried',
    income: 650000,
    state: 'Punjab',
    district: 'SAS Nagar (Mohali)',
    familyCategory: 'General',
    aadhaarVerified: true,
    hasGirlChild: true,
    isTaxPayer: true,
    propertyBuyer: true,
    desc: 'Working professional purchasing residential apartment in Mohali'
  },
  'priya': {
    id: 'priya',
    name: 'Priya Sharma',
    age: 21,
    gender: 'female',
    occupation: 'College Student (B.Tech 3rd Year)',
    occKey: 'student',
    income: 280000,
    state: 'Punjab',
    district: 'Patiala',
    familyCategory: 'OBC',
    aadhaarVerified: true,
    hasGirlChild: false,
    isTaxPayer: false,
    propertyBuyer: false,
    desc: 'Engineering student applying for Post-Matric fee reimbursement'
  },
  'gurpreet': {
    id: 'gurpreet',
    name: 'Gurpreet Singh',
    age: 46,
    gender: 'male',
    occupation: 'Cultivating Farmer',
    occKey: 'farmer',
    income: 320000,
    state: 'Punjab',
    district: 'Ludhiana',
    familyCategory: 'General',
    aadhaarVerified: true,
    hasGirlChild: false,
    isTaxPayer: false,
    propertyBuyer: false,
    landSeeding: true,
    desc: 'Small landholding farmer managing PM-KISAN e-KYC and crop insurance'
  },
  'sunita': {
    id: 'sunita',
    name: 'Sunita Devi',
    age: 38,
    gender: 'female',
    occupation: 'Self-Employed / Boutique Owner',
    occKey: 'business',
    income: 420000,
    state: 'Chandigarh',
    district: 'Sector 34, Chandigarh',
    familyCategory: 'General',
    aadhaarVerified: true,
    hasGirlChild: true,
    isTaxPayer: false,
    propertyBuyer: true,
    plansBusiness: true,
    desc: 'Micro-entrepreneur seeking Mudra loan and female property stamp duty rebate'
  },
  'harbans': {
    id: 'harbans',
    name: 'Harbans Lal',
    age: 72,
    gender: 'male',
    occupation: 'Senior Citizen Pensioner',
    occKey: 'senior',
    income: 180000,
    state: 'Punjab',
    district: 'Jalandhar',
    familyCategory: 'General',
    aadhaarVerified: true,
    hasGirlChild: false,
    isTaxPayer: false,
    propertyBuyer: false,
    desc: 'Retiree navigating Ayushman Vay Vandana and annual digital life certificate'
  }
};

// Grounded Curated Schemes by Persona for Instant & Seamless Homepage Showcase
const CURATED_PERSONA_SCHEMES = {
  'delisha': [
    {
      id: 'aicte_pragati',
      name: 'AICTE Pragati Scholarship for Girls in Technical Education',
      category: 'Education & Scholarships',
      dept: 'Ministry of Education / AICTE',
      benefits: '₹50,000 per year towards college tuition, books, and educational equipment.',
      reason: 'Qualified as 2nd year female college student in technical/degree program.',
      status: 'confirmed',
      url: 'https://www.aicte-pragati-saksham-gov.in'
    },
    {
      id: 'punjab_ashirwad',
      name: 'Punjab State Post-Matric Ashirwad & Merit Scholarship',
      category: 'Education & Scholarships',
      dept: 'Department of Social Justice & Empowerment, Punjab',
      benefits: '100% course fee waiver and monthly stipend for post-secondary and higher education in Punjab.',
      reason: 'Punjab domicile and verified student status meet state scholarship norms.',
      status: 'potentially_eligible',
      url: 'https://scholarships.punjab.gov.in'
    },
    {
      id: 'nsp_scholarship',
      name: 'Central Sector Scheme of Scholarship for College Students',
      category: 'Education & Scholarships',
      dept: 'Department of Higher Education, MoE',
      benefits: '₹12,000 to ₹20,000 per annum for regular undergraduate college degree education via DBT.',
      reason: 'Regular 2nd year college student with verified family income below ₹4.5 Lakh.',
      status: 'potentially_eligible',
      url: 'https://scholarships.gov.in'
    }
  ],
  'novalabs': [
    {
      id: 'dpiit_recognition',
      name: 'DPIIT Startup Recognition & 3-Year Tax Holiday (Section 80-IAC)',
      category: 'Business & Entrepreneurship',
      dept: 'DPIIT, Ministry of Commerce and Industry',
      benefits: '100% income tax exemption on profits for 3 consecutive years out of 10 years, plus angel tax exemption.',
      reason: 'Incorporated under 10 years and turnover under ₹100 Crore. Eligible upon innovation self-certification.',
      status: 'potentially_eligible',
      url: 'https://www.startupindia.gov.in'
    },
    {
      id: 'startup_sisfs',
      name: 'Startup India Seed Fund Scheme (SISFS)',
      category: 'Business & Entrepreneurship',
      dept: 'DPIIT / Incubator Network',
      benefits: 'Up to ₹20 Lakh grant for proof of concept and prototyping, plus up to ₹50 Lakh debt/convertible debentures.',
      reason: 'Early-stage startup within 2 years of incorporation with business traction.',
      status: 'potentially_eligible',
      url: 'https://seedfund.startupindia.gov.in'
    },
    {
      id: 'cgss',
      name: 'Credit Guarantee Scheme for Startups (CGSS)',
      category: 'Business & Entrepreneurship',
      dept: 'National Credit Guarantee Trustee Company (NCGTC)',
      benefits: 'Collateral-free debt funding and credit guarantee up to ₹10 Crore across member commercial banks.',
      reason: 'Recognised private limited company needing non-collateralized growth working capital.',
      status: 'potentially_eligible',
      url: 'https://www.ncgtc.in'
    }
  ],
  'rajesh': [
    {
      id: 'pmay_urban',
      name: 'Pradhan Mantri Awas Yojana (PMAY-Urban 2.0 Interest Subsidy)',
      category: 'Housing & Property',
      dept: 'Ministry of Housing and Urban Affairs (MoHUA)',
      benefits: 'Up to ₹2.67 Lakh upfront interest subsidy on home loans for first-time residential home buyers.',
      reason: 'Purchasing first residential property in Mohali with verified salaried income.',
      status: 'potentially_eligible',
      url: 'https://pmay-urban.gov.in'
    },
    {
      id: 'women_stamp_duty',
      name: 'Punjab State Women / Joint Homebuyer Stamp Duty Concession',
      category: 'Housing & Property',
      dept: 'Revenue & Rehabilitation Department, Punjab',
      benefits: '1% to 2% reduction in registration stamp duty for property registered in the name of a female family member.',
      reason: 'Applicable on Mohali property conveyance deed when purchasing jointly.',
      status: 'confirmed',
      url: 'https://revenue.punjab.gov.in'
    },
    {
      id: 'atal_pension',
      name: 'Atal Pension Yojana (APY Guaranteed Social Security)',
      category: 'Senior Citizens & Pensions',
      dept: 'Pension Fund Regulatory and Development Authority (PFRDA)',
      benefits: 'Government guaranteed monthly pension from ₹1,000 to ₹5,000 per month starting at age 60.',
      reason: 'Indian citizen between age 18 and 40 with active bank account.',
      status: 'potentially_eligible',
      url: 'https://www.npscra.nsdl.co.in'
    }
  ],
  'priya': [
    {
      id: 'punjab_obc_scholarship',
      name: 'Post-Matric Scholarship Scheme for OBC Students (Punjab)',
      category: 'Education & Scholarships',
      dept: 'Ministry of Social Justice & Empowerment / Punjab',
      benefits: '100% course and examination fee reimbursement plus monthly maintenance stipend.',
      reason: 'OBC engineering college student with household income under ₹2.5 Lakh.',
      status: 'confirmed',
      url: 'https://scholarships.punjab.gov.in'
    },
    {
      id: 'aicte_pragati_priya',
      name: 'AICTE Pragati Scholarship for Girls in Technical Education',
      category: 'Education & Scholarships',
      dept: 'Ministry of Education / AICTE',
      benefits: '₹50,000 per year towards educational expenses for female technical degree students.',
      reason: 'Female student admitted to AICTE-approved degree engineering course.',
      status: 'confirmed',
      url: 'https://www.aicte-pragati-saksham-gov.in'
    },
    {
      id: 'inspire_she_priya',
      name: 'DST INSPIRE Scholarship for Higher Education (SHE)',
      category: 'Education & Scholarships',
      dept: 'Department of Science & Technology',
      benefits: '₹80,000 per annum (₹60,000 scholarship + ₹20,000 research mentorship).',
      reason: 'Merit eligibility in higher technical education.',
      status: 'potentially_eligible',
      url: 'https://online-inspire.gov.in'
    }
  ],
  'gurpreet': [
    {
      id: 'pmkisan_gurpreet',
      name: 'PM-KISAN Samman Nidhi (Direct Benefit Transfer)',
      category: 'Agriculture & Farmers',
      dept: 'Ministry of Agriculture & Farmers Welfare',
      benefits: 'Direct cash benefit of ₹6,000 per annum paid in three equal installments of ₹2,000 into farmer bank account.',
      reason: 'Cultivating farmer family in Punjab with verified landholding.',
      status: 'confirmed',
      url: 'https://pmkisan.gov.in'
    },
    {
      id: 'pmkusum_gurpreet',
      name: 'PM-KUSUM Solar Agriculture Pumps & Solarization',
      category: 'Agriculture & Farmers',
      dept: 'Ministry of New and Renewable Energy (MNRE)',
      benefits: '60% capital subsidy (30% Central + 30% Punjab State) for installing solar irrigation pumps up to 7.5 HP.',
      reason: 'Eligible for agricultural tube-well solarization in Ludhiana.',
      status: 'potentially_eligible',
      url: 'https://pmkusum.mnre.gov.in'
    },
    {
      id: 'kcc_gurpreet',
      name: 'Kisan Credit Card (KCC Subsidized Crop Loan)',
      category: 'Agriculture & Farmers',
      dept: 'Department of Agriculture / NABARD',
      benefits: 'Subsidized working capital loan up to ₹3 Lakh at an effective interest rate of 4% per annum.',
      reason: 'Cultivating farmer in Ludhiana with prompt repayment record.',
      status: 'confirmed',
      url: 'https://www.myscheme.gov.in/schemes/kcc'
    }
  ],
  'sunita': [
    {
      id: 'mudra_sunita',
      name: 'Pradhan Mantri MUDRA Yojana (PMMY Kishor Loan)',
      category: 'Business & Entrepreneurship',
      dept: 'Department of Financial Services / MUDRA',
      benefits: 'Collateral-free business expansion loan from ₹50,000 to ₹5 Lakh at subsidized interest rates.',
      reason: 'Self-employed female entrepreneur managing active boutique enterprise.',
      status: 'potentially_eligible',
      url: 'https://www.mudra.org.in'
    },
    {
      id: 'standup_sunita',
      name: 'Stand-Up India Scheme for Women Entrepreneurs',
      category: 'Business & Entrepreneurship',
      dept: 'Ministry of Finance / SIDBI',
      benefits: 'Bank loans between ₹10 Lakh and ₹1 Crore for female-promoted enterprises.',
      reason: 'Woman entrepreneur launching or scaling a commercial enterprise.',
      status: 'potentially_eligible',
      url: 'https://www.standupmitra.in'
    },
    {
      id: 'lakhpati_sunita',
      name: 'Lakhpati Didi Initiative (Women Enterprise Empowerment)',
      category: 'Women & Child Welfare',
      dept: 'Ministry of Rural Development',
      benefits: 'Micro-credit, financial literacy, and supply chain market linkages for women entrepreneurs.',
      reason: 'Female entrepreneur eligible for community enterprise support.',
      status: 'confirmed',
      url: 'https://lakhpatididi.gov.in'
    }
  ],
  'harbans': [
    {
      id: 'vay_vandana_harbans',
      name: 'Ayushman Bharat Vay Vandana Card (Universal Senior 70+ Cover)',
      category: 'Healthcare & Social Welfare',
      dept: 'National Health Authority (NHA)',
      benefits: 'Universal free annual health insurance of ₹5 Lakh for every citizen aged 70 and above across 29,000+ hospitals.',
      reason: 'Indian citizen aged 72 with verified Aadhaar e-KYC.',
      status: 'confirmed',
      url: 'https://beneficiary.nha.gov.in'
    },
    {
      id: 'ignoaps_harbans',
      name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
      category: 'Senior Citizens & Pensions',
      dept: 'Ministry of Rural Development / NSAP',
      benefits: 'Monthly social security financial assistance deposited directly into senior citizen bank account via DBT.',
      reason: 'Senior citizen eligible under national social assistance guidelines.',
      status: 'potentially_eligible',
      url: 'https://nsap.nic.in'
    },
    {
      id: 'janaushadhi_harbans',
      name: 'PM Bharatiya Janaushadhi Pariyojana (Generic Medicine 50%-90% Discount)',
      category: 'Healthcare & Social Welfare',
      dept: 'Department of Pharmaceuticals',
      benefits: '2,000+ certified generic high-quality medicines at 50% to 90% discount through 10,000+ Kendras.',
      reason: 'Universal access to affordable daily and chronic medicines.',
      status: 'confirmed',
      url: 'https://janaushadhi.gov.in'
    }
  ]
};

const NAV_MODULES = [
  { id: 'ov', name: 'Overview', icon: 'home' },
  { id: 'comp', name: 'My Company', icon: 'bld' },
  { id: 'cal', name: 'Compliance Calendar', icon: 'cal' },
  { id: 'filings', name: 'Filings', icon: 'file' },
  { id: 'doc', name: 'Documents', icon: 'folder' },
  { id: 'sch', name: 'Government Schemes', icon: 'gift' },
  { id: 'ai', name: 'AI Assistant', icon: 'msg' },
  { id: 'not', name: 'Notice Desk', icon: 'alert' },
  { id: 'prof', name: 'Professionals', icon: 'users' },
  { id: 'rep', name: 'Reports', icon: 'chart' },
  { id: 'set', name: 'Settings', icon: 'gear' },
];

const PROMPT_CHIPS = [
  'What compliances are due this month?',
  'What documents are required for AOC-4?',
  'Find government schemes for my startup.',
  'Explain my latest compliance notice.',
  'Show my pending approvals.'
];

const STATUTORY_COMPLIANCES = [
  { form: 'INC-20A', category: 'ROC', due: '24 Feb 2027', daysLeft: '102', fee: 'Standard', status: 'Pending approval', statusClass: 'b-warn', priority: 'High' },
  { form: 'ADT-1', category: 'ROC', due: '27 Sep 2026', daysLeft: '—', fee: 'Standard', status: 'Draft', statusClass: 'b-mu', priority: 'High' },
  { form: 'Share Cert.', category: 'ROC', due: '27 Oct 2026', daysLeft: '—', fee: 'Stamp Duty', status: 'Draft', statusClass: 'b-mu', priority: 'High' },
  { form: 'GSTR-1', category: 'GST', due: '11 Nov 2026', daysLeft: 'Overdue', fee: '₹50/day', status: 'Overdue', statusClass: 'b-bad', priority: 'High' },
  { form: 'GSTR-3B', category: 'GST', due: '20 Nov 2026', daysLeft: '6', fee: '₹50/day', status: 'Under review', statusClass: 'badge', priority: 'High' },
];

const INITIAL_CHATS = {
  delisha: [
    {
      role: 'assistant',
      text: `Hello Delisha! I am JanSahayak AI, your personal government & education assistant. As a 2nd-year college student in Punjab, I am tracking for you:\n• Central Sector Scheme of Scholarship for College & University Students (NSP — ₹12,000/yr)\n• AICTE Pragati Scholarship for Girls in Technical Education (₹50,000/yr tuition & contingency)\n• State Post-Matric Merit Scholarship & College Tuition Fee Waiver eligibility\n• Student Concessions, Digital Library Access & Tehsildar Income Certificate documentation\n\nHow can I help you with your college schemes, scholarships, or documents today?`,
      meta: 'Verified Citizen Assistant · National Scholarship Portal & AICTE',
      portal: 'https://scholarships.gov.in'
    }
  ],
  novalabs: [
    {
      role: 'assistant',
      text: "Hello! I am your JanSahayak Compliance Assistant. Trained on the official Certificate of Incorporation for KS ORIGIN COLLECTIVE PRIVATE LIMITED (CIN: U47912HR2026PTC149798, PAN: AANCK1913C, TAN: RTKK14690E) issued by CRC Manesar on 28 August 2026.\n\nI am tracking your mandatory post-incorporation statutory compliances:\n• Form ADT-1 (First Statutory Auditor Appointment): Due within 30 days under Section 139(6)\n• Form INC-20A (Declaration of Commencement of Business): Due within 180 days (by 24 Feb 2027) under Section 10A\n• Issue of Stamped Share Certificates to subscribers: Due within 60 days (by 27 Oct 2026)\n• Haryana State Commercial Registrations & GST Activation\n\nAsk me anything about your statutory deadlines, board resolutions, or required filings.",
      meta: 'Verified Rules Engine · MCA CRC Manesar & Companies Act 2013',
      portal: 'https://www.mca.gov.in'
    }
  ],
  rajesh: [
    {
      role: 'assistant',
      text: `Hello Rajesh Kumar! I am JanSahayak AI, your personal government assistant. As a salaried homebuyer in Mohali, Punjab, I am tracking for you:\n• Step-by-step documentation for your Sector 82 flat purchase\n• 30-year Non-Encumbrance Certificate (EC) verification from Jamabandi Punjab\n• 1.5% Stamp Duty Concession if registering jointly with your wife\n• Your upcoming Driving Licence renewal (Expiring 28 Nov 2026)\n\nWhat would you like to accomplish today?`,
      meta: 'Verified Citizen Assistant · Punjab Land Records Society & Parivahan',
      portal: 'https://plrs.org.in'
    }
  ],
  priya: [
    {
      role: 'assistant',
      text: `Hello Priya Sharma! I am JanSahayak AI, your personal government assistant. As a 3rd-year engineering student in Patiala, I can help you with:\n• Dr. Ambedkar Post-Matric OBC Scholarship tuition fee reimbursement\n• Tehsildar Income Certificate application & notary affidavit format\n• Central Sector Scheme for University Students\n• Government exam fee waivers\n\nHow can I help you today?`,
      meta: 'Verified Citizen Assistant · Punjab Scholarship Portal & NSP',
      portal: 'https://scholarships.gov.in'
    }
  ],
  gurpreet: [
    {
      role: 'assistant',
      text: `Hello Sardar Gurpreet Singh! I am JanSahayak AI, your personal government assistant. For your farming operations in Ludhiana, I am tracking:\n• PM-KISAN 19th Installment Aadhaar e-KYC (Mandatory before 30 Nov 2026)\n• Subsidised solar water pumps under PM-KUSUM Scheme\n• Pradhan Mantri Fasal Bima Yojana (PMFBY) crop insurance claim procedure\n• Soil Health Card and fertilizer subsidy details\n\nWhat can I assist you with today?`,
      meta: 'Verified Citizen Assistant · Ministry of Agriculture & Farmers Welfare',
      portal: 'https://pmkisan.gov.in'
    }
  ],
  sunita: [
    {
      role: 'assistant',
      text: `Hello Sunita Devi! I am JanSahayak AI, your personal government assistant. Supporting your boutique & micro-business in Chandigarh with:\n• Pradhan Mantri Mudra Yojana (PMMY) collateral-free loan up to ₹10 Lakh\n• 1.5% Women Property Stamp Duty rebate for your commercial/residential purchase\n• Udyam MSME Registration for priority sector lending & subsidies\n• GST threshold exemptions for small businesses\n\nHow can I help your business grow today?`,
      meta: 'Verified Citizen Assistant · Ministry of MSME & Women Welfare',
      portal: 'https://udyamregistration.gov.in'
    }
  ],
  harbans: [
    {
      role: 'assistant',
      text: `Hello Harbans Lal! I am JanSahayak AI, your personal government assistant. As a senior citizen in Jalandhar, I am here to help you navigate:\n• Ayushman Bharat Vay Vandana Card (₹5 Lakh free annual health coverage for age 70+)\n• Jeevan Pramaan Digital Life Certificate submission from home using facial recognition\n• Senior Citizen Savings Scheme (SCSS) 8.2% interest guidelines\n• State pension grievance redressal\n\nWhat do you need assistance with today?`,
      meta: 'Verified Citizen Assistant · National Portal for Senior Citizens & NHA',
      portal: 'https://jeevanpramaan.gov.in'
    }
  ]
};

const STARTUP_DOCUMENTS = [
  {
    id: 'bank_account',
    title: 'Corporate Current Bank Account Opening & Subscriber Capital Deposit',
    category: 'Mandatory (30–90 Days)',
    timeline: 'Within 30–90 Days (Immediate)',
    deadlineDesc: 'Mandatory before filing Form INC-20A (180 days). Capital must be credited from subscribers.',
    authority: 'Scheduled Commercial Banks (RBI Regulated — ICICI, HDFC, SBI, Axis, etc.)',
    section: 'Section 10A of Companies Act, 2013 & RBI KYC Master Directions',
    status: 'Mandatory Prerequisite',
    badgeColor: 'b-bad',
    statutoryFees: '₹0 (Subject to Bank Minimum Average Balance ₹10,000–₹25,000)',
    penalty: 'Inability to file Form INC-20A; company cannot commence business or exercise borrowing powers.',
    portalName: 'Reserve Bank of India & Commercial Banks',
    portalUrl: 'https://www.rbi.org.in',
    summary: 'Every newly incorporated private limited company must open an operational corporate current bank account in the company name using its CIN, PAN, and TAN. All initial subscribers named in the Memorandum of Association (MOA) must deposit their agreed subscription capital into this account via RTGS/NEFT/Cheque from their personal accounts.',
    prerequisites: 'Certificate of Incorporation (CRC/MCA), Company PAN & TAN, Certified copies of MOA & AOA, Form INC-9 declarations, Board Resolution authorizing signatories, Director PAN, Aadhaar, and specimen signatures.',
    howToApplySteps: [
      '1. Convene First Board Meeting to pass a formal Board Resolution approving the opening of a Corporate Current Account and designating authorized director signatories.',
      '2. Gather certified true copies of: Certificate of Incorporation (CRC/MCA), Company PAN Card, registered MOA & AOA, and Registered Office Address Proof (Electricity/Water Bill < 2 months old + NOC from property owner).',
      '3. Assemble Director KYC documents: Self-attested PAN cards, Aadhaar / Passports of all directors, and Board Resolution with specimen signature cards.',
      '4. Submit application through the chosen bank’s corporate onboarding portal (e.g., ICICI iStartup, HDFC SmartHub, SBI Current Account) or visit the branch.',
      '5. Complete in-person or Video KYC verification with the bank relationship manager.',
      '6. Upon account allotment, ensure each subscriber transfers their exact committed share capital from their personal bank accounts into this current account.',
      '7. Download the stamped Bank Statement reflecting the subscriber capital credits (mandatory attachment for filing Form INC-20A with MCA).'
    ],
    draftTitle: 'Certified Board Resolution for Opening Corporate Current Bank Account',
    draftContent: `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE FIRST MEETING OF THE BOARD OF DIRECTORS OF KS ORIGIN COLLECTIVE PRIVATE LIMITED HELD ON 28TH AUGUST 2026 AT THE REGISTERED OFFICE OF THE COMPANY

OPENING OF CORPORATE CURRENT BANK ACCOUNT:
"RESOLVED THAT a Corporate Current Bank Account in the name of 'KS ORIGIN COLLECTIVE PRIVATE LIMITED' be opened with [NAME OF BANK], [BRANCH NAME], for conducting the company's financial transactions and receiving initial subscriber share capital.

RESOLVED FURTHER THAT [DIRECTOR 1 NAME], Director (DIN: [DIN 1]) and [DIRECTOR 2 NAME], Director (DIN: [DIN 2]) be and are hereby jointly / severally authorized to sign the account opening forms, submit KYC documents, provide specimen signatures, operate the said account, draw, accept, endorse cheques/bills of exchange, and access Internet Banking, Corporate UPI, and debit card facilities on behalf of the Company.

RESOLVED FURTHER THAT the bank be furnished with certified true copies of the Certificate of Incorporation (CIN: U47912HR2026PTC149798), Memorandum & Articles of Association, Company PAN (AAMCK6819K), and specimen signatures of authorized signatories, and that the bank be requested to act upon all instructions given by the said authorized signatories."

Certified True Copy,
For KS ORIGIN COLLECTIVE PRIVATE LIMITED

__________________________                  __________________________
[DIRECTOR 1 NAME]                           [DIRECTOR 2 NAME]
Director (DIN: [DIN 1])                     Director (DIN: [DIN 2])`
  },
  {
    id: 'first_auditor',
    title: 'First Statutory Auditor Appointment & Form ADT-1',
    category: 'Mandatory (30–90 Days)',
    timeline: 'Within 30 Days (Board) / 90 Days (Members - 3 Months)',
    deadlineDesc: 'Board must appoint within 30 days of incorporation. If Board fails, Members appoint within 90 days at an EGM. Form ADT-1 filed within 15 days.',
    authority: 'Ministry of Corporate Affairs (MCA) / Registrar of Companies (RoC)',
    section: 'Section 139(6) of Companies Act, 2013 & Rule 4(2) of Companies (Audit and Auditors) Rules, 2014',
    status: 'Mandatory Statutory',
    badgeColor: 'b-bad',
    statutoryFees: '₹200 to ₹600 MCA V3 filing fee depending on share capital',
    penalty: 'Additional MCA fee up to 18x normal fees under Section 403; general penalty under Section 450 (up to ₹10,000 + ₹1,000/day for continuing default).',
    portalName: 'Ministry of Corporate Affairs (MCA V3 Portal)',
    portalUrl: 'https://www.mca.gov.in',
    summary: 'The first auditor of a private limited company (other than a Government company) must be appointed by the Board of Directors within 30 days from the date of registration. In case the Board fails, the members of the company shall appoint the auditor within 90 days (3 months) at an Extra-Ordinary General Meeting (EGM). The auditor holds office until the conclusion of the first Annual General Meeting (AGM).',
    prerequisites: 'Written Consent Letter from Chartered Accountant / Firm, Certificate of Eligibility under Section 139 & 141, Firm Registration Number (FRN), Peer Review Certificate.',
    howToApplySteps: [
      '1. Obtain a formal written consent letter and Section 139/141 eligibility certificate from a practicing Chartered Accountant or CA firm.',
      '2. Convene a Board Meeting within 30 days of incorporation and pass a Board Resolution appointing the first statutory auditor.',
      '3. Issue formal appointment letter to the auditor and obtain their written acceptance.',
      '4. If the Board fails to appoint within 30 days, issue notice for an Extra-Ordinary General Meeting (EGM) within 90 days (3 months) for members to make the appointment.',
      '5. Log in to the MCA V3 Portal (mca.gov.in) with Company Authorized User credentials.',
      '6. Under "Company e-Filing", select Form ADT-1 (Information to the Registrar by Company for appointment of Auditor).',
      '7. Enter CIN U47912HR2026PTC149798, fill auditor details (FRN / Membership No), attach Board Resolution, Auditor Consent Letter, and Eligibility Certificate.',
      '8. Affix Digital Signature Certificate (DSC) of Director, pay statutory MCA fee, and download SRN acknowledgement receipt.'
    ],
    draftTitle: 'Board Resolution & Auditor Appointment Letter under Section 139(6)',
    draftContent: `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE FIRST MEETING OF THE BOARD OF DIRECTORS OF KS ORIGIN COLLECTIVE PRIVATE LIMITED HELD ON 28TH AUGUST 2026 AT THE REGISTERED OFFICE

APPOINTMENT OF FIRST STATUTORY AUDITOR:
"RESOLVED THAT pursuant to the provisions of Section 139(6) and other applicable provisions, if any, of the Companies Act, 2013 read with the Companies (Audit and Auditors) Rules, 2014, M/s. [NAME OF CA FIRM], Chartered Accountants (Firm Registration Number: [FRN]), who have consented in writing to act as statutory auditors and certified their eligibility under Section 141, be and are hereby appointed as the First Statutory Auditors of KS ORIGIN COLLECTIVE PRIVATE LIMITED.

RESOLVED FURTHER THAT the said Statutory Auditors shall hold office from the date of this meeting until the conclusion of the First Annual General Meeting (AGM) of the Company at a statutory audit remuneration of ₹[AMOUNT]/- (Rupees [WORDS] only) plus applicable GST and reimbursement of actual out-of-pocket expenses.

RESOLVED FURTHER THAT any Director of the Company be and is hereby authorized to file Form ADT-1 electronically with the Registrar of Companies, Ministry of Corporate Affairs, and do all such acts, deeds, and things as may be necessary to give effect to this resolution."

Certified True Copy,
For KS ORIGIN COLLECTIVE PRIVATE LIMITED

__________________________                  __________________________
[DIRECTOR 1 NAME]                           [DIRECTOR 2 NAME]
Director (DIN: [DIN 1])                     Director (DIN: [DIN 2])`
  },
  {
    id: 'inc20a_business',
    title: 'Declaration of Commencement of Business (Form INC-20A)',
    category: 'Statutory Filing (180 Days)',
    timeline: 'Mandatory Within 180 Days of Incorporation',
    deadlineDesc: 'Strict 180-day statutory window. Company cannot conduct commercial business or borrow funds without this filing.',
    authority: 'Registrar of Companies (RoC), Central Registration Centre (CRC)',
    section: 'Section 10A of Companies Act, 2013 & Rule 23A of Companies (Incorporation) Rules, 2014',
    status: 'Critical Compliance',
    badgeColor: 'b-bad',
    statutoryFees: '₹200 to ₹600 (Based on nominal share capital)',
    penalty: '₹50,000 penalty on the company; ₹1,000 per day on every defaulting director (up to ₹1,00,000 max). Registrar may initiate strike-off of company name under Section 248!',
    portalName: 'Ministry of Corporate Affairs (MCA V3 Portal)',
    portalUrl: 'https://www.mca.gov.in',
    summary: 'A company incorporated after November 2, 2018, having a share capital, shall not commence any business or exercise any borrowing powers unless a director files a declaration in Form INC-20A within 180 days of incorporation confirming that every subscriber to the memorandum has paid the value of shares agreed to be taken by them.',
    prerequisites: 'Operational Corporate Current Bank Account, Stamped Bank Statement showing credit of subscription capital from all subscribers, Geo-tagged photo of Registered Office with nameplate, Professional certification by CA/CS/CMA in practice.',
    howToApplySteps: [
      '1. Verify that 100% of subscriber capital has been credited into the corporate bank account from each initial subscriber.',
      '2. Obtain an official stamped bank statement showing the credits and account holder details.',
      '3. Take geo-tagged photographs of the registered office building showing external nameplate displaying Company Name, CIN, and Registered Address in English and Hindi.',
      '4. Access MCA V3 portal -> MCA Services -> Company e-Filing -> Form INC-20A.',
      '5. Enter CIN U47912HR2026PTC149798 to auto-fill company details; attach stamped bank statement and geo-tagged office photos.',
      '6. Attach Director Declaration Affidavit on non-judicial stamp paper.',
      '7. Affix Director DSC (DIN registered on MCA) and practicing professional certification (CA/CS/CMA).',
      '8. Submit and pay statutory fee online; obtain approved Challan/SRN receipt.'
    ],
    draftTitle: 'Director Declaration Affidavit for Form INC-20A on Stamp Paper',
    draftContent: `BEFORE THE REGISTRAR OF COMPANIES, CENTRAL REGISTRATION CENTRE, MINISTRY OF CORPORATE AFFAIRS
FORM INC-20A DECLARATION AFFIDAVIT
[Pursuant to Section 10A(1)(a) of Companies Act, 2013 and Rule 23A of Companies (Incorporation) Rules, 2014]

Name of Company: KS ORIGIN COLLECTIVE PRIVATE LIMITED
CIN: U47912HR2026PTC149798
Registered Office: [REGISTERED OFFICE ADDRESS, HARYANA]

I, [DIRECTOR NAME], Director (DIN: [DIN]), residing at [RESIDENTIAL ADDRESS], do hereby solemnly affirm and declare on oath as follows:
1. That I am a duly appointed Director of KS ORIGIN COLLECTIVE PRIVATE LIMITED and competent to swear this affidavit.
2. That every subscriber to the Memorandum of Association of the company has paid the full value of the shares agreed to be taken by them, aggregating to ₹[PAID UP CAPITAL]/- (Rupees [WORDS] only).
3. That the total subscription money has been received into the company's Corporate Current Bank Account No: [ACCOUNT NO] maintained with [BANK NAME], [BRANCH], IFSC: [IFSC], as evidenced by the stamped bank statement attached to Form INC-20A.
4. That the company's registered office situated at [ADDRESS, HARYANA] has been verified and an external nameplate displaying the Company Name, CIN, and Registered Address is clearly visible, as evidenced by the attached geo-tagged photographs.
5. That the company has not commenced any business operations or exercised borrowing powers prior to this declaration.

Deponent (Director)

VERIFICATION:
Verified at [CITY] on this [DATE] day of [MONTH], 2026, that the contents of paragraphs 1 to 5 above are true and correct to the best of my knowledge and belief, and nothing material has been concealed therefrom.

Deponent (Director)`
  },
  {
    id: 'share_certificates',
    title: 'Issue of Stamped Share Certificates (Form SH-1)',
    category: 'Mandatory (30–90 Days)',
    timeline: 'Within 60 Days of Incorporation',
    deadlineDesc: 'Section 56(4) mandates delivery of share certificates to subscribers within two months of incorporation.',
    authority: 'State Stamp Authority / Inspector General of Registration (Haryana)',
    section: 'Section 56(4)(a) of Companies Act, 2013 & Indian Stamp Act, 1899',
    status: 'Mandatory Corporate',
    badgeColor: 'b-warn',
    statutoryFees: '0.005% of value of shares issued (Haryana Stamp Duty)',
    penalty: 'Fine on company of not less than ₹50,000 extending up to ₹5,00,000; every defaulting officer punishable with fine between ₹10,000 and ₹1,00,000 under Section 56(6). Unstamped certificates cannot be produced as legal evidence.',
    portalName: 'e-Gras Haryana Stamp Duty Portal',
    portalUrl: 'https://egrashry.nic.in',
    summary: 'Every company must deliver share certificates in Form SH-1 to all subscribers to the memorandum within two months (60 days) from the date of incorporation. In addition, the share certificates must be duly stamped under the relevant State Stamp Act within 30 days of issue (stamp duty rate: 0.005% of consideration value under the Finance Act 2019 / Indian Stamp Rules).',
    prerequisites: 'Allotment resolution passed in First Board Meeting, Share Distinctive Numbers (e.g. 0001 to 10000), Folio numbers, Haryana e-Stamp Duty payment challan.',
    howToApplySteps: [
      '1. Calculate statutory stamp duty on the total issue value of subscriber shares at 0.005% (e.g., ₹50 for ₹10,00,000 capital).',
      '2. Log into State Stamp Duty Portal (e-Gras Haryana: egrashry.nic.in or Stock Holding Corporation e-Stamping) under Major Head "0030 - Stamp Duty on Share Certificates".',
      '3. Pay stamp duty online and generate the Stamp Duty Challan / e-Stamp Certificate.',
      '4. Print Form SH-1 certificates on security bond paper or attach the e-stamp certificate sheet.',
      '5. Ensure certificates are signed by two Directors or one Director and Company Secretary, and affixed with Common Seal (if any).',
      '6. Issue certificates to subscribers against signed delivery receipts and update Register of Members (Form MGT-1).'
    ],
    draftTitle: 'Form SH-1 Share Certificate Template & Board Allotment Resolution',
    draftContent: `FORM NO. SH-1: SHARE CERTIFICATE
[Pursuant to Section 46(3) of Companies Act, 2013 and Rule 5(2) of Companies (Share Capital and Debentures) Rules, 2014]

KS ORIGIN COLLECTIVE PRIVATE LIMITED
(CIN: U47912HR2026PTC149798 | Registered in Haryana under Companies Act, 2013)
Registered Office: [REGISTERED OFFICE ADDRESS, HARYANA]

Certificate No: 001                                  Folio No: F-01
Number of Shares: [10,000] (Ten Thousand Equity Shares)
Face Value: ₹10/- each                               Paid-up: ₹10/- per share

THIS IS TO CERTIFY that [SUBSCRIBER/SHAREHOLDER NAME], residing at [ADDRESS], is the registered holder of [10,000] Equity Shares of ₹10/- each, fully paid up, bearing Distinctive Numbers from 00001 to 10000 inclusive in KS ORIGIN COLLECTIVE PRIVATE LIMITED, subject to the Memorandum and Articles of Association of the Company.

Haryana Stamp Duty paid under Article 19: ₹50/- (e-Stamp Certificate No: [STAMP_CERT_NO])

Given under the hands of the authorized Directors of the Company on this [DAY] day of [MONTH], 2026.

__________________________                  __________________________
[DIRECTOR 1 NAME]                           [DIRECTOR 2 NAME]
Director (DIN: [DIN 1])                     Director (DIN: [DIN 2])`
  },
  {
    id: 'first_board_meeting',
    title: 'First Board Meeting & Statutory Registers / Minutes Book',
    category: 'Mandatory (30–90 Days)',
    timeline: 'Within 30 Days of Incorporation',
    deadlineDesc: 'First Board meeting must be held within 30 days of incorporation under Section 173(1).',
    authority: 'Ministry of Corporate Affairs / Secretarial Standards Board (ICSI)',
    section: 'Section 173(1), Section 88, Section 118 of Companies Act, 2013 & ICSI SS-1',
    status: 'Secretarial Standard',
    badgeColor: 'b-warn',
    statutoryFees: '₹0 (Internal compliance)',
    penalty: 'Penalty of ₹25,000 on the company and ₹5,000 on every officer in default for violation of Section 173; penalty under Section 118 for non-maintenance of minutes.',
    portalName: 'Institute of Company Secretaries of India (ICSI SS-1 Guidance)',
    portalUrl: 'https://www.icsi.edu',
    summary: 'The company must hold its first meeting of the Board of Directors within thirty days from the date of its incorporation. The meeting formalizes crucial statutory items: noting incorporation, adoption of MOA/AOA, disclosure of director interests (Form MBP-1), appointment of first statutory auditor, authorization for bank account, and issue of share certificates. Statutory registers (MGT-1, MBP-4, DIR-12) must be instituted.',
    prerequisites: 'Notice of First Board Meeting sent at least 7 days prior to all directors, agenda papers, Form MBP-1 disclosures.',
    howToApplySteps: [
      '1. Issue 7 days advance written notice of meeting along with detailed agenda to all directors.',
      '2. Collect Form MBP-1 (Disclosure of Interest in other entities) and Form DIR-8 (Non-disqualification certificate) from each director.',
      '3. Convene meeting, ensure requisite quorum (minimum 2 directors for private company).',
      '4. Transact statutory agenda: note incorporation, approve registered office, appoint first auditor, authorize bank signatories, approve share certificate issuance.',
      '5. Prepare draft minutes within 15 days, circulate to directors for comments within 15 days.',
      '6. Finalize minutes and enter into statutory Minutes Book within 30 days of meeting, signed by Meeting Chairman.'
    ],
    draftTitle: 'Comprehensive Minutes of the First Meeting of Board of Directors',
    draftContent: `MINUTES OF THE FIRST MEETING OF THE BOARD OF DIRECTORS OF KS ORIGIN COLLECTIVE PRIVATE LIMITED
HELD ON 28TH AUGUST 2026 AT 11:00 AM AT THE REGISTERED OFFICE OF THE COMPANY IN HARYANA

PRESENT:
1. [DIRECTOR 1 NAME] - Director & Chairman
2. [DIRECTOR 2 NAME] - Director

1. CHAIRMAN OF THE MEETING:
[DIRECTOR 1 NAME] was elected as Chairman of the meeting and welcomed the directors to the first meeting following incorporation.

2. CERTIFICATE OF INCORPORATION & MOA/AOA:
The Certificate of Incorporation issued by Central Registration Centre (CRC), MCA bearing CIN U47912HR2026PTC149798 dated 28th August 2026 along with registered MOA and AOA was placed before the Board and noted.

3. REGISTERED OFFICE OF THE COMPANY:
The Board noted that the Registered Office of the company is situated in the State of Haryana as per the incorporation application.

4. DISCLOSURE OF DIRECTORS' INTEREST:
Notices of disclosure of interest in Form MBP-1 pursuant to Section 184(1) and declarations of non-disqualification under Form DIR-8 pursuant to Section 164(2) were received from all directors and recorded.

5. APPOINTMENT OF FIRST STATUTORY AUDITOR:
The Board resolved to appoint M/s. [AUDITOR NAME], Chartered Accountants, as First Statutory Auditors under Section 139(6) till the conclusion of 1st AGM.

6. OPENING OF CURRENT BANK ACCOUNT:
The Board resolved to open a Current Account with [BANK NAME] and authorized Directors to operate the same.

7. ISSUE OF SHARE CERTIFICATES:
The Board resolved that Share Certificates in Form SH-1 be issued to initial subscribers within 60 days upon payment of statutory stamp duty.

There being no further business, the meeting concluded with a vote of thanks to the Chair.

Chairman: _________________________`
  },
  {
    id: 'dpiit_startup',
    title: 'DPIIT Startup India Recognition & Section 80-IAC Tax Holiday',
    category: 'Tax & Registrations',
    timeline: 'Apply Upon Incorporation (Recommended within 30–60 Days)',
    deadlineDesc: 'Enables 100% tax holiday for 3 consecutive years and exemption from Angel Tax (Section 56(2)(viib)).',
    authority: 'Department for Promotion of Industry and Internal Trade (DPIIT) & CBDT',
    section: 'Startup India Notification G.S.R. 127(E) & Section 80-IAC of Income Tax Act, 1961',
    status: 'High Growth Benefit',
    badgeColor: 'b-ok',
    statutoryFees: '₹0 (Completely Free on Startup India portal)',
    penalty: 'Missing recognition forfeits income tax exemptions, patent discounts (80%), and access to Startup India Seed Fund Scheme (SISFS) grants up to ₹50 Lakhs.',
    portalName: 'National Startup India Portal (DPIIT)',
    portalUrl: 'https://www.startupindia.gov.in',
    summary: 'DPIIT Recognition grants your company official "Startup" status under the Startup India initiative. Eligible startups receive 80% rebate in patent filing fees, 50% rebate in trademark filings, self-certification under 9 labor and 3 environmental laws, eligibility for government procurement without prior turnover/experience conditions, and opportunity to apply for 3-year consecutive income tax exemption under Section 80-IAC through the Inter-Ministerial Board (IMB).',
    prerequisites: 'Certificate of Incorporation, Pitch Deck or video link demonstrating innovation, scalability, and employment potential, Director details, Registered Office details.',
    howToApplySteps: [
      '1. Visit startupindia.gov.in and click "Register" to create your Startup profile.',
      '2. Navigate to "DPIIT Recognition for Startups" application form.',
      '3. Fill Entity Details: Company Name, CIN, PAN, Incorporation Date, Registered Office Address.',
      '4. Select Industry, Sector, and stage of development (Ideation / Validation / Early Traction / Scaling).',
      '5. Submit Innovation Note: Explain what problem your product/service solves, uniqueness, market scalability, and job creation potential.',
      '6. Upload Certificate of Incorporation and pitch deck/brochure; verify and submit.',
      '7. Download the digital DPIIT Certificate of Recognition upon approval (usually within 48–72 hours).',
      '8. Separately apply for Section 80-IAC tax exemption through the IMB approval module.'
    ],
    draftTitle: 'Startup India Innovation Pitch Deck Executive Summary & Self-Declaration',
    draftContent: `DPIIT STARTUP INDIA RECOGNITION - INNOVATION SUMMARY & SELF-DECLARATION
(Under Notification G.S.R. 127(E) & Section 80-IAC of Income Tax Act, 1961)

1. ENTITY PROFILE:
Name of Startup: KS ORIGIN COLLECTIVE PRIVATE LIMITED
CIN: U47912HR2026PTC149798 | Incorporation Date: 28th August 2026
Registered Office: Haryana, India
Industry: Technology / Consumer Services / Retail Intelligence
Sector: Enterprise Software & Consumer Logistics

2. INNOVATION & PROBLEM STATEMENT:
Our venture develops an AI-driven, citizen-centric intelligence orchestration engine that resolves statutory compliance friction, automates regulatory verification, and democratizes access to public welfare schemes and business entitlements.

3. UNIQUENESS & COMPETITIVE ADVANTAGE:
Unlike manual consultation or static portals, our platform executes real-time multi-agent legal verification, instant clause defect extraction, and autonomous statutory drafting with zero latency.

4. SCALABILITY & WEALTH CREATION:
The technology is cloud-native and highly scalable across India's 65M+ MSMEs and 1.4B citizens, creating high-value technical and operational employment in Haryana and nationwide.

5. SELF-DECLARATION:
We hereby declare that KS ORIGIN COLLECTIVE PRIVATE LIMITED is not formed by the splitting up or reconstruction of an existing business and its turnover has not exceeded ₹100 Crores in any financial year.

Authorized Signatory:
[DIRECTOR NAME], Director (DIN: [DIN])`
  },
  {
    id: 'gst_registration',
    title: 'GST Registration (Form GST REG-01) & State Tax Compliance',
    category: 'Tax & Registrations',
    timeline: 'Within 30 Days of Liability or Voluntary Registration Immediately',
    deadlineDesc: 'Required for inter-state supply, e-commerce, or turnover > ₹20/40 Lakhs. Voluntary registration recommended for ITC claim.',
    authority: 'Goods and Services Tax Network (GSTN) / Haryana State GST & Central GST',
    section: 'Section 22 & 24 of CGST Act, 2017 & Haryana GST Act',
    status: 'Tax Statutory',
    badgeColor: 'b-ok',
    statutoryFees: '₹0 (Official government application is free)',
    penalty: 'Penalty under Section 122 of CGST Act: 10% of tax amount or ₹10,000 (whichever is higher); 100% tax penalty for deliberate evasion.',
    portalName: 'Goods and Services Tax Portal (GSTN)',
    portalUrl: 'https://www.gst.gov.in',
    summary: 'Mandatory for any company making inter-state supply of goods or services, participating in e-commerce, or having aggregate turnover exceeding threshold limits. Voluntary registration is strongly recommended for startups to claim Input Tax Credit (ITC) on pre-incorporation expenses, SaaS tools, laptop/hardware purchases, and professional fees.',
    prerequisites: 'Certificate of Incorporation, Company PAN, Board Resolution authorizing signatory, Registered Office Rent Agreement / Electricity Bill, Landlord NOC, Director Aadhaar & PAN.',
    howToApplySteps: [
      '1. Go to gst.gov.in -> Services -> Registration -> New Registration.',
      '2. Generate Temporary Reference Number (TRN) using Company PAN, Mobile, and Email OTP verification.',
      '3. Log in with TRN and fill Part-B of Form GST REG-01.',
      '4. Enter Company Profile: CIN U47912HR2026PTC149798, Legal Name, Constitution of Business (Private Limited Company).',
      '5. Enter Principal Place of Business in Haryana: attach electricity bill (< 2 months old), Rent Agreement, and Landlord NOC.',
      '6. Add Director details and designate Authorized Signatory with Board Resolution.',
      '7. Select Opt-in for Aadhaar Authentication of Authorized Signatory for expedited approval without physical inspection.',
      '8. Submit with Director DSC; receive Application Reference Number (ARN) within 15 minutes and GSTIN Certificate (Form GST REG-06) within 3–7 working days.'
    ],
    draftTitle: 'Board Resolution Authorizing Director for GST Registration & Landlord NOC',
    draftContent: `BOARD RESOLUTION FOR GST REGISTRATION & AUTHORIZATION OF SIGNATORY
(Under Section 22/24 of Central Goods & Services Tax Act, 2017)

CERTIFIED TRUE COPY OF THE RESOLUTION PASSED BY THE BOARD OF DIRECTORS OF KS ORIGIN COLLECTIVE PRIVATE LIMITED AT ITS MEETING HELD ON 28TH AUGUST 2026 AT THE REGISTERED OFFICE

"RESOLVED THAT the Company do make an application for obtaining Goods and Services Tax (GST) Registration under the Central Goods and Services Tax Act, 2017 and Haryana State GST Act in the State of Haryana.

RESOLVED FURTHER THAT [DIRECTOR NAME], Director (DIN: [DIN], PAN: [PAN]) be and is hereby designated as Authorized Signatory of the Company for the purpose of making applications, uploading documents, authenticating via Aadhaar OTP/DSC, signing returns, and representing the Company before GST authorities.

RESOLVED FURTHER THAT a No-Objection Certificate (NOC) and utility bill for the registered office at [REGISTERED ADDRESS, HARYANA] be executed and submitted along with Form GST REG-01."

Certified True Copy,
For KS ORIGIN COLLECTIVE PRIVATE LIMITED

__________________________
[DIRECTOR 2 NAME], Director (DIN: [DIN 2])`
  },
  {
    id: 'udyam_msme',
    title: 'Udyam MSME Registration (Micro / Small Enterprise Certificate)',
    category: 'Tax & Registrations',
    timeline: 'Immediate / Within 30 Days (Instant Online Certificate)',
    deadlineDesc: 'Completely paperless, zero-fee, instant lifetime certificate for MSME benefits.',
    authority: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
    section: 'Micro, Small and Medium Enterprises Development (MSMED) Act, 2006',
    status: 'Instant Benefit',
    badgeColor: 'b-ok',
    statutoryFees: '₹0 (Completely free, beware of fraudulent paid portals)',
    penalty: 'No statutory penalty, but missing MSME registration forfeits statutory 45-day payment recovery rights under Section 15, CGTMSE loan guarantees, and electricity tariff subsidies.',
    portalName: 'National Udyam Registration Portal',
    portalUrl: 'https://udyamregistration.gov.in',
    summary: 'Udyam Registration legally classifies the company as a Micro, Small, or Medium Enterprise based on investment in plant & machinery and turnover. Key advantages: 45-day statutory payment protection under Section 15 of MSMED Act (buyers must pay within 45 days or pay compound interest at 3x RBI bank rate), 1% interest rate concession on bank overdrafts/loans, priority sector lending, collateral-free CGTMSE bank loans up to ₹5 Crores, and 50% patent/trademark discount.',
    prerequisites: 'Director Aadhaar, Company PAN, Company GSTIN (if applicable), Bank Account details.',
    howToApplySteps: [
      '1. Visit the official portal: udyamregistration.gov.in (ensure URL ends with .gov.in).',
      '2. Select "For New Entrepreneurs who are not Registered yet as MSME".',
      '3. Enter Director Aadhaar Number and Name as per Aadhaar; complete Aadhaar OTP validation.',
      '4. Select Type of Organization: "Private Limited Company", enter Company PAN (AAMCK6819K) and validate with CBDT database.',
      '5. Fill Company Registered Office address in Haryana, date of incorporation (28/08/2026), and active corporate bank account details (Account No & IFSC).',
      '6. Enter National Industry Classification (NIC) 5-digit code matching primary business activities (e.g. 62011 for Software / 47912 for Retail via Internet).',
      '7. State investment and employment count, click Final Submit & OTP validation.',
      '8. Instant generation of official Udyam Registration Certificate containing dynamic QR code.'
    ],
    draftTitle: 'Board Authorization & Udyam MSME Declaration Format',
    draftContent: `BOARD DECLARATION & AUTHORIZATION FOR UDYAM MSME REGISTRATION
(Under the Micro, Small and Medium Enterprises Development Act, 2006)

Name of Company: KS ORIGIN COLLECTIVE PRIVATE LIMITED
CIN: U47912HR2026PTC149798 | PAN: AAMCK6819K

"RESOLVED THAT the Company be registered as a Micro/Small Enterprise under the Micro, Small and Medium Enterprises Development Act, 2006 on the National Udyam Portal.

RESOLVED FURTHER THAT [DIRECTOR NAME], Director (Aadhaar: [AADHAAR]) be and is hereby authorized to submit the online Udyam registration application, declare investment in plant, machinery, and equipment, and execute all necessary verifications to obtain the Udyam Registration Certificate.

RESOLVED FURTHER THAT the Company actively avail statutory protections under Section 15 of MSMED Act for mandatory 45-day payment realizations from commercial buyers."

For KS ORIGIN COLLECTIVE PRIVATE LIMITED

__________________________
Director (DIN: [DIN])`
  }
];

const SCHEME_CATEGORIES = [
  { id: 'All', name: 'All Schemes', icon: '🌐' },
  { id: 'Business & Entrepreneurship', name: 'Business & Entrepreneurship', icon: '💼' },
  { id: 'Education & Scholarships', name: 'Education & Scholarships', icon: '🎓' },
  { id: 'Agriculture & Farmers', name: 'Agriculture & Farmers', icon: '🌾' },
  { id: 'Housing & Property', name: 'Housing & Property', icon: '🏠' },
  { id: 'Healthcare & Social Welfare', name: 'Healthcare & Social Welfare', icon: '🏥' },
  { id: 'Women & Child Welfare', name: 'Women & Child Welfare', icon: '🌸' },
  { id: 'Senior Citizens & Pensions', name: 'Senior Citizens & Pensions', icon: '👴' },
];

const CATEGORY_CHIPS = {
  'All': ['startup scolarship', 'PMRF Research', 'PM-KISAN ₹6,000', 'Ayushman PM-JAY', 'Mudra Loan', 'PMAY Housing'],
  'Business & Entrepreneurship': ['DPIIT Recognition', 'Section 80-IAC Tax Holiday', 'SISFS Seed Grant', 'Mudra Loan', 'MSME Udyam', 'BIRAC BIG Grant'],
  'Education & Scholarships': ['PMRF Research ₹80,000', 'NSP Post-Matric', 'AICTE Pragati Girls', 'Inspire SHE', 'Dr. Ambedkar EBC', 'Ishan Uday NE'],
  'Agriculture & Farmers': ['PM-KISAN ₹6,000', 'PMFBY Crop Insurance', 'PM-KUSUM Solar Pump', 'Kisan Credit Card (KCC)', 'e-NAM Mandi', 'SMAM Machinery 40-50%'],
  'Housing & Property': ['PMAY-Urban Subsidy', 'PMAY-Gramin Pucca House', 'Women 1.5% Stamp Duty', 'ARHC Urban Rental', 'SWAMIH Stalled Housing'],
  'Healthcare & Social Welfare': ['Ayushman PM-JAY ₹5L', 'Vay Vandana 70+ Universal', 'Jan Aushadhi 90% Discount', 'Rashtriya Arogya Nidhi (RAN)', 'Free Dialysis Pradhan Mantri'],
  'Women & Child Welfare': ['Sukanya Samriddhi 8.2%', 'Lakhpati Didi SHG', 'PM Matru Vandana ₹5,000', 'Mahila Samman Certificate 7.5%', 'POSHAN 2.0 Nutrition Tracker'],
  'Senior Citizens & Pensions': ['SCSS 8.2% Sovereign Payout', 'Atal Pension APY ₹5,000', 'Ayushman 70+ Universal Free', 'PM Vaya Vandana Assured', 'Jeevan Pramaan Face DLC']
};

const getCitizenGreeting = (citizenObj) => {
  const init = INITIAL_CHATS[citizenObj.id];
  return init ? init[0].text : `Hello ${citizenObj.name}! I am JanSahayak AI, your personal government assistant. Explain what you want to achieve (e.g. house purchase documents, scholarship eligibility, notice reply, driving licence renewal, or income certificate).`;
};

export default function App() {
  const [viewMode, setViewMode] = useState('app'); // 'app' | 'landing'
  const [activeTab, setActiveTab] = useState('ov');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [drawerData, setDrawerData] = useState(null);
  const [modalData, setModalData] = useState(null);

  // 1-Click Light and Dark Mode State
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('jansahayak_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('jansahayak_theme', theme);
    } catch {}
  }, [theme]);

  // Active Citizen State
  const [activeCitizenId, setActiveCitizenId] = useState('delisha');
  const [trainedDocs, setTrainedDocs] = useState([]);
  const [apiDeadlines, setApiDeadlines] = useState([]);
  const [backendHealth, setBackendHealth] = useState({ ok: true, service: 'JanSahayak AI Citizen Platform', llm: { connected: false, provider: 'Grounded Rules Engine', model: 'Deterministic Legal KB' } });

  // 1. GET /api/health
  const fetchBackendHealth = () => {
    api('/health').then(data => {
      if (data) setBackendHealth(data);
    }).catch(() => {});
  };

  // 2. GET /api/deadlines
  const fetchDeadlines = () => {
    api('/deadlines').then(dl => {
      if (Array.isArray(dl) && dl.length) setApiDeadlines(dl);
    }).catch(() => {});
  };

  // Fetch trained model documents
  const fetchTrainedDocs = () => {
    api('/documents/trained').then(data => {
      if (data && data.documents) setTrainedDocs(data.documents);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchTrainedDocs();
    fetchBackendHealth();
    fetchDeadlines();
  }, []);

  // 3. Dedicated Pan-India Scholarships API (GET /api/scholarships)
  const fetchScholarshipsApi = async (categoryFilter = 'All') => {
    setSchemeLoading(true);
    try {
      const q = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'All') q.set('category', categoryFilter);
      if (citizen.state) q.set('state', citizen.state);
      const res = await api('/scholarships?' + q.toString());
      if (res && res.scholarships) {
        setSchemes(res.scholarships);
        setSchemeAgentSummary(`Scholarships & Grants API (NSP / AICTE / PMRF / State): Loaded ${res.total} verified programs.`);
        showToast(`Loaded ${res.total} verified scholarships from Pan-India Scholarships API`);
      }
    } catch (err) {
      showToast('Scholarships API error: ' + err.message);
    }
    setSchemeLoading(false);
  };

  // 4. All Schemes API (GET /api/schemes)
  const fetchAllSchemesApi = async () => {
    setSchemeLoading(true);
    try {
      const data = await api('/schemes');
      if (Array.isArray(data)) {
        setSchemes(data);
        setSchemeAgentSummary(`Loaded all ${data.length} central & state government schemes from database.`);
        showToast(`Loaded ${data.length} schemes from Central & State Schemes API`);
      }
    } catch (err) {
      showToast('Error loading schemes: ' + err.message);
    }
    setSchemeLoading(false);
  };

  // 5. GET /api/notices/{cid}
  const loadCaseById = async (cid) => {
    if (!cid) return;
    setDocBusy(true);
    try {
      const caseData = await api(`/notices/${cid}`);
      setActiveAnalysisCase(caseData);
      showToast(`Case ${cid} retrieved from backend Notice Store!`);
    } catch (err) {
      showToast(`Case retrieval failed: ${err.message}`);
    }
    setDocBusy(false);
  };

  const trainActiveDocument = async () => {
    if (!activeAnalysisCase) return;
    try {
      const res = await api('/documents/train', jsonPost({
        doc_id: activeAnalysisCase.id,
        filename: activeAnalysisCase.filename,
        text: activeAnalysisCase.text
      }));
      showToast(res.message || 'Model successfully trained with document!');
      fetchTrainedDocs();
    } catch (err) {
      showToast('Training error: ' + err.message);
    }
  };

  const deleteTrainedDoc = async (docId) => {
    try {
      await api(`/documents/trained/${docId}`, { method: 'DELETE' });
      showToast('Document removed from model training memory');
      fetchTrainedDocs();
    } catch (err) {
      showToast('Error removing document: ' + err.message);
    }
  };

  const resetTrainedMemory = async () => {
    try {
      const res = await api('/documents/reset-training', { method: 'POST' });
      setTrainedDocs([]);
      showToast(res.message || 'Trained model memory cleared');
    } catch (err) {
      showToast('Error clearing memory: ' + err.message);
    }
  };
  const [companyYears, setCompanyYears] = useState(1);
  const [companyTurnover, setCompanyTurnover] = useState(0.5);
  const [dpiitRecognised, setDpiitRecognised] = useState(false);
  const [womanPromoter, setWomanPromoter] = useState(false);
  const [agmDate, setAgmDate] = useState('2026-09-30');
  const citizen = SAMPLE_CITIZENS[activeCitizenId] || SAMPLE_CITIZENS.delisha || SAMPLE_CITIZENS.rajesh;

  // Concise Profile & Login Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');

  // API Key & Model Intelligence State
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInfo, setApiKeyInfo] = useState({
    connected: false,
    provider: 'JanSahayak Trained Rules Engine',
    model: 'deterministic-v2',
    masked_key: 'Not Configured'
  });
  const [inputApiKey, setInputApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('gemini');
  const [apiKeySaving, setApiKeySaving] = useState(false);

  // Fetch API key status on load
  const refreshApiKeyStatus = () => {
    api('/settings/apikey')
      .then((data) => setApiKeyInfo(data))
      .catch(() => {});
  };

  useEffect(() => {
    refreshApiKeyStatus();
  }, []);

  const saveApiKey = async () => {
    if (!inputApiKey.trim()) {
      showToast('Please enter an API key');
      return;
    }
    setApiKeySaving(true);
    try {
      const res = await api('/settings/apikey', jsonPost({ provider: apiProvider, api_key: inputApiKey.trim() }));
      setApiKeyInfo(res.status || { connected: true, provider: apiProvider, model: 'custom' });
      setInputApiKey('');
      setApiKeyModalOpen(false);
      showToast(res.message || 'API Key connected successfully!');
    } catch (err) {
      showToast('Error saving key: ' + err.message);
    }
    setApiKeySaving(false);
  };

  // Per-Citizen Personalized Chat Histories
  const [chatHistories, setChatHistories] = useState(INITIAL_CHATS);

  // Global Toast
  const toastTimer = useRef(null);
  const showToast = (msg) => {
    setToastText(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(''), 3200);
  };

  // 1. Citizen Tasks & Deadlines State
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Driving Licence Renewal Submission', case: 'DL Renewal Case #8812', due: '2026-11-28', priority: 'High', status: 'Action Required', next: 'Submit Form 9 online on Parivahan Sewa' },
    { id: 2, name: 'Non-Encumbrance Certificate (EC) Verification', case: 'Property Purchase Mohali', due: '2026-12-05', priority: 'Urgent', status: 'In Progress', next: 'Download 30-year EC from Sub-Registrar Jamabandi portal' },
    { id: 3, name: 'Annual Income Self-Declaration Affidavit', case: 'Income Certificate Application', due: '2026-12-10', priority: 'Medium', status: 'Pending Verification', next: 'Sign affidavit before Executive Magistrate or Notary' },
    { id: 4, name: 'Municipal Property Tax Early-Bird Payment', case: 'Annual Property Assessment', due: '2026-12-31', priority: 'Low', status: 'Upcoming', next: 'Pay before 31 Dec to claim 10% rebate' },
    { id: 5, name: 'PM-KISAN Aadhaar e-KYC Seeding', case: 'PM-KISAN 19th Installment', due: '2026-11-30', priority: 'Urgent', status: 'Action Required', next: 'Complete OTP-based e-KYC on pmkisan.gov.in' },
  ]);

  // Load backend citizen deadlines
  useEffect(() => {
    fetchDeadlines();
  }, []);

  // 2. Citizen Persistent Cases State
  const [cases, setCases] = useState([
    {
      id: 'case-prop-101',
      title: 'Residential Property Purchase & Registry Verification',
      category: 'Housing & Property',
      refNo: 'REG/PB/MOHALI/2026/0491',
      date: '2026-11-04',
      status: 'Active',
      summary: 'Due diligence for 3BHK flat in Sector 82 Mohali. Checking 30-year encumbrance, female co-owner stamp rebate (1.5%), and circle rate calculation.',
      portal: 'Jamabandi Punjab (plrs.org.in)',
      uploadedDocs: ['Agreement to Sell Draft.pdf', 'Chain Title Deed 2012.pdf', 'Seller Aadhar & PAN.pdf'],
      missingDocs: ['30-Year Non-Encumbrance Certificate (EC)', 'Society NOC'],
      tasksCount: 3,
      draftReady: true,
      approved: false
    },
    {
      id: 'case-inc-204',
      title: 'Tehsildar Annual Income Certificate Application',
      category: 'Certificates',
      refNo: 'EDIST/PB/2026/INC/99201',
      date: '2026-11-08',
      status: 'Ready for Review',
      summary: 'Application for statutory income certificate under Public Services Guarantee Act for scholarship fee waiver.',
      portal: 'Punjab Seva Kendra / e-District',
      uploadedDocs: ['Salary Certificate.pdf', 'Electricity Bill Sept.pdf', 'Ration Card.pdf'],
      missingDocs: ['Self-Declaration Notarized Affidavit'],
      tasksCount: 2,
      draftReady: true,
      approved: true
    },
    {
      id: 'case-dl-309',
      title: 'Driving Licence Renewal & mParivahan Slot',
      category: 'Licence & Transport',
      refNo: 'PB-65-2016-0044192',
      date: '2026-11-10',
      status: 'Action Required',
      summary: 'DL expiring on 28 Nov 2026. Renewal under CMV Rule 18 with Form 9 and Form 1-A medical clearance.',
      portal: 'Parivahan Sewa (parivahan.gov.in)',
      uploadedDocs: ['Existing Smart Card DL Copy.pdf', 'Aadhaar Card.pdf'],
      missingDocs: ['Form 1-A Medical Fitness (Age > 40)'],
      tasksCount: 2,
      draftReady: false,
      approved: false
    }
  ]);

  const [activeCaseId, setActiveCaseId] = useState('case-prop-101');
  const currentCase = cases.find(c => c.id === activeCaseId) || cases[0];

  // 3. Citizen Schemes State & AI Schemes Discovery Agent
  const [schemes, setSchemes] = useState([]);
  const [schemeCategory, setSchemeCategory] = useState('All');
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [schemeQuery, setSchemeQuery] = useState('');
  const [schemeAgentSummary, setSchemeAgentSummary] = useState('');

  const runSchemeSearch = async (customQuery, categoryOverride) => {
    const queryText = customQuery !== undefined ? customQuery : schemeQuery;
    const cat = categoryOverride !== undefined ? categoryOverride : schemeCategory;
    setSchemeLoading(true);
    try {
      const data = await api('/schemes/search', jsonPost({
        query: queryText,
        age: citizen.age,
        occupation: citizen.occKey || 'salaried',
        income: citizen.income,
        state: citizen.state,
        gender: citizen.gender,
        category: cat
      }));
      setSchemes(data.schemes || []);
      setSchemeAgentSummary(data.agent_summary || '');
      if (queryText && queryText.trim()) {
        showToast(`Discovery Agent: Found ${data.total} matching programs`);
      }
    } catch {
      fetchCitizenSchemes(citizen);
    }
    setSchemeLoading(false);
  };

  const fetchCitizenSchemes = async (prof) => {
    setSchemeLoading(true);
    try {
      const data = await api('/schemes/match', jsonPost({
        age: prof.age,
        occupation: prof.occKey || 'salaried',
        income: prof.income,
        state: prof.state,
        gender: prof.gender,
        has_girl_child: prof.hasGirlChild || false,
        is_tax_payer: prof.isTaxPayer || false,
        plans_business: prof.plansBusiness || false,
        land_seeding: prof.landSeeding || false
      }));
      setSchemes(data);
      setSchemeAgentSummary(`AI Schemes Discovery Agent evaluated ${data.length} programs matching ${prof.name}'s profile.`);
    } catch {
      // fallback
    }
    setSchemeLoading(false);
  };

  useEffect(() => {
    runSchemeSearch(schemeQuery, schemeCategory);
  }, [activeCitizenId]);

  useEffect(() => {
    if (activeTab === 'sch' && schemes.length === 0) {
      runSchemeSearch(schemeQuery, schemeCategory);
    }
  }, [activeTab]);

  // Grounded Homepage Schemes Curation: Matches active citizen persona with verified fallbacks
  const getHomeSchemes = () => {
    const defaultList = CURATED_PERSONA_SCHEMES[activeCitizenId] || CURATED_PERSONA_SCHEMES.delisha;
    if (schemes && schemes.length > 0) {
      const occ = (citizen.occKey || citizen.occupation || '').toLowerCase();
      let matches = [];
      if (occ.includes('student')) {
        matches = schemes.filter(s => s.category === 'Education & Scholarships');
      } else if (occ.includes('business') || citizen.type === 'company') {
        matches = schemes.filter(s => s.category === 'Business & Entrepreneurship');
      } else if (occ.includes('farmer')) {
        matches = schemes.filter(s => s.category === 'Agriculture & Farmers');
      } else if (occ.includes('senior')) {
        matches = schemes.filter(s => s.category === 'Senior Citizens & Pensions' || s.category === 'Healthcare & Social Welfare');
      } else {
        matches = schemes.filter(s => s.status === 'confirmed' || s.status === 'potentially_eligible');
      }
      if (matches.length >= 3) {
        return matches.slice(0, 3);
      }
      if (matches.length > 0) {
        const needed = 3 - matches.length;
        const additional = defaultList.filter(d => !matches.some(m => m.name === d.name)).slice(0, needed);
        return [...matches, ...additional];
      }
    }
    return defaultList;
  };
  const homeMatchedSchemes = getHomeSchemes();


  // 4. AI Assistant Chat State (Per-Citizen Stream - English Only)
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);

  // Active chat stream for current citizen
  const activeChatMessages = chatHistories[activeCitizenId] || INITIAL_CHATS[activeCitizenId] || INITIAL_CHATS.delisha || INITIAL_CHATS.rajesh;

  const clearChatForCitizen = () => {
    setChatHistories(prev => ({
      ...prev,
      [activeCitizenId]: [
        {
          role: 'assistant',
          text: getCitizenGreeting(citizen),
          meta: 'Verified Citizen Assistant · Official Rules Engine',
          portal: 'https://services.india.gov.in'
        }
      ]
    }));
    showToast(`Started fresh chat session for ${citizen.name}`);
  };

  const sendChatMessage = async (overrideText) => {
    const text = overrideText || chatInput;
    if (!text.trim()) return;
    setChatInput('');

    // Append user message to active citizen's history
    setChatHistories(prev => ({
      ...prev,
      [activeCitizenId]: [
        ...(prev[activeCitizenId] || []),
        { role: 'user', text }
      ]
    }));
    setChatBusy(true);

    try {
      const res = await api('/chat', jsonPost({
        message: text,
        citizen_name: citizen.name,
        citizen_occupation: citizen.occKey,
        citizen_state: citizen.state,
        citizen_gender: citizen.gender
      }));

      setChatHistories(prev => ({
        ...prev,
        [activeCitizenId]: [
          ...(prev[activeCitizenId] || []),
          {
            role: 'assistant',
            text: res.answer,
            meta: `${res.kind === 'verified' ? 'Verified Government Rule' : 'Guidance'} · ${res.source}`,
            process: res.process,
            portal: res.portal
          }
        ]
      }));
    } catch (err) {
      setChatHistories(prev => ({
        ...prev,
        [activeCitizenId]: [
          ...(prev[activeCitizenId] || []),
          { role: 'assistant', text: 'Error: ' + err.message, meta: 'System' }
        ]
      }));
    }
    setChatBusy(false);
  };

  // 5. Document Intelligence & Notice Analysis State
  const [docText, setDocText] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docAdditionalEvidence, setDocAdditionalEvidence] = useState('');
  const [activeAnalysisCase, setActiveAnalysisCase] = useState(null);
  const [docBusy, setDocBusy] = useState(false);
  const [activeDocDetailTab, setActiveDocDetailTab] = useState('overview');
  const [selectedStartupCategory, setSelectedStartupCategory] = useState('All');
  const [editedDraft, setEditedDraft] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  const copyDraftToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast('Draft representation copied to clipboard!');
  };

  const downloadDraftFile = (filename, content) => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'Notice_Representation_Draft.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename || 'Notice_Representation_Draft.txt'}`);
  };

  const runDocumentAnalysis = async (customText, fileOverride) => {
    const fileToUse = fileOverride !== undefined ? fileOverride : docFile;
    const textToRun = customText !== undefined ? customText : docText;
    if (!textToRun.trim() && !fileToUse) {
      showToast('Please upload a document or paste text to analyse.');
      return;
    }
    setDocBusy(true);
    try {
      const payload = { text: textToRun, docs: '' };
      if (fileToUse) payload.file = fileToUse;
      const res = await api('/documents/analyze', formPost(payload));
      setActiveAnalysisCase(res);
      if (res && res.draft) {
        setEditedDraft(res.draft);
      }
      setIsEditingDraft(false);
      if (res && res.extracted && res.extracted.category === 'COMPANY_INCORPORATION') {
        setActiveDocDetailTab('startup_docs');
      }
      fetchTrainedDocs();
      showToast('Document analysed & model successfully trained with extracted clauses!');
    } catch (err) {
      showToast('Analysis error: ' + err.message);
    }
    setDocBusy(false);
  };

  const addCaseEvidence = async () => {
    if (!docAdditionalEvidence.trim() || !activeAnalysisCase) return;
    try {
      const res = await api(`/notices/${activeAnalysisCase.id}/evidence`, formPost({ docs: docAdditionalEvidence }));
      setActiveAnalysisCase(res);
      if (res && res.draft) {
        setEditedDraft(res.draft);
      }
      setDocAdditionalEvidence('');
      showToast('Additional document registered! Agent checklist updated.');
    } catch (err) {
      showToast('Evidence error: ' + err.message);
    }
  };

  const approveCaseDraft = async () => {
    if (!activeAnalysisCase) return;
    try {
      const res = await api(`/notices/${activeAnalysisCase.id}/approve`, { method: 'POST' });
      if (editedDraft && editedDraft !== res.draft) {
        res.draft = editedDraft;
      }
      setActiveAnalysisCase(res);
      setIsEditingDraft(false);
      // add to tasks
      setTasks(prev => [
        {
          id: Date.now(),
          name: `Submit representation for ${res.extracted.reference || 'Notice'}`,
          case: res.extracted.document_type,
          due: res.extracted.response_deadline,
          priority: 'Urgent',
          status: 'Approved by Citizen',
          next: `Submit signed draft on ${res.research.portal}`
        },
        ...prev
      ]);
      showToast('Draft approved by citizen! Deadline added to Compliance Calendar & Tasks.');
    } catch (err) {
      showToast('Approval error: ' + err.message);
    }
  };

  const isStartupDoc = Boolean(
    (activeAnalysisCase && (
      activeAnalysisCase.extracted?.category === 'COMPANY_INCORPORATION' ||
      (activeAnalysisCase.extracted?.document_type || '').toLowerCase().includes('incorporation') ||
      (activeAnalysisCase.extracted?.reference || '').startsWith('U') ||
      (activeAnalysisCase.extracted?.authority || '').toLowerCase().includes('corporate')
    )) ||
    (docText && (
      docText.toLowerCase().includes('incorporation') ||
      docText.toLowerCase().includes('u47912') ||
      docText.toLowerCase().includes('spice+')
    )) ||
    (docFile && (
      docFile.name.toLowerCase().includes('coi') ||
      docFile.name.toLowerCase().includes('spice') ||
      docFile.name.toLowerCase().includes('incorporation')
    ))
  );

  const openStartupDraftModal = (doc) => {
    setModalData({
      title: `📝 Legal Draft: ${doc.title}`,
      maxWidth: 720,
      content: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span className={`badge ${doc.badgeColor}`} style={{ marginRight: 6 }}>{doc.timeline}</span>
              <span className="badge b-mu">{doc.section}</span>
            </div>
            <button
              className="btn sm p"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(doc.draftContent);
                }
                showToast('Draft copied to clipboard!');
              }}
            >
              📋 Copy Draft
            </button>
          </div>
          <p className="mu" style={{ fontSize: 13, marginBottom: 12 }}>
            Pre-filled statutory template tailored for newly incorporated companies. Customize the bracketed details and execute on company letterhead or non-judicial stamp paper.
          </p>
          <pre style={{
            background: 'var(--bg)',
            border: '1px solid var(--bd)',
            borderRadius: 8,
            padding: 14,
            maxHeight: 380,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontSize: 13,
            lineHeight: 1.6
          }}>
            {doc.draftContent}
          </pre>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--mu)' }}>Authority: <b>{doc.authority}</b></span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn sm o"
                onClick={() => {
                  const blob = new Blob([doc.draftContent], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${doc.id}_draft.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('Downloaded draft template.');
                }}
              >
                ⬇ Download Draft (.txt)
              </button>
            </div>
          </div>
        </div>
      )
    });
  };

  const openStartupProcessModal = (doc) => {
    setModalData({
      title: `📋 How to Apply: ${doc.title}`,
      maxWidth: 740,
      content: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span className={`badge ${doc.badgeColor}`} style={{ marginRight: 6 }}>{doc.timeline}</span>
              <span className="badge b-mu">{doc.section}</span>
            </div>
            {doc.portalUrl && (
              <a
                href={doc.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn sm p"
                style={{ textDecoration: 'none' }}
              >
                🔗 Go to Official Portal ({doc.portalName.split(' ')[0]}) ↗
              </a>
            )}
          </div>

          <div className="grid g2" style={{ gap: 12, marginBottom: 14 }}>
            <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--bd)' }}>
              <div className="mu" style={{ fontSize: 12 }}>Statutory Fees & Charges</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>{doc.statutoryFees}</div>
            </div>
            <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--bd)' }}>
              <div className="mu" style={{ fontSize: 12 }}>Penalty for Non-Compliance / Delay</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--bad)', marginTop: 4 }}>{doc.penalty}</div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <h4 style={{ fontSize: 14, marginBottom: 6 }}>Prerequisites & Required Attachments</h4>
            <p style={{ fontSize: 13.5, background: 'var(--panel)', padding: 10, borderRadius: 6, border: '1px solid var(--bd)', margin: 0 }}>
              {doc.prerequisites}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>Step-by-Step Application Procedure</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {doc.howToApplySteps.map((step, idx) => (
                <div key={idx} style={{ background: 'var(--bg)', padding: 10, borderRadius: 6, fontSize: 13.5, borderLeft: '3px solid var(--blue)' }}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    });
  };

  // Sample Documents for quick evaluation
  const loadSampleDoc = (type) => {
    if (type === 'coi') {
      const sample = `GOVERNMENT OF INDIA
MINISTRY OF CORPORATE AFFAIRS
Central Registration Centre (CRC), Manesar
Certificate of Incorporation
[Pursuant to sub-section (2) of section 7 and sub-section (1) of section 8 of the Companies Act, 2013 and rule 18 of the Companies (Incorporation) Rules, 2014]

Corporate Identity Number (CIN): U47912HR2026PTC149798
Name of the Company: KS ORIGIN COLLECTIVE PRIVATE LIMITED
Permanent Account Number (PAN): AAMCK6819K
Tax Deduction and Collection Account Number (TAN): RTKK01979D
Registration Date: 28th August 2026

I hereby certify that KS ORIGIN COLLECTIVE PRIVATE LIMITED is incorporated on this Twenty-eighth day of August Two thousand twenty-six under the Companies Act, 2013 (18 of 2013) and that the company is private limited by shares.
The registered office of the company is situated in the State of Haryana.

Statutory Post-Incorporation Obligations:
1. Appointment of First Statutory Auditor: The first auditor shall be appointed by the Board of Directors within 30 days of registration, or by members within 90 days (3 months) at an EGM under Section 139(6). File Form ADT-1.
2. Opening of Corporate Current Bank Account: Mandatory for depositing initial subscriber capital prior to business commencement.
3. Declaration of Commencement of Business (Form INC-20A): Must be filed with RoC within 180 days under Section 10A of Companies Act, 2013.
4. Issue of Stamped Share Certificates (Form SH-1): Must be delivered within 60 days under Section 56(4).
5. First Board Meeting: Must be held within 30 days under Section 173(1).`;
      setDocText(sample);
      runDocumentAnalysis(sample);
    } else if (type === 'property_notice') {
      const sample = `Notice Ref No: REV/PB/MOHALI/NOTICE/2026/894
Office of the Sub-Divisional Magistrate & Revenue Officer, Mohali
Date: 04/11/2026
Subject: Show Cause Notice regarding Title Mutation and Stamp Duty Valuation on Khasra #142/2.
Whereas during verification of the conveyance deed, an apparent stamp duty valuation mismatch of ₹48,000 has been flagged as per revised circle rates.
You are hereby directed to submit a written explanation along with registered sale deed, Non-Encumbrance Certificate (EC), and municipal tax receipts within 15 days of this notice, failing which penalty under Section 40 of Indian Stamp Act will be assessed.`;
      setDocText(sample);
      runDocumentAnalysis(sample);
    } else if (type === 'income_cert') {
      const sample = `Application Acknowledgement & Query Memo: EDIST-INC-2026-771
Office of the Tehsildar, Revenue Department
Date: 10/11/2026
Subject: Defect Memo regarding Issuance of Annual Income Certificate.
Your application requires clarification regarding annual household income. Please provide an updated Self-Declaration Affidavit along with bank statements of all adult earning members within 10 days to avoid rejection.`;
      setDocText(sample);
      runDocumentAnalysis(sample);
    } else if (type === 'scholarship') {
      const sample = `National Scholarship Portal (NSP) Query Alert - Ref ID: NSP/2026/PMSC/4491
Ministry of Social Justice & Empowerment
Date: 08/11/2026
Subject: Defect flagged in Post-Matric Scholarship Application.
Institutional verification is pending due to discrepancy between income certificate date and applicant bank account Aadhaar-seeding status.
Please upload valid competent authority income certificate and ensure NPCI bank mapping before 10/12/2026.`;
      setDocText(sample);
      runDocumentAnalysis(sample);
    } else if (type === 'mca_notice') {
      const sample = `Notice Reference: ROC/DEL-HR/COMP/2026/SCN-4892
Ministry of Corporate Affairs, Office of the Registrar of Companies
Date: 02/11/2026
Subject: Show Cause Notice under Section 10A & Section 139(6) of Companies Act, 2013.
To: KS ORIGIN COLLECTIVE PRIVATE LIMITED (CIN: U47912HR2026PTC149798)
Whereas the company was incorporated on 28 August 2026, and as per statutory records, verified proof of First Statutory Auditor Appointment (Form ADT-1) and Declaration of Commencement of Business (Form INC-20A) have not been entered into MCA V3 register.
You are hereby called upon to show cause within 15 days from the date of this notice as to why penal proceedings under Section 10A(2) and Section 450 should not be initiated against the company and every officer in default.`;
      setDocText(sample);
      runDocumentAnalysis(sample);
    } else if (type === 'gst_notice') {
      const sample = `Notice Ref No: GST/PB/MOHALI/DRC-01/2026/1029
Office of the Assistant Commissioner of State Tax, Mohali Circle
Date: 05/11/2026
Subject: Show Cause Notice under Section 73 of CGST/PGST Act, 2017 (Form GST DRC-01).
Whereas on scrutiny of returns in Form GSTR-3B versus GSTR-1 for the relevant tax period, an apparent discrepancy in tax liability and Input Tax Credit (ITC) of ₹36,500 has been observed.
You are hereby directed to file your written reply in Form GST DRC-06 on the GST Portal within 30 days of this notice, along with tax payment challans and purchase reconciliation statements.`;
      setDocText(sample);
      runDocumentAnalysis(sample);
    }
  };

  return (
    <div>
      {/* Toast Alert */}
      {toastText && <div className="toast">{toastText}</div>}

      {/* Slide-out Detail Drawer */}
      <div className={`panel ${drawerData ? 'on' : ''}`}>
        {drawerData && (
          <div>
            <button className="btn sm" onClick={() => setDrawerData(null)}>
              Close
            </button>
            <h2 style={{ fontSize: 22, marginTop: 14 }}>{drawerData.item.name || drawerData.item.title || drawerData.item.service}</h2>
            <span className={`badge ${STATUS_BADGE[drawerData.item.status] || ''}`} style={{ margin: '6px 0' }}>
              {SCHEME_LABELS[drawerData.item.status] || drawerData.item.status}
            </span>

            {drawerData.type === 'scheme' && (
              <dl>
                <div>
                  <dt>Department / Ministry</dt>
                  <dd>{drawerData.item.dept}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{drawerData.item.category}</dd>
                </div>
                <div>
                  <dt>Benefits & Assistance</dt>
                  <dd>{drawerData.item.benefits}</dd>
                </div>
                <div>
                  <dt>Eligibility Assessment for You</dt>
                  <dd><b>{drawerData.item.reason}</b></dd>
                </div>
                <div>
                  <dt>Official Source</dt>
                  <dd>{drawerData.item.source}</dd>
                </div>
                <div className="dis" style={{ marginTop: 14 }}>
                  Not a guaranteed entitlement. Government benefits are subject to verification on the official portal.
                </div>
              </dl>
            )}

            {drawerData.item.url && (
              <div style={{ marginTop: 16 }}>
                <a
                  href={drawerData.item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn p"
                  style={{ display: 'inline-flex' }}
                >
                  Visit Official Government Portal
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modalData && (
        <div className="modal" onClick={() => setModalData(null)}>
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={modalData.maxWidth ? { width: `min(${modalData.maxWidth}px, 100%)`, maxWidth: modalData.maxWidth } : {}}
          >
            <h3>{modalData.title}</h3>
            <div style={{ margin: '14px 0' }}>{modalData.content}</div>
            <div style={{ textAlign: 'right' }}>
              <button className="btn" onClick={() => setModalData(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concise Profile & Quick Persona Login Modal */}
      {showProfileModal && (
        <div className="modal" onClick={() => setShowProfileModal(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Citizen Profile & Login</h3>
              <button className="btn sm" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>

            {/* Active Citizen Card */}
            <div className="card" style={{ background: 'var(--panel)', border: '1px solid var(--bd)', padding: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 28, width: 44, height: 44, borderRadius: '50%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--bd)' }}>
                  {activeCitizenId === 'delisha' ? '👩‍🎓' : activeCitizenId === 'novalabs' ? '🏢' : activeCitizenId === 'rajesh' ? '👔' : activeCitizenId === 'priya' ? '👩‍🎓' : activeCitizenId === 'gurpreet' ? '🌾' : activeCitizenId === 'sunita' ? '👩‍💼' : '👴'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <b style={{ fontSize: 15 }}>{citizen.name}</b>
                    <span className="badge b-ok" style={{ fontSize: 10, padding: '2px 6px' }}>✓ Aadhaar Linked</span>
                  </div>
                  <div className="mu" style={{ fontSize: 12 }}>{citizen.occupation} · {citizen.district}, {citizen.state}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--bd)', fontSize: 11.5 }}>
                <div><span className="mu">Income:</span> ₹{(citizen.income / 100000).toFixed(1)} Lakh/yr</div>
                <div><span className="mu">Category:</span> {citizen.familyCategory}</div>
                <div><span className="mu">State:</span> {citizen.state}</div>
              </div>
            </div>

            {/* 1-Click Switch Personas */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--mu)', marginBottom: 6, letterSpacing: '0.04em' }}>
                Instant Persona Switch (Separate Chat & Portfolios)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.values(SAMPLE_CITIZENS).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveCitizenId(c.id);
                      showToast(`Switched profile to ${c.name}`);
                      setShowProfileModal(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '7px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: c.id === activeCitizenId ? 'var(--blue)' : 'var(--card)',
                      color: c.id === activeCitizenId ? '#fff' : 'inherit',
                      border: '1px solid var(--bd)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: 16 }}>
                      {c.id === 'delisha' ? '👩‍🎓' : c.id === 'novalabs' ? '🏢' : c.id === 'rajesh' ? '👔' : c.id === 'priya' ? '👩‍🎓' : c.id === 'gurpreet' ? '🌾' : c.id === 'sunita' ? '👩‍💼' : '👴'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{c.name}</div>
                      <div style={{ fontSize: 11, opacity: c.id === activeCitizenId ? 0.9 : 0.6 }}>{c.desc}</div>
                    </div>
                    {c.id === activeCitizenId && <span style={{ fontWeight: 700, fontSize: 11.5 }}>✓ Active</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Mobile / OTP Login Demo */}
            <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--mu)', marginBottom: 6, letterSpacing: '0.04em' }}>
                Citizen Login (Mobile / Aadhaar OTP)
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="in sm"
                  style={{ flex: 1 }}
                  placeholder="Enter 10-digit mobile or Aadhaar"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                />
                <button
                  className="btn sm p"
                  onClick={() => {
                    if (!loginPhone.trim()) {
                      showToast('Please enter your mobile or Aadhaar number');
                      return;
                    }
                    setLoginOtpSent(true);
                    showToast('Demo OTP 4921 sent via secure gateway');
                  }}
                >
                  {loginOtpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
              {loginOtpSent && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    className="in sm"
                    style={{ width: 140 }}
                    placeholder="Enter OTP (4921)"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                  />
                  <button
                    className="btn sm o"
                    onClick={() => {
                      showToast('Identity verified securely under DPDP Act!');
                      setShowProfileModal(false);
                      setLoginOtpSent(false);
                      setLoginPhone('');
                      setLoginOtp('');
                    }}
                  >
                    Verify & Access
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Model Intelligence & API Key Configuration Modal */}
      {apiKeyModalOpen && (
        <div className="modal" onClick={() => setApiKeyModalOpen(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>AI Model & API Key Configuration</h3>
              <button className="btn sm" onClick={() => setApiKeyModalOpen(false)}>✕</button>
            </div>

            <div className="card" style={{ background: 'var(--panel)', border: '1px solid var(--bd)', padding: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--mu)', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Active Intelligence Engine
                  </div>
                  <b style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ color: apiKeyInfo.connected ? '#10B981' : '#3B82F6', fontSize: 13 }}>●</span>
                    {apiKeyInfo.provider}
                  </b>
                </div>
                <span className={`badge ${apiKeyInfo.connected ? 'b-ok' : 'b-mu'}`} style={{ fontSize: 11 }}>
                  {apiKeyInfo.model}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 8 }}>
                Status: {apiKeyInfo.connected ? `Live LLM Connected (${apiKeyInfo.masked_key})` : 'Built-in Statutory Rules Engine (100% deterministic & verified; no API key needed)'}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="mu" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
                Connect API Key (Google Gemini / Claude / OpenAI)
              </label>
              <p className="mu" style={{ fontSize: 12.5, margin: '0 0 10px' }}>
                You can use JanSahayak with the trained statutory rules engine, or connect your API key for advanced generative reasoning on complex notices.
              </p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <select
                  className="in sm"
                  style={{ width: 150 }}
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="openai">OpenAI GPT</option>
                </select>
                <input
                  type="password"
                  className="in sm"
                  style={{ flex: 1 }}
                  placeholder={`Paste your ${apiProvider === 'gemini' ? 'Gemini (AIza...)' : apiProvider === 'anthropic' ? 'Anthropic (sk-ant...)' : 'OpenAI (sk-...)'} key`}
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn sm" onClick={() => setApiKeyModalOpen(false)}>Cancel</button>
                <button className="btn sm p" disabled={apiKeySaving} onClick={saveApiKey}>
                  {apiKeySaving ? 'Connecting…' : 'Save & Connect Model'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* VIEW: CITIZEN PLATFORM DASHBOARD */}
      {viewMode === 'app' ? (
        <div className="app-container">
          {/* Sidebar Navigation */}
          <aside className={`${sidebarCollapsed ? 'c' : ''} ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="logo" style={{ color: '#fff', padding: '6px 10px 16px' }}>
              <i style={{ background: 'var(--blue)' }}>JS</i>
              <span className="lbl">JanSahayak AI</span>
            </div>

            {NAV_MODULES.map((m) => (
              <button
                key={m.id}
                className={`nav-i ${activeTab === m.id ? 'a' : ''}`}
                onClick={() => {
                  setActiveTab(m.id);
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <span className="nav-i" style={{ padding: 0, width: 20 }}>
                  <Icon name={m.icon} />
                </span>
                <span className="lbl">{m.name}</span>
              </button>
            ))}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button
                className="nav-i"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <span className="nav-i" style={{ padding: 0 }}>☰</span>
                <span className="lbl">{sidebarCollapsed ? 'Expand' : 'Collapse'}</span>
              </button>

              <button className="nav-i" onClick={() => setViewMode('landing')}>
                <span>↩</span>
                <span className="lbl">Back to Website</span>
              </button>
            </div>
          </aside>

          {/* Main Citizen Application Workspace */}
          <main>
            {/* Top Bar */}
            <div className="tb">
              <button
                className="btn sm mob"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                Menu
              </button>

              {/* Entity / Persona Switcher */}
              <button
                className="btn"
                onClick={() => setShowProfileModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 18px',
                  background: 'var(--card)',
                  border: '1px solid var(--bd)',
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: 15,
                  color: 'var(--navy)'
                }}
                title="Click to switch entity or citizen persona"
              >
                <span>{citizen.name}</span>
                <span style={{ fontSize: 12, opacity: 0.6 }}>▼</span>
              </button>

              <input
                className="srch hide"
                placeholder="Search compliances, forms, schemes..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab('ai');
                    sendChatMessage(e.target.value);
                  }
                }}
              />

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
                {/* Alerts Pill (Screenshot Exact) */}
                <div
                  style={{
                    background: '#FDF2F8',
                    color: '#BE185D',
                    borderRadius: 99,
                    padding: '7px 16px',
                    fontWeight: 600,
                    fontSize: 13.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    border: '1px solid #FBCFE8'
                  }}
                  onClick={() =>
                    setModalData({
                      title: 'Statutory Compliance Alerts (3)',
                      content: (
                        <div>
                          <div style={{ padding: '10px 0', borderBottom: '1px solid var(--bd)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <b>GSTR-1 Outward Supplies</b>
                              <span className="badge b-bad">Overdue</span>
                            </div>
                            <p className="mu" style={{ fontSize: 13, margin: '4px 0 0' }}>Statutory due date was 11 Nov 2026. Daily late fee ₹50/day applying.</p>
                          </div>
                          <div style={{ padding: '10px 0', borderBottom: '1px solid var(--bd)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <b>AOC-4 Financial Statements</b>
                              <span className="badge b-mu">Draft Ready</span>
                            </div>
                            <p className="mu" style={{ fontSize: 13, margin: '4px 0 0' }}>ROC due date 30 Oct 2026. Awaiting final board resolution.</p>
                          </div>
                          <div style={{ padding: '10px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <b>MGT-7 Annual Return</b>
                              <span className="badge b-warn">15 Days Left</span>
                            </div>
                            <p className="mu" style={{ fontSize: 13, margin: '4px 0 0' }}>Statutory due date 29 Nov 2026. Shareholder list reconciled.</p>
                          </div>
                          <button className="btn p sm" style={{ marginTop: 14, width: '100%' }} onClick={() => setModalData(null)}>
                            Close
                          </button>
                        </div>
                      )
                    })
                  }
                >
                  <span>Alerts</span>
                  <span style={{ background: '#BE185D', color: '#fff', borderRadius: 99, width: 20, height: 20, display: 'inline-grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>3</span>
                </div>

                {/* Help Button (Screenshot Exact) */}
                <button
                  className="btn o"
                  onClick={() => {
                    setActiveTab('ai');
                    sendChatMessage('Help me understand my current compliances and statutory deadlines.');
                  }}
                  style={{ fontSize: 13.5, padding: '7px 20px', borderRadius: 99 }}
                >
                  Help
                </button>

                {/* Founder Role Badge (Screenshot Exact) */}
                <div
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    borderRadius: 99,
                    padding: '7px 20px',
                    fontWeight: 600,
                    fontSize: 13.5,
                    border: '1px solid #DBEAFE'
                  }}
                >
                  {citizen.role || 'Founder'}
                </div>

                {/* 1-Click Light and Dark Mode Toggle */}
                <button
                  className="theme-toggle-btn"
                  onClick={() => {
                    const next = theme === 'light' ? 'dark' : 'light';
                    setTheme(next);
                    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`);
                  }}
                  title={`1-Click Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                  style={{ padding: '6px 12px', fontSize: 13, borderRadius: 99 }}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {/* Model Settings Dot Indicator (Screenshot Exact top right dot) */}
                <button
                  onClick={() => setApiKeyModalOpen(true)}
                  title={`AI Model: ${apiKeyInfo.provider}. Click to configure API Key.`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    lineHeight: 1
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: apiKeyInfo.connected ? '#10B981' : '#2563EB', display: 'inline-block' }} />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="content">
              {/* TAB 1: CITIZEN DASHBOARD (Overview) */}
              {activeTab === 'ov' && (
                <div>
                  <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 28 }}>👋</span>
                        <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 36px)', fontWeight: 800, color: 'var(--navy)', margin: 0, letterSpacing: '-0.02em' }}>
                          Good morning, Welcome to JanSahayak AI.
                        </h1>
                      </div>
                      <p className="sub" style={{ fontSize: 14.5, color: 'var(--mu)', margin: 0 }}>
                        {citizen.desc || `${citizen.name} · FY 2026-27`}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="badge b-ok" style={{ fontSize: 12, padding: '5px 12px', fontWeight: 600 }}>
                        ● Active Persona: {citizen.name}
                      </span>
                      <button
                        className="btn sm o"
                        onClick={() => setShowProfileModal(true)}
                        style={{ fontSize: 12.5, borderRadius: 99, padding: '5px 14px', fontWeight: 600 }}
                      >
                        Switch Entity ⇄
                      </button>
                    </div>
                  </div>

                  {/* Yellow Notice Banner with Verified Status */}
                  <div className="compliance-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>🛡️</span>
                      <span style={{ fontWeight: 500 }}>
                        <b>Verified Statutory Rules Engine:</b> All compliance dates, interest subsidies & welfare allowances computed deterministically.
                      </span>
                    </div>
                    <span className="badge b-ok" style={{ fontSize: 11, background: '#DCFCE7', color: '#15803D', fontWeight: 700 }}>
                      LIVE ENGINE
                    </span>
                  </div>

                  {/* 5 KPI Metric Cards in a single row (Enhanced & Visually Interactive) */}
                  <div className="grid g5">
                    {[
                      { label: 'Compliance Health', val: '87%', icon: '🛡️', badge: 'Optimal', badgeClass: 'b-ok', tab: 'cal' },
                      { label: 'Upcoming Deadlines', val: '6', icon: '📅', badge: 'Active Due Dates', badgeClass: 'b-warn', tab: 'cal' },
                      { label: 'Pending Actions', val: '2', icon: '⚡', badge: 'Needs Attention', badgeClass: 'b-bad', tab: 'cal' },
                      { label: 'Completed Filings', val: '1', icon: '✅', badge: 'Certified', badgeClass: 'b-ok', tab: 'filings' },
                      { label: 'Scheme Matches', val: `${homeMatchedSchemes.length || 4}`, icon: '🎁', badge: 'Recommended', badgeClass: 'b-ok', tab: 'sch' },
                    ].map((kpi, idx) => (
                      <div
                        className="card kpi kpi-interactive"
                        key={idx}
                        onClick={() => {
                          if (kpi.tab === 'sch') {
                            const el = document.getElementById('home-schemes-section');
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              setActiveTab('sch');
                            }
                          } else {
                            setActiveTab(kpi.tab);
                          }
                        }}
                        title={`Click to view ${kpi.label}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <span style={{ fontSize: 20 }}>{kpi.icon}</span>
                          <span className={`badge ${kpi.badgeClass}`} style={{ fontSize: 10.5, padding: '2px 7px' }}>
                            {kpi.badge}
                          </span>
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--mu)', fontWeight: 600 }}>{kpi.label}</span>
                        <b style={{ fontSize: 28, marginTop: 2, color: 'var(--navy)' }}>{kpi.val}</b>
                      </div>
                    ))}
                  </div>

                  {/* 2-Column: Upcoming Compliance & AI Activity Feed (Screenshot Exact) */}
                  <div className="grid" style={{ gridTemplateColumns: '1.9fr 1.1fr', marginTop: 18 }}>
                    {/* Left: Upcoming Compliance */}
                    <div className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Upcoming Compliance</h3>
                        <button
                          className="btn sm o"
                          onClick={() => setActiveTab('cal')}
                          style={{ fontSize: 12.5 }}
                        >
                          View Calendar
                        </button>
                      </div>

                      <div className="tw">
                        <table>
                          <thead>
                            <tr>
                              <th>Compliance</th>
                              <th>Category</th>
                              <th>Due Date</th>
                              <th>Status</th>
                              <th>Priority</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {STATUTORY_COMPLIANCES.map((row, idx) => (
                              <tr key={idx}>
                                <td><b>{row.form}</b></td>
                                <td><span className="badge b-mu" style={{ fontSize: 11 }}>{row.category}</span></td>
                                <td>{row.due}</td>
                                <td><span className={`badge ${row.statusClass}`}>{row.status}</span></td>
                                <td>
                                  <span style={{ color: row.priority === 'High' ? 'var(--bad)' : 'var(--warn)', fontWeight: 600, fontSize: 13 }}>
                                    {row.priority}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn sm o"
                                    style={{ padding: '3px 10px', fontSize: 12 }}
                                    onClick={() => {
                                      setActiveTab('cal');
                                      showToast(`Viewing details for ${row.form}`);
                                    }}
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: AI Activity Feed */}
                    <div className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>AI Activity Feed</h3>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                          { title: 'Company incorporation analysed', status: 'Completed', time: '2 min ago', badgeClass: 'b-ok' },
                          { title: 'Missing director information identified', status: 'Waiting info', time: '10 min ago', badgeClass: 'b-warn' },
                          { title: 'Compliance calendar recalculated', status: 'Completed', time: '1 hr ago', badgeClass: 'b-ok' },
                          { title: 'GST document requirement flagged', status: 'Action needed', time: '3 hr ago', badgeClass: 'b-bad' },
                          { title: 'DPIIT recognition scheme discovered', status: 'Eligible', time: 'Today', badgeClass: 'b-ok' },
                        ].map((item, idx) => (
                          <div key={idx} style={{ paddingBottom: 10, borderBottom: idx < 4 ? '1px solid var(--bd)' : 'none' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>{item.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12 }}>
                              <span className={`badge ${item.badgeClass}`} style={{ padding: '2px 7px', fontSize: 11 }}>
                                {item.status}
                              </span>
                              <span className="mu">· {item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Matched Government Schemes & Subsidies Showcase */}
                  <div id="home-schemes-section" style={{ marginTop: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 22 }}>🎁</span>
                          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>
                            Personalized Government Schemes & Subsidies
                          </h3>
                          <span className="badge b-ok" style={{ fontSize: 11.5, fontWeight: 700 }}>
                            {homeMatchedSchemes.length} Recommended
                          </span>
                        </div>
                        <p className="mu" style={{ fontSize: 13.5, margin: '3px 0 0' }}>
                          Verified programs matching <b>{citizen.name}</b> ({citizen.occupation || citizen.occKey}, {citizen.state || 'Punjab'}) · Direct statutory portals
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="btn sm o"
                          onClick={() => {
                            setActiveTab('sch');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{ fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <span>Explore All 44 Schemes</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid g3" style={{ gap: 16 }}>
                      {homeMatchedSchemes.map((s, idx) => {
                        const portalUrl = s.url || 'https://services.india.gov.in';
                        let displayHost = 'india.gov.in';
                        try {
                          displayHost = new URL(portalUrl).hostname.replace(/^www\./, '');
                        } catch {
                          displayHost = portalUrl.replace(/^https?:\/\//, '').split('/')[0];
                        }

                        const catIcons = {
                          'Education & Scholarships': '🎓',
                          'Business & Entrepreneurship': '🚀',
                          'Agriculture & Farmers': '🌾',
                          'Healthcare & Social Welfare': '🏥',
                          'Women & Child Welfare': '👩',
                          'Senior Citizens & Pensions': '👴',
                          'Housing & Property': '🏠'
                        };
                        const catIcon = catIcons[s.category] || '🏛️';

                        return (
                          <div key={s.id || idx} className="home-scheme-card">
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                                <span className="badge b-mu" style={{ fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <span>{catIcon}</span>
                                  <span>{s.category}</span>
                                </span>
                                <span className={`badge ${STATUS_BADGE[s.status] || 'b-ok'}`} style={{ fontSize: 11, fontWeight: 700 }}>
                                  {SCHEME_LABELS[s.status] || s.status || 'Eligible'}
                                </span>
                              </div>

                              <h4 style={{ fontSize: 16, margin: '0 0 4px', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.3 }}>
                                {s.name}
                              </h4>
                              <div className="mu" style={{ fontSize: 12.5, marginBottom: 10 }}>
                                {s.dept}
                              </div>

                              <div className="benefit-highlight-box">
                                <span style={{ fontSize: 15 }}>✨</span>
                                <span style={{ fontSize: 13, lineHeight: 1.4 }}>{s.benefits}</span>
                              </div>

                              <div className="scheme-callout" style={{ fontSize: 12.5, margin: '8px 0 14px' }}>
                                <span>ⓘ</span>
                                <span>{s.reason}</span>
                              </div>
                            </div>

                            <div style={{ paddingTop: 12, borderTop: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                              <a
                                href={portalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--blue)', fontSize: 12.5, fontWeight: 600 }}
                              >
                                <span>🔗</span>
                                <span style={{ textDecoration: 'underline' }}>{displayHost}</span>
                                <span style={{ fontSize: 10 }}>↗</span>
                              </a>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <a
                                  href={portalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn sm p"
                                  style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, fontWeight: 600 }}
                                >
                                  Apply ↗
                                </a>
                                <button
                                  className="btn sm o"
                                  onClick={() => {
                                    setActiveTab('sch');
                                    setSchemeQuery(s.name.split('(')[0].trim());
                                    runSchemeSearch(s.name.split('(')[0].trim(), s.category);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6 }}
                                  title="Inspect complete scheme eligibility details"
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom: Agentic Pipeline (Screenshot Exact) */}
                  <div className="card" style={{ marginTop: 18 }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>Agentic Pipeline (Supervisor & Specialized Agents)</h3>
                    <p className="mu" style={{ fontSize: 13, margin: '4px 0 12px' }}>
                      Trouble Shooters multi-agent workflow: User Request → Supervisor Agent → Specialized Agents → Human Founder Approval
                    </p>
                    <div className="agentic-flow">
                      {[
                        'User Notice / Query',
                        'Supervisor Agent',
                        'Document AI Agent',
                        'Research Agent',
                        'Evidence Agent',
                        'Planner Agent',
                        'Drafting Agent',
                        'QA Agent',
                        'Founder Sign-off'
                      ].map((step, idx) => (
                        <React.Fragment key={idx}>
                          <div className="pipeline-step">{step}</div>
                          {idx < 8 && <span className="pipeline-arrow">→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                      Your Intelligent Compliance Assistant
                    </h1>
                    <p className="sub" style={{ marginTop: 4, color: 'var(--mu)', fontSize: 15 }}>
                      Verified answers from statutory rules engines and specialized agents
                    </p>
                  </div>

                  <div className="card">
                    {/* Chat Stream (Screenshot Exact Bubble) */}
                    <div className="chat">
                      {activeChatMessages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`msg ${m.role === 'user' ? 'u' : 'a'}`}
                        >
                          <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                          {m.meta && <small>{m.meta}</small>}
                          {m.portal && (
                            <a
                              href={m.portal}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-block', marginTop: 6, color: 'var(--blue)', fontSize: 12, fontWeight: 600 }}
                            >
                              🔗 Official Portal: {m.portal}
                            </a>
                          )}
                        </div>
                      ))}
                      {chatBusy && <div className="msg a mu">Consulting statutory rules engine & specialized agents…</div>}
                    </div>

                    {/* Pre-canned Prompts (Screenshot Exact Pills) */}
                    <div className="chips">
                      {PROMPT_CHIPS.map((promptText) => (
                        <button
                          key={promptText}
                          className="chip"
                          onClick={() => sendChatMessage(promptText)}
                        >
                          {promptText}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input Bar */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <input
                        className="in"
                        style={{ flex: 1 }}
                        placeholder="Ask anything about statutory compliances, filings, or schemes..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !chatBusy && sendChatMessage()}
                      />
                      <button
                        className="btn p"
                        disabled={chatBusy || !chatInput.trim()}
                        onClick={() => sendChatMessage()}
                      >
                        {chatBusy ? 'Thinking…' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'doc' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h1>Document Intelligence & Vault</h1>
                      <p className="sub">Upload official notices, deeds, certificates, and application receipts for AI analysis</p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn sm p" onClick={() => loadSampleDoc('coi')} style={{ fontWeight: 600 }}>
                        🚀 Load Certificate of Incorporation (Startup)
                      </button>
                      <button className="btn sm o" onClick={() => loadSampleDoc('property_notice')}>
                        Load Property Notice Sample
                      </button>
                      <button className="btn sm o" onClick={() => loadSampleDoc('income_cert')}>
                        Load Income Query Sample
                      </button>
                      <button className="btn sm o" onClick={() => loadSampleDoc('scholarship')}>
                        Load Scholarship Query Sample
                      </button>
                      <button
                        className="btn sm o"
                        onClick={() => setActiveTab('cal')}
                        style={{ fontWeight: 600, color: 'var(--blue)', borderColor: 'var(--blue)' }}
                        title="View Compliance Calendar & statutory deadlines"
                      >
                        📅 Open Compliance Calendar →
                      </button>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div
                    className="drop"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('h'); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('h'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('h');
                      const files = e.dataTransfer.files;
                      if (files && files[0]) {
                        const fileObj = files[0];
                        setDocFile(fileObj);
                        runDocumentAnalysis('', fileObj);
                      }
                    }}
                  >
                    <Icon name="folder" style={{ width: 36, height: 36, stroke: 'var(--blue)', margin: '0 auto 8px' }} />
                    <p style={{ fontWeight: 600, color: 'var(--navy)' }}>Upload Government Notice, Certificate, or Deed (PDF, TXT, or Scanned)</p>
                    <p className="mu" style={{ fontSize: 13, margin: '6px 0 14px' }}>
                      Supports property sale deeds, municipal notices, scholarship letters, driving licences, and income certs.
                    </p>

                    <label className="btn p">
                      {docFile ? `Change Document (${docFile.name})` : 'Select Document to Analyse'}
                      <input
                        type="file"
                        accept=".pdf,.txt,.doc,.docx,image/*"
                        hidden
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const fileObj = e.target.files[0];
                            setDocFile(fileObj);
                            runDocumentAnalysis('', fileObj);
                          }
                        }}
                      />
                    </label>

                    {docFile && (
                      <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--blue)', fontWeight: 600 }}>
                        ✓ File loaded: {docFile.name} ({(docFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>

                  {/* Textarea alternative */}
                  <div className="card" style={{ marginTop: 14 }}>
                    <label className="mu" style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                      Or paste notice / government communication text:
                    </label>
                    <textarea
                      placeholder="Paste clauses, notice text, or application details here..."
                      value={docText}
                      onChange={(e) => setDocText(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <button
                        className="btn p"
                        disabled={docBusy}
                        onClick={() => runDocumentAnalysis()}
                      >
                        {docBusy ? 'Analysing with Agents…' : 'Analyse Document & Generate Checklist'}
                      </button>
                      <button
                        className="btn o"
                        onClick={() => {
                          setDocText('');
                          setActiveAnalysisCase(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Standalone Startup Document Vault Explorer */}
                  {!activeAnalysisCase && (
                    <div className="card" style={{ marginTop: 16, background: 'linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(16,185,129,0.04) 100%)', border: '1px solid var(--bd)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="badge b-ok">STARTUP COMPLIANCE ENGINE</span>
                            <span className="badge b-mu">Companies Act 2013 & DPIIT</span>
                          </div>
                          <h3 style={{ fontSize: 16, margin: '6px 0 2px', color: 'var(--navy)' }}>
                            Have a Certificate of Incorporation? Discover All Required Startup Documents
                          </h3>
                          <p className="mu" style={{ fontSize: 13, margin: 0 }}>
                            Includes First Statutory Auditor appointment (within 30–90 days / 3 months), Corporate Bank Account opening & capital deposit, Form INC-20A (180 days), Stamped Share Certificates (60 days), DPIIT Startup Recognition, and GST.
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button className="btn sm p" onClick={() => loadSampleDoc('coi')}>
                            🚀 Load & Evaluate Startup COI
                          </button>
                          <button
                            className="btn sm o"
                            onClick={() => setActiveTab('cal')}
                            style={{ fontWeight: 600, color: 'var(--blue)' }}
                            title="Open Compliance Calendar"
                          >
                            📅 View Compliance Calendar →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Detail & 10-Point Analysis View */}
                  {activeAnalysisCase && (
                    <div className="card" style={{ marginTop: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--bd)', paddingBottom: 14 }}>
                        <div>
                          <span className="badge b-ok">{activeAnalysisCase.extracted.category}</span>
                          <h2 style={{ fontSize: 20, margin: '6px 0 2px' }}>{activeAnalysisCase.extracted.document_type}</h2>
                          <div className="mu" style={{ fontSize: 13 }}>
                            Authority: <b>{activeAnalysisCase.extracted.authority}</b> · Ref: <b>{activeAnalysisCase.extracted.reference}</b>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div className="mu" style={{ fontSize: 12 }}>Statutory Deadline:</div>
                          <b style={{ color: 'var(--bad)', fontSize: 16 }}>{formatDate(activeAnalysisCase.extracted.response_deadline)}</b>
                          <div style={{ marginTop: 4 }}>
                            <button
                              className="btn sm o"
                              style={{ fontSize: 11, padding: '2px 8px', color: 'var(--blue)' }}
                              onClick={() => setActiveTab('cal')}
                              title="Sync and view in Compliance Calendar"
                            >
                              📅 View in Compliance Calendar →
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Detail Tabs */}
                      <div className="tabs" style={{ marginTop: 14 }}>
                        {[
                          ['overview', 'Document Overview'],
                          ...(isStartupDoc ? [['startup_docs', '🚀 Startup Documents & Compliance Hub (8)']] : []),
                          ['clauses', 'Important Information & Clauses'],
                          ['checklist', 'Required Actions Checklist'],
                          ['draft', 'AI Generated Representation Draft'],
                          ['audit', 'Agent Trace & Audit History'],
                        ].map(([k, label]) => (
                          <button
                            key={k}
                            className={activeDocDetailTab === k ? 'a' : ''}
                            onClick={() => setActiveDocDetailTab(k)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Startup Highlight Notification Banner */}
                      {isStartupDoc && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(16,185,129,0.08) 100%)',
                          border: '1px solid rgba(37,99,235,0.25)',
                          borderRadius: 8,
                          padding: '12px 16px',
                          marginTop: 14,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="badge b-ok" style={{ fontWeight: 700 }}>STARTUP INCORPORATION DETECTED</span>
                              <span className="badge b-mu">CIN: {activeAnalysisCase.extracted.reference || 'U47912HR2026PTC149798'}</span>
                            </div>
                            <p style={{ fontSize: 13.5, margin: '6px 0 0', color: 'var(--navy)', fontWeight: 600 }}>
                              Mandatory Post-Incorporation Roadmap: First Statutory Audit appointment within 30–90 days (3 months), Corporate Bank Account opening & capital deposit, Form INC-20A within 180 days, and Stamped Share Certificates within 60 days.
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              className="btn sm p"
                              onClick={() => setActiveDocDetailTab('startup_docs')}
                            >
                              View Startup Documents Hub (8) →
                            </button>
                            <button
                              className="btn sm o"
                              onClick={() => setActiveTab('cal')}
                              style={{ fontWeight: 600 }}
                              title="Track post-incorporation statutory deadlines"
                            >
                              📅 Sync to Compliance Calendar →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tab Content: Startup Documents */}
                      {activeDocDetailTab === 'startup_docs' && (
                        <div style={{ marginTop: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                            <div>
                              <h3 style={{ margin: 0, fontSize: 18 }}>Mandatory Post-Incorporation Startup Documents</h3>
                              <p className="mu" style={{ fontSize: 13, margin: '2px 0 0' }}>
                                Under Companies Act, 2013, early post-incorporation compliances are time-critical. Use <b>📝 Draft Document</b> for pre-filled templates or <b>📋 How to Apply (Process)</b> for step-by-step procedures.
                              </p>
                            </div>

                            {/* Category Filter Pills */}
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {['All', 'Mandatory (30–90 Days)', 'Statutory Filing (180 Days)', 'Tax & Registrations'].map((cat) => (
                                <button
                                  key={cat}
                                  className={`btn sm ${selectedStartupCategory === cat ? 'p' : 'o'}`}
                                  onClick={() => setSelectedStartupCategory(cat)}
                                >
                                  {cat} {cat === 'All' ? `(${STARTUP_DOCUMENTS.length})` : ''}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Documents Grid / Stack */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {STARTUP_DOCUMENTS
                              .filter((doc) => selectedStartupCategory === 'All' || doc.category === selectedStartupCategory)
                              .map((doc) => (
                                <div
                                  key={doc.id}
                                  style={{
                                    background: 'var(--panel)',
                                    border: '1px solid var(--bd)',
                                    borderRadius: 8,
                                    padding: 16
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <span className={`badge ${doc.badgeColor}`} style={{ fontWeight: 700 }}>{doc.timeline}</span>
                                        <span className="badge b-mu">{doc.category}</span>
                                        <span className="badge b-warn">{doc.status}</span>
                                      </div>
                                      <h4 style={{ fontSize: 16, margin: '6px 0 3px', color: 'var(--navy)' }}>{doc.title}</h4>
                                      <div className="mu" style={{ fontSize: 12.5 }}>
                                        Governing Law: <b>{doc.section}</b> · Authority: <b>{doc.authority}</b>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                      <button
                                        className="btn sm p"
                                        onClick={() => openStartupDraftModal(doc)}
                                        title="View pre-filled legal draft"
                                      >
                                        📝 Draft Document
                                      </button>
                                      <button
                                        className="btn sm o"
                                        onClick={() => openStartupProcessModal(doc)}
                                        title="View fees, penalties, and step-by-step process"
                                      >
                                        📋 How to Apply (Process)
                                      </button>
                                      <button
                                        className="btn sm o"
                                        onClick={() => setActiveTab('cal')}
                                        title="View statutory deadline in Compliance Calendar"
                                      >
                                        📅 View in Calendar
                                      </button>
                                      {doc.portalUrl && (
                                        <a
                                          href={doc.portalUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn sm"
                                          style={{ textDecoration: 'none', background: 'var(--bg)', border: '1px solid var(--bd)' }}
                                        >
                                          🔗 Portal ↗
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  <p style={{ fontSize: 13.5, margin: '10px 0 8px', color: 'var(--tx)', lineHeight: 1.5 }}>
                                    {doc.summary}
                                  </p>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: 12.5, background: 'var(--bg)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bd)' }}>
                                    <div>
                                      <span className="mu">Statutory Fees:</span> <b>{doc.statutoryFees}</b>
                                    </div>
                                    <div>
                                      <span className="mu">Non-Compliance Penalty:</span> <b style={{ color: 'var(--bad)' }}>{doc.penalty.split(';')[0]}</b>
                                    </div>
                                    <div>
                                      <span className="mu">Filing Portal:</span> <a href={doc.portalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>{doc.portalName}</a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Tab Content: Overview */}
                      {activeDocDetailTab === 'overview' && (
                        <div>
                          <div className="grid g2" style={{ gap: 16 }}>
                            <div style={{ border: '1px solid var(--bd)', borderRadius: 8, padding: 14 }}>
                              <h4>Document Classification</h4>
                              <p style={{ fontSize: 14, marginTop: 6 }}>
                                <b>Category:</b> {activeAnalysisCase.extracted.category}<br />
                                <b>Identified Process:</b> {activeAnalysisCase.extracted.document_type}<br />
                                <b>Issuing Department:</b> {activeAnalysisCase.extracted.authority}<br />
                                <b>Document Date:</b> {formatDate(activeAnalysisCase.extracted.document_date)}<br />
                                <b>Extraction Confidence:</b> {Math.round(activeAnalysisCase.extracted.confidence * 100)}%
                              </p>
                            </div>

                            <div style={{ border: '1px solid var(--bd)', borderRadius: 8, padding: 14 }}>
                              <h4>Official Rules & Portal Link</h4>
                              <p style={{ fontSize: 14, marginTop: 6 }}>
                                <b>Governing Law:</b> {activeAnalysisCase.research.source}<br />
                                <b>Official Portal:</b> <a href={activeAnalysisCase.research.portal} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>{activeAnalysisCase.research.portal}</a><br />
                                <b>Statutory Fees:</b> {activeAnalysisCase.research.fees}<br />
                                <b>Status:</b> <span className="badge b-warn">{activeAnalysisCase.status.replaceAll('_', ' ')}</span>
                              </p>
                            </div>
                          </div>

                          <div style={{ marginTop: 16 }}>
                            <h4>Required Document Checklist</h4>
                            <div style={{ marginTop: 8 }}>
                              {activeAnalysisCase.evidence.map((ev) => (
                                <div key={ev.doc} className="checklist-item">
                                  <span className={`badge ${ev.status === 'received' ? 'b-ok' : 'b-warn'}`}>
                                    {ev.status}
                                  </span>
                                  <span>{ev.doc}</span>
                                </div>
                              ))}
                            </div>

                            <div className="row" style={{ marginTop: 14 }}>
                              <input
                                placeholder="Add document name you now have ready (e.g. Non-Encumbrance Certificate)"
                                value={docAdditionalEvidence}
                                onChange={(e) => setDocAdditionalEvidence(e.target.value)}
                              />
                              <button className="btn o" onClick={addCaseEvidence}>
                                Update Checklist
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tab Content: Clauses */}
                      {activeDocDetailTab === 'clauses' && (
                        <div>
                          <h4>Highlighted Document Clauses & Conditions</h4>
                          <p className="mu" style={{ fontSize: 13, margin: '4px 0 12px' }}>
                            Extracted key legal clauses, deadlines, and liabilities from document text:
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {activeAnalysisCase.extracted.important_clauses.map((clause, i) => (
                              <div key={i} style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, fontSize: 13.5, borderLeft: '3px solid var(--blue)' }}>
                                <b>Point {i + 1}:</b> {clause}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tab Content: Checklist */}
                      {activeDocDetailTab === 'checklist' && (
                        <div>
                          <h4>Action Items & Next Steps for Citizen</h4>
                          <div style={{ marginTop: 12 }}>
                            {activeAnalysisCase.tasks.map((task, idx) => (
                              <div key={idx} className="step-item">
                                <span className="badge b-mu">{formatDate(task.due)}</span>
                                <span style={{ flex: 1 }}>{task.task}</span>
                                <span className="badge b-warn">{task.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tab Content: Draft */}
                      {activeDocDetailTab === 'draft' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <h4>Formal Draft Representation ({activeAnalysisCase.draft_source})</h4>
                            <span className="badge b-mu">Ready for Citizen Sign-off</span>
                          </div>
                          <pre>{activeAnalysisCase.draft}</pre>

                          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <button
                              className="btn p"
                              disabled={activeAnalysisCase.status === 'approved_by_citizen'}
                              onClick={approveCaseDraft}
                            >
                              {activeAnalysisCase.status === 'approved_by_citizen'
                                ? 'Approved by Citizen (Audit Logged)'
                                : 'Approve Draft Response'}
                            </button>
                            <button
                              className="btn o"
                              onClick={() => {
                                if (navigator.clipboard) navigator.clipboard.writeText(activeAnalysisCase.draft);
                                showToast('Draft copied to clipboard!');
                              }}
                            >
                              Copy Draft
                            </button>
                            <button
                              className="btn o"
                              onClick={trainActiveDocument}
                              title="Explicitly train & index this document into AI Model Memory (POST /api/documents/train)"
                            >
                              🧠 Train into Model Memory
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tab Content: Audit */}
                      {activeDocDetailTab === 'audit' && (
                        <div>
                          <h4>Multi-Agent Trace</h4>
                          <div style={{ marginTop: 10 }}>
                            {activeAnalysisCase.trace.map((t, idx) => (
                              <div key={idx} className="step-item">
                                <span className="badge b-ok">Done</span>
                                <b>{t.agent}</b>
                                <span className="mu" style={{ fontSize: 13, marginLeft: 'auto' }}>
                                  {t.message}
                                </span>
                              </div>
                            ))}
                          </div>

                          <h4 style={{ marginTop: 16, marginBottom: 8 }}>Case Audit Log</h4>
                          {activeAnalysisCase.audit.map((entry, idx) => (
                            <div key={idx} className="step-item" style={{ fontSize: 13, color: 'var(--mu)' }}>
                              {entry}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trained Model Memory & Knowledge Vault (GET /api/documents/trained) */}
                  <div className="card" style={{ marginTop: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>🧠</span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16 }}>Trained Model Memory & Document Knowledge (RAG)</h3>
                          <div className="mu" style={{ fontSize: 12.5 }}>Documents indexed via <code>GET /api/documents/trained</code> and trained into live model context</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn sm o" onClick={fetchTrainedDocs} title="Refresh trained documents list">
                          🔄 Refresh Index
                        </button>
                        {trainedDocs.length > 0 && (
                          <button
                            className="btn sm o"
                            style={{ color: 'var(--bad)' }}
                            onClick={resetTrainedMemory}
                            title="Clear all trained documents from model memory (POST /api/documents/reset-training)"
                          >
                            🧹 Clear Memory
                          </button>
                        )}
                      </div>
                    </div>

                    {trainedDocs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--mu)', fontSize: 13 }}>
                        No documents currently trained. Upload or analyze a document above and click "Train into Model Memory".
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {trainedDocs.map((td) => (
                          <div
                            key={td.id}
                            style={{
                              background: 'var(--bg)',
                              border: '1px solid var(--bd)',
                              borderRadius: 8,
                              padding: 12,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              flexWrap: 'wrap',
                              gap: 10
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 260 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <b>{td.title || td.filename}</b>
                                <span className="badge b-ok">{td.token_count || 0} tokens indexed</span>
                                {td.authority && <span className="badge b-mu">{td.authority}</span>}
                              </div>
                              <div className="mu" style={{ fontSize: 12, marginTop: 4 }}>
                                File: <code>{td.filename}</code> · Indexed: {formatDate(td.trained_at)} · Ref: {td.reference || 'N/A'}
                              </div>
                              {td.clauses && td.clauses.length > 0 && (
                                <div style={{ fontSize: 12.5, color: 'var(--tx)', marginTop: 6 }}>
                                  <b>Key Trained Clause:</b> "{td.clauses[0]}"
                                </div>
                              )}
                            </div>

                            <button
                              className="btn sm o"
                              style={{ color: 'var(--bad)', fontSize: 11.5 }}
                              onClick={() => deleteTrainedDoc(td.id)}
                              title="Delete from model memory (DELETE /api/documents/trained/{id})"
                            >
                              🗑 Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SCHEMES & BENEFITS DISCOVERY */}
              {activeTab === 'sch' && (
                <div>
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ color: '#D97706', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>
                      GOVERNMENT SCHEMES & BENEFITS DISCOVERY
                    </div>
                    <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: 'var(--navy)', marginBottom: 6, fontWeight: 700 }}>
                      Discover welfare programs, statutory subsidies & scholarships.
                    </h1>
                    <p className="sub" style={{ fontSize: 14.5, color: 'var(--mu)', margin: 0 }}>
                      Select a sector to browse category-tailored schemes, or search across 44 verified Central and State programs. Every result provides direct portal links and statutory eligibility criteria.
                    </p>
                  </div>

                  {/* Sector / Category Filter Bar */}
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 18 }}>
                    {SCHEME_CATEGORIES.map((cat) => {
                      const isSelected = schemeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          className={`chip ${isSelected ? 'active' : ''}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '7px 14px',
                            fontSize: 13,
                            fontWeight: isSelected ? 700 : 500,
                            borderRadius: 20,
                            border: isSelected ? '2px solid var(--blue)' : '1px solid var(--bd)',
                            background: isSelected ? 'var(--blb)' : 'var(--bg-card, #fff)',
                            color: isSelected ? 'var(--blue)' : 'var(--tx)',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSchemeCategory(cat.id);
                            runSchemeSearch(schemeQuery, cat.id);
                          }}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 2-Column: Profile / Evaluator on left, Scheme cards on right */}
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1.6fr', alignItems: 'start' }}>
                    {/* Left: Evaluator & Search Agent */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Context-aware Profile Evaluator Card */}
                      <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <h3 style={{ margin: 0, fontSize: 16 }}>
                            {schemeCategory === 'Business & Entrepreneurship' ? 'Company & Startup Profile' :
                             schemeCategory === 'Education & Scholarships' ? 'Student & Academic Profile' :
                             schemeCategory === 'Agriculture & Farmers' ? 'Farmer & Agricultural Profile' :
                             schemeCategory === 'Healthcare & Social Welfare' ? 'Healthcare & Coverage Profile' :
                             schemeCategory === 'Women & Child Welfare' ? 'Women & Family Welfare Profile' :
                             schemeCategory === 'Senior Citizens & Pensions' ? 'Senior Citizen & Pension Profile' :
                             schemeCategory === 'Housing & Property' ? 'Housing & Property Profile' :
                             'Profile & Eligibility Evaluator'}
                          </h3>
                          <span className="badge b-mu" style={{ fontSize: 11 }}>
                            Active: {citizen.name}
                          </span>
                        </div>

                        {/* Company / Startup Inputs */}
                        {(schemeCategory === 'All' || schemeCategory === 'Business & Entrepreneurship') && (
                          <>
                            <label className="mu" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                              Years since incorporation
                            </label>
                            <input
                              type="number"
                              className="in"
                              value={companyYears}
                              onChange={(e) => setCompanyYears(Number(e.target.value) || 0)}
                              style={{ marginBottom: 14 }}
                            />

                            <label className="mu" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                              Annual turnover (₹ crore)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              className="in"
                              value={companyTurnover}
                              onChange={(e) => setCompanyTurnover(Number(e.target.value) || 0)}
                              style={{ marginBottom: 16 }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '4px 0' }}>
                              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--tx)' }}>DPIIT recognised</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={dpiitRecognised}
                                  onChange={(e) => setDpiitRecognised(e.target.checked)}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--tx)' }}>Woman / SC / ST promoter (51%+)</span>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={womanPromoter}
                                  onChange={(e) => setWomanPromoter(e.target.checked)}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                          </>
                        )}

                        {/* Category-Specific Context Display for Other Sectors */}
                        {schemeCategory !== 'All' && schemeCategory !== 'Business & Entrepreneurship' && (
                          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--tx)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)' }}>
                              <span className="mu">Evaluated Citizen</span>
                              <b>{citizen.name}</b>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)' }}>
                              <span className="mu">Occupation / Role</span>
                              <b style={{ textTransform: 'capitalize' }}>{citizen.occupation || citizen.occKey}</b>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)' }}>
                              <span className="mu">Jurisdiction & State</span>
                              <b>{citizen.state || 'Punjab / Central'}</b>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)' }}>
                              <span className="mu">Annual Income</span>
                              <b>₹{(citizen.income || 650000).toLocaleString('en-IN')}</b>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                              <span className="mu">Aadhaar / e-KYC Verification</span>
                              <span className="badge b-ok">Verified</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* AI Personalized Scheme & Scholarship Search Bar */}
                      <div className="card" style={{ border: '1px solid var(--blue)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 16 }}>🔍</span>
                          <b style={{ fontSize: 13 }}>Personalized Search & Discovery Agent</b>
                        </div>
                        <p className="mu" style={{ fontSize: 12, marginBottom: 10 }}>
                          Filter by keyword or tap category-specific fast prompts below.
                        </p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            className="in"
                            style={{ flex: 1, fontSize: 13, padding: '7px 10px' }}
                            placeholder={`e.g. ${(CATEGORY_CHIPS[schemeCategory] || CATEGORY_CHIPS['All'])[0]}...`}
                            value={schemeQuery}
                            onChange={(e) => setSchemeQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && runSchemeSearch(e.target.value, schemeCategory)}
                          />
                          <button
                            className="btn sm p"
                            disabled={schemeLoading}
                            onClick={() => runSchemeSearch(schemeQuery, schemeCategory)}
                          >
                            {schemeLoading ? 'Searching…' : 'Search'}
                          </button>
                        </div>
                        {schemeQuery && (
                          <button
                            className="btn sm o"
                            style={{ marginTop: 8, width: '100%' }}
                            onClick={() => {
                              setSchemeQuery('');
                              runSchemeSearch('', schemeCategory);
                            }}
                          >
                            Reset Search
                          </button>
                        )}
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          <button
                            className="btn sm o"
                            style={{ flex: 1, fontSize: 11.5, padding: '4px 8px', fontWeight: 600 }}
                            onClick={() => fetchScholarshipsApi()}
                            title="Browse Pan-India Scholarships & Grants"
                          >
                            🎓 All Scholarships
                          </button>
                          <button
                            className="btn sm o"
                            style={{ flex: 1, fontSize: 11.5, padding: '4px 8px', fontWeight: 600 }}
                            onClick={() => fetchAllSchemesApi()}
                            title="Browse All Central & State Welfare Schemes"
                          >
                            🌐 Browse All Schemes
                          </button>
                        </div>
                        <div className="chips" style={{ marginTop: 8, marginBottom: 0 }}>
                          {(CATEGORY_CHIPS[schemeCategory] || CATEGORY_CHIPS['All']).map((qText) => (
                            <button
                              key={qText}
                              className="chip"
                              style={{ fontSize: 11, padding: '2px 8px' }}
                              onClick={() => {
                                setSchemeQuery(qText);
                                runSchemeSearch(qText, schemeCategory);
                              }}
                            >
                              {qText}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Dynamic Category-Tailored Scheme Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingBottom: 4, borderBottom: '1px solid var(--bd)' }}>
                        <div>
                          <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700, color: 'var(--navy)' }}>
                            {schemeCategory === 'All' ? 'All Verified Central & State Schemes' : schemeCategory}
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mu)', marginLeft: 8 }}>
                              ({schemes.length} program{schemes.length === 1 ? '' : 's'})
                            </span>
                          </h2>
                          <div className="mu" style={{ fontSize: 12.5, marginTop: 3 }}>
                            {schemeAgentSummary || `Displaying verified schemes tailored to ${citizen.name} (${citizen.state}, ${citizen.occupation}).`}
                          </div>
                        </div>
                        {schemeQuery && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="badge b-mu" style={{ fontSize: 11.5 }}>
                              Query: "{schemeQuery}"
                            </span>
                            <button
                              className="btn sm o"
                              style={{ fontSize: 11, padding: '2px 8px' }}
                              onClick={() => {
                                setSchemeQuery('');
                                runSchemeSearch('', schemeCategory);
                              }}
                            >
                              ✕ Clear
                            </button>
                          </div>
                        )}
                      </div>

                      {schemes.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                          <h3 style={{ fontSize: 16, margin: '0 0 6px' }}>No matching schemes found</h3>
                          <p className="mu" style={{ fontSize: 13, maxWidth: 420, margin: '0 auto 14px' }}>
                            No programs matched {schemeQuery ? `"${schemeQuery}"` : 'your search'} under {schemeCategory}. Try selecting another sector or clearing your query.
                          </p>
                          <button
                            className="btn sm p"
                            onClick={() => {
                              setSchemeQuery('');
                              setSchemeCategory('All');
                              runSchemeSearch('', 'All');
                            }}
                          >
                            Browse All 44 Programs
                          </button>
                        </div>
                      ) : (
                        schemes.map((s) => {
                          const portalUrl = s.url || 'https://services.india.gov.in';
                          let displayHost = 'india.gov.in';
                          try {
                            displayHost = new URL(portalUrl).hostname.replace(/^www\./, '');
                          } catch {
                            displayHost = portalUrl.replace(/^https?:\/\//, '').split('/')[0];
                          }
                          return (
                            <div key={s.id} className="card">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                                    <span className="badge b-mu" style={{ fontSize: 11 }}>{s.category}</span>
                                    {s.state && s.state !== 'All' && s.state !== 'Central' && (
                                      <span className="badge b-warn" style={{ fontSize: 11 }}>{s.state} State</span>
                                    )}
                                  </div>
                                  <h3 style={{ fontSize: 17, margin: '0 0 3px', fontWeight: 700, color: 'var(--navy)' }}>
                                    {s.name}
                                  </h3>
                                  <div className="mu" style={{ fontSize: 13 }}>{s.dept}</div>
                                </div>
                                <span className={`badge ${STATUS_BADGE[s.status] || 'b-ok'}`} style={{ whiteSpace: 'nowrap' }}>
                                  {SCHEME_LABELS[s.status] || s.status}
                                </span>
                              </div>

                              <p style={{ fontSize: 13.5, color: 'var(--tx)', margin: '10px 0', lineHeight: 1.5 }}>
                                {s.benefits}
                              </p>

                              <div className="scheme-callout">
                                <span>ⓘ</span>
                                <span>{s.reason}</span>
                              </div>

                              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <a
                                  href={portalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontSize: 13, fontWeight: 600 }}
                                >
                                  <span>🔗 Direct Official Portal:</span>
                                  <span style={{ textDecoration: 'underline' }}>{displayHost}</span>
                                  <span style={{ fontSize: 11 }}>↗</span>
                                </a>
                                <a
                                  href={portalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn sm o"
                                  style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, fontWeight: 600 }}
                                >
                                  Apply on Portal ↗
                                </a>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MY COMPANY */}
              {activeTab === 'comp' && (
                <div>
                  <div style={{ marginBottom: 18 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                      My Company
                    </h1>
                    <p className="sub" style={{ fontSize: 15, color: 'var(--mu)', margin: 0 }}>
                      Corporate details, statutory registrations, and MCA master data
                    </p>
                  </div>

                  <div className="grid g2">
                    <div className="card">
                      <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Corporate Identity (MCA Master Data)</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                        <div><span className="mu">Company Name:</span> <b>KS ORIGIN COLLECTIVE PRIVATE LIMITED</b></div>
                        <div><span className="mu">CIN:</span> <b>U47912HR2026PTC149798</b></div>
                        <div><span className="mu">Date of Incorporation:</span> <b>28 August 2026</b></div>
                        <div><span className="mu">ROC Jurisdiction:</span> <b>Central Registration Centre (CRC), Manesar / ROC Delhi & Haryana</b></div>
                        <div><span className="mu">Company Class:</span> <b>Company Limited by Shares (Private)</b></div>
                        <div><span className="mu">Registrar Officer:</span> <b>KM Narayanan (AROC / CRC Manesar)</b></div>
                        <div><span className="mu">Status:</span> <span className="badge b-ok">Active / Incorporated</span></div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Tax & Statutory Registrations</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                        <div><span className="mu">PAN:</span> <b>AANCK1913C</b></div>
                        <div><span className="mu">TAN:</span> <b>RTKK14690E</b></div>
                        <div><span className="mu">Registered Office:</span> <b>Ho.No. 994, Sector 10, Sector 15 Panchkula, Panchkula- 134113, Haryana</b></div>
                        <div><span className="mu">Mandatory Post-Incorp Filing:</span> <b>Form INC-20A (Due 24 Feb 2027)</b></div>
                        <div><span className="mu">First Auditor Appointment:</span> <b>Form ADT-1 (Due within 30 days)</b></div>
                        <div><span className="mu">Share Certificates:</span> <span className="badge b-warn">To be issued within 60 days</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COMPLIANCE CALENDAR (Image 4 & 7) */}
              {activeTab === 'cal' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
                    <div>
                      <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                        Compliance Calendar
                      </h1>
                      <p className="sub" style={{ fontSize: 15, color: 'var(--mu)', margin: 0 }}>
                        MCA, GST & Tax statutory deadlines driven by rules engine
                      </p>
                    </div>
                    <button
                      className="btn sm p"
                      onClick={() => setActiveTab('doc')}
                      style={{ fontWeight: 600 }}
                      title="Open Document Intelligence & Vault"
                    >
                      📁 Document Intelligence & Vault →
                    </button>
                  </div>

                  {/* Recalculate Card */}
                  <div className="card" style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <label className="mu" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                          AGM Date (recalculates ROC statutory deadlines)
                        </label>
                        <input
                          type="date"
                          className="in"
                          value={agmDate}
                          onChange={(e) => setAgmDate(e.target.value)}
                          style={{ maxWidth: 280 }}
                        />
                      </div>
                      <button
                        className="btn p"
                        onClick={() => {
                          fetchDeadlines();
                          showToast('Statutory deadlines recalculated from deterministic rules engine (GET /api/deadlines)!');
                        }}
                      >
                        Recalculate Deadlines
                      </button>
                    </div>
                  </div>

                  {/* Monthly Calendar View (November 2026) */}
                  <div className="card" style={{ marginBottom: 18 }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Monthly Calendar View (November 2026)</h3>
                    <div className="cal-grid-wrapper">
                      <div className="cal-grid">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                          <div key={d} className="cal-day-header">{d}</div>
                        ))}
                        {Array.from({ length: 30 }).map((_, i) => {
                          const dayNum = i + 1;
                          return (
                            <div key={dayNum} className="cal-day-cell">
                              <span className="cal-day-num">{dayNum}</span>
                              {dayNum === 11 && (
                                <span className="cal-event-pill" title="GST Return 1">GSTR-1</span>
                              )}
                              {dayNum === 20 && (
                                <span className="cal-event-pill" title="GST Summary Return 3B">GSTR-3B</span>
                              )}
                              {dayNum === 29 && (
                                <span className="cal-event-pill" title="Annual Return ROC">MGT-7</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Statutory Compliances List */}
                  <div className="card">
                    <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Statutory Compliances List</h3>
                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>Form / Compliance</th>
                            <th>Category</th>
                            <th>Statutory Due Date</th>
                            <th>Days Left</th>
                            <th>Late Fee per Day</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {STATUTORY_COMPLIANCES.map((row, idx) => (
                            <tr key={idx}>
                              <td><b>{row.form}</b></td>
                              <td><span className="badge b-mu">{row.category}</span></td>
                              <td>{row.due}</td>
                              <td>{row.daysLeft}</td>
                              <td>{row.fee}</td>
                              <td><span className={`badge ${row.statusClass}`}>{row.status}</span></td>
                              <td>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  <button
                                    className="btn sm o"
                                    onClick={() =>
                                      setModalData({
                                        title: `${row.form} Compliance Details`,
                                        content: (
                                          <div>
                                            <div style={{ marginBottom: 10 }}><b>Compliance Form:</b> {row.form}</div>
                                            <div style={{ marginBottom: 10 }}><b>Category:</b> {row.category}</div>
                                            <div style={{ marginBottom: 10 }}><b>Statutory Due Date:</b> {row.due}</div>
                                            <div style={{ marginBottom: 10 }}><b>Statutory Rule:</b> Companies Act 2013 / CGST Act 2017</div>
                                            <div style={{ marginBottom: 10 }}><b>Late Fee:</b> {row.fee}</div>
                                            <div style={{ marginBottom: 14 }}><b>Status:</b> {row.status}</div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                              <button
                                                className="btn p"
                                                onClick={() => {
                                                  setModalData(null);
                                                  setActiveTab('doc');
                                                  loadSampleDoc('coi');
                                                }}
                                              >
                                                📄 Open Document Draft & Rules
                                              </button>
                                              <button className="btn o" onClick={() => setModalData(null)}>Close</button>
                                            </div>
                                          </div>
                                        )
                                      })
                                    }
                                  >
                                    View Details
                                  </button>
                                  <button
                                    className="btn sm p"
                                    onClick={() => {
                                      setActiveTab('doc');
                                      loadSampleDoc('coi');
                                    }}
                                    title="Open corresponding statutory legal draft and requirements in Document Vault"
                                  >
                                    📄 Document Drafts
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Live Citizen Deadlines from Rules Engine (GET /api/deadlines) */}
                  {apiDeadlines.length > 0 && (
                    <div className="card" style={{ marginTop: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16 }}>Live Citizen & Statutory Deadlines (Rules Engine)</h3>
                          <div className="mu" style={{ fontSize: 12.5 }}>Real-time dynamic compliance dates calculated by <code>GET /api/deadlines</code></div>
                        </div>
                        <button className="btn sm o" onClick={fetchDeadlines}>🔄 Refresh Deadlines</button>
                      </div>
                      <div className="tw">
                        <table>
                          <thead>
                            <tr>
                              <th>Service / Compliance</th>
                              <th>Authority</th>
                              <th>Due Date</th>
                              <th>Days Left</th>
                              <th>Statutory Fee</th>
                              <th>Status</th>
                              <th>Portal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {apiDeadlines.map((dl, idx) => (
                              <tr key={idx}>
                                <td><b>{dl.service}</b></td>
                                <td><span className="mu">{dl.authority}</span></td>
                                <td><b>{formatDate(dl.due)}</b></td>
                                <td>
                                  <span className={`badge ${dl.days_left <= 15 ? 'b-bad' : dl.days_left <= 60 ? 'b-warn' : 'b-ok'}`}>
                                    {dl.days_left !== undefined ? `${dl.days_left} days` : 'Active'}
                                  </span>
                                </td>
                                <td>{dl.fee}</td>
                                <td><span className={`badge ${dl.status === 'Urgent' ? 'b-bad' : 'b-warn'}`}>{dl.status}</span></td>
                                <td>
                                  {dl.portal && (
                                    <a href={dl.portal} target="_blank" rel="noopener noreferrer" className="btn sm o" style={{ fontSize: 11, padding: '2px 8px' }}>
                                      Open Portal ↗
                                    </a>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: FILINGS */}
              {activeTab === 'filings' && (
                <div>
                  <div style={{ marginBottom: 18 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                      Filings
                    </h1>
                    <p className="sub" style={{ fontSize: 15, color: 'var(--mu)', margin: 0 }}>
                      MCA & GST statutory submissions and board resolutions
                    </p>
                  </div>

                  <div className="card">
                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>Form</th>
                            <th>Filing Name</th>
                            <th>Statutory Due Date</th>
                            <th>Authority</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { form: 'AOC-4', name: 'Financial Statements Filing', due: '30 Oct 2026', auth: 'MCA / ROC', status: 'Draft', badge: 'b-mu' },
                            { form: 'MGT-7', name: 'Annual Return', due: '29 Nov 2026', auth: 'MCA / ROC', status: 'Draft', badge: 'b-mu' },
                            { form: 'ADT-1', name: 'Notice of Auditor Appointment', due: '15 Oct 2026', auth: 'MCA / ROC', status: 'Pending approval', badge: 'b-warn' },
                            { form: 'GSTR-1', name: 'Details of Outward Supplies', due: '11 Nov 2026', auth: 'GSTN', status: 'Overdue', badge: 'b-bad' },
                            { form: 'GSTR-3B', name: 'Monthly Summary Return', due: '20 Nov 2026', auth: 'GSTN', status: 'Under review', badge: 'badge' },
                          ].map((f, idx) => (
                            <tr key={idx}>
                              <td><b>{f.form}</b></td>
                              <td>{f.name}</td>
                              <td>{f.due}</td>
                              <td>{f.auth}</td>
                              <td><span className={`badge ${f.badge}`}>{f.status}</span></td>
                              <td>
                                <button className="btn sm o" onClick={() => showToast(`Opening ${f.form} filing package`)}>
                                  Review Filing
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h1>My Tasks & Government Deadlines</h1>
                      <p className="sub">Personal deadline manager for statutory submissions, licence renewals, and payments</p>
                    </div>

                    <button
                      className="btn p"
                      onClick={() =>
                        setModalData({
                          title: 'Add Citizen Deadline Reminder',
                          content: (
                            <div>
                              <label className="mu" style={{ fontSize: 13 }}>Task / Service</label>
                              <input className="in" id="m-task-name" placeholder="e.g. Passport Police Verification" style={{ margin: '4px 0 10px' }} />
                              <label className="mu" style={{ fontSize: 13 }}>Due Date</label>
                              <input type="date" className="in" id="m-task-date" style={{ margin: '4px 0 14px' }} />
                              <button
                                className="btn p"
                                onClick={() => {
                                  const name = document.getElementById('m-task-name')?.value;
                                  const dateVal = document.getElementById('m-task-date')?.value;
                                  if (name && dateVal) {
                                    setTasks(prev => [{ id: Date.now(), name, case: 'Personal Task', due: dateVal, priority: 'Medium', status: 'Pending action', next: 'Follow up' }, ...prev]);
                                    setModalData(null);
                                    showToast('Deadline added to manager!');
                                  }
                                }}
                              >
                                Save Deadline
                              </button>
                            </div>
                          )
                        })
                      }
                    >
                      + Add Custom Deadline
                    </button>
                  </div>

                  <div className="card">
                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>Service / Task</th>
                            <th>Related Case</th>
                            <th>Due Date</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Recommended Action</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((t) => (
                            <tr key={t.id}>
                              <td><b>{t.name}</b></td>
                              <td>{t.case}</td>
                              <td>{formatDate(t.due)}</td>
                              <td><span className={`badge ${PRIORITY_BADGE[t.priority] || ''}`}>{t.priority}</span></td>
                              <td><span className={`badge ${STATUS_BADGE[t.status] || ''}`}>{t.status}</span></td>
                              <td style={{ fontSize: 13 }}>{t.next}</td>
                              <td>
                                <button
                                  className="btn sm"
                                  onClick={() => {
                                    setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: 'Completed' } : x));
                                    showToast('Task marked as completed!');
                                  }}
                                >
                                  Mark Done
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: MY CASES & WORKSPACES */}
              {activeTab === 'cases' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h1>My Cases & Workspaces</h1>
                      <p className="sub">Persistent history of your government procedures, uploaded evidence, and approved drafts</p>
                    </div>

                    <button className="btn p" onClick={() => setActiveTab('doc')}>
                      + Open New Case
                    </button>
                  </div>

                  <div className="grid" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: 16 }}>
                    {/* Cases List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {cases.map((c) => (
                        <div
                          key={c.id}
                          className={`case-card ${c.id === currentCase.id ? 'active' : ''}`}
                          style={{
                            borderColor: c.id === currentCase.id ? 'var(--blue)' : 'var(--bd)',
                            boxShadow: c.id === currentCase.id ? '0 0 0 1px var(--blue)' : 'none'
                          }}
                          onClick={() => setActiveCaseId(c.id)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="badge b-mu">{c.category}</span>
                            <span className={`badge ${c.status === 'Active' ? 'b-ok' : 'b-warn'}`}>{c.status}</span>
                          </div>
                          <h4 style={{ margin: '8px 0 4px', fontSize: 15 }}>{c.title}</h4>
                          <div className="mu" style={{ fontSize: 12 }}>Ref: {c.refNo} · Started: {formatDate(c.date)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Active Case Workspace Details */}
                    <div className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="badge b-ok">{currentCase.category}</span>
                          <h2 style={{ fontSize: 20, margin: '6px 0 4px' }}>{currentCase.title}</h2>
                          <div className="mu" style={{ fontSize: 13 }}>Reference / Application No: <b>{currentCase.refNo}</b></div>
                        </div>
                        <span className="badge b-warn">{currentCase.status}</span>
                      </div>

                      <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, margin: '14px 0', fontSize: 14 }}>
                        <b>Summary of Procedure:</b> {currentCase.summary}
                      </div>

                      <div className="grid g2" style={{ gap: 14 }}>
                        <div style={{ border: '1px solid var(--bd)', borderRadius: 8, padding: 12 }}>
                          <h4>Uploaded Evidence & Documents</h4>
                          <ul style={{ listStyle: 'none', padding: 0, marginTop: 6, fontSize: 13 }}>
                            {currentCase.uploadedDocs.map((doc, idx) => (
                              <li key={idx} style={{ padding: '3px 0' }}>📄 {doc}</li>
                            ))}
                          </ul>
                        </div>

                        <div style={{ border: '1px solid var(--bd)', borderRadius: 8, padding: 12 }}>
                          <h4>Pending Required Documents</h4>
                          <ul style={{ listStyle: 'none', padding: 0, marginTop: 6, fontSize: 13 }}>
                            {currentCase.missingDocs.map((doc, idx) => (
                              <li key={idx} style={{ padding: '3px 0', color: 'var(--bad)' }}>⚠️ {doc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <button className="btn p" onClick={() => setActiveTab('doc')}>
                          Upload Additional Evidence
                        </button>
                        <a
                          href={`https://${currentCase.portal.split(' ')[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn o"
                        >
                          Open Official Portal
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: NOTICE RESOLUTION DESK */}
              {activeTab === 'not' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                        Notice Resolution Desk
                      </h1>
                      <p className="sub" style={{ fontSize: 15, color: 'var(--mu)', margin: 0 }}>
                        Autonomous multi-agent triage for property tax notices, MCA show-cause memos, GST demands, and compliance queries
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        className="btn sm o"
                        onClick={() => loadSampleDoc('property_notice')}
                        title="Load Municipal Revenue & Valuation Notice"
                      >
                        🏛️ Municipal Notice
                      </button>
                      <button
                        className="btn sm o"
                        onClick={() => loadSampleDoc('mca_notice')}
                        title="Load MCA Section 10A / 139 Show Cause Notice"
                      >
                        🏢 MCA Section 10A
                      </button>
                      <button
                        className="btn sm o"
                        onClick={() => loadSampleDoc('gst_notice')}
                        title="Load GST DRC-01 Scrutiny Notice"
                      >
                        💼 GST DRC-01
                      </button>
                      <button
                        className="btn sm o"
                        onClick={() => loadSampleDoc('scholarship')}
                        title="Load Scholarship Defect Query Memo"
                      >
                        🎓 Scholarship Query
                      </button>
                    </div>
                  </div>

                  <div className="dis" style={{ marginBottom: 16 }}>
                    🛡️ Notice replies must be checked and approved by the citizen before submission. JanSahayak AI formulates grounded statutory defenses but does not submit replies automatically without your consent.
                  </div>

                  {/* Notice Input & File Upload Card */}
                  <div className="card" style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label className="mu" style={{ fontSize: 13, fontWeight: 600 }}>
                        Paste Notice Text or Upload Scanned Copy / PDF:
                      </label>
                      <label className="btn sm o" style={{ cursor: 'pointer', fontSize: 12 }}>
                        📎 {docFile ? `File: ${docFile.name}` : 'Upload Notice File'}
                        <input
                          type="file"
                          accept=".pdf,.txt,.doc,.docx,image/*"
                          hidden
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const fileObj = e.target.files[0];
                              setDocFile(fileObj);
                              runDocumentAnalysis('', fileObj);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <textarea
                      rows={5}
                      value={docText}
                      onChange={(e) => setDocText(e.target.value)}
                      placeholder="Paste the received government show-cause notice, penalty demand, summons, or defect memo here..."
                      style={{ width: '100%', marginBottom: 10 }}
                    />
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        className="btn p"
                        disabled={docBusy}
                        onClick={() => runDocumentAnalysis()}
                        style={{ fontWeight: 600 }}
                      >
                        {docBusy ? 'Executing Multi-Agent Pipeline…' : '🚀 Triage Notice with Multi-Agent Pipeline'}
                      </button>
                      {activeAnalysisCase && (
                        <button
                          className="btn o"
                          onClick={() => {
                            setDocText('');
                            setActiveAnalysisCase(null);
                            setDocFile(null);
                          }}
                        >
                          Clear
                        </button>
                      )}
                      <button
                        className="btn sm o"
                        onClick={() => setActiveTab('cal')}
                        style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--blue)' }}
                      >
                        📅 View Compliance Calendar →
                      </button>
                    </div>
                  </div>

                  {/* Multi-Agent Triage Response */}
                  {activeAnalysisCase && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Notice Header & Critical Metadata */}
                      <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--bd)', paddingBottom: 14 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <span className="badge b-bad" style={{ fontWeight: 700 }}>
                                {activeAnalysisCase.extracted.category}
                              </span>
                              <span className={`badge ${activeAnalysisCase.status === 'approved_by_citizen' ? 'b-ok' : 'b-warn'}`}>
                                {activeAnalysisCase.status === 'approved_by_citizen' ? '✓ Approved by Citizen' : '⚠️ Awaiting Citizen Review'}
                              </span>
                              <span className="badge b-mu">
                                {Math.round((activeAnalysisCase.extracted.confidence || 0.85) * 100)}% Extraction Confidence
                              </span>
                            </div>
                            <h2 style={{ fontSize: 22, margin: '6px 0 2px', fontWeight: 700, color: 'var(--navy)' }}>
                              {activeAnalysisCase.extracted.document_type}
                            </h2>
                            <div className="mu" style={{ fontSize: 13 }}>
                              Issuing Authority: <b>{activeAnalysisCase.extracted.authority}</b> · Notice Ref: <b>{activeAnalysisCase.extracted.reference}</b>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div className="mu" style={{ fontSize: 12 }}>Statutory Response Deadline:</div>
                            <b style={{ color: 'var(--bad)', fontSize: 18 }}>{formatDate(activeAnalysisCase.extracted.response_deadline)}</b>
                            <div style={{ marginTop: 6 }}>
                              <button
                                className="btn sm o"
                                onClick={() => setActiveTab('cal')}
                                style={{ fontSize: 11.5, padding: '3px 10px', color: 'var(--blue)' }}
                                title="Add statutory notice deadline to Compliance Calendar"
                              >
                                📅 Sync to Compliance Calendar →
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 4-Box Notice Fact Summary */}
                        <div className="grid g4" style={{ gap: 12, marginTop: 14 }}>
                          <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--bd)' }}>
                            <div className="mu" style={{ fontSize: 11.5, fontWeight: 600 }}>ISSUING AUTHORITY</div>
                            <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2, color: 'var(--navy)' }}>
                              {activeAnalysisCase.extracted.authority}
                            </div>
                          </div>
                          <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--bd)' }}>
                            <div className="mu" style={{ fontSize: 11.5, fontWeight: 600 }}>NOTICE REFERENCE</div>
                            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2, color: 'var(--navy)' }}>
                              {activeAnalysisCase.extracted.reference}
                            </div>
                          </div>
                          <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--bd)' }}>
                            <div className="mu" style={{ fontSize: 11.5, fontWeight: 600 }}>OFFICIAL PORTAL</div>
                            <div style={{ fontSize: 13, marginTop: 2 }}>
                              <a
                                href={activeAnalysisCase.research.portal.startsWith('http') ? activeAnalysisCase.research.portal : `https://${activeAnalysisCase.research.portal.split(' ')[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--blue)', fontWeight: 600 }}
                              >
                                {activeAnalysisCase.research.portal.split(' ')[0]} ↗
                              </a>
                            </div>
                          </div>
                          <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--bd)' }}>
                            <div className="mu" style={{ fontSize: 11.5, fontWeight: 600 }}>STATUTORY PENALTIES / FEES</div>
                            <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2, color: 'var(--bad)' }}>
                              {activeAnalysisCase.research.fees || 'Statutory penalties apply'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multi-Agent Pipeline Execution Trace */}
                      <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <span className="badge b-ok" style={{ fontSize: 11 }}>AUTONOMOUS AGENTS</span>
                          <h3 style={{ margin: 0, fontSize: 16 }}>Multi-Agent Resolution Pipeline</h3>
                        </div>
                        <div className="grid g3" style={{ gap: 10 }}>
                          {[
                            { name: 'Document Agent', role: 'Fact Extraction', icon: '🔍', desc: `Extracted ${activeAnalysisCase.extracted.category} Ref: ${activeAnalysisCase.extracted.reference}` },
                            { name: 'Research Agent', role: 'Statutory Verification', icon: '📚', desc: `Rules from ${activeAnalysisCase.research.dept || 'Department KB'}` },
                            { name: 'Evidence Agent', role: 'Proof Audit', icon: '📑', desc: `${activeAnalysisCase.evidence.filter(e => e.status === 'received').length} received · ${activeAnalysisCase.evidence.filter(e => e.status === 'missing').length} missing` },
                            { name: 'Planner Agent', role: 'Timeline Scheduling', icon: '📅', desc: `Deadline scheduled: ${formatDate(activeAnalysisCase.extracted.response_deadline)}` },
                            { name: 'Draft Agent', role: 'Representation Formulation', icon: '✍️', desc: `Generated formal legal defense reply` },
                            { name: 'QA Agent', role: 'Consent & Safety', icon: '🛡️', desc: `Verified citizen sign-off requirement` },
                          ].map((ag, idx) => (
                            <div key={idx} style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--bd)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
                                <span>{ag.icon}</span>
                                <span>{ag.name}</span>
                              </div>
                              <div className="mu" style={{ fontSize: 11.5, marginTop: 2 }}>{ag.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Identified Notice Grounds & Statutory Clauses */}
                      {activeAnalysisCase.extracted.important_clauses && activeAnalysisCase.extracted.important_clauses.length > 0 && (
                        <div className="card">
                          <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>Identified Notice Clauses & Legal Allegations</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {activeAnalysisCase.extracted.important_clauses.map((clause, idx) => (
                              <div key={idx} className="scheme-callout" style={{ margin: 0 }}>
                                <span style={{ color: 'var(--bad)', fontWeight: 700 }}>⚠️</span>
                                <span style={{ fontSize: 13, color: 'var(--tx)' }}>{clause}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence & Supporting Documents Checklist */}
                      <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <h3 style={{ margin: 0, fontSize: 16 }}>Required Evidence & Supporting Proofs</h3>
                          <span className="badge b-mu">
                            {activeAnalysisCase.evidence.filter(e => e.status === 'received').length} / {activeAnalysisCase.evidence.length} Proofs Verified
                          </span>
                        </div>
                        <div className="grid g2" style={{ gap: 10 }}>
                          {activeAnalysisCase.evidence.map((e, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 12px',
                                borderRadius: 8,
                                background: e.status === 'received' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                                border: `1px solid ${e.status === 'received' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                              }}
                            >
                              <div style={{ fontSize: 13, fontWeight: 600 }}>
                                {e.status === 'received' ? '✓' : '⚠️'} {e.doc}
                              </div>
                              <span className={`badge ${e.status === 'received' ? 'b-ok' : 'b-bad'}`} style={{ fontSize: 11 }}>
                                {e.status === 'received' ? 'Attached' : 'Missing Proof'}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Add Supporting Document Form */}
                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--bd)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            className="in"
                            style={{ flex: 1, minWidth: 260, fontSize: 13, padding: '7px 10px' }}
                            placeholder="Register additional attached proof (e.g. Bank Challan receipt, Sale Deed copy, NOC)..."
                            value={docAdditionalEvidence}
                            onChange={(e) => setDocAdditionalEvidence(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCaseEvidence()}
                          />
                          <button
                            className="btn sm p"
                            onClick={addCaseEvidence}
                            disabled={!docAdditionalEvidence.trim()}
                          >
                            + Register Evidence
                          </button>
                        </div>
                      </div>

                      {/* Prepared Legal Representation & Reply Draft */}
                      <div className="card" style={{ border: '1px solid var(--bd)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--bd)' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <h3 style={{ margin: 0, fontSize: 17 }}>Formal Representation / Reply Draft</h3>
                              <span className="badge b-ok">{activeAnalysisCase.draft_source || 'AI Language Model'}</span>
                            </div>
                            <p className="mu" style={{ fontSize: 12.5, margin: '2px 0 0' }}>
                              Ground-researched, legally respectful submission citing notice reference and supporting evidence.
                            </p>
                          </div>

                          {/* Toolbar */}
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button
                              className="btn sm o"
                              onClick={() => copyDraftToClipboard(editedDraft || activeAnalysisCase.draft)}
                              title="Copy full representation letter to clipboard"
                            >
                              📋 Copy Draft
                            </button>
                            <button
                              className="btn sm o"
                              onClick={() => setIsEditingDraft(!isEditingDraft)}
                              title="Toggle inline draft editing"
                            >
                              ✏️ {isEditingDraft ? 'Preview Formatted' : 'Edit Draft'}
                            </button>
                            <button
                              className="btn sm o"
                              onClick={() => downloadDraftFile(`Notice_Reply_${activeAnalysisCase.extracted.reference || 'Draft'}.txt`, editedDraft || activeAnalysisCase.draft)}
                              title="Download draft letter as text file"
                            >
                              📥 Download (.txt)
                            </button>
                            <button
                              className="btn sm o"
                              onClick={() => setActiveTab('cal')}
                              title="Track response deadline in Compliance Calendar"
                            >
                              📅 Calendar →
                            </button>
                            <a
                              href={activeAnalysisCase.research.portal.startsWith('http') ? activeAnalysisCase.research.portal : `https://${activeAnalysisCase.research.portal.split(' ')[0]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn sm p"
                              style={{ fontWeight: 600 }}
                            >
                              🔗 Official Portal ↗
                            </a>
                          </div>
                        </div>

                        {/* Representation Body */}
                        {isEditingDraft ? (
                          <textarea
                            rows={14}
                            value={editedDraft}
                            onChange={(e) => setEditedDraft(e.target.value)}
                            style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6, padding: 12 }}
                          />
                        ) : (
                          <div style={{
                            background: 'var(--panel)',
                            border: '1px solid var(--bd)',
                            borderRadius: 8,
                            padding: '16px 20px',
                            fontFamily: 'serif',
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: 'var(--tx)',
                            whiteSpace: 'pre-wrap',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                          }}>
                            {editedDraft || activeAnalysisCase.draft}
                          </div>
                        )}

                        {/* Approval Section */}
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--bd)' }}>
                          {activeAnalysisCase.status === 'approved_by_citizen' ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', padding: '12px 16px', borderRadius: 8 }}>
                              <div>
                                <b style={{ color: '#047857' }}>✓ Representation Approved by Citizen</b>
                                <div style={{ fontSize: 13, color: 'var(--tx)', marginTop: 2 }}>
                                  This response is locked and registered in your Compliance Tasks. You can now copy or download it to submit on the official department portal.
                                </div>
                              </div>
                              <a
                                href={activeAnalysisCase.research.portal.startsWith('http') ? activeAnalysisCase.research.portal : `https://${activeAnalysisCase.research.portal.split(' ')[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn p"
                                style={{ fontWeight: 700 }}
                              >
                                Submit on Portal ↗
                              </a>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                              <p className="mu" style={{ fontSize: 13, margin: 0, maxWidth: 520 }}>
                                By clicking approve, you confirm that all stated facts and attached records are true and accurate. JanSahayak will log this resolution in your compliance records.
                              </p>
                              <button
                                className="btn p"
                                onClick={approveCaseDraft}
                                style={{ fontWeight: 700, padding: '9px 20px', fontSize: 14 }}
                              >
                                ✅ Approve & Save Response
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PROFESSIONALS (CA, CS & ADVOCATES) */}
              {activeTab === 'prof' && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', marginBottom: 4 }}>
                      Verified Professionals Network
                    </h1>
                    <p className="sub" style={{ fontSize: 15, color: 'var(--mu)', margin: 0 }}>
                      Licensed Chartered Accountants, Company Secretaries, and Advocates for statutory sign-offs and notice representation
                    </p>
                  </div>

                  <div className="grid g3">
                    {[
                      {
                        name: 'CA Raman Khanna',
                        title: 'Fellow Chartered Accountant (FCA)',
                        reg: 'ICAI Mem: 084920 · 14 yrs exp',
                        specialty: 'Statutory Corporate Audit, AOC-4, MGT-7 & ROC Compliance',
                        rating: '4.9 ★ (120+ filings)',
                        fee: '₹2,500 / filing sign-off'
                      },
                      {
                        name: 'CS Meenakshi Bansal',
                        title: 'Practicing Company Secretary (PCS)',
                        reg: 'ICSI Mem: 12940 · 10 yrs exp',
                        specialty: 'Board Resolutions, Secretarial Audit & DPIIT Startup Certification',
                        rating: '5.0 ★ (85+ reviews)',
                        fee: '₹3,000 / certification'
                      },
                      {
                        name: 'Adv. Harpreet Singh',
                        title: 'High Court & Commercial Advocate',
                        reg: 'Bar Council: P/1942/2012 · 12 yrs exp',
                        specialty: 'MCA Show Cause Notices, GST Appeals & Property Legal Search Reports',
                        rating: '4.8 ★ (90+ cases)',
                        fee: '₹4,500 / notice representation'
                      }
                    ].map((pro, idx) => (
                      <div className="card" key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 17 }}>{pro.name}</h3>
                            <div className="mu" style={{ fontSize: 13, marginTop: 2 }}>{pro.title}</div>
                          </div>
                          <span className="badge b-ok" style={{ fontSize: 11 }}>Verified</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 8 }}>{pro.reg}</div>
                        <p style={{ fontSize: 13.5, color: 'var(--tx)', flex: 1, margin: '8px 0 14px' }}>
                          <b>Practice Area:</b> {pro.specialty}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bd)', paddingTop: 12 }}>
                          <div>
                            <span style={{ fontSize: 12, color: '#D97706', fontWeight: 700 }}>{pro.rating}</span>
                            <div style={{ fontSize: 12, color: 'var(--mu)' }}>{pro.fee}</div>
                          </div>
                          <button
                            className="btn sm p"
                            onClick={() => {
                              showToast(`Connecting with ${pro.name} for statutory review…`);
                              setActiveTab('ai');
                              sendChatMessage(`I want to assign CA/CS review for our statutory filings to ${pro.name}.`);
                            }}
                          >
                            Assign Task
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: RECORDS & AUDIT TRAIL */}
              {activeTab === 'rep' && (
                <div>
                  <h1>Citizen Records & System Audit Trail</h1>
                  <p className="sub">Verified record of all your government procedures, approved drafts, and interactions</p>

                  <div className="grid g3">
                    <div className="card kpi">
                      <span>Procedures Completed</span>
                      <b>14</b>
                    </div>
                    <div className="card kpi">
                      <span>Verified Certificates</span>
                      <b>6</b>
                    </div>
                    <div className="card kpi">
                      <span>Audit Trail Events</span>
                      <b>28</b>
                    </div>
                  </div>

                  <div className="card" style={{ marginTop: 18 }}>
                    <h3>Immutable Citizen Activity Log</h3>
                    <div className="tw" style={{ marginTop: 10 }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Timestamp</th>
                            <th>Procedure / Event</th>
                            <th>Official Portal</th>
                            <th>Outcome</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ['Today, 10:42 AM', 'Sale deed title chain analysis run by Document AI', 'Jamabandi Punjab', 'Verified (No dispute recorded)'],
                            ['Today, 10:48 AM', '1.5% female stamp duty concession matched for Sunita Devi', 'Revenue Dept', '₹1.2 Lakh savings flagged'],
                            ['Yesterday, 03:15 PM', 'Income Certificate self-declaration draft approved', 'Punjab Seva Kendra', 'Ready for submission'],
                            ['08 Nov 2026', 'PM-KISAN e-KYC status verified via Aadhaar OTP', 'pmkisan.gov.in', 'Completed successfully'],
                            ['04 Nov 2026', 'Driving licence renewal Form 9 auto-prepared', 'Parivahan Sewa', 'Awaiting RTO appointment slot'],
                          ].map(([time, event, portal, outcome], idx) => (
                            <tr key={idx}>
                              <td><span className="badge b-mu">{time}</span></td>
                              <td><b>{event}</b></td>
                              <td>{portal}</td>
                              <td><span className="badge b-ok">{outcome}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: SETTINGS & CITIZEN PROFILE */}
              {activeTab === 'set' && (
                <div>
                  <h1>Citizen Profile & Settings</h1>
                  <p className="sub">Personal details, language, family category, and notification preferences</p>

                  <div className="grid g2">
                    <div className="card">
                      <h3>Citizen Profile</h3>
                      <label className="mu" style={{ fontSize: 13 }}>Full Name</label>
                      <input className="in" defaultValue={citizen.name} style={{ margin: '4px 0 10px' }} />

                      <label className="mu" style={{ fontSize: 13 }}>State & District</label>
                      <input className="in" defaultValue={`${citizen.district}, ${citizen.state}`} style={{ margin: '4px 0 10px' }} />

                      <label className="mu" style={{ fontSize: 13 }}>Occupation</label>
                      <input className="in" defaultValue={citizen.occupation} style={{ margin: '4px 0 10px' }} />

                      <label className="mu" style={{ fontSize: 13 }}>Annual Household Income (₹)</label>
                      <input className="in" type="number" defaultValue={citizen.income} style={{ margin: '4px 0 16px' }} />

                      <button className="btn p" onClick={() => showToast('Citizen profile updated!')}>
                        Save Profile
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      {/* AI Model Intelligence & API Key Settings Card */}
                      <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ margin: 0 }}>AI Intelligence & API Keys</h3>
                          <span className={`badge ${apiKeyInfo.connected ? 'b-ok' : 'b-mu'}`} style={{ fontSize: 11 }}>
                            {apiKeyInfo.model}
                          </span>
                        </div>
                        <p className="mu" style={{ fontSize: 13, margin: '6px 0 12px' }}>
                          JanSahayak runs on a trained statutory rules engine by default. You can connect your Google Gemini, Anthropic Claude, or OpenAI API key for generative reasoning.
                        </p>

                        <div style={{ background: 'var(--panel)', padding: 10, borderRadius: 6, fontSize: 12.5, marginBottom: 12 }}>
                          <div><b>Active Engine:</b> {apiKeyInfo.provider}</div>
                          <div className="mu" style={{ marginTop: 2 }}><b>Status:</b> {apiKeyInfo.connected ? `Connected (${apiKeyInfo.masked_key})` : 'Trained Rules Engine (100% Deterministic & Verified)'}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <select
                            className="in sm"
                            style={{ width: 140 }}
                            value={apiProvider}
                            onChange={(e) => setApiProvider(e.target.value)}
                          >
                            <option value="gemini">Google Gemini</option>
                            <option value="anthropic">Anthropic Claude</option>
                            <option value="openai">OpenAI GPT</option>
                          </select>
                          <input
                            type="password"
                            className="in sm"
                            style={{ flex: 1, minWidth: 180 }}
                            placeholder="Enter API Key to connect"
                            value={inputApiKey}
                            onChange={(e) => setInputApiKey(e.target.value)}
                          />
                          <button className="btn sm p" disabled={apiKeySaving} onClick={saveApiKey}>
                            {apiKeySaving ? 'Connecting…' : 'Save Key'}
                          </button>
                        </div>
                      </div>

                      {/* Statutory Intelligence & Verification Engine Card */}
                      <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <h3 style={{ margin: 0 }}>Statutory Intelligence & Verification Engine</h3>
                          <span className="badge b-ok" style={{ fontSize: 11 }}>🟢 Live & Operational</span>
                        </div>
                        <p className="mu" style={{ fontSize: 13, margin: '4px 0 12px' }}>
                          Deterministic legal rules engine powering real-time compliance scheduling, notice intelligence, personalized scheme discovery, and document analysis.
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span className="badge b-ok" style={{ fontSize: 12 }}>17 Verification Microservices Connected</span>
                          <span className="badge b-mu" style={{ fontSize: 12 }}>Central & State Legal Data Active</span>
                        </div>
                      </div>

                      {/* Trained Model Memory & RAG Vault Card */}
                      <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <h3 style={{ margin: 0 }}>Trained Model Memory Vault</h3>
                          <span className="badge b-mu" style={{ fontSize: 11 }}>
                            {trainedDocs.length} Indexed
                          </span>
                        </div>
                        <p className="mu" style={{ fontSize: 13, margin: '4px 0 10px' }}>
                          Documents indexed into active model memory for RAG queries and autonomous clause evaluation.
                        </p>
                        {trainedDocs.length === 0 ? (
                          <div style={{ fontSize: 12.5, color: 'var(--mu)', background: 'var(--panel)', padding: 10, borderRadius: 6 }}>
                            No documents currently trained.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {trainedDocs.map((td) => (
                              <div key={td.id} style={{ background: 'var(--panel)', border: '1px solid var(--bd)', borderRadius: 6, padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{td.title || td.filename}</div>
                                  <div className="mu" style={{ fontSize: 11.5 }}>{td.token_count || 0} tokens · {td.reference || 'N/A'}</div>
                                </div>
                                <button
                                  className="btn sm o"
                                  style={{ color: 'var(--bad)', fontSize: 11, padding: '2px 6px' }}
                                  onClick={() => deleteTrainedDoc(td.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                            <button
                              className="btn sm o"
                              style={{ color: 'var(--bad)', marginTop: 4, width: '100%' }}
                              onClick={resetTrainedMemory}
                            >
                              Clear All Model Memory
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="card">
                        <h3>Notification Preferences</h3>
                        {[
                          'Statutory deadline reminders (30 days & 7 days prior)',
                          'Scheme eligibility alerts matching my profile',
                          'Government notice response countdown alerts',
                          'In-app notification badge & audio alert',
                        ].map((item, idx) => (
                          <label
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '10px 0',
                              borderBottom: '1px solid var(--bd)',
                              fontSize: 14,
                            }}
                          >
                            {item}
                            <input type="checkbox" defaultChecked />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      ) : (
        /* VIEW: MARKETING LANDING PAGE (Authentic JanSahayak Lovable UI) */
        <div className="landing-cream" id="site">
          {/* Top Black Approval Pill Banner (Screenshot Exact) */}
          <div style={{ textAlign: 'center', padding: '10px 0', borderBottom: '1px solid #E5E7EB', background: '#FAF7F2' }}>
            <div className="approval-pill">
              <span>ⓘ</span>
              <span>Nothing is ever filed without your explicit approval.</span>
            </div>
          </div>

          {/* Top Nav (Prominent & Spacious) */}
          <nav className="top" style={{ background: '#FAF7F2', borderBottom: '1px solid #E5E7EB' }}>
            <div className="wrap" style={{ height: 82, gap: 36 }}>
              <a className="logo" href="#" onClick={(e) => { e.preventDefault(); setViewMode('landing'); }} style={{ fontSize: 23, gap: 12 }}>
                <i style={{ width: 40, height: 40, background: '#000', color: '#fff', fontFamily: 'Georgia, serif', borderRadius: 8, fontSize: 19, display: 'grid', placeItems: 'center' }}>J</i>
                <span style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 800 }}>JanSahayak AI</span>
              </a>
              <div className="links" style={{ fontSize: 16, gap: 32 }}>
                <a href="#features">Features</a>
                <a href="#schemes">Government Schemes</a>
                <a href="#pricing">Pricing</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  className="theme-toggle-btn"
                  onClick={() => {
                    const next = theme === 'light' ? 'dark' : 'light';
                    setTheme(next);
                    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`);
                  }}
                  title="Toggle Light/Dark Theme"
                  style={{ padding: '8px 15px', fontSize: 14 }}
                >
                  {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
                <button
                  className="btn o"
                  onClick={() => setViewMode('app')}
                  style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: 15, padding: '9px 18px' }}
                >
                  Log in
                </button>
                <button
                  className="btn p"
                  onClick={() => setViewMode('app')}
                  style={{ background: 'var(--navy)', borderColor: 'var(--navy)', color: '#fff', fontSize: 15, fontWeight: 700, padding: '10px 22px', borderRadius: 9 }}
                >
                  Try the demo
                </button>
              </div>
            </div>
          </nav>

          {/* ABOUT SECTION (Screenshot Exact - Image 2) */}
          <section className="s" id="about" style={{ padding: '72px 0 60px' }}>
            <div className="wrap">
              <div style={{ color: '#D97706', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>
                ABOUT
              </div>
              <h1 className="serif-title" style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', lineHeight: 1.15, marginBottom: 16 }}>
                Jan Sahayak means “helper of the people”.
              </h1>
              <p style={{ fontSize: 19, color: 'var(--mu)', maxWidth: 720, lineHeight: 1.5, marginBottom: 48 }}>
                We believe every Indian founder deserves the calm confidence of a full compliance team — without the cost.
              </p>

              {/* 3 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, paddingTop: 32, borderTop: '1px solid #E5E7EB' }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--navy)' }}>Our mission</h3>
                  <p style={{ fontSize: 14.5, color: '#4B5563', lineHeight: 1.6 }}>
                    Make statutory compliance predictable and affordable for India's newest companies, so founders can focus on building.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--navy)' }}>Our approach</h3>
                  <p style={{ fontSize: 14.5, color: '#4B5563', lineHeight: 1.6 }}>
                    AI handles preparation, reminders and research. Licensed professionals certify. Founders approve. Every step is logged.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--navy)' }}>Our team</h3>
                  <p style={{ fontSize: 14.5, color: '#4B5563', lineHeight: 1.6 }}>
                    Built by Team Trouble Shooters — engineers and finance professionals who have lived the pain of missed filings.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* GOVERNMENT SCHEMES CALCULATOR SECTION (Screenshot Exact - Image 1) */}
          <section className="s" id="schemes" style={{ background: '#FAF7F2', padding: '60px 0 84px', borderTop: '1px solid #E5E7EB' }}>
            <div className="wrap">
              <div style={{ color: '#D97706', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
                GOVERNMENT SCHEMES
              </div>
              <h2 className="serif-title" style={{ fontSize: 'clamp(28px, 3.8vw, 44px)', marginBottom: 10 }}>
                Discover the benefits your business may qualify for.
              </h2>
              <p style={{ fontSize: 17, color: 'var(--mu)', marginBottom: 36 }}>
                Adjust your profile and see results update instantly. Every result explains why.
              </p>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1.6fr', alignItems: 'start' }}>
                {/* Left Card: Your company */}
                <div className="card">
                  <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Your company</h3>

                  <label className="mu" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Years since incorporation
                  </label>
                  <input
                    type="number"
                    className="in"
                    value={companyYears}
                    onChange={(e) => setCompanyYears(Number(e.target.value) || 0)}
                    style={{ marginBottom: 14 }}
                  />

                  <label className="mu" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Annual turnover (₹ crore)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="in"
                    value={companyTurnover}
                    onChange={(e) => setCompanyTurnover(Number(e.target.value) || 0)}
                    style={{ marginBottom: 16 }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>DPIIT recognised</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={dpiitRecognised}
                        onChange={(e) => setDpiitRecognised(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Woman / SC / ST promoter (51%+)</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={womanPromoter}
                        onChange={(e) => setWomanPromoter(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                {/* Right Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>DPIIT Startup Recognition</h3>
                        <div className="mu" style={{ fontSize: 13, marginTop: 2 }}>DPIIT, Ministry of Commerce</div>
                      </div>
                      <span className="badge b-ok">Potentially eligible</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--tx)', margin: '10px 0' }}>
                      Gateway to tax exemptions, self-certification and faster IP processing.
                    </p>
                    <div className="scheme-callout">
                      <span>ⓘ</span>
                      <span>Age and turnover fit. An innovation statement is still required.</span>
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <a
                        href="https://www.startupindia.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontSize: 13, fontWeight: 600 }}
                      >
                        <span>🔗 Direct Official Portal:</span>
                        <span style={{ textDecoration: 'underline' }}>startupindia.gov.in</span>
                        <span style={{ fontSize: 11 }}>↗</span>
                      </a>
                      <a
                        href="https://www.startupindia.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn sm o"
                        style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6 }}
                      >
                        Apply on Portal ↗
                      </a>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>Section 80-IAC Tax Holiday</h3>
                        <div className="mu" style={{ fontSize: 13, marginTop: 2 }}>Inter-Ministerial Board</div>
                      </div>
                      <span className="badge b-warn">Needs more information</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--tx)', margin: '10px 0' }}>
                      100% profit-linked deduction for 3 of the first 10 years.
                    </p>
                    <div className="scheme-callout">
                      <span>ⓘ</span>
                      <span>DPIIT recognition is a prerequisite.</span>
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <a
                        href="https://www.startupindia.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontSize: 13, fontWeight: 600 }}
                      >
                        <span>🔗 Direct Official Portal:</span>
                        <span style={{ textDecoration: 'underline' }}>startupindia.gov.in/tax-exemptions</span>
                        <span style={{ fontSize: 11 }}>↗</span>
                      </a>
                      <a
                        href="https://www.startupindia.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn sm o"
                        style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6 }}
                      >
                        Apply on Portal ↗
                      </a>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: 6 }}>
                    <button className="btn p" onClick={() => { setActiveTab('sch'); setViewMode('app'); }}>
                      Explore Full Schemes & Scholarships Search →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer>
            <div className="wrap">
              <div className="grid g4">
                <div>
                  <div className="logo" style={{ color: '#fff', marginBottom: 8 }}>
                    <i style={{ background: 'var(--blue)' }}>JS</i> JanSahayak AI
                  </div>
                  Government processes, made simpler for every Indian.
                  <br />
                  <span style={{ fontSize: 13, color: 'var(--mu)' }}>Team Trouble Shooters · VentureX</span>
                </div>
                <div>
                  <h4>Sections</h4>
                  <a href="#about">About</a>
                  <a href="#schemes">Government Schemes</a>
                  <a href="#features">Features</a>
                  <a href="#pricing">Pricing</a>
                </div>
                <div>
                  <h4>Grounded Portals</h4>
                  <a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer">Ministry of Corporate Affairs</a>
                  <a href="https://www.startupindia.gov.in" target="_blank" rel="noopener noreferrer">Startup India</a>
                  <a href="https://myscheme.gov.in" target="_blank" rel="noopener noreferrer">myScheme</a>
                  <a href="https://services.india.gov.in" target="_blank" rel="noopener noreferrer">National Services Portal</a>
                </div>
                <div>
                  <h4>Platform Access</h4>
                  <button className="btn p" onClick={() => setViewMode('app')} style={{ marginTop: 8 }}>
                    Try the demo
                  </button>
                </div>
              </div>
              <p style={{ marginTop: 28, fontSize: 12, color: 'var(--mu)' }}>
                JanSahayak AI is an assistance and coordination platform, not an official government agency. Always verify dates and rules on official portals.
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

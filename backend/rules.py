"""Deterministic rules engine for JanSahayak AI (Citizen-First Government Assistance).
Statutory deadlines, fees, eligibility rules, and required documents.
All information is grounded in official government sources (services.india.gov.in, myScheme, Parivahan, UMANG, e-District).
"""
from datetime import date, timedelta

# Citizen Statutory Deadlines (Rules engine)
CITIZEN_DEADLINES = [
    {
        "service": "Form INC-20A (Commencement of Business)",
        "authority": "Ministry of Corporate Affairs, CRC Manesar / ROC",
        "due": "2027-02-24",
        "days_left": 102,
        "grace_period": "Mandatory within 180 days of incorporation for KS ORIGIN COLLECTIVE PVT LTD",
        "fee": "₹300 - ₹600 (Late filing penalty ₹50,000 for company, ₹1,000/day for directors)",
        "portal": "https://www.mca.gov.in",
        "category": "Corporate Filing",
        "status": "Action Required"
    },
    {
        "service": "Form ADT-1 (First Statutory Auditor Appointment)",
        "authority": "Ministry of Corporate Affairs, CRC Manesar / ROC",
        "due": "2026-09-27",
        "days_left": 0,
        "grace_period": "Board must appoint auditor within 30 days of 28 Aug 2026 incorporation",
        "fee": "Standard MCA filing fee ₹300 - ₹600",
        "portal": "https://www.mca.gov.in",
        "category": "Corporate Filing",
        "status": "Urgent"
    },
    {
        "service": "Driving Licence Renewal",
        "authority": "Ministry of Road Transport & Highways (Parivahan Sewa)",
        "due": "2026-11-28",
        "days_left": 14,
        "grace_period": "30 days from expiry without re-test",
        "fee": "₹200 (Form 9 renewal fee)",
        "portal": "https://parivahan.gov.in",
        "category": "Licence",
        "status": "Action Required"
    },
    {
        "service": "Income Tax Return (ITR) Verification",
        "authority": "Income Tax Department (e-Filing Portal)",
        "due": "2026-12-15",
        "days_left": 31,
        "grace_period": "30 days from filing for e-verification",
        "fee": "Nil (e-Verification via Aadhaar OTP)",
        "portal": "https://eportal.incometax.gov.in",
        "category": "Taxation",
        "status": "Pending Verification"
    },
    {
        "service": "Municipal Property Tax Early-Bird Rebate",
        "authority": "Municipal Corporation / Urban Local Bodies",
        "due": "2026-12-31",
        "days_left": 47,
        "grace_period": "Late payment attracts 1.5% interest per month",
        "fee": "Rebate: 10% discount if paid before 31 Dec",
        "portal": "https://services.india.gov.in",
        "category": "Property",
        "status": "Upcoming"
    },
    {
        "service": "PM-KISAN e-KYC & Land Seeding",
        "authority": "Ministry of Agriculture & Farmers Welfare",
        "due": "2026-11-30",
        "days_left": 16,
        "grace_period": "Mandatory for 19th installment disbursement",
        "fee": "Nil (Online via OTP) / ₹15 at CSC center",
        "portal": "https://pmkisan.gov.in",
        "category": "Agriculture",
        "status": "Urgent"
    },
    {
        "service": "Post-Matric Scholarship Application Close",
        "authority": "National Scholarship Portal (NSP)",
        "due": "2026-12-10",
        "days_left": 26,
        "grace_period": "Institution verification closes 15 days later",
        "fee": "Nil",
        "portal": "https://scholarships.gov.in",
        "category": "Education",
        "status": "In Progress"
    },
    {
        "service": "GST Quarter Return (GSTR-3B / QRMP)",
        "authority": "GSTN / Central Board of Indirect Taxes",
        "due": "2026-11-20",
        "days_left": 6,
        "grace_period": "Late fee ₹50/day (₹20/day for Nil return)",
        "fee": "Late fee applies past due date",
        "portal": "https://www.gst.gov.in",
        "category": "Business",
        "status": "Urgent"
    }
]

def citizen_deadlines():
    today = date.today()
    for d in CITIZEN_DEADLINES:
        try:
            target = date.fromisoformat(d["due"])
            d["days_left"] = (target - today).days
        except Exception:
            pass
    return CITIZEN_DEADLINES

# Citizen Government Schemes Directory (across education, farmers, women, housing, healthcare, MSME)
SCHEMES = [
    {
        "id": "pmay",
        "name": "Pradhan Mantri Awas Yojana (PMAY-Urban / Gramin)",
        "category": "Housing & Property",
        "dept": "Ministry of Housing and Urban Affairs",
        "benefits": "Interest subsidy up to ₹2.67 lakh on home loans under Credit Linked Subsidy Scheme (CLSS) for EWS/LIG families.",
        "url": "https://pmaymis.gov.in",
        "source": "MoHUA / PMAY Guidelines 2026"
    },
    {
        "id": "pmkisan",
        "name": "PM-KISAN Samman Nidhi",
        "category": "Agriculture & Farmers",
        "dept": "Ministry of Agriculture & Farmers Welfare",
        "benefits": "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 into Aadhaar-linked bank accounts.",
        "url": "https://pmkisan.gov.in",
        "source": "PM-KISAN Portal, Govt of India"
    },
    {
        "id": "ayushman",
        "name": "Ayushman Bharat PM-JAY (Health Insurance)",
        "category": "Healthcare & Social Welfare",
        "dept": "National Health Authority (NHA)",
        "benefits": "Cashless secondary and tertiary health coverage up to ₹5 lakh per family per year across 27,000+ empanelled hospitals.",
        "url": "https://pmjay.gov.in",
        "source": "National Health Authority"
    },
    {
        "id": "nsp_scholarship",
        "name": "Central Sector Post-Matric Scholarship for Higher Education",
        "category": "Education & Scholarships",
        "dept": "Ministry of Education / NSP",
        "benefits": "Financial assistance covering 100% tuition fees plus maintenance allowance up to ₹13,500/year for college students.",
        "url": "https://scholarships.gov.in",
        "source": "National Scholarship Portal"
    },
    {
        "id": "sukanya",
        "name": "Sukanya Samriddhi Yojana (SSY)",
        "category": "Women & Child Welfare",
        "dept": "Department of Posts & Ministry of Finance",
        "benefits": "High sovereign interest rate (8.2% p.a.) with Section 80C tax deduction and tax-free maturity for girl children under 10.",
        "url": "https://www.indiapost.gov.in",
        "source": "India Post / Ministry of Finance"
    },
    {
        "id": "women_stamp_duty",
        "name": "State Women Homebuyer Stamp Duty Concession (1% - 2% Rebate)",
        "category": "Housing & Property",
        "dept": "State Revenue & Registration Departments (Punjab, Delhi, Haryana, Maharashtra)",
        "benefits": "1% to 2% concession on stamp duty fees when residential property is registered in the name of a female sole owner or co-owner.",
        "url": "https://services.india.gov.in",
        "source": "State Stamp & Registration Acts"
    },
    {
        "id": "atal_pension",
        "name": "Atal Pension Yojana (APY)",
        "category": "Senior Citizens & Pensions",
        "dept": "PFRDA / Ministry of Finance",
        "benefits": "Guaranteed monthly pension of ₹1,000 to ₹5,000 from age 60 for unorganized sector workers and citizens aged 18-40.",
        "url": "https://www.npscra.nsdl.co.in",
        "source": "Pension Fund Regulatory Authority (PFRDA)"
    },
    {
        "id": "pm_mudra",
        "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
        "category": "Business & Entrepreneurship",
        "dept": "Ministry of Finance",
        "benefits": "Collateral-free micro loans up to ₹10 lakh (Shishu, Kishore, Tarun) for non-corporate, non-farm small enterprises and shopkeepers.",
        "url": "https://www.mudra.org.in",
        "source": "MUDRA / Department of Financial Services"
    },
    {
        "id": "msme_udyam",
        "name": "Udyam Registration & MSME Samadhaan Protection",
        "category": "Business & Entrepreneurship",
        "dept": "Ministry of Micro, Small and Medium Enterprises",
        "benefits": "Statutory protection against delayed payments beyond 45 days, priority lending rates, and 50% rebate on trademark registrations.",
        "url": "https://udyamregistration.gov.in",
        "source": "Ministry of MSME"
    },
    {
        "id": "lakhpati_didi",
        "name": "Lakhpati Didi Initiative (Women SHG Support)",
        "category": "Women & Child Welfare",
        "dept": "Ministry of Rural Development",
        "benefits": "Financial inclusion, skill training, and interest-subvented credit linkages to enable rural women self-help group members earn ₹1L+ annually.",
        "url": "https://nrlm.gov.in",
        "source": "Deendayal Antyodaya Yojana - NRLM"
    },
    {
        "id": "startup_sisfs",
        "name": "Startup India Seed Fund Scheme (SISFS)",
        "category": "Business & Entrepreneurship",
        "dept": "DPIIT, Ministry of Commerce and Industry",
        "benefits": "Financial assistance up to ₹20 Lakh as grant for Proof of Concept / prototype development, and up to ₹50 Lakh via debt/convertible debentures for commercialization.",
        "url": "https://seedfund.startupindia.gov.in",
        "source": "DPIIT SISFS Guidelines"
    },
    {
        "id": "dpiit_recognition",
        "name": "DPIIT Startup Recognition & 3-Year Tax Holiday (Section 80-IAC)",
        "category": "Business & Entrepreneurship",
        "dept": "Department for Promotion of Industry and Internal Trade",
        "benefits": "100% income tax exemption for 3 consecutive years out of 10, 80% rebate on patent filings, fast-tracked IP inspection, and self-certification under 9 environmental & labour laws.",
        "url": "https://www.startupindia.gov.in",
        "source": "Startup India Hub / Ministry of Commerce"
    },
    {
        "id": "aim_startup_grant",
        "name": "Atal Innovation Mission (AIM) Startup Seed & Prototyping Grants",
        "category": "Business & Entrepreneurship",
        "dept": "NITI Aayog / Atal Innovation Mission",
        "benefits": "Grant-in-aid funding up to ₹10 Crore for incubation centres, and direct prototyping seed support for early-stage technology startups and citizen innovators.",
        "url": "https://aim.gov.in",
        "source": "NITI Aayog AIM Schemes"
    },
    {
        "id": "meity_tide",
        "name": "MeitY TIDE 2.0 & SAMRIDH Startup Scale-Up Scheme",
        "category": "Business & Entrepreneurship",
        "dept": "Ministry of Electronics & Information Technology (MeitY)",
        "benefits": "Grant-in-aid up to ₹7 Lakh for ideation/PoC and matching acceleration funding up to ₹40 Lakh for technology startups building AI, software, or digital products.",
        "url": "https://meitystartuphub.in",
        "source": "MeitY Startup Hub"
    },
    {
        "id": "birac_big",
        "name": "Biotechnology Ignition Grant (BIRAC BIG)",
        "category": "Business & Entrepreneurship",
        "dept": "Department of Biotechnology, Ministry of Science & Technology",
        "benefits": "Grant-in-aid up to ₹50 Lakh for innovative healthcare, agritech, and industrial biotech startups and individual researchers to reach proof-of-concept.",
        "url": "https://birac.nic.in",
        "source": "Biotechnology Industry Research Assistance Council"
    },
    {
        "id": "aicte_pragati",
        "name": "AICTE Pragati Scholarship for Girls in Technical Education",
        "category": "Education & Scholarships",
        "dept": "Ministry of Education / AICTE",
        "benefits": "₹50,000 per year towards tuition, books, and educational equipment for female students admitted to 1st year of technical degree/diploma programs.",
        "url": "https://www.aicte-pragati-saksham-gov.in",
        "source": "AICTE / National Scholarship Portal"
    },
    {
        "id": "pmrf",
        "name": "Prime Minister's Research Fellowship (PMRF)",
        "category": "Education & Scholarships",
        "dept": "Ministry of Education, Govt of India",
        "benefits": "Fellowship of ₹70,000 to ₹80,000 per month plus an annual research contingency grant of ₹2,00,000 for Ph.D. scholars in science, engineering, and technology at IITs/IISc.",
        "url": "https://pmrf.in",
        "source": "PMRF National Portal"
    },
    {
        "id": "inspire_she",
        "name": "DST INSPIRE Scholarship for Higher Education (SHE)",
        "category": "Education & Scholarships",
        "dept": "Department of Science & Technology (DST)",
        "benefits": "₹80,000 per annum (₹60,000 cash scholarship + ₹20,000 summer research mentorship) for top 1% meritorious students pursuing B.Sc., B.S., and Int. M.Sc. in basic sciences.",
        "url": "https://online-inspire.gov.in",
        "source": "Department of Science & Technology"
    },
    {
        "id": "ugc_jrf",
        "name": "UGC Junior Research Fellowship (JRF / NET)",
        "category": "Education & Scholarships",
        "dept": "University Grants Commission / NTA",
        "benefits": "₹37,000 per month for first 2 years (JRF) and ₹42,000 per month for subsequent 3 years (SRF) plus HRA and contingency grants for doctoral research.",
        "url": "https://ugcnet.nta.ac.in",
        "source": "University Grants Commission"
    },
    {
        "id": "ambedkar_ebc",
        "name": "Dr. Ambedkar Post-Matric Scholarship for EBC & DNT Students",
        "category": "Education & Scholarships",
        "dept": "Ministry of Social Justice and Empowerment",
        "benefits": "100% compulsory non-refundable fees reimbursement plus monthly maintenance allowance for post-secondary education of Economically Backward Classes.",
        "url": "https://scholarships.gov.in",
        "source": "National Scholarship Portal"
    },
    {
        "id": "ishan_uday",
        "name": "Ishan Uday Special Scholarship for North Eastern Region",
        "category": "Education & Scholarships",
        "dept": "UGC / Ministry of Education",
        "benefits": "₹5,400 per month for general degree courses and ₹7,800 per month for technical/medical/professional degree programs for 10,000 NE students annually.",
        "url": "https://scholarships.gov.in",
        "source": "National Scholarship Portal"
    },
    {
        "id": "pmss_capf",
        "name": "Prime Minister's Scholarship Scheme (PMSS) for CAPF & AR",
        "category": "Education & Scholarships",
        "dept": "Welfare & Rehabilitation Board (WARB), Ministry of Home Affairs",
        "benefits": "₹3,000 per month for girls and ₹2,500 per month for boys for professional degree courses (engineering, medicine, dental, management) for police/CAPF wards.",
        "url": "https://scholarships.gov.in",
        "source": "Ministry of Home Affairs / NSP"
    },
    {
        "id": "vidyasaarathi",
        "name": "Vidyasaarathi Higher Education Scholarships (Corporate & CSR)",
        "category": "Education & Scholarships",
        "dept": "NSDL e-Gov / Corporate Foundation Partners",
        "benefits": "Merit-cum-means scholarships from ₹20,000 to ₹1,00,000 per year for undergraduate, engineering, medical, diploma, and ITI students across India.",
        "url": "https://www.vidyasaarathi.co.in",
        "source": "Vidyasaarathi Platform"
    },
    {
        "id": "punjab_ashirwad",
        "name": "Punjab State Post-Matric Ashirwad & Merit Scholarship",
        "category": "Education & Scholarships",
        "dept": "Department of Social Justice & Empowerment, Punjab",
        "benefits": "100% course fee waiver and monthly stipend for post-matric and higher education courses for SC and Backward Class students domiciled in Punjab.",
        "url": "https://scholarships.punjab.gov.in",
        "source": "Dr. Ambedkar Scholarship Portal Punjab"
    },
    {
        "id": "standup_india",
        "name": "Stand-Up India Scheme for Women & SC/ST Entrepreneurs",
        "category": "Business & Entrepreneurship",
        "dept": "Department of Financial Services, Ministry of Finance",
        "benefits": "Bank loans between ₹10 Lakh and ₹1 Crore for greenfield commercial, manufacturing, or service ventures by female or SC/ST entrepreneurs.",
        "url": "https://www.standupmitra.in",
        "source": "Stand-Up India Portal"
    },

    # --- Agriculture & Farmers Schemes ---
    {
        "id": "pmfby",
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY Crop Insurance)",
        "category": "Agriculture & Farmers",
        "dept": "Ministry of Agriculture & Farmers Welfare",
        "benefits": "Comprehensive crop insurance against drought, floods, unseasonal rain, and pests at heavily subsidized farmer premiums (2% Kharif, 1.5% Rabi, 5% horticultural crops).",
        "url": "https://pmfby.gov.in",
        "source": "PMFBY National Portal"
    },
    {
        "id": "pm_kusum",
        "name": "PM-KUSUM Solar Agriculture Pumps & Solarization",
        "category": "Agriculture & Farmers",
        "dept": "Ministry of New and Renewable Energy (MNRE)",
        "benefits": "60% capital subsidy (30% Central + 30% State) for installing standalone solar irrigation pumps up to 7.5 HP and solarization of agricultural tube wells.",
        "url": "https://pmkusum.mnre.gov.in",
        "source": "MNRE PM-KUSUM Scheme"
    },
    {
        "id": "kisan_credit_card",
        "name": "Kisan Credit Card (KCC Subsidized Crop & Farm Loan)",
        "category": "Agriculture & Farmers",
        "dept": "Department of Agriculture & Farmers Welfare / NABARD",
        "benefits": "Subsidized agricultural working capital loans up to ₹3 Lakh at an effective interest rate of 4% per annum with prompt repayment incentive.",
        "url": "https://www.myscheme.gov.in/schemes/kcc",
        "source": "NABARD / RBI Guidelines"
    },
    {
        "id": "enam_market",
        "name": "e-NAM (National Agriculture Market Electronic Trading)",
        "category": "Agriculture & Farmers",
        "dept": "Small Farmers Agribusiness Consortium (SFAC)",
        "benefits": "Pan-India electronic trading network integrating 1,300+ APMC mandis. Ensures transparent price bidding, quality grading, and direct online bank payments to farmers.",
        "url": "https://enam.gov.in",
        "source": "e-NAM Portal, Govt of India"
    },
    {
        "id": "smam_machinery",
        "name": "Sub-Mission on Agricultural Mechanization (SMAM Machinery Subsidy)",
        "category": "Agriculture & Farmers",
        "dept": "Ministry of Agriculture & Farmers Welfare",
        "benefits": "40% to 50% capital subsidy on purchase of agricultural equipment, tractors, power tillers, rotavators, and setting up Custom Hiring Centres (CHC).",
        "url": "https://agrimachinery.nic.in",
        "source": "MoA&FW Mechanization Division"
    },

    # --- Healthcare & Social Welfare Schemes ---
    {
        "id": "vay_vandana_health",
        "name": "Ayushman Bharat Vay Vandana Card (Universal Senior 70+ Cover)",
        "category": "Healthcare & Social Welfare",
        "dept": "National Health Authority (NHA)",
        "benefits": "Universal free annual health insurance of ₹5 Lakh for every citizen aged 70 and above, regardless of income slab or pension, across 29,000+ empanelled hospitals.",
        "url": "https://beneficiary.nha.gov.in",
        "source": "National Health Authority"
    },
    {
        "id": "jan_aushadhi",
        "name": "PM Bharatiya Janaushadhi Pariyojana (Generic Medicine 50%-90% Discount)",
        "category": "Healthcare & Social Welfare",
        "dept": "Department of Pharmaceuticals, Ministry of Chemicals & Fertilizers",
        "benefits": "2,000+ certified generic high-quality medicines, cardiac stents, and surgical consumables at 50% to 90% discount through 10,000+ Jan Aushadhi Kendras.",
        "url": "https://janaushadhi.gov.in",
        "source": "PMBI Guidelines"
    },
    {
        "id": "ran_medical",
        "name": "Rashtriya Arogya Nidhi (RAN Super-Specialty Medical Grant)",
        "category": "Healthcare & Social Welfare",
        "dept": "Ministry of Health & Family Welfare",
        "benefits": "One-time financial grant up to ₹15 Lakh for BPL families suffering from life-threatening diseases (oncology, cardiology, nephrology) in government super-specialty hospitals.",
        "url": "https://main.mohfw.gov.in",
        "source": "MoHFW Government of India"
    },
    {
        "id": "national_dialysis",
        "name": "Pradhan Mantri National Dialysis Programme (Free Dialysis Service)",
        "category": "Healthcare & Social Welfare",
        "dept": "National Health Mission (NHM)",
        "benefits": "100% free hemodialysis and peritoneal dialysis sessions at district hospitals across India for BPL patients through the national portal.",
        "url": "https://nhm.gov.in",
        "source": "National Health Mission"
    },

    # --- Women & Child Welfare Schemes ---
    {
        "id": "pm_matru_vandana",
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY Cash Maternity Benefit)",
        "category": "Women & Child Welfare",
        "dept": "Ministry of Women and Child Development",
        "benefits": "Direct cash transfer of ₹5,000 in two installments into pregnant women's bank accounts for institutional delivery, child immunization, and nutrition support.",
        "url": "https://pmmvy.wcd.gov.in",
        "source": "Ministry of Women and Child Development"
    },
    {
        "id": "mahila_samman",
        "name": "Mahila Samman Savings Certificate (7.5% Sovereign Interest)",
        "category": "Women & Child Welfare",
        "dept": "Department of Posts & Ministry of Finance",
        "benefits": "Two-year fixed deposit scheme exclusively for female citizens offering 7.5% per annum fixed sovereign interest compounded quarterly, with partial withdrawal up to 40%.",
        "url": "https://www.indiapost.gov.in",
        "source": "Ministry of Finance Gazette"
    },
    {
        "id": "poshan_tracker",
        "name": "Mission Saksham Anganwadi & POSHAN 2.0 Child Nutrition",
        "category": "Women & Child Welfare",
        "dept": "Ministry of Women and Child Development",
        "benefits": "Supplementary nutrition, health checkups, take-home rations (THR), and preschool early learning for children under 6 and adolescent girls across 14 Lakh Anganwadis.",
        "url": "https://poshantracker.in",
        "source": "POSHAN Abhiyaan"
    },

    # --- Housing & Property Schemes ---
    {
        "id": "pmay_gramin",
        "name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G Rural Pucca House)",
        "category": "Housing & Property",
        "dept": "Ministry of Rural Development",
        "benefits": "Direct financial assistance of ₹1.20 Lakh in plains / ₹1.30 Lakh in hilly areas to homeless rural families, plus 95 days of unskilled MGNREGA wages and ₹12,000 toilet grant.",
        "url": "https://pmayg.nic.in",
        "source": "Ministry of Rural Development"
    },
    {
        "id": "arhc_housing",
        "name": "Affordable Rental Housing Complexes (ARHC for Urban Workers)",
        "category": "Housing & Property",
        "dept": "Ministry of Housing and Urban Affairs",
        "benefits": "Dignified, subsidized rental accommodation near urban work sites for industrial workers, hospitality staff, street vendors, and urban migrants.",
        "url": "https://arhc.mohua.gov.in",
        "source": "MoHUA ARHC Guidelines"
    },
    {
        "id": "swamih_fund",
        "name": "SWAMIH Investment Fund (Completion of Stalled Housing Projects)",
        "category": "Housing & Property",
        "dept": "Department of Economic Affairs, Ministry of Finance",
        "benefits": "Government-backed priority debt fund financing the completion of stalled RERA-registered housing projects to deliver homes to distressed buyers.",
        "url": "https://mohua.gov.in",
        "source": "Ministry of Finance"
    },

    # --- Senior Citizens & Pensions Schemes ---
    {
        "id": "scss_savings",
        "name": "Senior Citizen Savings Scheme (SCSS 8.2% Sovereign Quarterly Payout)",
        "category": "Senior Citizens & Pensions",
        "dept": "Ministry of Finance & Department of Posts",
        "benefits": "Government-backed 5-year savings scheme for age 60+ offering 8.2% p.a. interest paid quarterly, with deposit ceiling up to ₹30 Lakh and Section 80C tax deduction.",
        "url": "https://www.indiapost.gov.in",
        "source": "National Savings Institute"
    },
    {
        "id": "pm_vaya_vandana",
        "name": "Pradhan Mantri Vaya Vandana Yojana (Assured Pension for Seniors)",
        "category": "Senior Citizens & Pensions",
        "dept": "Life Insurance Corporation of India (LIC) / MoF",
        "benefits": "Government-subsidized pension scheme for age 60+ guaranteeing 7.4% p.a. assured return payable monthly, quarterly, or annually for a 10-year period.",
        "url": "https://licindia.in",
        "source": "LIC India / MoF"
    },
    {
        "id": "jeevan_pramaan",
        "name": "Jeevan Pramaan (Digital Life Certificate with Face Authentication)",
        "category": "Senior Citizens & Pensions",
        "dept": "Ministry of Electronics and IT (MeitY) & DoPPW",
        "benefits": "Biometric and face authentication enabled digital life certificate submission from home for central, state, and defense pensioners, eliminating physical treasury visits.",
        "url": "https://jeevanpramaan.gov.in",
        "source": "DoPPW National Portal"
    },
    {
        "id": "ignoaps_pension",
        "name": "Indira Gandhi National Old Age Pension Scheme (NSAP Monthly Pension)",
        "category": "Senior Citizens & Pensions",
        "dept": "Ministry of Rural Development / NSAP",
        "benefits": "Direct monthly pension credited to bank accounts of senior citizens aged 60 and above living below the poverty line, with higher assistance for age 80+.",
        "url": "https://nsap.nic.in",
        "source": "National Social Assistance Programme"
    }
]

def match_schemes(p: dict):
    """Accurate conditional eligibility matching for citizens across occupation, income, age, and state."""
    results = []
    
    age = p.get("age", 28)
    occ = p.get("occupation", "salaried").lower()
    income = p.get("income", 300000)  # annual income in INR
    state = p.get("state", "Punjab").title()
    gender = p.get("gender", "male").lower()
    is_student = occ == "student" or age <= 24
    is_farmer = occ in ("farmer", "agriculture")
    is_woman = gender == "female"
    is_senior = age >= 60

    for s in SCHEMES:
        sid = s["id"]
        status = "needs_verification"
        reason = "Verify current circulars on the official portal."

        if sid == "pmay":
            if income <= 600000:
                status = "potentially_eligible"
                reason = "Annual income falls under EWS/LIG slab (up to ₹6 Lakh). Eligible for interest subsidy if you don't own a pucca house."
            elif income <= 1800000:
                status = "more_info_needed"
                reason = "Income falls in MIG slab. PMAY 2.0 urban interest subsidy guidelines require verification of carpet area and city tier."
            else:
                status = "not_eligible"
                reason = "Annual household income exceeds ₹18 Lakh ceiling for credit-linked subsidies."

        elif sid == "pmkisan":
            if is_farmer:
                status = "confirmed" if p.get("land_seeding") else "potentially_eligible"
                reason = "Eligible as landholding farmer family. Requires active e-KYC and land records seeding on state portal."
            else:
                status = "not_eligible"
                reason = "Reserved for cultivating landholding farmer families. Not applicable for non-agricultural occupations."

        elif sid == "ayushman":
            if income <= 250000:
                status = "potentially_eligible"
                reason = "Income meets SECC / National Health Protection eligibility thresholds for cashless hospitalization up to ₹5 lakh."
            elif is_senior and age >= 70:
                status = "confirmed"
                reason = "Senior citizens aged 70+ now receive universal ₹5 Lakh top-up health coverage under Ayushman Vay Vandana, regardless of income."
            else:
                status = "needs_verification"
                reason = "Check family status on the PM-JAY 'Am I Eligible' portal using ration card or registered mobile number."

        elif sid == "nsp_scholarship":
            if is_student and income <= 450000:
                status = "potentially_eligible"
                reason = "Enrolled student with family income under ₹4.5 Lakh ceiling. Eligible for Post-Matric central assistance on NSP."
            elif is_student:
                status = "more_info_needed"
                reason = "Requires income certificate verification under applicable ministry threshold."
            else:
                status = "more_info_needed"
                reason = "Collegiate scholarship: Requires enrollment in an accredited institution. For professional ventures, explore Startup India Seed Fund (SISFS) grants."

        elif sid == "startup_sisfs":
            status = "potentially_eligible"
            reason = "Open to early-stage innovators and incorporated DPIIT-recognized startups. Financial grant up to ₹20 Lakh for prototype/PoC and ₹50 Lakh debt for commercialization."

        elif sid == "dpiit_recognition":
            status = "potentially_eligible"
            reason = "DPIIT recognition provides 3-year Section 80-IAC 100% tax holiday, 80% patent fee rebate, and self-certification compliance. Any incorporated entity is eligible."

        elif sid == "aim_startup_grant":
            status = "potentially_eligible"
            reason = "Atal Innovation Mission provides incubation, seed support, and prototype grants for novel hardware/software ventures and citizen innovators."

        elif sid == "meity_tide":
            status = "potentially_eligible"
            reason = "MeitY TIDE 2.0 & SAMRIDH provide ₹7 Lakh grant-in-aid for ideation and up to ₹40 Lakh accelerator matching capital for tech startups."

        elif sid == "birac_big":
            status = "potentially_eligible"
            reason = "Biotechnology Ignition Grant provides up to ₹50 Lakh grant-in-aid for biotech, healthcare, agritech, and diagnostics innovators."

        elif sid == "aicte_pragati":
            if is_woman and is_student:
                status = "confirmed"
                reason = "Confirmed ₹50,000/year technical scholarship for female students admitted to AICTE approved degree/diploma courses."
            elif is_woman:
                status = "more_info_needed"
                reason = "Requires admission in an AICTE approved technical degree or diploma college."
            else:
                status = "not_eligible"
                reason = "Reserved exclusively for female students in technical and engineering education."

        elif sid == "pmrf":
            if age <= 35:
                status = "potentially_eligible"
                reason = "Prestigious fellowship of ₹70,000 - ₹80,000/month + ₹2 Lakh/year research grant for Ph.D. scholars in science & technology at premier institutes."
            else:
                status = "more_info_needed"
                reason = "Prime Minister's Research Fellowship for doctoral scholars in STEM disciplines."

        elif sid == "inspire_she":
            if age <= 27:
                status = "potentially_eligible"
                reason = "DST INSPIRE provides ₹80,000/year for undergraduate and postgraduate students in natural and basic sciences within top 1% board cutoff."
            else:
                status = "more_info_needed"
                reason = "For basic science students within top 1% cutoff in Class 12 board examinations."

        elif sid == "ugc_jrf":
            if age <= 35:
                status = "potentially_eligible"
                reason = "UGC NET JRF provides ₹37,000/month stipend + HRA for research scholars and prospective assistant professors."
            else:
                status = "more_info_needed"
                reason = "Age limit typically 30-35 years (with relaxation for reserved categories and women). Qualified via UGC NET."

        elif sid == "ambedkar_ebc":
            if income <= 250000:
                status = "potentially_eligible"
                reason = "100% course fee reimbursement plus monthly stipend for students belonging to Economically Backward Classes."
            else:
                status = "more_info_needed"
                reason = "Requires family income below ₹2.5 Lakh ceiling for EBC post-matric scholarship."

        elif sid == "ishan_uday":
            if any(ne in state.lower() for ne in ("assam", "meghalaya", "manipur", "tripura", "mizoram", "nagaland", "arunachal", "sikkim")):
                status = "potentially_eligible"
                reason = "Special UGC scholarship for North Eastern students (₹5,400 to ₹7,800/month)."
            else:
                status = "more_info_needed"
                reason = "Reserved for domicile students of North Eastern states studying in higher educational institutions."

        elif sid == "pmss_capf":
            status = "more_info_needed"
            reason = "Applicable for wards and widows of CAPF, AR, and State Police personnel pursuing professional degree courses."

        elif sid == "vidyasaarathi":
            status = "potentially_eligible"
            reason = "Open corporate and CSR merit-cum-means scholarship portal offering up to ₹1 Lakh/year across various higher education streams."

        elif sid == "punjab_ashirwad":
            if "punjab" in state.lower():
                status = "potentially_eligible"
                reason = "Punjab State Ashirwad & Merit scholarship providing 100% fee waiver for SC/BC college students."
            else:
                status = "more_info_needed"
                reason = "State-specific scholarship for permanent residents of Punjab."

        elif sid == "standup_india":
            if is_woman or p.get("familyCategory", "").lower() in ("sc", "st"):
                status = "potentially_eligible"
                reason = "Bank loan between ₹10 Lakh and ₹1 Crore for greenfield enterprise. Dedicated to female and SC/ST promoters."
            else:
                status = "more_info_needed"
                reason = "Requires at least 51% shareholding by a female or SC/ST promoter for commercial venture loan."

        elif sid == "sukanya":
            if is_woman and age <= 10:
                status = "confirmed"
                reason = "Eligible for account opening in any Post Office or commercial bank branch."
            elif p.get("has_girl_child"):
                status = "potentially_eligible"
                reason = "Parents can open an SSY account for a girl child below 10 years with 8.2% sovereign tax-free interest."
            else:
                status = "more_info_needed"
                reason = "Requires presence of girl child under 10 years in family profile."

        elif sid == "women_stamp_duty":
            if is_woman:
                status = "confirmed"
                reason = f"Confirmed 1% to 2% stamp duty discount available in {state} when property is registered in female owner's name."
            else:
                status = "more_info_needed"
                reason = "Rebate applies when purchasing property jointly with a female family member (wife/mother) as primary or co-owner."

        elif sid == "atal_pension":
            if 18 <= age <= 40 and not p.get("is_tax_payer"):
                status = "potentially_eligible"
                reason = "Citizen within 18-40 entry age bracket. Monthly contribution locks in guaranteed ₹1,000 to ₹5,000 monthly pension."
            elif age > 40:
                status = "not_eligible"
                reason = "Entry age is capped at 40 years. Citizens above 40 can explore National Pension System (NPS) Tier-1."
            else:
                status = "not_eligible"
                reason = "Income tax payers are excluded from Atal Pension Yojana under revised MoF guidelines."

        elif sid == "pm_mudra":
            status = "potentially_eligible"
            reason = "Eligible for collateral-free Shishu/Kishore/Tarun loans up to ₹10 lakh from public sector banks with no processing charges."

        elif sid == "msme_udyam":
            status = "potentially_eligible"
            reason = "Instant free registration with PAN and Aadhaar unlocks priority lending and MSME Samadhaan delayed payment protection."

        elif sid == "lakhpati_didi":
            if is_woman:
                status = "potentially_eligible"
                reason = "Women in rural or peri-urban self-help groups qualify for skill training, interest subvention, and market linkage."
            else:
                status = "not_eligible"
                reason = "Targeted initiative dedicated to women self-help group members."

        elif sid in ("pmfby", "pm_kusum", "kisan_credit_card", "enam_market", "smam_machinery"):
            if is_farmer:
                status = "confirmed" if p.get("land_seeding") else "potentially_eligible"
                reason = "Eligible landholding farmer. Subsidized insurance, credit, solar pumps, or farm machinery grants available."
            else:
                status = "more_info_needed"
                reason = "Targeted at cultivating farmers, landholders, and allied agricultural producers."

        elif sid == "vay_vandana_health":
            if age >= 70:
                status = "confirmed"
                reason = "Universal ₹5 Lakh free health insurance confirmed for all citizens aged 70 and above, regardless of income."
            else:
                status = "more_info_needed"
                reason = "Activates at age 70. Any senior family member aged 70+ can be registered on beneficiary.nha.gov.in."

        elif sid in ("jan_aushadhi", "ran_medical", "national_dialysis"):
            status = "potentially_eligible"
            reason = "Universal public healthcare & subsidized generic medicine initiative accessible across empanelled hospitals."

        elif sid in ("pm_matru_vandana", "mahila_samman", "poshan_tracker"):
            if is_woman:
                status = "potentially_eligible"
                reason = "Eligible for sovereign 7.5% interest, direct maternity cash transfers, or nutrition assistance."
            else:
                status = "more_info_needed"
                reason = "Dedicated initiative for female family members, girl children, or pregnant/lactating mothers."

        elif sid in ("pmay_gramin", "arhc_housing", "swamih_fund"):
            if income <= 600000 or sid in ("arhc_housing", "swamih_fund"):
                status = "potentially_eligible"
                reason = "Qualifies for rural pucca house grant (₹1.20L+), affordable rental housing, or stalled project delivery."
            else:
                status = "more_info_needed"
                reason = "Income threshold applies for subsidized housing grants."

        elif sid in ("scss_savings", "pm_vaya_vandana", "jeevan_pramaan", "ignoaps_pension"):
            if is_senior or age >= 60:
                status = "confirmed"
                reason = "Senior citizen age qualifies for sovereign 8.2% quarterly interest, assured pension, and digital life certificate."
            else:
                status = "more_info_needed"
                reason = "Reserved for senior citizens aged 60 and above."

        results.append({**s, "status": status, "reason": reason})

    return results

# Citizen Verified Knowledge Base (KB) for Document Intelligence & Process Assistance
KB = {
    "COMPANY_INCORPORATION": {
        "title": "Certificate of Incorporation & Post-Incorporation Statutory Compliances",
        "dept": "Ministry of Corporate Affairs, Central Registration Centre (CRC), Manesar / Registrar of Companies",
        "docs": [
            "Certificate of Incorporation (SPICe+ / Form INC-11)",
            "Memorandum of Association (e-MOA / INC-33) & Articles of Association (e-AOA / INC-34)",
            "PAN (Permanent Account Number) & TAN Allotment Letter",
            "Proof of Registered Office Address (Utility Bill < 2 months old + NOC)",
            "Bank Account Opening Letter & Subscriber Share Capital Deposit Receipts",
            "Form INC-20A (Declaration of Commencement of Business within 180 days)",
            "Form ADT-1 (Appointment of First Statutory Auditor within 30 days of incorporation)",
            "Minutes of First Board Meeting (within 30 days) & Stamped Share Certificates (within 60 days)"
        ],
        "fees": "Statutory MCA Filing fee for INC-20A (₹300 - ₹600) + ADT-1 (₹300 - ₹600). Late filing attracts additional fee up to 18x standard fee.",
        "portal": "Ministry of Corporate Affairs Portal (https://www.mca.gov.in)",
        "src": "Companies Act 2013 (Section 7, 8, 10A, 139, 173) & Companies (Incorporation) Rules 2014",
        "ver": "2026-08"
    },
    "PROPERTY": {
        "title": "Property Purchase, Registration & Mutation",
        "dept": "Department of Revenue & Land Records (Sub-Registrar Office)",
        "docs": [
            "Original Sale Deed / Agreement to Sell",
            "Non-Encumbrance Certificate (EC) for 13-30 years",
            "Property Tax Paid Receipts (Latest 3 years)",
            "Mother Deed / Chain of Title Deeds",
            "Approved Building Plan / Completion Certificate",
            "Buyer & Seller Aadhar, PAN & 2 Passport Photos",
            "NOC from Society / Resident Welfare Association"
        ],
        "fees": "Stamp Duty (5% to 7% of circle rate, 1-2% discount for women) + 1% Registration fee",
        "portal": "https://services.india.gov.in / State Land Records (e.g. Jamabandi, Bhulekh)",
        "src": "Registration Act 1908, Indian Stamp Act",
        "ver": "2026-01"
    },
    "INCOME_CERTIFICATE": {
        "title": "Income Certificate Application",
        "dept": "Revenue Department (Tehsildar / Sub-Divisional Magistrate)",
        "docs": [
            "Self-Declaration Affidavit of Annual Income",
            "Salary Slips / Form 16 / ITR copy (if employed)",
            "Bank Account Statement (Latest 6 months)",
            "Ration Card / Voter ID / Aadhaar Card",
            "Electricity Bill / Proof of Residence",
            "Agricultural J-Form (for farming income)"
        ],
        "fees": "Statutory application fee: ₹10 to ₹50 (varies by state portal)",
        "portal": "State e-District Portal (e.g., Saral Haryana, Punjab Seva Kendra, e-Mitra)",
        "src": "State Public Services Guarantee Act",
        "ver": "2026-01"
    },
    "SCHOLARSHIP": {
        "title": "Government Scholarship Application & Disbursal",
        "dept": "Ministry of Social Justice / Ministry of Minority Affairs / NSP",
        "docs": [
            "Previous Year Academic Marksheet / Passing Certificate",
            "Valid Income Certificate issued by competent Revenue authority",
            "Caste / Category Certificate (SC/ST/OBC/EWS if applicable)",
            "Domicile / State Residence Certificate",
            "College Fee Receipt & Bonafide Student Certificate",
            "Aadhaar-seeded Bank Account Passbook (Active NPCI mapping)"
        ],
        "fees": "Nil (Govt scholarship applications are strictly free of cost)",
        "portal": "National Scholarship Portal (https://scholarships.gov.in)",
        "src": "NSP Central Sector Scheme Guidelines 2026",
        "ver": "2026-01"
    },
    "LEARNER_LICENCE": {
        "title": "Learner's Licence (Form 3) & Permanent DL Application Roadmap",
        "dept": "Ministry of Road Transport & Highways (MoRTH) / State Transport Authority (Parivahan Sarathi)",
        "docs": [
            "Form 2 (Application for Permanent Driving Licence on Parivahan Sarathi)",
            "Original Learner's Licence (Form 3 in physical or DigiLocker format)",
            "Form 1 (Self-Declaration of Physical Fitness) / Form 1-A (Medical Certificate if age > 40)",
            "Proof of Age (Aadhaar Card / 10th School Marksheet / Passport / Birth Certificate)",
            "Proof of Current Address (Aadhaar / Voter ID / Utility Bill / Domicile Certificate)",
            "Parivahan DL Driving Skill Test Slot Appointment Slip",
            "Online Fee Payment Receipt (Form 2 + Driving Test Fee + Smart Card Fee)"
        ],
        "fees": "Statutory fees: Driving Test Fee ₹300 per class + DL Issue Fee ₹200 + Smart Card Fee ₹200 (~₹500 to ₹700 total on Parivahan).",
        "portal": "Parivahan Sarathi Portal (https://sarathi.parivahan.gov.in)",
        "src": "Motor Vehicles Act 1988 (Section 8, 9) & Central Motor Vehicles Rules 1989 (Rules 3, 10, 11, 14, 15)",
        "ver": "2026-01"
    },
    "DRIVING_LICENCE": {
        "title": "Permanent Driving Licence (Form 7) Renewal & Verification",
        "dept": "Ministry of Road Transport & Highways (MoRTH) / State Transport Authority (Parivahan Sarathi)",
        "docs": [
            "Original Expired / Expiring Driving Licence (Smart Card or Book)",
            "Form 2 / Form 9 (Application for Renewal of Driving Licence on Sarathi)",
            "Form 1 (Physical Fitness Self-Declaration) or Form 1-A (MBBS Doctor Medical Certificate if age > 40)",
            "Proof of Current Address (if changing address / RTO jurisdiction)",
            "Recent Passport-size Photograph and Signature",
            "Online Renewal Fee Payment Receipt"
        ],
        "fees": "Renewal fee: ₹200 + Form 7 Smart Card fee: ₹200 (Total ₹400 within 1-year window). If expired beyond 1 year, ₹300 + ₹1,000/year late penalty and driving re-test applies under Section 15(4).",
        "portal": "Parivahan Sarathi Portal (https://sarathi.parivahan.gov.in)",
        "src": "Motor Vehicles (Amendment) Act 2019 (Section 14, 15) & Central Motor Vehicles Rules 1989 (Rule 18)",
        "ver": "2026-01"
    },
    "MARRIAGE_REGISTRATION": {
        "title": "Marriage Certificate Registration",
        "dept": "Registrar of Marriages / Sub-Divisional Magistrate (SDM)",
        "docs": [
            "Proof of Age of Bride (18+) and Groom (21+) - Birth Cert or 10th Marksheet",
            "Address Proof of Both Parties (Aadhaar / Voter ID / Passport)",
            "Marriage Invitation Card & 2 Wedding Photos showing ceremonies",
            "Affidavit confirming date of marriage, marital status at marriage, and nationality",
            "Three Adult Witnesses with valid Govt Photo IDs & Address Proofs"
        ],
        "fees": "Statutory fee: ₹100 (under Hindu Marriage Act) / ₹150 (under Special Marriage Act)",
        "portal": "e-District Portal / Sub-Divisional Magistrate Portal",
        "src": "Hindu Marriage Act 1955 / Special Marriage Act 1954",
        "ver": "2026-01"
    },
    "GOVT_NOTICE": {
        "title": "Government Show Cause / Demurrage / Demand Notice",
        "dept": "Municipal Corporation / Tax Authority / Regulatory Body",
        "docs": [
            "Original Copy of Received Notice with Reference Number",
            "Previous Approval / Sanction Letters or Licences",
            "Payment Receipts & Bank Challans related to disputed period",
            "Written Statement of Facts / Clarification Affidavit",
            "Supporting Evidence Documents cited in reply"
        ],
        "fees": "Depends on notice clauses; timely reply avoids ex-parte penalties",
        "portal": "Designated departmental portal / In-person hearing register",
        "src": "General Administrative Law & Natural Justice Principles",
        "ver": "2026-01"
    },
    "GST_TAX": {
        "title": "Tax & GST Assessment Notice or Compliance",
        "dept": "Central Board of Direct Taxes (CBDT) / GST Council",
        "docs": [
            "Form 26AS & Annual Information Statement (AIS)",
            "Sales Invoices & GSTR-2B Inward Supply Reconciliation",
            "Purchase Invoices & E-Way Bills",
            "Bank Account Statements showing taxable credits"
        ],
        "fees": "Late filing fee: ₹50/day (GST) or ₹1,000/₹5,000 under Section 234F (ITR)",
        "portal": "e-Filing Portal (incometax.gov.in) & GST Portal (gst.gov.in)",
        "src": "Income-tax Act 1961, CGST Act 2017",
        "ver": "2026-01"
    },
    "OTHER": {
        "title": "General Citizen Public Service Request",
        "dept": "National Government Services Portal",
        "docs": [
            "Aadhaar Card / Voter ID Card",
            "Proof of Residence",
            "Specific Department Application Form",
            "Supporting affidavits or testimonials"
        ],
        "fees": "Nominal statutory service charges",
        "portal": "National Government Services Portal (https://services.india.gov.in)",
        "src": "Citizen Charter & e-Governance Rules",
        "ver": "2026-01"
    }
}

# -------------------------------------------------------------
# RTO Registry & Grounded Regional Transport Offices
# -------------------------------------------------------------
RTO_REGISTRY = {
    # Punjab
    "PB-65": {
        "code": "PB-65",
        "name": "RTO SAS Nagar (Mohali)",
        "district": "SAS Nagar (Mohali)",
        "state": "Punjab",
        "address": "District Administrative Complex, Sector 76, SAS Nagar, Punjab 160071",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "PB"
    },
    "PB-11": {
        "code": "PB-11",
        "name": "RTO Patiala",
        "district": "Patiala",
        "state": "Punjab",
        "address": "Mini Secretariat, Patiala, Punjab 147001",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "PB"
    },
    "PB-10": {
        "code": "PB-10",
        "name": "RTO Ludhiana",
        "district": "Ludhiana",
        "state": "Punjab",
        "address": "Near Mini Secretariat, Ferozepur Road, Ludhiana, Punjab 141001",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "PB"
    },
    "PB-08": {
        "code": "PB-08",
        "name": "RTO Jalandhar",
        "district": "Jalandhar",
        "state": "Punjab",
        "address": "Administrative Complex, Ladowali Road, Jalandhar, Punjab 144001",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "PB"
    },
    "PB-02": {
        "code": "PB-02",
        "name": "RTO Amritsar",
        "district": "Amritsar",
        "state": "Punjab",
        "address": "District Administrative Complex, Court Road, Amritsar, Punjab 143001",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "PB"
    },
    # Haryana
    "HR-03": {
        "code": "HR-03",
        "name": "RTA Panchkula",
        "district": "Panchkula",
        "state": "Haryana",
        "address": "Mini Secretariat, Sector 1, Panchkula, Haryana 134112",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "HR"
    },
    "HR-26": {
        "code": "HR-26",
        "name": "RTO Gurugram (North)",
        "district": "Gurugram",
        "state": "Haryana",
        "address": "Mini Secretariat, Rajiv Chowk, Gurugram, Haryana 122001",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "HR"
    },
    "HR-38": {
        "code": "HR-38",
        "name": "RTA Faridabad",
        "district": "Faridabad",
        "state": "Haryana",
        "address": "Mini Secretariat, Sector 12, Faridabad, Haryana 121007",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "HR"
    },
    # Chandigarh
    "CH-01": {
        "code": "CH-01",
        "name": "Registering & Licensing Authority (RLA), Chandigarh",
        "district": "Chandigarh",
        "state": "Chandigarh",
        "address": "Registering & Licensing Authority, Sector 17, Chandigarh 160017",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "CH"
    },
    # Delhi
    "DL-01": {
        "code": "DL-01",
        "name": "MLO Mall Road (North Delhi)",
        "district": "North Delhi",
        "state": "Delhi",
        "address": "5/9 Under Hill Road, Mall Road, Delhi 110054",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "DL"
    },
    "DL-04": {
        "code": "DL-04",
        "name": "MLO Janakpuri (West Delhi)",
        "district": "West Delhi",
        "state": "Delhi",
        "address": "District Centre, Janakpuri, New Delhi 110058",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "DL"
    },
    # Maharashtra
    "MH-01": {
        "code": "MH-01",
        "name": "RTO Mumbai (Central/Tardeo)",
        "district": "Mumbai City",
        "state": "Maharashtra",
        "address": "Old Bodyguard Lane, Tulsiwadi, Tardeo, Mumbai, Maharashtra 400034",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "MH"
    },
    "MH-12": {
        "code": "MH-12",
        "name": "RTO Pune",
        "district": "Pune",
        "state": "Maharashtra",
        "address": "Near Sangam Bridge, Pune, Maharashtra 411001",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "MH"
    },
    # Karnataka
    "KA-01": {
        "code": "KA-01",
        "name": "RTO Bengaluru (Central/Koramangala)",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "address": "BDA Complex, Koramangala, Bengaluru, Karnataka 560034",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "KA"
    },
    # Uttar Pradesh
    "UP-16": {
        "code": "UP-16",
        "name": "RTO Gautam Buddha Nagar (Noida)",
        "district": "Gautam Buddha Nagar",
        "state": "Uttar Pradesh",
        "address": "Sector 32, Near City Center Metro Station, Noida, UP 201301",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "UP"
    },
    "UP-32": {
        "code": "UP-32",
        "name": "RTO Lucknow",
        "district": "Lucknow",
        "state": "Uttar Pradesh",
        "address": "Transport Nagar, Lucknow, UP 226012",
        "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
        "state_code": "UP"
    }
}

def resolve_rto(licence_no=None, text="", state=None, district=None):
    """Identifies the relevant RTO based on licence number prefix, document text, or citizen location."""
    import re
    combined = f"{licence_no or ''} {text or ''} {district or ''} {state or ''}".upper()

    # 1. Check licence number prefix (e.g., PB65, PB-65, HR03, HR-03, CH01, DL04, etc.)
    code_match = re.search(r"\b([A-Z]{2})[- ]?(\d{2})\b", (licence_no or "").upper())
    if code_match:
        norm_code = f"{code_match.group(1)}-{code_match.group(2)}"
        if norm_code in RTO_REGISTRY:
            return RTO_REGISTRY[norm_code]

    # Also search code in combined text
    for rto_code, data in RTO_REGISTRY.items():
        clean_code = rto_code.replace("-", "")
        if re.search(rf"\b({rto_code}|{clean_code})\b", combined, re.I):
            return data

    # 2. Check District / City keywords
    low = combined.lower()
    if any(k in low for k in ("mohali", "sas nagar", "phase 7", "sector 61", "sector 76")):
        return RTO_REGISTRY["PB-65"]
    if any(k in low for k in ("panchkula", "manesar", "sector 10 panchkula")):
        return RTO_REGISTRY["HR-03"]
    if any(k in low for k in ("chandigarh", "sector 17")):
        return RTO_REGISTRY["CH-01"]
    if "patiala" in low:
        return RTO_REGISTRY["PB-11"]
    if "ludhiana" in low:
        return RTO_REGISTRY["PB-10"]
    if "jalandhar" in low:
        return RTO_REGISTRY["PB-08"]
    if "amritsar" in low:
        return RTO_REGISTRY["PB-02"]
    if "gurugram" in low or "gurgaon" in low:
        return RTO_REGISTRY["HR-26"]
    if "faridabad" in low:
        return RTO_REGISTRY["HR-38"]
    if "noida" in low or "gautam buddha" in low:
        return RTO_REGISTRY["UP-16"]
    if "lucknow" in low:
        return RTO_REGISTRY["UP-32"]
    if "pune" in low:
        return RTO_REGISTRY["MH-12"]
    if "mumbai" in low:
        return RTO_REGISTRY["MH-01"]
    if "bengaluru" in low or "bangalore" in low:
        return RTO_REGISTRY["KA-01"]
    if "delhi" in low:
        return RTO_REGISTRY["DL-04"]

    # 3. State-level fallback
    if "punjab" in low:
        return {
            "code": "PB-STATE",
            "name": "State Transport Commissioner, Punjab",
            "district": "Punjab State Jurisdiction",
            "state": "Punjab",
            "address": "Sector 17, Chandigarh, Punjab 160017",
            "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
            "state_code": "PB"
        }
    if "haryana" in low:
        return {
            "code": "HR-STATE",
            "name": "Transport Department, Haryana",
            "district": "Haryana State Jurisdiction",
            "state": "Haryana",
            "address": "30 Bays Building, Sector 17, Chandigarh, Haryana 160017",
            "portal": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do",
            "state_code": "HR"
        }

    # Default MoRTH central
    return {
        "code": "MoRTH-CENTRAL",
        "name": "Ministry of Road Transport & Highways (Parivahan Sewa)",
        "district": "Central National Portal",
        "state": "All India",
        "address": "Transport Bhawan, 1, Parliament Street, New Delhi 110001",
        "portal": "https://sarathi.parivahan.gov.in",
        "state_code": "CENTRAL"
    }

def verify_licence_validity(cat: str, issue_date: date | None, expiry_date: date | None, dob: date | None = None) -> dict:
    """Verifies licence validity under current Motor Vehicles Act & Central Motor Vehicles Rules."""
    today = date.today()

    if cat == "LEARNER_LICENCE":
        # Section 8(6) MVA: Learner's Licence is valid for exactly 180 days (6 months) across India
        d_issue = issue_date or today
        d_expiry = expiry_date or (d_issue + timedelta(days=180))
        d_slot_opens = d_issue + timedelta(days=30)  # Rule: Slot can be booked after 30 days

        days_since_issue = (today - d_issue).days
        days_to_expiry = (d_expiry - today).days

        if days_since_issue < 30:
            days_to_slot = 30 - days_since_issue
            return {
                "status": "WAITING_TEST_PERIOD",
                "badge": "30-Day Practice Period",
                "badge_color": "b-warn",
                "is_valid": True,
                "can_book_dl_test": False,
                "days_left": days_to_expiry,
                "slot_opens_on": d_slot_opens.isoformat(),
                "expiry_date": d_expiry.isoformat(),
                "headline": f"30-day practice period in progress (Opens in {days_to_slot} days)",
                "explanation": f"Under Section 8(6) of Motor Vehicles Act, you must hold a Learner's Licence for at least 30 days before appearing for the permanent driving skill test. Your test slot booking opens on {d_slot_opens.strftime('%d %B %Y')}."
            }
        elif days_to_expiry >= 0:
            urgency = "b-bad" if days_to_expiry <= 30 else "b-ok"
            return {
                "status": "ELIGIBLE_FOR_DL_TEST",
                "badge": "Eligible Now for DL Test",
                "badge_color": urgency,
                "is_valid": True,
                "can_book_dl_test": True,
                "days_left": days_to_expiry,
                "slot_opens_on": d_slot_opens.isoformat(),
                "expiry_date": d_expiry.isoformat(),
                "headline": f"Eligible to book Permanent DL Test ({days_to_expiry} days left)",
                "explanation": f"Mandatory 30-day waiting period is completed! You are fully eligible to book your Permanent Driving Skill Test slot on the Parivahan Sarathi portal before your Learner's Licence expires on {d_expiry.strftime('%d %B %Y')}."
            }
        else:
            return {
                "status": "EXPIRED",
                "badge": "Learner's Licence Expired",
                "badge_color": "b-bad",
                "is_valid": False,
                "can_book_dl_test": False,
                "days_left": 0,
                "slot_opens_on": d_slot_opens.isoformat(),
                "expiry_date": d_expiry.isoformat(),
                "headline": f"Learner's Licence expired {abs(days_to_expiry)} days ago",
                "explanation": f"Under Rule 10 of Central Motor Vehicles Rules, an expired Learner's Licence cannot be renewed or extended. You must apply for a fresh Learner's Licence on the official Sarathi portal."
            }

    else:
        # Permanent Driving Licence (DRIVING_LICENCE)
        # Section 14 & 15 MVA (amended 2019):
        # - Renewal window opens 1 year before expiry
        # - Grace period without driving re-test extends up to 1 year after expiry
        # - After 1 year past expiry, driving re-test is mandatory under Section 15(4)
        d_expiry = expiry_date or (today + timedelta(days=365))
        days_left = (d_expiry - today).days

        if days_left > 365:
            return {
                "status": "ACTIVE",
                "badge": "Active & Valid",
                "badge_color": "b-ok",
                "is_valid": True,
                "can_renew_online": False,
                "days_left": days_left,
                "expiry_date": d_expiry.isoformat(),
                "renewal_opens_on": (d_expiry - timedelta(days=365)).isoformat(),
                "headline": f"Valid & Active ({days_left} days remaining)",
                "explanation": f"Your permanent driving licence is legally valid and in good standing until {d_expiry.strftime('%d %B %Y')}. Online renewal on Parivahan will open 1 year prior to expiry on {(d_expiry - timedelta(days=365)).strftime('%d %B %Y')}."
            }
        elif 0 <= days_left <= 365:
            return {
                "status": "RENEWAL_WINDOW_OPEN",
                "badge": "Renewal Window Open",
                "badge_color": "b-warn",
                "is_valid": True,
                "can_renew_online": True,
                "days_left": days_left,
                "expiry_date": d_expiry.isoformat(),
                "renewal_opens_on": (d_expiry - timedelta(days=365)).isoformat(),
                "headline": f"Statutory Renewal Window Open ({days_left} days left)",
                "explanation": f"Under amended Section 15 of Motor Vehicles Act, citizens can renew their Driving Licence up to 1 year in advance without penalty. We recommend initiating online renewal on Sarathi before {d_expiry.strftime('%d %B %Y')}."
            }
        elif -365 <= days_left < 0:
            days_passed = abs(days_left)
            days_grace_left = 365 - days_passed
            return {
                "status": "GRACE_PERIOD",
                "badge": "In 1-Year Grace Period",
                "badge_color": "b-bad",
                "is_valid": False,
                "can_renew_online": True,
                "days_left": days_grace_left,
                "expiry_date": d_expiry.isoformat(),
                "grace_ends_on": (d_expiry + timedelta(days=365)).isoformat(),
                "headline": f"Expired {days_passed} days ago (Grace period active: {days_grace_left} days left)",
                "explanation": f"Your licence expired on {d_expiry.strftime('%d %B %Y')}. Under Section 15 of MVA 2019, you are within the 1-year grace period ending {(d_expiry + timedelta(days=365)).strftime('%d %B %Y')}. You can renew online without appearing for a driving skill re-test!"
            }
        else:
            days_passed = abs(days_left)
            return {
                "status": "LAPSED_RETEST_REQUIRED",
                "badge": "Lapsed (> 1 Year Expired)",
                "badge_color": "b-bad",
                "is_valid": False,
                "can_renew_online": True,
                "days_left": 0,
                "expiry_date": d_expiry.isoformat(),
                "headline": f"Lapsed {days_passed} days ago - Driving Re-test Required",
                "explanation": f"Licence expired on {d_expiry.strftime('%d %B %Y')}. Because more than 1 year has elapsed, Section 15(4) of the Motor Vehicles Act mandates that you must re-appear and pass a fresh driving skill test before the licensing officer."
            }

def generate_licence_roadmap(cat: str, extracted: dict, rto_info: dict, validity_info: dict) -> list[dict]:
    """Generates personalized step-by-step roadmap explaining eligibility, deadlines, documents, and Sarathi procedure."""
    sarathi_link = rto_info.get("portal") or "https://sarathi.parivahan.gov.in"
    rto_name = rto_info.get("name", "Designated RTO")
    rto_code = rto_info.get("code", "RTO")

    if cat == "LEARNER_LICENCE":
        return [
            {
                "step": 1,
                "phase": "Mandatory Practice & Compliance",
                "title": "Complete 30-Day Driving Practice & Display 'L' Board",
                "desc": "Under Section 8(6) of Motor Vehicles Act & Rule 3 of CMVR, hold your Learner's Licence for at least 30 days before appearing for the permanent DL test. Ensure you always drive with a licensed permanent DL holder and display red 'L' plates (18cm square) at vehicle front and rear.",
                "deadline": validity_info.get("slot_opens_on"),
                "status": "Completed" if validity_info.get("can_book_dl_test") else "In Progress",
                "portal_label": "Motor Vehicles Rules 1989",
                "portal_url": "https://morth.nic.in"
            },
            {
                "step": 2,
                "phase": "Document Compilation",
                "title": "Compile Mandatory Documents for Permanent DL",
                "desc": "Prepare: (1) Form 2 application printout, (2) Original Learner's Licence (Form 3), (3) Form 1 self-declaration of physical fitness (Form 1-A medical cert if commercial or age > 40), (4) Aadhaar card / Address proof, (5) Proof of age (10th certificate/Birth cert), and (6) Vehicle Registration Certificate (RC) and Insurance of vehicle used for test.",
                "deadline": validity_info.get("slot_opens_on"),
                "status": "Action Required",
                "portal_label": "Download Form 1 & Form 2",
                "portal_url": "https://parivahan.gov.in/parivahan/en/content/all-forms"
            },
            {
                "step": 3,
                "phase": "Online Portal Application",
                "title": f"Submit Application for Permanent DL on Parivahan Sarathi ({rto_code})",
                "desc": f"Visit Sarathi Parivahan -> Select {rto_info.get('state', 'State')} -> Click 'Apply for Driving Licence'. Enter your Learner's Licence Number ({extracted.get('reference', 'LL No')}) and Date of Birth. Select classes: {', '.join(extracted.get('vehicle_classes', ['MCWG', 'LMV']))}. Confirm jurisdiction as {rto_name}.",
                "deadline": validity_info.get("expiry_date"),
                "status": "Ready for Portal Filing",
                "portal_label": "Apply for DL on Sarathi ↗",
                "portal_url": sarathi_link
            },
            {
                "step": 4,
                "phase": "Statutory Fee Payment",
                "title": "Pay Government DL Fees Online",
                "desc": "Pay online via Bharatkosh / Sarathi e-Payment gateway. Statutory fee breakdown: Driving Test Fee (₹300) + DL Issue Fee (₹200) + Smart Card Form 7 Fee (₹200). Save and print the e-Payment receipt.",
                "deadline": validity_info.get("expiry_date"),
                "status": "Action Required",
                "portal_label": "Pay Sarathi Fee ↗",
                "portal_url": sarathi_link
            },
            {
                "step": 5,
                "phase": "Slot Booking",
                "title": f"Book Driving Skill Test Slot at {rto_name} Automated Track (ADTT)",
                "desc": f"Under Sarathi 'Appointments' -> 'DL Slot Booking', select your preferred date and time slot at the Automated Driving Test Track (ADTT) in {rto_info.get('district', 'RTO')}. Download and print the Appointment Slip.",
                "deadline": validity_info.get("expiry_date"),
                "status": "Urgent" if validity_info.get("days_left", 180) <= 30 else "Action Required",
                "portal_label": "Book DL Test Slot ↗",
                "portal_url": sarathi_link
            },
            {
                "step": 6,
                "phase": "Skill Test Execution",
                "title": "Appear for Driving Skill Test on Designated Track",
                "desc": "Arrive 30 minutes early at the testing track with: (1) Vehicle matching your licence category (e.g. car for LMV, bike for MCWG), (2) Valid RC, Insurance, and PUC for the vehicle, (3) Original appointment slip and Learner's Licence. Complete track maneuvers (Parallel parking, 8-figure, gradient climb).",
                "deadline": validity_info.get("expiry_date"),
                "status": "Pending Test",
                "portal_label": "View Test Track Guidelines",
                "portal_url": "https://parivahan.gov.in"
            },
            {
                "step": 7,
                "phase": "Licence Issuance & Digital Download",
                "title": "Receive Physical Smart Card DL & Endorse on DigiLocker / mParivahan",
                "desc": "Upon clearing the test, the Licensing Officer approves your Permanent Driving Licence. Your official Smart Card (Form 7) is dispatched to your registered address via Speed Post with tracking number. Instantly download your legally valid digital DL on DigiLocker or mParivahan app.",
                "deadline": "Within 7-15 days of test",
                "status": "Upcoming",
                "portal_label": "DigiLocker Transport ↗",
                "portal_url": "https://www.digilocker.gov.in"
            }
        ]

    else:
        # DRIVING_LICENCE (Permanent DL Renewal)
        return [
            {
                "step": 1,
                "phase": "Eligibility & Medical Verification",
                "title": "Verify Medical Fitness Certificate (Form 1 / Form 1-A)",
                "desc": f"Under Section 15 of Motor Vehicles Act: If applicant age is under 40 years, only online self-declaration Form 1 is needed. If applicant age is 40 years or older (or holding a transport endorsement), a medical fitness certificate in Form 1-A signed by a registered MBBS medical practitioner with seal is mandatory.",
                "deadline": validity_info.get("expiry_date"),
                "status": "Action Required",
                "portal_label": "Download Form 1-A Medical Format",
                "portal_url": "https://parivahan.gov.in/parivahan/en/content/all-forms"
            },
            {
                "step": 2,
                "phase": "Online Portal Application",
                "title": f"Initiate DL Renewal on Parivahan Sarathi ({rto_name})",
                "desc": f"Visit Sarathi Portal -> Select {rto_info.get('state', 'State')} -> Click 'Apply for DL Renewal' or 'Services on DL'. Enter DL Number ({extracted.get('reference', 'DL No')}) and Date of Birth. Verify pre-filled details and confirm RTO jurisdiction as {rto_name} ({rto_code}).",
                "deadline": validity_info.get("expiry_date"),
                "status": "Action Required",
                "portal_label": "Sarathi DL Services ↗",
                "portal_url": sarathi_link
            },
            {
                "step": 3,
                "phase": "Document Upload & Address Proof",
                "title": "Upload Existing DL Copy & Updated Proof of Address",
                "desc": "Upload scanned copy of your expiring/expired Driving Licence. If your current address has changed, upload updated Aadhaar / Voter ID / Utility Bill for faceless address update on your licence.",
                "deadline": validity_info.get("expiry_date"),
                "status": "Action Required",
                "portal_label": "Upload Documents on Sarathi ↗",
                "portal_url": sarathi_link
            },
            {
                "step": 4,
                "phase": "Fee Payment & Biometrics",
                "title": "Pay Statutory Renewal Fee (₹400) & Complete Aadhaar e-KYC",
                "desc": "Pay online renewal fee: ₹200 (Form 9 renewal) + ₹200 (Smart Card Form 7 fee). In states with faceless e-KYC (Punjab, Haryana, Delhi, Maharashtra), authentication is completed via Aadhaar OTP without requiring in-person RTO visits.",
                "deadline": validity_info.get("expiry_date"),
                "status": "Action Required",
                "portal_label": "Pay Renewal Fee ↗",
                "portal_url": sarathi_link
            },
            {
                "step": 5,
                "phase": "Dispatch & DigiLocker Sync",
                "title": "Speed Post Delivery of Smart Card & DigiLocker Digital Endorsement",
                "desc": "Track your application status using Application Reference Number. Renewed smart card DL is printed and dispatched to your residence by India Post Speed Post. Digital DL reflects immediately on DigiLocker and mParivahan apps for paperless traffic verification.",
                "deadline": "Within 10-20 days of renewal",
                "status": "Upcoming",
                "portal_label": "India Post Tracking ↗",
                "portal_url": "https://www.indiapost.gov.in"
            }
        ]

def generate_licence_deadlines(cat: str, extracted: dict, rto_info: dict, validity_info: dict) -> list[dict]:
    """Generates official compliance deadlines for calendar integration."""
    deadlines = []
    ref = extracted.get("reference", "Licence")
    rto_name = rto_info.get("name", "RTO")
    portal = rto_info.get("portal", "https://sarathi.parivahan.gov.in")

    if cat == "LEARNER_LICENCE":
        # Deadline 1: Slot Booking Window Opens (30 days from issue)
        if validity_info.get("slot_opens_on"):
            deadlines.append({
                "service": f"Permanent DL Driving Test Slot Booking Opens (LL: {ref})",
                "authority": f"{rto_name} / Parivahan Sarathi",
                "due": validity_info.get("slot_opens_on"),
                "grace_period": "Eligible to book test slot after 30 days of LL issue under Section 8(6) MVA",
                "fee": "₹300 test fee + ₹200 DL fee + ₹200 smart card fee",
                "portal": portal,
                "category": "Licence",
                "status": "Upcoming" if not validity_info.get("can_book_dl_test") else "Action Required"
            })

        # Deadline 2: LL Expiry Date (180 days from issue)
        if validity_info.get("expiry_date"):
            deadlines.append({
                "service": f"Learner's Licence Statutory Expiry (LL: {ref})",
                "authority": f"{rto_name} / Parivahan Sarathi",
                "due": validity_info.get("expiry_date"),
                "grace_period": "Strictly 180 days validity. Non-renewable; fresh application required if lapsed.",
                "fee": "₹200 fresh LL fee if expired",
                "portal": portal,
                "category": "Licence",
                "status": "Urgent" if validity_info.get("days_left", 180) <= 30 else "Action Required"
            })

    else:
        # DRIVING_LICENCE (Permanent DL)
        # Deadline 1: DL Expiry Date
        if validity_info.get("expiry_date"):
            deadlines.append({
                "service": f"Driving Licence Renewal Due Date (DL: {ref})",
                "authority": f"{rto_name} / Parivahan Sarathi",
                "due": validity_info.get("expiry_date"),
                "grace_period": "Can be renewed online up to 1 year in advance without penalty",
                "fee": "₹200 renewal fee + ₹200 smart card fee",
                "portal": portal,
                "category": "Licence",
                "status": "Urgent" if validity_info.get("days_left", 365) <= 30 else "Action Required"
            })

        # Deadline 2: 1-Year Grace Period End (Mandatory re-test cutoff)
        if validity_info.get("grace_ends_on"):
            deadlines.append({
                "service": f"DL 1-Year Grace Period Cutoff (DL: {ref})",
                "authority": f"{rto_name} / Parivahan Sarathi",
                "due": validity_info.get("grace_ends_on"),
                "grace_period": "After this date, Section 15(4) MVA mandates appearing for a driving skill re-test",
                "fee": "Late penalty ₹300 + ₹1,000/year after 1 year + re-test fee",
                "portal": portal,
                "category": "Licence",
                "status": "Urgent"
            })

    return deadlines


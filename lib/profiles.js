// Pre-loaded profiles. Key: "firstname lastname" lowercase.
// When a name matches, this data is used directly instead of web search.

const PROFILES = {
  "yashwin pamecha": `
Name: Yashwin Pamecha
Headline: Transforming businesses through strategic management consulting and implementation
Location: India
LinkedIn: linkedin.com/in/yashwinpamecha
Top Skills: Business Analytics, Digital Strategy, Client Delivery
Languages: English (Full Professional), Hindi (Native or Bilingual)

About:
Accomplished management consultant specializing in driving strategic growth and operational excellence for leading organizations. Expertise spans finance, healthcare, and technology — has led transformative initiatives for clients with turnovers exceeding $2 billion.

Works closely with C-suite and founders on:
- Performance measurement and improvement
- Cost optimisation and profitability improvement
- Increasing business synergy
- Integrating technology and finance
- Maintaining working capital equilibrium
- Strategic planning
- Process optimisation and transformation
- Improving financial health
- ERP implementation and improvement

Experience:

Practus — 9 years 4 months total

Associate Director
April 2023 – Present (3 years 4 months)
Key Responsibilities:
- Strategic Leadership: Visionary leadership in development and execution of client solution strategies, ensuring alignment with business objectives and market demands.
- Client Partnership: Forge and maintain relationships with C-level executives, acting as trusted advisor and strategic partner.
- Project Excellence: Oversee delivery of multiple large-scale projects, driving operational efficiency and measurable outcomes.
- Solution Innovation: Develop cutting-edge solutions leveraging emerging technologies and best practices.

Assistant Vice President, Client Solutions
April 2020 – March 2023 (3 years)
Mumbai, Maharashtra, India
- Spearheaded multiple large-scale projects for listed clients, unlisted clients, and large family-managed businesses.
- Built strong relationships with key stakeholders, providing strategic insights and tailored solutions.
- Oversaw and mentored a diverse team of professionals.
Key Achievements:
- Successfully led analytics project for a $3 billion listed company.
- Managed cross-functional team on digital transformation project for a major edutech platform — enhanced finance team efficiency and reduced costs by 10%.

Senior Manager
April 2017 – March 2020 (3 years)
Mumbai Area, India
Outsourced CFO role — key responsibilities:
- Helped organisations transform finance functions by embracing technology.
- Led organisational transformation programs including vision, strategy, organisation design and process improvement.
- Drove improvements in working capital and cash flow management.
- Oversaw all financial operations: P2P, O2C, R2R.
- Managed annual budget setting across multiple clients, business verticals and regions.
- Prepared financial models; liaised with bankers and NBFCs to raise finance.
- Designed investment decks and financial/valuation models for seed and Series A fundraising.
Highlights:
- Led treasury function for USD 3.4 billion M&A deal (largest in India at the time).
- Setup costing system leading to 20% improvement in sales and 10% improvement in product profitability.
- Overhauled finance function at a USD 10 million law firm in Dubai — improved revenue by 15%.
- Reorganised leadership at a 25-year-old family business with INR 200+ crore revenue. Designed KPI scorecards for new leadership team.
- Redesigned internal reporting at a publicly listed company — reduced reporting time by 5 days.

Lakmé Lever Pvt. Ltd.
Associate Manager – Finance
September 2015 – December 2016 (1 year 4 months)
Mumbai Area, India
- Managed a team of 4 officers handling daily A/P processes, vendor/supplier relations, invoices, POs, expense reports.
- Implemented Ariba and centralised invoice scanning for process automation.
- Trained users and served as primary troubleshooter on new systems.
- Implemented and monitored internal controls in line with Unilever's IFCFR business processes.

Protiviti
Intern
March 2012 – February 2015 (3 years)
Mumbai
Part of internal auditing team. Performed internal audits, analysed process chains, identified internal control risks.

Education:
- The Institute of Chartered Accountants of India — Chartered Accountant, Accounts, Finance, Audit and Taxation (2010–2015)
- Devi Ahilya Vishwavidyalaya — Bachelor of Commerce (BCom), Finance, General (2016)
`.trim(),
};

function getProfile(fullName) {
  return PROFILES[fullName.trim().toLowerCase()] || null;
}

module.exports = { getProfile };

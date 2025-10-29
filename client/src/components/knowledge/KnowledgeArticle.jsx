import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const KnowledgeArticle = () => {
  const { articleId } = useParams();
  const { isAuthenticated, user } = useAuth();

  // Check if user has access
  const hasAccess = isAuthenticated && (user?.role === 'owner' || user?.subscription === 'pro' || user?.subscription === 'enterprise');

  const articles = {
    'kebs-standards': {
      title: 'KEBS Water Quality Standards Guide',
      category: 'Compliance',
      readTime: '8 min read',
      preview: `Understanding KEBS water quality standards is crucial for any water business in Kenya. The Kenya Bureau of Standards (KEBS) has set specific requirements that all bottled water and water vending operations must meet.

The two main standards are:
- KS EAS 153:2000 - Bottled Drinking Water Specification
- KS EAS 13:2019 - Water Vending Specification

These standards cover physical, chemical, and microbiological parameters...`,
      fullContent: `
## Complete KEBS Water Quality Standards Guide

### KS EAS 153:2000 - Bottled Drinking Water

This standard applies to all bottled drinking water sold in Kenya. It covers:

**Physical Parameters:**
- Turbidity: Less than 5 NTU
- Color: Less than 15 TCU
- Odor and Taste: Unobjectionable

**Chemical Parameters:**
- pH: 6.5 - 8.5
- Total Dissolved Solids (TDS): 50 - 500 mg/L
- Fluoride: Maximum 1.5 mg/L
- Chlorine (if chlorinated): 0.2 - 0.5 mg/L
- Heavy metals must be below detection limits

**Microbiological Parameters:**
- Total coliform: 0 CFU/100ml
- E. coli: 0 CFU/100ml
- Fecal streptococci: 0 CFU/100ml

### KS EAS 13:2019 - Water Vending

Requirements for water vending machines and ATMs:

**Equipment Standards:**
- Food-grade materials only
- Regular sanitization (weekly minimum)
- Protection from contamination
- Proper drainage systems

**Operational Requirements:**
- Daily water quality checks
- Monthly lab testing
- Maintenance logs required
- Visible operating license

**Hygiene Practices:**
- Hand washing facilities nearby
- Container cleaning station
- Waste disposal system
- Staff training documentation

### Testing Frequency

**For Bottled Water Plants:**
- Daily: pH, TDS, chlorine residual
- Weekly: Full chemical analysis
- Monthly: Complete microbiological testing
- Quarterly: Heavy metals analysis

**For Water Vending:**
- Daily: pH and chlorine checks
- Weekly: Bacteria testing
- Monthly: Full parameter testing

### Certification Process

1. **Application (Week 1-2)**
   - Submit business registration
   - Site inspection forms
   - Water source documentation
   - Equipment certificates

2. **Site Inspection (Week 3-4)**
   - KEBS inspector visits
   - Checks facilities and equipment
   - Reviews procedures and records

3. **Lab Testing (Week 5-8)**
   - Multiple water samples tested
   - All parameters must pass
   - Retesting if needed

4. **Certificate Issuance (Week 9-12)**
   - Certificate valid for 1 year
   - Annual renewal required
   - Surprise inspections possible

### Common Compliance Issues

**Top 5 reasons for certification rejection:**
1. High bacterial counts (poor hygiene)
2. pH outside acceptable range
3. Inadequate equipment maintenance
4. Missing documentation
5. Improper water source

### Costs Involved

- Application fee: KES 5,000 - 10,000
- Lab testing: KES 15,000 - 30,000
- Equipment upgrades: KES 50,000 - 200,000
- Annual renewal: KES 3,000 - 5,000

### Resources

- KEBS Contact: info@kebs.org | +254 20 605490
- Download forms: www.kebs.org
- AquaBeacon helps you track all requirements automatically

**Need help with KEBS certification? Upgrade to Pro for:**
- Automated compliance tracking
- Permit expiry reminders
- Lab test scheduling
- AI assistant guidance
      `
    },
    'startup-checklist': {
      title: 'Water Business Startup Checklist',
      category: 'Business Setup',
      readTime: '12 min read',
      preview: `Starting a water purification or bottling business in Kenya requires careful planning and compliance with regulations. This comprehensive checklist covers everything from registration to your first sale.

**Phase 1: Business Registration**
- Register business name with BRS
- Obtain business permit from county government
- Register for KRA PIN and VAT (if applicable)

**Phase 2: Location & Setup**
- Secure suitable premises (minimum 100m² recommended)
- Ensure reliable water source...`,
      fullContent: `
## Complete Water Business Startup Checklist

### Phase 1: Business Registration (Week 1-2)

**1. Business Name Registration**
- Search name availability at eCitizen
- Register with Business Registration Service (BRS)
- Cost: KES 1,100 - 10,350 depending on structure
- Duration: 3-5 working days

**2. County Business Permit**
- Visit county licensing office
- Submit business registration certificate
- Site inspection may be required
- Cost: KES 5,000 - 30,000 (varies by county and capacity)
- Renewal: Annual

**3. Tax Registration**
- KRA PIN application (free)
- VAT registration if turnover > KES 5M
- Monthly return filing required

### Phase 2: Location & Setup (Week 3-6)

**Premises Requirements:**
- Minimum 100m² floor space
- Separate areas for:
  * Raw water storage
  * Treatment area
  * Bottling/packaging
  * Finished product storage
  * Office/admin
  * Staff facilities

**Location Checklist:**
✓ Reliable water source within 500m
✓ Three-phase electricity connection
✓ Good road access for deliveries
✓ Drainage system
✓ Adequate ventilation
✓ Concrete floors (easy to clean)
✓ Security features

**Lease Agreement:**
- Minimum 3-year lease recommended
- Ensure landlord permits commercial use
- Budget: KES 30,000 - 100,000/month in urban areas

### Phase 3: Equipment Purchase (Week 4-8)

**Essential Equipment:**

1. **Water Treatment System (KES 300,000 - 1,500,000)**
   - Sand filter
   - Carbon filter
   - UV sterilizer
   - Reverse osmosis system (optional but recommended)

2. **Storage Tanks (KES 50,000 - 200,000)**
   - Raw water: 5,000L - 10,000L
   - Treated water: 3,000L - 5,000L
   - Food-grade materials only

3. **Bottling Equipment (KES 150,000 - 800,000)**
   - Semi-automatic bottling machine (starter)
   - Automatic option for higher volume
   - Capping machine
   - Labeling equipment

4. **Quality Testing Kit (KES 30,000 - 80,000)**
   - pH meter
   - TDS meter
   - Chlorine test kit
   - Bacteria testing supplies

5. **Packaging Materials**
   - Bottles (500ml, 1L, 5L, 20L)
   - Caps and seals
   - Labels (with KEBS mark)
   - Shrink wrap

**Supplier Recommendations:**
- Equipment: Davis & Shirtliff, Aqua Systems
- Bottles: Polyflex, Rift Valley Plastics
- Labels: Modern Lithographic

### Phase 4: KEBS Certification (Week 6-16)

[Premium subscribers see full KEBS certification process]

**Quick Overview:**
1. Submit application (KES 5,000)
2. Site inspection
3. Water testing (KES 15,000 - 30,000)
4. Certificate issuance
5. Annual renewal required

### Phase 5: Staffing (Week 8-10)

**Minimum Staff:**
- Production manager (1)
- Machine operators (2-3)
- Quality control officer (1)
- Sales/delivery personnel (2-3)
- Cleaner (1)

**Salary Budget:** KES 150,000 - 300,000/month

**Required Training:**
- Food safety and hygiene
- Equipment operation
- Quality control procedures
- KEBS standards

### Phase 6: Marketing & Launch (Week 12+)

**Pre-Launch:**
- Design brand identity
- Create website/social media
- Print marketing materials
- Sample distribution to offices/shops

**Distribution Channels:**
- Direct to office delivery
- Retail shops and supermarkets
- Water dispensers (rental model)
- Events and functions

**Pricing Strategy:**
- 500ml: KES 40 - 60
- 1 Liter: KES 70 - 100
- 5 Liters: KES 200 - 300
- 20 Liters: KES 150 - 250 (refill)

### Total Startup Capital Required

**Minimum Budget:** KES 1,000,000 - 1,500,000
- Equipment: KES 500,000 - 800,000
- Premises (3 months advance): KES 150,000
- Registration & permits: KES 50,000
- Initial inventory: KES 100,000
- Working capital: KES 200,000

**Ideal Budget:** KES 2,500,000 - 3,500,000
- Better equipment and automation
- Larger capacity
- More comfortable working capital

### Monthly Operating Costs

- Rent: KES 30,000 - 100,000
- Salaries: KES 150,000 - 300,000
- Electricity: KES 20,000 - 50,000
- Raw materials: KES 100,000 - 200,000
- Transport/delivery: KES 30,000 - 60,000
- Marketing: KES 20,000 - 50,000
- **Total: KES 350,000 - 760,000/month**

### Break-Even Analysis

**Assumptions:**
- 20L bottle price: KES 200
- Cost per bottle: KES 80
- Profit per bottle: KES 120

**Break-even:** 3,000 - 6,500 bottles/month

**Timeline to profitability:** 6-12 months typically

### Common Pitfalls to Avoid

❌ Underestimating working capital needs
❌ Skipping KEBS certification
❌ Poor water quality control
❌ Inadequate marketing
❌ Wrong location choice
❌ Cheap, low-quality equipment

### Success Tips

✅ Start small, scale gradually
✅ Focus on quality, not just quantity
✅ Build strong distribution network
✅ Maintain excellent hygiene
✅ Keep accurate records
✅ Use AquaBeacon for compliance tracking

**Ready to start? Upgrade to Pro for:**
- Detailed financial models
- Equipment supplier contacts
- Step-by-step setup videos
- Legal document templates
- Direct mentorship from successful entrepreneurs
      `
    },
    // Add more articles...
  };

  const currentArticle = articles[articleId];

  if (!currentArticle) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-2xl text-gray-700">Article Not Found</h1></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-primary-600 uppercase">{currentArticle.category}</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-1 mb-2">{currentArticle.title}</h2>
              <p className="text-sm text-gray-600">{currentArticle.readTime}</p>
            </div>
            <Link
              to="/knowledge-hub"
              className="text-gray-400 hover:text-gray-600 text-sm flex items-center"
            >
              <FiArrowRight className="mr-1 transform rotate-180" /> Back to Hub
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose max-w-none">
            {/* Preview (always visible) */}
            <div className="text-gray-700 whitespace-pre-line mb-6">
              {currentArticle.preview}
            </div>

            {/* Gated Content */}
            {hasAccess ? (
              <div className="text-gray-700 whitespace-pre-line">
                {currentArticle.fullContent}
              </div>
            ) : (
              <div className="relative">
                {/* Blurred preview */}
                <div className="text-gray-700 blur-sm select-none pointer-events-none">
                  {currentArticle.fullContent.substring(0, 500)}...
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white flex items-end justify-center pb-8">
                  <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center border-2 border-primary-200">
                    <FiLock className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Premium Content
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Unlock full access to this guide and 50+ other premium resources
                    </p>
                    <div className="space-y-3">
                      {isAuthenticated ? (
                        <>
                          <Link
                            to="/pricing"
                            className="block w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold"
                          >
                            Upgrade to Pro - KES 5/mo
                          </Link>
                          <p className="text-xs text-gray-500">
                            ✓ Full knowledge hub access ✓ AI assistant ✓ Compliance tools
                          </p>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/signup"
                            className="block w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold"
                          >
                            Sign Up Free
                          </Link>
                          <Link
                            to="/signin"
                            className="block w-full bg-white text-primary-600 px-6 py-3 rounded-lg border-2 border-primary-600 hover:bg-primary-50 font-semibold"
                          >
                            Sign In
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {hasAccess && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Was this helpful?{' '}
              <button className="text-primary-600 hover:underline">Share feedback</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeArticle;
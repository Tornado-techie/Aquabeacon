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
    // Public Water Safety Articles
    'water-quality-basics': {
      title: 'Understanding Water Quality Standards',
      category: 'Water Safety',
      readTime: '5 min read',
      preview: `Understanding water quality parameters is essential for safe drinking water. Key parameters include pH, TDS, turbidity, and bacterial contamination levels.

The main standards to understand are:
- pH Level: Should be between 6.5-8.5
- Total Dissolved Solids (TDS): Below 1000 mg/L
- Turbidity: Less than 5 NTU
- Bacterial contamination: Zero tolerance

These parameters ensure water is safe for consumption...`,
      fullContent: `
## Understanding Water Quality Standards

### What Makes Water Safe?

Water quality is determined by several key parameters that affect both safety and taste. Understanding these helps you make informed decisions about your drinking water.

### Physical Parameters

**Turbidity (Cloudiness)**
- Standard: Less than 5 NTU
- What it means: Measures how clear the water is
- Why it matters: High turbidity can harbor bacteria and indicates poor filtration

**Color**
- Standard: Less than 15 TCU (colorless)
- What it means: Water should be crystal clear
- Why it matters: Color often indicates contamination

**Taste and Odor**
- Standard: Should be tasteless and odorless
- What it means: No strange flavors or smells
- Why it matters: Often first sign of contamination

### Chemical Parameters

**pH Level**
- Standard: 6.5 - 8.5
- What it means: Measures acidity/alkalinity
- Too low (acidic): Can corrode pipes, metallic taste
- Too high (alkaline): Bitter taste, soap-like feel

**Total Dissolved Solids (TDS)**
- Standard: 50-500 mg/L for bottled water, <1000 mg/L for drinking water
- What it means: Amount of dissolved minerals and salts
- Why it matters: Affects taste and potential health impacts

**Chlorine Residual** (if chlorinated)
- Standard: 0.2-0.5 mg/L
- What it means: Disinfectant level
- Why it matters: Protects against bacterial growth

### Microbiological Parameters

**Total Coliform**
- Standard: 0 CFU/100ml
- What it means: Indicator bacteria
- Why it matters: Shows potential for disease-causing bacteria

**E. coli**
- Standard: 0 CFU/100ml
- What it means: Specific harmful bacteria
- Why it matters: Direct health threat

### Testing Your Water

**Home Testing Kits:**
- pH strips: KES 500-1,000
- TDS meters: KES 1,500-3,000
- Basic bacteria tests: KES 2,000-5,000

**Professional Lab Testing:**
- Basic analysis: KES 3,000-5,000
- Complete analysis: KES 8,000-15,000
- Recommended frequency: Every 6 months

### Red Flags to Watch For

❌ Cloudy or colored water
❌ Strange taste or smell
❌ Oily film on surface
❌ Unusual particles
❌ Metallic taste
❌ Chlorine smell (if not chlorinated)

### Choosing Safe Water

✅ Look for KEBS certification mark
✅ Check expiry dates
✅ Inspect packaging for damage
✅ Buy from reputable suppliers
✅ Store properly (cool, dry place)
      `
    },
    'identify-contamination': {
      title: 'How to Identify Water Contamination',
      category: 'Water Safety',
      readTime: '4 min read',
      preview: `Learn to identify signs of water contamination before it affects your health. Visual, taste, and smell indicators can warn you of dangerous water.

Common warning signs include:
- Unusual colors (brown, yellow, green)
- Strange odors (chemical, sewage, metallic)
- Cloudy or murky appearance
- Oily films or particles floating

Quick action can prevent serious health issues...`,
      fullContent: `
## How to Identify Water Contamination

### Visual Inspection

**Color Changes:**
- Brown/Yellow: Often iron, rust, or sediment
- Green: Algae growth or copper pipes
- Blue: Copper contamination
- Black: Sulfur bacteria or manganese
- Red/Pink: Iron bacteria

**Clarity Issues:**
- Cloudy/Murky: Bacterial growth or filtration problems
- Particles: Sediment, rust, or organic matter
- Film on surface: Oil, grease, or chemical contamination

### Smell Test

**Common Odors and Their Meanings:**
- Rotten egg smell: Hydrogen sulfide gas (bacteria)
- Chlorine smell: Over-chlorination or old chlorine
- Musty/Earthy: Algae or organic decay
- Chemical smell: Industrial contamination
- Sewage smell: Bacterial contamination

### Taste Indicators

**Warning Tastes:**
- Metallic: Heavy metals (lead, iron, copper)
- Salty: High mineral content or saltwater intrusion
- Bitter: High alkalinity or sulfates
- Sweet: Industrial chemicals
- Soapy: High pH or detergent contamination

### Physical Signs

**After Drinking Contaminated Water:**
- Stomach pain within hours
- Nausea or vomiting
- Diarrhea
- Headaches
- Unusual fatigue

### Home Testing Steps

**Daily Checks:**
1. Visual inspection before drinking
2. Smell test
3. Small taste test (if appearance and smell are normal)

**Weekly Checks:**
- pH testing with strips
- TDS measurement
- Check storage containers for algae

**Monthly Checks:**
- Bacterial testing with home kits
- Check water source (well, tank)
- Inspect delivery containers

### Contamination Sources

**Common Causes:**
- Broken pipes or storage tanks
- Poor hygiene during handling
- Contaminated source water
- Improper storage
- Cross-contamination from sewage

### Immediate Actions

**If You Suspect Contamination:**
1. Stop drinking immediately
2. Switch to bottled water
3. Report to supplier/authorities
4. Seek medical attention if symptoms appear
5. Collect sample for testing

### Prevention Tips

✅ Regular tank cleaning
✅ Proper storage (covered, clean containers)
✅ Check delivery vehicle hygiene
✅ Verify supplier credentials
✅ Install point-of-use filters if needed
✅ Keep emergency bottled water supply

### When to Seek Help

**Contact health authorities if:**
- Multiple people get sick
- Contamination affects neighborhood
- Supplier doesn't respond
- Symptoms persist after switching water sources

**Emergency Numbers:**
- County Health Department
- KEBS: +254 20 605490
- Water Service Provider
- AquaBeacon app for immediate reporting
      `
    },
    'safe-water-storage': {
      title: 'Safe Water Storage Guidelines',
      category: 'Water Safety',
      readTime: '3 min read',
      preview: `Proper water storage is crucial for maintaining quality and safety. Learn the best practices for storing water at home and in business settings.

Key storage principles:
- Use food-grade containers only
- Keep containers clean and covered
- Store in cool, dry places away from chemicals
- Regular cleaning and disinfection

Poor storage can contaminate even the purest water...`,
      fullContent: `
## Safe Water Storage Guidelines

### Container Selection

**Approved Materials:**
- Food-grade plastic (marked with recycling codes 1, 2, 4, 5)
- Glass containers
- Stainless steel tanks
- HDPE (High-Density Polyethylene)

**Avoid These Materials:**
❌ Non-food grade plastics
❌ Containers that held chemicals
❌ Cracked or damaged containers
❌ Clear containers (allow algae growth)
❌ Metal containers that can rust

### Storage Environment

**Ideal Conditions:**
- Temperature: 15-25°C (room temperature)
- Away from direct sunlight
- Clean, dry area
- Away from chemicals and cleaning products
- Good ventilation
- Protected from dust and insects

**Avoid Storage Near:**
❌ Pesticides or fertilizers
❌ Petroleum products
❌ Cleaning chemicals
❌ Paint or solvents
❌ Car exhaust areas

### Container Preparation

**Before First Use:**
1. Wash with soap and hot water
2. Rinse thoroughly
3. Disinfect with 1 tsp bleach per gallon
4. Let sit for 30 minutes
5. Rinse completely with clean water
6. Air dry completely

### Water Storage Best Practices

**For Households:**
- Label containers with date
- Use oldest water first (FIFO system)
- Replace stored water every 6 months
- Keep containers tightly sealed
- Don't touch inside of container or lid

**For Businesses:**
- Daily visual inspections
- Weekly cleaning schedule
- Monthly deep cleaning and disinfection
- Temperature monitoring
- Pest control measures

### Cleaning Schedule

**Weekly Cleaning (Home):**
1. Empty container completely
2. Scrub with brush and mild soap
3. Rinse thoroughly
4. Disinfect if needed
5. Air dry before refilling

**Daily Cleaning (Business):**
1. Visual inspection for contamination
2. Check seals and covers
3. Monitor temperature
4. Record observations

### Signs of Contamination

**Visual Indicators:**
- Algae growth (green slime)
- Particles or sediment
- Color changes
- Film on surface

**Smell/Taste Indicators:**
- Musty or stale odors
- Chemical smells
- Unusual taste

### Emergency Storage

**Long-term Emergency Storage:**
- Use water purification tablets
- Rotate stock every 12 months
- Store in multiple locations
- Keep emergency containers separate

**Power Outage Procedures:**
- Fill bathtubs and containers before storm
- Use hot water heater as emergency source
- Boil water if contamination suspected

### Business Requirements

**For Water Vendors:**
- Stainless steel tanks recommended
- Daily sanitization procedures
- Temperature control systems
- Regular water quality testing
- Documented cleaning schedules

### Common Mistakes

❌ Using milk jugs (too thin, degrade quickly)
❌ Storing in garages or basements without protection
❌ Not cleaning containers regularly
❌ Mixing old and new water
❌ Storing near heat sources

### Legal Requirements

**KEBS Standards for Storage:**
- Food-grade materials only
- Regular cleaning protocols
- Protection from contamination
- Proper labeling and dating
- Documentation of procedures

### Cost-Effective Solutions

**Budget Options:**
- Large food-grade buckets: KES 1,000-2,000
- Water storage bags: KES 500-1,000
- Plastic jerry cans: KES 800-1,500

**Professional Systems:**
- Polyethylene tanks: KES 10,000-50,000
- Stainless steel systems: KES 50,000-200,000
      `
    },
    'kebs-consumer-guide': {
      title: 'KEBS Standards for Consumers',
      category: 'Water Safety',
      readTime: '6 min read',
      preview: `Understanding KEBS standards helps consumers make informed choices about water quality and safety. Learn what the certification marks mean and how to verify authentic products.

KEBS (Kenya Bureau of Standards) ensures:
- Water meets safety standards
- Proper labeling and information
- Regular quality monitoring
- Traceability of products

Know your rights as a consumer...`,
      fullContent: `
## KEBS Standards for Consumers

### What is KEBS?

The Kenya Bureau of Standards (KEBS) is the national standards body responsible for ensuring product quality and safety in Kenya. For water products, KEBS certification means the water meets strict safety and quality standards.

### KEBS Water Standards

**KS EAS 153:2000 - Bottled Drinking Water**
- Covers all packaged drinking water
- Sets limits for chemical and biological parameters
- Requires regular testing and monitoring
- Ensures proper labeling

**KS EAS 13:2019 - Water Vending Specification**
- Covers water ATMs and vending machines
- Sets hygiene and operational standards
- Requires regular maintenance and testing

### How to Identify KEBS-Certified Water

**Look for These Marks:**
✅ KEBS Diamond Mark on label
✅ Certification number
✅ Manufacturing date and expiry
✅ Batch/lot number
✅ Manufacturer details

**Verify Authenticity:**
- Check KEBS website database
- Call KEBS hotline: +254 20 605490
- Use KEBS mobile app
- Report suspicious products

### Your Rights as a Consumer

**You Have the Right To:**
- Safe, quality water that meets standards
- Clear labeling with all required information
- Refund for contaminated or substandard products
- Report quality issues to KEBS
- Access to test results upon request

### How to Report Quality Issues

**Steps to Take:**
1. Stop consuming the product immediately
2. Preserve the container and remaining water
3. Take photos of the product and label
4. Note symptoms if any health effects
5. Report to KEBS and the manufacturer

**Contact Information:**
- KEBS Hotline: +254 20 605490
- Email: info@kebs.org
- Website: www.kebs.org
- Regional KEBS offices

### Understanding Water Labels

**Required Information:**
- Product name ("Drinking Water" or "Purified Water")
- KEBS certification mark and number
- Manufacturer name and address
- Volume/content
- Manufacturing and expiry dates
- Batch/lot number
- Storage instructions

### Water Quality Parameters (Consumer Level)

**What KEBS Tests For:**
- Bacterial contamination (must be zero)
- pH levels (6.5-8.5)
- Total dissolved solids
- Heavy metals
- Chemical contaminants
- Physical appearance

**Home Testing:**
While KEBS ensures safety, you can also:
- Use pH strips for basic testing
- Check TDS levels with meters
- Visual inspection for clarity
- Taste and odor assessment

### Different Types of Water Products

**Packaged Drinking Water:**
- Sourced from approved sources
- Treated to meet standards
- Packaged in clean facilities
- Regular KEBS monitoring

**Purified Water:**
- Additional treatment processes
- Higher purity standards
- Often uses reverse osmosis or distillation
- Premium pricing

**Natural Mineral Water:**
- From natural sources
- Minimal processing
- Natural mineral content
- Special KEBS approval required

### Red Flags to Avoid

❌ No KEBS mark or certification number
❌ Unclear or missing labels
❌ Expired products
❌ Damaged packaging
❌ Suspiciously low prices
❌ Unknown brands without contact information

### Pricing and Value

**Typical Price Ranges (2025):**
- 500ml bottled water: KES 40-80
- 1L bottled water: KES 70-120
- 5L container: KES 200-350
- 20L refill: KES 150-300

**Value Indicators:**
- KEBS certification
- Clear labeling
- Proper packaging
- Reputable brand
- Good distribution

### Health and Safety Tips

**Safe Consumption:**
- Check expiry dates
- Store properly after opening
- Don't refill single-use bottles
- Keep bottles clean
- Avoid leaving in hot cars

**For Families with Children:**
- Extra vigilance with quality
- Prefer known, certified brands
- Regular health check-ups
- Teach children to identify quality water

### Business Water Safety

**For Offices and Institutions:**
- Verify supplier KEBS compliance
- Regular quality audits
- Proper storage facilities
- Emergency backup plans
- Staff training on quality standards

### Supporting Quality Standards

**As a Consumer, You Can:**
- Choose only KEBS-certified products
- Report quality issues promptly
- Support businesses that prioritize quality
- Educate others about standards
- Participate in KEBS consumer forums

### Future Developments

**KEBS Initiatives:**
- Digital certification tracking
- Mobile app for verification
- Stricter enforcement
- Consumer education programs
- Regular standard updates

Remember: Your choices drive market quality. By choosing KEBS-certified products, you support better standards for everyone.
      `
    },
    // Premium Business Articles
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
    // Add other article stubs for now
    'permit-guide': {
      title: 'KEBS Permit Application Guide',
      category: 'Compliance',
      readTime: '10 min read',
      preview: 'Step-by-step process for obtaining KEBS certification for your water business...',
      fullContent: '# KEBS Permit Application Guide\n\nDetailed guide coming soon. This covers the complete process of applying for and obtaining KEBS certification for water businesses in Kenya.'
    },
    'water-testing-parameters': {
      title: 'Water Testing Parameters Explained',
      category: 'Quality Control',
      readTime: '6 min read',
      preview: 'Understanding pH, TDS, turbidity, and bacteria limits for water quality control...',
      fullContent: `
## Water Testing Parameters Explained

Understanding water quality parameters is crucial for maintaining safe drinking water. This guide explains the key parameters that KEBS monitors and what they mean for water safety.

### Physical Parameters

**Turbidity (NTU - Nephelometric Turbidity Units)**
- **KEBS Standard:** Less than 5 NTU for bottled water, less than 25 NTU for treated water
- **What it measures:** Cloudiness or haziness caused by suspended particles
- **Why it matters:** High turbidity can harbor harmful bacteria and indicates poor filtration
- **Testing method:** Nephelometer or turbidity meter
- **Common causes:** Sediment, algae, bacteria, or inadequate filtration

**Color (TCU - True Color Units)**
- **KEBS Standard:** Less than 15 TCU (should appear colorless)
- **What it measures:** True color after removing turbidity
- **Why it matters:** Color often indicates organic or chemical contamination
- **Testing method:** Spectrophotometer comparison
- **Common causes:** Organic matter, iron, copper, or industrial pollution

**Taste and Odor**
- **KEBS Standard:** Should be tasteless and odorless
- **What it measures:** Subjective sensory evaluation
- **Why it matters:** Often the first indicator of contamination
- **Testing method:** Sensory panel evaluation
- **Common causes:** Chlorine, algae, bacteria, or chemical contamination

### Chemical Parameters

**pH Level**
- **KEBS Standard:** 6.5 - 8.5 for drinking water
- **What it measures:** Acidity or alkalinity of water
- **Why it matters:** Affects taste, pipe corrosion, and disinfection effectiveness
- **Testing method:** pH meter or indicator strips
- **Health impact:** Extreme pH can cause gastrointestinal irritation

**Total Dissolved Solids (TDS)**
- **KEBS Standard:** 50-500 mg/L for bottled water, less than 1000 mg/L for drinking water
- **What it measures:** Amount of dissolved minerals, salts, and metals
- **Why it matters:** Affects taste and may indicate contamination
- **Testing method:** Conductivity meter or gravimetric analysis
- **Common sources:** Natural minerals, road salt, or agricultural runoff

**Fluoride**
- **KEBS Standard:** Maximum 1.5 mg/L
- **What it measures:** Fluoride ion concentration
- **Why it matters:** Prevents tooth decay in small amounts, toxic in large amounts
- **Testing method:** Ion-selective electrode or spectrophotometry
- **Health impact:** Dental fluorosis if too high, increased cavities if too low

**Chlorine Residual** (for chlorinated water)
- **KEBS Standard:** 0.2 - 0.5 mg/L
- **What it measures:** Remaining chlorine after disinfection
- **Why it matters:** Ensures ongoing protection against bacteria
- **Testing method:** DPD colorimetric test or test strips
- **Balance needed:** Enough to disinfect, not so much as to affect taste

**Heavy Metals**
- **Lead:** Maximum 10 μg/L
- **Arsenic:** Maximum 10 μg/L
- **Mercury:** Maximum 6 μg/L
- **Cadmium:** Maximum 3 μg/L
- **Testing method:** Atomic absorption spectroscopy or ICP-MS
- **Health impact:** Serious long-term health effects including cancer and organ damage

### Microbiological Parameters

**Total Coliform**
- **KEBS Standard:** 0 CFU/100ml (zero tolerance)
- **What it measures:** Indicator bacteria that suggest fecal contamination
- **Why it matters:** Indicates potential presence of disease-causing organisms
- **Testing method:** Membrane filtration or multiple tube fermentation
- **Action required:** Immediate investigation and corrective action if detected

**E. coli**
- **KEBS Standard:** 0 CFU/100ml (zero tolerance)
- **What it measures:** Specific bacteria indicating recent fecal contamination
- **Why it matters:** Direct health threat - causes severe illness
- **Testing method:** Selective media cultivation
- **Health impact:** Diarrhea, urinary tract infections, respiratory illness

**Fecal Streptococci**
- **KEBS Standard:** 0 CFU/100ml
- **What it measures:** Another indicator of fecal contamination
- **Why it matters:** Confirms sewage contamination
- **Testing method:** Selective enrichment and identification

### Testing Frequency Requirements

**For Bottled Water Facilities:**
- **Daily:** pH, chlorine residual, turbidity
- **Weekly:** Total coliform, E. coli, basic chemistry
- **Monthly:** Complete chemical analysis including heavy metals
- **Quarterly:** Comprehensive microbiological testing
- **Annually:** Full parameter analysis for license renewal

**For Water Vending Operations:**
- **Daily:** pH, chlorine residual checks
- **Weekly:** Bacterial contamination testing
- **Monthly:** Full parameter testing
- **Equipment maintenance:** Weekly sanitization required

### Understanding Test Results

**Interpreting Laboratory Reports:**

1. **Pass/Fail Indicators:** Results should clearly show compliance with KEBS standards
2. **Trend Analysis:** Look for gradual changes that might indicate equipment problems
3. **Seasonal Variations:** Some parameters naturally vary with weather and source conditions
4. **Quality Control:** Check that lab included blanks and reference standards

**Action Levels:**
- **Immediate Action:** Any positive bacterial results or pH outside 6.5-8.5
- **Investigation Required:** TDS above 800 mg/L or unusual color/taste
- **Monitoring:** Gradual increases in any parameter
- **Preventive:** Regular equipment calibration and maintenance

### Common Testing Mistakes

**Sampling Errors:**
❌ Not flushing taps before sampling
❌ Using non-sterile containers
❌ Delays in getting samples to lab
❌ Improper storage during transport

**Equipment Issues:**
❌ Uncalibrated instruments
❌ Dirty sampling points
❌ Cross-contamination between samples
❌ Using expired test reagents

### Home Testing Options

**Basic Test Kits (KES 500-2,000):**
- pH test strips
- TDS meters
- Chlorine test kits
- Basic bacteria indicator tests

**Professional Testing (KES 3,000-15,000):**
- Complete KEBS parameter analysis
- Heavy metals screening
- Detailed microbiological testing
- Certificate suitable for regulatory compliance

### When to Test More Frequently

**Increase testing frequency if:**
- Customer complaints about taste, odor, or illness
- Changes in source water quality
- Equipment maintenance or repairs
- Seasonal changes (rainy season especially)
- New treatment processes implemented
- Regulatory inspection findings

### Emergency Response

**If test results fail standards:**
1. **Stop distribution immediately**
2. **Identify and fix the source of contamination**
3. **Resample and retest**
4. **Notify KEBS and customers if required**
5. **Document corrective actions taken**
6. **Implement preventive measures**

### Record Keeping Requirements

**Maintain records for at least 3 years:**
- All test results and certificates
- Sampling procedures and chain of custody
- Corrective actions taken
- Equipment calibration records
- Training records for staff

### Cost-Effective Testing Strategy

**Prioritize based on risk:**
1. **Daily monitoring:** Most critical safety parameters (pH, chlorine, bacteria)
2. **Weekly testing:** Parameters that change quickly (bacteria, basic chemistry)
3. **Monthly analysis:** Comprehensive chemical profile
4. **Annual testing:** Full regulatory compliance check

Understanding these parameters helps ensure your water meets safety standards and protects public health. Regular monitoring and proper interpretation of results are essential for maintaining water quality and KEBS compliance.

### Quick Reference Guide

| Parameter | KEBS Limit | Test Method | Frequency | Health Risk |
|-----------|------------|-------------|-----------|-------------|
| pH | 6.5-8.5 | pH meter | Daily | GI irritation |
| Turbidity | <5 NTU | Turbidimeter | Daily | Bacterial growth |
| TDS | <1000 mg/L | Conductivity | Weekly | Taste/health |
| E. coli | 0 CFU/100ml | Culture | Weekly | Severe illness |
| Chlorine | 0.2-0.5 mg/L | DPD test | Daily | Inadequate disinfection |
| Lead | <10 μg/L | AAS/ICP | Monthly | Neurological damage |

Remember: When in doubt, always err on the side of caution and consult with certified water quality professionals.
      `
    },
    'equipment-guide': {
      title: 'Essential Equipment Guide',
      category: 'Equipment',
      readTime: '15 min read',
      preview: 'What equipment you need and how to choose suppliers for your water business...',
      fullContent: '# Essential Equipment Guide\n\nComplete guide to selecting, purchasing, and maintaining equipment for water purification and bottling businesses.'
    },
    'treatment-methods': {
      title: 'Water Treatment Methods',
      category: 'Technical',
      readTime: '10 min read',
      preview: 'Filtration, RO, UV, chlorination, and ozonation explained in detail...',
      fullContent: '# Water Treatment Methods\n\nDetailed explanation of various water treatment technologies and their applications in commercial water businesses.'
    },
    'hygiene-practices': {
      title: 'Safety & Hygiene Best Practices',
      category: 'Operations',
      readTime: '8 min read',
      preview: 'Maintaining sanitation and preventing contamination in water facilities...',
      fullContent: '# Safety & Hygiene Best Practices\n\nComprehensive guide to maintaining hygiene standards and preventing contamination in water production facilities.'
    },
    'business-scaling': {
      title: 'Scaling Your Water Business',
      category: 'Growth',
      readTime: '12 min read',
      preview: 'Growth strategies and expansion planning for water businesses...',
      fullContent: '# Scaling Your Water Business\n\nStrategic guide to growing and expanding your water business sustainably while maintaining quality standards.'
    },
    'financial-planning': {
      title: 'Financial Planning & Budgeting',
      category: 'Finance',
      readTime: '10 min read',
      preview: 'Cost analysis, pricing strategies, and profitability planning...',
      fullContent: '# Financial Planning & Budgeting\n\nComprehensive financial planning guide for water businesses including cost analysis and pricing strategies.'
    },
    'lab-testing': {
      title: 'Lab Testing Schedule & Procedures',
      category: 'Quality Control',
      readTime: '7 min read',
      preview: 'When and how to test water quality for KEBS compliance...',
      fullContent: '# Lab Testing Schedule & Procedures\n\nDetailed guide to laboratory testing requirements and schedules for maintaining KEBS certification.'
    },
    'distribution-channels': {
      title: 'Distribution & Sales Channels',
      category: 'Marketing',
      readTime: '9 min read',
      preview: 'How to reach customers and grow sales through various channels...',
      fullContent: '# Distribution & Sales Channels\n\nComplete guide to building effective distribution networks and sales channels for water businesses.'
    },
    'bottling-packaging': {
      title: 'Bottling & Packaging Standards',
      category: 'Operations',
      readTime: '8 min read',
      preview: 'Bottle types, labeling requirements, and branding guidelines...',
      fullContent: '# Bottling & Packaging Standards\n\nComprehensive guide to bottling equipment, packaging materials, and labeling requirements for compliance.'
    }
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
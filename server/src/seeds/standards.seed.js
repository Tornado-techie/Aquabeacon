require('dotenv').config();
const mongoose = require('mongoose');
const Standard = require('../models/Standard');
const logger = require('../utils/logger');

const standards = [
  {
    code: 'KS EAS 153:2020',
    title: 'Natural Mineral Waters – Specification',
    description: 'This East African Standard specifies requirements and sampling and test methods for natural mineral waters intended for human consumption.',
    category: 'bottled_water',
    issuingBody: 'KEBS',
    publicationDate: new Date('2020-01-15'),
    effectiveDate: new Date('2020-03-01'),
    status: 'current',
    requirements: [
      {
        section: '4.1',
        requirement: 'Microbiological Requirements',
        specification: 'E. coli: 0/100ml, Enterococci: 0/100ml, P. aeruginosa: 0/250ml',
        testMethod: 'ISO 9308-1, ISO 7899-2'
      },
      {
        section: '4.2',
        requirement: 'Chemical Requirements',
        specification: 'Antimony: max 5 µg/l, Arsenic: max 10 µg/l, Barium: max 700 µg/l',
        testMethod: 'ISO 11885, ICP-MS'
      },
      {
        section: '4.3',
        requirement: 'Physical Requirements',
        specification: 'pH: 6.5-9.5, Turbidity: max 5 NTU',
        testMethod: 'ISO 10523, ISO 7027'
      }
    ],
    tags: ['water quality', 'mineral water', 'bottled water', 'health']
  },
  {
    code: 'KS EAS 13:2020',
    title: 'Bottled Drinking Water – Specification',
    description: 'This standard specifies requirements for bottled drinking water other than natural mineral water.',
    category: 'bottled_water',
    issuingBody: 'KEBS',
    publicationDate: new Date('2020-01-15'),
    effectiveDate: new Date('2020-03-01'),
    status: 'current',
    requirements: [
      {
        section: '3.1',
        requirement: 'Source Water Quality',
        specification: 'Source water must meet WHO drinking water guidelines',
        testMethod: 'WHO standards'
      },
      {
        section: '3.2',
        requirement: 'Treatment',
        specification: 'Water must be treated to remove impurities and ensure safety',
        testMethod: 'Various methods'
      },
      {
        section: '4.1',
        requirement: 'Microbiological',
        specification: 'Total coliform: 0/100ml, E. coli: 0/100ml',
        testMethod: 'ISO 9308-1'
      },
      {
        section: '4.2',
        requirement: 'Chemical - Heavy Metals',
        specification: 'Lead: max 10 µg/l, Cadmium: max 3 µg/l, Mercury: max 6 µg/l',
        testMethod: 'AAS, ICP-MS'
      },
      {
        section: '4.3',
        requirement: 'Physical',
        specification: 'Colour: max 15 TCU, Turbidity: max 5 NTU, TDS: 50-500 mg/l',
        testMethod: 'ISO 7887, ISO 7027'
      }
    ],
    tags: ['bottled water', 'drinking water', 'quality standards']
  },
  {
    code: 'KS 459-1:2007',
    title: 'Water Quality - Sampling - Part 1: Guidance on the Design of Sampling Programmes',
    description: 'Provides guidance on sampling design for water quality assessment',
    category: 'quality',
    issuingBody: 'KEBS',
    publicationDate: new Date('2007-06-01'),
    status: 'current',
    requirements: [
      {
        section: '5',
        requirement: 'Sampling Frequency',
        specification: 'Minimum quarterly sampling for routine monitoring',
        testMethod: 'N/A'
      },
      {
        section: '6',
        requirement: 'Sample Preservation',
        specification: 'Cool to 4°C, analyze within specified holding times',
        testMethod: 'Various'
      }
    ],
    tags: ['sampling', 'quality control', 'methodology']
  },
  {
    code: 'KS ISO 22000:2018',
    title: 'Food Safety Management Systems',
    description: 'Requirements for any organization in the food chain',
    category: 'hygiene',
    issuingBody: 'KEBS',
    publicationDate: new Date('2018-06-01'),
    effectiveDate: new Date('2018-09-01'),
    status: 'current',
    requirements: [
      {
        section: '7',
        requirement: 'Prerequisite Programs',
        specification: 'Implement good hygiene practices, facility design, cleaning, pest control',
        testMethod: 'Inspection and verification'
      },
      {
        section: '8',
        requirement: 'HACCP Principles',
        specification: 'Conduct hazard analysis, establish CCPs, monitoring procedures',
        testMethod: 'Risk assessment'
      }
    ],
    tags: ['food safety', 'HACCP', 'management systems']
  }
];

const seedStandards = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');

    await Standard.deleteMany({});
    logger.info('Cleared existing standards');

    await Standard.insertMany(standards);
    logger.info(`Inserted ${standards.length} standards`);

    logger.info('Seed completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedStandards();
}

module.exports = seedStandards;
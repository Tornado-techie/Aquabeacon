db = db.getSiblingDB('aquabeacon');

// Create collections and initial data
db.createCollection('users');
db.createCollection('plants');
db.createCollection('permits');
db.createCollection('complaints');
db.createCollection('labsamples');
db.createCollection('standards');

// Insert sample standards
db.standards.insertMany([
  {
    code: "KS EAS 153",
    name: "Drinking water — Specification",
    description: "Kenya Standard for drinking water quality requirements",
    category: "water_quality",
    parameters: [
      { name: "pH", unit: "-", minValue: 6.5, maxValue: 8.5, testMethod: "KS 05-459" },
      { name: "Turbidity", unit: "NTU", minValue: null, maxValue: 5, testMethod: "KS 05-459" },
      { name: "Total Coliform", unit: "cfu/100ml", minValue: null, maxValue: 0, testMethod: "KS 05-459" }
    ],
    effectiveDate: new Date("2020-01-01"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    code: "KS EAS 13",
    name: "Labelling of pre-packaged foods",
    description: "General standard for the labelling of pre-packaged foods",
    category: "labeling",
    parameters: [],
    effectiveDate: new Date("2018-01-01"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('AquaBeacon database initialized successfully');
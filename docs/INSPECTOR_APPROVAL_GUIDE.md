# Inspector Plant Approval System - Complete Guide

## 🎯 How Plant Approval Works

### **Who Approves Plants?**
✅ **Inspectors** and **Admins** can approve newly registered plants
✅ **Plant owners** register their facilities
✅ **Inspectors** review and approve/reject registrations

## 👨‍💼 Inspector Workflow

### **1. Inspector Login**
When an inspector logs into their account, they should:

1. **Access Admin Panel**: Navigate to `/admin` (available in navigation)
2. **View Pending Plants**: See all plants with "pending" status
3. **Review Plant Details**: Check registration information
4. **Make Approval Decision**: Approve or reject the plant

### **2. What Inspectors See**

When an inspector accesses the Admin Panel, they will see:

```
┌─────────────────────────────────────────────┐
│ 🏭 AquaBeacon Admin Panel                   │
├─────────────────────────────────────────────┤
│ Overview Tab:                               │
│ • Total Plants: X                           │
│ • Pending Approvals: Y                      │
│ • Active Plants: Z                          │
│                                             │
│ Plant Approvals Tab:                        │
│ ┌─────────────────────────────────────────┐ │
│ │ 🏭 Aquasally                           │ │
│ │ 📍 234 industrial area, Eldoret        │ │
│ │ Type: purification | Capacity: 5000 L  │ │
│ │ Owner: [Owner Name]                    │ │
│ │ Contact: [Contact Info]                │ │
│ │                                        │ │
│ │ [✅ Approve] [❌ Reject]               │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### **3. Approval Process**

**For Each Pending Plant:**
1. **Review Information**:
   - Plant name and type
   - Location and address
   - Production capacity
   - Owner details
   - Contact information

2. **Make Decision**:
   - **✅ Approve**: Plant becomes "Active" and can operate fully
   - **❌ Reject**: Plant status becomes "Rejected" (owner needs to resubmit)

3. **Status Updates**:
   - Approved plants show green "Active" badge
   - Rejected plants show red "Rejected" badge
   - Changes are immediately visible to plant owners

## 🔧 Current System Status

### **✅ What's Working:**
- Plant registration by owners ✅
- Inspector access to Admin Panel ✅  
- Pending plants display ✅
- Approve/Reject functionality ✅
- Status update API ✅

### **📋 Your Plant "Aquasally":**
- **Status**: Pending Approval
- **Visible to**: All inspectors in Admin Panel
- **Action Required**: Inspector needs to review and approve

## 👨‍🔧 For Inspectors - How to Approve Plants

### **Step-by-Step Guide:**

1. **Login as Inspector**
   ```
   Role: inspector
   Username: [inspector credentials]
   ```

2. **Navigate to Admin Panel**
   - Click "Admin Panel" in navigation
   - Or go to: `http://localhost:5173/admin`

3. **View Pending Plants**
   - Click "Plant Approvals" tab
   - See list of plants awaiting approval
   - Your plant "Aquasally" should be listed

4. **Review Plant Details**
   - Plant Name: Aquasally
   - Location: 234 industrial area, Eldoret, Uasin Gishu
   - Type: purification
   - Capacity: 5000 L/day
   - Owner information and contact details

5. **Approve the Plant**
   - Click "✅ Approve" button
   - Plant status changes to "Active"
   - Owner receives confirmation
   - Plant appears with green "Active" badge

## 🔄 Testing the Approval System

### **Create Inspector Account (if needed):**
```javascript
// In MongoDB or via API
{
  "firstName": "Inspector",
  "lastName": "John",
  "email": "inspector@aquabeacon.co.ke",
  "role": "inspector",
  "password": "password123"
}
```

### **Test Approval Process:**
1. Login as inspector
2. Go to `/admin`
3. Check "Plant Approvals" tab
4. Find "Aquasally" in pending list
5. Click "Approve"
6. Verify status changes to "Active"

## 📊 Inspector Dashboard Features

### **Overview Section:**
- **Total Plants**: All registered plants
- **Pending Approvals**: Plants waiting for review
- **Active Plants**: Approved and operational plants
- **Recent Activity**: Latest registrations and status changes

### **Plant Management:**
- **Filter by Status**: View pending, active, suspended plants
- **Search Plants**: Find specific facilities
- **Bulk Actions**: Approve multiple plants
- **Export Reports**: Generate compliance reports

### **Plant Details Available:**
- Registration information
- Owner contact details
- Production specifications
- Location and GPS coordinates
- Compliance history
- Documentation status

## 🚨 Important Notes

### **Inspector Responsibilities:**
1. **Verify Information**: Check all plant details are accurate
2. **Compliance Check**: Ensure regulatory requirements are met
3. **Documentation Review**: Verify permits and certifications
4. **Site Inspection**: May require physical facility inspection
5. **Status Management**: Keep plant statuses updated

### **Status Meanings:**
- **🟡 Pending**: Awaiting inspector review
- **🟢 Active**: Approved and operational
- **🔴 Suspended**: Temporarily halted (compliance issues)
- **⚫ Closed**: Permanently shut down
- **❌ Rejected**: Application denied (needs resubmission)

## 🔧 API Endpoints for Inspectors

### **Get All Plants:**
```javascript
GET /api/plants
// Returns all plants for inspectors/admins
// Returns only owned plants for owners
```

### **Update Plant Status:**
```javascript
PATCH /api/plants/:plantId/status
{
  "status": "active" | "suspended" | "closed" | "pending"
}
// Only inspectors and admins can update status
```

### **Get Plant Details:**
```javascript
GET /api/plants/:plantId
// Full plant information for review
```

## ✅ Summary

**Your plant "Aquasally" is correctly registered and waiting for inspector approval.**

**For the inspector to approve it:**
1. Inspector logs in with `role: "inspector"`
2. Goes to `/admin` panel
3. Clicks "Plant Approvals" tab
4. Finds "Aquasally" in the pending list
5. Reviews the details
6. Clicks "✅ Approve"
7. Plant status changes to "Active"

**The system is working correctly** - the "Pending" status is normal and expected for new plant registrations until an inspector reviews and approves them.

**Next Steps:**
- If you have inspector credentials, test the approval process
- If you need an inspector account, create one with `role: "inspector"`
- The approval will change your plant status from "Pending" to "Active"
# NewLife Recovery Center - Dummy Data

This directory contains comprehensive dummy data for testing and developing the NewLife Recovery Dashboard.

## 📁 Files

- **`dummy_data.sql`** - Complete SQL script with all dummy data
- **`load_dummy_data.bat`** - Windows batch script to load the data
- **`DUMMY_DATA_README.md`** - This documentation file

## 🗄️ Database Schema

The dummy data is designed for the MySQL database schema created in the main project. It includes data for all major tables:

### Core Entities
- **Users** (9 records) - System users with different roles
- **Staff** (8 records) - Clinical staff with specializations
- **Clients** (10 records) - Patients with various conditions
- **Programs** (6 records) - Treatment programs offered

### Operational Data
- **Sessions** (10 records) - Therapy sessions and meetings
- **Intake Calls** (8 records) - 24/7 intake management
- **Case Files** (10 records) - Client documentation
- **Progress Notes** (15 records) - Clinical documentation
- **Medications** (8 records) - Prescribed medications

### Supporting Data
- **Notifications** (8 records) - System notifications
- **Activity Log** (8 records) - Audit trail
- **System Settings** - Configuration data

## 🚀 Quick Start

### Prerequisites
1. MySQL server installed and running
2. Database schema created (from the main project)
3. MySQL command line client in PATH

### Loading the Data

#### Option 1: Using the Batch Script (Windows)
1. Edit `load_dummy_data.bat` and update the MySQL connection details:
   ```batch
   set MYSQL_USER=your_username
   set MYSQL_PASSWORD=your_password
   set DATABASE_NAME=newlife_recovery_db
   ```

2. Run the batch script:
   ```batch
   load_dummy_data.bat
   ```

#### Option 2: Manual SQL Execution
1. Connect to your MySQL database
2. Run the SQL script:
   ```sql
   source dummy_data.sql;
   ```

#### Option 3: Command Line
```bash
mysql -u your_username -p your_database < dummy_data.sql
```

## 📊 Sample Data Overview

### Staff Members
- **Dr. Sarah McCormick** - Clinical Director (Addiction Psychiatry)
- **Michael Rodriguez** - Licensed Counselor (CBT Therapy)
- **Emily Chen** - Nurse Practitioner (Medical Management)
- **David Thompson** - Group Therapist (Group Therapy)
- **Lisa Wang** - Licensed Counselor (Family Therapy)
- **James Wilson** - Registered Nurse (Medical Care)
- **Maria Garcia** - Art Therapist (Creative Therapy)
- **Robert Johnson** - Substance Abuse Counselor (12-Step Programs)

### Clients
- **Sarah Johnson** - Alcohol Use Disorder (75% progress)
- **Michael Chen** - Opioid Use Disorder (60% progress)
- **Emily Rodriguez** - Cocaine Use Disorder (Aftercare, 90% progress)
- **David Thompson** - Alcohol Use Disorder (45% progress)
- **Lisa Wang** - Benzodiazepine Use Disorder (30% progress)
- **Robert Davis** - Methamphetamine Use Disorder (55% progress)
- **Amanda Wilson** - Prescription Drug Abuse (40% progress)
- **Christopher Brown** - Heroin Use Disorder (70% progress)
- **Jessica Taylor** - Alcohol Use Disorder (Aftercare, 85% progress)
- **Daniel Martinez** - Cocaine Use Disorder (25% progress)

### Programs
- **Residential Treatment** - 24/7 intensive care (85.5% success rate)
- **Outpatient Program** - Flexible treatment (78.2% success rate)
- **Aftercare Support** - Ongoing support (92.1% success rate)
- **Medical Detox** - Supervised detoxification (88.7% success rate)
- **Partial Hospitalization** - Day treatment (82.3% success rate)
- **Family Program** - Family dynamics (79.8% success rate)

### Session Types
- Individual therapy sessions
- Group therapy sessions
- Family therapy sessions
- 12-Step meetings
- Art therapy sessions
- Assessment sessions
- Follow-up sessions

## 🔧 Data Features

### Realistic Scenarios
- Various substance use disorders
- Different treatment stages (active, aftercare, discharged)
- Realistic progress percentages
- Diverse staff specializations
- Emergency intake scenarios

### Status Variations
- **Clients**: Active, Aftercare, Discharged
- **Staff**: Available, In Session, On Call, Off Duty
- **Sessions**: Scheduled, In Progress, Completed, Cancelled
- **Intake Calls**: Emergency, Inquiry, Follow-up, Referral

### Time-based Data
- Recent admission dates (2024)
- Scheduled sessions for current week
- Realistic medication schedules
- Progress notes with recent dates

## 🧪 Testing Scenarios

The dummy data supports testing of:

### Dashboard Features
- **Overview Metrics** - Active clients, sessions, staff availability
- **Recent Activity** - Progress notes, intake calls, notifications
- **Program Status** - Enrollment rates, success rates

### Client Management
- **Client Directory** - Search, filter, status tracking
- **Progress Tracking** - Progress percentages, notes, medications
- **Case Files** - Document management, file types

### Staff Management
- **Staff Directory** - Roles, specializations, availability
- **Session Scheduling** - Individual and group sessions
- **Workload Management** - Client assignments

### Intake System
- **Emergency Calls** - Critical, high, medium urgency
- **Assessment Process** - Substance use, medical history
- **Admission Workflow** - From call to enrollment

### Reporting
- **Success Rates** - Program performance metrics
- **Attendance Tracking** - Session participation
- **Progress Analytics** - Client improvement over time

## 🔄 Data Refresh

To refresh the dummy data:

1. **Clear existing data** (already included in the script)
2. **Re-run the script** to reload fresh data
3. **Verify data integrity** with the summary queries

## 📈 Customization

You can modify the dummy data by:

1. **Editing the SQL file** - Add/remove/modify records
2. **Adjusting dates** - Update to current dates
3. **Adding scenarios** - Create specific test cases
4. **Modifying relationships** - Change client-staff assignments

## 🛠️ Troubleshooting

### Common Issues
- **Connection errors** - Check MySQL credentials and server status
- **Permission errors** - Ensure user has INSERT/UPDATE permissions
- **Foreign key errors** - Verify database schema is created first
- **Character encoding** - Use UTF-8 encoding for proper display

### Verification Queries
```sql
-- Check data counts
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'Staff', COUNT(*) FROM staff
UNION ALL SELECT 'Clients', COUNT(*) FROM clients
UNION ALL SELECT 'Programs', COUNT(*) FROM programs;

-- Check active clients
SELECT COUNT(*) as active_clients FROM clients WHERE status = 'active';

-- Check today's sessions
SELECT COUNT(*) as today_sessions FROM sessions WHERE scheduled_date = CURDATE();
```

## 📞 Support

For issues with the dummy data:
1. Check the MySQL error logs
2. Verify database schema matches
3. Ensure proper permissions
4. Review the troubleshooting section above

---

**Note**: This is test data only. Do not use in production environments. All personal information is fictional and for demonstration purposes only. 
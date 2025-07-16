-- NewLife Recovery Center - Dummy Data
-- Comprehensive sample data for testing and development

USE newlife_recovery_db;

-- Clear existing data (if any)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_log;
TRUNCATE TABLE notifications;
TRUNCATE TABLE progress_notes;
TRUNCATE TABLE medications;
TRUNCATE TABLE session_participants;
TRUNCATE TABLE sessions;
TRUNCATE TABLE case_files;
TRUNCATE TABLE intake_assessments;
TRUNCATE TABLE intake_calls;
TRUNCATE TABLE client_programs;
TRUNCATE TABLE clients;
TRUNCATE TABLE staff;
TRUNCATE TABLE users;
TRUNCATE TABLE programs;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Users
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, last_login) VALUES
('sarah.mccormick', 'sarah.mccormick@newlife.com', '$2y$10$hashed_password_1', 'Sarah', 'McCormick', 'clinical_director', TRUE, NOW()),
('michael.rodriguez', 'michael.rodriguez@newlife.com', '$2y$10$hashed_password_2', 'Michael', 'Rodriguez', 'counselor', TRUE, NOW()),
('emily.chen', 'emily.chen@newlife.com', '$2y$10$hashed_password_3', 'Emily', 'Chen', 'nurse', TRUE, NOW()),
('david.thompson', 'david.thompson@newlife.com', '$2y$10$hashed_password_4', 'David', 'Thompson', 'therapist', TRUE, NOW()),
('lisa.wang', 'lisa.wang@newlife.com', '$2y$10$hashed_password_5', 'Lisa', 'Wang', 'counselor', TRUE, NOW()),
('james.wilson', 'james.wilson@newlife.com', '$2y$10$hashed_password_6', 'James', 'Wilson', 'nurse', TRUE, NOW()),
('maria.garcia', 'maria.garcia@newlife.com', '$2y$10$hashed_password_7', 'Maria', 'Garcia', 'therapist', TRUE, NOW()),
('robert.johnson', 'robert.johnson@newlife.com', '$2y$10$hashed_password_8', 'Robert', 'Johnson', 'counselor', TRUE, NOW()),
('admin', 'admin@newlife.com', '$2y$10$hashed_password_admin', 'System', 'Administrator', 'admin', TRUE, NOW());

-- Insert Staff
INSERT INTO staff (user_id, employee_id, title, specialization, phone, emergency_contact, hire_date, status, availability_status, max_clients) VALUES
(1, 'EMP001', 'Clinical Director', 'Addiction Psychiatry', '(555) 123-4567', '(555) 123-4568', '2020-01-15', 'active', 'available', 15),
(2, 'EMP002', 'Licensed Counselor', 'CBT Therapy', '(555) 234-5678', '(555) 234-5679', '2021-03-20', 'active', 'in_session', 12),
(3, 'EMP003', 'Nurse Practitioner', 'Medical Management', '(555) 345-6789', '(555) 345-6790', '2021-06-10', 'active', 'available', 20),
(4, 'EMP004', 'Group Therapist', 'Group Therapy', '(555) 456-7890', '(555) 456-7891', '2022-01-05', 'active', 'on_call', 25),
(5, 'EMP005', 'Licensed Counselor', 'Family Therapy', '(555) 567-8901', '(555) 567-8902', '2022-04-12', 'active', 'available', 10),
(6, 'EMP006', 'Registered Nurse', 'Medical Care', '(555) 678-9012', '(555) 678-9013', '2022-08-15', 'active', 'available', 18),
(7, 'EMP007', 'Art Therapist', 'Creative Therapy', '(555) 789-0123', '(555) 789-0124', '2023-01-20', 'active', 'off_duty', 8),
(8, 'EMP008', 'Substance Abuse Counselor', '12-Step Programs', '(555) 890-1234', '(555) 890-1235', '2023-03-10', 'active', 'available', 14);

-- Insert Programs
INSERT INTO programs (name, description, duration, capacity, success_rate, status, program_type, cost_per_day) VALUES
('Residential Treatment', '24/7 intensive inpatient care for severe addiction cases with medical supervision and comprehensive therapy', '30-90 days', 20, 85.5, 'active', 'residential', 450.00),
('Outpatient Program', 'Flexible treatment allowing clients to maintain daily responsibilities while receiving therapy and support', '3-12 months', 50, 78.2, 'active', 'outpatient', 150.00),
('Aftercare Support', 'Ongoing support and relapse prevention for program graduates with regular check-ins and group sessions', 'Ongoing', 100, 92.1, 'active', 'aftercare', 75.00),
('Medical Detox', 'Medically supervised detoxification with 24/7 nursing care and medication management', '7-14 days', 15, 88.7, 'active', 'detox', 600.00),
('Partial Hospitalization', 'Intensive day treatment program for clients who need structured care but can return home evenings', '2-8 weeks', 30, 82.3, 'active', 'partial_hospitalization', 300.00),
('Family Program', 'Specialized treatment focusing on family dynamics and relationship healing', '4-12 weeks', 25, 79.8, 'active', 'outpatient', 200.00);

-- Insert Clients
INSERT INTO clients (client_id, first_name, last_name, date_of_birth, gender, email, phone, emergency_contact_name, emergency_contact_phone, address, insurance_provider, insurance_policy_number, primary_diagnosis, admission_date, status, progress_percentage, notes) VALUES
('CLI001', 'Sarah', 'Johnson', '1985-03-15', 'female', 'sarah.johnson@email.com', '(555) 123-4567', 'John Johnson', '(555) 123-4568', '123 Main St, Anytown, ST 12345', 'Blue Cross Blue Shield', 'BCBS123456789', 'Alcohol Use Disorder, Moderate', '2024-01-15', 'active', 75, 'Responding well to treatment, attending all sessions'),
('CLI002', 'Michael', 'Chen', '1990-07-22', 'male', 'michael.chen@email.com', '(555) 234-5678', 'Lisa Chen', '(555) 234-5679', '456 Oak Ave, Somewhere, ST 23456', 'Aetna', 'AETNA987654321', 'Opioid Use Disorder, Severe', '2024-02-01', 'active', 60, 'Making steady progress, needs continued support'),
('CLI003', 'Emily', 'Rodriguez', '1988-11-08', 'female', 'emily.rodriguez@email.com', '(555) 345-6789', 'Carlos Rodriguez', '(555) 345-6790', '789 Pine Rd, Elsewhere, ST 34567', 'Cigna', 'CIGNA456789123', 'Cocaine Use Disorder, Moderate', '2023-11-20', 'aftercare', 90, 'Successfully completed residential program'),
('CLI004', 'David', 'Thompson', '1982-05-12', 'male', 'david.thompson@email.com', '(555) 456-7890', 'Mary Thompson', '(555) 456-7891', '321 Elm St, Nowhere, ST 45678', 'UnitedHealth', 'UHC789123456', 'Alcohol Use Disorder, Severe', '2024-01-30', 'active', 45, 'Early in treatment, showing commitment'),
('CLI005', 'Lisa', 'Wang', '1992-09-30', 'female', 'lisa.wang@email.com', '(555) 567-8901', 'Tom Wang', '(555) 567-8902', '654 Maple Dr, Anywhere, ST 56789', 'Humana', 'HUMANA321654987', 'Benzodiazepine Use Disorder', '2024-02-10', 'active', 30, 'Recently admitted, assessment phase'),
('CLI006', 'Robert', 'Davis', '1987-12-03', 'male', 'robert.davis@email.com', '(555) 678-9012', 'Jennifer Davis', '(555) 678-9013', '987 Cedar Ln, Someplace, ST 67890', 'Kaiser Permanente', 'KAISER147258369', 'Methamphetamine Use Disorder', '2024-01-25', 'active', 55, 'Participating actively in group therapy'),
('CLI007', 'Amanda', 'Wilson', '1991-04-18', 'female', 'amanda.wilson@email.com', '(555) 789-0123', 'Steve Wilson', '(555) 789-0124', '147 Birch Way, Othertown, ST 78901', 'Anthem', 'ANTHEM963852741', 'Prescription Drug Abuse', '2024-02-05', 'active', 40, 'Working on medication management'),
('CLI008', 'Christopher', 'Brown', '1986-08-25', 'male', 'chris.brown@email.com', '(555) 890-1234', 'Patricia Brown', '(555) 890-1235', '258 Spruce Ct, Newtown, ST 89012', 'Molina Healthcare', 'MOLINA852963741', 'Heroin Use Disorder', '2024-01-20', 'active', 70, 'Making excellent progress in recovery'),
('CLI009', 'Jessica', 'Taylor', '1989-01-14', 'female', 'jessica.taylor@email.com', '(555) 901-2345', 'Mark Taylor', '(555) 901-2346', '369 Willow Pl, Oldtown, ST 90123', 'Blue Cross Blue Shield', 'BCBS456789123', 'Alcohol Use Disorder, Moderate', '2023-12-15', 'aftercare', 85, 'Successfully maintaining sobriety'),
('CLI010', 'Daniel', 'Martinez', '1984-06-07', 'male', 'daniel.martinez@email.com', '(555) 012-3456', 'Ana Martinez', '(555) 012-3457', '741 Ash Blvd, Midtown, ST 01234', 'Aetna', 'AETNA789456123', 'Cocaine Use Disorder, Severe', '2024-02-15', 'active', 25, 'New admission, beginning assessment');

-- Insert Client Program Enrollments
INSERT INTO client_programs (client_id, program_id, enrollment_date, status, progress_notes) VALUES
(1, 1, '2024-01-15', 'in_progress', 'Enrolled in residential program, showing good progress'),
(2, 2, '2024-02-01', 'in_progress', 'Outpatient program participant, attending regularly'),
(3, 3, '2023-11-20', 'completed', 'Successfully completed residential, now in aftercare'),
(4, 1, '2024-01-30', 'in_progress', 'Residential treatment, early stages'),
(5, 2, '2024-02-10', 'enrolled', 'Recently started outpatient program'),
(6, 1, '2024-01-25', 'in_progress', 'Residential treatment, making steady progress'),
(7, 2, '2024-02-05', 'enrolled', 'Outpatient program, assessment phase'),
(8, 1, '2024-01-20', 'in_progress', 'Residential treatment, responding well'),
(9, 3, '2023-12-15', 'completed', 'Aftercare program, maintaining sobriety'),
(10, 1, '2024-02-15', 'enrolled', 'New residential admission');

-- Insert Sessions
INSERT INTO sessions (session_type, title, description, scheduled_date, scheduled_time, duration_minutes, status, room_location, max_participants) VALUES
('group', 'Cognitive Behavioral Therapy Group', 'Group session focusing on cognitive restructuring and coping skills', '2024-02-20', '10:00:00', 90, 'scheduled', 'Group Room A', 12),
('individual', 'Individual Therapy - Sarah Johnson', 'One-on-one session with Sarah Johnson', '2024-02-20', '14:00:00', 60, 'scheduled', 'Office 101', 1),
('group', '12-Step Meeting', 'Alcoholics Anonymous meeting', '2024-02-20', '19:00:00', 90, 'scheduled', 'Meeting Room B', 20),
('family', 'Family Therapy - Chen Family', 'Family session for Michael Chen and his family', '2024-02-21', '15:00:00', 90, 'scheduled', 'Family Room', 6),
('assessment', 'Psychiatric Evaluation - Lisa Wang', 'Initial psychiatric assessment', '2024-02-21', '09:00:00', 120, 'scheduled', 'Office 102', 1),
('group', 'Art Therapy Session', 'Creative expression through art therapy', '2024-02-21', '13:00:00', 75, 'scheduled', 'Art Room', 8),
('individual', 'Individual Therapy - David Thompson', 'One-on-one session with David Thompson', '2024-02-22', '11:00:00', 60, 'scheduled', 'Office 103', 1),
('group', 'Relapse Prevention Group', 'Skills training for relapse prevention', '2024-02-22', '16:00:00', 90, 'scheduled', 'Group Room B', 15),
('follow_up', 'Follow-up - Emily Rodriguez', 'Aftercare follow-up session', '2024-02-22', '14:30:00', 45, 'scheduled', 'Office 104', 1),
('group', 'Mindfulness and Meditation', 'Mindfulness practice and stress reduction', '2024-02-23', '10:30:00', 60, 'scheduled', 'Meditation Room', 10);

-- Insert Session Participants
INSERT INTO session_participants (session_id, client_id, staff_id, role, attendance_status) VALUES
(1, 1, 2, 'client', 'scheduled'),
(1, 2, 2, 'client', 'scheduled'),
(1, 4, 2, 'client', 'scheduled'),
(1, 6, 2, 'client', 'scheduled'),
(1, 8, 2, 'client', 'scheduled'),
(1, NULL, 2, 'therapist', 'scheduled'),
(2, 1, NULL, 'client', 'scheduled'),
(2, NULL, 1, 'therapist', 'scheduled'),
(3, 1, 8, 'client', 'scheduled'),
(3, 2, 8, 'client', 'scheduled'),
(3, 4, 8, 'client', 'scheduled'),
(3, 6, 8, 'client', 'scheduled'),
(3, 8, 8, 'client', 'scheduled'),
(3, NULL, 8, 'therapist', 'scheduled'),
(4, 2, NULL, 'client', 'scheduled'),
(4, NULL, 5, 'therapist', 'scheduled'),
(5, 5, NULL, 'client', 'scheduled'),
(5, NULL, 1, 'therapist', 'scheduled'),
(6, 1, 7, 'client', 'scheduled'),
(6, 3, 7, 'client', 'scheduled'),
(6, 5, 7, 'client', 'scheduled'),
(6, 7, 7, 'client', 'scheduled'),
(6, 9, 7, 'client', 'scheduled'),
(6, NULL, 7, 'therapist', 'scheduled');

-- Insert Intake Calls
INSERT INTO intake_calls (caller_name, caller_phone, call_type, urgency_level, call_date, duration_minutes, call_summary, action_taken, follow_up_required, follow_up_date, status, handled_by) VALUES
('John Doe', '(555) 111-2222', 'emergency', 'critical', '2024-02-20 08:30:00', 15, 'Client experiencing severe withdrawal symptoms, needs immediate medical attention', 'Arranged emergency transport to facility', TRUE, '2024-02-20', 'completed', 1),
('Sarah Smith', '(555) 222-3333', 'inquiry', 'low', '2024-02-20 10:15:00', 8, 'General information request about outpatient programs', 'Provided program information and scheduled consultation', FALSE, NULL, 'completed', 2),
('Mike Johnson', '(555) 333-4444', 'emergency', 'high', '2024-02-20 14:45:00', 12, 'Client in crisis, considering self-harm', 'Crisis intervention provided, safety plan developed', TRUE, '2024-02-21', 'completed', 1),
('Lisa Brown', '(555) 444-5555', 'follow_up', 'medium', '2024-02-20 16:20:00', 10, 'Follow-up call for client discharged last week', 'Scheduled aftercare appointment', FALSE, NULL, 'completed', 3),
('Robert Wilson', '(555) 555-6666', 'referral', 'medium', '2024-02-20 18:30:00', 20, 'Referral from hospital ER, client needs detox', 'Arranged admission for tomorrow', TRUE, '2024-02-21', 'in_progress', 4),
('Jennifer Davis', '(555) 666-7777', 'inquiry', 'low', '2024-02-20 20:15:00', 6, 'Family member seeking information about family program', 'Provided program details and contact information', FALSE, NULL, 'completed', 5),
('Thomas Anderson', '(555) 777-8888', 'emergency', 'critical', '2024-02-21 02:30:00', 18, 'Overdose situation, client needs immediate medical intervention', 'Emergency services dispatched, client transported to hospital', TRUE, '2024-02-21', 'completed', 6),
('Maria Garcia', '(555) 888-9999', 'inquiry', 'low', '2024-02-21 09:45:00', 7, 'Insurance verification and program cost inquiry', 'Provided cost breakdown and insurance information', FALSE, NULL, 'completed', 2);

-- Insert Intake Assessments
INSERT INTO intake_assessments (intake_call_id, client_id, assessment_date, primary_substance, usage_frequency, last_use_date, withdrawal_symptoms, medical_history, mental_health_history, legal_status, insurance_verified, recommended_program, assessment_notes) VALUES
(1, 10, '2024-02-20 09:00:00', 'Heroin', 'Daily for 2 years', '2024-02-19', 'Severe withdrawal symptoms, nausea, anxiety', 'Hypertension, diabetes', 'Depression, anxiety', 'No pending legal issues', TRUE, 1, 'Immediate medical detox required'),
(3, NULL, '2024-02-20 15:00:00', 'Alcohol', 'Heavy daily use', '2024-02-20', 'Mild withdrawal, tremors', 'Liver disease', 'Bipolar disorder', 'DUI pending', FALSE, 1, 'Crisis intervention completed, safety plan in place'),
(5, NULL, '2024-02-20 19:00:00', 'Methamphetamine', 'Daily for 6 months', '2024-02-19', 'Paranoia, insomnia', 'None significant', 'Anxiety', 'No legal issues', TRUE, 4, 'Medical detox recommended'),
(7, NULL, '2024-02-21 03:00:00', 'Fentanyl', 'Multiple times daily', '2024-02-21', 'Overdose symptoms', 'None', 'Depression', 'No legal issues', FALSE, 4, 'Emergency medical intervention required');

-- Insert Case Files
INSERT INTO case_files (client_id, file_type, title, description, file_path, file_size, uploaded_by, status) VALUES
(1, 'intake', 'Initial Assessment - Sarah Johnson', 'Complete intake assessment and medical history', '/files/intake/CLI001_intake.pdf', 2048576, 1, 'active'),
(1, 'treatment_plan', 'Treatment Plan - Sarah Johnson', 'Individualized treatment plan and goals', '/files/treatment/CLI001_plan.pdf', 1536000, 1, 'active'),
(2, 'intake', 'Initial Assessment - Michael Chen', 'Intake assessment and family history', '/files/intake/CLI002_intake.pdf', 1873408, 2, 'active'),
(2, 'progress_note', 'Progress Note - Michael Chen Week 2', 'Weekly progress assessment and observations', '/files/progress/CLI002_week2.pdf', 1024000, 2, 'active'),
(3, 'discharge', 'Discharge Summary - Emily Rodriguez', 'Complete discharge summary and aftercare plan', '/files/discharge/CLI003_discharge.pdf', 2560000, 1, 'active'),
(4, 'intake', 'Initial Assessment - David Thompson', 'Comprehensive intake evaluation', '/files/intake/CLI004_intake.pdf', 2097152, 3, 'active'),
(5, 'assessment', 'Psychiatric Evaluation - Lisa Wang', 'Initial psychiatric assessment and diagnosis', '/files/assessment/CLI005_psych.pdf', 3145728, 1, 'active'),
(6, 'legal', 'Legal Documentation - Robert Davis', 'Court documents and legal requirements', '/files/legal/CLI006_legal.pdf', 1048576, 4, 'active'),
(7, 'medical', 'Medical Records - Amanda Wilson', 'Medical history and current medications', '/files/medical/CLI007_medical.pdf', 4194304, 3, 'active'),
(8, 'progress_note', 'Progress Note - Christopher Brown Week 4', 'Monthly progress assessment', '/files/progress/CLI008_week4.pdf', 1536000, 2, 'active');

-- Insert Progress Notes
INSERT INTO progress_notes (client_id, session_id, staff_id, note_date, note_type, mood_rating, anxiety_level, cravings_level, content, goals_met, next_steps) VALUES
(1, 2, 1, '2024-02-19', 'session', 7, 4, 3, 'Client showed improved mood and engagement. Discussed coping strategies for stress management. Client reported using breathing exercises successfully.', TRUE, 'Continue practicing coping skills, schedule family session'),
(2, NULL, 2, '2024-02-19', 'weekly', 6, 5, 4, 'Weekly check-in completed. Client attending all scheduled sessions. Some anxiety about returning to work. Discussed relapse prevention strategies.', TRUE, 'Focus on work-related stress management'),
(3, 9, 1, '2024-02-19', 'session', 8, 2, 1, 'Aftercare follow-up session. Client maintaining sobriety successfully. Discussed ongoing support needs and future goals.', TRUE, 'Continue monthly check-ins'),
(4, NULL, 3, '2024-02-19', 'daily', 5, 6, 5, 'Daily assessment completed. Client experiencing some withdrawal symptoms but managing well with medication. Participating in group activities.', FALSE, 'Monitor withdrawal symptoms, continue medication'),
(5, 5, 1, '2024-02-20', 'session', 4, 7, 6, 'Initial psychiatric evaluation completed. Client presents with anxiety and depression. Recommended medication management and therapy.', FALSE, 'Begin medication, schedule therapy sessions'),
(6, NULL, 2, '2024-02-19', 'weekly', 6, 4, 3, 'Weekly progress note. Client making steady progress in group therapy. Showing improved communication skills and self-awareness.', TRUE, 'Continue group participation, individual therapy'),
(7, NULL, 5, '2024-02-19', 'weekly', 5, 5, 4, 'Weekly assessment. Client adjusting to outpatient program. Some challenges with medication compliance. Working on establishing routine.', FALSE, 'Medication compliance monitoring, routine establishment'),
(8, NULL, 2, '2024-02-19', 'weekly', 7, 3, 2, 'Excellent progress this week. Client actively participating in all activities. Showing strong commitment to recovery. Family support is strong.', TRUE, 'Continue current treatment plan'),
(9, NULL, 1, '2024-02-19', 'monthly', 8, 2, 1, 'Monthly aftercare check-in. Client maintaining sobriety and attending support groups regularly. Employment and housing stable.', TRUE, 'Continue aftercare program'),
(10, NULL, 3, '2024-02-20', 'daily', 3, 8, 7, 'New admission assessment. Client in early stages of withdrawal. Medical monitoring required. Beginning to engage in treatment.', FALSE, 'Medical monitoring, gradual engagement in therapy');

-- Insert Medications
INSERT INTO medications (client_id, medication_name, dosage, frequency, prescribed_by, prescription_date, end_date, status, notes) VALUES
(1, 'Naltrexone', '50mg', 'Once daily', 'Dr. Sarah McCormick', '2024-01-15', '2024-07-15', 'active', 'For alcohol cravings'),
(2, 'Buprenorphine', '8mg', 'Twice daily', 'Dr. Sarah McCormick', '2024-02-01', '2024-08-01', 'active', 'For opioid withdrawal'),
(4, 'Diazepam', '5mg', 'As needed', 'Emily Chen', '2024-01-30', '2024-03-30', 'active', 'For withdrawal symptoms'),
(5, 'Sertraline', '50mg', 'Once daily', 'Dr. Sarah McCormick', '2024-02-10', '2024-08-10', 'active', 'For depression and anxiety'),
(6, 'Methadone', '30mg', 'Once daily', 'Emily Chen', '2024-01-25', '2024-07-25', 'active', 'For opioid maintenance'),
(7, 'Bupropion', '150mg', 'Twice daily', 'Dr. Sarah McCormick', '2024-02-05', '2024-08-05', 'active', 'For depression and smoking cessation'),
(8, 'Naltrexone', '50mg', 'Once daily', 'Dr. Sarah McCormick', '2024-01-20', '2024-07-20', 'active', 'For opioid cravings'),
(10, 'Methadone', '40mg', 'Once daily', 'Emily Chen', '2024-02-15', '2024-08-15', 'active', 'For heroin withdrawal');

-- Insert Notifications
INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
(1, 'New Emergency Intake', 'Emergency intake call received from John Doe', 'emergency', FALSE),
(2, 'Session Reminder', 'Individual therapy session with Sarah Johnson in 30 minutes', 'info', FALSE),
(3, 'Medication Review Due', 'Monthly medication review for 5 clients due today', 'warning', FALSE),
(4, 'Group Session', 'Group therapy session starting in 15 minutes', 'info', FALSE),
(5, 'Client Progress Update', 'Lisa Wang completed initial assessment', 'success', FALSE),
(6, 'Medical Alert', 'David Thompson showing withdrawal symptoms', 'warning', FALSE),
(7, 'Art Therapy Session', 'Art therapy session scheduled for tomorrow', 'info', FALSE),
(8, '12-Step Meeting', 'AA meeting tonight at 7 PM', 'info', FALSE);

-- Insert Activity Log
INSERT INTO activity_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) VALUES
(1, 'CREATE', 'clients', 1, NULL, '{"first_name": "Sarah", "last_name": "Johnson"}', '192.168.1.100', 'Mozilla/5.0'),
(2, 'UPDATE', 'clients', 2, '{"progress_percentage": 50}', '{"progress_percentage": 60}', '192.168.1.101', 'Mozilla/5.0'),
(3, 'CREATE', 'sessions', 1, NULL, '{"session_type": "group", "title": "CBT Group"}', '192.168.1.102', 'Mozilla/5.0'),
(4, 'UPDATE', 'staff', 4, '{"availability_status": "available"}', '{"availability_status": "on_call"}', '192.168.1.103', 'Mozilla/5.0'),
(5, 'CREATE', 'intake_calls', 1, NULL, '{"call_type": "emergency", "urgency_level": "critical"}', '192.168.1.104', 'Mozilla/5.0'),
(1, 'UPDATE', 'clients', 3, '{"status": "active"}', '{"status": "aftercare"}', '192.168.1.100', 'Mozilla/5.0'),
(2, 'CREATE', 'progress_notes', 1, NULL, '{"note_type": "session", "content": "Client showed improved mood"}', '192.168.1.101', 'Mozilla/5.0'),
(3, 'UPDATE', 'medications', 1, '{"dosage": "25mg"}', '{"dosage": "50mg"}', '192.168.1.102', 'Mozilla/5.0');

-- Update some sessions to completed status for today
UPDATE sessions SET status = 'completed' WHERE scheduled_date = '2024-02-20' AND scheduled_time < NOW();

-- Update some session participants to attended
UPDATE session_participants SET attendance_status = 'attended' 
WHERE session_id IN (SELECT id FROM sessions WHERE status = 'completed');

-- Insert additional system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('center_address', '123 Recovery Way, Healing City, ST 12345', 'string', 'Physical address of the recovery center'),
('center_phone', '(555) 123-4567', 'string', 'Main phone number for the center'),
('center_email', 'info@newlife.com', 'string', 'General contact email'),
('business_hours', '{"monday": "8:00-20:00", "tuesday": "8:00-20:00", "wednesday": "8:00-20:00", "thursday": "8:00-20:00", "friday": "8:00-18:00", "saturday": "9:00-17:00", "sunday": "9:00-17:00"}', 'json', 'Business hours for each day'),
('emergency_after_hours', '(555) 999-8888', 'string', 'After-hours emergency contact'),
('max_session_duration', '120', 'integer', 'Maximum session duration in minutes'),
('min_session_duration', '30', 'integer', 'Minimum session duration in minutes'),
('auto_logout_minutes', '30', 'integer', 'Automatic logout after inactivity in minutes'),
('data_retention_years', '7', 'integer', 'How long to retain client data in years'),
('backup_frequency_hours', '24', 'integer', 'Database backup frequency in hours'),
('notification_retention_days', '30', 'integer', 'How long to keep notifications in days');

-- Create some additional emergency contacts
INSERT INTO emergency_contacts (name, phone, relationship, is_primary) VALUES
('Poison Control', '(800) 222-1222', 'Poison Control Center', FALSE),
('Suicide Prevention', '(800) 273-8255', 'National Suicide Prevention Lifeline', FALSE),
('Domestic Violence', '(800) 799-7233', 'National Domestic Violence Hotline', FALSE),
('SAMHSA Helpline', '(800) 662-4357', 'Substance Abuse and Mental Health Services', FALSE);

-- Update client progress percentages to be more realistic
UPDATE clients SET progress_percentage = 85 WHERE id = 3; -- Emily Rodriguez (aftercare)
UPDATE clients SET progress_percentage = 65 WHERE id = 6; -- Robert Davis
UPDATE clients SET progress_percentage = 80 WHERE id = 8; -- Christopher Brown
UPDATE clients SET progress_percentage = 90 WHERE id = 9; -- Jessica Taylor (aftercare)

-- Update staff availability to be more realistic
UPDATE staff SET availability_status = 'in_session' WHERE id = 2; -- Michael Rodriguez
UPDATE staff SET availability_status = 'on_call' WHERE id = 4; -- David Thompson
UPDATE staff SET availability_status = 'off_duty' WHERE id = 7; -- Maria Garcia

-- Mark some intake calls as completed
UPDATE intake_calls SET status = 'completed' WHERE id IN (1, 2, 3, 4, 6, 7, 8);

-- Update some case files to different statuses
UPDATE case_files SET status = 'pending_review' WHERE id = 5; -- Emily's discharge summary
UPDATE case_files SET status = 'archived' WHERE id = 9; -- Jessica's medical records

-- Insert some additional progress notes for variety
INSERT INTO progress_notes (client_id, staff_id, note_date, note_type, mood_rating, anxiety_level, cravings_level, content, goals_met, next_steps) VALUES
(1, 2, '2024-02-18', 'daily', 6, 5, 4, 'Daily check-in completed. Client reported good sleep and appetite. Participated in morning group session.', TRUE, 'Continue daily routine'),
(2, 5, '2024-02-18', 'weekly', 7, 3, 2, 'Weekly family therapy session. Family dynamics improving. Communication skills developing well.', TRUE, 'Continue family sessions'),
(4, 3, '2024-02-18', 'daily', 4, 7, 6, 'Withdrawal symptoms present but manageable. Medication compliance good. Needs additional support.', FALSE, 'Increase monitoring, additional medication if needed'),
(6, 2, '2024-02-18', 'daily', 5, 4, 3, 'Daily assessment completed. Client engaging well in activities. Some anxiety about upcoming family visit.', TRUE, 'Prepare for family visit, anxiety management'),
(8, 1, '2024-02-18', 'weekly', 8, 2, 1, 'Excellent week of progress. Client showing strong commitment to recovery. All goals met this week.', TRUE, 'Continue current treatment plan');

-- Update some sessions to have more realistic participant counts
UPDATE sessions SET max_participants = 15 WHERE session_type = 'group';
UPDATE sessions SET max_participants = 25 WHERE session_type = '12-Step Meeting';

-- Insert additional session participants for group sessions
INSERT INTO session_participants (session_id, client_id, staff_id, role, attendance_status) VALUES
(1, 5, NULL, 'client', 'scheduled'),
(1, 7, NULL, 'client', 'scheduled'),
(3, 5, NULL, 'client', 'scheduled'),
(3, 7, NULL, 'client', 'scheduled'),
(3, 9, NULL, 'client', 'scheduled'),
(6, 2, NULL, 'client', 'scheduled'),
(6, 4, NULL, 'client', 'scheduled'),
(6, 6, NULL, 'client', 'scheduled'),
(6, 8, NULL, 'client', 'scheduled'),
(8, 1, NULL, 'client', 'scheduled'),
(8, 2, NULL, 'client', 'scheduled'),
(8, 4, NULL, 'client', 'scheduled'),
(8, 5, NULL, 'client', 'scheduled'),
(8, 6, NULL, 'client', 'scheduled'),
(8, 7, NULL, 'client', 'scheduled'),
(8, 8, NULL, 'client', 'scheduled'),
(8, NULL, 8, 'therapist', 'scheduled');

-- Final statistics update
SELECT 'Dummy data insertion completed successfully!' AS status;
SELECT COUNT(*) AS total_clients FROM clients;
SELECT COUNT(*) AS total_staff FROM staff;
SELECT COUNT(*) AS total_sessions FROM sessions;
SELECT COUNT(*) AS total_intake_calls FROM intake_calls; 
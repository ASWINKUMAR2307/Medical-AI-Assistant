const { PrismaClient, UserRole, AppointmentStatus, TriagePriority, TriageStatus, MedicalRecordType } = require('../generated/prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'workspace-main' },
    update: {},
    create: {
      id: 'workspace-main',
      name: 'Dhaka Care Network',
      description: 'Primary healthcare network for Dhaka metropolitan area',
      address: '123 Healthcare Avenue, Dhaka 1000, Bangladesh',
      phone: '+880-2-555-0100',
      email: 'info@dhakacarenetwork.org',
    },
  })
  console.log('✅ Workspace created')

  // Hash password for demo accounts
  const passwordHash = await bcrypt.hash('demo123', 12)

  // Create demo users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mediassist.ai' },
    update: {},
    create: {
      email: 'admin@mediassist.ai',
      name: 'Ashik Kumar',
      passwordHash,
      role: UserRole.ADMIN,
      department: 'Administration',
      workspaceId: workspace.id,
    },
  })

  const doctor1 = await prisma.user.upsert({
    where: { email: 'dr.rahman@mediassist.ai' },
    update: {},
    create: {
      email: 'dr.rahman@mediassist.ai',
      name: 'Dr. Farhan Rahman',
      passwordHash,
      role: UserRole.DOCTOR,
      department: 'Cardiology',
      specialization: 'Cardiology',
      licenseNumber: 'MD-BD-001234',
      workspaceId: workspace.id,
    },
  })

  const doctor2 = await prisma.user.upsert({
    where: { email: 'dr.islam@mediassist.ai' },
    update: {},
    create: {
      email: 'dr.islam@mediassist.ai',
      name: 'Dr. Ayesha Islam',
      passwordHash,
      role: UserRole.DOCTOR,
      department: 'Neurology',
      specialization: 'Neurology',
      licenseNumber: 'MD-BD-001235',
      workspaceId: workspace.id,
    },
  })

  const doctor3 = await prisma.user.upsert({
    where: { email: 'dr.hassan@mediassist.ai' },
    update: {},
    create: {
      email: 'dr.hassan@mediassist.ai',
      name: 'Dr. Mahmud Hassan',
      passwordHash,
      role: UserRole.DOCTOR,
      department: 'General Medicine',
      specialization: 'Internal Medicine',
      licenseNumber: 'MD-BD-001236',
      workspaceId: workspace.id,
    },
  })

  const clinician1 = await prisma.user.upsert({
    where: { email: 'clinician.karim@mediassist.ai' },
    update: {},
    create: {
      email: 'clinician.karim@mediassist.ai',
      name: 'Karim Uddin',
      passwordHash,
      role: UserRole.CLINICIAN,
      department: 'Emergency',
      workspaceId: workspace.id,
    },
  })

  const clinician2 = await prisma.user.upsert({
    where: { email: 'clinician.begum@mediassist.ai' },
    update: {},
    create: {
      email: 'clinician.begum@mediassist.ai',
      name: 'Fatima Begum',
      passwordHash,
      role: UserRole.CLINICIAN,
      department: 'Triage',
      workspaceId: workspace.id,
    },
  })

  const nurse1 = await prisma.user.upsert({
    where: { email: 'nurse.akter@mediassist.ai' },
    update: {},
    create: {
      email: 'nurse.akter@mediassist.ai',
      name: 'Shahana Akter',
      passwordHash,
      role: UserRole.NURSE,
      department: 'Ward 1',
      workspaceId: workspace.id,
    },
  })

  const coordinator1 = await prisma.user.upsert({
    where: { email: 'coordinator.das@mediassist.ai' },
    update: {},
    create: {
      email: 'coordinator.das@mediassist.ai',
      name: 'Rajesh Das',
      passwordHash,
      role: UserRole.CARE_COORDINATOR,
      department: 'Patient Services',
      workspaceId: workspace.id,
    },
  })

  console.log('✅ Demo users created')

  // Create doctor profiles
  await prisma.doctor.upsert({
    where: { userId: doctor1.id },
    update: {},
    create: {
      userId: doctor1.id,
      workspaceId: workspace.id,
      specialization: 'Cardiology',
      licenseNumber: 'MD-BD-001234',
      availability: true,
      maxAppointmentsPerDay: 15,
    },
  })

  await prisma.doctor.upsert({
    where: { userId: doctor2.id },
    update: {},
    create: {
      userId: doctor2.id,
      workspaceId: workspace.id,
      specialization: 'Neurology',
      licenseNumber: 'MD-BD-001235',
      availability: true,
      maxAppointmentsPerDay: 12,
    },
  })

  await prisma.doctor.upsert({
    where: { userId: doctor3.id },
    update: {},
    create: {
      userId: doctor3.id,
      workspaceId: workspace.id,
      specialization: 'Internal Medicine',
      licenseNumber: 'MD-BD-001236',
      availability: true,
      maxAppointmentsPerDay: 20,
    },
  })

  console.log('✅ Doctor profiles created')

  // Create patients
  const patients = []
  const patientData = [
    { patientId: 'PAT-001', firstName: 'Mohammad', lastName: 'Ali', age: 45, gender: 'Male', phone: '+880-17-1234-5678', email: 'm.ali@email.com', bloodType: 'O+', assignedDoctorId: doctor1.id },
    { patientId: 'PAT-002', firstName: 'Rahima', lastName: 'Khatun', age: 32, gender: 'Female', phone: '+880-18-2345-6789', email: 'r.khatun@email.com', bloodType: 'A+', assignedDoctorId: doctor2.id },
    { patientId: 'PAT-003', firstName: 'Abdul', lastName: 'Karim', age: 67, gender: 'Male', phone: '+880-19-3456-7890', email: 'a.karim@email.com', bloodType: 'B+', assignedDoctorId: doctor3.id },
    { patientId: 'PAT-004', firstName: 'Nasima', lastName: 'Akter', age: 28, gender: 'Female', phone: '+880-16-4567-8901', email: 'n.akter@email.com', bloodType: 'AB+', assignedDoctorId: doctor1.id },
    { patientId: 'PAT-005', firstName: 'Kamal', lastName: 'Hossain', age: 54, gender: 'Male', phone: '+880-15-5678-9012', email: 'k.hossain@email.com', bloodType: 'O-', assignedDoctorId: doctor2.id },
    { patientId: 'PAT-006', firstName: 'Sultana', lastName: 'Rahman', age: 39, gender: 'Female', phone: '+880-13-6789-0123', email: 's.rahman@email.com', bloodType: 'A-', assignedDoctorId: doctor3.id },
    { patientId: 'PAT-007', firstName: 'Rafiq', lastName: 'Islam', age: 72, gender: 'Male', phone: '+880-14-7890-1234', email: 'r.islam@email.com', bloodType: 'B-', assignedDoctorId: doctor1.id },
    { patientId: 'PAT-008', firstName: 'Farida', lastName: 'Yasmin', age: 31, gender: 'Female', phone: '+880-17-8901-2345', email: 'f.yasmin@email.com', bloodType: 'AB-', assignedDoctorId: doctor2.id },
    { patientId: 'PAT-009', firstName: 'Jamal', lastName: 'Uddin', age: 48, gender: 'Male', phone: '+880-18-9012-3456', email: 'j.uddin@email.com', bloodType: 'O+', assignedDoctorId: doctor3.id },
    { patientId: 'PAT-010', firstName: 'Ayesha', lastName: 'Siddiqua', age: 26, gender: 'Female', phone: '+880-19-0123-4567', email: 'a.siddiqua@email.com', bloodType: 'A+', assignedDoctorId: doctor1.id },
    { patientId: 'PAT-011', firstName: 'Hasan', lastName: 'Mahmud', age: 59, gender: 'Male', phone: '+880-16-1234-5678', email: 'h.mahmud@email.com', bloodType: 'B+', assignedDoctorId: doctor2.id },
    { patientId: 'PAT-012', firstName: 'Salma', lastName: 'Khan', age: 35, gender: 'Female', phone: '+880-15-2345-6789', email: 's.khan@email.com', bloodType: 'AB+', assignedDoctorId: doctor3.id },
    { patientId: 'PAT-013', firstName: 'Ibrahim', lastName: 'Khalil', age: 62, gender: 'Male', phone: '+880-13-3456-7890', email: 'i.khalil@email.com', bloodType: 'O-', assignedDoctorId: doctor1.id },
    { patientId: 'PAT-014', firstName: 'Tahmina', lastName: 'Islam', age: 41, gender: 'Female', phone: '+880-14-4567-8901', email: 't.islam@email.com', bloodType: 'A-', assignedDoctorId: doctor2.id },
    { patientId: 'PAT-015', firstName: 'Nasir', lastName: 'Ahmed', age: 33, gender: 'Male', phone: '+880-17-5678-9012', email: 'n.ahmed@email.com', bloodType: 'B-', assignedDoctorId: doctor3.id },
  ]

  for (const p of patientData) {
    const dob = new Date()
    dob.setFullYear(dob.getFullYear() - p.age)
    
    const patient = await prisma.patient.upsert({
      where: { patientId: p.patientId },
      update: {},
      create: {
        patientId: p.patientId,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: dob,
        gender: p.gender,
        phone: p.phone,
        email: p.email,
        address: `House ${Math.floor(Math.random() * 100) + 1}, Road ${Math.floor(Math.random() * 20) + 1}, Dhaka`,
        emergencyContactName: `${p.firstName} Emergency Contact`,
        emergencyContactPhone: `+880-1${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 9000000) + 1000000}`,
        bloodType: p.bloodType,
        allergies: p.patientId === 'PAT-001' ? 'Penicillin' : p.patientId === 'PAT-003' ? 'Sulfa drugs' : null,
        medicalHistory: p.patientId === 'PAT-001' ? 'Hypertension, Type 2 Diabetes' : 
                        p.patientId === 'PAT-003' ? 'Previous MI, COPD' :
                        p.patientId === 'PAT-005' ? 'Hyperlipidemia' : null,
        status: 'active',
        workspaceId: workspace.id,
        assignedDoctorId: p.assignedDoctorId,
      },
    })
    patients.push(patient)
  }
  console.log('✅ Patients created')

  // Create appointments
  const now = new Date()
  const appointments = []
  
  for (let i = 0; i < 30; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)]
    const doctor = await prisma.doctor.findFirst({ where: { userId: patient.assignedDoctorId || '' } })
    if (!doctor) continue
    
    const scheduledAt = new Date(now)
    scheduledAt.setDate(scheduledAt.getDate() + Math.floor(Math.random() * 14) - 7) // +/- 7 days
    scheduledAt.setHours(8 + Math.floor(Math.random() * 10), Math.random() > 0.5 ? 0 : 30, 0, 0)
    
    const statuses = Object.values(AppointmentStatus)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const appointment = await prisma.appointment.create({
      data: {
        appointmentId: `APT-${String(i + 1).padStart(3, '0')}`,
        patientId: patient.id,
        doctorId: doctor.id,
        workspaceId: workspace.id,
        scheduledAt,
        duration: 30,
        status,
        reason: getRandomReason(),
        notes: Math.random() > 0.7 ? 'Patient requested follow-up' : null,
        createdById: admin.id,
        assignedDoctorId: doctor.userId,
      },
    })
    appointments.push(appointment)
  }
  console.log('✅ Appointments created')

  // Create consultations (completed appointments)
  const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED)
  for (const appt of completedAppointments.slice(0, 15)) {
    const doctor = await prisma.user.findUnique({ where: { id: appt.doctorId } })
    if (!doctor) continue
    
    await prisma.consultation.create({
      data: {
        consultationId: `CON-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        patientId: appt.patientId,
        doctorId: doctor.id,
        appointmentId: appt.id,
        startedAt: appt.scheduledAt,
        endedAt: new Date(appt.scheduledAt.getTime() + 30 * 60000),
        chiefComplaint: appt.reason || 'Follow-up consultation',
        diagnosis: getRandomDiagnosis(),
        treatmentPlan: 'Medication prescribed, follow-up in 2 weeks',
        notes: 'Patient responding well to treatment',
      },
    })
  }
  console.log('✅ Consultations created')

  // Create medical records
  const recordTypes = Object.values(MedicalRecordType)
  for (let i = 0; i < 40; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)]
    const clinicians = [doctor1, doctor2, doctor3, clinician1, clinician2]
    const clinician = clinicians[Math.floor(Math.random() * clinicians.length)]
    
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90))
    
    await prisma.medicalRecord.create({
      data: {
        recordId: `REC-${String(i + 1).padStart(3, '0')}`,
        patientId: patient.id,
        clinicianId: clinician.id,
        type: recordTypes[Math.floor(Math.random() * recordTypes.length)],
        title: getRandomRecordTitle(),
        description: 'Medical record generated during consultation',
        content: JSON.stringify({ findings: 'Normal', notes: 'Patient stable' }),
        attachments: JSON.stringify([]),
        tags: JSON.stringify(['consultation', 'follow-up']),
        isConfidential: Math.random() > 0.8,
        createdAt,
      },
    })
  }
  console.log('✅ Medical records created')

  // Create triage cases
  const triagePriorities = Object.values(TriagePriority)
  const triageStatuses = Object.values(TriageStatus)
  const presentingConcerns = [
    'Chest pain radiating to left arm',
    'Severe headache with visual disturbances',
    'Shortness of breath at rest',
    'Acute abdominal pain',
    'High fever with confusion',
    'Sudden weakness on one side',
    'Persistent vomiting and dehydration',
    'Severe allergic reaction',
    'Back pain with numbness in legs',
    'Palpitations and dizziness',
    'Minor cut requiring dressing',
    'Routine medication refill',
    'Follow-up for chronic condition',
    'Mild cold symptoms',
    'Skin rash evaluation',
  ]
  
  for (let i = 0; i < 25; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)]
    const priority = triagePriorities[Math.floor(Math.random() * triagePriorities.length)]
    const status = triageStatuses[Math.floor(Math.random() * triageStatuses.length)]
    
    const submittedAt = new Date(now)
    submittedAt.setDate(submittedAt.getDate() - Math.floor(Math.random() * 14))
    submittedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
    
    const clinicians = [clinician1, clinician2, doctor1, doctor2]
    const assignedClinician = clinicians[Math.floor(Math.random() * clinicians.length)]
    
    const triageCase = await prisma.triageCase.create({
      data: {
        caseId: `TRI-${String(i + 1).padStart(3, '0')}`,
        patientId: patient.id,
        workspaceId: workspace.id,
        submittedAt,
        presentingConcern: presentingConcerns[Math.floor(Math.random() * presentingConcerns.length)],
        symptoms: JSON.stringify(['symptom1', 'symptom2'].slice(0, Math.floor(Math.random() * 3) + 1)),
        vitalSigns: {
          heartRate: 60 + Math.floor(Math.random() * 60),
          bloodPressure: `${90 + Math.floor(Math.random() * 40)}/${60 + Math.floor(Math.random() * 30)}`,
          temperature: 36.5 + Math.random() * 2,
          oxygenSaturation: 95 + Math.floor(Math.random() * 5),
          respiratoryRate: 12 + Math.floor(Math.random() * 10),
        },
        aiAssessment: priority,
        aiReasoning: `AI assessment based on presenting symptoms and vital signs. Patient presents with ${presentingConcerns[Math.floor(Math.random() * presentingConcerns.length)].toLowerCase()}.`,
        aiConfidence: 0.7 + Math.random() * 0.25,
        riskIndicators: JSON.stringify(priority === TriagePriority.URGENT ? ['hemodynamic instability', 'altered mental status'] : 
                        priority === TriagePriority.PRIORITY ? ['significant pain', 'abnormal vitals'] : []),
        recommendedAction: priority === TriagePriority.URGENT ? 'Immediate physician evaluation required' :
                          priority === TriagePriority.PRIORITY ? 'Physician evaluation within 30 minutes' :
                          priority === TriagePriority.STANDARD ? 'Standard evaluation within 2 hours' :
                          'Self-care advice, follow-up if symptoms worsen',
        status,
        assignedClinicianId: assignedClinician.id,
        reviewedAt: status !== TriageStatus.PENDING ? new Date(submittedAt.getTime() + Math.random() * 3600000) : null,
        reviewedById: status !== TriageStatus.PENDING ? assignedClinician.id : null,
        clinicianNotes: status !== TriageStatus.PENDING ? 'Reviewed and confirmed AI assessment' : null,
        finalPriority: status !== TriageStatus.PENDING ? priority : null,
      },
    })

    // Create review if not pending
    if (status !== TriageStatus.PENDING) {
      await prisma.triageReview.create({
        data: {
          triageCaseId: triageCase.id,
          reviewerId: assignedClinician.id,
          action: status === TriageStatus.APPROVED ? 'APPROVED' : 
                  status === TriageStatus.OVERRIDDEN ? 'OVERRIDDEN' : 
                  status === TriageStatus.RESOLVED ? 'RESOLVED' : 'REQUEST_REVIEW',
          previousPriority: priority,
          newPriority: status === TriageStatus.OVERRIDDEN ? 
            triagePriorities[Math.floor(Math.random() * triagePriorities.length)] : priority,
          notes: status === TriageStatus.OVERRIDDEN ? 'Clinician overrode AI assessment based on additional findings' : 'Confirmed AI assessment',
        },
      })
    }
  }
  console.log('✅ Triage cases created')

  // Create notifications
  const notificationTypes = ['triage_urgent', 'appointment_reminder', 'review_required', 'system_alert']
  for (let i = 0; i < 15; i++) {
    const users = [admin, doctor1, doctor2, doctor3, clinician1, clinician2]
    const user = users[Math.floor(Math.random() * users.length)]
    
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
        title: getRandomNotificationTitle(),
        message: 'This is a sample notification message for testing purposes.',
        entityId: patients[Math.floor(Math.random() * patients.length)].id,
        entityType: 'Patient',
        isRead: Math.random() > 0.5,
        createdAt: new Date(now.getTime() - Math.random() * 86400000 * 7),
      },
    })
  }
  console.log('✅ Notifications created')

  // Create audit logs
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'REVIEW', 'OVERRIDE']
  const entities = ['Patient', 'Appointment', 'TriageCase', 'MedicalRecord', 'User']
  const allUsers = [admin, doctor1, doctor2, doctor3, clinician1, clinician2, nurse1, coordinator1]
  
  for (let i = 0; i < 50; i++) {
    const actor = allUsers[Math.floor(Math.random() * allUsers.length)]
    const entity = entities[Math.floor(Math.random() * entities.length)]
    
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: actions[Math.floor(Math.random() * actions.length)],
        entity,
        entityId: entity === 'Patient' ? patients[Math.floor(Math.random() * patients.length)].id :
                  entity === 'Appointment' ? appointments[Math.floor(Math.random() * appointments.length)].id :
                  `entity-${i}`,
        metadata: { source: 'seed', test: true },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Seed Script)',
        createdAt: new Date(now.getTime() - Math.random() * 86400000 * 30),
      },
    })
  }
  console.log('✅ Audit logs created')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Demo Login Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:     admin@mediassist.ai / demo123')
  console.log('Doctor:    dr.rahman@mediassist.ai / demo123')
  console.log('Doctor:    dr.islam@mediassist.ai / demo123')
  console.log('Doctor:    dr.hassan@mediassist.ai / demo123')
  console.log('Clinician: clinician.karim@mediassist.ai / demo123')
  console.log('Clinician: clinician.begum@mediassist.ai / demo123')
  console.log('Nurse:     nurse.akter@mediassist.ai / demo123')
  console.log('Coordinator: coordinator.das@mediassist.ai / demo123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

function getRandomReason() {
  const reasons = [
    'Routine check-up',
    'Follow-up consultation',
    'Chest pain evaluation',
    'Headache assessment',
    'Blood pressure monitoring',
    'Diabetes management',
    'Medication review',
    'Pre-operative assessment',
    'Post-operative follow-up',
    'Vaccination',
    'Health screening',
    'Chronic disease management',
  ]
  return reasons[Math.floor(Math.random() * reasons.length)]
}

function getRandomDiagnosis() {
  const diagnoses = [
    'Essential hypertension',
    'Type 2 diabetes mellitus',
    'Acute bronchitis',
    'Viral upper respiratory infection',
    'Musculoskeletal chest pain',
    'Tension headache',
    'Gastroesophageal reflux disease',
    'Osteoarthritis',
    'Anxiety disorder',
    'Iron deficiency anemia',
    'Hyperlipidemia',
    'Hypothyroidism',
  ]
  return diagnoses[Math.floor(Math.random() * diagnoses.length)]
}

function getRandomRecordTitle() {
  const titles = [
    'Consultation Note',
    'Clinical Assessment',
    'Lab Results - CBC',
    'Lab Results - Lipid Panel',
    'ECG Report',
    'Chest X-Ray Report',
    'Medication Prescription',
    'Referral Letter',
    'Discharge Summary',
    'Progress Note',
    'Nursing Assessment',
    'Physical Therapy Note',
  ]
  return titles[Math.floor(Math.random() * titles.length)]
}

function getRandomNotificationTitle() {
  const titles = [
    'Urgent triage case requires review',
    'Appointment reminder for tomorrow',
    'New patient registered',
    'Lab results available',
    'Medication refill needed',
    'Schedule change notification',
    'System maintenance scheduled',
    'New clinical guideline published',
  ]
  return titles[Math.floor(Math.random() * titles.length)]
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
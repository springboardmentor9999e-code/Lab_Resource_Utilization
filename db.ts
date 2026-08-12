import pg from 'pg';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Lab, 
  Equipment, 
  Booking, 
  MaintenanceTicket, 
  CalibrationRecord, 
  SafetyChecklist, 
  ActivityLog, 
  NotificationItem,
  MaintenanceSchedule
} from './src/types';

import { 
  initialUsers, 
  initialLabs, 
  initialEquipment, 
  initialBookings, 
  initialTickets, 
  initialCalibrations, 
  initialSafetyChecklists, 
  initialActivityLogs, 
  initialNotifications,
  initialMaintenanceSchedules
} from './src/data/initialData';

const { Pool } = pg;

// Flag to track fallback
export let isInMemoryMode = false;

// Connection Pool Configuration
let pool: pg.Pool | null = null;

// In-Memory Database Fallbacks
export let usersMem: (User & { passwordHash: string })[] = [];
export let chatMessagesMem: any[] = [
  {
    id: "msg-1",
    senderId: "user-admin",
    senderName: "Dr. Arthur Vance",
    senderRole: "admin",
    text: "Welcome to the Central LabSync Communication space! Coordinate classes, report equipment malfunctions, or chat directly with colleagues.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "msg-2",
    senderId: "user-tech-rajesh",
    senderName: "Mr. Rajesh Kumar",
    senderRole: "lab_technician",
    text: "Just completed safety audits for all ECE labs. Scores look excellent!",
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
];
export let labsMem: Lab[] = [...initialLabs];
export let equipmentMem: Equipment[] = [...initialEquipment];
export let bookingsMem: Booking[] = [...initialBookings];
export let ticketsMem: MaintenanceTicket[] = [...initialTickets];
export let calibrationsMem: CalibrationRecord[] = [...initialCalibrations];
export let safetyChecklistsMem: SafetyChecklist[] = [...initialSafetyChecklists];
export let activityLogsMem: ActivityLog[] = [...initialActivityLogs];
export let notificationsMem: NotificationItem[] = [...initialNotifications];
export let maintenanceSchedulesMem: MaintenanceSchedule[] = [];

export async function initDb() {
  const defaultPassword = "password123";
  const defaultHash = await bcrypt.hash(defaultPassword, 10);
  
  usersMem = initialUsers.map((user) => ({
    ...user,
    passwordHash: defaultHash,
  }));
  maintenanceSchedulesMem = [...initialMaintenanceSchedules];

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL is missing. Operating in resilient in-memory mode.");
    isInMemoryMode = true;
    return;
  }

  try {
    // Parse the connection string to verify and create target database
    const parsedUrl = new URL(connectionString);
    const dbName = parsedUrl.pathname.replace(/^\//, '') || 'labsync_db';

    // Point connection string to default 'postgres' database to check/create the target
    parsedUrl.pathname = '/postgres';
    const checkClient = new pg.Client({
      connectionString: parsedUrl.toString(),
      connectionTimeoutMillis: 5000,
    });

    await checkClient.connect();
    const dbExistsRes = await checkClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (dbExistsRes.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating database...`);
      await checkClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created successfully.`);
    }
    await checkClient.end();

    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
    });

    // Test query to make sure connection is successful
    await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL successfully.");

    // Setup tables schema
    await createTablesSchema();

    // Migration Check: Check if database has old seed data
    const oldSeedCheck = await pool.query("SELECT COUNT(*) FROM users WHERE institution_name = 'Apex Institute of Technology'");
    if (parseInt(oldSeedCheck.rows[0].count) > 0) {
      console.log("Old seed data detected. Migrating to new Chennai institutions data...");
      await pool.query("TRUNCATE TABLE users, chat_messages, labs, equipment, bookings, tickets, calibrations, safety_checklists, activity_logs, notifications, maintenance_schedules CASCADE");
      console.log("Old tables truncated successfully.");
    }

    // Seed data if tables are empty
    await seedDatabaseIfEmpty(defaultHash);

    // Update existing user avatars in case database is already seeded with unsplash avatars
    await pool.query("UPDATE users SET avatar_url = $1 WHERE avatar_url LIKE '%unsplash.com%'", [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8" style="background-color:%23f1f5f9"><path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12c0 2.622 1.034 5.003 2.715 6.746 1.408-1.572 3.447-2.585 5.72-2.585h2.63c2.274 0 4.313 1.013 5.722 2.585ZM15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clip-rule="evenodd" /></svg>'
    ]);

  } catch (err: any) {
    console.error("PostgreSQL connection failed. Falling back to resilient in-memory mode.", err.message);
    isInMemoryMode = true;
  }


  // Check calibration dates and generate warning notifications
  try {
    await checkCalibrationDatesAndNotifyDb();
  } catch (alertErr: any) {
    console.error("Failed to run calibration date warnings scan:", alertErr.message);
  }
}

async function createTablesSchema() {
  if (!pool) return;

  // 1. Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL,
      department_id VARCHAR(100) NOT NULL,
      department_name VARCHAR(255) NOT NULL,
      institution_id VARCHAR(100) DEFAULT 'inst-apex',
      institution_name VARCHAR(255) DEFAULT 'Apex Institute of Technology',
      title VARCHAR(255) NOT NULL,
      phone VARCHAR(100),
      avatar_url TEXT
    )
  `);

  // 2. Chat messages table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id VARCHAR(100) PRIMARY KEY,
      sender_id VARCHAR(100) NOT NULL,
      sender_name VARCHAR(255) NOT NULL,
      sender_role VARCHAR(100) NOT NULL,
      receiver_id VARCHAR(100),
      text TEXT NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Labs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS labs (
      id VARCHAR(100) PRIMARY KEY,
      code VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      department_id VARCHAR(100) NOT NULL,
      department_name VARCHAR(255) NOT NULL,
      institution_id VARCHAR(100) DEFAULT 'inst-apex',
      institution_name VARCHAR(255) DEFAULT 'Apex Institute of Technology',
      building VARCHAR(255) NOT NULL,
      room_number VARCHAR(100) NOT NULL,
      technician_name VARCHAR(255) NOT NULL,
      capacity INTEGER NOT NULL,
      safety_score INTEGER NOT NULL,
      condition VARCHAR(100) NOT NULL
    )
  `);

  // 4. Equipment table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS equipment (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      model_number VARCHAR(255) NOT NULL,
      serial_number VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      lab_id VARCHAR(100) NOT NULL,
      lab_name VARCHAR(255) NOT NULL,
      department_id VARCHAR(100) NOT NULL,
      department_name VARCHAR(255) NOT NULL,
      institution_id VARCHAR(100) DEFAULT 'inst-apex',
      institution_name VARCHAR(255) DEFAULT 'Apex Institute of Technology',
      status VARCHAR(100) NOT NULL,
      condition VARCHAR(100) NOT NULL,
      purchase_cost INTEGER NOT NULL,
      hourly_rate INTEGER NOT NULL,
      requires_technician_supervision BOOLEAN NOT NULL DEFAULT FALSE,
      specifications TEXT NOT NULL,
      image_url TEXT NOT NULL,
      last_calibration_date VARCHAR(100),
      next_calibration_due_date VARCHAR(100),
      calibration_certificate_no VARCHAR(100)
    )
  `);

  // 5. Bookings table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(100) PRIMARY KEY,
      equipment_id VARCHAR(100) NOT NULL,
      equipment_name VARCHAR(255) NOT NULL,
      lab_id VARCHAR(100) NOT NULL,
      lab_name VARCHAR(255) NOT NULL,
      department_id VARCHAR(100) NOT NULL,
      department_name VARCHAR(255) NOT NULL,
      institution_id VARCHAR(100) DEFAULT 'inst-apex',
      institution_name VARCHAR(255) DEFAULT 'Apex Institute of Technology',
      user_id VARCHAR(100) NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      user_role VARCHAR(100) NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      user_institution_id VARCHAR(100) DEFAULT 'inst-apex',
      user_institution_name VARCHAR(255) DEFAULT 'Apex Institute of Technology',
      subject_code VARCHAR(100),
      subject_name VARCHAR(255),
      purpose TEXT NOT NULL,
      booking_date VARCHAR(100) NOT NULL,
      requested_start_time VARCHAR(100) NOT NULL,
      requested_end_time VARCHAR(100) NOT NULL,
      allocated_start_time VARCHAR(100),
      allocated_end_time VARCHAR(100),
      allocated_by_technician_name VARCHAR(255),
      rejection_reason VARCHAR(255),
      created_at VARCHAR(100) NOT NULL,
      status VARCHAR(100) NOT NULL,
      grant_reference VARCHAR(255)
    )
  `);

  // 6. Tickets table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id VARCHAR(100) PRIMARY KEY,
      ticket_number VARCHAR(100) NOT NULL,
      equipment_id VARCHAR(100) NOT NULL,
      equipment_name VARCHAR(255) NOT NULL,
      lab_id VARCHAR(100) NOT NULL,
      lab_name VARCHAR(255) NOT NULL,
      department_id VARCHAR(100) NOT NULL,
      department_name VARCHAR(255) NOT NULL,
      raised_by_user_id VARCHAR(100) NOT NULL,
      raised_by_user_name VARCHAR(255) NOT NULL,
      raised_by_user_role VARCHAR(100) NOT NULL,
      issue_type VARCHAR(100) NOT NULL,
      priority VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(100) NOT NULL,
      created_at VARCHAR(100) NOT NULL,
      resolution_notes TEXT,
      repair_cost INTEGER
    )
  `);

  // 7. Calibrations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calibrations (
      id VARCHAR(100) PRIMARY KEY,
      equipment_id VARCHAR(100) NOT NULL,
      equipment_name VARCHAR(255) NOT NULL,
      calibration_date VARCHAR(100) NOT NULL,
      next_due_date VARCHAR(100) NOT NULL,
      agency VARCHAR(255) NOT NULL,
      technician_name VARCHAR(255) NOT NULL,
      certificate_number VARCHAR(100) NOT NULL,
      result VARCHAR(100) NOT NULL,
      notes TEXT NOT NULL
    )
  `);

  // 8. Safety checklists table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS safety_checklists (
      id VARCHAR(100) PRIMARY KEY,
      lab_id VARCHAR(100) NOT NULL,
      lab_name VARCHAR(255) NOT NULL,
      date VARCHAR(100) NOT NULL,
      checked_by VARCHAR(255) NOT NULL,
      fire_extinguisher_checked BOOLEAN NOT NULL,
      first_aid_kit_stocked BOOLEAN NOT NULL,
      emergency_stop_functional BOOLEAN NOT NULL,
      ppe_available BOOLEAN NOT NULL,
      ventilation_ok BOOLEAN NOT NULL,
      hazardous_waste_disposed BOOLEAN NOT NULL,
      passed BOOLEAN NOT NULL,
      notes TEXT NOT NULL
    )
  `);

  // 9. Activity logs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(100) PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      user_role VARCHAR(100) NOT NULL,
      department_id VARCHAR(100) NOT NULL,
      department_name VARCHAR(255) NOT NULL,
      institution_id VARCHAR(100) DEFAULT 'inst-apex',
      institution_name VARCHAR(255) DEFAULT 'Apex Institute of Technology',
      timestamp VARCHAR(100) NOT NULL,
      action VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      details TEXT NOT NULL
    )
  `);

  // 10. Notifications table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      timestamp VARCHAR(100) NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      type VARCHAR(100) NOT NULL,
      role_target VARCHAR(100) NOT NULL,
      user_target_id VARCHAR(100)
    )
  `);

  // 11. Maintenance schedules table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS maintenance_schedules (
      id VARCHAR(100) PRIMARY KEY,
      equipment_id VARCHAR(100) NOT NULL,
      equipment_name VARCHAR(255) NOT NULL,
      lab_id VARCHAR(100) NOT NULL,
      lab_name VARCHAR(255) NOT NULL,
      scheduled_date VARCHAR(100) NOT NULL,
      scheduled_time VARCHAR(100) NOT NULL,
      technician_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(100) NOT NULL,
      status VARCHAR(100) NOT NULL,
      estimated_duration_hours REAL NOT NULL,
      estimated_cost INTEGER NOT NULL
    )
  `);

  console.log("PostgreSQL database tables setup complete.");
}

async function seedDatabaseIfEmpty(defaultHash: string) {
  if (!pool) return;

  // 1. Seed users if empty
  const usersCountRes = await pool.query("SELECT COUNT(*) FROM users");
  if (parseInt(usersCountRes.rows[0].count) === 0) {
    console.log("Seeding users...");
    for (const u of initialUsers) {
      await pool.query(`
        INSERT INTO users (id, name, email, password_hash, role, department_id, department_name, institution_id, institution_name, title, phone, avatar_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [u.id, u.name, u.email, defaultHash, u.role, u.departmentId, u.departmentName, u.institutionId, u.institutionName, u.title, u.phone, u.avatarUrl]);
    }
  }

  // 2. Seed chat messages if empty
  const chatCountRes = await pool.query("SELECT COUNT(*) FROM chat_messages");
  if (parseInt(chatCountRes.rows[0].count) === 0) {
    console.log("Seeding chat messages...");
    for (const m of chatMessagesMem) {
      await pool.query(`
        INSERT INTO chat_messages (id, sender_id, sender_name, sender_role, text, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [m.id, m.senderId, m.senderName, m.senderRole, m.text, m.timestamp]);
    }
  }

  // 3. Seed labs
  const labsCountRes = await pool.query("SELECT COUNT(*) FROM labs");
  if (parseInt(labsCountRes.rows[0].count) === 0) {
    console.log("Seeding labs...");
    for (const l of initialLabs) {
      await pool.query(`
        INSERT INTO labs (id, code, name, department_id, department_name, institution_id, institution_name, building, room_number, technician_name, capacity, safety_score, condition)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [l.id, l.code, l.name, l.departmentId, l.departmentName, l.institutionId, l.institutionName, l.building, l.roomNumber, l.technicianName, l.capacity, l.safetyScore, l.condition]);
    }
  }

  // 4. Seed equipment
  const eqCountRes = await pool.query("SELECT COUNT(*) FROM equipment");
  if (parseInt(eqCountRes.rows[0].count) === 0) {
    console.log("Seeding equipment...");
    for (const e of initialEquipment) {
      await pool.query(`
        INSERT INTO equipment (
          id, 
          name, 
          model_number, 
          serial_number, 
          category, 
          lab_id, 
          lab_name, 
          department_id, 
          department_name, 
          institution_id, 
          institution_name,
          status, 
          condition, 
          purchase_cost, 
          hourly_rate, 
          requires_technician_supervision, 
          specifications, 
          image_url, 
          last_calibration_date, 
          next_calibration_due_date, 
          calibration_certificate_no
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      `, [
        e.id, 
        e.name, 
        e.modelNumber, 
        e.serialNumber, 
        e.category, 
        e.labId, 
        e.labName, 
        e.departmentId, 
        e.departmentName, 
        e.institutionId,
        e.institutionName,
        e.status, 
        e.condition, 
        e.purchaseCost, 
        e.hourlyRate, 
        e.requiresTechnicianSupervision, 
        JSON.stringify(e.specifications), 
        e.imageUrl || '', 
        e.lastCalibrationDate, 
        e.nextCalibrationDueDate, 
        e.calibrationCertificateNo
      ]);
    }
  }

  // 5. Seed bookings
  const bookingsCountRes = await pool.query("SELECT COUNT(*) FROM bookings");
  if (parseInt(bookingsCountRes.rows[0].count) === 0) {
    console.log("Seeding bookings...");
    for (const b of initialBookings) {
      await pool.query(`
        INSERT INTO bookings (id, equipment_id, equipment_name, lab_id, lab_name, department_id, department_name, institution_id, institution_name, user_id, user_name, user_role, user_email, user_institution_id, user_institution_name, subject_code, subject_name, purpose, booking_date, requested_start_time, requested_end_time, allocated_start_time, allocated_end_time, allocated_by_technician_name, rejection_reason, created_at, status, grant_reference)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      `, [b.id, b.equipmentId, b.equipmentName, b.labId, b.labName, b.departmentId, b.departmentName, b.institutionId, b.institutionName, b.userId, b.userName, b.userRole, b.userEmail, b.userInstitutionId || 'inst-apex', b.userInstitutionName || 'Apex Institute of Technology', b.subjectCode || null, b.subjectName || null, b.purpose, b.bookingDate, b.requestedStartTime, b.requestedEndTime, b.allocatedStartTime || null, b.allocatedEndTime || null, b.allocatedByTechnicianName || null, b.rejectionReason || null, b.createdAt, b.status, b.grantReference || null]);
    }
  }

  // 6. Seed tickets
  const ticketsCountRes = await pool.query("SELECT COUNT(*) FROM tickets");
  if (parseInt(ticketsCountRes.rows[0].count) === 0) {
    console.log("Seeding maintenance tickets...");
    for (const t of initialTickets) {
      await pool.query(`
        INSERT INTO tickets (id, ticket_number, equipment_id, equipment_name, lab_id, lab_name, department_id, department_name, raised_by_user_id, raised_by_user_name, raised_by_user_role, issue_type, priority, description, status, created_at, resolution_notes, repair_cost)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [t.id, t.ticketNumber, t.equipmentId, t.equipmentName, t.labId, t.labName, t.departmentId, t.departmentName, t.raisedByUserId, t.raisedByUserName, t.raisedByUserRole, t.issueType, t.priority, t.description, t.status, t.createdAt, t.resolutionNotes || null, t.repairCost || null]);
    }
  }

  // 7. Seed calibrations
  const calCountRes = await pool.query("SELECT COUNT(*) FROM calibrations");
  if (parseInt(calCountRes.rows[0].count) === 0) {
    console.log("Seeding calibrations...");
    for (const c of initialCalibrations) {
      await pool.query(`
        INSERT INTO calibrations (id, equipment_id, equipment_name, calibration_date, next_due_date, agency, technician_name, certificate_number, result, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [c.id, c.equipmentId, c.equipmentName, c.calibrationDate, c.nextDueDate, c.agency, c.technicianName, c.certificateNumber, c.result, c.notes]);
    }
  }

  // 8. Seed safety check lists
  const safetyCountRes = await pool.query("SELECT COUNT(*) FROM safety_checklists");
  if (parseInt(safetyCountRes.rows[0].count) === 0) {
    console.log("Seeding safety checklists...");
    for (const s of initialSafetyChecklists) {
      await pool.query(`
        INSERT INTO safety_checklists (id, lab_id, lab_name, date, checked_by, fire_extinguisher_checked, first_aid_kit_stocked, emergency_stop_functional, ppe_available, ventilation_ok, hazardous_waste_disposed, passed, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [s.id, s.labId, s.labName, s.date, s.checkedBy, s.fireExtinguisherChecked, s.firstAidKitStocked, s.emergencyStopFunctional, s.ppeAvailable, s.ventilationOK, s.hazardousWasteDisposed, s.passed, s.notes]);
    }
  }

  // 9. Seed activity logs
  const logsCountRes = await pool.query("SELECT COUNT(*) FROM activity_logs");
  if (parseInt(logsCountRes.rows[0].count) === 0) {
    console.log("Seeding activity logs...");
    for (const log of initialActivityLogs) {
      await pool.query(`
        INSERT INTO activity_logs (id, user_id, user_name, user_role, department_id, department_name, institution_id, institution_name, timestamp, action, category, details)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [log.id, log.userId, log.userName, log.userRole, log.departmentId, log.departmentName, log.institutionId, log.institutionName, log.timestamp, log.action, log.category, log.details]);
    }
  }

  // 10. Seed notifications
  const notifCountRes = await pool.query("SELECT COUNT(*) FROM notifications");
  if (parseInt(notifCountRes.rows[0].count) === 0) {
    console.log("Seeding notifications...");
    for (const n of initialNotifications) {
      await pool.query(`
        INSERT INTO notifications (id, title, message, timestamp, is_read, type, role_target, user_target_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [n.id, n.title, n.message, n.timestamp, n.read, n.type, n.targetRole || 'all', n.targetUserId || null]);
    }
  }

  // 11. Seed maintenance schedules
  const schedulesCountRes = await pool.query("SELECT COUNT(*) FROM maintenance_schedules");
  if (parseInt(schedulesCountRes.rows[0].count) === 0) {
    console.log("Seeding maintenance schedules...");
    for (const s of initialMaintenanceSchedules) {
      await pool.query(`
        INSERT INTO maintenance_schedules (id, equipment_id, equipment_name, lab_id, lab_name, scheduled_date, scheduled_time, technician_name, description, type, status, estimated_duration_hours, estimated_cost)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [s.id, s.equipmentId, s.equipmentName, s.labId, s.labName, s.scheduledDate, s.scheduledTime, s.technicianName, s.description, s.type, s.status, s.estimatedDurationHours, s.estimatedCost]);
    }
  }

  console.log("Seeding finished.");
}

// Queries wrapper functions

export async function queryUsers() {
  if (isInMemoryMode || !pool) return usersMem;
  const res = await pool.query("SELECT id, name, email, role, department_id as \"departmentId\", department_name as \"departmentName\", institution_id as \"institutionId\", institution_name as \"institutionName\", title, phone, avatar_url as \"avatarUrl\" FROM users");
  return res.rows;
}

export async function queryUserByEmail(email: string) {
  const emailLower = email.toLowerCase();
  if (isInMemoryMode || !pool) return usersMem.find(u => u.email.toLowerCase() === emailLower);
  const res = await pool.query("SELECT id, name, email, password_hash as \"passwordHash\", role, department_id as \"departmentId\", department_name as \"departmentName\", institution_id as \"institutionId\", institution_name as \"institutionName\", title, phone, avatar_url as \"avatarUrl\" FROM users WHERE LOWER(email) = $1", [emailLower]);
  return res.rows[0];
}

export async function queryUserById(id: string) {
  if (isInMemoryMode || !pool) return usersMem.find(u => u.id === id);
  const res = await pool.query("SELECT id, name, email, role, department_id as \"departmentId\", department_name as \"departmentName\", institution_id as \"institutionId\", institution_name as \"institutionName\", title, phone, avatar_url as \"avatarUrl\" FROM users WHERE id = $1", [id]);
  return res.rows[0];
}

export async function insertUser(u: User & { passwordHash: string }) {
  if (isInMemoryMode || !pool) {
    usersMem.push(u);
    return u;
  }
  await pool.query(`
    INSERT INTO users (id, name, email, password_hash, role, department_id, department_name, institution_id, institution_name, title, phone, avatar_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [u.id, u.name, u.email, u.passwordHash, u.role, u.departmentId, u.departmentName, u.institutionId, u.institutionName, u.title, u.phone, u.avatarUrl]);
  return u;
}

export async function queryChatMessages() {
  if (isInMemoryMode || !pool) return chatMessagesMem;
  const res = await pool.query("SELECT id, sender_id as \"senderId\", sender_name as \"senderName\", sender_role as \"senderRole\", receiver_id as \"receiverId\", text, timestamp FROM chat_messages ORDER BY timestamp ASC");
  return res.rows;
}

export async function insertChatMessage(m: any) {
  if (isInMemoryMode || !pool) {
    chatMessagesMem.push(m);
    return m;
  }
  await pool.query(`
    INSERT INTO chat_messages (id, sender_id, sender_name, sender_role, receiver_id, text, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [m.id, m.senderId, m.senderName, m.senderRole, m.receiverId || null, m.text, m.timestamp]);
  return m;
}

export async function queryLabs() {
  if (isInMemoryMode || !pool) return labsMem;
  const res = await pool.query("SELECT id, code, name, department_id as \"departmentId\", department_name as \"departmentName\", institution_id as \"institutionId\", institution_name as \"institutionName\", building, room_number as \"roomNumber\", technician_name as \"technicianName\", capacity, safety_score as \"safetyScore\", condition FROM labs");
  return res.rows;
}

export async function queryEquipment() {
  if (isInMemoryMode || !pool) return equipmentMem;
  const res = await pool.query("SELECT id, name, model_number as \"modelNumber\", serial_number as \"serialNumber\", category, lab_id as \"labId\", lab_name as \"labName\", department_id as \"departmentId\", department_name as \"departmentName\", institution_id as \"institutionId\", institution_name as \"institutionName\", status, condition, purchase_cost as \"purchaseCost\", hourly_rate as \"hourlyRate\", requires_technician_supervision as \"requiresTechnicianSupervision\", specifications, image_url as \"imageUrl\", last_calibration_date as \"lastCalibrationDate\", next_calibration_due_date as \"nextCalibrationDueDate\", calibration_certificate_no as \"calibrationCertificateNo\" FROM equipment");
  return res.rows.map(row => ({
    ...row,
    specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications
  }));
}

export async function insertEquipment(e: Equipment) {
  if (isInMemoryMode || !pool) {
    equipmentMem.unshift(e);
    return e;
  }
  await pool.query(`
    INSERT INTO equipment (
      id, 
      name, 
      model_number, 
      serial_number, 
      category, 
      lab_id, 
      lab_name, 
      department_id, 
      department_name, 
      institution_id,
      institution_name,
      status, 
      condition, 
      purchase_cost, 
      hourly_rate, 
      requires_technician_supervision, 
      specifications, 
      image_url, 
      last_calibration_date, 
      next_calibration_due_date, 
      calibration_certificate_no
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
  `, [
    e.id, 
    e.name, 
    e.modelNumber, 
    e.serialNumber, 
    e.category, 
    e.labId, 
    e.labName, 
    e.departmentId, 
    e.departmentName, 
    e.institutionId,
    e.institutionName,
    e.status, 
    e.condition, 
    e.purchaseCost, 
    e.hourlyRate, 
    e.requiresTechnicianSupervision, 
    JSON.stringify(e.specifications), 
    e.imageUrl || '', 
    e.lastCalibrationDate, 
    e.nextCalibrationDueDate, 
    e.calibrationCertificateNo
  ]);
  return e;
}

export async function updateEquipmentStatusDb(id: string, status: string, condition?: string) {
  if (isInMemoryMode || !pool) {
    equipmentMem = equipmentMem.map(e => e.id === id ? { ...e, status: status as any, condition: condition ? condition as any : e.condition } : e);
    return;
  }
  if (condition) {
    await pool.query("UPDATE equipment SET status = $1, condition = $2 WHERE id = $3", [status, condition, id]);
  } else {
    await pool.query("UPDATE equipment SET status = $1 WHERE id = $2", [status, id]);
  }
}

export async function queryBookings() {
  if (isInMemoryMode || !pool) return bookingsMem;
  const res = await pool.query("SELECT id, equipment_id as \"equipmentId\", equipment_name as \"equipmentName\", lab_id as \"labId\", lab_name as \"labName\", department_id as \"departmentId\", department_name as \"departmentName\", institution_id as \"institutionId\", institution_name as \"institutionName\", user_id as \"userId\", user_name as \"userName\", user_role as \"userRole\", user_email as \"userEmail\", user_institution_id as \"userInstitutionId\", user_institution_name as \"userInstitutionName\", subject_code as \"subjectCode\", subject_name as \"subjectName\", purpose, booking_date as \"bookingDate\", requested_start_time as \"requestedStartTime\", requested_end_time as \"requestedEndTime\", allocated_start_time as \"allocatedStartTime\", allocated_end_time as \"allocatedEndTime\", allocated_by_technician_name as \"allocatedByTechnicianName\", rejection_reason as \"rejectionReason\", created_at as \"createdAt\", status, grant_reference as \"grantReference\" FROM bookings ORDER BY created_at DESC");
  return res.rows;
}

export async function insertBooking(b: Booking) {
  if (isInMemoryMode || !pool) {
    bookingsMem.unshift(b);
    return b;
  }
  await pool.query(`
    INSERT INTO bookings (id, equipment_id, equipment_name, lab_id, lab_name, department_id, department_name, institution_id, institution_name, user_id, user_name, user_role, user_email, user_institution_id, user_institution_name, subject_code, subject_name, purpose, booking_date, requested_start_time, requested_end_time, allocated_start_time, allocated_end_time, allocated_by_technician_name, rejection_reason, created_at, status, grant_reference)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
  `, [b.id, b.equipmentId, b.equipmentName, b.labId, b.labName, b.departmentId, b.departmentName, b.institutionId, b.institutionName, b.userId, b.userName, b.userRole, b.userEmail, b.userInstitutionId || 'inst-apex', b.userInstitutionName || 'Apex Institute of Technology', b.subjectCode || null, b.subjectName || null, b.purpose, b.bookingDate, b.requestedStartTime, b.requestedEndTime, b.allocatedStartTime || null, b.allocatedEndTime || null, b.allocatedByTechnicianName || null, b.rejectionReason || null, b.createdAt, b.status, b.grantReference || null]);
  return b;
}

export async function assignSlotDb(id: string, startTime: string, endTime: string, techName: string) {
  if (isInMemoryMode || !pool) {
    bookingsMem = bookingsMem.map(b => b.id === id ? { ...b, allocatedStartTime: startTime, allocatedEndTime: endTime, allocatedByTechnicianName: techName, status: 'Assigned Slot' } : b);
    return;
  }
  await pool.query("UPDATE bookings SET allocated_start_time = $1, allocated_end_time = $2, allocated_by_technician_name = $3, status = 'Assigned Slot' WHERE id = $4", [startTime, endTime, techName, id]);
}

export async function rejectBookingDb(id: string, reason: string) {
  if (isInMemoryMode || !pool) {
    bookingsMem = bookingsMem.map(b => b.id === id ? { ...b, rejectionReason: reason, status: 'Rejected' } : b);
    return;
  }
  await pool.query("UPDATE bookings SET rejection_reason = $1, status = 'Rejected' WHERE id = $2", [reason, id]);
}

export async function queryTickets() {
  if (isInMemoryMode || !pool) return ticketsMem;
  const res = await pool.query("SELECT id, ticket_number as \"ticketNumber\", equipment_id as \"equipmentId\", equipment_name as \"equipmentName\", lab_id as \"labId\", lab_name as \"labName\", department_id as \"departmentId\", department_name as \"departmentName\", raised_by_user_id as \"raisedByUserId\", raised_by_user_name as \"raisedByUserName\", raised_by_user_role as \"raisedByUserRole\", issue_type as \"issueType\", priority, description, status, created_at as \"createdAt\", resolution_notes as \"resolutionNotes\", repair_cost as \"repairCost\" FROM tickets ORDER BY created_at DESC");
  return res.rows;
}

export async function insertTicket(t: MaintenanceTicket) {
  if (isInMemoryMode || !pool) {
    ticketsMem.unshift(t);
    return t;
  }
  await pool.query(`
    INSERT INTO tickets (id, ticket_number, equipment_id, equipment_name, lab_id, lab_name, department_id, department_name, raised_by_user_id, raised_by_user_name, raised_by_user_role, issue_type, priority, description, status, created_at, resolution_notes, repair_cost)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
  `, [t.id, t.ticketNumber, t.equipmentId, t.equipmentName, t.labId, t.labName, t.departmentId, t.departmentName, t.raisedByUserId, t.raisedByUserName, t.raisedByUserRole, t.issueType, t.priority, t.description, t.status, t.createdAt, t.resolutionNotes || null, t.repairCost || null]);
  return t;
}

export async function updateTicketStatusDb(id: string, status: string, notes?: string, cost?: number) {
  if (isInMemoryMode || !pool) {
    ticketsMem = ticketsMem.map(t => t.id === id ? { ...t, status: status as any, resolutionNotes: notes || t.resolutionNotes, repairCost: cost !== undefined ? cost : t.repairCost } : t);
    return;
  }
  if (notes || cost !== undefined) {
    await pool.query("UPDATE tickets SET status = $1, resolution_notes = $2, repair_cost = $3 WHERE id = $4", [status, notes || null, cost !== undefined ? cost : null, id]);
  } else {
    await pool.query("UPDATE tickets SET status = $1 WHERE id = $2", [status, id]);
  }
}

export async function queryCalibrations() {
  if (isInMemoryMode || !pool) return calibrationsMem;
  const res = await pool.query("SELECT id, equipment_id as \"equipmentId\", equipment_name as \"equipmentName\", calibration_date as \"calibrationDate\", next_due_date as \"nextDueDate\", agency, technician_name as \"technicianName\", certificate_number as \"certificateNumber\", result, notes FROM calibrations");
  return res.rows;
}

export async function insertCalibration(c: CalibrationRecord) {
  if (isInMemoryMode || !pool) {
    calibrationsMem.unshift(c);
    return c;
  }
  await pool.query(`
    INSERT INTO calibrations (id, equipment_id, equipment_name, calibration_date, next_due_date, agency, technician_name, certificate_number, result, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [c.id, c.equipmentId, c.equipmentName, c.calibrationDate, c.nextDueDate, c.agency, c.technicianName, c.certificateNumber, c.result, c.notes]);
  return c;
}

export async function querySafetyChecklists() {
  if (isInMemoryMode || !pool) return safetyChecklistsMem;
  const res = await pool.query("SELECT id, lab_id as \"labId\", lab_name as \"labName\", date, checked_by as \"checkedBy\", fire_extinguisher_checked as \"fireExtinguisherChecked\", first_aid_kit_stocked as \"firstAidKitStocked\", emergency_stop_functional as \"emergencyStopFunctional\", ppe_available as \"ppeAvailable\", ventilation_ok as \"ventilationOK\", hazardous_waste_disposed as \"hazardousWasteDisposed\", passed, notes FROM safety_checklists");
  return res.rows;
}

export async function insertSafetyChecklist(s: SafetyChecklist) {
  if (isInMemoryMode || !pool) {
    safetyChecklistsMem.unshift(s);
    return s;
  }
  await pool.query(`
    INSERT INTO safety_checklists (id, lab_id, lab_name, date, checked_by, fire_extinguisher_checked, first_aid_kit_stocked, emergency_stop_functional, ppe_available, ventilation_ok, hazardous_waste_disposed, passed, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `, [s.id, s.labId, s.labName, s.date, s.checkedBy, s.fireExtinguisherChecked, s.firstAidKitStocked, s.emergencyStopFunctional, s.ppeAvailable, s.ventilationOK, s.hazardousWasteDisposed, s.passed, s.notes]);
  return s;
}

export async function queryActivityLogs() {
  if (isInMemoryMode || !pool) return activityLogsMem;
  const res = await pool.query("SELECT id, user_id as \"userId\", user_name as \"userName\", user_role as \"userRole\", department_id as \"departmentId\", department_name as \"departmentName\", institution_id as \"institutionId\", institution_name as \"institutionName\", timestamp, action, category, details FROM activity_logs ORDER BY timestamp DESC");
  return res.rows;
}

export async function insertActivityLog(log: ActivityLog) {
  if (isInMemoryMode || !pool) {
    activityLogsMem.unshift(log);
    return log;
  }
  await pool.query(`
    INSERT INTO activity_logs (id, user_id, user_name, user_role, department_id, department_name, institution_id, institution_name, timestamp, action, category, details)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [log.id, log.userId, log.userName, log.userRole, log.departmentId, log.departmentName, log.institutionId, log.institutionName, log.timestamp, log.action, log.category, log.details]);
  return log;
}

export async function queryNotifications() {
  if (isInMemoryMode || !pool) return notificationsMem;
  const res = await pool.query("SELECT id, title, message, timestamp, is_read as \"read\", type, role_target as \"targetRole\", user_target_id as \"targetUserId\" FROM notifications ORDER BY timestamp DESC");
  return res.rows;
}

export async function insertNotification(n: NotificationItem) {
  if (isInMemoryMode || !pool) {
    notificationsMem.unshift(n);
    return n;
  }
  await pool.query(`
    INSERT INTO notifications (id, title, message, timestamp, is_read, type, role_target, user_target_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [n.id, n.title, n.message, n.timestamp, n.read, n.type, n.targetRole || 'all', n.targetUserId || null]);
  return n;
}

export async function updateNotificationReadDb(id: string) {
  if (isInMemoryMode || !pool) {
    notificationsMem = notificationsMem.map(n => n.id === id ? { ...n, read: true } : n);
    return;
  }
  await pool.query("UPDATE notifications SET is_read = true WHERE id = $1", [id]);
}

export async function clearNotificationsDb() {
  if (isInMemoryMode || !pool) {
    notificationsMem = [];
    return;
  }
  await pool.query("DELETE FROM notifications");
}

export async function queryMaintenanceSchedules() {
  if (isInMemoryMode || !pool) return maintenanceSchedulesMem;
  const res = await pool.query("SELECT id, equipment_id as \"equipmentId\", equipment_name as \"equipmentName\", lab_id as \"labId\", lab_name as \"labName\", scheduled_date as \"scheduledDate\", scheduled_time as \"scheduledTime\", technician_name as \"technicianName\", description, type, status, estimated_duration_hours as \"estimatedDurationHours\", estimated_cost as \"estimatedCost\" FROM maintenance_schedules ORDER BY scheduled_date ASC");
  return res.rows;
}

export async function insertMaintenanceSchedule(s: MaintenanceSchedule) {
  if (isInMemoryMode || !pool) {
    maintenanceSchedulesMem.push(s);
    return s;
;  }
  await pool.query(`
    INSERT INTO maintenance_schedules (id, equipment_id, equipment_name, lab_id, lab_name, scheduled_date, scheduled_time, technician_name, description, type, status, estimated_duration_hours, estimated_cost)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `, [s.id, s.equipmentId, s.equipmentName, s.labId, s.labName, s.scheduledDate, s.scheduledTime, s.technicianName, s.description, s.type, s.status, s.estimatedDurationHours, s.estimatedCost]);
  return s;
}

export async function updateMaintenanceScheduleStatusDb(id: string, status: string) {
  if (isInMemoryMode || !pool) {
    maintenanceSchedulesMem = maintenanceSchedulesMem.map(s => s.id === id ? { ...s, status: status as any } : s);
    return;
  }
  await pool.query("UPDATE maintenance_schedules SET status = $1 WHERE id = $2", [status, id]);
}

// Update Equipment Details
export async function updateEquipmentDb(id: string, e: Equipment) {
  if (isInMemoryMode || !pool) {
    equipmentMem = equipmentMem.map(eq => eq.id === id ? e : eq);
    return e;
  }
  await pool.query(`
    UPDATE equipment SET
      name = $1,
      model_number = $2,
      serial_number = $3,
      category = $4,
      lab_id = $5,
      lab_name = $6,
      department_id = $7,
      department_name = $8,
      institution_id = $9,
      institution_name = $10,
      status = $11,
      condition = $12,
      purchase_cost = $13,
      hourly_rate = $14,
      requires_technician_supervision = $15,
      specifications = $16,
      image_url = $17,
      last_calibration_date = $18,
      next_calibration_due_date = $19,
      calibration_certificate_no = $20
    WHERE id = $21
  `, [
    e.name,
    e.modelNumber,
    e.serialNumber,
    e.category,
    e.labId,
    e.labName,
    e.departmentId,
    e.departmentName,
    e.institutionId,
    e.institutionName,
    e.status,
    e.condition,
    e.purchaseCost,
    e.hourlyRate,
    e.requiresTechnicianSupervision,
    JSON.stringify(e.specifications),
    e.imageUrl || '',
    e.lastCalibrationDate,
    e.nextCalibrationDueDate,
    e.calibrationCertificateNo,
    id
  ]);
  return e;
}

// Delete Equipment Asset
export async function deleteEquipmentDb(id: string) {
  if (isInMemoryMode || !pool) {
    equipmentMem = equipmentMem.filter(eq => eq.id !== id);
    return;
  }
  // Also clean up any bookings or tickets related to this equipment if needed
  await pool.query("DELETE FROM equipment WHERE id = $1", [id]);
}

// Run Calibration Date checks and notify lab technicians
export async function checkCalibrationDatesAndNotifyDb() {
  const today = new Date();
  let equipments: Equipment[] = [];
  
  if (isInMemoryMode || !pool) {
    equipments = equipmentMem;
  } else {
    const res = await pool.query(`
      SELECT 
        id, 
        name, 
        model_number as "modelNumber", 
        serial_number as "serialNumber", 
        category, 
        lab_id as "labId", 
        lab_name as "labName", 
        department_id as "departmentId", 
        department_name as "departmentName", 
        institution_id as "institutionId", 
        institution_name as "institutionName", 
        status, 
        condition, 
        purchase_cost as "purchaseCost", 
        hourly_rate as "hourlyRate", 
        requires_technician_supervision as "requiresTechnicianSupervision", 
        specifications, 
        image_url as "imageUrl", 
        last_calibration_date as "lastCalibrationDate", 
        next_calibration_due_date as "nextCalibrationDueDate", 
        calibration_certificate_no as "calibrationCertificateNo" 
      FROM equipment
    `);
    equipments = res.rows.map(row => ({
      ...row,
      specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications
    }));
  }

  for (const eq of equipments) {
    if (!eq.nextCalibrationDueDate) continue;
    const dueDate = new Date(eq.nextCalibrationDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Alert if within 15 days or overdue
    if (diffDays <= 15) {
      const isOverdue = diffDays < 0;
      const type = isOverdue ? 'overdue' : 'upcoming';
      const notifId = `notif-cal-${eq.id}-${type}`;
      const title = isOverdue ? `Calibration Overdue` : `Calibration Upcoming`;
      const message = isOverdue
        ? `The calibration for ${eq.name} (${eq.modelNumber}) in ${eq.labName} was due on ${eq.nextCalibrationDueDate} (Overdue by ${Math.abs(diffDays)} days).`
        : `The calibration for ${eq.name} (${eq.modelNumber}) in ${eq.labName} is due in ${diffDays} days on ${eq.nextCalibrationDueDate}.`;

      if (isInMemoryMode || !pool) {
        const exists = notificationsMem.some(n => n.id === notifId);
        if (!exists) {
          notificationsMem.unshift({
            id: notifId,
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'calibration',
            targetRole: 'lab_technician'
          });
        }
      } else {
        await pool.query(`
          INSERT INTO notifications (id, title, message, timestamp, is_read, type, role_target)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [notifId, title, message, new Date().toISOString(), false, 'calibration', 'lab_technician']);
      }
    }
  }
}



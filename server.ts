import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { 
  initDb, 
  queryUsers, 
  queryUserByEmail, 
  queryUserById, 
  insertUser, 
  queryChatMessages, 
  insertChatMessage, 
  queryLabs, 
  queryEquipment, 
  insertEquipment, 
  updateEquipmentStatusDb, 
  updateEquipmentDb,
  deleteEquipmentDb,
  queryBookings, 
  insertBooking, 
  assignSlotDb, 
  rejectBookingDb, 
  queryTickets, 
  insertTicket, 
  updateTicketStatusDb, 
  queryCalibrations, 
  insertCalibration, 
  querySafetyChecklists, 
  insertSafetyChecklist, 
  queryActivityLogs, 
  insertActivityLog, 
  queryNotifications, 
  insertNotification, 
  updateNotificationReadDb, 
  clearNotificationsDb,
  queryMaintenanceSchedules,
  insertMaintenanceSchedule,
  updateMaintenanceScheduleStatusDb,
  isInMemoryMode
} from "./db";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-labsync-key";

// Middleware to authenticate JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token missing." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = decoded;
    next();
  });
};

async function startServer() {
  // Initialize Database (PostgreSQL with graceful in-memory fallback)
  await initDb();

  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      databaseMode: isInMemoryMode ? "In-Memory (Fallback)" : "PostgreSQL",
      timestamp: new Date().toISOString() 
    });
  });

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password, role, departmentId, departmentName, institutionId, institutionName, phone, title } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "Name, email, password, and role are required." });
      }

      const emailLower = email.toLowerCase();
      const userExists = await queryUserByEmail(emailLower);
      if (userExists) {
        return res.status(400).json({ error: "User with this email already exists." });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        departmentId: departmentId || "dept-ece",
        departmentName: departmentName || "Electronics & Communication Engineering",
        institutionId: institutionId || "inst-apex",
        institutionName: institutionName || "Apex Institute of Technology",
        phone: phone || "",
        title: title || `${role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}`,
        avatarUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8" style="background-color:%23f1f5f9"><path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12c0 2.622 1.034 5.003 2.715 6.746 1.408-1.572 3.447-2.585 5.72-2.585h2.63c2.274 0 4.313 1.013 5.722 2.585ZM15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clip-rule="evenodd" /></svg>',
        passwordHash,
      };

      await insertUser(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, institutionId: newUser.institutionId },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const { passwordHash: _, ...userWithoutPassword } = newUser;
      return res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: error.message || "An error occurred during signup." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      const emailLower = email.toLowerCase();
      const user = await queryUserByEmail(emailLower);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, institutionId: user.institutionId },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const { passwordHash: _, ...userWithoutPassword } = user;
      return res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(500).json({ error: error.message || "An error occurred during login." });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    try {
      const user = await queryUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      return res.json({ user });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "An error occurred fetching session profile." });
    }
  });

  // Global Users Route
  app.get("/api/users", authenticateToken, async (req, res) => {
    try {
      const usersList = await queryUsers();
      return res.json({ users: usersList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch users." });
    }
  });

  // Labs Route
  app.get("/api/labs", authenticateToken, async (req, res) => {
    try {
      const labsList = await queryLabs();
      return res.json({ labs: labsList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch labs." });
    }
  });

  // Equipment Routes
  app.get("/api/equipment", authenticateToken, async (req, res) => {
    try {
      const eqList = await queryEquipment();
      return res.json({ equipment: eqList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch equipment catalog." });
    }
  });

  app.post("/api/equipment", authenticateToken, async (req, res) => {
    try {
      const newEq = await insertEquipment(req.body);
      return res.json({ equipment: newEq });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to register new equipment." });
    }
  });

  app.post("/api/equipment/:id/status", authenticateToken, async (req, res) => {
    try {
      const { status, condition } = req.body;
      await updateEquipmentStatusDb(req.params.id, status, condition);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to update equipment status." });
    }
  });

  app.put("/api/equipment/:id", authenticateToken, async (req, res) => {
    try {
      const updated = await updateEquipmentDb(req.params.id, req.body);
      return res.json({ equipment: updated });
    } catch (err: any) {
      console.error("Error updating equipment:", err);
      return res.status(500).json({ error: "Failed to update equipment details." });
    }
  });

  app.delete("/api/equipment/:id", authenticateToken, async (req, res) => {
    try {
      await deleteEquipmentDb(req.params.id);
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting equipment:", err);
      return res.status(500).json({ error: "Failed to delete equipment." });
    }
  });

  // Bookings Routes
  app.get("/api/bookings", authenticateToken, async (req, res) => {
    try {
      const bookingsList = await queryBookings();
      return res.json({ bookings: bookingsList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch bookings." });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req, res) => {
    try {
      const newBooking = await insertBooking(req.body);
      return res.json({ booking: newBooking });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to submit booking request." });
    }
  });

  app.post("/api/bookings/:id/assign", authenticateToken, async (req, res) => {
    try {
      const { startTime, endTime, technicianName } = req.body;
      await assignSlotDb(req.params.id, startTime, endTime, technicianName);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to allocate booking slot." });
    }
  });

  app.post("/api/bookings/:id/reject", authenticateToken, async (req, res) => {
    try {
      const { reason } = req.body;
      await rejectBookingDb(req.params.id, reason);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to reject booking request." });
    }
  });

  // Tickets Routes
  app.get("/api/tickets", authenticateToken, async (req, res) => {
    try {
      const ticketsList = await queryTickets();
      return res.json({ tickets: ticketsList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch maintenance tickets." });
    }
  });

  app.post("/api/tickets", authenticateToken, async (req, res) => {
    try {
      const newTicket = await insertTicket(req.body);
      return res.json({ ticket: newTicket });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to raise maintenance ticket." });
    }
  });

  app.post("/api/tickets/:id/status", authenticateToken, async (req, res) => {
    try {
      const { status, notes, cost } = req.body;
      await updateTicketStatusDb(req.params.id, status, notes, cost);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to update maintenance ticket status." });
    }
  });

  // Calibrations Routes
  app.get("/api/calibrations", authenticateToken, async (req, res) => {
    try {
      const calList = await queryCalibrations();
      return res.json({ calibrations: calList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch calibration records." });
    }
  });

  app.post("/api/calibrations", authenticateToken, async (req, res) => {
    try {
      const newCal = await insertCalibration(req.body);
      // Also update the device's status to Available
      await updateEquipmentStatusDb(req.body.equipmentId, 'Available');
      return res.json({ calibration: newCal });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to record calibration check." });
    }
  });

  // Maintenance Schedules Routes
  app.get("/api/schedules", authenticateToken, async (req, res) => {
    try {
      const schedulesList = await queryMaintenanceSchedules();
      return res.json({ schedules: schedulesList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch maintenance schedules." });
    }
  });

  app.post("/api/schedules", authenticateToken, async (req, res) => {
    try {
      const newSchedule = await insertMaintenanceSchedule(req.body);
      return res.json({ schedule: newSchedule });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to create maintenance schedule." });
    }
  });

  app.post("/api/schedules/:id/status", authenticateToken, async (req, res) => {
    try {
      const { status } = req.body;
      await updateMaintenanceScheduleStatusDb(req.params.id, status);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to update maintenance schedule status." });
    }
  });

  // Safety Checklist Routes
  app.get("/api/safety", authenticateToken, async (req, res) => {
    try {
      const safetyList = await querySafetyChecklists();
      return res.json({ checklists: safetyList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch safety checklist history." });
    }
  });

  app.post("/api/safety", authenticateToken, async (req, res) => {
    try {
      const newSafety = await insertSafetyChecklist(req.body);
      return res.json({ checklist: newSafety });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to log safety compliance checklist." });
    }
  });

  // Logs Routes
  app.get("/api/logs", authenticateToken, async (req, res) => {
    try {
      const logsList = await queryActivityLogs();
      return res.json({ logs: logsList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch activity audit logs." });
    }
  });

  app.post("/api/logs", authenticateToken, async (req, res) => {
    try {
      const newLog = await insertActivityLog(req.body);
      return res.json({ log: newLog });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to insert activity audit log." });
    }
  });

  // Notifications Routes
  app.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const notifList = await queryNotifications();
      return res.json({ notifications: notifList });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch notification items." });
    }
  });

  app.post("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const newNotif = await insertNotification(req.body);
      return res.json({ notification: newNotif });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to create notification." });
    }
  });

  app.post("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      await updateNotificationReadDb(req.params.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to mark notification as read." });
    }
  });

  app.post("/api/notifications/clear", authenticateToken, async (req, res) => {
    try {
      await clearNotificationsDb();
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to clear notifications." });
    }
  });

  // Chat Routes
  app.get("/api/chat/messages", authenticateToken, async (req: any, res: any) => {
    try {
      const currentUserId = req.user.id;
      const chatMessages = await queryChatMessages();
      const filtered = chatMessages.filter(
        (msg: any) =>
          !msg.receiverId ||
          msg.receiverId === currentUserId ||
          msg.senderId === currentUserId
      );
      return res.json({ messages: filtered });
    } catch (err: any) {
      console.error("Fetch chat error:", err);
      return res.status(500).json({ error: "Failed to fetch chat messages." });
    }
  });

  app.post("/api/chat/messages", authenticateToken, async (req: any, res: any) => {
    try {
      const { text, receiverId } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Message text is required." });
      }

      const sender = await queryUserById(req.user.id);
      if (!sender) {
        return res.status(404).json({ error: "Sender profile not found." });
      }

      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: sender.id,
        senderName: sender.name,
        senderRole: sender.role,
        receiverId: receiverId || undefined,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };

      await insertChatMessage(newMessage);
      return res.json({ message: newMessage });
    } catch (err: any) {
      console.error("Send chat error:", err);
      return res.status(500).json({ error: "Failed to send chat message." });
    }
  });

  // Server-side Gemini AI endpoint
  app.post("/api/ai/advisor", authenticateToken, async (req: any, res: any) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is missing on the server.",
        });
      }

      const { prompt, context } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are the Lab Resource Utilization Platform AI Assistant.
You specialize in university and research laboratory operations, equipment calibration management, scheduling optimization, safety protocol validation, and maintenance issue diagnosis.
Always give concise, professional, actionable insights and structured recommendations suitable for lab administrators, professors, technicians, and maintenance engineers.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\nContext: ${JSON.stringify(
                  context || {}
                )}\n\nQuery: ${prompt}`,
              },
            ],
          },
        ],
      });

      const reply = response.text || "No response generated from AI advisor.";
      return res.json({ reply });
    } catch (error: any) {
      console.error("Error in AI advisor endpoint:", error);
      return res.status(500).json({
        error: error.message || "An error occurred while communicating with Gemini AI.",
      });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

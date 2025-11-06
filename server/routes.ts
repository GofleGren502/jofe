import type { Express } from "express";
import { db } from "./db";
import { 
  children, 
  childHealth,
  childAllergies,
  childMedications,
  childDocuments,
  dailyActivities,
  attendanceRecords,
  childParents,
  staff,
  chatThreads,
  messages,
  notifications,
  invoices,
  subscriptions,
  additionalServices,
  trustedContacts,
  users,
  events,
  extraClasses,
  extraClassEnrollments,
  extraClassAttendance,
  extraClassPerformance,
} from "@shared/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { requireAuth, requireRole, canAccessChild } from "./middleware/rbac";
import { logAccess } from "./middleware/accessLog";

export function registerRoutes(app: Express) {
  // ============================================================================
  // CHILDREN ROUTES
  // ============================================================================
  
  app.get("/api/children", requireAuth, async (req, res) => {
    try {
      const childrenData = await db.select().from(children);
      
      const enrichedChildren = await Promise.all(
        childrenData.map(async (child) => {
          const allergiesList = await db
            .select()
            .from(childAllergies)
            .where(eq(childAllergies.childId, child.id));
          
          const medicationsList = await db
            .select()
            .from(childMedications)
            .where(and(
              eq(childMedications.childId, child.id),
              eq(childMedications.isActive, true)
            ));
          
          const documentsList = await db
            .select()
            .from(childDocuments)
            .where(eq(childDocuments.childId, child.id));

          return {
            ...child,
            allergies: allergiesList,
            medications: medicationsList,
            documents: documentsList,
          };
        })
      );

      res.json(enrichedChildren);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });
  
  app.get("/api/children/:id", requireAuth, canAccessChild, logAccess("child"), async (req, res) => {
    try {
      const childId = parseInt(req.params.id);
      
      const [child] = await db
        .select()
        .from(children)
        .where(eq(children.id, childId))
        .limit(1);
      
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      res.json(child);
    } catch (error) {
      console.error("Error fetching child:", error);
      res.status(500).json({ message: "Failed to fetch child" });
    }
  });
  
  app.get("/api/children/:id/activities", requireAuth, canAccessChild, async (req, res) => {
    try {
      const childId = parseInt(req.params.id);
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      
      const activities = await db
        .select()
        .from(dailyActivities)
        .where(and(
          eq(dailyActivities.childId, childId),
          eq(dailyActivities.date, date)
        ))
        .orderBy(dailyActivities.time);
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Dashboard endpoints - scoped to current user's children
  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get children IDs for current user
      const userChildren = await db
        .select({ childId: childParents.childId })
        .from(childParents)
        .where(eq(childParents.parentUserId, req.user.id));
      
      if (userChildren.length === 0) {
        return res.json([]);
      }
      
      const childIds = userChildren.map(c => c.childId);
      
      const records = await db
        .select()
        .from(attendanceRecords)
        .where(inArray(attendanceRecords.childId, childIds))
        .orderBy(desc(attendanceRecords.date))
        .limit(30);
      
      res.json(records);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      // Get children IDs for current user
      const userChildren = await db
        .select({ childId: childParents.childId })
        .from(childParents)
        .where(eq(childParents.parentUserId, req.user.id));
      
      if (userChildren.length === 0) {
        return res.json([]);
      }
      
      const childIds = userChildren.map(c => c.childId);
      
      const activities = await db
        .select()
        .from(dailyActivities)
        .where(and(
          eq(dailyActivities.date, date),
          inArray(dailyActivities.childId, childIds)
        ))
        .orderBy(dailyActivities.time);
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/extra-classes/enrollments", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get children IDs for current user
      const userChildren = await db
        .select({ childId: childParents.childId })
        .from(childParents)
        .where(eq(childParents.parentUserId, req.user.id));
      
      if (userChildren.length === 0) {
        return res.json([]);
      }
      
      const childIds = userChildren.map(c => c.childId);
      
      const enrollments = await db
        .select()
        .from(extraClassEnrollments)
        .where(inArray(extraClassEnrollments.childId, childIds));
      
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });
  
  app.get("/api/children/:id/health", requireAuth, canAccessChild, logAccess("health"), async (req, res) => {
    try {
      const childId = parseInt(req.params.id);
      
      const [healthData] = await db
        .select()
        .from(childHealth)
        .where(eq(childHealth.childId, childId))
        .limit(1);
      
      const allergiesList = await db
        .select()
        .from(childAllergies)
        .where(eq(childAllergies.childId, childId));
      
      const medicationsList = await db
        .select()
        .from(childMedications)
        .where(eq(childMedications.childId, childId));
      
      // Return safe default if no health record exists
      const response = healthData ? {
        ...healthData,
        allergies: allergiesList,
        medications: medicationsList,
      } : {
        childId,
        bloodType: null,
        allergies: allergiesList,
        medications: medicationsList,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching health data:", error);
      res.status(500).json({ message: "Failed to fetch health data" });
    }
  });
  
  app.get("/api/children/:id/documents", requireAuth, canAccessChild, logAccess("documents"), async (req, res) => {
    try {
      const childId = parseInt(req.params.id);
      
      const documents = await db
        .select()
        .from(childDocuments)
        .where(eq(childDocuments.childId, childId))
        .orderBy(desc(childDocuments.createdAt));
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  app.get("/api/children/:id/invoices", requireAuth, canAccessChild, async (req, res) => {
    try {
      const childId = parseInt(req.params.id);
      
      const invoicesList = await db
        .select()
        .from(invoices)
        .where(eq(invoices.childId, childId))
        .orderBy(desc(invoices.createdAt));
      
      res.json(invoicesList);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  
  // ============================================================================
  // STAFF ROUTES
  // ============================================================================
  
  app.get("/api/staff", requireAuth, async (req, res) => {
    try {
      // Mock staff data
      const mockStaff = [
        {
          id: 1,
          userId: "staff-1",
          facilityId: 1,
          position: "teacher",
          phone: "+7 777 234 5678",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: "staff-1",
            email: "teacher1@kindergarten.kz",
            firstName: "Гульнара",
            lastName: "Жаксыбекова",
            profileImageUrl: null,
            currentRole: "teacher",
            language: "ru",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: 2,
          userId: "staff-2",
          facilityId: 1,
          position: "assistant",
          phone: "+7 777 345 6789",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: "staff-2",
            email: "assistant1@kindergarten.kz",
            firstName: "Айгерім",
            lastName: "Нурланова",
            profileImageUrl: null,
            currentRole: "teacher",
            language: "kk",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];
      
      res.json(mockStaff);
    } catch (error) {
      res.status(500).send("Failed to fetch staff");
    }
  });
  
  // ============================================================================
  // BILLING ROUTES
  // ============================================================================
  
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      // Mock invoices for current user's children
      const mockInvoices = [
        {
          id: 1,
          childId: 1,
          invoiceNumber: "INV-2024-001",
          amount: "85000.00",
          currency: "KZT",
          status: "pending",
          dueDate: "2024-11-15",
          paidAt: null,
          description: "Ежемесячная оплата - Ноябрь 2024",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      res.json(mockInvoices);
    } catch (error) {
      res.status(500).send("Failed to fetch invoices");
    }
  });
  
  app.get("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      // Mock subscriptions
      const mockSubscriptions = [
        {
          id: 1,
          childId: 1,
          planName: "Полный день",
          monthlyAmount: "85000.00",
          isAutoCharge: false,
          nextBillingDate: "2024-12-01",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      res.json(mockSubscriptions);
    } catch (error) {
      res.status(500).send("Failed to fetch subscriptions");
    }
  });
  
  app.get("/api/services", requireAuth, async (req, res) => {
    try {
      // Mock additional services
      const mockServices = [
        {
          id: 1,
          facilityId: 1,
          name: "Английский язык",
          description: "Занятия по английскому языку для детей 4-6 лет",
          price: "15000.00",
          ageMin: 4,
          ageMax: 6,
          daysOfWeek: [1, 3, 5],
          maxParticipants: 10,
          imageUrl: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          facilityId: 1,
          name: "Музыка и танцы",
          description: "Развитие музыкальных способностей и координации",
          price: "12000.00",
          ageMin: 3,
          ageMax: 6,
          daysOfWeek: [2, 4],
          maxParticipants: 15,
          imageUrl: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      res.json(mockServices);
    } catch (error) {
      res.status(500).send("Failed to fetch services");
    }
  });
  
  // ============================================================================
  // CHAT ROUTES
  // ============================================================================
  
  app.get("/api/chat/threads", requireAuth, async (req, res) => {
    try {
      // Mock chat threads
      const mockThreads = [
        {
          id: 1,
          type: "direct",
          groupId: 1,
          title: "Воспитатель Гульнара",
          isPinned: false,
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(Date.now() - 3600000),
        },
        {
          id: 2,
          type: "group_channel",
          groupId: 1,
          title: "Группа Ласточка - Родители",
          isPinned: true,
          createdAt: new Date(Date.now() - 172800000),
          updatedAt: new Date(),
        },
      ];
      
      res.json(mockThreads);
    } catch (error) {
      res.status(500).send("Failed to fetch chat threads");
    }
  });
  
  app.get("/api/chat/threads/:threadId/messages", requireAuth, async (req, res) => {
    try {
      const threadId = parseInt(req.params.threadId);
      
      // Mock messages
      const mockMessages = [
        {
          id: 1,
          threadId,
          senderId: "staff-1",
          content: "Добрый день! Сегодня у нас была очень интересная творческая активность.",
          isImportant: false,
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3600000),
          sender: {
            id: "staff-1",
            email: "teacher1@kindergarten.kz",
            firstName: "Гульнара",
            lastName: "Жаксыбекова",
            profileImageUrl: null,
            currentRole: "teacher",
            language: "ru",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          readReceipts: [],
        },
        {
          id: 2,
          threadId,
          senderId: req.user!.id,
          content: "Спасибо за информацию! Айнур очень любит рисовать.",
          isImportant: false,
          createdAt: new Date(Date.now() - 1800000),
          updatedAt: new Date(Date.now() - 1800000),
          sender: req.user!,
          readReceipts: [
            {
              id: 1,
              messageId: 2,
              userId: "staff-1",
              readAt: new Date(Date.now() - 1200000),
            }
          ],
        },
      ];
      
      res.json(mockMessages);
    } catch (error) {
      res.status(500).send("Failed to fetch messages");
    }
  });
  
  app.get("/api/messages/recent", requireAuth, async (req, res) => {
    try {
      // Mock recent messages for dashboard
      const mockMessages = [
        {
          id: 1,
          threadId: 1,
          senderId: "staff-1",
          content: "Добрый день! Сегодня у нас была очень интересная творческая активность.",
          isImportant: false,
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3600000),
          readReceipts: [],
        },
      ];
      
      res.json(mockMessages);
    } catch (error) {
      res.status(500).send("Failed to fetch recent messages");
    }
  });
  
  // ============================================================================
  // NOTIFICATIONS ROUTES
  // ============================================================================
  
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      // Mock notifications
      const mockNotifications = [
        {
          id: 1,
          userId: req.user!.id,
          type: "payment",
          priority: "normal",
          title: "Новый счёт",
          message: "Счёт INV-2024-001 на сумму 85 000 ₸ ожидает оплаты",
          relatedId: 1,
          isRead: false,
          createdAt: new Date(Date.now() - 7200000),
        },
        {
          id: 2,
          userId: req.user!.id,
          type: "message",
          priority: "normal",
          title: "Новое сообщение",
          message: "Воспитатель Гульнара отправила сообщение",
          relatedId: 1,
          isRead: false,
          createdAt: new Date(Date.now() - 3600000),
        },
      ];
      
      res.json(mockNotifications);
    } catch (error) {
      res.status(500).send("Failed to fetch notifications");
    }
  });
  
  // ============================================================================
  // TRUSTED CONTACTS ROUTES
  // ============================================================================
  
  app.get("/api/trusted-contacts", requireAuth, async (req, res) => {
    try {
      // Mock trusted contacts
      const mockContacts = [
        {
          id: 1,
          parentUserId: req.user!.id,
          childId: 1,
          fullName: "Сейтов Нурлан",
          relationship: "Отец",
          phone: "+7 777 999 8888",
          email: "nurlan@example.com",
          accessExpiresAt: null,
          isActive: true,
          createdAt: new Date(),
        },
      ];
      
      res.json(mockContacts);
    } catch (error) {
      res.status(500).send("Failed to fetch trusted contacts");
    }
  });
  
  // ============================================================================
  // EVENTS ROUTES
  // ============================================================================
  
  app.get("/api/events", requireAuth, async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      let query = db.select().from(events);
      
      if (startDate && endDate) {
        query = query.where(
          and(
            sql`${events.startDate} >= ${startDate}`,
            sql`${events.startDate} <= ${endDate}`
          )
        ) as typeof query;
      }
      
      const eventsList = await query.orderBy(events.startDate);
      res.json(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  // ============================================================================
  // EXTRA CLASSES ROUTES
  // ============================================================================
  
  app.get("/api/extra-classes", requireAuth, async (req, res) => {
    try {
      const classList = await db
        .select()
        .from(extraClasses)
        .where(eq(extraClasses.isActive, true));
      
      res.json(classList);
    } catch (error) {
      console.error("Error fetching extra classes:", error);
      res.status(500).json({ message: "Failed to fetch extra classes" });
    }
  });
  
  app.get("/api/children/:id/extra-classes", requireAuth, canAccessChild, async (req, res) => {
    try {
      const childId = parseInt(req.params.id);
      
      const enrollments = await db
        .select({
          enrollment: extraClassEnrollments,
          class: extraClasses,
        })
        .from(extraClassEnrollments)
        .leftJoin(extraClasses, eq(extraClassEnrollments.extraClassId, extraClasses.id))
        .where(
          and(
            eq(extraClassEnrollments.childId, childId),
            eq(extraClassEnrollments.isActive, true)
          )
        );
      
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching child extra classes:", error);
      res.status(500).json({ message: "Failed to fetch extra classes" });
    }
  });
  
  app.get("/api/enrollments/:enrollmentId/attendance", requireAuth, async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.enrollmentId);
      
      const attendanceList = await db
        .select()
        .from(extraClassAttendance)
        .where(eq(extraClassAttendance.enrollmentId, enrollmentId))
        .orderBy(desc(extraClassAttendance.date));
      
      res.json(attendanceList);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });
  
  app.get("/api/enrollments/:enrollmentId/performance", requireAuth, async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.enrollmentId);
      
      const performanceList = await db
        .select()
        .from(extraClassPerformance)
        .where(eq(extraClassPerformance.enrollmentId, enrollmentId))
        .orderBy(desc(extraClassPerformance.date));
      
      res.json(performanceList);
    } catch (error) {
      console.error("Error fetching performance:", error);
      res.status(500).json({ message: "Failed to fetch performance" });
    }
  });
  
  app.get("/api/children/:id/attendance", requireAuth, canAccessChild, async (req, res) => {
    try {
      const childId = parseInt(req.params.id);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      const conditions = [eq(attendanceRecords.childId, childId)];
      
      if (startDate && endDate) {
        conditions.push(sql`${attendanceRecords.date} >= ${startDate}`);
        conditions.push(sql`${attendanceRecords.date} <= ${endDate}`);
      }
      
      const records = await db
        .select()
        .from(attendanceRecords)
        .where(and(...conditions))
        .orderBy(desc(attendanceRecords.date));
        
      res.json(records);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });
}

import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  pgEnum,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const roleEnum = pgEnum("role", ["parent", "teacher", "admin", "network_owner"]);
export const documentTypeEnum = pgEnum("document_type", ["medical_certificate", "vaccination", "consent", "other"]);
export const documentStatusEnum = pgEnum("document_status", ["valid", "expiring_soon", "expired", "pending"]);
export const activityTypeEnum = pgEnum("activity_type", ["sleep", "meal", "activity", "medication", "mood"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["pending", "paid", "overdue", "cancelled"]);
export const notificationTypeEnum = pgEnum("notification_type", ["payment", "message", "event", "urgent"]);
export const notificationPriorityEnum = pgEnum("notification_priority", ["urgent", "normal", "summary"]);
export const allergySeverityEnum = pgEnum("allergy_severity", ["mild", "moderate", "severe"]);

// ============================================================================
// SESSION & AUTH (Required for Replit Auth)
// ============================================================================

// Session storage table - MANDATORY for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table - MANDATORY for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  currentRole: roleEnum("current_role"),
  language: varchar("language", { length: 2 }).default("ru"), // ru or kk
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  trustedContacts: many(trustedContacts),
  sentMessages: many(messages),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

export const roles = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: roleEnum("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRoles = pgTable("user_roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  facilityId: integer("facility_id").references(() => facilities.id, { onDelete: "cascade" }),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [userRoles.organizationId],
    references: [organizations.id],
  }),
  facility: one(facilities, {
    fields: [userRoles.facilityId],
    references: [facilities.id],
  }),
  group: one(groups, {
    fields: [userRoles.groupId],
    references: [groups.id],
  }),
}));

// ============================================================================
// ORGANIZATIONAL STRUCTURE
// ============================================================================

export const organizations = pgTable("organizations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  facilities: many(facilities),
  userRoles: many(userRoles),
}));

export const facilities = pgTable("facilities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const facilitiesRelations = relations(facilities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [facilities.organizationId],
    references: [organizations.id],
  }),
  groups: many(groups),
  cameras: many(cameras),
  userRoles: many(userRoles),
}));

export const groups = pgTable("groups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  facilityId: integer("facility_id").notNull().references(() => facilities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  ageRange: varchar("age_range", { length: 50 }),
  capacity: integer("capacity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupsRelations = relations(groups, ({ one, many }) => ({
  facility: one(facilities, {
    fields: [groups.facilityId],
    references: [facilities.id],
  }),
  children: many(children),
  staffAssignments: many(staffGroupAssignments),
  schedules: many(groupSchedules),
  chatThreads: many(chatThreads),
  userRoles: many(userRoles),
}));

// ============================================================================
// CHILDREN & PARENTS
// ============================================================================

export const children = pgTable("children", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  photoUrl: varchar("photo_url"),
  enrollmentDate: date("enrollment_date"),
  status: varchar("status", { length: 50 }).default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const childrenRelations = relations(children, ({ one, many }) => ({
  group: one(groups, {
    fields: [children.groupId],
    references: [groups.id],
  }),
  parents: many(childParents),
  healthData: one(childHealth),
  allergies: many(childAllergies),
  medications: many(childMedications),
  documents: many(childDocuments),
  attendanceRecords: many(attendanceRecords),
  dailyActivities: many(dailyActivities),
  invoices: many(invoices),
}));

export const childParents = pgTable("child_parents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  parentUserId: varchar("parent_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  relationship: varchar("relationship", { length: 50 }), // mother, father, guardian
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const childParentsRelations = relations(childParents, ({ one }) => ({
  child: one(children, {
    fields: [childParents.childId],
    references: [children.id],
  }),
  parent: one(users, {
    fields: [childParents.parentUserId],
    references: [users.id],
  }),
}));

// ============================================================================
// STAFF
// ============================================================================

export const staff = pgTable("staff", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  facilityId: integer("facility_id").notNull().references(() => facilities.id, { onDelete: "cascade" }),
  position: varchar("position", { length: 255 }), // teacher, assistant, nurse
  phone: varchar("phone", { length: 50 }),
  status: varchar("status", { length: 50 }).default("active"), // active, on_leave, inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const staffRelations = relations(staff, ({ one, many }) => ({
  user: one(users, {
    fields: [staff.userId],
    references: [users.id],
  }),
  facility: one(facilities, {
    fields: [staff.facilityId],
    references: [facilities.id],
  }),
  groupAssignments: many(staffGroupAssignments),
}));

export const staffGroupAssignments = pgTable("staff_group_assignments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  staffId: integer("staff_id").notNull().references(() => staff.id, { onDelete: "cascade" }),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const staffGroupAssignmentsRelations = relations(staffGroupAssignments, ({ one }) => ({
  staff: one(staff, {
    fields: [staffGroupAssignments.staffId],
    references: [staff.id],
  }),
  group: one(groups, {
    fields: [staffGroupAssignments.groupId],
    references: [groups.id],
  }),
}));

// ============================================================================
// HEALTH DATA
// ============================================================================

export const childHealth = pgTable("child_health", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }).unique(),
  bloodType: varchar("blood_type", { length: 10 }),
  dietRestrictions: text("diet_restrictions"),
  behavioralNotes: text("behavioral_notes"),
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 50 }),
  emergencyContactRelationship: varchar("emergency_contact_relationship", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const childHealthRelations = relations(childHealth, ({ one }) => ({
  child: one(children, {
    fields: [childHealth.childId],
    references: [children.id],
  }),
}));

export const childAllergies = pgTable("child_allergies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  allergen: varchar("allergen", { length: 255 }).notNull(),
  severity: allergySeverityEnum("severity").notNull(),
  protocol: text("protocol"), // what to do if exposed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const childAllergiesRelations = relations(childAllergies, ({ one }) => ({
  child: one(children, {
    fields: [childAllergies.childId],
    references: [children.id],
  }),
}));

export const childMedications = pgTable("child_medications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  medicationName: varchar("medication_name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(),
  frequency: varchar("frequency", { length: 100 }), // e.g., "twice daily"
  administrationTime: varchar("administration_time", { length: 100 }), // e.g., "13:00"
  authorizedBy: varchar("authorized_by", { length: 255 }), // who approved
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const childMedicationsRelations = relations(childMedications, ({ one }) => ({
  child: one(children, {
    fields: [childMedications.childId],
    references: [children.id],
  }),
}));

// ============================================================================
// DOCUMENTS
// ============================================================================

export const childDocuments = pgTable("child_documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  documentType: documentTypeEnum("document_type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"), // in bytes
  status: documentStatusEnum("status").default("valid"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const childDocumentsRelations = relations(childDocuments, ({ one }) => ({
  child: one(children, {
    fields: [childDocuments.childId],
    references: [children.id],
  }),
}));

// ============================================================================
// ATTENDANCE & DAILY ACTIVITIES
// ============================================================================

export const attendanceRecords = pgTable("attendance_records", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  checkInTime: timestamp("check_in_time", { withTimezone: true }),
  checkOutTime: timestamp("check_out_time", { withTimezone: true }),
  checkedInBy: varchar("checked_in_by").references(() => users.id),
  checkedOutBy: varchar("checked_out_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  child: one(children, {
    fields: [attendanceRecords.childId],
    references: [children.id],
  }),
}));

export const dailyActivities = pgTable("daily_activities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  activityType: activityTypeEnum("activity_type").notNull(),
  time: timestamp("time", { withTimezone: true }).notNull(),
  duration: integer("duration"), // in minutes, for sleep
  appetite: integer("appetite"), // percentage 0-100, for meals
  description: text("description"),
  photoUrls: jsonb("photo_urls"), // array of photo URLs
  recordedBy: varchar("recorded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyActivitiesRelations = relations(dailyActivities, ({ one }) => ({
  child: one(children, {
    fields: [dailyActivities.childId],
    references: [children.id],
  }),
}));

export const groupSchedules = pgTable("group_schedules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6, 0 = Sunday
  startTime: varchar("start_time", { length: 10 }).notNull(), // HH:MM
  endTime: varchar("end_time", { length: 10 }).notNull(),
  activityName: varchar("activity_name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupSchedulesRelations = relations(groupSchedules, ({ one }) => ({
  group: one(groups, {
    fields: [groupSchedules.groupId],
    references: [groups.id],
  }),
}));

// ============================================================================
// CHAT & MESSAGING
// ============================================================================

export const chatThreads = pgTable("chat_threads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: varchar("type", { length: 50 }).notNull(), // direct, group_channel, announcement
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  group: one(groups, {
    fields: [chatThreads.groupId],
    references: [groups.id],
  }),
  participants: many(chatParticipants),
  messages: many(messages),
}));

export const chatParticipants = pgTable("chat_participants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  threadId: integer("thread_id").notNull().references(() => chatThreads.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
  quietHoursStart: varchar("quiet_hours_start", { length: 10 }), // HH:MM
  quietHoursEnd: varchar("quiet_hours_end", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatParticipants.threadId],
    references: [chatThreads.id],
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id],
  }),
}));

export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  threadId: integer("thread_id").notNull().references(() => chatThreads.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isImportant: boolean("is_important").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const messagesRelations = relations(messages, ({ one, many }) => ({
  thread: one(chatThreads, {
    fields: [messages.threadId],
    references: [chatThreads.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  attachments: many(messageAttachments),
  readReceipts: many(messageReadReceipts),
}));

export const messageAttachments = pgTable("message_attachments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  fileUrl: varchar("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
  message: one(messages, {
    fields: [messageAttachments.messageId],
    references: [messages.id],
  }),
}));

export const messageReadReceipts = pgTable("message_read_receipts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  messageId: integer("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at", { withTimezone: true }).defaultNow(),
});

export const messageReadReceiptsRelations = relations(messageReadReceipts, ({ one }) => ({
  message: one(messages, {
    fields: [messageReadReceipts.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReadReceipts.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// PAYMENTS & SUBSCRIPTIONS (UI Only - No Stripe)
// ============================================================================

export const subscriptions = pgTable("subscriptions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  planName: varchar("plan_name", { length: 255 }).notNull(),
  monthlyAmount: decimal("monthly_amount", { precision: 10, scale: 2 }).notNull(),
  isAutoCharge: boolean("is_auto_charge").default(false),
  nextBillingDate: date("next_billing_date"),
  status: varchar("status", { length: 50 }).default("active"), // active, cancelled, suspended
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  child: one(children, {
    fields: [subscriptions.childId],
    references: [children.id],
  }),
}));

export const invoices = pgTable("invoices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("KZT"),
  status: invoiceStatusEnum("status").default("pending"),
  dueDate: date("due_date").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  child: one(children, {
    fields: [invoices.childId],
    references: [children.id],
  }),
  payments: many(payments),
}));

export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }), // card, cash, bank_transfer
  transactionId: varchar("transaction_id", { length: 255 }),
  paidAt: timestamp("paid_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const additionalServices = pgTable("additional_services", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  facilityId: integer("facility_id").notNull().references(() => facilities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  ageMin: integer("age_min"),
  ageMax: integer("age_max"),
  daysOfWeek: jsonb("days_of_week"), // array of integers 0-6
  maxParticipants: integer("max_participants"),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const additionalServicesRelations = relations(additionalServices, ({ one, many }) => ({
  facility: one(facilities, {
    fields: [additionalServices.facilityId],
    references: [facilities.id],
  }),
  bookings: many(serviceBookings),
}));

export const serviceBookings = pgTable("service_bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: integer("service_id").notNull().references(() => additionalServices.id, { onDelete: "cascade" }),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("confirmed"), // confirmed, cancelled
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceBookingsRelations = relations(serviceBookings, ({ one }) => ({
  service: one(additionalServices, {
    fields: [serviceBookings.serviceId],
    references: [additionalServices.id],
  }),
  child: one(children, {
    fields: [serviceBookings.childId],
    references: [children.id],
  }),
}));

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  priority: notificationPriorityEnum("priority").default("normal"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"), // invoice_id, message_id, etc
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
  quietHoursStart: varchar("quiet_hours_start", { length: 10 }), // HH:MM
  quietHoursEnd: varchar("quiet_hours_end", { length: 10 }),
  enablePaymentNotifications: boolean("enable_payment_notifications").default(true),
  enableMessageNotifications: boolean("enable_message_notifications").default(true),
  enableEventNotifications: boolean("enable_event_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// VIDEO (Mock)
// ============================================================================

export const cameras = pgTable("cameras", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  facilityId: integer("facility_id").notNull().references(() => facilities.id, { onDelete: "cascade" }),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  streamUrl: varchar("stream_url"), // mock HLS URL
  isActive: boolean("is_active").default(true),
  maxConcurrentSessions: integer("max_concurrent_sessions").default(5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const camerasRelations = relations(cameras, ({ one }) => ({
  facility: one(facilities, {
    fields: [cameras.facilityId],
    references: [facilities.id],
  }),
  group: one(groups, {
    fields: [cameras.groupId],
    references: [groups.id],
  }),
}));

export const videoAccessLogs = pgTable("video_access_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cameraId: integer("camera_id").notNull().references(() => cameras.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessTime: timestamp("access_time", { withTimezone: true }).defaultNow(),
  duration: integer("duration"), // in seconds
  ipAddress: varchar("ip_address", { length: 50 }),
});

// ============================================================================
// SECURITY & AUDIT
// ============================================================================

export const trustedContacts = pgTable("trusted_contacts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  parentUserId: varchar("parent_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  childId: integer("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  accessExpiresAt: timestamp("access_expires_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trustedContactsRelations = relations(trustedContacts, ({ one }) => ({
  parent: one(users, {
    fields: [trustedContacts.parentUserId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [trustedContacts.childId],
    references: [children.id],
  }),
}));

export const accessLogs = pgTable("access_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(), // view_health, view_documents, etc
  resourceType: varchar("resource_type", { length: 100 }), // child, document, etc
  resourceId: integer("resource_id"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});

// ============================================================================
// INSERT SCHEMAS
// ============================================================================

export const insertUserRoleSchema = createInsertSchema(userRoles);
export const insertOrganizationSchema = createInsertSchema(organizations);
export const insertFacilitySchema = createInsertSchema(facilities);
export const insertGroupSchema = createInsertSchema(groups);
export const insertChildSchema = createInsertSchema(children);
export const insertChildParentSchema = createInsertSchema(childParents);
export const insertStaffSchema = createInsertSchema(staff);
export const insertChildHealthSchema = createInsertSchema(childHealth);
export const insertChildAllergySchema = createInsertSchema(childAllergies);
export const insertChildMedicationSchema = createInsertSchema(childMedications);
export const insertChildDocumentSchema = createInsertSchema(childDocuments);
export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords);
export const insertDailyActivitySchema = createInsertSchema(dailyActivities);
export const insertChatThreadSchema = createInsertSchema(chatThreads);
export const insertMessageSchema = createInsertSchema(messages);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertAdditionalServiceSchema = createInsertSchema(additionalServices);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertTrustedContactSchema = createInsertSchema(trustedContacts);

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertChildHealth = z.infer<typeof insertChildHealthSchema>;
export type InsertChildAllergy = z.infer<typeof insertChildAllergySchema>;
export type InsertChildMedication = z.infer<typeof insertChildMedicationSchema>;
export type InsertChildDocument = z.infer<typeof insertChildDocumentSchema>;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
export type InsertChatThread = z.infer<typeof insertChatThreadSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertAdditionalService = z.infer<typeof insertAdditionalServiceSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertTrustedContact = z.infer<typeof insertTrustedContactSchema>;

// SELECT TYPES
export type Organization = typeof organizations.$inferSelect;
export type Facility = typeof facilities.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type Child = typeof children.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type ChildHealth = typeof childHealth.$inferSelect;
export type ChildAllergy = typeof childAllergies.$inferSelect;
export type ChildMedication = typeof childMedications.$inferSelect;
export type ChildDocument = typeof childDocuments.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type DailyActivity = typeof dailyActivities.$inferSelect;
export type ChatThread = typeof chatThreads.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageAttachment = typeof messageAttachments.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type AdditionalService = typeof additionalServices.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type TrustedContact = typeof trustedContacts.$inferSelect;
export type Camera = typeof cameras.$inferSelect;

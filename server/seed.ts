// Seed data for demo/testing
import { db } from "./db";
import { 
  users,
  children,
  childParents,
  staffGroupAssignments,
  childHealth,
  childAllergies,
  childMedications,
  childDocuments,
  dailyActivities,
  staff,
  chatThreads,
  messages,
  notifications,
  invoices,
  subscriptions,
  additionalServices,
  trustedContacts,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  console.log("🌱 Seeding database...");
  
  try {
    // 1. Create organization (query first to get existing or create new)
    const existingOrgs = await db.execute(`SELECT id FROM organizations LIMIT 1`);
    let orgId;
    if (existingOrgs.rows.length > 0) {
      orgId = existingOrgs.rows[0].id;
      console.log("✅ Using existing organization");
    } else {
      const orgResult = await db.execute(`
        INSERT INTO organizations (name, description)
        VALUES ('Детский сад "Балдырған"', 'Сеть детских садов в Алматы')
        RETURNING id
      `);
      orgId = orgResult.rows[0].id;
      console.log("✅ Created organization");
    }
    
    // 2. Create facility (query first to get existing or create new)
    const existingFacilities = await db.execute(`SELECT id FROM facilities WHERE organization_id = ${orgId} LIMIT 1`);
    let facilityId;
    if (existingFacilities.rows.length > 0) {
      facilityId = existingFacilities.rows[0].id;
      console.log("✅ Using existing facility");
    } else {
      const facilityResult = await db.execute(`
        INSERT INTO facilities (organization_id, name, address, phone)
        VALUES (${orgId}, 'Детский сад "Балдырған" - Филиал №1', 'пр. Абая, 150, Алматы', '+7 727 123 4567')
        RETURNING id
      `);
      facilityId = facilityResult.rows[0].id;
      console.log("✅ Created facility");
    }
    
    // 3. Create group (query first to get existing or create new)
    const existingGroups = await db.execute(`SELECT id FROM groups WHERE facility_id = ${facilityId} LIMIT 1`);
    let groupId;
    if (existingGroups.rows.length > 0) {
      groupId = existingGroups.rows[0].id;
      console.log("✅ Using existing group");
    } else {
      const groupResult = await db.execute(`
        INSERT INTO groups (facility_id, name, age_range, capacity)
        VALUES (${facilityId}, 'Средняя группа "Солнышко"', '4-5 лет', 25)
        RETURNING id
      `);
      groupId = groupResult.rows[0].id;
      console.log("✅ Created group");
    }
    
    // 4. Create demo parent user
    const existingParent = await db.select().from(users).where(eq(users.email, "parent@demo.kz")).limit(1);
    let parentUser = existingParent[0];
    if (!parentUser) {
      [parentUser] = await db.insert(users).values({
        email: "parent@demo.kz",
        password: await hashPassword("demo123"),
        firstName: "Алия",
        lastName: "Сейтова",
        currentRole: "parent",
        language: "ru",
      }).returning();
    }
    
    // 5. Create demo teacher user
    const existingTeacher = await db.select().from(users).where(eq(users.email, "teacher@demo.kz")).limit(1);
    let teacherUser = existingTeacher[0];
    if (!teacherUser) {
      [teacherUser] = await db.insert(users).values({
        email: "teacher@demo.kz",
        password: await hashPassword("demo123"),
        firstName: "Гульнара",
        lastName: "Жаксыбекова",
        currentRole: "teacher",
        language: "ru",
      }).returning();
    }
    
    console.log("✅ Created demo users");
    
    // 6. Create demo children
    const [child1] = await db.insert(children).values({
      groupId,
      firstName: "Айнур",
      lastName: "Сейтова",
      dateOfBirth: "2019-03-15",
      enrollmentDate: "2023-09-01",
      status: "active",
    }).returning();
    
    const [child2] = await db.insert(children).values({
      groupId,
      firstName: "Данияр",
      lastName: "Касымов",
      dateOfBirth: "2019-07-22",
      enrollmentDate: "2023-09-01",
      status: "active",
    }).returning();
    
    console.log("✅ Created demo children");
    
    // Create parent-child relationships
    await db.insert(childParents).values({
      childId: child1.id,
      parentUserId: parentUser.id,
      relationship: "mother",
      isPrimary: true,
    }).onConflictDoNothing();
    
    // Create staff record for teacher
    const [teacherStaff] = await db.insert(staff).values({
      userId: teacherUser.id,
      facilityId,
      position: "teacher",
    }).onConflictDoNothing().returning();
    
    // Create staff assignment for teacher
    if (teacherStaff) {
      await db.insert(staffGroupAssignments).values({
        staffId: teacherStaff.id,
        groupId,
        isPrimary: true,
      }).onConflictDoNothing();
    }
    
    console.log("✅ Created parent-child and teacher-group relationships");
    
    // Create health data for child1
    await db.insert(childHealth).values({
      childId: child1.id,
      bloodType: "A+",
      dietRestrictions: "Без арахиса",
      behavioralNotes: "Активный, общительный",
      emergencyContactName: "Сейтова Алия",
      emergencyContactPhone: "+7 777 123 4567",
      emergencyContactRelationship: "Мать",
    });
    
    await db.insert(childAllergies).values({
      childId: child1.id,
      allergen: "Арахис",
      severity: "severe",
      protocol: "Немедленно вызвать врача, использовать эпинефрин",
    });
    
    await db.insert(childMedications).values({
      childId: child1.id,
      medicationName: "Антигистамин",
      dosage: "5мл",
      frequency: "Ежедневно утром",
      administrationTime: "09:00",
      authorizedBy: "Др. Иванов",
      startDate: "2024-01-01",
      isActive: true,
    });
    
    console.log("✅ Created health data");
    
    // Create documents
    await db.insert(childDocuments).values({
      childId: child1.id,
      documentType: "medical_certificate",
      title: "Медицинская справка",
      fileUrl: "/documents/med_cert_1.pdf",
      fileName: "medical_certificate.pdf",
      fileSize: 245632,
      status: "expiring_soon",
      issueDate: "2024-01-01",
      expiryDate: "2024-12-31",
    });
    
    console.log("✅ Created documents");
    
    // Create daily activities
    const today = new Date().toISOString().split('T')[0];
    const mealTime = new Date();
    mealTime.setHours(12, 30, 0, 0);
    const sleepTime = new Date();
    sleepTime.setHours(14, 0, 0, 0);
    
    await db.insert(dailyActivities).values([
      {
        childId: child1.id,
        date: today,
        activityType: "meal",
        time: mealTime,
        appetite: 100,
        description: "Обед: суп, каша, компот",
        recordedBy: teacherUser.id.toString(),
      },
      {
        childId: child1.id,
        date: today,
        activityType: "sleep",
        time: sleepTime,
        duration: 120,
        description: "Тихий час",
        recordedBy: teacherUser.id.toString(),
      },
    ]);
    
    console.log("✅ Created daily activities");
    
    // Create invoices
    await db.insert(invoices).values({
      childId: child1.id,
      invoiceNumber: "INV-2024-001",
      amount: "85000.00",
      status: "pending",
      dueDate: "2024-11-15",
      description: "Ежемесячная оплата - Ноябрь 2024",
    });
    
    console.log("✅ Created invoices");
    
    // Create subscription
    await db.insert(subscriptions).values({
      childId: child1.id,
      planName: "Полный день",
      monthlyAmount: "85000.00",
      nextBillingDate: "2024-12-01",
      status: "active",
    });
    
    console.log("✅ Created subscription");
    
    // Create services
    await db.insert(additionalServices).values([
      {
        facilityId,
        name: "Английский язык",
        description: "Занятия по английскому языку для детей 4-6 лет",
        price: "15000.00",
        ageMin: 4,
        ageMax: 6,
        daysOfWeek: [1, 3, 5],
        maxParticipants: 10,
        isActive: true,
      },
      {
        facilityId,
        name: "Музыка и танцы",
        description: "Развитие музыкальных способностей и координации",
        price: "12000.00",
        ageMin: 3,
        ageMax: 6,
        daysOfWeek: [2, 4],
        maxParticipants: 15,
        isActive: true,
      },
    ]);
    
    console.log("✅ Created services");
    
    // Create chat thread
    const [thread] = await db.insert(chatThreads).values({
      type: "direct",
      groupId,
      title: "Воспитатель Гульнара",
    }).returning();
    
    // Create messages
    await db.insert(messages).values([
      {
        threadId: thread.id,
        senderId: teacherUser.id,
        content: "Добрый день! Сегодня у нас была очень интересная творческая активность.",
      },
      {
        threadId: thread.id,
        senderId: parentUser.id,
        content: "Спасибо за информацию! Айнур очень любит рисовать.",
      },
    ]);
    
    console.log("✅ Created chat messages");
    
    // Create notifications
    await db.insert(notifications).values([
      {
        userId: parentUser.id,
        type: "payment",
        priority: "normal",
        title: "Новый счёт",
        message: "Счёт INV-2024-001 на сумму 85 000 ₸ ожидает оплаты",
        relatedId: 1,
        isRead: false,
      },
      {
        userId: parentUser.id,
        type: "message",
        priority: "normal",
        title: "Новое сообщение",
        message: "Воспитатель Гульнара отправила сообщение",
        relatedId: 1,
        isRead: false,
      },
    ]);
    
    console.log("✅ Created notifications");
    
    console.log("🎉 Database seeded successfully!");
    console.log("\nDemo credentials:");
    console.log("Parent: parent@demo.kz / demo123");
    console.log("Teacher: teacher@demo.kz / demo123");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

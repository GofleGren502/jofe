import { db } from "./db";
import { 
  users,
  organizations,
  facilities,
  groups,
  children,
  childParents,
  staff,
  staffGroupAssignments,
  childHealth,
  childAllergies,
  childMedications,
  childDocuments,
  attendanceRecords,
  dailyActivities,
  chatThreads,
  messages,
  notifications,
  invoices,
  subscriptions,
  events,
  extraClasses,
  extraClassEnrollments,
  extraClassAttendance,
  extraClassPerformance,
  userRoles,
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
    // 1. Create organization
    const [org] = await db.insert(organizations).values({
      name: 'Детский сад "Балдырған"',
      description: 'Сеть детских садов в Алматы',
    }).onConflictDoNothing().returning();
    
    const orgId = org?.id || 1;
    console.log("✅ Created organization");
    
    // 2. Create facility
    const [facility] = await db.insert(facilities).values({
      organizationId: orgId,
      name: 'Детский сад "Балдырған" - Филиал №1',
      address: 'пр. Абая, 150, Алматы',
      phone: '+7 727 123 4567',
    }).onConflictDoNothing().returning();
    
    const facilityId = facility?.id || 1;
    console.log("✅ Created facility");
    
    // 3. Create group
    const [group] = await db.insert(groups).values({
      facilityId,
      name: 'Средняя группа "Солнышко"',
      ageRange: '4-5 лет',
      capacity: 25,
    }).onConflictDoNothing().returning();
    
    const groupId = group?.id || 1;
    console.log("✅ Created group");
    
    // 4. Create demo users
    const [parentUser] = await db.insert(users).values({
      email: "parent@demo.kz",
      password: await hashPassword("demo123"),
      firstName: "Алия",
      lastName: "Сейтова",
      currentRole: "parent",
      language: "ru",
    }).onConflictDoUpdate({
      target: users.email,
      set: { password: await hashPassword("demo123") }
    }).returning();
    
    const [teacherUser] = await db.insert(users).values({
      email: "teacher@demo.kz",
      password: await hashPassword("demo123"),
      firstName: "Гульнара",
      lastName: "Жаксыбекова",
      currentRole: "teacher",
      language: "ru",
    }).onConflictDoUpdate({
      target: users.email,
      set: { password: await hashPassword("demo123") }
    }).returning();
    
    console.log("✅ Created demo users");
    
    // Add user roles
    await db.insert(userRoles).values([
      { userId: parentUser.id, role: "parent", facilityId, groupId },
      { userId: teacherUser.id, role: "teacher", facilityId, groupId },
    ]).onConflictDoNothing();
    
    // 5. Create staff record for teacher
    const [teacherStaff] = await db.insert(staff).values({
      userId: teacherUser.id,
      facilityId,
      position: "Воспитатель",
    }).onConflictDoNothing().returning();
    
    if (teacherStaff) {
      await db.insert(staffGroupAssignments).values({
        staffId: teacherStaff.id,
        groupId,
        isPrimary: true,
      }).onConflictDoNothing();
    }
    
    console.log("✅ Created teacher staff assignment");
    
    // 6. Create 9 children (2 for parent, 7 for teacher's group)
    const childrenData = [
      // Parent's children
      { firstName: "Айнур", lastName: "Сейтова", dateOfBirth: "2019-03-15", forParent: true },
      { firstName: "Арман", lastName: "Сейтов", dateOfBirth: "2020-05-20", forParent: true },
      // Teacher's group children
      { firstName: "Данияр", lastName: "Касымов", dateOfBirth: "2019-07-22", forParent: false },
      { firstName: "Мадина", lastName: "Нурланова", dateOfBirth: "2019-09-10", forParent: false },
      { firstName: "Ерлан", lastName: "Абдуллин", dateOfBirth: "2019-11-05", forParent: false },
      { firstName: "Асель", lastName: "Токтарова", dateOfBirth: "2020-01-18", forParent: false },
      { firstName: "Нурлан", lastName: "Садыков", dateOfBirth: "2019-04-25", forParent: false },
      { firstName: "Айжан", lastName: "Ескалиева", dateOfBirth: "2019-08-30", forParent: false },
      { firstName: "Темирлан", lastName: "Омаров", dateOfBirth: "2020-02-14", forParent: false },
    ];
    
    const createdChildren = [];
    for (const childData of childrenData) {
      const [child] = await db.insert(children).values({
        groupId,
        firstName: childData.firstName,
        lastName: childData.lastName,
        dateOfBirth: childData.dateOfBirth,
        enrollmentDate: "2023-09-01",
        status: "active",
      }).returning();
      createdChildren.push({ ...child, forParent: childData.forParent });
    }
    
    console.log("✅ Created 9 children");
    
    // 7. Create parent-child relationships
    for (const child of createdChildren.filter(c => c.forParent)) {
      await db.insert(childParents).values({
        childId: child.id,
        parentUserId: parentUser.id,
        relationship: child.firstName === "Айнур" ? "mother" : "mother",
        isPrimary: child.firstName === "Айнур",
      }).onConflictDoNothing();
    }
    
    console.log("✅ Created parent-child relationships");
    
    // 8. Create medical data with allergies
    const [child1, child2] = createdChildren;
    
    // Child 1 - has peanut allergy
    await db.insert(childHealth).values({
      childId: child1.id,
      bloodType: "A+",
      dietRestrictions: "Без арахиса",
      behavioralNotes: "Активный, общительный",
      emergencyContactName: "Сейтова Алия",
      emergencyContactPhone: "+7 777 123 4567",
      emergencyContactRelationship: "Мать",
    }).onConflictDoNothing();
    
    await db.insert(childAllergies).values({
      childId: child1.id,
      allergen: "Арахис",
      severity: "severe",
      protocol: "Немедленно вызвать врача, использовать эпинефрин",
    }).onConflictDoNothing();
    
    // Child 2 - citrus contraindication
    await db.insert(childHealth).values({
      childId: child2.id,
      bloodType: "B+",
      dietRestrictions: "Без цитрусовых",
      behavioralNotes: "Спокойный, любознательный",
      emergencyContactName: "Сейтова Алия",
      emergencyContactPhone: "+7 777 123 4567",
      emergencyContactRelationship: "Мать",
    }).onConflictDoNothing();
    
    await db.insert(childAllergies).values({
      childId: child2.id,
      allergen: "Цитрусовые (апельсины, мандарины, лимоны)",
      severity: "moderate",
      protocol: "Избегать цитрусовых в рационе",
    }).onConflictDoNothing();
    
    console.log("✅ Created medical data and allergies");
    
    // 9. Create medical documents for both children
    await db.insert(childDocuments).values([
      {
        childId: child1.id,
        documentType: "medical_certificate",
        title: "Медицинская справка 063/у",
        fileUrl: "/documents/med_cert_child1.pdf",
        fileName: "medical_certificate_ainur.pdf",
        fileSize: 245632,
        status: "valid",
        issueDate: "2024-09-01",
        expiryDate: "2025-08-31",
      },
      {
        childId: child1.id,
        documentType: "vaccination",
        title: "Карта профилактических прививок",
        fileUrl: "/documents/vaccination_child1.pdf",
        fileName: "vaccination_card_ainur.pdf",
        fileSize: 189456,
        status: "valid",
        issueDate: "2024-01-15",
        expiryDate: "2025-12-31",
      },
      {
        childId: child2.id,
        documentType: "medical_certificate",
        title: "Медицинская справка 063/у",
        fileUrl: "/documents/med_cert_child2.pdf",
        fileName: "medical_certificate_arman.pdf",
        fileSize: 232145,
        status: "valid",
        issueDate: "2024-09-01",
        expiryDate: "2025-08-31",
      },
      {
        childId: child2.id,
        documentType: "vaccination",
        title: "Карта профилактических прививок",
        fileUrl: "/documents/vaccination_child2.pdf",
        fileName: "vaccination_card_arman.pdf",
        fileSize: 195478,
        status: "expiring_soon",
        issueDate: "2024-01-10",
        expiryDate: "2024-12-15",
      },
    ]).onConflictDoNothing();
    
    console.log("✅ Created medical documents");
    
    // 10. Create extra classes (English and Music)
    const [englishClass] = await db.insert(extraClasses).values({
      facilityId,
      name: "Английский язык для малышей",
      description: "Занятия по английскому языку в игровой форме для детей 4-6 лет",
      classType: "english",
      teacherName: "Асия Жумабекова",
      monthlyFee: "15000.00",
      schedule: "Понедельник, Среда, Пятница 16:00-17:00",
      isActive: true,
    }).onConflictDoNothing().returning();
    
    const [musicClass] = await db.insert(extraClasses).values({
      facilityId,
      name: "Музыка и ритмика",
      description: "Развитие музыкальных способностей, координации и чувства ритма",
      classType: "music",
      teacherName: "Динара Омарова",
      monthlyFee: "12000.00",
      schedule: "Вторник, Четверг 15:30-16:30",
      isActive: true,
    }).onConflictDoNothing().returning();
    
    console.log("✅ Created extra classes");
    
    // 11. Enroll children in extra classes
    const enrollments = [];
    if (englishClass && musicClass) {
      // Enroll first 2 children in both classes
      for (let i = 0; i < 2; i++) {
        const [englishEnrollment] = await db.insert(extraClassEnrollments).values({
          extraClassId: englishClass.id,
          childId: createdChildren[i].id,
          enrollmentDate: "2024-09-01",
          isActive: true,
        }).returning();
        
        const [musicEnrollment] = await db.insert(extraClassEnrollments).values({
          extraClassId: musicClass.id,
          childId: createdChildren[i].id,
          enrollmentDate: "2024-09-01",
          isActive: true,
        }).returning();
        
        enrollments.push(englishEnrollment, musicEnrollment);
      }
      
      console.log("✅ Enrolled children in extra classes");
      
      // 12. Create attendance and performance records
      const dates = [
        "2024-11-01", "2024-11-04", "2024-11-06",
        "2024-11-08", "2024-11-11", "2024-11-13"
      ];
      
      for (const enrollment of enrollments) {
        // Attendance records
        for (const date of dates) {
          await db.insert(extraClassAttendance).values({
            enrollmentId: enrollment.id,
            date,
            attended: Math.random() > 0.2, // 80% attendance rate
            notes: Math.random() > 0.7 ? "Отличная работа на занятии!" : null,
          }).onConflictDoNothing();
        }
        
        // Performance records (monthly assessments)
        const isEnglish = enrollment.extraClassId === englishClass.id;
        await db.insert(extraClassPerformance).values([
          {
            enrollmentId: enrollment.id,
            date: "2024-10-31",
            score: Math.floor(Math.random() * 20) + 75, // 75-95
            grade: "A",
            notes: isEnglish 
              ? "Хорошо знает алфавит, активно участвует в играх"
              : "Отлично чувствует ритм, с удовольствием поет",
            teacherComments: isEnglish
              ? "Прогресс отличный, продолжайте практиковать дома"
              : "Очень музыкальный ребенок, рекомендую продолжить",
          },
        ]).onConflictDoNothing();
      }
      
      console.log("✅ Created attendance and performance records");
    }
    
    // 13. Create attendance records for regular kindergarten
    const recentDates = Array.from({ length: 10 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    for (const child of createdChildren) {
      for (const date of recentDates) {
        const checkInTime = new Date(date);
        checkInTime.setHours(8, 30, 0, 0);
        const checkOutTime = new Date(date);
        checkOutTime.setHours(17, 30, 0, 0);
        
        await db.insert(attendanceRecords).values({
          childId: child.id,
          date,
          checkInTime,
          checkOutTime,
          checkedInBy: teacherUser.id,
          checkedOutBy: teacherUser.id,
          notes: Math.random() > 0.8 ? "Пришел с хорошим настроением" : null,
        }).onConflictDoNothing();
      }
    }
    
    console.log("✅ Created attendance records");
    
    // 14. Create calendar events
    const upcomingEvents = [
      {
        title: "Новый год",
        description: "Новогодний утренник с участием Деда Мороза и Снегурочки",
        eventType: "holiday" as const,
        startDate: new Date("2024-12-27T10:00:00Z"),
        endDate: new Date("2024-12-27T12:00:00Z"),
        location: "Актовый зал",
      },
      {
        title: "Родительское собрание",
        description: "Обсуждение планов на декабрь и новогодних мероприятий",
        eventType: "parent_meeting" as const,
        startDate: new Date("2024-11-20T18:00:00Z"),
        endDate: new Date("2024-11-20T19:30:00Z"),
        location: "Группа Солнышко",
      },
      {
        title: "Экскурсия в музей",
        description: "Посещение детского научного музея",
        eventType: "excursion" as const,
        startDate: new Date("2024-11-25T09:00:00Z"),
        endDate: new Date("2024-11-25T13:00:00Z"),
        location: "Музей науки, ул. Шевченко 28",
      },
      {
        title: "День рождения садика",
        description: "Празднование 10-летия детского сада",
        eventType: "event" as const,
        startDate: new Date("2024-12-10T11:00:00Z"),
        endDate: new Date("2024-12-10T14:00:00Z"),
        location: "Детский сад",
        isAllDay: false,
      },
      {
        title: "Спортивные соревнования",
        description: "Веселые старты для детей средней группы",
        eventType: "activity" as const,
        startDate: new Date("2024-11-18T10:30:00Z"),
        endDate: new Date("2024-11-18T12:00:00Z"),
        location: "Спортивный зал",
      },
    ];
    
    for (const eventData of upcomingEvents) {
      await db.insert(events).values({
        facilityId,
        groupId,
        ...eventData,
        createdBy: teacherUser.id,
      }).onConflictDoNothing();
    }
    
    console.log("✅ Created calendar events");
    
    // 15. Create daily activities
    const today = new Date().toISOString().split('T')[0];
    for (const child of createdChildren.slice(0, 3)) {
      await db.insert(dailyActivities).values([
        {
          childId: child.id,
          date: today,
          activityType: "meal",
          time: new Date(`${today}T12:30:00Z`),
          appetite: Math.floor(Math.random() * 30) + 70, // 70-100%
          description: "Обед: борщ, котлеты с пюре, компот",
          recordedBy: teacherUser.id,
        },
        {
          childId: child.id,
          date: today,
          activityType: "sleep",
          time: new Date(`${today}T14:00:00Z`),
          duration: 120,
          description: "Тихий час",
          recordedBy: teacherUser.id,
        },
        {
          childId: child.id,
          date: today,
          activityType: "activity",
          time: new Date(`${today}T10:00:00Z`),
          description: "Рисование: тема 'Осень'",
          recordedBy: teacherUser.id,
        },
      ]).onConflictDoNothing();
    }
    
    console.log("✅ Created daily activities");
    
    // 16. Create invoices and subscriptions
    await db.insert(invoices).values({
      childId: child1.id,
      invoiceNumber: "INV-2024-11-001",
      amount: "112000.00", // 85000 base + 15000 English + 12000 Music
      status: "pending",
      dueDate: "2024-11-15",
      description: "Ежемесячная оплата - Ноябрь 2024 (с доп. занятиями)",
    }).onConflictDoNothing();
    
    await db.insert(subscriptions).values({
      childId: child1.id,
      planName: "Полный день + доп. занятия",
      monthlyAmount: "112000.00",
      nextBillingDate: "2024-12-01",
      status: "active",
    }).onConflictDoNothing();
    
    console.log("✅ Created invoices and subscriptions");
    
    // 17. Create chat thread and messages
    const [thread] = await db.insert(chatThreads).values({
      type: "direct",
      groupId,
      title: "Воспитатель Гульнара",
    }).returning();
    
    await db.insert(messages).values([
      {
        threadId: thread.id,
        senderId: teacherUser.id,
        content: "Добрый день, Алия! Сегодня у нас была очень интересная творческая активность. Дети рисовали осенние листья.",
      },
      {
        threadId: thread.id,
        senderId: parentUser.id,
        content: "Спасибо за информацию! Айнур очень любит рисовать. Как она занималась сегодня на английском?",
      },
      {
        threadId: thread.id,
        senderId: teacherUser.id,
        content: "На английском Айнур молодец! Активно участвовала в играх, хорошо запоминает новые слова. Преподаватель очень довольна ее успехами.",
      },
    ]).onConflictDoNothing();
    
    console.log("✅ Created chat messages");
    
    // 18. Create notifications
    await db.insert(notifications).values([
      {
        userId: parentUser.id,
        type: "payment",
        priority: "normal",
        title: "Новый счёт",
        message: "Счёт INV-2024-11-001 на сумму 112 000 ₸ ожидает оплаты",
        relatedId: 1,
        isRead: false,
      },
      {
        userId: parentUser.id,
        type: "event",
        priority: "normal",
        title: "Родительское собрание",
        message: "Родительское собрание состоится 20 ноября в 18:00",
        relatedId: 2,
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
    ]).onConflictDoNothing();
    
    console.log("✅ Created notifications");
    
    console.log("\n🎉 Database seeded successfully!");
    console.log("\nDemo credentials:");
    console.log("Parent: parent@demo.kz / demo123");
    console.log("Teacher: teacher@demo.kz / demo123");
    console.log(`\nCreated ${createdChildren.length} children with full profiles`);
    console.log("✓ Medical data and allergies");
    console.log("✓ Medical documents");
    console.log("✓ Extra classes (English, Music)");
    console.log("✓ Attendance and performance records");
    console.log("✓ Calendar events");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

import { db } from "./db";
import { children, dailyActivities, childParents } from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function addHourlyActivities() {
  console.log("📅 Adding hourly activities for children...");

  try {
    // Get parent's children
    const parentChildren = await db
      .select({ childId: childParents.childId })
      .from(childParents)
      .limit(2);

    if (parentChildren.length < 2) {
      console.log("Not enough children found");
      return;
    }

    const childIds = parentChildren.map(cp => cp.childId);
    const today = new Date().toISOString().split('T')[0];

    // Define daily schedule from 8:00 to 18:00
    const dailySchedule = [
      {
        time: "08:00:00",
        activityType: "activity" as const,
        description: "Прием детей, свободная игра",
        duration: null,
        appetite: null,
      },
      {
        time: "08:30:00",
        activityType: "activity" as const,
        description: "Утренняя зарядка",
        duration: null,
        appetite: null,
      },
      {
        time: "09:00:00",
        activityType: "meal" as const,
        description: "Завтрак: каша, булочка, чай",
        duration: null,
        appetite: 90,
      },
      {
        time: "09:30:00",
        activityType: "activity" as const,
        description: "Развивающие занятия (математика, логика)",
        duration: null,
        appetite: null,
      },
      {
        time: "10:00:00",
        activityType: "activity" as const,
        description: "Творческая мастерская (рисование, лепка)",
        duration: null,
        appetite: null,
      },
      {
        time: "10:30:00",
        activityType: "activity" as const,
        description: "Второй завтрак (фрукты, сок)",
        duration: null,
        appetite: 80,
      },
      {
        time: "11:00:00",
        activityType: "activity" as const,
        description: "Прогулка на свежем воздухе, подвижные игры",
        duration: null,
        appetite: null,
      },
      {
        time: "12:30:00",
        activityType: "meal" as const,
        description: "Обед: суп, второе блюдо, компот",
        duration: null,
        appetite: 95,
      },
      {
        time: "13:00:00",
        activityType: "activity" as const,
        description: "Подготовка ко сну, гигиенические процедуры",
        duration: null,
        appetite: null,
      },
      {
        time: "13:30:00",
        activityType: "sleep" as const,
        description: "Тихий час",
        duration: 120,
        appetite: null,
      },
      {
        time: "15:30:00",
        activityType: "activity" as const,
        description: "Подъем, гимнастика после сна",
        duration: null,
        appetite: null,
      },
      {
        time: "16:00:00",
        activityType: "meal" as const,
        description: "Полдник: выпечка, молоко",
        duration: null,
        appetite: 85,
      },
      {
        time: "16:30:00",
        activityType: "activity" as const,
        description: "Дополнительные занятия (английский язык, музыка)",
        duration: null,
        appetite: null,
      },
      {
        time: "17:00:00",
        activityType: "activity" as const,
        description: "Свободная игра, настольные игры",
        duration: null,
        appetite: null,
      },
      {
        time: "17:30:00",
        activityType: "activity" as const,
        description: "Вечерняя прогулка (при хорошей погоде)",
        duration: null,
        appetite: null,
      },
      {
        time: "18:00:00",
        activityType: "activity" as const,
        description: "Уход домой",
        duration: null,
        appetite: null,
      },
    ];

    // Add activities for both children
    for (const childId of childIds) {
      // Delete existing activities for today to avoid duplicates
      await db
        .delete(dailyActivities)
        .where(and(
          eq(dailyActivities.childId, childId),
          eq(dailyActivities.date, today)
        ));

      // Insert new hourly activities
      for (const activity of dailySchedule) {
        await db.insert(dailyActivities).values({
          childId,
          date: today,
          activityType: activity.activityType,
          time: new Date(`${today}T${activity.time}Z`),
          duration: activity.duration,
          appetite: activity.appetite,
          description: activity.description,
          recordedBy: null,
        });
      }

      console.log(`✅ Added ${dailySchedule.length} activities for child ${childId}`);
    }

    console.log("\n🎉 Hourly activities added successfully!");
  } catch (error) {
    console.error("❌ Error adding hourly activities:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  addHourlyActivities().then(() => process.exit(0)).catch(() => process.exit(1));
}

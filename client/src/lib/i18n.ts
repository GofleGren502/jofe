import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Translation resources for RU and KK
const resources = {
  ru: {
    translation: {
      // Navigation
      dashboard: "Панель управления",
      children: "Дети",
      staff: "Сотрудники",
      payments: "Платежи",
      chats: "Чаты",
      settings: "Настройки",
      
      // Dashboard
      yourChildToday: "Ваш ребёнок сегодня",
      paymentsCard: "Платежи",
      messagesCard: "Сообщения",
      calendar: "Календарь",
      viewDetails: "Подробнее",
      
      // Children
      addChild: "Добавить ребёнка",
      childProfile: "Профиль ребёнка",
      day: "День",
      health: "Здоровье",
      documents: "Документы",
      billing: "Оплата",
      searchChildren: "Поиск детей",
      filterByGroup: "Фильтр по группе",
      allGroups: "Все группы",
      
      // Health
      allergies: "Аллергии",
      medications: "Лекарства",
      dietRestrictions: "Ограничения питания",
      behavioralNotes: "Особенности поведения",
      emergencyContact: "Экстренный контакт",
      severity: "Степень",
      protocol: "Протокол",
      
      // Documents
      uploadDocument: "Загрузить документ",
      noDocuments: "Нет документов",
      expiresOn: "Истекает",
      validUntil: "Действителен до",
      expired: "Истёк",
      expiringSoon: "Истекает скоро",
      valid: "Действителен",
      pending: "В обработке",
      
      // Attendance
      checkIn: "Приход",
      checkOut: "Уход",
      markAttendance: "Отметить посещение",
      attendance: "Посещаемость",
      
      // Activities
      sleep: "Сон",
      meal: "Питание",
      activity: "Активность",
      medication: "Лекарство",
      mood: "Настроение",
      duration: "Длительность",
      appetite: "Аппетит",
      
      // Payments
      invoices: "Счета",
      subscriptions: "Подписки",
      services: "Услуги",
      payNow: "Оплатить",
      paidOn: "Оплачено",
      dueDate: "Срок оплаты",
      amount: "Сумма",
      status: "Статус",
      overdue: "Просрочен",
      autoCharge: "Автоплатёж",
      nextBilling: "Следующее списание",
      
      // Chat
      newMessage: "Новое сообщение",
      sendMessage: "Отправить сообщение",
      attachFile: "Прикрепить файл",
      quietHours: "Тихие часы",
      typing: "печатает...",
      pinned: "Закреплено",
      important: "Важное",
      
      // Notifications
      notifications: "Уведомления",
      events: "События",
      markAllRead: "Отметить всё прочитанным",
      
      // Settings
      language: "Язык",
      timezone: "Часовой пояс",
      trustedContacts: "Доверенные лица",
      addTrustedContact: "Добавить доверенное лицо",
      activeSessions: "Активные сессии",
      logoutAll: "Выйти везде",
      
      // Common
      save: "Сохранить",
      cancel: "Отмена",
      edit: "Редактировать",
      delete: "Удалить",
      add: "Добавить",
      close: "Закрыть",
      confirm: "Подтвердить",
      logout: "Выйти",
      login: "Войти",
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успешно",
      noData: "Нет данных",
      
      // Staff
      addStaff: "Добавить сотрудника",
      position: "Должность",
      teacher: "Воспитатель",
      assistant: "Помощник",
      nurse: "Медсестра",
      active: "Активен",
      onLeave: "В отпуске",
      inactive: "Неактивен",
      
      // Time
      today: "Сегодня",
      yesterday: "Вчера",
      tomorrow: "Завтра",
      minute: "мин",
      minutes: "минут",
      hour: "ч",
      hours: "часов",
      
      // Roles
      parent: "Родитель",
      adminRole: "Администратор",
      networkOwner: "Владелец сети",
      
      // Services
      bookService: "Записаться",
      availability: "Доступность",
      ageRange: "Возраст",
      participants: "Участники",
      
      // Messages
      paymentReminder: "Напоминание об оплате",
      documentExpiring: "Истекает срок документа",
      newMessageNotification: "Новое сообщение",
    }
  },
  kk: {
    translation: {
      // Navigation
      dashboard: "Басқару панелі",
      children: "Балалар",
      staff: "Қызметкерлер",
      payments: "Төлемдер",
      chats: "Чаттар",
      settings: "Баптаулар",
      
      // Dashboard
      yourChildToday: "Сіздің балаңыз бүгін",
      paymentsCard: "Төлемдер",
      messagesCard: "Хабарламалар",
      calendar: "Күнтізбе",
      viewDetails: "Толығырақ",
      
      // Children
      addChild: "Бала қосу",
      childProfile: "Баланың профилі",
      day: "Күн",
      health: "Денсаулық",
      documents: "Құжаттар",
      billing: "Төлем",
      searchChildren: "Балаларды іздеу",
      filterByGroup: "Топ бойынша сүзу",
      allGroups: "Барлық топтар",
      
      // Health
      allergies: "Аллергиялар",
      medications: "Дәрі-дәрмектер",
      dietRestrictions: "Тамақтану шектеулері",
      behavioralNotes: "Мінез-құлық ерекшеліктері",
      emergencyContact: "Жедел байланыс",
      severity: "Дәреже",
      protocol: "Протокол",
      
      // Documents
      uploadDocument: "Құжат жүктеу",
      noDocuments: "Құжаттар жоқ",
      expiresOn: "Мерзімі аяқталады",
      validUntil: "Жарамдылық мерзімі",
      expired: "Мерзімі өткен",
      expiringSoon: "Мерзімі жақында аяқталады",
      valid: "Жарамды",
      pending: "Өңдеуде",
      
      // Attendance
      checkIn: "Келу",
      checkOut: "Кету",
      markAttendance: "Қатысуды белгілеу",
      attendance: "Қатысу",
      
      // Activities
      sleep: "Ұйқы",
      meal: "Тамақтану",
      activity: "Белсенділік",
      medication: "Дәрі",
      mood: "Көңіл-күй",
      duration: "Ұзақтығы",
      appetite: "Тәбет",
      
      // Payments
      invoices: "Шоттар",
      subscriptions: "Жазылымдар",
      services: "Қызметтер",
      payNow: "Төлеу",
      paidOn: "Төленді",
      dueDate: "Төлем мерзімі",
      amount: "Сома",
      status: "Күйі",
      overdue: "Мерзімі өткен",
      autoCharge: "Автоматты төлем",
      nextBilling: "Келесі төлем",
      
      // Chat
      newMessage: "Жаңа хабарлама",
      sendMessage: "Хабарлама жіберу",
      attachFile: "Файл тіркеу",
      quietHours: "Тыныш сағаттар",
      typing: "теруде...",
      pinned: "Бекітілген",
      important: "Маңызды",
      
      // Notifications
      notifications: "Хабарландырулар",
      events: "Оқиғалар",
      markAllRead: "Барлығын оқылған деп белгілеу",
      
      // Settings
      language: "Тіл",
      timezone: "Уақыт белдеуі",
      trustedContacts: "Сенімді байланыстар",
      addTrustedContact: "Сенімді байланыс қосу",
      activeSessions: "Белсенді сеанстар",
      logoutAll: "Барлық жерден шығу",
      
      // Common
      save: "Сақтау",
      cancel: "Болдырмау",
      edit: "Өзгерту",
      delete: "Жою",
      add: "Қосу",
      close: "Жабу",
      confirm: "Растау",
      logout: "Шығу",
      login: "Кіру",
      loading: "Жүктелуде...",
      error: "Қате",
      success: "Сәтті",
      noData: "Деректер жоқ",
      
      // Staff
      addStaff: "Қызметкер қосу",
      position: "Лауазым",
      teacher: "Тәрбиеші",
      assistant: "Көмекші",
      nurse: "Медбике",
      active: "Белсенді",
      onLeave: "Демалыста",
      inactive: "Белсенді емес",
      
      // Time
      today: "Бүгін",
      yesterday: "Кеше",
      tomorrow: "Ертең",
      minute: "мин",
      minutes: "минут",
      hour: "сағ",
      hours: "сағат",
      
      // Roles
      parent: "Ата-ана",
      adminRole: "Әкімші",
      networkOwner: "Желі иесі",
      
      // Services
      bookService: "Жазылу",
      availability: "Қолжетімділік",
      ageRange: "Жас",
      participants: "Қатысушылар",
      
      // Messages
      paymentReminder: "Төлем туралы еске салу",
      documentExpiring: "Құжаттың мерзімі аяқталады",
      newMessageNotification: "Жаңа хабарлама",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ru", // default language
    fallbackLng: "ru",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;

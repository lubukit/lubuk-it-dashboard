const DEFAULT_LOCATION = {
  latitude: 3.139,
  longitude: 101.6869,
  label: "Kuala Lumpur, Malaysia"
};

const weatherCode = {
  0: "Clear",
  1: "Mostly Clear",
  2: "Cloudy",
  3: "Cloudy",
  45: "Foggy",
  48: "Foggy",
  51: "Drizzle",
  53: "Drizzle",
  55: "Drizzle",
  61: "Rainy",
  63: "Rainy",
  65: "Rainy",
  80: "Showers",
  81: "Showers",
  82: "Showers",
  95: "Storm",
  96: "Storm",
  99: "Storm"
};

const $ = (id) => document.getElementById(id);
const memoryStore = {};
const storage = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore[key] || "";
    }
  },
  setItem(key, value) {
    memoryStore[key] = value;
    try {
      window.localStorage.setItem(key, value);
    } catch {}
    queueCloudWrite(key, value);
  },
  removeItem(key) {
    delete memoryStore[key];
    try {
      window.localStorage.removeItem(key);
    } catch {}
    queueCloudDelete(key);
  }
};
const bioFields = ["name", "nickname", "birthday", "phone", "anniversary", "location", "color", "food", "drink", "hobby", "notes"];
const profileFields = ["name", "phone", "email", "address"];
const settingsFields = ["homeName"];
const companyFields = ["name", "ssm", "phone", "email", "instagram", "facebook", "tiktok", "linkedin", "threads", "x", "address"];
const defaultCompany = {
  name: "Lubuk IT Enterprise",
  ssm: "TR0292390-X",
  phone: "01133086136",
  email: "lubukitofficial@gmail.com",
  instagram: "https://www.instagram.com/lubukit/",
  facebook: "https://www.facebook.com/profile.php?id=100093685362450",
  tiktok: "https://www.tiktok.com/@lubukit",
  linkedin: "-",
  threads: "https://www.threads.com/@lubukit",
  x: "https://x.com/ItLubuk81543",
  address: "-"
};
const companyLogoFiles = {
  "full-color": "assets/brand/lubukit-full-color.png",
  "font-color": "assets/brand/lubukit-font-color.png",
  "font-black": "assets/brand/lubukit-font-black.png",
  "icon-color": "assets/brand/lubukit-icon-color.png",
  "icon-black": "assets/brand/lubukit-icon-black.png",
  "logo-dp": "assets/brand/lubukit-logo-dp.jpg"
};
let musicMode = "music";
let selectedCalendarDate = new Date();
let quotationItems = [];
let companyEditMode = false;
let editingPriceServiceIndex = -1;
let activeProjectChatId = null;
let chatUnsubscribe = null;
let firestoreDb = null;
let firebaseAuth = null;
let currentAccount = null;
let cloudSyncReady = false;
let cloudUnsubscribe = null;
let suppressCloudWrite = false;
let priceHoldTimer = null;
let priceHoldTriggered = false;
let installPromptEvent = null;
let attendanceStream = null;
let attendancePhotoData = "";
let staffPhotoData = "";
let firstAccessPhotoData = "";
const quotes = [
  "Small steps, strong home.",
  "Control the day before it controls you.",
  "Tenang dulu, kemudian buat satu-satu.",
  "Discipline beats mood.",
  "Hari ini buat lebih baik sedikit.",
  "Jaga rumah, jaga hati, jaga fokus."
];
const defaultDevices = {
  aircon: true,
  tv: false,
  lighting: false,
  speaker: false
};
const roleLabels = {
  boss: "Boss",
  admin: "Admin",
  hr: "HR",
  sale: "Sale",
  marketing: "Marketing",
  graphic_designer: "Graphic Designer",
  client: "Client",
  pending: "Pending Approval"
};
const rolePermissions = {
  boss: ["all"],
  admin: ["lubuk:view", "company:manage", "pricelist:manage", "sales:manage", "project:manage", "task:manage", "attendance:self", "attendance:manage", "staff:manage", "sop:manage", "achievement:manage", "chat:send", "report:view", "settings:manage"],
  hr: ["lubuk:view", "attendance:self", "attendance:manage", "staff:manage", "task:view", "sop:manage", "achievement:manage", "chat:send", "report:view"],
  sale: ["lubuk:view", "company:view", "pricelist:view", "sales:manage", "project:manage", "task:view", "attendance:self", "sop:view", "chat:send", "report:view"],
  marketing: ["lubuk:view", "company:view", "pricelist:view", "sales:manage", "project:manage", "task:view", "attendance:self", "sop:view", "chat:send", "report:view"],
  graphic_designer: ["lubuk:view", "company:view", "project:view", "task:self", "attendance:self", "sop:view", "achievement:view", "chat:send", "report:view"],
  client: ["chat:send"],
  pending: []
};
const syncedStorageKeys = new Set([
  "settings",
  "company",
  "pricelist",
  "sales",
  "staffTasks",
  "attendanceRecords",
  "staffProfiles",
  "staffApplications",
  "sops",
  "achievements",
  "projectChatRooms"
]);
const demoSongs = [
  {
    title: "Hujan",
    artist: "Search YouTube",
    query: "hujan official music video",
    lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik."
  },
  {
    title: "Hujan Lyrics",
    artist: "Search YouTube",
    query: "hujan lyrics video",
    lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik."
  },
  {
    title: "Hujan Cover",
    artist: "Search YouTube",
    query: "hujan cover acoustic",
    lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik."
  },
  {
    title: "Perfect",
    artist: "Ed Sheeran",
    videoId: "2Vv-BfVoq4g",
    lyrics: "Lirik penuh tidak dimasukkan secara automatik.\nPaste lirik sendiri di sini, kemudian tekan Save Lirik."
  },
  {
    title: "Until I Found You",
    artist: "Stephen Sanchez",
    videoId: "GxldQ9eX2wo",
    lyrics: "Lirik penuh tidak dimasukkan secara automatik.\nPaste lirik sendiri di sini, kemudian tekan Save Lirik."
  },
  {
    title: "Sempurna",
    artist: "Andra and The Backbone",
    videoId: "fN5HV79_8B8",
    lyrics: "Lirik penuh tidak dimasukkan secara automatik.\nPaste lirik sendiri di sini, kemudian tekan Save Lirik."
  }
];
const DEFAULT_PRICELIST_SEED = "lubuk-pricelist-2025-v2";
const DEFAULT_PRICELIST = [
  {
    service: "E-Commerce Poster Design",
    image: "assets/pricelist/ecommerce-poster-design.jpg",
    theme: "#f7b500",
    addOns: "Extra Revision RM5-RM10 | Resize RM10 | Full Source File RM20 | Fast Track RM25",
    packages: [
      { name: "1 Design", amount: 39, details: "1 Poster E-commerce | Free Revisions | Format JPG/PNG | 1-2 days" },
      { name: "3 Design", amount: 99, details: "3 Poster E-commerce | Free Revisions | Format JPG/PNG + PDF | 2-3 days" },
      { name: "5 Design", amount: 159, details: "5 Poster E-commerce | Free Revisions | Format JPG/PNG + PDF | 3-5 days" }
    ]
  },
  {
    service: "Flyers Design",
    image: "assets/pricelist/flyers-design.jpg",
    theme: "#22b9f2",
    addOns: "Extra Revision RM5-RM10 | Resize RM10 | Full Source File RM30 | Fast Track RM30",
    packages: [
      { name: "1 Design", amount: 49, details: "1 Design Flyers | Free Revisions | Saiz standard A5/A6 | Format JPG/PNG | 1-2 days" },
      { name: "3 Design", amount: 129, details: "3 Design Flyers | Free Revisions | Saiz standard A5/A6 | Format JPG/PNG + PDF | 2-4 days" },
      { name: "5 Design", amount: 199, details: "5 Design Flyers | Free Revisions | Saiz standard A5/A6 | Format JPG/PNG + PDF | 3-6 days" }
    ]
  },
  {
    service: "Poster Social Media",
    image: "assets/pricelist/poster-social-media.jpg",
    theme: "#2564d8",
    addOns: "Extra Revision RM5-RM10 | Resize RM10 | Full Source File RM10 | Fast Track RM20",
    packages: [
      { name: "1 Poster", amount: 39, details: "1 Design Poster | Free Revision | Format PNG/JPG | 1-2 days" },
      { name: "2 Poster", amount: 75, details: "2 Design Poster | Free Revision | Format PNG/JPG | 1-2 days" },
      { name: "3 Poster", amount: 105, details: "3 Design Poster | Free Revision | Format PNG/JPG + PDF | 2-3 days" }
    ]
  },
  {
    service: "Menu Design",
    image: "assets/pricelist/menu-design.jpg",
    theme: "#4acb1f",
    addOns: "Extra Revision RM10-RM15 | Resize RM20 | Full Source File RM40 | Fast Track RM40",
    packages: [
      { name: "1 Muka Surat", amount: 50, details: "1 muka surat | Untuk 5-10 item F&B | Free Revision | High-Res Format JPG & PDF | 1-2 days" },
      { name: "2 Muka Surat", amount: 145, details: "3 muka surat | Untuk 11-30 item F&B | Free Revision | High-Res Format JPG & PDF | 2-4 days" },
      { name: "5 Muka Surat", amount: 239, details: "5 muka surat | Untuk 31-60 item F&B | Free Revision | High-Res Format JPG & PDF | 4-6 days" }
    ]
  },
  {
    service: "Packaging Design",
    image: "assets/pricelist/packaging-design.jpg",
    theme: "#bf9635",
    addOns: "Extra Revision RM15 | Resize RM20 | Full Source File RM40 | Fast Track RM30 | 1x Mockup RM30 | 1x Die-Cut RM20",
    packages: [
      { name: "1 Packaging", amount: 69, details: "1 Design Packaging | Free Revision | File JPEG/PDF | 1-2 days" },
      { name: "2 Packaging", amount: 129, details: "2 Design Packaging | Free Revision | File JPEG/PDF | 2-3 days" },
      { name: "3 Packaging", amount: 179, details: "3 Design Packaging | Free Revision | File JPEG/PDF | 2-4 days" }
    ]
  },
  {
    service: "Bunting & Banner Design",
    image: "assets/pricelist/bunting-banner-design.jpg",
    theme: "#f0448d",
    addOns: "Extra Revision RM5-RM10 | Resize RM10 | Full Source File RM30 | Fast Track RM15",
    packages: [
      { name: "1 Design", amount: 45, details: "1 Design Banner/Bunting | Free Revision | Format JPG + PDF | 1-2 days" },
      { name: "3 Design", amount: 135, details: "3 Design Banner/Bunting | Free Revision | Format JPG + PDF | 2-3 days" },
      { name: "5 Design", amount: 199, details: "5 Design Banner/Bunting | Free Revision | Format JPG + PDF | 3-5 days" }
    ]
  },
  {
    service: "Poster Design",
    image: "assets/pricelist/poster-design.jpg",
    theme: "#8b28e6",
    addOns: "Extra Revision RM5-RM10 | Resize RM10 | Full Source File RM30 | Fast Track RM20 | Custom Illustrasi RM50+",
    packages: [
      { name: "1 Poster", amount: 49, details: "1 Poster Design | Free Revision | Saiz A3/A4 | Format JPG/PNG | 1-2 days" },
      { name: "3 Poster", amount: 129, details: "3 Poster Design | Free Revision | Saiz A3/A4 | Format JPG/PNG + PDF | 2-4 days" },
      { name: "5 Poster", amount: 199, details: "5 Poster Design | Free Revision | Saiz A3/A4 | Format JPG/PNG + PDF | 3-5 days" }
    ]
  },
  {
    service: "Sticker Design",
    image: "assets/pricelist/sticker-design.jpg",
    theme: "#ff5b10",
    addOns: "Extra Revision RM10 | Resize RM10 | Full Source File RM30 | Custom Character RM50+ | Fast Track RM30",
    packages: [
      { name: "1 Sticker", amount: 39, details: "1 Design Sticker | Free Revision | Format JPG/PNG | 1-2 days" },
      { name: "3 Sticker", amount: 109, details: "3 Design Sticker | Free Revision | Format JPG/PNG | 2-3 days" },
      { name: "5 Sticker", amount: 175, details: "5 Design Sticker | Free Revision | Format JPG/PNG | 3-4 days" }
    ]
  },
  {
    service: "Tiktok Live Design",
    image: "assets/pricelist/tiktok-live-design.jpg",
    theme: "#1b1b1f",
    addOns: "Extra Revision RM5 | Resize RM20 | Full Source File RM40 | Weekly theme change RM40 | Extra frame/background RM30 | Extra sticker RM15",
    packages: [
      { name: "Basic", amount: 65, details: "1 Frame Live | 1 Background | 1-2 days" },
      { name: "Advance", amount: 119, details: "1 Frame Live | 1 Background | 3 Sticker | 1-2 days" },
      { name: "Premium", amount: 199, details: "2 Frame Live boleh tukar tema | 2 Background | 5 Sticker | 2-4 days" }
    ]
  },
  {
    service: "Logo & Branding",
    image: "assets/pricelist/logo-branding.jpg",
    theme: "#d51f2d",
    addOns: "Extra Revision RM10 | Extra Collateral RM50 | Full Source File RM50 | Fast Track RM50",
    packages: [
      { name: "Start-Up", amount: 89, details: "1 Logo design | Free Revision | 4 days" },
      { name: "Growth", amount: 399, details: "2 Logo design | Free Revision | 3x Collateral design | Color palette | 2 weeks" },
      { name: "Premium", amount: 1199, details: "3 Logo design | Free Revision + 1 | 3x Collateral design | Color palette | Brand pattern design | Brand guideline | Full sources file | 4 weeks" }
    ]
  }
];

function setDate() {
  $("today").textContent = new Intl.DateTimeFormat("en-MY", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());
}

function setMainGreeting() {
  const hour = new Date().getHours();
  let greeting = "Hey";
  if (hour >= 5 && hour < 12) greeting = "Good Morning";
  if (hour >= 12 && hour < 18) greeting = "Good Afternoon";
  if (hour >= 18 && hour < 22) greeting = "Good Evening";
  if (hour >= 22 || hour < 5) greeting = "Good Night";
  $("timeGreeting").textContent = greeting;
}

function setMainQuote() {
  const quote = document.getElementById("mainQuote");
  if (!quote) return;
  const dayIndex = Math.floor(Date.now() / 86400000) % quotes.length;
  quote.textContent = quotes[dayIndex];
}

function updateWeatherIcon(condition) {
  const icon = $("weatherIcon");
  icon.classList.toggle("rain", /Rain|Shower|Storm|Drizzle/i.test(condition));
  icon.classList.toggle("clear", /Clear/i.test(condition));
}

function activeViewName() {
  return document.querySelector(".tab.active")?.dataset.tab || "main";
}

function canRenderWeather() {
  return !["main", "personal", "lubuk"].includes(activeViewName());
}

function setMetricLabels(labels) {
  document.querySelectorAll(".weather-meta dd").forEach((label, index) => {
    label.textContent = labels[index] || "";
  });
}

function updateWeather(data, placeLabel) {
  if (!canRenderWeather()) return;
  setMetricLabels(["Sensible", "Humidity", "W. force", "Pressure"]);
  document.querySelector(".weather-card").classList.remove("sale-summary-card");
  $("weatherIcon").classList.remove("sale-mark");
  const current = data.current;
  const condition = weatherCode[current.weather_code] || "Cloudy";
  const temp = toDisplayTemp(current.temperature_2m);
  const feels = toDisplayTemp(current.apparent_temperature);

  $("condition").textContent = condition;
  $("place").textContent = placeLabel;
  $("temperature").textContent = Math.round(temp);
  $("feelsLike").textContent = `${Math.round(feels)}°`;
  $("humidity").textContent = `${Math.round(current.relative_humidity_2m)}%`;
  $("wind").textContent = Math.round(current.wind_speed_10m);
  $("pressure").textContent = `${Math.round(current.surface_pressure)}hpa`;
  updateWeatherIcon(condition);
  refreshUsageStats();
}

function toDisplayTemp(celsius) {
  return getSettings().tempUnit === "f" ? (celsius * 9 / 5) + 32 : celsius;
}

async function getDeviceLocation() {
  const fallbackLocation = { ...DEFAULT_LOCATION, label: getSettings().weatherPlace || DEFAULT_LOCATION.label };
  if (!("geolocation" in navigator)) return fallbackLocation;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: "Lokasi semasa"
      }),
      () => resolve(fallbackLocation),
      { enableHighAccuracy: false, timeout: 6500, maximumAge: 900000 }
    );
  });
}

async function loadWeather() {
  if (!canRenderWeather()) return;
  setMetricLabels(["Sensible", "Humidity", "W. force", "Pressure"]);
  document.querySelector(".weather-card").classList.remove("sale-summary-card");
  $("weatherIcon").classList.remove("sale-mark");
  $("condition").textContent = "Memuatkan";
  $("place").textContent = "Mengambil cuaca";

  try {
    const location = await getDeviceLocation();
    const params = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m",
      timezone: "auto"
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) throw new Error("Weather request failed");
    updateWeather(await response.json(), location.label);
  } catch {
    if (!canRenderWeather()) return;
    $("condition").textContent = "Cloudy";
    $("place").textContent = getSettings().weatherPlace || DEFAULT_LOCATION.label;
    $("temperature").textContent = String(Math.round(toDisplayTemp(28)));
    $("feelsLike").textContent = `${Math.round(toDisplayTemp(31))}°`;
    $("humidity").textContent = "65%";
    $("wind").textContent = "3";
    $("pressure").textContent = "1009hpa";
    updateWeatherIcon("Cloudy");
    refreshUsageStats();
  }
}

function normalisePhone(value) {
  return value.replace(/[^\d]/g, "");
}

function getBio() {
  try {
    return JSON.parse(storage.getItem("loveBio") || "{}");
  } catch {
    return {};
  }
}

function setBio(bio) {
  storage.setItem("loveBio", JSON.stringify(bio));
}

function readJson(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(storage.getItem(key) || "{}") };
  } catch {
    return { ...fallback };
  }
}

function getStoredAccount() {
  try {
    return JSON.parse(storage.getItem("accountSession") || "null");
  } catch {
    return null;
  }
}

function isFirebaseUserLoggedIn() {
  return Boolean(firebaseConfig().enabled && firebaseAuth?.currentUser);
}

function hasLocalAccountSession() {
  const account = getStoredAccount();
  return Boolean(account?.email || account?.name);
}

function isAppLoggedIn() {
  return firebaseConfig().enabled ? isFirebaseUserLoggedIn() : hasLocalAccountSession();
}

function normaliseRole(role) {
  return rolePermissions[role] ? role : "graphic_designer";
}

function getCurrentAccount() {
  if (currentAccount) return currentAccount;
  const firebaseRequired = Boolean(firebaseConfig().enabled);
  currentAccount = getStoredAccount() || {
    name: firebaseRequired ? "Guest" : "Muaz",
    email: firebaseRequired ? "" : getProfile().email || "boss@lubukit.local",
    role: firebaseRequired ? "pending" : "boss",
    local: true
  };
  return currentAccount;
}

function setCurrentAccount(account) {
  currentAccount = {
    name: account.name || account.email || "User",
    email: account.email || "",
    role: normaliseRole(account.role || "graphic_designer"),
    local: Boolean(account.local)
  };
  storage.setItem("accountSession", JSON.stringify(currentAccount));
  applyProfile();
  applyRoleAccess();
}

function clearCurrentAccount() {
  currentAccount = null;
  storage.removeItem("accountSession");
  applyProfile();
  applyRoleAccess();
}

function canAccess(permission) {
  const role = getCurrentAccount().role;
  const permissions = rolePermissions[role] || [];
  return permissions.includes("all") || permissions.includes(permission);
}

function requirePermission(permission, label = "fungsi ini") {
  if (canAccess(permission)) return true;
  window.alert(`${roleLabels[getCurrentAccount().role] || "Role ini"} tidak boleh access ${label}.`);
  return false;
}

function isStaffSelf(nameOrEmail) {
  const account = getCurrentAccount();
  const value = String(nameOrEmail || "").trim().toLowerCase();
  return value && [account.email, account.name].filter(Boolean).map((item) => item.toLowerCase()).includes(value);
}

function canManageTask(task) {
  return canAccess("task:manage") || (canAccess("task:self") && isStaffSelf(task?.staff));
}

function canViewLubukPanel(panel) {
  if (panel === "attendance") {
    return canAccess("lubuk:view") && (canAccess("attendance:self") || canAccess("attendance:manage"));
  }
  const permissionMap = {
    company: "company:view",
    pricelist: "pricelist:view",
    sales: "sales:view",
    project: "project:view",
    task: "task:view",
    sop: "sop:view",
    achievement: "achievement:view"
  };
  const permission = permissionMap[panel] || "lubuk:view";
  return canAccess("lubuk:view") && (canAccess(permission) || canAccess(permission.replace(":view", ":manage")));
}

function updateAccessScreen() {
  const account = getCurrentAccount();
  const loggedIn = isAppLoggedIn();
  const waitingApproval = loggedIn && account.role === "pending";
  document.body.classList.toggle("needs-login", !loggedIn);
  document.body.classList.toggle("waiting-approval", waitingApproval);
  $("authGate")?.toggleAttribute("hidden", loggedIn);
  $("approvalWaiting")?.toggleAttribute("hidden", !waitingApproval);
  document.querySelector(".bottom-nav")?.toggleAttribute("hidden", !loggedIn || waitingApproval);
  document.querySelector(".weather-card")?.toggleAttribute("hidden", !loggedIn || waitingApproval);
  $("lubukView")?.toggleAttribute("hidden", !loggedIn || waitingApproval);
  if (!loggedIn || waitingApproval) {
    closeAllPanels();
  }
}

function firebaseConfig() {
  return window.firebaseAppConfig || {};
}

function businessDocPath() {
  return firebaseConfig().businessId || "lubuk-it";
}

function initFirebaseCore() {
  const config = firebaseConfig();
  if (!config.enabled || !window.firebase?.initializeApp) return null;
  try {
    if (!window.firebase.apps?.length) window.firebase.initializeApp(config);
    firebaseAuth = window.firebase.auth?.() || null;
    firestoreDb = window.firebase.firestore?.() || null;
    return { auth: firebaseAuth, db: firestoreDb };
  } catch {
    return null;
  }
}

function cloudStorageDoc(key) {
  if (!firestoreDb || !firebaseConfig().syncEnabled) return null;
  return firestoreDb.collection("businesses").doc(businessDocPath()).collection("storage").doc(key);
}

function queueCloudWrite(key, value) {
  if (suppressCloudWrite || !cloudSyncReady || !syncedStorageKeys.has(key)) return;
  const doc = cloudStorageDoc(key);
  if (!doc) return;
  doc.set({
    value,
    updatedAt: Date.now(),
    updatedBy: getCurrentAccount().email || getCurrentAccount().name || "local"
  }, { merge: true }).catch(() => {});
}

function forceCloudWrite(key, value) {
  if (!syncedStorageKeys.has(key)) return;
  const doc = cloudStorageDoc(key);
  if (!doc) return;
  doc.set({
    value,
    updatedAt: Date.now(),
    updatedBy: getCurrentAccount().email || getCurrentAccount().name || "local"
  }, { merge: true }).catch(() => {});
}

function queueCloudDelete(key) {
  if (suppressCloudWrite || !cloudSyncReady || !syncedStorageKeys.has(key)) return;
  const doc = cloudStorageDoc(key);
  if (!doc) return;
  doc.delete().catch(() => {});
}

async function pullCloudStorage() {
  if (!firestoreDb || !firebaseConfig().syncEnabled || (firebaseConfig().enabled && !firebaseAuth?.currentUser)) return;
  try {
    const snapshot = await firestoreDb.collection("businesses").doc(businessDocPath()).collection("storage").get();
    suppressCloudWrite = true;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (syncedStorageKeys.has(doc.id) && typeof data.value === "string") {
        memoryStore[doc.id] = data.value;
        try {
          window.localStorage.setItem(doc.id, data.value);
        } catch {}
      }
    });
  } catch {
    if (firebaseAuth?.currentUser) window.alert("Cloud sync tidak dapat dibaca. Semak Firestore Rules atau permission account ini.");
  } finally {
    suppressCloudWrite = false;
  }
}

function subscribeCloudStorage() {
  if (!firestoreDb || !firebaseConfig().syncEnabled || (firebaseConfig().enabled && !firebaseAuth?.currentUser)) return;
  if (cloudUnsubscribe) cloudUnsubscribe();
  cloudUnsubscribe = firestoreDb.collection("businesses").doc(businessDocPath()).collection("storage")
    .onSnapshot((snapshot) => {
      suppressCloudWrite = true;
      snapshot.docChanges().forEach((change) => {
        const key = change.doc.id;
        if (!syncedStorageKeys.has(key)) return;
        if (change.type === "removed") {
          memoryStore[key] = "";
          try { window.localStorage.removeItem(key); } catch {}
          return;
        }
        const value = change.doc.data().value;
        if (typeof value !== "string") return;
        memoryStore[key] = value;
        try { window.localStorage.setItem(key, value); } catch {}
      });
      suppressCloudWrite = false;
      refreshSyncedViews();
    }, () => {});
}

function refreshSyncedViews() {
  refreshAccountRoleFromStaff();
  applyProfile();
  renderPricelist();
  renderSales();
  renderProjects();
  renderTasks();
  renderAdminTasks();
  renderAttendance();
  renderStaffProfiles();
  renderSops();
  renderAchievements();
  renderSaleSummary();
}

async function initialiseCloudSync() {
  const services = initFirebaseCore();
  if (services?.auth) {
    services.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        cloudSyncReady = false;
        if (cloudUnsubscribe) cloudUnsubscribe();
        cloudUnsubscribe = null;
        if (firebaseConfig().enabled) clearCurrentAccount();
        return;
      }
      await pullCloudStorage();
      const staff = findStaffByEmail(user.email);
      setCurrentAccount({
        name: staff?.name || user.displayName || user.email,
        email: user.email,
        role: staff?.role || "pending",
        local: false
      });
      cloudSyncReady = true;
      subscribeCloudStorage();
      refreshSyncedViews();
    });
  }
  if (!services?.db || !firebaseConfig().syncEnabled || firebaseConfig().enabled) return;
  await pullCloudStorage();
  cloudSyncReady = true;
  subscribeCloudStorage();
}

function findStaffByEmail(email) {
  const clean = String(email || "").trim().toLowerCase();
  return getStaffProfiles().find((staff) => String(staff.email || "").trim().toLowerCase() === clean);
}

function staffDisplayName(value) {
  const clean = String(value || "").trim();
  const staff = findStaffByEmail(clean);
  return staff?.name || clean || "Staff";
}

function refreshAccountRoleFromStaff() {
  const account = getCurrentAccount();
  if (!account.email) return;
  const staff = findStaffByEmail(account.email);
  if (!staff?.role || staff.role === account.role) return;
  setCurrentAccount({
    ...account,
    name: staff.name || account.name,
    role: staff.role
  });
}

function openAuthPanel() {
  openAppPanel("authPanel");
  const account = getCurrentAccount();
  $("authEmail").value = account.email || "";
}

async function loginAccount(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const emailInput = form?.elements?.email || $("authEmail");
  const passwordInput = form?.elements?.password || $("authPassword");
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const services = initFirebaseCore();

  if (services?.auth && firebaseConfig().enabled) {
    try {
      const credential = await services.auth.signInWithEmailAndPassword(email, password);
      const staff = findStaffByEmail(email);
      setCurrentAccount({
        name: staff?.name || credential.user?.displayName || email,
        email,
        role: staff?.role || "pending",
        local: false
      });
      passwordInput.value = "";
      closeNavPanel();
      window.alert("Login berjaya.");
      return;
    } catch {
      window.alert("Login Firebase gagal. Semak email/password atau Firebase Auth.");
      return;
    }
  }

  const staff = findStaffByEmail(email);
  setCurrentAccount({
    name: staff?.name || email || "Staff",
    email,
    role: staff?.role || "pending",
    local: true
  });
  passwordInput.value = "";
  closeNavPanel();
  window.alert(staff?.role ? "Login local aktif untuk testing." : "Account belum ada role. Tunggu approval role.");
}

function showSignupGate() {
  $("authGateTitle").textContent = "Create Account";
  $("authGateIntro").textContent = "Staff baru isi detail di sini. Selepas daftar, tunggu Boss/Admin/HR approve role.";
  $("authGateLoginForm").hidden = true;
  $("firstAccessForm").hidden = false;
}

function showLoginGate() {
  $("authGateTitle").textContent = "Login Your Account";
  $("authGateIntro").textContent = "Masukkan email dan password. Role akan ikut database staff yang sudah di-approve.";
  $("firstAccessForm").hidden = true;
  $("authGateLoginForm").hidden = false;
}

async function registerFirstAccess(event) {
  event.preventDefault();
  const name = $("firstAccessName").value.trim();
  const email = $("firstAccessEmail").value.trim().toLowerCase();
  const password = $("firstAccessPassword").value;
  const phone = $("firstAccessPhone").value.trim();
  if (!name || !email || !password || !phone || !firstAccessPhotoData) {
    window.alert("Sila lengkapkan nama, email, password, gambar profile dan no telephone.");
    return;
  }
  const profile = { name, email, phone, address: "", avatar: firstAccessPhotoData };
  setProfile(profile);
  upsertStaffApplication({ name, email, phone, photo: firstAccessPhotoData });

  const services = initFirebaseCore();
  if (services?.auth && firebaseConfig().enabled) {
    try {
      const credential = await services.auth.createUserWithEmailAndPassword(email, password);
      await credential.user?.updateProfile?.({ displayName: name }).catch(() => {});
      setCurrentAccount({ name, email, role: "pending", local: false });
      forceCloudWrite("profile", storage.getItem("profile"));
      forceCloudWrite("staffApplications", storage.getItem("staffApplications"));
      $("firstAccessForm").reset();
      firstAccessPhotoData = "";
      window.alert("Account berjaya dibuat. Tunggu approval role daripada Boss/Admin/HR.");
      return;
    } catch (error) {
      const alreadyExists = /email-already-in-use/i.test(error?.code || "");
      if (!alreadyExists) {
        window.alert("Register gagal. Semak Firebase Auth atau password minimum 6 aksara.");
        return;
      }
      try {
        await services.auth.signInWithEmailAndPassword(email, password);
        setCurrentAccount({ name, email, role: "pending", local: false });
        forceCloudWrite("profile", storage.getItem("profile"));
        forceCloudWrite("staffApplications", storage.getItem("staffApplications"));
        $("firstAccessForm").reset();
        firstAccessPhotoData = "";
        return;
      } catch {
        window.alert("Email sudah wujud. Sila login guna password yang betul atau minta admin reset.");
        return;
      }
    }
  }

  setCurrentAccount({ name, email, role: "pending", local: true });
  $("firstAccessForm").reset();
  firstAccessPhotoData = "";
  window.alert("Request access dihantar. Tunggu approval role.");
}

async function logoutAccount() {
  if (firebaseAuth?.currentUser) {
    await firebaseAuth.signOut().catch(() => {});
  }
  clearCurrentAccount();
  window.alert(firebaseConfig().enabled ? "Account logout." : "Account logout. App kembali ke Boss local mode.");
}

function applyRoleAccess() {
  const account = getCurrentAccount();
  if ($("accountName")) $("accountName").textContent = account.name || account.email || "User";
  if ($("accountRole")) $("accountRole").textContent = account.email || (account.local ? "Local account" : "Online account");

  document.body.dataset.role = account.role;
  updateAccessScreen();
  if (!isAppLoggedIn() || account.role === "pending") return;
  const isBoss = canAccess("all");
  document.body.classList.toggle("boss-account", isBoss);
  document.querySelector("[data-nav='settings']")?.toggleAttribute("hidden", !isBoss && !canAccess("settings:manage"));
  if (activeViewName() !== "lubuk") activateTab("lubuk");

  const lubukCards = [
    ["companyDetail", canViewLubukPanel("company")],
    ["priceList", canViewLubukPanel("pricelist")],
    ["project", canViewLubukPanel("project") || canAccess("task:self")],
    ["sales", canViewLubukPanel("sales")],
    ["sop", canViewLubukPanel("sop")],
    ["attendance", canViewLubukPanel("attendance")],
    ["achievement", canViewLubukPanel("achievement")]
  ];
  lubukCards.forEach(([action, allowed]) => {
    document.querySelector(`[data-action="${action}"]`)?.toggleAttribute("hidden", !allowed);
  });

  document.querySelector("[data-action='addNewService']")?.toggleAttribute("hidden", !canAccess("pricelist:manage"));
  document.querySelector("[data-action='restoreDefaultPricelist']")?.toggleAttribute("hidden", !canAccess("pricelist:manage"));
  document.querySelector("[data-action='addNewSOP']")?.toggleAttribute("hidden", !canAccess("sop:manage"));
  document.querySelector("[data-project-tab='tasks']")?.toggleAttribute("hidden", !(canAccess("task:self") || canAccess("task:manage")));
  document.querySelector("[data-project-tab='admin']")?.toggleAttribute("hidden", !canAccess("task:manage"));
  document.querySelector("[data-attendance-tab='admin']")?.toggleAttribute("hidden", !canAccess("staff:manage"));
  $("achievementForm")?.toggleAttribute("hidden", !canAccess("achievement:manage"));
  $("companySubmit")?.toggleAttribute("hidden", !canAccess("company:manage"));

  document.body.classList.toggle("role-limited", !isBoss);
}

function getProfile() {
  return readJson("profile", {
    name: "Muaz",
    phone: "",
    email: "",
    address: "",
    avatar: ""
  });
}

function setProfile(profile) {
  storage.setItem("profile", JSON.stringify(profile));
}

function getSettings() {
  return readJson("settings", {
    homeName: "Dashboard Lubuk IT",
    weatherPlace: "Kuala Lumpur",
    defaultTab: "lubuk",
    tempUnit: "c",
    birthdayNotify: false,
    salaryDay: "25",
    salaryTime: "09:00",
    bankName: "",
    bankAccount: "",
    bankHolder: "",
    bankQr: ""
  });
}

function setSettings(settings) {
  storage.setItem("settings", JSON.stringify(settings));
}

function getDeviceStates() {
  return readJson("devices", defaultDevices);
}

function setDeviceStates(devices) {
  storage.setItem("devices", JSON.stringify(devices));
}

function getLovePhone() {
  const bio = getBio();
  let phone = storage.getItem("loveWhatsapp") || normalisePhone(bio.phone || "");
  if (!phone) {
    const entered = window.prompt("Masukkan nombor WhatsApp My Love. Contoh: 60123456789");
    if (!entered) return "";
    phone = normalisePhone(entered);
    if (phone) storage.setItem("loveWhatsapp", phone);
  }
  return phone;
}

function getLoveLocation() {
  const bio = getBio();
  let location = storage.getItem("loveLocation") || bio.location || "";
  if (!location) {
    const entered = window.prompt("Masukkan link Google Maps atau alamat lokasi My Love.");
    if (!entered) return "";
    location = entered.trim();
    storage.setItem("loveLocation", location);
  }
  return location;
}

function openUrl(url) {
  window.location.href = url;
}

function openLoveLocation() {
  const location = getLoveLocation();
  if (!location) return;
  refreshLoveLabels();

  if (/^https?:\/\//i.test(location)) {
    openUrl(location);
    return;
  }

  openUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`);
}

function openWhatsappChat() {
  const phone = getLovePhone();
  if (!phone) return;
  refreshLoveLabels();
  openUrl(`https://wa.me/${phone}`);
}

function openWhatsappVideo() {
  const phone = getLovePhone();
  if (!phone) return;
  refreshLoveLabels();

  const fallback = `https://wa.me/${phone}`;
  window.location.href = `whatsapp://call?phone=${phone}&video=1`;
  window.setTimeout(() => {
    window.location.href = fallback;
  }, 900);
}

function refreshLoveLabels() {
  if (!$("loveWhatsappLabel") || !$("loveLocationLabel") || !$("loveBioLabel")) return;
  const bio = getBio();
  const phone = storage.getItem("loveWhatsapp") || normalisePhone(bio.phone || "");
  const location = storage.getItem("loveLocation") || bio.location;
  $("loveWhatsappLabel").textContent = phone ? `+${phone}` : "Tap untuk set nombor";
  $("loveLocationLabel").textContent = location ? "Lokasi disimpan" : "Tap untuk set lokasi";
  $("loveBioLabel").textContent = bio.name || bio.nickname || bio.birthday ? "Detail disimpan" : "Tap untuk isi detail";
}

function applyProfile() {
  const profile = getProfile();
  const account = getCurrentAccount();
  const displayName = profile.name.trim() || account.name || "Muaz";
  const firstName = displayName.trim().split(/\s+/)[0] || "Muaz";
  document.querySelector(".greeting strong").textContent = `${firstName}!`;
  const avatar = $("profileAvatar");
  if (avatar) {
    avatar.textContent = profile.avatar ? "" : firstName.charAt(0).toUpperCase();
    avatar.style.backgroundImage = profile.avatar ? `url("${profile.avatar}")` : "";
    avatar.classList.toggle("has-photo", Boolean(profile.avatar));
  }
  $("profileNameText").textContent = displayName || "Muaz";
  if ($("profileContactText")) $("profileContactText").textContent = profile.email || profile.phone || "Lubuk IT profile";
  $("profileHomeName").textContent = "Dashboard Lubuk IT";
  if ($("statProfile")) $("statProfile").textContent = firstName;
}

function loadProfileForm() {
  const profile = getProfile();
  const form = $("profileForm");
  profileFields.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = profile[field] || "";
  });
  applyProfile();
}

function saveProfileForm() {
  const form = $("profileForm");
  const previous = getProfile();
  const profile = { avatar: previous.avatar || "" };
  profileFields.forEach((field) => {
    profile[field] = (form.elements[field]?.value || "").trim();
  });
  setProfile(profile);
  applyProfile();
  window.alert("Profile disimpan.");
}

function saveProfilePhoto(file) {
  if (!file) return;
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    window.alert("Gambar profile hanya terima JPEG atau PNG sahaja.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const profile = getProfile();
    profile.avatar = reader.result;
    setProfile(profile);
    applyProfile();
    window.alert("Gambar profile disimpan.");
  };
  reader.readAsDataURL(file);
}

function loadSettingsForm() {
  const settings = getSettings();
  const form = $("settingsForm");
  settingsFields.forEach((field) => {
    if (!form.elements[field]) return;
    if (form.elements[field].type === "checkbox") {
      form.elements[field].checked = Boolean(settings[field]);
    } else {
      form.elements[field].value = settings[field] || "";
    }
  });
}

function saveSettingsForm() {
  if (!requirePermission("settings:manage", "settings")) return;
  const form = $("settingsForm");
  const previous = getSettings();
  const settings = {};
  settingsFields.forEach((field) => {
    if (!form.elements[field]) return;
    settings[field] = form.elements[field].type === "checkbox"
      ? form.elements[field].checked
      : (form.elements[field].value || "").trim();
  });
  settings.bankQr = previous.bankQr || "";
  setSettings(settings);
  applyProfile();
  renderSaleSummary();
  window.alert("Settings disimpan.");
}

function saveBankQr(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const settings = getSettings();
    settings.bankQr = reader.result;
    setSettings(settings);
    window.alert("QR bank disimpan.");
  };
  reader.readAsDataURL(file);
}

function refreshDeviceCards() {
  if (!document.querySelector("[data-device]")) return;
  const devices = getDeviceStates();
  document.querySelectorAll("[data-device]").forEach((card) => {
    const isOn = Boolean(devices[card.dataset.device]);
    card.classList.toggle("accent", isOn);
    card.classList.toggle("disabled", !isOn);
    card.querySelector("[data-device-state]").textContent = isOn ? "ON" : "OFF";
    card.querySelector("[data-device-switch]").classList.toggle("on", isOn);
  });
  refreshUsageStats();
}

function toggleDevice(key) {
  const devices = getDeviceStates();
  devices[key] = !devices[key];
  setDeviceStates(devices);
  refreshDeviceCards();
}

function refreshUsageStats() {
  if (!$("statActive") || !$("statTotal") || !$("statWeather")) return;
  const devices = getDeviceStates();
  const values = Object.values(devices);
  $("statActive").textContent = values.filter(Boolean).length;
  $("statTotal").textContent = values.length;
  $("statWeather").textContent = `${$("temperature").textContent || "--"}°`;
}

function formatBirthday(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-MY", { day: "2-digit", month: "short" }).format(date);
}

function getNextBirthday(value) {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;

  const today = new Date();
  const next = new Date(today.getFullYear(), parts[1] - 1, parts[2]);
  next.setHours(0, 0, 0, 0);

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  if (next < todayStart) next.setFullYear(today.getFullYear() + 1);
  return next;
}

function refreshBirthdayStatus() {
  if (!$("birthdayStatus") || !$("birthdayCountdown")) return;
  const bio = getBio();
  const next = getNextBirthday(bio.birthday);

  if (!next) {
    $("birthdayStatus").textContent = "Birthday belum diset";
    $("birthdayCountdown").textContent = "-- hari lagi";
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.round((next - today) / dayMs);
  $("birthdayStatus").textContent = `Birthday ${formatBirthday(next)}`;
  $("birthdayCountdown").textContent = days === 0 ? "Hari ini birthday!" : `${days} hari lagi`;
}

function loadBioForm() {
  if (!$("bioForm")) return;
  const bio = getBio();
  const form = $("bioForm");
  bioFields.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = bio[field] || "";
  });
  refreshBirthdayStatus();
}

function saveBioForm() {
  if (!$("bioForm")) return;
  const form = $("bioForm");
  const bio = {};
  bioFields.forEach((field) => {
    bio[field] = (form.elements[field]?.value || "").trim();
  });

  if (bio.phone) storage.setItem("loveWhatsapp", normalisePhone(bio.phone));
  if (bio.location) storage.setItem("loveLocation", bio.location);
  setBio(bio);
  refreshLoveLabels();
  refreshBirthdayStatus();
  checkBirthdayNotification();
}

function openBioPanel() {
  if (!$("bioPanel")) return;
  loadBioForm();
  $("bioPanel").hidden = false;
}

function closeBioPanel() {
  if (!$("bioPanel")) return;
  $("bioPanel").hidden = true;
}

async function requestBirthdayNotification() {
  if (!("Notification" in window)) {
    window.alert("Notification tidak disokong pada browser ini.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    window.alert("Notification birthday sudah aktif. App akan beri alert bila birthday tiba.");
    checkBirthdayNotification(true);
  } else {
    window.alert("Notification belum dibenarkan.");
  }
}

function showBirthdayNotification(name) {
  const title = `Birthday ${name || "My Love"} hari ini`;
  const body = "Jangan lupa wish dan buat dia rasa special hari ini.";

  if (navigator.serviceWorker?.ready) {
    navigator.serviceWorker.ready
      .then((registration) => registration.showNotification(title, { body, icon: "./assets/brand/lubukit-logo-dp.jpg" }))
      .catch(() => new Notification(title, { body }));
    return;
  }

  new Notification(title, { body });
}

function checkBirthdayNotification(force = false) {
  const bio = getBio();
  if (!bio.birthday || !("Notification" in window) || Notification.permission !== "granted") return;

  const birthday = getNextBirthday(bio.birthday);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!birthday || birthday.getTime() !== today.getTime()) return;

  const key = `birthdayNotified-${today.getFullYear()}`;
  if (!force && storage.getItem(key)) return;
  storage.setItem(key, "yes");
  showBirthdayNotification(bio.nickname || bio.name);
}

function getCalendarNotes() {
  return readJson("calendarNotes", {});
}

function setCalendarNotes(notes) {
  storage.setItem("calendarNotes", JSON.stringify(notes));
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function setupCalendarControls() {
  if (!$("calendarMonth") || !$("calendarYear")) return;
  const monthNames = Array.from({ length: 12 }, (_, index) => (
    new Intl.DateTimeFormat("en-MY", { month: "short" }).format(new Date(2026, index, 1))
  ));
  $("calendarMonth").innerHTML = monthNames.map((name, index) => `<option value="${index}">${name}</option>`).join("");

  const currentYear = new Date().getFullYear();
  $("calendarYear").innerHTML = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index)
    .map((year) => `<option value="${year}">${year}</option>`)
    .join("");
}

function syncCalendarInputs() {
  if (!$("calendarDate") || !$("calendarMonth") || !$("calendarYear") || !$("selectedDateText") || !$("calendarTitle")) return;
  $("calendarDate").value = dateKey(selectedCalendarDate);
  $("calendarMonth").value = String(selectedCalendarDate.getMonth());
  $("calendarYear").value = String(selectedCalendarDate.getFullYear());
  $("selectedDateText").textContent = new Intl.DateTimeFormat("en-MY", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(selectedCalendarDate);
  $("calendarTitle").textContent = new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric"
  }).format(selectedCalendarDate);
}

function renderCalendar() {
  if (!$("calendarGrid")) return;
  const notes = getCalendarNotes();
  const year = selectedCalendarDate.getFullYear();
  const month = selectedCalendarDate.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const selected = dateKey(selectedCalendarDate);

  $("calendarGrid").innerHTML = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const key = dateKey(new Date(year, month, day));
    const classes = [
      "calendar-day",
      key === selected ? "selected" : "",
      notes[key]?.note ? "has-note" : ""
    ].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-calendar-day="${day}">${day}</button>`;
  }).join("");
  syncCalendarInputs();
}

function selectCalendarDate(date) {
  selectedCalendarDate = date;
  renderCalendar();
}

function openCalendarNote() {
  if (!$("calendarNotePanel") || !$("noteDate") || !$("noteText") || !$("noteNotify")) return;
  const key = dateKey(selectedCalendarDate);
  const notes = getCalendarNotes();
  $("noteDate").value = key;
  $("noteText").value = notes[key]?.note || "";
  $("noteNotify").checked = Boolean(notes[key]?.notify);
  openAppPanel("calendarNotePanel");
}

async function saveCalendarNote() {
  if (!$("noteDate") || !$("noteText") || !$("noteNotify")) return;
  const key = $("noteDate").value || dateKey(selectedCalendarDate);
  const notes = getCalendarNotes();
  notes[key] = {
    note: $("noteText").value.trim(),
    notify: $("noteNotify").checked
  };
  if (!notes[key].note && !notes[key].notify) delete notes[key];
  setCalendarNotes(notes);
  selectCalendarDate(parseDateKey(key));

  if (notes[key]?.notify && "Notification" in window && Notification.permission !== "granted") {
    await Notification.requestPermission();
  }

  window.alert("Note disimpan.");
}

function checkCalendarNotifications() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const key = dateKey(new Date());
  const notes = getCalendarNotes();
  if (!notes[key]?.notify || !notes[key]?.note) return;
  const sentKey = `calendarNotified-${key}`;
  if (storage.getItem(sentKey)) return;
  storage.setItem(sentKey, "yes");
  new Notification("Calendar Note", { body: notes[key].note, icon: "./assets/brand/lubukit-logo-dp.jpg" });
}

function updateMainClock() {
  if (!$("mainClockTime")) return;
  const now = new Date();
  $("mainClockTime").textContent = new Intl.DateTimeFormat("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(now);
  $("mainClockDate").textContent = new Intl.DateTimeFormat("en-MY", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(now);
  $("mainClockGreeting").textContent = $("timeGreeting")?.textContent || "Smart Dashboard";
}

function addMainNotice(items, type, title, detail) {
  items.push({ type, title, detail });
}

function getDashboardNotifications() {
  const items = [];
  const now = new Date();
  const todayKey = dateKey(now);
  const notes = getCalendarNotes();

  if (notes[todayKey]?.note) {
    addMainNotice(items, "Calendar", "Calendar note hari ini", notes[todayKey].note);
  }

  const bio = getBio();
  const birthday = getNextBirthday(bio.birthday);
  if (birthday) {
    const days = Math.ceil((birthday - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    if (days >= 0 && days <= 7) {
      addMainNotice(items, "My Love", days === 0 ? "Birthday hari ini" : `Birthday dalam ${days} hari`, bio.nickname || bio.name || "My Love");
    }
  }

  getTargets().forEach((target) => {
    const amount = Number(target.amount || 0);
    const saved = Number(target.saved || 0);
    const deadline = target.deadline ? parseDateKey(target.deadline) : null;
    const days = deadline ? Math.ceil((deadline - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000) : null;
    if (amount && saved < amount && (target.notify || (days !== null && days <= 7))) {
      const balance = Math.max(amount - saved, 0);
      addMainNotice(items, "Target", target.name || "Target simpanan", `Baki ${formatMoney(balance)}${days !== null ? `, ${Math.max(days, 0)} hari lagi` : ""}`);
    }
  });

  getSales().forEach((sale) => {
    if (!sale.due || ["finish", "cancel"].includes(sale.status || "in-project")) return;
    const due = new Date(sale.due);
    const days = Math.ceil((due - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    if (days >= 0 && days <= 3) {
      addMainNotice(items, "Project", sale.customer || "Client", `Due ${days === 0 ? "hari ini" : `${days} hari lagi`}`);
    }
  });

  const todayTaskKey = taskDateKey();
  const pendingTasks = getTasks().filter((task) => (task.date || todayTaskKey) === todayTaskKey && task.status !== "done");
  if (pendingTasks.length) {
    addMainNotice(items, "Task", "Daily task belum siap", `${pendingTasks.length} task pending hari ini`);
  }

  const staff = activeStaffProfiles();
  if (staff.length) {
    const checkedIn = new Set(todaysAttendance().filter((record) => record.mode === "in").map((record) => record.name));
    const missing = staff.filter((profile) => profile.name && !checkedIn.has(profile.name));
    if (missing.length) {
      addMainNotice(items, "Attendance", "Staff belum punch in", `${missing.length}/${staff.length} staff belum ada rekod masuk`);
    }
  }

  return items.slice(0, 10);
}

function renderMainDashboard() {
  updateMainClock();
  const notices = getDashboardNotifications();
  $("mainNotificationCount").textContent = String(notices.length);
  $("mainNotificationList").innerHTML = notices.length ? notices.map((notice) => `
    <article class="main-notification-card">
      <span>${escapeHtml(notice.type)}</span>
      <div>
        <h3>${escapeHtml(notice.title)}</h3>
        <p>${escapeHtml(notice.detail || "")}</p>
      </div>
    </article>
  `).join("") : "<div class=\"main-empty-notice\"><p>Tiada notification aktif sekarang.</p></div>";
}

function switchView(view, activeTab) {
  const account = getCurrentAccount();
  if (!isAppLoggedIn() || account.role === "pending") {
    updateAccessScreen();
    return;
  }
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === "lubuk");
  });
  if ($("lubukView")) $("lubukView").hidden = false;
  if (document.querySelector(".weather-card")) document.querySelector(".weather-card").hidden = false;
  renderSaleSummary();
}

function activateTab(view) {
  const tab = [...document.querySelectorAll(".tab")].find((item) => item.dataset.tab === "lubuk") || document.querySelector(".tab");
  switchView("lubuk", tab);
}

function closeAllPanels() {
  stopAttendanceCamera();
  ["settingsPanel", "profilePanel", "authPanel", "companyPanel", "pricePanel", "projectPanel", "bookingPanel", "salesPanel", "projectChatPanel", "sopPanel", "achievementPanel", "attendancePanel", "staffStatisticPanel"].forEach((id) => {
    if ($(id)) $(id).hidden = true;
  });
  document.body.classList.remove("client-chat-mode");
  document.body.classList.remove("awaiting-client-name");
}

function closeNavPanel() {
  closeAllPanels();
  setNavActive("home");
}

function openAppPanel(id) {
  closeAllPanels();
  const panel = $(id);
  if (!panel) return;
  panel.hidden = false;
  if (id === "settingsPanel") loadSettingsForm();
  if (id === "profilePanel") loadProfileForm();
}

function setNavActive(nav) {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === nav);
  });
}

function handleNav(nav) {
  setNavActive(nav);
  if (nav === "home") {
    closeAllPanels();
    activateTab("lubuk");
  }
  if (nav === "settings") openAppPanel("settingsPanel");
  if (nav === "profile") openAppPanel("profilePanel");
}

function resetAppData() {
  if (!requirePermission("settings:manage", "reset app")) return;
  if (!window.confirm("Reset semua data app?")) return;
  ["profile", "settings", "company", "pricelist", "sales", "staffTasks", "attendanceRecords", "staffProfiles", "staffApplications", "sops", "achievements", "projectChatRooms"].forEach((key) => storage.removeItem(key));
  loadProfileForm();
  loadSettingsForm();
  refreshSyncedViews();
  activateTab("lubuk");
  closeAllPanels();
}

async function downloadAppNow() {
  if (installPromptEvent) {
    installPromptEvent.prompt();
    await installPromptEvent.userChoice.catch(() => {});
    installPromptEvent = null;
    return;
  }

  window.alert("Untuk install app: buka website ini di Safari/Chrome, tekan Share/Menu, kemudian pilih Add to Home Screen atau Install App.");
}

function getTargets() {
  try {
    return JSON.parse(storage.getItem("targets") || "[]");
  } catch {
    return [];
  }
}

function setTargets(targets) {
  storage.setItem("targets", JSON.stringify(targets));
}

function formatMoney(value) {
  return `RM ${Number(value || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function openTargetPanel() {
  if (!$("targetPanel")) return;
  openAppPanel("targetPanel");
  renderTargets();
}

function renderTargets() {
  if (!$("targetList") || !$("targetCardLabel")) return;
  const targets = getTargets();
  const settings = getSettings();
  $("targetCardLabel").textContent = targets.length ? `${targets.length} target aktif` : "Set goal dan monitor duit";

  if (!targets.length) {
    $("targetList").innerHTML = "<div class=\"identity-result\"><p>Belum ada target. Tambah target pertama seperti basikal, phone, trip, atau apa-apa goal.</p></div>";
    return;
  }

  $("targetList").innerHTML = targets.map((target, index) => {
    const amount = Number(target.amount || 0);
    const saved = Number(target.saved || 0);
    const balance = Math.max(amount - saved, 0);
    const progress = amount ? Math.min((saved / amount) * 100, 100) : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = target.deadline ? parseDateKey(target.deadline) : today;
    const days = Math.max(Math.ceil((deadline - today) / 86400000), 1);
    const weekly = balance / Math.max(days / 7, 1);
    const monthly = balance / Math.max(days / 30, 1);
    return `
      <div class="target-item">
        <h3>${escapeHtml(target.name || "Target")}</h3>
        <p>${formatMoney(saved)} / ${formatMoney(amount)} (${Math.round(progress)}%)</p>
        <div class="target-bar"><span style="width:${progress}%"></span></div>
        <p>Baki: ${formatMoney(balance)} | ${days} hari lagi</p>
        <p>Simpan anggaran: ${formatMoney(weekly)}/minggu atau ${formatMoney(monthly)}/bulan</p>
        <label class="target-reminder"><span>Salary reminder</span><input type="checkbox" data-target-reminder="${index}" ${target.notify ? "checked" : ""}></label>
        <div class="target-bank">
          ${settings.bankQr ? `<img src="${settings.bankQr}" alt="QR bank">` : ""}
          <p><strong>${escapeHtml(settings.bankName || "Bank belum diset")}</strong></p>
          <p>${escapeHtml(settings.bankAccount || "No account belum diset")}</p>
          <p>${escapeHtml(settings.bankHolder || "Nama account belum diset")}</p>
        </div>
        <div class="target-transfer">
          <input type="number" min="0" step="0.01" placeholder="Jumlah transfer" data-transfer-amount="${index}">
          <button type="button" data-transfer-target="${index}">Mark Transfer</button>
        </div>
        <button class="target-delete" type="button" data-delete-target="${index}">Delete</button>
      </div>
    `;
  }).join("");
}

function saveTarget(event) {
  event.preventDefault();
  const target = {
    name: $("targetName").value.trim(),
    amount: Number($("targetAmount").value || 0),
    saved: Number($("targetSaved").value || 0),
    deadline: $("targetDeadline").value,
    notify: false
  };
  if (!target.name || !target.amount) {
    window.alert("Masukkan nama target dan harga target.");
    return;
  }
  const targets = getTargets();
  targets.push(target);
  setTargets(targets);
  $("targetForm").reset();
  renderTargets();
}

function deleteTarget(index) {
  const targets = getTargets();
  targets.splice(index, 1);
  setTargets(targets);
  renderTargets();
}

function toggleTargetReminder(index, checked) {
  const targets = getTargets();
  if (!targets[index]) return;
  targets[index].notify = checked;
  setTargets(targets);
  if (checked && "Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  renderTargets();
}

function markTargetTransfer(index) {
  const input = document.querySelector(`[data-transfer-amount="${index}"]`);
  const amount = Number(input?.value || 0);
  if (!amount) {
    window.alert("Masukkan jumlah transfer.");
    return;
  }
  const targets = getTargets();
  if (!targets[index]) return;
  targets[index].saved = Number(targets[index].saved || 0) + amount;
  setTargets(targets);
  renderTargets();
}

function checkSalaryNotifications() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const settings = getSettings();
  const today = new Date();
  const salaryDay = Number(settings.salaryDay || 0);
  if (today.getDate() !== salaryDay) return;
  const activeTargets = getTargets().filter((target) => target.notify);
  if (!activeTargets.length) return;
  const key = `salaryNotified-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  if (storage.getItem(key)) return;
  storage.setItem(key, "yes");
  new Notification("Salary Target Reminder", {
    body: `Gaji masuk. Transfer ke simpanan untuk ${activeTargets.map((target) => target.name).join(", ")}.`,
    icon: "./assets/brand/lubukit-logo-dp.jpg"
  });
}

function getCompany() {
  const company = readJson("company", defaultCompany);
  if (storage.getItem("companyDefaultsV3") !== "yes") {
    const patched = { ...company, ...defaultCompany };
    storage.setItem("companyDefaultsV3", "yes");
    setCompany(patched);
    return patched;
  }
  return company;
}

function setCompany(company) {
  storage.setItem("company", JSON.stringify(company));
}

function getPricelist() {
  try {
    const rawItems = JSON.parse(storage.getItem("pricelist") || "[]");
    return rawItems.map((item) => {
      if (Array.isArray(item.packages)) {
        return {
          service: item.service || item.name || "Service",
          image: item.image || "",
          theme: item.theme || "#ff5b10",
          addOns: item.addOns || "",
          packages: item.packages.map((pkg) => ({
            name: pkg.name || "Package",
            amount: Number(pkg.amount || pkg.price || 0),
            details: pkg.details || "",
            image: pkg.image || item.image || ""
          }))
        };
      }

      return {
        service: item.name || "Service",
        image: item.image || "",
        theme: item.theme || "#ff5b10",
        addOns: item.addOns || "",
        packages: [{ name: "Standard", amount: Number(item.amount || 0), details: item.details || "", image: item.image || "" }]
      };
    });
  } catch {
    return [];
  }
}

function setPricelist(items) {
  storage.setItem("pricelist", JSON.stringify(items));
}

function seedDefaultPricelist() {
  if (storage.getItem("pricelistSeed") === DEFAULT_PRICELIST_SEED) return;
  setPricelist(DEFAULT_PRICELIST);
  storage.setItem("pricelistSeed", DEFAULT_PRICELIST_SEED);
}

function restoreDefaultPricelist() {
  if (!requirePermission("pricelist:manage", "restore pricelist")) return;
  if (!window.confirm("Restore balik service default yang hilang? Service custom awak akan kekal.")) return;
  const currentItems = getPricelist();
  const currentNames = new Set(currentItems.map((item) => (item.service || "").toLowerCase()));
  const missingDefaults = DEFAULT_PRICELIST.filter((item) => !currentNames.has(item.service.toLowerCase()));
  if (!missingDefaults.length) {
    window.alert("Semua default pricelist sudah ada.");
    return;
  }
  setPricelist([...currentItems, ...missingDefaults]);
  storage.setItem("pricelistSeed", DEFAULT_PRICELIST_SEED);
  renderPricelist();
  window.alert(`${missingDefaults.length} service default sudah restore.`);
}

function openCompanyPanel() {
  if (!canAccess("company:view") && !requirePermission("company:manage", "Company Detail")) return;
  openAppPanel("companyPanel");
  loadCompanyForm();
}

function openPricePanel() {
  if (!canAccess("pricelist:view") && !requirePermission("pricelist:manage", "Pricelist")) return;
  openAppPanel("pricePanel");
  resetPriceForm();
  renderPricelist();
}

function openProjectPanel() {
  if (!canAccess("project:view") && !canAccess("project:manage") && !requirePermission("task:self", "Project/Task")) return;
  openAppPanel("projectPanel");
  switchProjectTab("projects");
  setDefaultTaskDate();
  renderStaffOptions();
  renderProjects();
  renderTasks();
  renderAdminTasks();
  renderProjectReport();
}

function openSalesPanel() {
  if (!canAccess("sales:view") && !requirePermission("sales:manage", "Sale")) return;
  openAppPanel("salesPanel");
  renderSales();
}

function getSops() {
  try {
    return JSON.parse(storage.getItem("sops") || "[]");
  } catch {
    return [];
  }
}

function setSops(items) {
  storage.setItem("sops", JSON.stringify(items));
}

function openSopPanel() {
  if (!canAccess("sop:view") && !requirePermission("sop:manage", "SOP")) return;
  openAppPanel("sopPanel");
  resetSopForm();
  renderSops();
}

function setSopBuilderVisible(visible) {
  $("sopForm").hidden = !visible;
  $("addSopButton").hidden = visible;
}

function resetSopForm() {
  $("sopForm").reset();
  setSopBuilderVisible(false);
}

function toggleSopBuilder() {
  setSopBuilderVisible(true);
  $("sopTitle").focus();
}

function saveSop(event) {
  event.preventDefault();
  if (!requirePermission("sop:manage", "save SOP")) return;
  const title = $("sopTitle").value.trim();
  const steps = $("sopSteps").value.split("\n").map((step) => step.trim()).filter(Boolean);
  if (!title || !steps.length) {
    window.alert("Masukkan title dan step SOP.");
    return;
  }
  setSops([{ id: Date.now(), title, steps }, ...getSops()]);
  resetSopForm();
  renderSops();
}

function renderSops() {
  const sops = getSops();
  $("sopList").innerHTML = sops.length ? sops.map((sop) => `
    <article class="ops-card sop-card" data-sop-card="${sop.id}">
      <div class="ops-head" data-toggle-sop="${sop.id}">
        <h3>${escapeHtml(sop.title)}</h3>
        ${canAccess("sop:manage") ? `<button type="button" data-delete-sop="${sop.id}">Delete</button>` : ""}
      </div>
      <ol>${sop.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
    </article>
  `).join("") : `<div class="identity-result"><p>${canAccess("sop:manage") ? "Belum ada SOP. Tambah checklist kerja pertama." : "Belum ada SOP untuk dibaca."}</p></div>`;
}

function deleteSop(id) {
  if (!requirePermission("sop:manage", "delete SOP")) return;
  setSops(getSops().filter((item) => String(item.id) !== String(id)));
  renderSops();
}

function getAchievements() {
  try {
    return JSON.parse(storage.getItem("achievements") || "[]");
  } catch {
    return [];
  }
}

function setAchievements(items) {
  storage.setItem("achievements", JSON.stringify(items));
}

function openAchievementPanel() {
  if (!canAccess("achievement:view") && !requirePermission("achievement:manage", "Achievement")) return;
  openAppPanel("achievementPanel");
  renderAchievements();
}

function saveAchievement(event) {
  event.preventDefault();
  if (!requirePermission("achievement:manage", "save achievement")) return;
  const item = {
    id: Date.now(),
    staff: $("achievementStaff").value.trim(),
    title: $("achievementTitle").value.trim(),
    point: Number($("achievementPoint").value || 0),
    detail: $("achievementDetail").value.trim(),
    date: new Intl.DateTimeFormat("en-MY", { dateStyle: "medium" }).format(new Date())
  };
  if (!item.staff || !item.title) {
    window.alert("Masukkan nama staff dan title achievement.");
    return;
  }
  setAchievements([item, ...getAchievements()]);
  $("achievementForm").reset();
  renderAchievements();
}

function renderAchievements() {
  const items = getAchievements();
  $("achievementList").innerHTML = items.length ? items.map((item) => `
    <article class="ops-card achievement-card">
      <div class="ops-head">
        <div>
          <h3>${escapeHtml(item.staff)}</h3>
          <p>${escapeHtml(item.title)} • ${escapeHtml(item.date || "")}</p>
        </div>
        <strong>${Number(item.point || 0)} pts</strong>
      </div>
      ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ""}
      ${canAccess("achievement:manage") ? `<button type="button" data-delete-achievement="${item.id}">Delete</button>` : ""}
    </article>
  `).join("") : "<div class=\"identity-result\"><p>Belum ada achievement staff.</p></div>";
}

function deleteAchievement(id) {
  if (!requirePermission("achievement:manage", "delete achievement")) return;
  setAchievements(getAchievements().filter((item) => String(item.id) !== String(id)));
  renderAchievements();
}

function getAttendanceRecords() {
  try {
    return JSON.parse(storage.getItem("attendanceRecords") || "[]");
  } catch {
    return [];
  }
}

function setAttendanceRecords(records) {
  storage.setItem("attendanceRecords", JSON.stringify(records));
  if (document.querySelector(".tab.active")?.dataset.tab === "lubuk") renderSaleSummary();
}

function getStaffProfiles() {
  try {
    return JSON.parse(storage.getItem("staffProfiles") || "[]");
  } catch {
    return [];
  }
}

function setStaffProfiles(staff) {
  storage.setItem("staffProfiles", JSON.stringify(staff));
  if (document.querySelector(".tab.active")?.dataset.tab === "lubuk") renderSaleSummary();
}

function getStaffApplications() {
  try {
    return JSON.parse(storage.getItem("staffApplications") || "[]");
  } catch {
    return [];
  }
}

function setStaffApplications(applications) {
  storage.setItem("staffApplications", JSON.stringify(applications));
  if (document.querySelector(".tab.active")?.dataset.tab === "lubuk") renderSaleSummary();
}

function upsertStaffApplication(application) {
  const applications = getStaffApplications();
  const cleanEmail = String(application.email || "").trim().toLowerCase();
  const index = applications.findIndex((item) => String(item.email || "").trim().toLowerCase() === cleanEmail);
  const value = { ...application, email: cleanEmail, status: "pending", createdAt: application.createdAt || new Date().toISOString() };
  if (index >= 0) applications[index] = { ...applications[index], ...value };
  else applications.unshift(value);
  setStaffApplications(applications);
}

function activeStaffProfiles() {
  return getStaffProfiles().filter((staff) => (staff.status || "Permanent") !== "Inactive");
}

function staffInitials(name = "Staff") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S";
}

function compressStaffPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      reject(new Error("Format gambar mesti JPEG atau PNG."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gambar tidak boleh dibaca."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Gambar tidak valid."));
      image.onload = () => {
        const maxSize = 900;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function renderStaffOptions() {
  if (!$("taskStaff")) return;
  const staff = activeStaffProfiles();
  $("taskStaff").innerHTML = staff.length
    ? staff.map((item) => `<option value="${escapeHtml(item.email || item.name)}">${escapeHtml(item.name)}${item.position ? ` - ${escapeHtml(item.position)}` : ""}${item.role ? ` (${escapeHtml(roleLabels[item.role] || item.role)})` : ""}</option>`).join("")
    : "<option value=\"\">Add staff in Attendance Admin</option>";
}

function resetStaffForm() {
  staffPhotoData = "";
  $("staffForm").reset();
  $("staffId").value = "";
  $("staffAgreement").value = "";
  $("staffRole").value = "graphic_designer";
  $("staffStatus").value = "Permanent";
  $("staffForm").hidden = true;
  $("addStaffButton").hidden = false;
}

function openStaffForm() {
  if (!requirePermission("staff:manage", "add staff")) return;
  resetStaffForm();
  $("staffForm").hidden = false;
  $("addStaffButton").hidden = true;
  $("staffName").focus();
}

function renderStaffProfiles() {
  renderPendingStaffApplications();
  const staff = getStaffProfiles();
  $("staffList").innerHTML = staff.length ? staff.map((item) => `
    <article class="staff-card">
      <div class="staff-media">
        ${item.photo ? `<img src="${item.photo}" alt="${escapeHtml(item.name)}">` : `<div class="staff-avatar">${escapeHtml(staffInitials(item.name))}</div>`}
      </div>
      <div class="staff-card-body">
        <h3>${escapeHtml(item.name || "Staff")}</h3>
        <p>${escapeHtml(item.position || "No position")} • ${escapeHtml(roleLabels[item.role] || item.role || "Staff")} • ${escapeHtml(item.status || "Active")}</p>
        <span>Email: ${escapeHtml(item.email || "-")}</span>
        <span>Contact: ${escapeHtml(item.contact || "-")}</span>
        <span>Start: ${escapeHtml(item.start || "-")} • Agreement: ${escapeHtml(item.agreement || "-")}</span>
        ${item.notes ? `<small>${escapeHtml(item.notes)}</small>` : ""}
        <div class="staff-actions">
          <button type="button" data-staff-stat="${item.id}">Statistic</button>
          <button type="button" data-edit-staff="${item.id}">Edit</button>
          <button type="button" data-delete-staff="${item.id}">Delete</button>
        </div>
      </div>
    </article>
  `).join("") : "<div class=\"identity-result\"><p>Belum ada profile staff. Add staff di form atas.</p></div>";
  renderStaffOptions();
}

function renderPendingStaffApplications() {
  if (!$("pendingStaffList")) return;
  const applications = getStaffApplications().filter((item) => (item.status || "pending") === "pending");
  $("pendingStaffCount").textContent = `${applications.length} waiting`;
  $("pendingStaffBox").hidden = !canAccess("staff:manage");
  $("pendingStaffList").innerHTML = applications.length ? applications.map((item) => `
    <article class="staff-card pending-staff-card">
      <div class="staff-media">
        ${item.photo ? `<img src="${item.photo}" alt="${escapeHtml(item.name)}">` : `<div class="staff-avatar">${escapeHtml(staffInitials(item.name))}</div>`}
      </div>
      <div class="staff-card-body">
        <h3>${escapeHtml(item.name || "New Staff")}</h3>
        <p>New staff • Waiting approval</p>
        <span>Email: ${escapeHtml(item.email || "-")}</span>
        <span>Contact: ${escapeHtml(item.phone || "-")}</span>
        <label class="pending-role-label">Role
          <select data-approve-role="${escapeHtml(item.email || "")}">
            <option value="graphic_designer">Graphic Designer</option>
            <option value="sale">Sale</option>
            <option value="marketing">Marketing</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
            <option value="boss">Boss</option>
          </select>
        </label>
        <div class="staff-actions">
          <button type="button" data-approve-staff="${escapeHtml(item.email || "")}">Approve Role</button>
          <button type="button" data-reject-staff="${escapeHtml(item.email || "")}">Reject</button>
        </div>
      </div>
    </article>
  `).join("") : "<div class=\"identity-result\"><p>Belum ada new staff waiting approval.</p></div>";
}

function approveStaffApplication(email) {
  if (!requirePermission("staff:manage", "approve staff")) return;
  const cleanEmail = String(email || "").trim().toLowerCase();
  const applications = getStaffApplications();
  const application = applications.find((item) => String(item.email || "").trim().toLowerCase() === cleanEmail);
  if (!application) return;
  const roleSelect = document.querySelector(`[data-approve-role="${CSS.escape(cleanEmail)}"]`);
  const role = roleSelect?.value || "graphic_designer";
  const staff = getStaffProfiles();
  const existingIndex = staff.findIndex((item) => String(item.email || "").trim().toLowerCase() === cleanEmail);
  const profile = {
    id: existingIndex >= 0 ? staff[existingIndex].id : String(Date.now()),
    photo: application.photo || "",
    name: application.name || cleanEmail,
    email: cleanEmail,
    position: roleLabels[role] || "Staff",
    role,
    contact: application.phone || "",
    start: new Date().toISOString().slice(0, 10),
    agreement: "",
    status: "Permanent",
    notes: "Approved from first access request."
  };
  if (existingIndex >= 0) staff[existingIndex] = { ...staff[existingIndex], ...profile };
  else staff.unshift(profile);
  setStaffProfiles(staff);
  setStaffApplications(applications.filter((item) => String(item.email || "").trim().toLowerCase() !== cleanEmail));
  if (String(getCurrentAccount().email || "").trim().toLowerCase() === cleanEmail) {
    setCurrentAccount({ ...getCurrentAccount(), role, name: profile.name, email: cleanEmail });
  }
  renderStaffProfiles();
  renderAttendance();
  window.alert("Role staff sudah approve.");
}

function rejectStaffApplication(email) {
  if (!requirePermission("staff:manage", "reject staff")) return;
  if (!window.confirm("Reject new staff ini?")) return;
  const cleanEmail = String(email || "").trim().toLowerCase();
  setStaffApplications(getStaffApplications().filter((item) => String(item.email || "").trim().toLowerCase() !== cleanEmail));
  renderStaffProfiles();
}

function saveStaffProfile(event) {
  event.preventDefault();
  if (!requirePermission("staff:manage", "save staff profile")) return;
  const id = $("staffId").value || String(Date.now());
  const existing = getStaffProfiles().find((item) => String(item.id) === String(id));
  const profile = {
    id,
    photo: staffPhotoData || existing?.photo || "",
    name: $("staffName").value.trim(),
    email: $("staffEmail").value.trim(),
    position: $("staffPosition").value.trim(),
    role: $("staffRole").value,
    contact: $("staffContact").value.trim(),
    start: $("staffStart").value,
    agreement: $("staffAgreement").value,
    status: $("staffStatus").value,
    notes: $("staffNotes").value.trim()
  };
  if (!profile.name) {
    window.alert("Masukkan nama staff.");
    return;
  }
  const staff = getStaffProfiles();
  const index = staff.findIndex((item) => String(item.id) === String(id));
  if (index >= 0) staff[index] = profile;
  else staff.unshift(profile);
  setStaffProfiles(staff);
  resetStaffForm();
  renderStaffProfiles();
  renderAttendance();
}

function editStaffProfile(id) {
  if (!requirePermission("staff:manage", "edit staff profile")) return;
  const staff = getStaffProfiles().find((item) => String(item.id) === String(id));
  if (!staff) return;
  $("staffForm").hidden = false;
  $("addStaffButton").hidden = true;
  staffPhotoData = staff.photo || "";
  $("staffId").value = staff.id;
  $("staffName").value = staff.name || "";
  $("staffEmail").value = staff.email || "";
  $("staffPosition").value = staff.position || "";
  $("staffRole").value = staff.role || "graphic_designer";
  $("staffContact").value = staff.contact || "";
  $("staffStart").value = staff.start || "";
  $("staffAgreement").value = staff.agreement || "";
  $("staffStatus").value = staff.status || "Permanent";
  $("staffNotes").value = staff.notes || "";
}

function deleteStaffProfile(id) {
  if (!requirePermission("staff:manage", "delete staff profile")) return;
  if (!window.confirm("Delete profile staff ini?")) return;
  setStaffProfiles(getStaffProfiles().filter((item) => String(item.id) !== String(id)));
  resetStaffForm();
  renderStaffProfiles();
  renderAttendance();
}

function openStaffStatistic(id) {
  const staff = getStaffProfiles().find((item) => String(item.id) === String(id));
  if (!staff) return;
  const attendance = getAttendanceRecords().filter((record) => record.name === staff.name);
  const punchIn = attendance.filter((record) => record.mode === "in");
  const punchOut = attendance.filter((record) => record.mode === "out");
  const late = punchIn.filter((record) => {
    const date = new Date(record.time);
    return date.getHours() > 9 || (date.getHours() === 9 && date.getMinutes() > 15);
  });
  const tasks = getTasks().filter((task) => task.staff === staff.name);
  const doneTasks = tasks.filter((task) => task.status === "done");
  const achievements = getAchievements().filter((item) => item.staff === staff.name);
  const points = achievements.reduce((sum, item) => sum + Number(item.point || 0), 0);
  const recentAttendance = attendance.slice(0, 8);
  const taskRate = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  openAppPanel("staffStatisticPanel");
  $("staffStatisticContent").innerHTML = `
    <section class="staff-stat-hero">
      ${staff.photo ? `<img src="${staff.photo}" alt="${escapeHtml(staff.name)}">` : `<div class="staff-avatar">${escapeHtml(staffInitials(staff.name))}</div>`}
      <div>
        <h3>${escapeHtml(staff.name || "Staff")}</h3>
        <p>${escapeHtml(staff.position || "No position")} • ${escapeHtml(staff.status || "Permanent")}</p>
      </div>
    </section>
    <section class="staff-stat-grid">
      <div><strong>${attendance.length}</strong><span>Attendance Record</span></div>
      <div><strong>${punchIn.length}</strong><span>Punch In</span></div>
      <div><strong>${punchOut.length}</strong><span>Punch Out</span></div>
      <div><strong>${late.length}</strong><span>Late</span></div>
      <div><strong>${doneTasks.length}/${tasks.length}</strong><span>Task Done</span></div>
      <div><strong>${taskRate}%</strong><span>KPI Task</span></div>
      <div><strong>${points}</strong><span>Achievement Point</span></div>
      <div><strong>${achievements.length}</strong><span>Achievement</span></div>
    </section>
    <section class="staff-stat-detail">
      <h3>Staff Info</h3>
      <p><b>Contact:</b> ${escapeHtml(staff.contact || "-")}</p>
      <p><b>Start Work:</b> ${escapeHtml(staff.start || "-")}</p>
      <p><b>Agreement:</b> ${escapeHtml(staff.agreement || "-")}</p>
      <p><b>Status:</b> ${escapeHtml(staff.status || "-")}</p>
      <p><b>Notes:</b> ${escapeHtml(staff.notes || "-")}</p>
    </section>
    <section class="staff-stat-detail">
      <h3>Recent Attendance</h3>
      ${recentAttendance.length ? recentAttendance.map((record) => `<p><b>${record.mode === "in" ? "IN" : "OUT"}:</b> ${escapeHtml(formatAttendanceTime(record.time))} • ${escapeHtml(record.location || "-")}</p>`).join("") : "<p>Belum ada rekod attendance.</p>"}
    </section>
    <section class="staff-stat-detail">
      <h3>Target & KPI</h3>
      <p><b>Task completion:</b> ${doneTasks.length}/${tasks.length} task (${taskRate}%)</p>
      <p><b>Late record:</b> ${late.length}</p>
      <p><b>Achievement points:</b> ${points}</p>
    </section>
  `;
}

function attendanceDateKey(value = new Date()) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatAttendanceTime(value = new Date()) {
  return new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function openAttendancePanel() {
  if (!canAccess("attendance:self") && !requirePermission("attendance:manage", "Attendance")) return;
  openAppPanel("attendancePanel");
  resetAttendanceForm();
  switchAttendanceTab("live");
  updateAttendanceClocks();
  renderStaffProfiles();
  renderAttendance();
}

function todaysAttendance() {
  const today = attendanceDateKey();
  return getAttendanceRecords().filter((record) => attendanceDateKey(record.time) === today);
}

function renderAttendance() {
  const records = getAttendanceRecords();
  const today = todaysAttendance();
  const punchIn = today.filter((record) => record.mode === "in").length;
  const punchOut = today.filter((record) => record.mode === "out").length;
  const names = new Set(today.map((record) => record.name).filter(Boolean));
  const staffTotal = activeStaffProfiles().length || names.size;
  $("attendanceReport").innerHTML = `
    <section class="attendance-summary">
      <div><span>Staff today</span><strong>${names.size}/${staffTotal}</strong></div>
      <div><span>Punch in</span><strong>${punchIn}</strong></div>
      <div><span>Punch out</span><strong>${punchOut}</strong></div>
      <div><span>Total record</span><strong>${records.length}</strong></div>
    </section>
  `;
  renderAttendancePunchButton();
  renderAttendanceWeekly(records);
  renderAttendanceAlerts(records);
  $("attendanceList").innerHTML = records.length ? records.slice(0, 20).map((record) => `
    <article class="attendance-record">
      ${record.photo ? `<img src="${record.photo}" alt="Selfie ${escapeHtml(record.name)}">` : "<div class=\"attendance-avatar\">?</div>"}
      <div>
        <h3>${escapeHtml(record.name)}</h3>
        <p>${record.mode === "in" ? "Punch In" : "Punch Out"} • ${escapeHtml(formatAttendanceTime(record.time))}</p>
        <span>${escapeHtml(record.location || "Lokasi tidak diset")}</span>
      </div>
      <strong>${record.mode === "in" ? "IN" : "OUT"}</strong>
    </article>
  `).join("") : "<div class=\"identity-result\"><p>Belum ada rekod attendance. Tekan Punch In atau Punch Out untuk mula.</p></div>";
}

function currentAttendanceName() {
  return getCurrentAccount().name || getProfile().name || "Staff";
}

function hasOpenAttendancePunch(name = currentAttendanceName()) {
  const today = todaysAttendance().filter((record) => record.name === name);
  const last = today[0];
  return Boolean(last && last.mode === "in");
}

function renderAttendancePunchButton() {
  const button = $("attendanceQuickPunch");
  const isCheckedIn = hasOpenAttendancePunch();
  button.textContent = isCheckedIn ? "Check Out" : "Check In";
  button.dataset.action = isCheckedIn ? "punchOut" : "punchIn";
  button.classList.toggle("out", isCheckedIn);
  button.classList.toggle("in", !isCheckedIn);
}

function updateAttendanceClocks() {
  if (!$("attendanceClockMy") || $("attendancePanel").hidden) return;
  const options = { hour: "2-digit", minute: "2-digit", hour12: true };
  $("attendanceClockMy").textContent = new Intl.DateTimeFormat("en-MY", { ...options, timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
  $("attendanceClockId").textContent = new Intl.DateTimeFormat("en-MY", { ...options, timeZone: "Asia/Jakarta" }).format(new Date());
}

function switchAttendanceTab(tabName) {
  if (tabName === "admin" && !requirePermission("staff:manage", "Attendance Admin")) return;
  if (tabName === "weekly" && !canAccess("attendance:manage") && !requirePermission("report:view", "Rekod mingguan")) return;
  if (tabName === "alerts" && !canAccess("attendance:manage") && !requirePermission("report:view", "Amaran attendance")) return;
  document.querySelectorAll("[data-attendance-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.attendanceTab === tabName);
  });
  $("attendanceLiveSection").hidden = tabName !== "live";
  $("attendanceWeeklySection").hidden = tabName !== "weekly";
  $("attendanceFormSection").hidden = tabName !== "form";
  $("attendanceAlertSection").hidden = tabName !== "alerts";
  $("attendanceAdminSection").hidden = tabName !== "admin";
}

function attendanceWeekDays() {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay() || 7;
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - day + 1);
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function attendanceStatusFor(records, name, date) {
  const dayRecords = records.filter((record) => record.name === name && attendanceDateKey(record.time) === attendanceDateKey(date));
  if (!dayRecords.length) return "-";
  const inRecord = dayRecords.find((record) => record.mode === "in");
  if (!inRecord) return "A";
  const hour = new Date(inRecord.time).getHours();
  const minute = new Date(inRecord.time).getMinutes();
  if (hour > 9 || (hour === 9 && minute > 15)) return "L";
  return "H";
}

function renderAttendanceWeekly(records) {
  const profileNames = getStaffProfiles().map((staff) => staff.name).filter(Boolean);
  const names = [...new Set([...profileNames, ...records.map((record) => record.name).filter(Boolean)])];
  const days = attendanceWeekDays();
  $("attendanceWeekly").innerHTML = names.length ? `
    <div class="weekly-head">
      <span>Staff</span>
      ${days.map((day) => `<span>${new Intl.DateTimeFormat("ms-MY", { weekday: "short" }).format(day)}</span>`).join("")}
    </div>
    ${names.map((name) => `
      <div class="weekly-row">
        <strong>${escapeHtml(name)}</strong>
        ${days.map((day) => {
          const status = attendanceStatusFor(records, name, day);
          return `<span class="status-${status.toLowerCase()}">${status}</span>`;
        }).join("")}
      </div>
    `).join("")}
    <div class="weekly-legend"><span class="status-h">H</span> Hadir <span class="status-l">L</span> Lambat <span class="status-a">A</span> Absen <span class="status--">-</span> Tiada rekod</div>
  ` : "<div class=\"identity-result\"><p>Belum ada rekod mingguan.</p></div>";
}

function renderAttendanceAlerts(records) {
  const today = attendanceDateKey();
  const todayRecords = records.filter((record) => attendanceDateKey(record.time) === today);
  const late = todayRecords.filter((record) => {
    if (record.mode !== "in") return false;
    const date = new Date(record.time);
    return date.getHours() > 9 || (date.getHours() === 9 && date.getMinutes() > 15);
  });
  const openPunch = todayRecords.filter((record) => record.mode === "in" && !todayRecords.some((item) => item.name === record.name && item.mode === "out"));
  const absentProfiles = activeStaffProfiles().filter((staff) => !todayRecords.some((record) => record.name === staff.name));
  const alerts = [
    ...late.map((record) => ({ type: "warning", text: `${record.name} check-in lambat pada ${formatAttendanceTime(record.time)}` })),
    ...openPunch.map((record) => ({ type: "danger", text: `${record.name} belum punch out hari ini` })),
    ...absentProfiles.map((staff) => ({ type: "danger", text: `${staff.name} belum check-in hari ini` }))
  ];
  $("attendanceAlerts").innerHTML = alerts.length ? alerts.map((alert) => `
    <article class="attendance-alert ${alert.type}">
      <strong>${alert.type === "danger" ? "!" : "•"}</strong>
      <span>${escapeHtml(alert.text)}</span>
    </article>
  `).join("") : "<div class=\"identity-result\"><p>Tiada amaran aktif hari ini.</p></div>";
}

function stopAttendanceCamera() {
  if (!attendanceStream) return;
  attendanceStream.getTracks().forEach((track) => track.stop());
  attendanceStream = null;
}

async function startAttendanceCamera() {
  stopAttendanceCamera();
  const video = $("attendanceVideo");
  if (!navigator.mediaDevices?.getUserMedia) {
    window.alert("Camera tidak disokong pada browser ini.");
    return;
  }
  try {
    attendanceStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = attendanceStream;
    await video.play().catch(() => {});
  } catch {
    window.alert("Tak dapat buka camera. Benarkan permission camera untuk snap selfie.");
  }
}

async function resolveAttendanceLocation() {
  if (!("geolocation" in navigator)) return getSettings().weatherPlace || "Kuala Lumpur";
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`),
      () => resolve(getSettings().weatherPlace || "Kuala Lumpur"),
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
    );
  });
}

async function startPunch(mode) {
  if (!canAccess("attendance:self") && !requirePermission("attendance:manage", "punchcard")) return;
  switchAttendanceTab("form");
  attendancePhotoData = "";
  $("attendanceForm").hidden = false;
  $("attendanceMode").value = mode;
  $("attendanceName").value = currentAttendanceName();
  $("attendanceTime").value = formatAttendanceTime();
  $("attendanceLocation").value = "Detecting location...";
  $("attendancePhoto").hidden = true;
  $("attendancePhoto").removeAttribute("src");
  $("attendanceLocation").value = await resolveAttendanceLocation();
  startAttendanceCamera();
}

function captureAttendancePhoto() {
  const video = $("attendanceVideo");
  if (!video.videoWidth) {
    window.alert("Camera belum ready.");
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  attendancePhotoData = canvas.toDataURL("image/jpeg", 0.78);
  $("attendancePhoto").src = attendancePhotoData;
  $("attendancePhoto").hidden = false;
}

function resetAttendanceForm() {
  attendancePhotoData = "";
  $("attendanceForm").reset();
  $("attendanceForm").hidden = true;
  $("attendancePhoto").hidden = true;
  $("attendancePhoto").removeAttribute("src");
  stopAttendanceCamera();
}

function saveAttendance(event) {
  event.preventDefault();
  if (!canAccess("attendance:self") && !requirePermission("attendance:manage", "submit punchcard")) return;
  if (!attendancePhotoData) {
    window.alert("Snap selfie dulu untuk confirm punchcard.");
    return;
  }
  const record = {
    id: Date.now(),
    mode: $("attendanceMode").value || "in",
    name: $("attendanceName").value.trim() || "Staff",
    location: $("attendanceLocation").value.trim(),
    time: new Date().toISOString(),
    photo: attendancePhotoData
  };
  setAttendanceRecords([record, ...getAttendanceRecords()]);
  resetAttendanceForm();
  renderAttendance();
  switchAttendanceTab("live");
  window.alert(record.mode === "in" ? "Punch In disimpan." : "Punch Out disimpan.");
}

function loadCompanyForm() {
  const company = getCompany();
  const form = $("companyForm");
  companyFields.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = company[field] || "";
  });
  setCompanyEditMode(false);
}

function setCompanyEditMode(enabled) {
  companyEditMode = enabled;
  const form = $("companyForm");
  form.classList.toggle("is-editing", enabled);
  companyFields.forEach((field) => {
    const element = form.elements[field];
    if (!element) return;
    element.readOnly = !enabled;
    element.classList.toggle("copy-ready", !enabled);
  });
  $("companySubmit").textContent = enabled ? "Save Company Detail" : "Edit Company Detail";
}

function copyText(value, label) {
  const text = String(value || "").trim();
  if (!text) {
    window.alert(`${label} belum diisi.`);
    return;
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  window.alert(`Copy ${label}`);
}

function saveCompany(event) {
  event.preventDefault();
  if (!requirePermission("company:manage", "edit company detail")) return;
  if (!companyEditMode) {
    setCompanyEditMode(true);
    return;
  }

  const form = $("companyForm");
  const company = {};
  companyFields.forEach((field) => {
    company[field] = (form.elements[field]?.value || "").trim();
  });
  setCompany(company);
  setCompanyEditMode(false);
  window.alert("Company detail disimpan.");
}

function copyCompanyField(target) {
  if (companyEditMode) return;
  const field = target.closest("input, textarea");
  if (!field || !field.name || !companyFields.includes(field.name)) return;
  const label = field.closest("label")?.childNodes?.[0]?.textContent?.trim() || field.name;
  copyText(getSocialUrl(field.name, field.value) || field.value, label);
}

function getSocialUrl(type, value) {
  const clean = String(value || "").trim();
  if (!clean || clean === "-") return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  const handle = clean.replace(/^@/, "");
  const urls = {
    instagram: `https://www.instagram.com/${handle}/`,
    facebook: `https://facebook.com/${handle}`,
    tiktok: `https://tiktok.com/@${handle}`,
    linkedin: clean.includes("/") ? `https://linkedin.com/${clean}` : `https://linkedin.com/in/${handle}`,
    threads: `https://www.threads.com/@${handle}`,
    x: `https://x.com/${handle}`
  };
  return urls[type] || "";
}

function openSocialProfile(type) {
  const value = $("companyForm").elements[type]?.value || "";
  const url = getSocialUrl(type, value);
  if (!url) {
    window.alert("Username/link belum diisi.");
    return;
  }
  window.open(url, "_blank", "noopener");
}

async function downloadCompanyLogo(type) {
  const file = companyLogoFiles[type];
  if (!file) return;
  const filename = file.split("/").pop();
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error("Logo download failed");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  } catch {
    const link = document.createElement("a");
    link.href = file;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

function setPriceBuilderVisible(visible) {
  $("priceForm").hidden = !visible;
  $("addServiceButton").hidden = visible;
  $("addServiceButton").textContent = "Add New Service";
}

function togglePriceBuilder() {
  if (!$("priceForm").hidden) {
    $("priceServiceName").focus();
    return;
  }

  editingPriceServiceIndex = -1;
  setPriceBuilderVisible(true);
  $("priceSubmit").textContent = "Proceed Pricelist";
  renderPricePackageInputs();
  $("priceServiceName").focus();
}

function renderPricePackageInputs(existingPackages = []) {
  const count = Number($("packageCount").value || 3);
  $("packageFields").innerHTML = Array.from({ length: count }, (_, index) => {
    const pkg = existingPackages[index] || {};
    return `
      <div class="package-input-card">
        <h3>Package ${index + 1}</h3>
        <label>Nama package<input class="package-name" type="text" placeholder="Basic / Standard / Premium" value="${escapeHtml(pkg.name || "")}"></label>
        <label>Harga (RM)<input class="package-price" type="number" min="0" step="0.01" placeholder="80" value="${pkg.amount || ""}"></label>
        <label>Apa yang dapat<textarea class="package-detail" rows="2" placeholder="Contoh: Cleaning, thermal paste, checking">${escapeHtml(pkg.details || "")}</textarea></label>
      </div>
    `;
  }).join("");
}

function resetPriceForm() {
  editingPriceServiceIndex = -1;
  $("priceServiceName").value = "";
  $("packageCount").value = "3";
  $("priceSubmit").textContent = "Proceed Pricelist";
  renderPricePackageInputs();
  setPriceBuilderVisible(false);
}

function addPriceItem(event) {
  event.preventDefault();
  if (!requirePermission("pricelist:manage", "save pricelist")) return;
  const service = $("priceServiceName").value.trim();
  const names = [...document.querySelectorAll(".package-name")];
  const prices = [...document.querySelectorAll(".package-price")];
  const details = [...document.querySelectorAll(".package-detail")];
  const packages = names.map((input, index) => ({
    name: input.value.trim(),
    amount: Number(prices[index]?.value || 0),
    details: details[index]?.value.trim() || ""
  })).filter((pkg) => pkg.name && pkg.amount);

  if (!service || !packages.length) {
    window.alert("Masukkan nama service dan sekurang-kurangnya satu package lengkap.");
    return;
  }

  const items = getPricelist();
  const existing = editingPriceServiceIndex >= 0 ? items[editingPriceServiceIndex] || {} : {};
  const serviceItem = { service, image: existing.image || "", theme: existing.theme || "#ff5b10", addOns: existing.addOns || "", packages };
  if (editingPriceServiceIndex >= 0 && items[editingPriceServiceIndex]) {
    items[editingPriceServiceIndex] = serviceItem;
  } else {
    items.push(serviceItem);
  }
  setPricelist(items);
  resetPriceForm();
  renderPricelist();
}

function flattenPricelist() {
  return getPricelist().flatMap((serviceItem, serviceIndex) => (
    serviceItem.packages.map((pkg, packageIndex) => ({
      service: serviceItem.service,
      packageName: pkg.name,
      name: `${serviceItem.service} - ${pkg.name}`,
      amount: Number(pkg.amount || 0),
      details: pkg.details || "",
      image: pkg.image || serviceItem.image || "",
      serviceIndex,
      packageIndex
    }))
  ));
}

function renderPricelist() {
  const services = getPricelist();
  const canManagePricelist = canAccess("pricelist:manage");
  const canBookSale = canAccess("sales:manage");

  $("priceList").innerHTML = services.length
    ? `<div class="price-services-track">${services.map((serviceItem, serviceIndex) => `
      <article class="price-service-card" style="--service-theme:${escapeHtml(serviceItem.theme || "#ff5b10")}">
        <div class="price-service-head">
          <div>
            <p>Service</p>
            <h3>${escapeHtml(serviceItem.service)}</h3>
          </div>
          <div class="service-actions">
            ${serviceItem.image ? `<button class="service-image-button" type="button" data-download-service-image="${serviceIndex}" aria-label="Download gambar service"><span aria-hidden="true"></span></button>` : ""}
            ${canManagePricelist ? `<button class="delete-service-button" type="button" data-delete-price="${serviceIndex}">Delete</button>` : ""}
          </div>
        </div>
        <div class="package-card-list">
          ${serviceItem.packages.map((pkg, packageIndex) => `
            <div class="package-card" role="button" tabindex="0" data-package-card data-service-index="${serviceIndex}" data-package-index="${packageIndex}">
              <span>${escapeHtml(pkg.name)}</span>
              <strong>${formatMoney(pkg.amount)}</strong>
              <small>${escapeHtml(pkg.details || "Detail belum diset")}</small>
            </div>
          `).join("")}
        </div>
        ${serviceItem.addOns ? `<p class="service-addons">Add-on: ${escapeHtml(serviceItem.addOns)}</p>` : ""}
        ${canBookSale ? `<button class="book-service-button" type="button" data-book-service="${serviceIndex}">Book Now</button>` : ""}
        <p class="hold-hint">Tap package untuk copy.${canManagePricelist ? " Hold 5 saat untuk edit." : ""}</p>
      </article>
    `).join("")}</div>`
    : "<div class=\"identity-result\"><p>Belum ada pricelist. Isi detail service di atas, kemudian tekan Proceed Pricelist.</p></div>";
}

function getSales() {
  try {
    return JSON.parse(storage.getItem("sales") || "[]");
  } catch {
    return [];
  }
}

function setSales(sales) {
  storage.setItem("sales", JSON.stringify(sales));
  if (document.querySelector(".tab.active")?.dataset.tab === "lubuk") renderSaleSummary();
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isSameWeek(date, now) {
  const start = new Date(now);
  const day = start.getDay() || 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function taskDateKey(value = new Date()) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return attendanceDateKey();
  return date.toISOString().slice(0, 10);
}

function activeProjects() {
  return getSales().filter((sale) => !["finish", "finished", "cancel", "cancelled"].includes(String(sale.status || "").toLowerCase()));
}

function roleReportData() {
  const role = getCurrentAccount().role;
  const sales = getSales();
  const totalSale = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const totalClient = new Set(sales.map((sale) => (sale.customer || "").trim()).filter(Boolean)).size || sales.length;
  const targetClient = Number(storage.getItem("targetClient") || 100);
  const targetSale = Number(storage.getItem("targetSale") || 10000);
  const todayAttendance = todaysAttendance();
  const staffToday = new Set(todayAttendance.map((record) => record.name).filter(Boolean)).size;
  const knownStaff = new Set([
    ...activeStaffProfiles().map((staff) => staff.name).filter(Boolean),
    ...getAttendanceRecords().map((record) => record.name).filter(Boolean),
    ...getAchievements().map((item) => item.staff).filter(Boolean)
  ]);
  const totalStaff = Number(storage.getItem("totalStaff") || knownStaff.size || 8);
  const todayKey = attendanceDateKey();
  const todaysTasks = getTasks().filter((task) => taskDateKey(task.date || task.createdAt || new Date()) === todayKey);
  const myTasks = todaysTasks.filter((task) => isStaffSelf(task.staff));
  const doneTasks = todaysTasks.filter((task) => String(task.status || "").toLowerCase() === "done");
  const myDoneTasks = myTasks.filter((task) => String(task.status || "").toLowerCase() === "done");
  const lateToday = todayAttendance.filter((record) => {
    if (record.mode !== "in") return false;
    const date = new Date(record.time);
    return date.getHours() > 9 || (date.getHours() === 9 && date.getMinutes() > 15);
  }).length;
  const pendingStaff = getStaffApplications().filter((item) => (item.status || "pending") === "pending").length;
  const compactMoney = (value) => Number(value) >= 1000 ? `RM${Math.round(Number(value) / 1000)}K` : formatMoney(value).replace("RM ", "RM");
  const reportMoney = (value) => `RM${Math.round(Number(value || 0)).toLocaleString("en-MY")}`;

  if (["boss", "admin"].includes(role)) {
    return {
      title: "Lubuk IT Report",
      metrics: [
        [totalClient, targetClient, "Total Client"],
        [reportMoney(totalSale), compactMoney(targetSale), "Total Sale"],
        [staffToday, totalStaff, "Staff Work"]
      ]
    };
  }
  if (role === "hr") {
    return {
      title: "HR Report",
      metrics: [
        [staffToday, totalStaff, "Staff Today"],
        [lateToday, totalStaff, "Late/Alert"],
        [pendingStaff, totalStaff, "New Staff"]
      ]
    };
  }
  if (role === "sale") {
    return {
      title: "Sales Report",
      metrics: [
        [totalClient, targetClient, "Client"],
        [reportMoney(totalSale), compactMoney(targetSale), "Sale"],
        [activeProjects().length, sales.length || 1, "Active Project"]
      ]
    };
  }
  if (role === "marketing") {
    return {
      title: "Marketing Report",
      metrics: [
        [doneTasks.length, todaysTasks.length || 1, "Task Done"],
        [activeProjects().length, sales.length || 1, "Campaign/Project"],
        [staffToday, totalStaff, "Team Online"]
      ]
    };
  }
  if (role === "graphic_designer") {
    return {
      title: "Designer Report",
      metrics: [
        [myDoneTasks.length, myTasks.length || 1, "My Task"],
        [activeProjects().length, sales.length || 1, "Project"],
        [hasOpenAttendancePunch() ? 1 : 0, 1, "Attendance"]
      ]
    };
  }
  return {
    title: "Staff Report",
    metrics: [
      [myDoneTasks.length, myTasks.length || 1, "My Task"],
      [hasOpenAttendancePunch() ? 1 : 0, 1, "Attendance"],
      [staffToday, totalStaff, "Team Online"]
    ]
  };
}

function renderSaleSummary() {
  if (!$("condition")) return;
  setMetricLabels(["", "", ""]);
  document.querySelector(".weather-card").classList.add("sale-summary-card");
  $("weatherIcon").classList.add("sale-mark");
  const ratioMetric = (current, target, label) => `<span class="metric-ratio"><span class="metric-current">${current}</span><span class="metric-target">/${target} ${label}</span></span>`;
  const report = roleReportData();

  $("condition").textContent = report.title;
  $("place").textContent = "";
  $("temperature").textContent = "";
  $("feelsLike").innerHTML = ratioMetric(...report.metrics[0]);
  $("humidity").innerHTML = ratioMetric(...report.metrics[1]);
  $("wind").innerHTML = ratioMetric(...report.metrics[2]);
  $("pressure").textContent = "";
}

function getSaleReportStats() {
  const sales = getSales();
  const now = new Date();
  const totalFor = (filterFn) => sales
    .filter((sale) => filterFn(new Date(sale.createdAt || sale.id || Date.now())))
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const active = sales.filter((sale) => !["finish", "cancel"].includes(sale.status || "in-project")).length;
  const finish = sales.filter((sale) => (sale.status || "in-project") === "finish").length;
  const cancel = sales.filter((sale) => (sale.status || "in-project") === "cancel").length;
  const due = sales.filter((sale) => (sale.status || "in-project") === "due-date").length;
  return {
    sales,
    totalRevenue,
    daily: totalFor((date) => isSameDay(date, now)),
    weekly: totalFor((date) => isSameWeek(date, now)),
    monthly: totalFor((date) => date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()),
    active,
    finish,
    cancel,
    due,
    average: sales.length ? totalRevenue / sales.length : 0
  };
}

function renderSalesReportPanel() {
  const stats = getSaleReportStats();
  const totalCount = Math.max(stats.sales.length, 1);
  const activePercent = Math.round((stats.active / totalCount) * 100);
  const finishPercent = Math.round((stats.finish / totalCount) * 100);
  const cancelPercent = Math.round((stats.cancel / totalCount) * 100);
  $("salesReportPanel").innerHTML = `
    <section class="sales-report-card">
      <div class="sales-report-head">
        <div>
          <span>Sale Report</span>
          <h3>${formatMoney(stats.monthly)}</h3>
          <p>Monthly revenue • ${stats.sales.length} sale record</p>
        </div>
        <strong>${stats.active} Active</strong>
      </div>
      <div class="sales-report-grid">
        <div><dt>${formatMoney(stats.daily)}</dt><dd>Daily</dd></div>
        <div><dt>${formatMoney(stats.weekly)}</dt><dd>Weekly</dd></div>
        <div><dt>${formatMoney(stats.totalRevenue)}</dt><dd>Total Revenue</dd></div>
        <div><dt>${formatMoney(stats.average)}</dt><dd>Average Sale</dd></div>
      </div>
      <div class="sales-status-row">
        <div><strong>${stats.active}</strong><span>In progress</span></div>
        <div><strong>${stats.due}</strong><span>Due date</span></div>
        <div><strong>${stats.finish}</strong><span>Finish</span></div>
        <div><strong>${stats.cancel}</strong><span>Cancel</span></div>
      </div>
      <div class="sales-progress" aria-label="Sale status progress">
        <span class="active" style="width:${activePercent}%"></span>
        <span class="finish" style="width:${finishPercent}%"></span>
        <span class="cancel" style="width:${cancelPercent}%"></span>
      </div>
      <p class="sales-report-note">Report dikira dari semua booking yang sudah generate invoice.</p>
    </section>
  `;
}

function openBookingPanel(serviceIndex) {
  if (!requirePermission("sales:manage", "booking client")) return;
  const services = getPricelist();
  const serviceItem = services[serviceIndex];
  if (!serviceItem) return;
  openAppPanel("bookingPanel");
  $("bookingForm").reset();
  $("bookingServiceName").textContent = `Started with ${serviceItem.service}. Add package dari service lain kalau perlu.`;
  $("bookingDueDate").value = dateKey(new Date(Date.now() + 7 * 86400000));
  $("bookingPackageList").innerHTML = services.map((item, currentServiceIndex) => `
    <section class="booking-service-group ${currentServiceIndex === serviceIndex ? "open" : ""}" data-booking-service-group>
      <button class="booking-service-toggle" type="button" data-toggle-booking-service="${currentServiceIndex}">
        <span>${escapeHtml(item.service)}</span>
        <small>${item.packages.length} package</small>
      </button>
      <div class="booking-service-packages">
        ${item.packages.map((pkg, packageIndex) => `
          <label class="booking-package">
            <input type="checkbox" data-book-service-index="${currentServiceIndex}" data-book-package-index="${packageIndex}" ${currentServiceIndex === serviceIndex ? "checked" : ""}>
            <span>
              <strong>${escapeHtml(pkg.name)}</strong>
              <small>${formatMoney(pkg.amount)} - ${escapeHtml(pkg.details || "No detail")}</small>
            </span>
          </label>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function toggleBookingService(index) {
  const group = document.querySelector(`[data-toggle-booking-service="${index}"]`)?.closest("[data-booking-service-group]");
  if (group) group.classList.toggle("open");
}

function formatInvoiceDate(value) {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${String(safeDate.getDate()).padStart(2, "0")},${months[safeDate.getMonth()]},${safeDate.getFullYear()}`;
}

function invoiceNumber(value) {
  return String(value || Date.now()).slice(-4).padStart(4, "0");
}

function buildQuotationHtml(data) {
  const { customer, businessName, address, phone, email, valid, items, note, id, createdAt } = data;
  const company = getCompany();
  const settings = getSettings();
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const logoUrl = new URL("assets/brand/lubukit-secondary-logo.png", window.location.href).href;
  const invoiceRows = items.map((item) => {
    const amount = Number(item.amount || 0);
    return `<tr><td class="center">1</td><td><strong>${escapeHtml(item.name)}</strong>${item.details ? `<small>${escapeHtml(item.details)}</small>` : ""}</td><td class="money">${formatMoney(amount).replace("RM ", "RM")}</td><td class="money">${formatMoney(amount).replace("RM ", "RM")}</td></tr>`;
  }).join("");
  const emptyRows = Array.from({ length: Math.max(0, 5 - items.length) }, () => "<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>").join("");
  const companyName = company.name || "Lubuk IT";
  const companySsm = company.ssm || "TR0292390-X";
  const companyAddress = company.address || "65, Jln Eco Majestic 9/1A, 43500 Semenyih, Selangor";
  const companyPhone = company.phone || "011-33086137";
  const bankName = settings.bankName || "MAYBANK";
  const bankAccount = settings.bankAccount || "5582 7570 5354";
  const bankHolder = settings.bankHolder || `${companyName} Enterprise`;
  return `<!doctype html><html><head><title>Invoice - ${escapeHtml(customer)}</title>
    <style>
      @page{size:A4;margin:0}
      *{box-sizing:border-box}
      body{margin:0;background:#f7f7f5;color:#171717;font-family:Arial,Helvetica,sans-serif}
      .page{width:794px;min-height:1123px;margin:0 auto;padding:64px 78px 42px;background:#fff;position:relative;overflow:hidden}
      .page::before{content:"";position:absolute;inset:0 0 auto;height:14px;background:linear-gradient(90deg,#ff5c00,#ff7a1a,#ff2b00)}
      .brand{text-align:center;margin-bottom:48px}
      .brand img{width:286px;max-width:58%;height:auto;display:block;margin:0 auto 16px}
      .brand p{margin:0;font-size:15px;font-style:italic;font-weight:800;color:#222}
      .doc-head{display:grid;grid-template-columns:1fr auto;align-items:end;margin-bottom:28px}
      .doc-title h1{margin:0;color:#ff5c00;font-size:42px;letter-spacing:0;font-weight:900}
      .doc-title p{margin:4px 0 0;color:#777;font-size:12px;text-transform:uppercase;letter-spacing:.16em;font-weight:800}
      .invoice-pill{min-width:128px;border-radius:18px;padding:14px 18px;background:#171717;color:#fff;text-align:center}
      .invoice-pill span{display:block;color:#ff7a1a;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
      .invoice-pill strong{display:block;margin-top:4px;font-size:20px}
      .top{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:28px;font-size:13px;line-height:1.35}
      .info-card{border:1px solid #ededed;border-radius:18px;padding:18px 20px;background:#fcfcfb}
      .info-card h2{margin:0 0 14px;color:#ff5c00;font-size:11px;letter-spacing:.16em;text-transform:uppercase}
      .line{display:grid;grid-template-columns:112px 1fr;gap:12px;margin-top:8px}
      .line b{font-size:12px;color:#171717}
      .line span{color:#2a2a2a}
      b{font-weight:900}
      .divider{height:2px;background:linear-gradient(90deg,#14877f,#ff8a3d);margin:20px 0 18px}
      .to{display:grid;grid-template-columns:84px 170px 1fr;gap:12px 0;margin:0 0 34px;font-size:14px;line-height:1.28}
      .to b{font-size:13px}
      .to .value{white-space:pre-line}
      table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;font-size:14px;border:1px solid #ececec;border-radius:14px;overflow:hidden}
      th{background:#ff6500;color:#fff;font-weight:900;text-align:center;padding:13px 8px;border-right:1px solid rgba(255,255,255,.5)}
      th:last-child{border-right:0}
      td{height:42px;border-right:1px solid #ececec;border-bottom:1px solid #ececec;padding:11px 10px;vertical-align:top}
      td:last-child{border-right:0}
      tbody tr:nth-child(even) td{background:#fcfcfc}
      td small{display:block;margin-top:4px;color:#777;font-size:11px;line-height:1.25}
      th:nth-child(1),td:nth-child(1){width:17%}
      th:nth-child(2),td:nth-child(2){width:44%}
      th:nth-child(3),td:nth-child(3){width:16.5%}
      th:nth-child(4),td:nth-child(4){width:22.5%}
      .center{text-align:center}
      .money{text-align:right;font-weight:800}
      .total-label{background:#ff6500!important;color:#fff;text-align:right;font-weight:900;font-size:15px}
      .total-value{background:#ff0808!important;color:#fff;text-align:right;font-weight:900;font-size:16px}
      .terms{margin-top:56px;border-radius:16px;padding:18px 20px;background:#fff8f1;font-size:17px;line-height:1.45}
      .terms h3{margin:0 0 8px;color:#65461f;font-size:18px}
      .terms p{margin:0}
      .thanks{text-align:center;margin-top:24px;font-weight:900;font-size:18px;color:#171717}
      .footer{text-align:center;margin-top:18px;font-size:14px;color:#333}
      .note{margin-top:14px;border-left:4px solid #ff6500;padding:10px 12px;background:#fafafa;font-size:12px;color:#555}
      @media print{.page{margin:0;box-shadow:none}body{background:#fff}}
    </style>
  </head><body>
    <main class="page">
      <section class="brand">
        <img src="${logoUrl}" alt="Lubuk IT">
        <p>${escapeHtml(companyName)} Enterprise (${escapeHtml(companySsm)})</p>
      </section>
      <section class="doc-head">
        <div class="doc-title">
          <h1>INVOICE</h1>
          <p>Design service billing</p>
        </div>
        <div class="invoice-pill"><span>Invoice No</span><strong>${invoiceNumber(id)}</strong></div>
      </section>
      <section class="top">
        <div class="info-card">
          <h2>Company</h2>
          <div class="line"><b>COMPANY NAME</b><span>${escapeHtml(companyName.replace(/\s+/g, ""))}</span></div>
          <div class="line"><b>SSM</b><span>${escapeHtml(companySsm)}</span></div>
          <div class="line"><b>CONTACT</b><span>${escapeHtml(companyPhone)}</span></div>
        </div>
        <div class="info-card">
          <h2>Payment</h2>
          <div class="line"><b>DATE</b><span>${formatInvoiceDate(createdAt || valid)}</span></div>
          <div class="line"><b>ACCOUNT</b><span>${escapeHtml(bankHolder).toUpperCase()}</span></div>
          <div class="line"><b>BANK</b><span>${escapeHtml(bankName).toUpperCase()}</span></div>
          <div class="line"><b>BANK NO</b><span>${escapeHtml(bankAccount)}</span></div>
        </div>
      </section>
      <div class="divider"></div>
      <section class="to">
        <b>TO:</b><b>NAME:</b><span>${escapeHtml(customer || "-")}</span>
        <span></span><b>BUSINESS NAME:</b><span>${escapeHtml(businessName || "-")}</span>
        <span></span><b>ADDRESS:</b><span class="value">${escapeHtml(address || "-")}</span>
        <span></span><b>PHONE:</b><span>${escapeHtml(phone || email || "-")}</span>
      </section>
      <table>
        <thead><tr><th>AMOUNT</th><th>ITEM DESCRIPTION</th><th>PRICE</th><th>TOTAL</th></tr></thead>
        <tbody>${invoiceRows}${emptyRows}<tr><td colspan="3" class="total-label">TOTAL:</td><td class="total-value">${formatMoney(total).replace("RM ", "RM")}</td></tr></tbody>
      </table>
      ${note ? `<div class="note"><b>Note:</b> ${escapeHtml(note)}</div>` : ""}
      <section class="terms">
        <h3>Terms & Conditions</h3>
        <p>&bull; Deposit payment is required upon receipt of this quote.</p>
      </section>
      <div class="thanks">THANK YOU!</div>
      <div class="footer">${escapeHtml(companyAddress)} / ${escapeHtml(companyPhone)}</div>
    </main>
    <script>window.onload=()=>window.print();<\/script>
  </body></html>`;
}

function printQuotation(data) {
  const win = window.open("", "_blank");
  if (!win) {
    window.alert("Popup blocked. Benarkan popup untuk generate quotation.");
    return false;
  }
  win.document.write(buildQuotationHtml(data));
  win.document.close();
  return true;
}

function saveBooking(event) {
  event.preventDefault();
  if (!requirePermission("sales:manage", "booking dan invoice")) return;
  const services = getPricelist();
  const selectedInputs = [...$("bookingPackageList").querySelectorAll("input:checked")];
  if (!selectedInputs.length) {
    window.alert("Pilih sekurang-kurangnya satu package.");
    return;
  }
  const customer = $("bookingClientName").value.trim();
  if (!customer) {
    window.alert("Masukkan nama client.");
    return;
  }
  const items = selectedInputs.map((input) => {
    const serviceItem = services[Number(input.dataset.bookServiceIndex)];
    const pkg = serviceItem?.packages?.[Number(input.dataset.bookPackageIndex)];
    return {
      name: `${serviceItem.service} - ${pkg.name}`,
      amount: Number(pkg.amount || 0),
      details: pkg.details || ""
    };
  }).filter((item) => item.name && Number.isFinite(item.amount));
  const serviceNames = [...new Set(items.map((item) => item.name.split(" - ")[0]))];
  const sale = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    service: serviceNames.join(", "),
    services: serviceNames,
    customer,
    businessName: $("bookingBusinessName").value.trim(),
    phone: $("bookingClientPhone").value.trim(),
    email: $("bookingClientEmail").value.trim(),
    address: $("bookingClientAddress").value.trim(),
    due: $("bookingDueDate").value,
    status: "in-project",
    note: $("bookingNote").value.trim(),
    items,
    total: items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  };
  setSales([sale, ...getSales()]);
  printQuotation(sale);
  openSalesPanel();
}

function projectStatusLabel(status) {
  return {
    "in-project": "In Project",
    "due-date": "Due Date",
    finish: "Finish",
    cancel: "Cancel"
  }[status || "in-project"] || "In Project";
}

function renderProjects() {
  const sales = getSales();
  const canManageProject = canAccess("project:manage");
  renderProjectReport();
  $("projectList").innerHTML = sales.length ? sales.map((sale) => {
    const status = sale.status || "in-project";
    return `
      <article class="project-card status-${escapeHtml(status)}">
        <div class="project-card-head">
          <div>
            <p>${escapeHtml(sale.service || "Service")}</p>
            <h3>${escapeHtml(sale.customer || "Client")}</h3>
          </div>
          <span>${escapeHtml(projectStatusLabel(status))}</span>
        </div>
        <div class="sale-meta">
          <span>Due date: ${escapeHtml(sale.due || "-")}</span>
          <span>Phone: ${escapeHtml(sale.phone || "-")}</span>
          <span>Email: ${escapeHtml(sale.email || "-")}</span>
        </div>
        <div class="sale-items">
          ${sale.items.map((item) => `<p>${escapeHtml(item.name)} <strong>${formatMoney(item.amount)}</strong></p>`).join("")}
        </div>
        ${canManageProject ? `<label class="project-status-select">Status
          <select data-project-status="${sale.id}">
            <option value="in-project" ${status === "in-project" ? "selected" : ""}>In Project</option>
            <option value="due-date" ${status === "due-date" ? "selected" : ""}>Due Date</option>
            <option value="finish" ${status === "finish" ? "selected" : ""}>Finish</option>
            <option value="cancel" ${status === "cancel" ? "selected" : ""}>Cancel</option>
          </select>
        </label>` : ""}
        <button type="button" data-open-project-chat="${sale.id}">Chat</button>
      </article>
    `;
  }).join("") : "<div class=\"identity-result\"><p>Belum ada project. Bila client booking dan generate quotation, project akan masuk sini.</p></div>";
}

function taskDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function getTasks() {
  try {
    return JSON.parse(storage.getItem("staffTasks") || "[]");
  } catch {
    return [];
  }
}

function setTasks(tasks) {
  storage.setItem("staffTasks", JSON.stringify(tasks));
  if (document.querySelector(".tab.active")?.dataset.tab === "lubuk") renderSaleSummary();
}

function setDefaultTaskDate() {
  if ($("taskDate") && !$("taskDate").value) $("taskDate").value = taskDateKey();
}

function switchProjectTab(tabName) {
  if (tabName === "tasks" && !(canAccess("task:self") || canAccess("task:manage"))) {
    tabName = "projects";
  }
  if (tabName === "admin" && !requirePermission("task:manage", "Project Admin")) return;
  document.querySelectorAll("[data-project-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.projectTab === tabName);
  });
  $("projectSection").hidden = tabName !== "projects";
  $("taskSection").hidden = tabName !== "tasks";
  $("adminSection").hidden = tabName !== "admin";
}

function saveTask(event) {
  event.preventDefault();
  if (!requirePermission("task:manage", "create daily task")) return;
  const task = {
    id: Date.now(),
    staff: $("taskStaff").value.trim(),
    date: $("taskDate").value || taskDateKey(),
    title: $("taskTitle").value.trim(),
    status: "pending",
    createdAt: new Date().toISOString()
  };
  if (!task.staff || !task.title) {
    window.alert("Masukkan nama staff dan task.");
    return;
  }
  setTasks([task, ...getTasks()]);
  $("taskTitle").value = "";
  renderTasks();
  renderAdminTasks();
}

function renderTasks() {
  const allTasks = getTasks();
  const tasks = canAccess("task:manage") || canAccess("task:view")
    ? allTasks
    : allTasks.filter((task) => isStaffSelf(task.staff));
  const today = taskDateKey();
  const todaysTasks = tasks.filter((task) => (task.date || today) === today);
  const historyTasks = tasks.filter((task) => (task.date || today) !== today).slice(0, 30);
  const grouped = todaysTasks.reduce((groups, task) => {
    const staff = staffDisplayName(task.staff);
    groups[staff] = groups[staff] || [];
    groups[staff].push(task);
    return groups;
  }, {});
  $("taskTodaySummary").textContent = `${todaysTasks.filter((task) => task.status === "done").length}/${todaysTasks.length} done`;
  $("taskHistorySummary").textContent = `${historyTasks.length} record`;
  $("taskList").innerHTML = Object.keys(grouped).length ? Object.entries(grouped).map(([staff, staffTasks]) => `
    <article class="task-staff-card">
      <div class="task-staff-head">
        <h3>${escapeHtml(staff)}</h3>
        <span>${staffTasks.filter((task) => task.status === "done").length}/${staffTasks.length} done</span>
      </div>
      <div class="task-items">
        ${staffTasks.map((task) => `
          <label class="task-item ${task.status === "done" ? "done" : ""}">
            <input type="checkbox" data-task-status="${task.id}" ${task.status === "done" ? "checked" : ""}>
            <span>${escapeHtml(task.title)}</span>
          </label>
        `).join("")}
      </div>
    </article>
  `).join("") : "<div class=\"identity-result\"><p>Belum ada daily task hari ini. Admin boleh create task harian untuk staff.</p></div>";
  $("taskHistory").innerHTML = historyTasks.length ? historyTasks.map((task) => `
    <article class="task-history-item ${task.status === "done" ? "done" : ""}">
      <div>
        <strong>${escapeHtml(staffDisplayName(task.staff))}</strong>
        <span>${escapeHtml(taskDateKey(task.date))} • ${task.status === "done" ? "Done" : "Pending"}</span>
      </div>
      <p>${escapeHtml(task.title || "")}</p>
    </article>
  `).join("") : "<div class=\"identity-result\"><p>Belum ada history task.</p></div>";
  renderProjectReport();
}

function renderAdminTasks() {
  if (!$("adminTaskList")) return;
  const tasks = getTasks();
  $("adminTaskList").innerHTML = tasks.length ? tasks.slice(0, 40).map((task) => `
    <article class="task-admin-card">
      <div>
        <h3>${escapeHtml(staffDisplayName(task.staff))}</h3>
        <p>${escapeHtml(taskDateKey(task.date))} • ${task.status === "done" ? "Done" : "Pending"}</p>
        <span>${escapeHtml(task.title || "")}</span>
      </div>
      ${canAccess("task:manage") ? `<button type="button" data-delete-task="${task.id}">Delete</button>` : ""}
    </article>
  `).join("") : "<div class=\"identity-result\"><p>Belum ada task. Create daily task untuk staff di atas.</p></div>";
}

function renderProjectReport() {
  if (!$("projectReport")) return;
  const sales = getSales();
  const todayKey = taskDateKey();
  const today = new Date(todayKey);
  const dueSoon = sales.filter((sale) => {
    if (!sale.due || ["finish", "cancel"].includes(sale.status || "in-project")) return false;
    const due = new Date(sale.due);
    const diff = Math.ceil((due - today) / 86400000);
    return diff >= 0 && diff <= 3;
  }).length;
  const active = sales.filter((sale) => !["finish", "cancel"].includes(sale.status || "in-project")).length;
  const finish = sales.filter((sale) => (sale.status || "in-project") === "finish").length;
  const cancel = sales.filter((sale) => (sale.status || "in-project") === "cancel").length;
  const tasks = getTasks().filter((task) => (task.date || todayKey) === todayKey);
  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const staffCount = new Set(tasks.map((task) => task.staff).filter(Boolean)).size;
  $("projectReport").innerHTML = `
    <section class="project-report-card">
      <div class="project-report-head">
        <div>
          <span>Project Report</span>
          <h3>${active} Active Project</h3>
        </div>
        <strong>${sales.length}</strong>
      </div>
      <div class="project-report-grid">
        <div><strong>${dueSoon}</strong><span>Due Soon</span></div>
        <div><strong>${finish}</strong><span>Finish</span></div>
        <div><strong>${cancel}</strong><span>Cancel</span></div>
        <div><strong>${tasks.length}</strong><span>Task Today</span></div>
        <div><strong>${doneTasks}</strong><span>Task Done</span></div>
        <div><strong>${staffCount}</strong><span>Staff Work</span></div>
      </div>
    </section>
  `;
}

function updateTaskStatus(id, done) {
  const tasks = getTasks();
  const task = tasks.find((item) => String(item.id) === String(id));
  if (!task) return;
  if (!canManageTask(task)) {
    requirePermission("task:manage", "update task staff lain");
    return;
  }
  task.status = done ? "done" : "pending";
  setTasks(tasks);
  renderTasks();
  renderAdminTasks();
}

function deleteTask(id) {
  if (!requirePermission("task:manage", "delete task")) return;
  if (!window.confirm("Delete task ini?")) return;
  setTasks(getTasks().filter((task) => String(task.id) !== String(id)));
  renderTasks();
  renderAdminTasks();
}

function openProjectChat(id) {
  const clientMode = isClientChatMode() || new URLSearchParams(window.location.search).has("chat");
  const sale = getSales().find((item) => String(item.id) === String(id));
  activeProjectChatId = sale?.id || id;
  openAppPanel("projectChatPanel");
  document.body.classList.toggle("client-chat-mode", clientMode);
  $("projectChatClient").textContent = sale?.customer || "Project Chat";
  if (clientMode) {
    $("projectChatName").value = getClientChatName();
  } else {
    $("projectChatName").value = getProfile().name || getCurrentAccount().name || "Muaz";
  }
  updateClientChatGate();
  renderProjectChat();
  subscribeProjectChat();
}

function isClientChatMode() {
  return document.body.classList.contains("client-chat-mode");
}

function clientChatNameKey(id = activeProjectChatId) {
  return `clientChatName:${id || "default"}`;
}

function getClientChatName() {
  return storage.getItem(clientChatNameKey()).trim();
}

function setClientChatName(name) {
  storage.setItem(clientChatNameKey(), name.trim());
}

function updateClientChatGate() {
  const needsName = isClientChatMode() && !getClientChatName();
  document.body.classList.toggle("awaiting-client-name", needsName);
  $("clientChatIntro")?.toggleAttribute("hidden", !needsName);
  if (isClientChatMode() && getClientChatName()) {
    $("projectChatName").value = getClientChatName();
  }
}

function saveClientChatName(event) {
  event.preventDefault();
  const name = $("clientChatNameInput")?.value.trim();
  if (!name) return;
  setClientChatName(name);
  $("projectChatName").value = name;
  updateClientChatGate();
  renderProjectChat();
}

function renderProjectChat() {
  const sale = getSales().find((item) => String(item.id) === String(activeProjectChatId));
  const localRooms = getLocalChatRooms();
  const messages = sale?.chat || localRooms[String(activeProjectChatId)] || [];
  renderChatMessages(messages);
}

function renderChatMessages(messages) {
  const currentName = ($("projectChatName")?.value || getProfile().name || getCurrentAccount().name || "").trim().toLowerCase();
  $("projectChatThread").innerHTML = messages.length ? messages.map((message) => {
    const sender = String(message.name || "User").trim();
    const isMe = sender.toLowerCase() === currentName || String(message.email || "").toLowerCase() === String(getCurrentAccount().email || "").toLowerCase();
    return `
    <div class="chat-message ${isMe ? "mine" : "theirs"}">
      <div><strong>${escapeHtml(sender || "User")}</strong><span>${escapeHtml(message.time || "")}</span></div>
      <p>${escapeHtml(message.text || "")}</p>
    </div>`;
  }).join("") : "<div class=\"chat-empty\"><strong>Belum ada update</strong><span>Mula chat untuk project ini.</span></div>";
  $("projectChatThread").scrollTop = $("projectChatThread").scrollHeight;
}

function initFirestore() {
  const services = initFirebaseCore();
  if (!services?.db) {
    $("projectChatStatus").textContent = "Local mode - database belum connect";
    return null;
  }
  $("projectChatStatus").textContent = "Online database connected";
  return services.db;
}

async function initChatFirestore() {
  const services = initFirebaseCore();
  if (!services?.db) {
    $("projectChatStatus").textContent = "Local mode - database belum connect";
    return null;
  }
  if (services.auth && firebaseConfig().enabled && !services.auth.currentUser) {
    $("projectChatStatus").textContent = "Connecting chat...";
    await services.auth.signInAnonymously().catch(() => {});
  }
  $("projectChatStatus").textContent = "Online database connected";
  return services.db;
}

function getLocalChatRooms() {
  try {
    return JSON.parse(storage.getItem("projectChatRooms") || "{}");
  } catch {
    return {};
  }
}

function setLocalChatRooms(rooms) {
  storage.setItem("projectChatRooms", JSON.stringify(rooms));
}

function localProjectMessages(id) {
  const sale = getSales().find((item) => String(item.id) === String(id));
  const rooms = getLocalChatRooms();
  return sale?.chat || rooms[String(id)] || [];
}

function syncLocalMessagesToCloud(db, id) {
  const localMessages = localProjectMessages(id);
  if (!localMessages.length) return;
  const roomRef = db.collection("projectChats").doc(String(id)).collection("messages");
  localMessages.forEach((message) => {
    if (message.cloudSynced) return;
    roomRef.add({ ...message, cloudSynced: true }).catch(() => {});
    message.cloudSynced = true;
  });
  const sales = getSales();
  const sale = sales.find((item) => String(item.id) === String(id));
  if (sale?.chat) {
    sale.chat = localMessages;
    setSales(sales);
  } else {
    const rooms = getLocalChatRooms();
    rooms[String(id)] = localMessages;
    setLocalChatRooms(rooms);
  }
}

async function subscribeProjectChat() {
  if (chatUnsubscribe) chatUnsubscribe();
  chatUnsubscribe = null;
  const db = await initChatFirestore();
  if (!db || !activeProjectChatId) return;
  $("projectChatStatus").textContent = "Online database connected";
  syncLocalMessagesToCloud(db, activeProjectChatId);
  chatUnsubscribe = db.collection("projectChats")
    .doc(String(activeProjectChatId))
    .collection("messages")
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
      const cloudMessages = snapshot.docs.map((doc) => doc.data());
      if (!cloudMessages.length) syncLocalMessagesToCloud(db, activeProjectChatId);
      renderChatMessages(cloudMessages.length ? cloudMessages : localProjectMessages(activeProjectChatId));
    }, () => {
      $("projectChatStatus").textContent = "Local mode - cloud chat belum dapat sync";
      renderChatMessages(localProjectMessages(activeProjectChatId));
    });
}

async function saveProjectChat(event) {
  event.preventDefault();
  if (!isClientChatMode() && !requirePermission("chat:send", "send chat")) return;
  if (isClientChatMode() && !getClientChatName()) {
    updateClientChatGate();
    window.alert("Masukkan nama dulu sebelum chat.");
    return;
  }
  const text = $("projectChatMessage").value.trim();
  if (!text) return;
  const message = {
    name: isClientChatMode() ? getClientChatName() : ($("projectChatName").value.trim() || "User"),
    email: isClientChatMode() ? "" : (getCurrentAccount().email || ""),
    text,
    time: new Intl.DateTimeFormat("en-MY", { dateStyle: "short", timeStyle: "short" }).format(new Date()),
    createdAt: Date.now()
  };
  const db = await initChatFirestore();
  if (db && activeProjectChatId) {
    const rooms = getLocalChatRooms();
    const key = String(activeProjectChatId);
    rooms[key] = [...(rooms[key] || []), message];
    setLocalChatRooms(rooms);
    db.collection("projectChats").doc(key).collection("messages").add({ ...message, cloudSynced: true });
    $("projectChatMessage").value = "";
    return;
  }
  const sales = getSales();
  const sale = sales.find((item) => String(item.id) === String(activeProjectChatId));
  if (!sale) {
    const rooms = getLocalChatRooms();
    const key = String(activeProjectChatId);
    rooms[key] = [...(rooms[key] || []), message];
    setLocalChatRooms(rooms);
    renderChatMessages(rooms[key]);
    $("projectChatMessage").value = "";
    return;
  }
  sale.chat = sale.chat || [];
  sale.chat.push(message);
  setSales(sales);
  $("projectChatMessage").value = "";
  renderProjectChat();
}

function shareProjectChat() {
  if (!activeProjectChatId) return;
  const url = new URL(window.location.href);
  url.searchParams.set("chat", activeProjectChatId);
  url.searchParams.delete("tab");
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url.toString()).catch(() => {});
  }
  window.alert("Link chat project sudah copy. Share link ini kepada client.");
}

function openSharedProjectChat() {
  const chatId = new URLSearchParams(window.location.search).get("chat");
  if (!chatId) return false;
  document.body.classList.add("client-chat-mode");
  document.body.classList.add("awaiting-client-name");
  window.setTimeout(() => {
    openProjectChat(chatId);
    document.body.classList.add("client-chat-mode");
    updateClientChatGate();
  }, 200);
  return true;
}

function updateProjectStatus(id, status) {
  if (!requirePermission("project:manage", "update project status")) return;
  const sales = getSales();
  const sale = sales.find((item) => String(item.id) === String(id));
  if (!sale) return;
  sale.status = status;
  setSales(sales);
  renderProjects();
  renderSales();
  renderProjectReport();
}

function renderSales() {
  const sales = getSales();
  renderSalesReportPanel();
  $("salesList").innerHTML = sales.length ? sales.map((sale) => `
    <article class="sale-card">
      <div class="sale-card-head">
        <div>
          <p>${escapeHtml(sale.service || "Service")}</p>
          <h3>${escapeHtml(sale.customer || "Client")}</h3>
        </div>
        <strong>${formatMoney(sale.total)}</strong>
      </div>
      <div class="sale-meta">
        <span>Due: ${escapeHtml(sale.due || "-")}</span>
        <span>Phone: ${escapeHtml(sale.phone || "-")}</span>
        <span>Email: ${escapeHtml(sale.email || "-")}</span>
      </div>
      <div class="sale-items">
        ${sale.items.map((item) => `<p>${escapeHtml(item.name)} <strong>${formatMoney(item.amount)}</strong></p>`).join("")}
      </div>
      ${sale.note ? `<p class="sale-note">${escapeHtml(sale.note)}</p>` : ""}
      <button type="button" data-print-sale="${sale.id}">Print Invoice</button>
    </article>
  `).join("") : "<div class=\"identity-result\"><p>Belum ada sale. Tekan Book Now dekat mana-mana service untuk mula booking.</p></div>";
}

function printSaleQuotation(id) {
  const sale = getSales().find((item) => String(item.id) === String(id));
  if (!sale) return;
  printQuotation(sale);
}

function downloadServiceImage(serviceIndex) {
  const serviceItem = getPricelist()[serviceIndex];
  const image = serviceItem?.image || "";
  if (!image) return;
  const link = document.createElement("a");
  const serviceName = (serviceItem.service || "pricelist").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  link.href = image;
  link.download = `${serviceName}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function copyPackagePrice(serviceIndex, packageIndex) {
  const serviceItem = getPricelist()[serviceIndex];
  const pkg = serviceItem?.packages?.[packageIndex];
  if (!serviceItem || !pkg) return;
  const text = `${serviceItem.service} - ${pkg.name}: ${formatMoney(pkg.amount)}${pkg.details ? `\n${pkg.details}` : ""}`;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  window.alert(`Copy price for ${serviceItem.service} - ${pkg.name}`);
}

function editPriceService(index) {
  if (!requirePermission("pricelist:manage", "edit package")) return;
  const serviceItem = getPricelist()[index];
  if (!serviceItem) return;
  editingPriceServiceIndex = index;
  setPriceBuilderVisible(true);
  $("priceServiceName").value = serviceItem.service || "";
  $("packageCount").value = String(Math.min(Math.max(serviceItem.packages.length, 1), 3));
  $("priceSubmit").textContent = "Update Pricelist";
  renderPricePackageInputs(serviceItem.packages);
  $("priceServiceName").focus();
  window.alert(`Edit package untuk ${serviceItem.service}`);
}

function startPackageHold(card) {
  priceHoldTriggered = false;
  window.clearTimeout(priceHoldTimer);
  priceHoldTimer = window.setTimeout(() => {
    priceHoldTriggered = true;
    editPriceService(Number(card.dataset.serviceIndex));
  }, 5000);
}

function stopPackageHold() {
  window.clearTimeout(priceHoldTimer);
}

function handlePackageClick(card) {
  if (priceHoldTriggered) {
    priceHoldTriggered = false;
    return;
  }
  copyPackagePrice(Number(card.dataset.serviceIndex), Number(card.dataset.packageIndex));
}

function deletePriceItem(index) {
  if (!requirePermission("pricelist:manage", "delete service")) return;
  const items = getPricelist();
  const serviceName = items[index]?.service || "service ini";
  if (!window.confirm(`Delete ${serviceName}?`)) return;
  items.splice(index, 1);
  setPricelist(items);
  if (editingPriceServiceIndex === index) resetPriceForm();
  renderPricelist();
}

function detectIdentityTypes(info, hasImage) {
  const types = [];
  if (/\+?\d[\d\s\-()]{7,}/.test(info)) types.push("Phone number");
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(info)) types.push("Email");
  if (/https?:\/\/|www\./i.test(info)) types.push("Link / social profile");
  if (/@[a-zA-Z0-9_.]{2,}/.test(info)) types.push("Username / handle");
  if (hasImage) types.push("Image attached");
  if (!types.length && info.trim()) types.push("General text");
  return types;
}

function getYoutubeId(value) {
  const text = value.trim();
  if (!text) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(text)) return text;

  try {
    const url = new URL(text);
    if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] || "";
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
  } catch {}

  return "";
}

function openMusicPanel() {
  if (!$("musicPanel") || !$("musicSearch")) return;
  $("musicPanel").hidden = false;
  $("musicPanel").classList.remove("minimized");
  $("musicSearch").focus();
}

function closeMusicPanel() {
  if (!$("musicPanel")) return;
  $("musicPanel").hidden = true;
  $("musicPanel").classList.remove("minimized");
}

function minimizeMusicPanel() {
  if (!$("musicPanel")) return;
  $("musicPanel").classList.toggle("minimized");
}

function openYoutubeSearch() {
  showSongSuggestions();
}

function getLyricsKey(videoId) {
  return `lyrics-${videoId || "custom"}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function loadLyrics(videoId, fallback) {
  $("lyricsText").value = storage.getItem(getLyricsKey(videoId)) || fallback || "";
}

function setYoutubeFallback(url) {
  $("youtubeFallback").href = url;
  $("youtubeFallback").hidden = false;
}

function getYoutubeWatchUrl(song) {
  if (song.videoId) return `https://www.youtube.com/watch?v=${song.videoId}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(song.query || `${song.title} ${song.artist}`)}`;
}

function getYoutubeMusicUrl(song) {
  if (song.videoId) return `https://music.youtube.com/watch?v=${song.videoId}`;
  return `https://music.youtube.com/search?q=${encodeURIComponent(song.query || `${song.title} ${song.artist}`)}`;
}

function getYoutubeThumb(videoId) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "assets/brand/lubukit-logo-dp.jpg";
}

function getVideoIdFromUrl(value) {
  const direct = getYoutubeId(value);
  if (direct) return direct;
  const match = String(value || "").match(/[?&]v=([a-zA-Z0-9_-]{11})|\/watch\/([a-zA-Z0-9_-]{11})|\/([a-zA-Z0-9_-]{11})$/);
  return match ? (match[1] || match[2] || match[3] || "") : "";
}

function showAlbumPlayer(song) {
  $("musicFrame").src = "";
  $("youtubeFallback").hidden = true;
  $("emptyVideo").hidden = true;
  $("albumPlayer").hidden = false;
  $("albumTitle").textContent = song.title;
  $("albumArtist").textContent = song.artist || "Unknown Artist";
  $("albumArt").src = song.artwork || "assets/brand/lubukit-logo-dp.jpg";
  $("audioPlayer").src = song.previewUrl || "";
  $("audioPlayer").hidden = !song.previewUrl;
  $("musicCardLabel").textContent = song.title;

  if (song.previewUrl) {
    $("audioPlayer").play().catch(() => {});
  }
}

function showYoutubeAlbum(song) {
  const videoId = song.videoId || "";

  $("musicFrame").src = "";
  $("emptyVideo").hidden = true;
  $("albumPlayer").hidden = false;
  $("albumTitle").textContent = song.title;
  $("albumArtist").textContent = `${song.artist || "YouTube"} - buka untuk audio penuh`;
  $("albumArt").src = song.artwork || getYoutubeThumb(videoId);
  $("audioPlayer").removeAttribute("src");
  $("audioPlayer").hidden = true;
  $("musicCardLabel").textContent = song.title;
  $("youtubeFallback").hidden = true;
  $("lyricsTitle").textContent = `${song.title} - ${song.artist}`;
  storage.setItem("lastMusicVideo", videoId || song.query || song.title);
  storage.setItem("lastMusicTitle", `${song.title} - ${song.artist}`);
  loadLyrics(videoId || song.query || song.title, song.lyrics);
}

function showYoutubeVideo(song) {
  const videoId = song.videoId || "";
  const query = song.query || `${song.title} ${song.artist}`;

  $("albumPlayer").hidden = true;
  $("emptyVideo").hidden = true;
  $("musicFrame").src = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`
    : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}&autoplay=1&rel=0&playsinline=1`;
  setYoutubeFallback(getYoutubeWatchUrl(song));
  $("youtubeFallback").textContent = "Buka Video di YouTube";
  $("lyricsTitle").textContent = `${song.title} - ${song.artist}`;
  $("musicCardLabel").textContent = song.title;
  storage.setItem("lastMusicVideo", videoId || query);
  storage.setItem("lastMusicTitle", `${song.title} - ${song.artist}`);
  loadLyrics(videoId || query, song.lyrics);
}

function chooseLocalMusic() {
  $("localMusicFile").click();
}

function playLocalMusic(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  showAlbumPlayer({
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: "Full song from your file",
    artwork: "assets/brand/lubukit-logo-dp.jpg",
    previewUrl: url,
    trackId: file.name,
    lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik."
  });
  $("lyricsTitle").textContent = file.name.replace(/\.[^/.]+$/, "");
}

function playSong(song) {
  if (musicMode === "video") {
    showYoutubeVideo(song);
    return;
  }

  if (song.previewUrl || song.artwork) {
    showAlbumPlayer(song);
    $("youtubeFallback").hidden = true;
    $("lyricsTitle").textContent = `${song.title} - ${song.artist}`;
    storage.setItem("lastMusicTitle", `${song.title} - ${song.artist}`);
    loadLyrics(song.trackId || song.previewUrl || song.title, song.lyrics);
    return;
  }

  showYoutubeAlbum(song);
}

function setMusicMode(mode) {
  musicMode = mode === "video" ? "video" : "music";
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === musicMode);
  });
}

function playYoutubeInput() {
  const query = $("musicSearch").value.trim();
  const videoId = getYoutubeId(query);

  if (videoId) {
    playSong({
      title: "YouTube Video",
      artist: "YouTube",
      videoId,
      artwork: getYoutubeThumb(videoId),
      lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik."
    });
    $("songResults").innerHTML = "";
    return;
  }

  showSongSuggestions();
}

function buildQuerySuggestions(query) {
  const clean = query.trim();
  if (!clean) return [];

  return [
    { title: clean, artist: "YouTube Search", query: clean, lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik." },
    { title: `${clean} official music video`, artist: "YouTube Search", query: `${clean} official music video`, lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik." },
    { title: `${clean} lyrics`, artist: "YouTube Search", query: `${clean} lyrics video`, lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik." }
  ];
}

function normalizeItunesSong(item) {
  return {
    title: item.trackName || item.collectionName || "Unknown Song",
    artist: item.artistName || "Unknown Artist",
    artwork: (item.artworkUrl100 || "").replace("100x100bb", "600x600bb"),
    previewUrl: item.previewUrl || "",
    trackId: String(item.trackId || item.collectionId || item.previewUrl || ""),
    lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik."
  };
}

async function searchOnlineSongs(rawQuery) {
  const response = await fetch(`https://itunes.apple.com/search?media=music&entity=song&limit=8&term=${encodeURIComponent(rawQuery)}`);
  if (!response.ok) throw new Error("Music search failed");
  const data = await response.json();
  return (data.results || []).map(normalizeItunesSong).filter((song) => song.previewUrl);
}

function normalizeVideoResult(item) {
  const videoId = getVideoIdFromUrl(item.url || item.link || item.id || "");
  return {
    title: item.title || "YouTube Video",
    artist: item.uploaderName || item.author || item.channelName || "YouTube",
    videoId,
    artwork: item.thumbnail || item.thumbnailUrl || getYoutubeThumb(videoId),
    lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik."
  };
}

async function searchYoutubeVideos(rawQuery) {
  const response = await fetch(`https://piped.video/api/v1/search?q=${encodeURIComponent(rawQuery)}&filter=videos`);
  if (!response.ok) throw new Error("Video search failed");
  const data = await response.json();
  return (data.items || data || [])
    .map(normalizeVideoResult)
    .filter((song) => song.videoId)
    .slice(0, 8);
}

async function showSongSuggestions() {
  const rawQuery = $("musicSearch").value.trim();
  if (!rawQuery) {
    $("songResults").innerHTML = "<button type=\"button\">Tulis tajuk lagu dulu</button>";
    return;
  }

  $("songResults").innerHTML = "<button type=\"button\">Mencari lagu...</button>";

  if (musicMode === "video") {
    try {
      const videos = await searchYoutubeVideos(rawQuery);
      if (videos.length) {
        renderSongSuggestions(videos);
        return;
      }
    } catch {}

    renderSongSuggestions(buildQuerySuggestions(rawQuery));
    showYoutubeVideo({ title: rawQuery, artist: "YouTube Search", query: rawQuery, lyrics: "Paste lirik sendiri di sini, kemudian tekan Save Lirik." });
    return;
  }

  try {
    const onlineSongs = await searchOnlineSongs(rawQuery);
    if (onlineSongs.length) {
      renderSongSuggestions(onlineSongs);
      return;
    }
  } catch {}

  const query = rawQuery.toLowerCase();
  const results = demoSongs.filter((song) => {
    const haystack = `${song.title} ${song.artist} ${song.query || ""}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  const list = results.length ? results : buildQuerySuggestions(rawQuery);

  renderSongSuggestions(list);

  if (!list.length) {
    $("songResults").innerHTML = "<button type=\"button\">Tulis tajuk lagu dulu</button>";
  }
}

function renderSongSuggestions(list) {
  $("songResults").innerHTML = list.map((song, index) => (
    `<button type="button" data-song-index="${index}"><strong>${escapeHtml(song.title)}</strong><span>${escapeHtml(song.artist)}${song.previewUrl ? " - preview music" : " - search result"}</span></button>`
  )).join("");
  $("songResults").dataset.songSet = JSON.stringify(list);
}

function saveLyrics() {
  const currentVideo = storage.getItem("lastMusicVideo") || "custom";
  storage.setItem(getLyricsKey(currentVideo), $("lyricsText").value);
  window.alert("Lirik sudah disimpan.");
}

function setupInteractions() {
  document.addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    const action = event.target.closest("[data-action]");
    const nav = event.target.closest("[data-nav]");
    const device = event.target.closest("[data-device]");
    const mode = event.target.closest("[data-mode]");
    const socialButton = event.target.closest("[data-open-social]");
    const logoButton = event.target.closest("[data-download-logo]");

    if (nav) {
      handleNav(nav.dataset.nav);
      return;
    }

    if (mode) {
      setMusicMode(mode.dataset.mode);
      return;
    }

    if (tab) {
      switchView(tab.dataset.tab || "main", tab);
      setNavActive("home");
      return;
    }

    if (device) {
      toggleDevice(device.dataset.device);
      return;
    }

    if (socialButton) {
      openSocialProfile(socialButton.dataset.openSocial);
      return;
    }

    if (logoButton) {
      downloadCompanyLogo(logoButton.dataset.downloadLogo);
      return;
    }

    if (!action) return;

    const type = action.dataset.action;
    if (type === "closePanel") closeNavPanel();
    if (type === "openLogin") openAuthPanel();
    if (type === "showSignupGate") showSignupGate();
    if (type === "showLoginGate") showLoginGate();
    if (type === "logoutAccount") logoutAccount();
    if (type === "shareProjectChat") shareProjectChat();
    if (type === "resetApp") resetAppData();
    if (type === "downloadApp") downloadAppNow();
    if (type === "companyDetail") openCompanyPanel();
    if (type === "priceList") openPricePanel();
    if (type === "project") openProjectPanel();
    if (type === "sales") openSalesPanel();
    if (type === "sop") openSopPanel();
    if (type === "attendance") openAttendancePanel();
    if (type === "achievement") openAchievementPanel();
    if (type === "punchIn") startPunch("in");
    if (type === "punchOut") startPunch("out");
    if (type === "captureAttendance") captureAttendancePhoto();
    if (type === "cancelAttendance") resetAttendanceForm();
    if (type === "addStaff") openStaffForm();
    if (type === "cancelStaffEdit") resetStaffForm();
    if (type === "addNewService") togglePriceBuilder();
    if (type === "cancelAddService") resetPriceForm();
    if (type === "addNewSOP") toggleSopBuilder();
    if (type === "cancelAddSOP") resetSopForm();
    if (type === "restoreDefaultPricelist") restoreDefaultPricelist();
  });

  $("bookingPackageList").addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle-booking-service]");
    if (!toggle) return;
    toggleBookingService(toggle.dataset.toggleBookingService);
  });

  $("priceList").addEventListener("click", (event) => {
    const bookButton = event.target.closest("[data-book-service]");
    if (bookButton) {
      openBookingPanel(Number(bookButton.dataset.bookService));
      return;
    }

    const downloadButton = event.target.closest("[data-download-service-image]");
    if (downloadButton) {
      downloadServiceImage(Number(downloadButton.dataset.downloadServiceImage));
      return;
    }

    const packageCard = event.target.closest("[data-package-card]");
    if (packageCard) {
      handlePackageClick(packageCard);
      return;
    }

    const button = event.target.closest("[data-delete-price]");
    if (!button) return;
    deletePriceItem(Number(button.dataset.deletePrice));
  });

  $("priceList").addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-download-service-image]")) return;
    const packageCard = event.target.closest("[data-package-card]");
    if (packageCard) startPackageHold(packageCard);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    $("priceList").addEventListener(eventName, stopPackageHold);
  });

  $("salesList").addEventListener("click", (event) => {
    const printButton = event.target.closest("[data-print-sale]");
    if (!printButton) return;
    printSaleQuotation(printButton.dataset.printSale);
  });

  $("sopList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-sop]");
    if (button) {
      deleteSop(button.dataset.deleteSop);
      return;
    }
    const toggle = event.target.closest("[data-toggle-sop]");
    if (!toggle) return;
    toggle.closest("[data-sop-card]")?.classList.toggle("open");
  });

  $("achievementList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-achievement]");
    if (!button) return;
    deleteAchievement(button.dataset.deleteAchievement);
  });

  $("projectList").addEventListener("click", (event) => {
    const chatButton = event.target.closest("[data-open-project-chat]");
    if (!chatButton) return;
    openProjectChat(chatButton.dataset.openProjectChat);
  });

  $("projectList").addEventListener("change", (event) => {
    const status = event.target.closest("[data-project-status]");
    if (!status) return;
    updateProjectStatus(status.dataset.projectStatus, status.value);
  });

  document.querySelectorAll("[data-project-tab]").forEach((button) => {
    button.addEventListener("click", () => switchProjectTab(button.dataset.projectTab));
  });

  $("taskForm").addEventListener("submit", saveTask);

  $("taskList").addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-task-status]");
    if (!checkbox) return;
    updateTaskStatus(checkbox.dataset.taskStatus, checkbox.checked);
  });

  $("taskList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-task]");
    if (!button) return;
    deleteTask(button.dataset.deleteTask);
  });

  $("adminTaskList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-task]");
    if (!button) return;
    deleteTask(button.dataset.deleteTask);
  });

  document.querySelectorAll("[data-attendance-tab]").forEach((button) => {
    button.addEventListener("click", () => switchAttendanceTab(button.dataset.attendanceTab));
  });

  $("staffForm").addEventListener("submit", saveStaffProfile);

  $("staffPhoto").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      staffPhotoData = await compressStaffPhoto(file);
    } catch (error) {
      staffPhotoData = "";
      event.target.value = "";
      window.alert(error.message || "Sila pilih gambar JPEG atau PNG sahaja.");
    }
  });

  $("firstAccessPhoto")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      firstAccessPhotoData = await compressStaffPhoto(file);
    } catch (error) {
      firstAccessPhotoData = "";
      event.target.value = "";
      window.alert(error.message || "Sila pilih gambar JPEG atau PNG sahaja.");
    }
  });

  $("firstAccessForm")?.addEventListener("submit", registerFirstAccess);

  $("pendingStaffList")?.addEventListener("click", (event) => {
    const approveButton = event.target.closest("[data-approve-staff]");
    const rejectButton = event.target.closest("[data-reject-staff]");
    if (approveButton) approveStaffApplication(approveButton.dataset.approveStaff);
    if (rejectButton) rejectStaffApplication(rejectButton.dataset.rejectStaff);
  });

  $("staffList").addEventListener("click", (event) => {
    const statButton = event.target.closest("[data-staff-stat]");
    const editButton = event.target.closest("[data-edit-staff]");
    const deleteButton = event.target.closest("[data-delete-staff]");
    if (statButton) openStaffStatistic(statButton.dataset.staffStat);
    if (editButton) editStaffProfile(editButton.dataset.editStaff);
    if (deleteButton) deleteStaffProfile(deleteButton.dataset.deleteStaff);
  });

  $("settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveSettingsForm();
  });

  $("profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfileForm();
  });

  $("authForm").addEventListener("submit", loginAccount);
  $("authGateLoginForm")?.addEventListener("submit", loginAccount);

  $("companyForm").addEventListener("submit", saveCompany);

  $("companyForm").addEventListener("click", (event) => copyCompanyField(event.target));

  $("priceForm").addEventListener("submit", addPriceItem);

  $("bookingForm").addEventListener("submit", saveBooking);

  $("projectChatForm").addEventListener("submit", saveProjectChat);
  $("clientChatNameForm")?.addEventListener("submit", saveClientChatName);

  $("sopForm").addEventListener("submit", saveSop);

  $("achievementForm").addEventListener("submit", saveAchievement);

  $("attendanceForm").addEventListener("submit", saveAttendance);

  $("packageCount").addEventListener("change", () => renderPricePackageInputs());

  $("profilePhotoFile")?.addEventListener("change", (event) => {
    saveProfilePhoto(event.target.files?.[0]);
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPromptEvent = event;
});

setDate();
setMainGreeting();
setMainQuote();
seedDefaultPricelist();
renderSaleSummary();
applyProfile();
loadSettingsForm();
loadProfileForm();
applyRoleAccess();
window.setInterval(updateAttendanceClocks, 30 * 1000);
setupInteractions();
activateTab("lubuk");
openSharedProjectChat();
initialiseCloudSync().then(() => {
  applyRoleAccess();
  refreshSyncedViews();
});
$("refreshWeather")?.addEventListener("click", () => renderSaleSummary());

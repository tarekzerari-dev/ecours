const XLSX = require('xlsx');

// 1. Create a new workbook
const wb = XLSX.utils.book_new();

// 2. Onglet 1 - Informations
const infoData = [
  ["Modèle de budget - Informations"],
  [""],
  ["Nom du projet:", "eCours"],
  ["Porteur du projet:", "Tarek Zerari"],
  ["Établissement universitaire:", "Ecole nationale Superieure d'Informatique (ESI)"],
  ["Type de projet:", "Plateforme SaaS (Niveau 1 - 1,000,000 DZD)"]
];
const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
XLSX.utils.book_append_sheet(wb, wsInfo, "Onglet 1 - Informations");

// 3. Onglet 2 - Bilingual Budget (Contains all data from HTML)
const bilingualData = [
  ["النسخة العربية (Arabic Version)"],
  ["N°", "عائلة الشراء", "التسمية الدقيقة", "التبرير التقني", "الكمية", "سعر الوحدة", "المجموع (دج)"],
  ["3.09", "الخدمات السحابية", "إشتراك سنوي بخادم VPS وقاعدة بيانات", "استضافة المنصة ومزامنة الحضور والغياب.", 1, 100000, 100000],
  ["3.09", "الخدمات السحابية", "باقة رسائل نصية (SMS Gateway)", "اختبار إشعارات الأولياء عند الدخول.", 1, 60000, 60000],
  ["3.09", "الخدمات السحابية", "نطاق رسمي وشهادة SSL", "نطاق رسمي وتشفير آمن للمنصة.", 1, 15000, 15000],
  ["3.04", "معدات النموذج", "أجهزة لوحية مخصصة بنظام Kiosk", "بوابات مسح QR حصرية في المداخل.", 5, 65000, 325000],
  ["3.04", "معدات النموذج", "حوامل أمان حائطية للأجهزة اللوحية", "تثبيت وحماية الأجهزة في المداخل.", 5, 10000, 50000],
  ["3.04", "معدات النموذج", "طابعات بطاقات بلاستيكية (PVC Thermal)", "توزيعها على عدة مراكز لاختبار ضغط العمل.", 5, 50000, 250000],
  ["3.04", "معدات النموذج", "حزمة بطاقات PVC خام (1000 بطاقة)", "مادة أولية لاختبار القراءة الآلية.", 1, 35000, 35000],
  ["3.05", "تطوير البرمجيات", "تراخيص مطوري تطبيقات الهواتف", "نشر التطبيق للمختبرين الداخليين.", 1, 30000, 30000],
  ["3.05", "تطوير البرمجيات", "ترخيص مكتبة واجهات (UI/UX)", "مكونات جاهزة لتسريع بناء الواجهات.", 1, 45000, 45000],
  ["3.05", "تطوير البرمجيات", "اشتراكات الذكاء الاصطناعي (AI Agents)", "تسريع كتابة الأكواد وتصحيح الأخطاء.", 1, 40000, 40000],
  ["3.12", "الملكية الفكرية", "براءة الاختراع والعلامة التجارية (INAPI)", "حماية الكود والعلامة التجارية.", 1, 40000, 40000],
  ["", "", "", "المجموع الكلي", "", "", 990000],
  [""],
  [""],
  ["English Version"],
  ["N°", "Famille", "Désignation précise", "Justification technique", "Qté", "P.U. DA", "Total DA"],
  ["3.09", "Cloud Services", "VPS & Cloud Database", "Platform hosting and real-time sync.", 1, 100000, 100000],
  ["3.09", "Cloud Services", "SMS Gateway", "Testing instant parent notifications.", 1, 60000, 60000],
  ["3.09", "Cloud Services", "Domain Name & SSL", "Official domain and secure encryption.", 1, 15000, 15000],
  ["3.04", "Prototype Equip", "Tablets (Kiosk Mode)", "Exclusive QR scanning gates.", 5, 65000, 325000],
  ["3.04", "Prototype Equip", "Tablet Wall Mounts", "Securing tablets at entrances.", 5, 10000, 50000],
  ["3.04", "Prototype Equip", "PVC Thermal Printers", "Evaluate workload across test centers.", 5, 50000, 250000],
  ["3.04", "Prototype Equip", "Blank PVC Cards (1000 pcs)", "Raw material to test barcode reading.", 1, 35000, 35000],
  ["3.05", "Software Dev", "Mobile Dev Licenses", "Publishing app for internal testers.", 1, 30000, 30000],
  ["3.05", "Software Dev", "UI/UX Library License", "Accelerate UI development.", 1, 45000, 45000],
  ["3.05", "Software Dev", "AI Coding Agents", "Accelerate complex coding.", 1, 40000, 40000],
  ["3.12", "Intellectual Prop", "Trademark & Patent (INAPI)", "Protecting source code & brand.", 1, 40000, 40000],
  ["", "", "", "Total Amount", "", "", 990000]
];
const wsBilingual = XLSX.utils.aoa_to_sheet(bilingualData);

const wscolsBilingual = [
  {wch: 8},   // N°
  {wch: 25},  // Famille
  {wch: 45},  // Désignation précise
  {wch: 55},  // Justification technique
  {wch: 6},   // Qté
  {wch: 15},  // P.U. DA
  {wch: 15}   // Total DA
];
wsBilingual['!cols'] = wscolsBilingual;
XLSX.utils.book_append_sheet(wb, wsBilingual, "Onglet 2 - Bilingual Budget");

// 4. Onglet 3 - Récapitulatif
const recapData = [
  ["Récapitulatif Financier"],
  [""],
  ["Rubrique", "Montant (DZD)"],
  ["Total Budget Demandé", 990000],
  ["Plafond Autorisé", 1000000],
  ["Reste", 10000]
];
const wsRecap = XLSX.utils.aoa_to_sheet(recapData);
XLSX.utils.book_append_sheet(wb, wsRecap, "Onglet 3 - Récapitulatif");

// 5. Write the file
XLSX.writeFile(wb, "../Modele_de_budget_eCours.xlsx");
console.log("Excel file Modele_de_budget_eCours.xlsx generated successfully with NO duplicate pages.");

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  mr: {
    // Navigation & Sidebar
    'Dashboard': 'डॅशबोर्ड',
    'Employees': 'कर्मचारी',
    'Attendance': 'उपस्थिती',
    'Leave Requests': 'रजा अर्ज',
    'My Leave': 'माझी रजा',
    'Payroll': 'पेरोल व वेतन',
    'Payslips': 'पगार स्लिप',
    'Departments': 'विभाग',
    'Holidays': 'सुट्ट्या',
    'Announcements': 'सूचना व घोषणा',
    'Recruitment': 'भरती प्रक्रिया',
    'Feedback': 'प्रतिक्रिया',
    'Reports & Analytics': 'अहवाल आणि विश्लेषण',
    'Settings': 'सेटिंग्ज',
    'Directory': 'डायरेक्टरी',
    'Employee Directory': 'कर्मचारी डायरेक्टरी',
    'My Profile': 'माझे प्रोफाइल',

    // Dashboard & Today's Attendance Panel
    "Today's Attendance": 'आजची उपस्थिती',
    "A quick overview of today's workforce attendance.": 'आजच्या कर्मचाऱ्यांच्या उपस्थितीचा संक्षिप्त आढावा.',
    'Attendance Rate': 'उपस्थिती दर',
    'Real-time Overview': 'रिअल-टाईम आढावा',
    'Total Employees': 'एकूण कर्मचारी',
    'Present Today': 'आज उपस्थित',
    'Absent Today': 'आज अनुपस्थित',
    'On Leave': 'रजेवर',
    'Pending Leaves': 'प्रलंबित रजा',
    'Pending Regularization': 'प्रलंबित नियमितीकरण',
    'Monthly Attendance Trend': 'मासिक उपस्थिती कल',
    'Department Distribution': 'विभागनिहाय वितरण',
    'Recent Employees': 'नवीन जोडलेले कर्मचारी',
    'Upcoming Holidays': 'येणाऱ्या सुट्ट्या',
    'Quick Actions': 'जलद कृती',

    // Directory Page
    'Connect and view colleague profiles, designations, and work contacts across the company.': 'संस्थेतील सर्व सहकाऱ्यांचे प्रोफाइल, हुद्दा आणि संपर्क माहिती पहा.',
    'Search colleagues by name, department...': 'नाव किंवा विभागाने सहकारी शोधा...',
    'Loading company directory...': 'कंपनी डायरेक्टरी लोड होत आहे...',
    'No Colleagues Found': 'कोणताही सहकारी आढळला नाही',
    'No employee profiles match your search criteria.': 'तुमच्या शोधानुसार कोणतेही प्रोफाइल सापडले नाही.',
    'Human Resources': 'मानव संसाधन (HR)',
    'Finance': 'वित्त विभाग (Finance)',
    'Marketing': 'मार्केटिंग',
    'Engineering': 'इंजिनिअरिंग',
    'Sales': 'विक्री विभाग (Sales)',
    'Operations': 'ऑपरेशन्स',

    // Attendance & Time Logging
    'My Attendance': 'माझी उपस्थिती',
    'Track your workday status, active hours, and attendance log.': 'तुमच्या कामाचे तास आणि उपस्थिती नोंद तपासा.',
    'Check In': 'चेक इन करा',
    'Check Out': 'चेक आउट करा',
    'Ready to start your day?': 'कामाची सुरुवात करण्यास तयार आहात?',
    "You're checked in": 'तुम्ही चेक इन केले आहे',
    'Great job today!': 'आजचे काम पूर्ण झाले!',
    'WORKING HOURS': 'कामाचे तास',
    'STATUS': 'स्थिती',
    'Attendance History': 'उपस्थिती इतिहास',
    'CHECK IN': 'चेक इन',
    'CHECK OUT': 'चेक OUT',
    'Request Regularization': 'नियमितीकरणासाठी अर्ज करा',

    // Leave & Payroll
    'Apply for Leave': 'रजेसाठी अर्ज करा',
    'Paid Leave': 'पगारी रजा',
    'Sick Leave': 'वैद्यकीय रजा',
    'Casual Leave': 'किरकोळ रजा',
    'Net Salary': 'निव्वळ वेतन',
    'Basic Pay': 'मूळ वेतन',
    'Allowances': 'भत्ते',
    'Deductions': 'कपात',

    // Common Buttons & Status Badges
    'Refresh': 'ताजे करा',
    'Save': 'जतन करा',
    'Cancel': 'रद्द करा',
    'Submit': 'सादर करा',
    'Add Employee': 'नवीन कर्मचारी जोडा',
    'Add Holiday': 'सुट्टी जोडा',
    'Export CSV': 'CSV निर्यात करा',
    'Present': 'उपस्थित',
    'Absent': 'अनुपस्थित',
    'Late': 'उशीर',
    'Half Day': 'अर्धा दिवस',
    'Approved': 'मंजूर',
    'Rejected': 'अस्वीकृत',
    'Pending': 'प्रलंबित',
    'Active': 'सक्रिय',
    'Inactive': 'निष्क्रिय',
  },

  hi: {
    // Navigation & Sidebar
    'Dashboard': 'डैशबोर्ड',
    'Employees': 'कर्मचारी',
    'Attendance': 'उपस्थिति',
    'Leave Requests': 'छुट्टी के आवेदन',
    'My Leave': 'मेरी छुट्टी',
    'Payroll': 'पेरोल एवं वेतन',
    'Payslips': 'वेतन पर्ची',
    'Departments': 'विभाग',
    'Holidays': 'अवकाश',
    'Announcements': 'घोषणाएं',
    'Recruitment': 'भर्ती प्रक्रिया',
    'Feedback': 'प्रतिक्रिया',
    'Reports & Analytics': 'रिपोर्ट और विश्लेषण',
    'Settings': 'सेटिंग्स',
    'Directory': 'निर्देशिका',
    'Employee Directory': 'कर्मचारी निर्देशिका',
    'My Profile': 'मेरी प्रोफाइल',

    // Dashboard & Today's Attendance Panel
    "Today's Attendance": 'आज की उपस्थिति',
    "A quick overview of today's workforce attendance.": 'आज के कर्मचारियों की उपस्थिति का संक्षिप्त अवलोकन।',
    'Attendance Rate': 'उपस्थिति दर',
    'Real-time Overview': 'वास्तविक समय विवरण',
    'Total Employees': 'कुल कर्मचारी',
    'Present Today': 'आज उपस्थित',
    'Absent Today': 'आज अनुपस्थित',
    'On Leave': 'छुट्टी पर',
    'Pending Leaves': 'लंबित छुट्टियां',
    'Pending Regularization': 'लंबित नियमितीकरण',
    'Monthly Attendance Trend': 'मासिक उपस्थिति रुझान',
    'Department Distribution': 'विभाग वितरण',
    'Recent Employees': 'हाल ही के कर्मचारी',
    'Upcoming Holidays': 'आगामी अवकाश',
    'Quick Actions': 'त्वरित कार्रवाई',

    // Directory Page
    'Connect and view colleague profiles, designations, and work contacts across the company.': 'कंपनी में अपने सहकर्मियों के प्रोफाइल, पद और संपर्क विवरण देखें।',
    'Search colleagues by name, department...': 'नाम या विभाग से सहकर्मी खोजें...',
    'Loading company directory...': 'कंपनी निर्देशिका लोड हो रही है...',
    'No Colleagues Found': 'कोई सहकर्मी नहीं मिला',
    'No employee profiles match your search criteria.': 'आपकी खोज के अनुसार कोई प्रोफाइल नहीं मिला।',
    'Human Resources': 'मानव संसाधन (HR)',
    'Finance': 'वित्त विभाग (Finance)',
    'Marketing': 'मार्केटिंग',
    'Engineering': 'इंजीनियरिंग',
    'Sales': 'बिक्री विभाग (Sales)',
    'Operations': 'ऑपरेशंस',

    // Attendance & Time Logging
    'My Attendance': 'मेरी उपस्थिति',
    'Track your workday status, active hours, and attendance log.': 'अपने कार्यदिवस की स्थिति, सक्रिय घंटे और उपस्थिति लॉग ट्रैक करें।',
    'Check In': 'चेक इन करें',
    'Check Out': 'चेक आउट करें',
    'Ready to start your day?': 'क्या आप अपने दिन की शुरुआत करने के लिए तैयार हैं?',
    "You're checked in": 'आप चेक इन हो चुके हैं',
    'Great job today!': 'आज का काम पूरा हुआ!',
    'WORKING HOURS': 'कार्य के घंटे',
    'STATUS': 'स्थिति',
    'Attendance History': 'उपस्थिति इतिहास',
    'CHECK IN': 'चेक इन',
    'CHECK OUT': 'चेक आउट',
    'Request Regularization': 'नियमितीकरण का अनुरोध करें',

    // Leave & Payroll
    'Apply for Leave': 'छुट्टी के लिए आवेदन करें',
    'Paid Leave': 'वैतनिक अवकाश',
    'Sick Leave': 'चिकित्सा अवकाश',
    'Casual Leave': 'आकस्मिक अवकाश',
    'Net Salary': 'शुद्ध वेतन',
    'Basic Pay': 'मूल वेतन',
    'Allowances': 'भत्ते',
    'Deductions': 'कटौती',

    // Common Buttons & Status Badges
    'Refresh': 'रिफ्रेश करें',
    'Save': 'सहेजें',
    'Cancel': 'रद्द करें',
    'Submit': 'जमा करें',
    'Add Employee': 'नया कर्मचारी जोड़ें',
    'Add Holiday': 'अवकाश जोड़ें',
    'Export CSV': 'CSV निर्यात करें',
    'Present': 'उपस्थित',
    'Absent': 'अनुपस्थित',
    'Late': 'विलंब',
    'Half Day': 'आधा दिन',
    'Approved': 'स्वीकृत',
    'Rejected': 'अस्वीकृत',
    'Pending': 'लंबित',
    'Active': 'सक्रिय',
    'Inactive': 'निष्क्रिय',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('kaaryasetu_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('kaaryasetu_lang', lang);
  }, [lang]);

  const toggleLang = (selectedLang) => {
    setLang(selectedLang);
  };

  const t = (key, defaultText) => {
    if (lang === 'mr' && translations.mr?.[key]) {
      return translations.mr[key];
    }
    if (lang === 'hi' && translations.hi?.[key]) {
      return translations.hi[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

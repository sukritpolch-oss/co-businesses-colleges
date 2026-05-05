import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Plus, Trash2, FileText, Download, Calculator,
  ClipboardCheck, Building2, GraduationCap, User,
  ChevronRight, ChevronDown, CheckCircle2, AlertCircle,
  Clock, LayoutDashboard, FileSpreadsheet, Settings,
  Upload, Image as ImageIcon, Loader2, X, FileDown,
  Wand2, HardHat, Briefcase, FileSearch, Printer, BookOpen,
  RefreshCw, RotateCcw, ArrowRightCircle, ListChecks, CheckSquare, Sparkles, Calendar,
  Lock, Code, LogOut, Key, Mail, MapPin, BadgeCheck, Users, ShieldCheck, Star, Save,
  Cloud, Search, Filter, UploadCloud, DownloadCloud, MessageSquare, Unlock, ShieldAlert, Edit
} from 'lucide-react';

const apiKey = "";

// =====================================================================
// URLs & Security Keys
// =====================================================================
// API สำหรับฐานข้อมูลผู้ใช้งานหลัก
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxM8w9MX09g51WybbYzRu8DZH--D0SQ0G2nGz7OmF38HqHsKz_mX3EUK9OejI7JEUvU/exec";
// API สำหรับคลังแผนฝึกส่วนกลาง (Cloud Hub) & ประเมินระบบ
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwMZBGSWinbV8P8KCsxQXGw-v6AiPnaHW2fawUyNUu3m7bCNF6in6S7pPmNJY4gZ2uWFg/exec";

const ADMIN_EMAIL = "Sukritpol.ch@gmail.com";
const ADMIN_PASSWORD = "@Sukritpol2528";
const FILE_SECRET_KEY = "@Sukritpol2528";

const BEHAVIOR_OPTIONS = [
  'ความซื่อสัตย์', 'ระเบียบวินัยและตรงต่อเวลา', 'ความรับผิดชอบ', 'ใฝ่เรียนรู้',
  'ขยันและอดทน', 'ประหยัด', 'ความปลอดภัย', 'ความคิดสร้างสรรค์', 'ทำงานเป็นทีม', 'จิตสาธารณะ'
];

const PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
  "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา",
  "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
  "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์",
  "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี",
  "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม",
  "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย",
  "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
];

const App = () => {
  // --- ระบบ Login & Security ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loginMode, setLoginMode] = useState('login');
  const [loginError, setLoginError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('ครู');

  // --- ข้อมูลฟอร์ม Login/Register ---
  const [authData, setAuthData] = useState({
    email: '', password: '', firstName: '', lastName: '', department: '', college: '', companyName: '', province: '', role: 'ครู', hasTrained: false
  });
  const [dbUsers, setDbUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0 });

  // --- ระบบ Dev Unlock Modal & Security Alert ---
  const [showDevUnlock, setShowDevUnlock] = useState(false);
  const [devUnlockPassword, setDevUnlockPassword] = useState('');
  const [devUnlockError, setDevUnlockError] = useState(false);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [securityCountdown, setSecurityCountdown] = useState(3);
  const [securityDevCode, setSecurityDevCode] = useState('');
  const securityTimerRef = useRef(null);
  const violationCountRef = useRef(0);

  // --- UI & UI Layouts ---
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyRating, setSurveyRating] = useState(0);
  const [surveyFeedback, setSurveyFeedback] = useState('');
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [statusMessage, setStatusMessage] = useState(null);

  // --- File Upload & Modal Refs ---
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(null);
  const fileInputRef = useRef(null);
  const evalFileInputRef = useRef(null);
  const jobCompanyInputRef = useRef(null);
  const [pendingDveData, setPendingDveData] = useState(null);
  const [showDveConflictModal, setShowDveConflictModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // --- Cloud & Feedback States ---
  const [cloudData, setCloudData] = useState([]);
  const [filterProvince, setFilterProvince] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCloudId, setEditingCloudId] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [systemFeedback, setSystemFeedback] = useState({ ux: 5, ai: 5, speed: 5, reports: 5, overall: 5, suggestion: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // --- Work data states ---
  const [activeEvalView, setActiveEvalView] = useState('eval_workplace');
  const [activeReportView, setActiveReportView] = useState('dve0405');
  const [evalFormType, setEvalFormType] = useState('5');
  const [selectedBehaviors, setSelectedBehaviors] = useState([...BEHAVIOR_OPTIONS]);
  const [collapsedWorkplaceTasks, setCollapsedWorkplaceTasks] = useState(new Set());
  const [collapsedWorkplaceSubTasks, setCollapsedWorkplaceSubTasks] = useState(new Set());
  const [isAnalyzingSubject, setIsAnalyzingSubject] = useState(false);
  const [isRemapping, setIsRemapping] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(null);

  const [config, setConfig] = useState({
    aiProvider: 'gemini', userApiKey: '', openaiApiKey: '', claudeApiKey: '', deepseekApiKey: '',
    collegeName: '', companyName: '', level: 'ปวช. และ ปวส.', fieldOfStudy: '', group: '', major: '',
    academicYear: '๒๕๖๙', startDate: '', endDate: '', hoursPerDay: 8, daysPerWeek: 5, weeks: 18,
    trainerName: '', trainerPosition: '', occupation: '', department: '', province: ''
  });

  const getSubjectId = (index) => {
    if (index < 26) return String.fromCharCode(65 + index);
    return 'A' + String.fromCharCode(65 + (index - 26));
  };

  const [subjects, setSubjects] = useState(Array.from({ length: 30 }, (_, i) => ({
    id: getSubjectId(i), code: '', name: '', credits: '', standards: '', learningOutcomes: '', objectives: '', competencies: '', description: '', mainTasks: [], isAnalyzed: false, previewUrl: null, uploadedFile: null
  })));
  const subjectsRef = useRef(subjects);
  useEffect(() => { subjectsRef.current = subjects; }, [subjects]);

  const [workplaceMainTasks, setWorkplaceMainTasks] = useState([
    { id: Date.now(), name: '', isAnalyzing: false, isConfirmed: false, subTasks: [] }
  ]);

  const cleanTaskName = (name) => {
    if (!name) return '';
    let cleaned = name.replace(/ศึกษา|เรียนรู้|ทฤษฎี/g, '').trim();
    if (cleaned.startsWith('การ')) cleaned = cleaned.substring(3).trim();
    return cleaned;
  };

  const extractValidTaskIds = (text) => {
    if (!text) return '';
    const matches = String(text).match(/[A-Za-z]{1,2}\d{1,2}(?:-\d{1,2})?/g);
    if (matches) return [...new Set(matches)].slice(0, 4).join(', ');
    return '';
  };

  const handleBehaviorToggle = (behavior) => {
    setSelectedBehaviors(prev => prev.includes(behavior) ? prev.filter(b => b !== behavior) : [...prev, behavior]);
  };

  const showStatus = useCallback((msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  // --- Authentication ---
  const fetchDatabaseData = async () => {
    if (!GOOGLE_SCRIPT_URL) return setIsLoadingData(false);
    setIsLoadingData(true);
    try {
      const resUsers = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUsers&nocache=${Date.now()}`);
      if (resUsers.ok) {
        const data = await resUsers.json();
        if (data.users) setDbUsers(data.users);
        const resStats = await fetch(`${GOOGLE_SCRIPT_URL}?action=getStats&nocache=${Date.now()}`);
        if (resStats.ok) {
          const statsData = await resStats.json();
          setStats({ total: statsData.totalVisits || 0, today: statsData.todayVisits || 0 });
        }
      } else {
        setLoginError("เชื่อมต่อฐานข้อมูลไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      setLoginError("🔴 Failed to fetch: กรุณาตรวจสอบ URL");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => { fetchDatabaseData(); }, []);

  const handleAuthChange = (field, value) => {
    setAuthData(prev => ({ ...prev, [field]: value }));
    setLoginError('');
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (!authData.email || !authData.password || !authData.firstName || !authData.lastName) return setLoginError('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
    if (authData.hasTrained === null || authData.hasTrained === undefined) return setLoginError('กรุณาตอบคำถามว่าท่านผ่านการอบรมแล้วหรือไม่');

    const userExists = dbUsers.find(u => String(u.email || '').trim().toLowerCase() === String(authData.email).trim().toLowerCase());
    if (userExists) return setLoginError('อีเมลนี้ถูกลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ');

    const userData = {
      action: 'register',
      email: authData.email,
      password: authData.password,
      firstName: authData.firstName,
      lastName: authData.lastName,
      department: authData.department,
      college: authData.college,
      companyName: authData.companyName,
      province: authData.province,
      role: authData.role,
      hasTrained: authData.hasTrained ? 'ใช่' : 'ไม่ใช่',
      status: 'pending',
      registeredAt: new Date().toISOString()
    };

    try {
      setDbUsers(prev => [...prev, userData]);
      fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(userData) }).catch(e => console.error(e));
      showStatus('ลงทะเบียนสำเร็จ! โปรดรอผู้พัฒนาระบบอนุมัติสิทธิ์การใช้งาน');
      setLoginMode('login');
      setLoginError('');
    } catch (err) {
      setLoginError('เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    // ส่วนที่แก้ให้แอดมินได้ Role ที่ถูกต้อง และแสดงแท็บครบถ้วน
    if (authData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && authData.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setIsDeveloper(true);
      setLoginError('');
      setCurrentUserEmail(authData.email);
      setCurrentUserRole('admin'); // กำหนดให้ Role เป็น admin เพื่อไม่ให้โดนมองว่าเป็นครูฝึก

      setConfig(prev => ({
        ...prev,
        trainerName: 'Admin Sukritpol'
      }));

      setShowWelcomeModal(true);
      return showStatus('ยินดีต้อนรับเข้าสู่ระบบผู้ดูแล (Admin Panel)');
    }

    if (isLoadingData) return setLoginError('ระบบกำลังโหลดฐานข้อมูล กรุณารอสักครู่...');

    const inputEmail = String(authData.email || '').trim().toLowerCase();
    const inputPassword = String(authData.password || '').trim();
    const userByEmail = dbUsers.find(u => String(u.email || '').trim().toLowerCase() === inputEmail);

    if (!userByEmail) return setLoginError(`ไม่พบอีเมลนี้ในระบบ โปรดตรวจสอบให้ถูกต้อง`);
    if (String(userByEmail.password || '').trim() !== inputPassword) return setLoginError('รหัสผ่านไม่ถูกต้อง โปรดตรวจสอบตัวพิมพ์เล็ก-ใหญ่');

    const userStatus = String(userByEmail.status || '').trim().toLowerCase();
    if (userStatus === 'hacker') return setLoginError(`บัญชีของท่านถูกระงับการใช้งาน โปรดติดต่อผู้ดูแลระบบ`);

    const isApproved = userStatus === 'approved';
    if (!isApproved) return setLoginError(`บัญชีของคุณสถานะคือ "${userByEmail.status || 'รออนุมัติ'}" โปรดรอแอดมินอนุมัติ`);

    setIsAuthenticated(true);
    setIsDeveloper(false);
    setLoginError('');
    setCurrentUserEmail(userByEmail.email);
    setCurrentUserRole(userByEmail.role || 'ครู');

    // ดึงข้อมูลจากฐานข้อมูลมาใส่ใน Config ทันที
    setConfig(prev => ({
      ...prev,
      collegeName: userByEmail.college || '',
      companyName: userByEmail.companyName || '',
      province: userByEmail.province || '',
      trainerName: `${userByEmail.firstName || ''} ${userByEmail.lastName || ''}`.trim(),
      department: userByEmail.department || prev.department
    }));

    setShowWelcomeModal(true);
    showStatus(`ยินดีต้อนรับคุณ ${userByEmail.firstName}`);

    if (GOOGLE_SCRIPT_URL) {
      const todayStr = new Date().toISOString().split('T')[0];
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'log_visit', email: userByEmail.email, date: todayStr, time: new Date().toISOString() })
      }).catch(e => console.error(e));
    }
  };

  const submitForgotPassword = async (e) => {
    e.preventDefault();
    if (!authData.email) return setLoginError('กรุณากรอกอีเมลที่ใช้ลงทะเบียน');
    setIsLoadingData(true); setLoginError('');
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'forgot_password', email: authData.email })
      });
      const result = await response.json();
      if (result.status === 'success') {
        showStatus('ส่งรหัสผ่านไปยังอีเมลเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมาย (รวมถึง Junk/Spam)');
        setLoginMode('login');
      } else {
        setLoginError(result.message || 'ไม่พบอีเมลนี้ในระบบ');
      }
    } catch (err) {
      setLoginError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setIsLoadingData(false);
    }
  };

  const initiateLogout = () => setShowSurveyModal(true);

  const finalizeLogoutAndSubmitSurvey = async () => {
    setIsSubmittingSurvey(true);
    if (GOOGLE_SCRIPT_URL && (surveyRating > 0 || surveyFeedback)) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'submit_survey', email: currentUserEmail || 'unknown', rating: surveyRating, feedback: surveyFeedback, timestamp: new Date().toISOString() })
        });
      } catch (e) { console.error(e); }
    }
    resetAuthAndLogout();
  };

  const skipSurveyAndLogout = () => resetAuthAndLogout();

  const resetAuthAndLogout = () => {
    setIsSubmittingSurvey(false); setShowSurveyModal(false); setSurveyRating(0); setSurveyFeedback('');
    setIsAuthenticated(false); setIsDeveloper(false); setCurrentUserEmail(''); setCurrentUserRole('ครู');
    setAuthData(prev => ({ ...prev, password: '' }));
    showStatus('ออกจากระบบเรียบร้อยแล้ว');
  };

  // --- Security Options (High Protection) ---
  useEffect(() => {
    if (isAuthenticated && !isDeveloper && currentUserEmail) {
      const handleViolation = () => {
        violationCountRef.current += 1;
        if (violationCountRef.current >= 2) {
          fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'delete_user', email: currentUserEmail }) }).catch(() => { });
          resetAuthAndLogout(); return;
        }
        setShowSecurityAlert(true); setSecurityCountdown(3); setSecurityDevCode('');
        let count = 3;
        if (securityTimerRef.current) clearInterval(securityTimerRef.current);
        securityTimerRef.current = setInterval(() => {
          count -= 1; setSecurityCountdown(count);
          if (count <= 0) {
            clearInterval(securityTimerRef.current); setShowSecurityAlert(false); resetAuthAndLogout(); violationCountRef.current = 0;
          }
        }, 1000);
      };

      let devToolsActive = false;
      const startDelay = setTimeout(() => { devToolsActive = true; }, 3000);

      const checkDevTools = setInterval(() => {
        if (!devToolsActive) return;
        const startTime = performance.now(); debugger; const endTime = performance.now();
        if (endTime - startTime > 100) handleViolation();
      }, 1000);

      const preventKeys = (e) => {
        if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || (e.ctrlKey && e.keyCode === 85)) {
          e.preventDefault(); handleViolation(); return false;
        }
      };
      document.addEventListener('keydown', preventKeys);

      return () => {
        clearTimeout(startDelay); clearInterval(checkDevTools); document.removeEventListener('keydown', preventKeys);
        if (securityTimerRef.current) clearInterval(securityTimerRef.current);
      };
    }
  }, [isAuthenticated, isDeveloper, currentUserEmail]);

  // --- Cloud & Sync Logic ---
  const fetchCloudData = async () => {
    try {
      const response = await fetch(GAS_WEB_APP_URL);
      const data = await response.json();
      data.sort((a, b) => new Date(b.createdAtStr) - new Date(a.createdAtStr));
      setCloudData(data);
    } catch (err) {
      console.error("Fetch cloud data error:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'cloud' && isAuthenticated) {
      fetchCloudData();
    }
  }, [activeTab, isAuthenticated]);

  const encryptPayload = (text) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ FILE_SECRET_KEY.charCodeAt(i % FILE_SECRET_KEY.length));
    }
    return btoa(unescape(encodeURIComponent(result)));
  };

  const decryptPayload = (encodedText) => {
    let decoded = decodeURIComponent(escape(atob(encodedText)));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ FILE_SECRET_KEY.charCodeAt(i % FILE_SECRET_KEY.length));
    }
    return result;
  };

  const generateFileName = (conf) => {
    let filenameParts = [];
    if (conf.occupation && conf.occupation.trim() !== '') filenameParts.push(conf.occupation.trim());
    else if (conf.companyName && conf.companyName.trim() !== '') filenameParts.push(conf.companyName.trim());

    let baseName = `Workplace_${new Date().getTime()}`;
    if (filenameParts.length > 0) baseName = filenameParts.join('_').replace(/[/\\?%*:|"<>]/g, '-');
    return `ทวิภาคี_${baseName}.dvedata`;
  };

  const saveDataLocally = () => {
    showStatus('กำลังบันทึกข้อมูลลงเครื่อง...');
    try {
      const safeConfig = { ...config, userApiKey: '', openaiApiKey: '', claudeApiKey: '', deepseekApiKey: '' };
      const cleanedSubjects = subjects.map(s => { const { uploadedFile, previewUrl, ...rest } = s; return rest; });

      const payload = JSON.stringify({ config: safeConfig, subjects: cleanedSubjects, workplaceMainTasks, selectedBehaviors });
      const encryptedData = encryptPayload(payload);
      const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none'; link.href = url; link.download = generateFileName(config);
      document.body.appendChild(link); link.click();
      setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 100);
      showStatus('บันทึกข้อมูลลงเครื่องสำเร็จ!');
    } catch (err) {
      showStatus('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const downloadCloudItemAsFile = (item) => {
    showStatus(`กำลังดาวน์โหลดข้อมูลของ ${item.companyName}...`);
    try {
      const safeConfig = { ...(item.config || {}), userApiKey: '', openaiApiKey: '', claudeApiKey: '', deepseekApiKey: '' };
      const payload = JSON.stringify({ config: safeConfig, workplaceMainTasks: item.workplaceMainTasks, selectedBehaviors: item.selectedBehaviors });
      const encryptedData = encryptPayload(payload);
      const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none'; link.href = url; link.download = generateFileName(item.config || {});
      document.body.appendChild(link); link.click();
      setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 100);
      showStatus('ดาวน์โหลดไฟล์สำเร็จ!');
    } catch (err) {
      showStatus('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
    }
  };

  const loadFromCloudItem = (item) => {
    if (window.confirm('คำเตือน: การนำเข้าข้อมูลจากคลาวด์จะทับข้อมูลปัจจุบันของคุณที่กำลังทำอยู่ทั้งหมด ต้องการดำเนินการต่อหรือไม่?')) {
      setConfig(prev => ({
        ...(item.config || config),
        userApiKey: prev.userApiKey, openaiApiKey: prev.openaiApiKey, claudeApiKey: prev.claudeApiKey, deepseekApiKey: prev.deepseekApiKey
      }));
      setWorkplaceMainTasks(item.workplaceMainTasks || []);
      setSelectedBehaviors(item.selectedBehaviors || BEHAVIOR_OPTIONS);

      if (isDeveloper) {
        setEditingCloudId(item.id);
        showStatus('เข้าสู่โหมดแก้ไขข้อมูลคลาวด์ (Admin)');
      } else {
        setEditingCloudId(null);
        showStatus('นำเข้าข้อมูลจากคลังกลางสำเร็จ!');
      }
      setActiveTab('workplace');
    }
  };

  const executeApplyDveData = (parsedData, mode) => {
    const isJobCompany = Array.isArray(parsedData);
    if (!isJobCompany && parsedData) {
      
      // 1. นำเข้าข้อมูลหน้าตั้งค่า (Config) 
      // 🟢 แก้ไข: ถ้าเลือกโหมด 1 (merge) จะไม่เอาข้อมูลหน้าตั้งค่าจากไฟล์มาใช้เด็ดขาด เพื่อรักษาข้อมูลเดิมของระบบไว้
      if (parsedData.config && mode !== 'merge') {
        setConfig(prev => ({
          ...parsedData.config,
          userApiKey: prev.userApiKey, openaiApiKey: prev.openaiApiKey, claudeApiKey: prev.claudeApiKey, deepseekApiKey: prev.deepseekApiKey
        }));
      }

      // 2. นำเข้าข้อมูลรายวิชา
      if (parsedData.subjects && currentUserRole !== 'ครูฝึกในสถานประกอบการ') {
        if (mode === 'merge') {
          // 🟢 แก้ไข: โหมด Merge จะนำรายวิชาที่โหลดเข้ามาใหม่ ไป "เติม/แทรก" ในช่องเดิมโดยไม่ลบวิชาเก่าทิ้ง 
          // (รองรับการอัปโหลดผสมกันกี่ไฟล์ก็ได้)
          setSubjects(prev => {
            const next = [...prev];
            parsedData.subjects.forEach(inc => {
              if (inc.name || inc.description || inc.isAnalyzed) {
                const idx = next.findIndex(s => s.id === inc.id);
                if (idx !== -1) {
                  next[idx] = { ...inc, previewUrl: null, uploadedFile: null };
                }
              }
            });
            return next;
          });
        } else {
          setSubjects(parsedData.subjects.map(s => ({ ...s, previewUrl: null, uploadedFile: null })));
        }
      }
      
      // นำเข้าข้อมูลพฤติกรรม
      if (parsedData.selectedBehaviors) setSelectedBehaviors(parsedData.selectedBehaviors);
    }

    // 3. แปลงข้อมูลงานสถานประกอบการเตรียมนำเข้า
    let incomingTasks = isJobCompany ? parsedData : (parsedData?.workplaceMainTasks || []);
    const newIncomingTasks = incomingTasks.map((t, i) => ({
      ...t, id: Date.now() + i,
      subTasks: Array.isArray(t.subTasks) ? t.subTasks.map((st, si) => ({ ...st, id: `W${Date.now().toString().slice(-4)}-${i}-${si}`, detailed_steps: Array.isArray(st.detailed_steps) ? st.detailed_steps.map(step => ({ ...step })) : [] })) : []
    }));

    if (mode === 'overwrite') {
      setWorkplaceMainTasks(newIncomingTasks.length > 0 ? newIncomingTasks : [{ id: Date.now(), name: '', isAnalyzing: false, isConfirmed: false, subTasks: [] }]);
      showStatus('ใช้ข้อมูลจากไฟล์อัปโหลดสำเร็จ!');
    } else if (mode === 'keep_current') {
      showStatus('คงข้อมูลเดิมบนหน้าจอไว้สำเร็จ!');
    } else if (mode === 'merge') {
      let currentTasks = [...workplaceMainTasks];
      // เคลียร์กล่องเปล่าออกก่อน
      if (currentTasks.length === 1 && !currentTasks[0].name && (!currentTasks[0].subTasks || currentTasks[0].subTasks.length === 0)) currentTasks = [];
      
      newIncomingTasks.forEach((incTask) => {
        let taskToAdd = { ...incTask };
        const matchedMainTask = currentTasks.find(curr => curr.name && cleanTaskName(curr.name) === cleanTaskName(incTask.name));
        if (matchedMainTask) taskToAdd.name = `${taskToAdd.name} (สอดคล้องกับงานหลัก: ${matchedMainTask.name})`;
        if (taskToAdd.subTasks) {
          taskToAdd.subTasks = taskToAdd.subTasks.map((sub) => {
            let matchedSubName = '';
            for (const curr of currentTasks) {
              if (curr.subTasks) {
                const match = curr.subTasks.find(currSub => currSub.workplaceName && cleanTaskName(currSub.workplaceName) === cleanTaskName(sub.workplaceName));
                if (match) { matchedSubName = match.workplaceName; break; }
              }
            }
            if (matchedSubName) return { ...sub, workplaceName: `${sub.workplaceName} (สอดคล้องกับงานย่อย: ${matchedSubName})` };
            return sub;
          });
        }
        // 🟢 แก้ไข: ผลักข้อมูลงานใหม่ต่อท้ายไปเรื่อยๆ (จะกดโหลดเพิ่มอีกกี่ไฟล์ก็ได้ ข้อมูลจะมาต่อกัน)
        currentTasks.push(taskToAdd);
      });
      setWorkplaceMainTasks(currentTasks);
      showStatus('นำเข้าและรวมข้อมูลสำเร็จ! (รักษาค่าหน้าตั้งค่าเดิมไว้)');
    }
    
    setShowDveConflictModal(false); setPendingDveData(null); setEditingCloudId(null);
  };

  const handleFileUploadLocal = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const resetInputs = () => { if (fileInputRef.current) fileInputRef.current.value = ''; if (evalFileInputRef.current) evalFileInputRef.current.value = ''; };

    const reader = new FileReader();
    reader.onload = (event) => {
      let rawText = event.target.result;
      rawText = rawText.replace(/^\uFEFF/, '').trim();

      let parsed = null;
      const decodeUTF8 = (str) => {
        try { return decodeURIComponent(escape(atob(str))); }
        catch (err) { return new TextDecoder().decode(Uint8Array.from(atob(str), c => c.charCodeAt(0))); }
      };

      try { parsed = JSON.parse(rawText); } catch (_) { }
      if (!parsed) try { parsed = JSON.parse(decryptPayload(rawText)); } catch (_) { }
      if (!parsed) try { parsed = JSON.parse(decodeUTF8(rawText)); } catch (_) { }

      if (parsed && (parsed.config || parsed.subjects || parsed.workplaceMainTasks)) {
        const currentHasData = workplaceMainTasks.length > 0 && workplaceMainTasks.some(t => t.name !== '');
        const incomingHasData = parsed.workplaceMainTasks && parsed.workplaceMainTasks.length > 0 && parsed.workplaceMainTasks.some(t => t.name !== '');

        if (currentHasData && incomingHasData) {
          setPendingDveData(parsed); setShowDveConflictModal(true);
        } else {
          executeApplyDveData(parsed, 'overwrite');
        }
      } else {
        showStatus('เปิดไฟล์ไม่สำเร็จ: ไฟล์เสียหายหรือไม่พบข้อมูล');
      }
      resetInputs();
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleJobCompanyUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let rawText = event.target.result;
        rawText = rawText.replace(/^\uFEFF/, '').trim();

        let parsed = null;
        const decodeUTF8 = (str) => {
          try { return decodeURIComponent(escape(atob(str))); }
          catch (err) { return new TextDecoder().decode(Uint8Array.from(atob(str), c => c.charCodeAt(0))); }
        };

        try { parsed = JSON.parse(rawText); } catch (_) { }
        if (!parsed) try { parsed = JSON.parse(decryptPayload(rawText)); } catch (_) { }
        if (!parsed) try { parsed = JSON.parse(decodeUTF8(rawText)); } catch (_) { }

        let importedTasks = [];
        if (parsed) {
          if (Array.isArray(parsed)) importedTasks = parsed;
          else if (typeof parsed === 'object') {
            if (parsed.workplaceMainTasks && Array.isArray(parsed.workplaceMainTasks)) importedTasks = parsed.workplaceMainTasks;
            else if (parsed.data && Array.isArray(parsed.data)) importedTasks = parsed.data;
            else if (parsed.tasks && Array.isArray(parsed.tasks)) importedTasks = parsed.tasks;
            else {
              for (let key in parsed) {
                if (Array.isArray(parsed[key]) && parsed[key].length > 0) { importedTasks = parsed[key]; break; }
              }
            }
          }
        } else if (rawText.length > 0 && !rawText.includes('<html')) {
          let decodedText = rawText;
          try { decodedText = decodeUTF8(rawText); } catch (_) { }
          const lines = decodedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          importedTasks = lines.map(line => ({ name: line, subTasks: [] }));
        }

        if (importedTasks.length > 0) {
          const normalizedTasks = importedTasks.map(t => (typeof t === 'string' ? { name: t, subTasks: [] } : t));
          const currentHasData = workplaceMainTasks.length > 0 && workplaceMainTasks.some(t => t.name !== '');

          if (currentHasData) {
            setPendingDveData(normalizedTasks); setShowDveConflictModal(true);
          } else {
            executeApplyDveData(normalizedTasks, 'overwrite');
          }
        } else {
          showStatus('เปิดไฟล์ไม่สำเร็จ: ไม่พบรูปแบบข้อมูลงานที่ระบบรู้จัก');
        }
      } catch (err) { showStatus('เกิดข้อผิดพลาดในการอ่านไฟล์'); }
      if (jobCompanyInputRef.current) jobCompanyInputRef.current.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  const shareToCloud = async () => {
    if (!config.companyName?.trim()) return showStatus("กรุณาระบุชื่อสถานประกอบการก่อนบันทึก");
    if (!config.province?.trim()) return showStatus("กรุณาระบุจังหวัดของสถานประกอบการ");
    if (!config.trainerName?.trim()) return showStatus("กรุณาระบุชื่อ-สกุล ครูฝึก");

    showStatus("กำลังดำเนินการ...");
    try {
      const safeConfig = { ...config, userApiKey: '', openaiApiKey: '', claudeApiKey: '', deepseekApiKey: '' };
      const payload = {
        action: (isDeveloper && editingCloudId) ? 'adminUpdate' : 'shareData',
        id: editingCloudId,
        config: safeConfig,
        workplaceMainTasks,
        selectedBehaviors,
        companyName: config.companyName,
        province: config.province,
        creatorName: config.trainerName,
        level: config.level,
      };

      await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });

      showStatus((isDeveloper && editingCloudId) ? "อัปเดตแก้ไขข้อมูลทับรายการเดิมสำเร็จ!" : "แชร์ข้อมูลเข้าสู่คลังกลางสำเร็จ!");
      if (isDeveloper && editingCloudId) setEditingCloudId(null);
      setActiveTab('cloud');
    } catch (err) {
      showStatus("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง");
    }
  };

  const submitDeleteRequest = async () => {
    if (!isDeveloper && !deleteReason.trim()) return showStatus("กรุณาระบุเหตุผลการลบ");
    setIsDeleting(true);
    try {
      const payload = { action: isDeveloper ? 'adminDelete' : 'deleteRequest', id: deleteModalItem.id, reason: deleteReason };
      await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
      showStatus(isDeveloper ? "ลบข้อมูลถาวรสำเร็จ" : "ส่งคำขอลบข้อมูลเรียบร้อยแล้ว");
      setDeleteModalItem(null); setDeleteReason(''); fetchCloudData();
    } catch (error) {
      showStatus("เกิดข้อผิดพลาดในการดำเนินการ");
    }
    setIsDeleting(false);
  };

  const handleAdminCancelDelete = async (id) => {
    showStatus("กำลังยกเลิกคำขอลบ...");
    try {
      await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'adminCancelDelete', id: id }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
      showStatus("ยกเลิกคำขอลบเรียบร้อย คืนสถานะปกติ"); fetchCloudData();
    } catch (error) {
      showStatus("เกิดข้อผิดพลาดในการยกเลิก");
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === FILE_SECRET_KEY) {
      setIsDeveloper(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      showStatus("เข้าสู่ระบบแอดมินสำเร็จ สิทธิ์การแก้ไขเปิดใช้งาน");
    } else {
      showStatus("รหัสผ่านไม่ถูกต้อง!");
    }
  };

  const submitFeedback = async () => {
    setIsSubmittingFeedback(true);
    try {
      const payload = { action: 'systemFeedback', feedback: systemFeedback, trainerName: config.trainerName || 'ไม่ระบุชื่อ' };
      await fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
      showStatus("ขอบคุณสำหรับการประเมินและข้อเสนอแนะครับ!");
      setSystemFeedback({ ux: 5, ai: 5, speed: 5, reports: 5, overall: 5, suggestion: '' });
      setTimeout(() => setActiveTab('setup'), 2000);
    } catch (error) { showStatus("เกิดข้อผิดพลาดในการส่งแบบประเมิน"); }
    setIsSubmittingFeedback(false);
  };

  // --- Admin User Functions ---
  const handleApproveUser = async (email) => {
    try {
      showStatus('กำลังอนุมัติผู้ใช้งาน...');
      setDbUsers(prev => prev.map(u => u.email === email ? { ...u, status: 'approved' } : u));
      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'approve_user', email: email }) });
      showStatus('อนุมัติผู้ใช้งานสำเร็จ');
    } catch (e) { showStatus('เกิดข้อผิดพลาดในการอนุมัติ'); }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm('คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?')) return;
    try {
      showStatus('กำลังลบผู้ใช้งาน...');
      setDbUsers(prev => prev.filter(u => u.email !== email));
      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'delete_user', email: email }) });
      showStatus('ลบผู้ใช้งานสำเร็จ');
    } catch (e) { showStatus('เกิดข้อผิดพลาดในการลบผู้ใช้'); }
  };

  // --- AI API ---
  const callAI = async (payload, retries = 5, delay = 2000) => {
    const provider = config.aiProvider || 'gemini';
    const systemPromptText = payload.systemInstruction?.parts?.[0]?.text || '';
    const schemaStr = payload.generationConfig?.responseSchema ? JSON.stringify(payload.generationConfig.responseSchema) : '';
    const jsonInstruction = `\n\nIMPORTANT: You must return the result ONLY as a valid JSON object. Do not include markdown code blocks or any other text. The JSON MUST match exactly this schema: ${schemaStr}`;

    for (let i = 0; i < retries; i++) {
      try {
        let text = "";

        if (provider === 'gemini') {
          const isCustomKey = !!config.userApiKey?.trim();
          const activeKey = isCustomKey ? config.userApiKey.trim() : apiKey;
          const modelVersion = isCustomKey ? "gemini-2.5-flash" : "gemini-2.5-flash-preview-09-2025";
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${activeKey}`;

          const updatedPayload = {
            ...payload,
            generationConfig: { responseMimeType: "application/json", ...(payload.generationConfig || {}) }
          };

          const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedPayload) });
          if (!response.ok) throw new Error(`Gemini Error: ${response.status}`);
          const result = await response.json();
          text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        } else if (provider === 'openai') {
          const key = config.openaiApiKey?.trim();
          if (!key) throw new Error("กรุณาระบุ OpenAI API Key ในหน้าตั้งค่า");
          const messages = [{ role: 'system', content: systemPromptText + jsonInstruction }];
          const userContent = [];
          payload.contents[0].parts.forEach(p => {
            if (p.text) userContent.push({ type: 'text', text: p.text });
            if (p.inlineData) userContent.push({ type: 'image_url', image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` } });
          });
          messages.push({ role: 'user', content: userContent });
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({ model: 'gpt-4o-mini', messages: messages, response_format: { type: "json_object" } })
          });
          if (!response.ok) throw new Error(`OpenAI Error: ${response.status}`);
          const result = await response.json();
          text = result.choices[0].message.content;

        } else if (provider === 'deepseek') {
          const key = config.deepseekApiKey?.trim();
          if (!key) throw new Error("กรุณาระบุ DeepSeek API Key ในหน้าตั้งค่า");
          const messages = [{ role: 'system', content: systemPromptText + jsonInstruction }];
          let userText = "";
          payload.contents[0].parts.forEach(p => {
            if (p.text) userText += p.text + "\n";
            if (p.inlineData) userText += "[ภาพแนบไม่รองรับใน DeepSeek]\n";
          });
          messages.push({ role: 'user', content: userText });
          const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({ model: 'deepseek-chat', messages: messages, response_format: { type: "json_object" } })
          });
          if (!response.ok) throw new Error(`DeepSeek Error: ${response.status}`);
          const result = await response.json();
          text = result.choices[0].message.content;

        } else if (provider === 'claude') {
          const key = config.claudeApiKey?.trim();
          if (!key) throw new Error("กรุณาระบุ Claude API Key ในหน้าตั้งค่า");
          const userContent = [];
          payload.contents[0].parts.forEach(p => {
            if (p.text) userContent.push({ type: 'text', text: p.text });
            if (p.inlineData) userContent.push({ type: 'image', source: { type: 'base64', media_type: p.inlineData.mimeType, data: p.inlineData.data } });
          });
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerously-allow-browser': 'true' },
            body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 4000, system: systemPromptText + jsonInstruction, messages: [{ role: 'user', content: userContent }] })
          });
          if (!response.ok) throw new Error(`Claude Error: ${response.status}`);
          const result = await response.json();
          text = result.content[0].text;
        }

        if (!text) throw new Error("ระบบ ไม่ตอบกลับ");
        try { return JSON.parse(text); } catch (e) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
          throw new Error("รูปแบบข้อมูลที่ ระบบ ตอบกลับไม่ถูกต้อง");
        }
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
      }
    }
  };

  const fileToBase64 = useCallback((file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  }), []);

  const handleFileUpload = (type, index, e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'subject') {
        setSubjects(prev => {
          const n = [...prev];
          n[index] = { ...n[index], uploadedFile: file, previewUrl: url, isAnalyzed: false };
          return n;
        });
        showStatus(`อัปโหลดไฟล์วิชา ${subjectsRef.current[index].id} สำเร็จ`);
      }
    }
  };

  // --- Logic Functions ---
  const runSubjectAnalysis = async (sub) => {
    const systemPrompt = `คุณคือผู้เชี่ยวชาญวิเคราะห์รายวิชาอาชีวศึกษา วิเคราะห์วิชา: "${sub.id}"
    หน้าที่ของคุณ:
    1. สกัดข้อมูลพื้นฐาน: รหัสวิชา, ชื่อวิชา, ท-ป-น (credits), อ้างอิงมาตรฐาน (standards), ผลลัพธ์การเรียนรู้ระดับรายวิชา (learningOutcomes), จุดประสงค์รายวิชา (objectives), สมรรถนะรายวิชา (competencies), และ คำอธิบายรายวิชา (description)
    2. **สำคัญมาก**: ต้องวิเคราะห์สมรรถนะเพื่อสร้าง "งานหลัก" (mainTasks) และ "งานย่อย" (subTasks) อย่างน้อย 2-3 งาน
    3. รหัสงานต้องขึ้นต้นด้วย "${sub.id}" เสมอ (งานหลักให้ใช้รหัสเช่น ${sub.id}1, ${sub.id}2 และงานย่อยให้ใช้รหัสเช่น ${sub.id}1-1, ${sub.id}1-2)
    4. ห้ามใช้คำว่า ศึกษา, เรียนรู้, ทฤษฎี ในการกำหนดชื่องานปฏิบัติโดยเด็ดขาด ให้แปลงเป็นคำกริยาทางปฏิบัติการทั้งหมด (เช่น ตรวจสอบ, บำรุงรักษา, ปฏิบัติงาน)`;

    let textPrompt = sub.description ? `สกัดข้อมูลและวิเคราะห์งานสำหรับวิชา ${sub.id} จากข้อความนี้:\n${sub.description}` : `สกัดข้อมูลและวิเคราะห์งานสำหรับวิชา ${sub.id}`;
    let parts = [{ text: textPrompt }];

    if (sub.uploadedFile) {
      const b64 = await fileToBase64(sub.uploadedFile);
      parts.push({ inlineData: { mimeType: sub.uploadedFile.type, data: b64 } });
      parts[0].text += "\n(ใช้ OCR อ่านข้อมูลรหัสวิชา, ชื่อวิชา, ท-ป-น, อ้างอิงมาตรฐาน, ผลลัพธ์การเรียนรู้ระดับรายวิชา, จุดประสงค์รายวิชา, สมรรถนะ, คำอธิบายรายวิชา จากรูปภาพที่แนบมา และนำมาวิเคราะห์งานหลัก/งานย่อยให้ครบถ้วน โดยตัดคำว่า ศึกษา, เรียนรู้, ทฤษฎี ออกทั้งหมด)";
    }

    const generationConfig = {
      responseSchema: {
        type: "OBJECT",
        properties: {
          courseInfo: {
            type: "OBJECT",
            properties: {
              code: { type: "STRING" }, name: { type: "STRING" }, credits: { type: "STRING" },
              standards: { type: "STRING" }, learningOutcomes: { type: "STRING" }, objectives: { type: "STRING" },
              competencies: { type: "STRING" }, description: { type: "STRING" }
            }
          },
          mainTasks: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" }, name: { type: "STRING" },
                subTasks: {
                  type: "ARRAY",
                  items: { type: "OBJECT", properties: { id: { type: "STRING" }, name: { type: "STRING" } } }
                }
              }
            }
          }
        }
      }
    };

    return await callAI({ contents: [{ parts }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig });
  };

  const analyzeSubject = async (index) => {
    const activeKey = config.aiProvider === 'openai' ? config.openaiApiKey : config.aiProvider === 'claude' ? config.claudeApiKey : config.aiProvider === 'deepseek' ? config.deepseekApiKey : (config.userApiKey || apiKey);
    if (!activeKey?.trim() && config.aiProvider !== 'gemini') return showStatus(`กรุณาใส่ API Key ของ ${config.aiProvider} ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน`);
    if (config.aiProvider === 'gemini' && !config.userApiKey?.trim() && !apiKey) return showStatus("กรุณาใส่ Gemini API Key ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน");

    const sub = subjectsRef.current[index];
    if (!sub.description && !sub.uploadedFile) return showStatus(`กรุณาป้อนข้อมูลสำหรับวิชา ${sub.id}`);
    setIsAnalyzingSubject(true); setCurrentIdx(index);
    try {
      showStatus(`กำลังวิเคราะห์วิชา ${sub.id}...`);
      const result = await runSubjectAnalysis(sub);
      setSubjects(prev => {
        const n = [...prev];
        n[index] = {
          ...sub,
          code: result.courseInfo?.code || sub.code || '', name: result.courseInfo?.name || sub.name || '', credits: result.courseInfo?.credits || sub.credits || '',
          standards: result.courseInfo?.standards || sub.standards || '', learningOutcomes: result.courseInfo?.learningOutcomes || sub.learningOutcomes || '',
          objectives: result.courseInfo?.objectives || sub.objectives || '', competencies: result.courseInfo?.competencies || sub.competencies || '',
          description: result.courseInfo?.description || sub.description || '', mainTasks: (result.mainTasks && result.mainTasks.length > 0) ? result.mainTasks : sub.mainTasks,
          isAnalyzed: true
        };
        return n;
      });
      showStatus(`วิเคราะห์วิชา ${sub.id} สำเร็จ`);
    } catch (e) {
      showStatus(`ขัดข้องวิชา ${sub.id}: ${e.message}`);
    } finally {
      setIsAnalyzingSubject(false); setCurrentIdx(null);
    }
  };

  const analyzeAllSubjects = async () => {
    const activeKey = config.aiProvider === 'openai' ? config.openaiApiKey : config.aiProvider === 'claude' ? config.claudeApiKey : config.aiProvider === 'deepseek' ? config.deepseekApiKey : (config.userApiKey || apiKey);
    if (!activeKey?.trim() && config.aiProvider !== 'gemini') return showStatus(`กรุณาใส่ API Key ของ ${config.aiProvider} ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน`);
    if (config.aiProvider === 'gemini' && !config.userApiKey?.trim() && !apiKey) return showStatus("กรุณาใส่ Gemini API Key ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน");

    const currentSubjects = subjectsRef.current;
    const activeIndices = currentSubjects.map((s, i) => (s.description || s.uploadedFile) && !s.isAnalyzed ? i : -1).filter(i => i !== -1);
    if (activeIndices.length === 0) return showStatus("ไม่มีข้อมูลรายวิชาใหม่ให้วิเคราะห์ (กรุณาอัปโหลดไฟล์หรือพิมพ์ข้อมูลก่อน)");

    setIsAnalyzingSubject(true);
    for (const idx of activeIndices) {
      setCurrentIdx(idx);
      try {
        const latestSub = subjectsRef.current[idx];
        showStatus(`กำลังวิเคราะห์วิชา ${latestSub.id}...`);
        const result = await runSubjectAnalysis(latestSub);
        setSubjects(prev => {
          const n = [...prev];
          n[idx] = { ...n[idx], code: result.courseInfo?.code || n[idx].code || '', name: result.courseInfo?.name || n[idx].name || '', credits: result.courseInfo?.credits || n[idx].credits || '', standards: result.courseInfo?.standards || n[idx].standards || '', learningOutcomes: result.courseInfo?.learningOutcomes || n[idx].learningOutcomes || '', objectives: result.courseInfo?.objectives || n[idx].objectives || '', competencies: result.courseInfo?.competencies || n[idx].competencies || '', description: result.courseInfo?.description || n[idx].description || '', mainTasks: (result.mainTasks && result.mainTasks.length > 0) ? result.mainTasks : n[idx].mainTasks, isAnalyzed: true };
          return n;
        });
        showStatus(`วิเคราะห์วิชา ${latestSub.id} สำเร็จ`);
        await new Promise(res => setTimeout(res, 3000));
      } catch (e) {
        showStatus(`วิชา ${subjectsRef.current[idx].id} ขัดข้อง: ${e.message}`);
        await new Promise(res => setTimeout(res, 4000));
      }
    }
    setIsAnalyzingSubject(false); setCurrentIdx(null);
    showStatus("จบการทำงาน: วิเคราะห์รายวิชาอ้างอิงทั้งหมดเสร็จสิ้น");
  };

  const addSubjectMainTaskLocal = (subIndex) => setSubjects(prev => { const next = [...prev]; if (!next[subIndex].mainTasks) next[subIndex].mainTasks = []; const newId = `${next[subIndex].id}${next[subIndex].mainTasks.length + 1}`; next[subIndex].mainTasks.push({ id: newId, name: '', subTasks: [] }); return next; });
  const removeSubjectMainTaskLocal = (subIndex, mIdx) => { if (!window.confirm("ต้องการลบงานหลักนี้ใช่หรือไม่?")) return; setSubjects(prev => { const next = [...prev]; next[subIndex].mainTasks.splice(mIdx, 1); return next; }); };
  const addSubjectSubTaskLocal = (subIndex, mIdx) => setSubjects(prev => { const next = [...prev]; if (!next[subIndex].mainTasks[mIdx].subTasks) next[subIndex].mainTasks[mIdx].subTasks = []; const mId = next[subIndex].mainTasks[mIdx].id; const newId = `${mId}-${next[subIndex].mainTasks[mIdx].subTasks.length + 1}`; next[subIndex].mainTasks[mIdx].subTasks.push({ id: newId, name: '' }); return next; });
  const removeSubjectSubTaskLocal = (subIndex, mIdx, sIdx) => setSubjects(prev => { const next = [...prev]; next[subIndex].mainTasks[mIdx].subTasks.splice(sIdx, 1); return next; });

  const addWorkplaceMainTask = () => {
    if (workplaceMainTasks.length >= 100) return showStatus("เพิ่มงานหลักได้สูงสุด ๑๐๐ งาน");
    setWorkplaceMainTasks(prev => [...prev, { id: Date.now(), name: '', isAnalyzing: false, isConfirmed: false, subTasks: [] }]);
  };

  const removeWorkplaceMainTask = (id) => setWorkplaceMainTasks(prev => prev.filter(t => t.id !== id));

  const remapAllWorkplaceTasks = async () => {
    const activeKey = config.aiProvider === 'openai' ? config.openaiApiKey : config.aiProvider === 'claude' ? config.claudeApiKey : config.aiProvider === 'deepseek' ? config.deepseekApiKey : (config.userApiKey || apiKey);
    if (!activeKey?.trim() && config.aiProvider !== 'gemini') return showStatus(`กรุณาใส่ API Key ของ ${config.aiProvider} ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน`);
    if (config.aiProvider === 'gemini' && !config.userApiKey?.trim() && !apiKey) return showStatus("กรุณาใส่ Gemini API Key ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน");

    const analyzed = subjectsRef.current.filter(s => s.isAnalyzed);
    const pool = analyzed.flatMap(s => (s.mainTasks || []).flatMap(mt => mt.subTasks || []));

    if (pool.length === 0) return showStatus("ยังไม่มีข้อมูลงานในรายวิชา (Pool) กรุณาวิเคราะห์วิชาก่อน");

    setIsRemapping(true); showStatus("กำลังส่งข้อมูลให้ระบบวิเคราะห์เพื่อจับคู่งานใหม่...");

    try {
      const workplaceDataForAi = workplaceMainTasks.flatMap((m, mIdx) =>
        (m.subTasks || []).map((s, sIdx) => ({
          mIdx, sIdx, wId: s.id, wName: s.workplaceName, steps: (s.detailed_steps || []).map((step, stepIdx) => ({ stepIdx, text: step.step_text }))
        }))
      );

      const systemPrompt = `คุณคือระบบอัจฉริยะสำหรับจัดทำแผนฝึกอาชีพทวิภาคี หน้าที่ของคุณคือการจับคู่ (Map) งานสถานประกอบการกับพูลงานในรายวิชา
      
      **ข้อมูลพูลงานรายวิชา (Pool) ที่มีทั้งหมด:**
      ${JSON.stringify(pool.map(t => ({ id: t.id, name: t.name })))}

      **กฎเหล็กการจับคู่:**
      1. นำงานสถานประกอบการแต่ละข้อ ไปพิจารณาเปรียบเทียบความหมายและผลลัพธ์ของงานกับพูลงานด้านบน โดยต้องพิจารณาทั้ง "คำกริยา" (Action) และ "เป้าหมาย/สิ่งที่ถูกกระทำ" (Object) ประกอบกันเสมอ (เช่น "เปลี่ยนอุปกรณ์" ต้องคู่กับ "ซ่อม/แก้ไขอุปกรณ์" หรือ "ทำความสะอาด" คู่กับ "บำรุงรักษา")
      2. ให้ถือว่าคำกริยาและกลุ่มคำต่อไปนี้มีความสอดคล้องหรือความหมายไปในทิศทางเดียวกัน สามารถนำมาจับคู่กันได้:
         - กลุ่มแก้ปัญหา/ซ่อมบำรุง: แก้ไขข้อขัดข้อง, ตรวจซ่อม, ซ่อมบำรุง, ซ่อมแซม, ซ่อม, แก้ปัญหา, แก้ไข, ปรับปรุง, ปรับแต่ง, ปรับตั้ง, ปรับ, เปลี่ยนอุปกรณ์, เปลี่ยนอะไหล่
         - กลุ่มจัดการ/ตรวจสอบ: ตรวจสอบ, สอบทาน, เช็ค, ตรวจเช็ค, ทดสอบ, วิเคราะห์, จัดการ, บริหาร, คัดแยก, บรรจุ
         - กลุ่มการใช้และดูแลเครื่องมือ: เลือกใช้เครื่องมือ, เลือกเครื่องมือ, ใช้เครื่องมือ, บำรุงรักษา, ทำความสะอาด, ดูแล, เช็ด
         - กลุ่มวางแผน/สร้างสรรค์: ออกแบบ, วางแผน, วางโครงสร้าง, คิดค้น, ประดิษฐ์, กำหนด
         - กลุ่มลงมือทำ/ดำเนินการ: ผลิต, ดำเนินการ, ปฏิบัติ, ประกอบ, ติดตั้ง, จัดทำ, จัดเตรียม, เตรียม, ตัด, เย็บ
         - กลุ่มส่งเสริม/ขาย: จำหน่าย, ขาย, ประชาสัมพันธ์, โฆษณา, บริการ, ให้คำปรึกษา
      3. คืนค่าเป็นรหัสย่อยเฉพาะของรายวิชา ตามข้อมูลในพูลงานข้างต้นเท่านั้น (เช่น A1-1, B2-2) **ห้ามตอบเป็นรหัสงานหลักแบบกว้างๆ (เช่น A1 หรือ B2)**
      4. ห้ามแต่งรหัสขึ้นมาเองโดยเด็ดขาด หากงานในสถานประกอบการไม่สอดคล้องกับพูลงานไหนเลย ให้ส่งค่าว่าง ""`; const generationConfig = { responseSchema: { type: "OBJECT", properties: { mappings: { type: "ARRAY", items: { type: "OBJECT", properties: { wId: { type: "STRING" }, mappedSubTaskId: { type: "STRING" }, steps: { type: "ARRAY", items: { type: "OBJECT", properties: { stepIdx: { type: "INTEGER" }, mappedStepId: { type: "STRING" } } } } } } } } } };

      const result = await callAI({ contents: [{ parts: [{ text: `จับคู่งานดังนี้:\n${JSON.stringify(workplaceDataForAi)}` }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig });

      if (result.mappings) {
        setWorkplaceMainTasks(prev => {
          const next = [...prev];
          result.mappings.forEach(mapped => {
            const taskInfo = workplaceDataForAi.find(t => t.wId === mapped.wId);
            if (taskInfo) {
              const { mIdx, sIdx } = taskInfo;
              if (mapped.mappedSubTaskId) {
                const safeId = extractValidTaskIds(mapped.mappedSubTaskId);
                if (safeId) {
                  next[mIdx].subTasks[sIdx].id = safeId;
                  const poolItem = pool.find(p => p.id === safeId.split(',')[0].trim());
                  if (poolItem) next[mIdx].subTasks[sIdx].name = cleanTaskName(poolItem.name);
                }
              }
              if (mapped.steps && next[mIdx].subTasks[sIdx].detailed_steps) {
                mapped.steps.forEach(stMap => {
                  const step = next[mIdx].subTasks[sIdx].detailed_steps[stMap.stepIdx];
                  if (step && stMap.mappedStepId) {
                    const safeStepId = extractValidTaskIds(stMap.mappedStepId);
                    if (safeStepId) step.subjectTaskId = safeStepId;
                  }
                });
              }
            }
          });
          return next;
        });
        showStatus("เชื่อมโยงและจับคู่งานเสร็จสมบูรณ์");
      }
    } catch (e) {
      showStatus("ขัดข้อง: " + e.message);
    } finally {
      setIsRemapping(false);
    }
  };

  const analyzeWorkplaceMainTask = async (taskId) => {
    const activeKey = config.aiProvider === 'openai' ? config.openaiApiKey : config.aiProvider === 'claude' ? config.claudeApiKey : config.aiProvider === 'deepseek' ? config.deepseekApiKey : (config.userApiKey || apiKey);
    if (!activeKey?.trim() && config.aiProvider !== 'gemini') return showStatus(`กรุณาใส่ API Key ของ ${config.aiProvider} ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน`);
    if (config.aiProvider === 'gemini' && !config.userApiKey?.trim() && !apiKey) return showStatus("กรุณาใส่ Gemini API Key ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน");

    const analyzed = subjectsRef.current.filter(s => s.isAnalyzed);
    const pool = analyzed.flatMap(s => (s.mainTasks || []).flatMap(mt => mt.subTasks || []));

    const taskToAnalyze = workplaceMainTasks.find(t => t.id === taskId);
    const taskIndex = workplaceMainTasks.findIndex(t => t.id === taskId);
    const tIdx = taskIndex >= 0 ? taskIndex + 1 : 1;

    if (!taskToAnalyze || !taskToAnalyze.name) return showStatus("กรุณาระบุชื่องานหลักก่อนทำการวิเคราะห์");
    setWorkplaceMainTasks(prev => prev.map(t => t.id === taskId ? { ...t, isAnalyzing: true } : t));

    try {
      const systemPrompt = `วิเคราะห์งานหลัก: "${taskToAnalyze.name}" 
      1. แตกเป็น "งานย่อย" 4-6 งาน และสำหรับแต่ละงานย่อย ให้เขียน "ขั้นตอนการปฏิบัติงาน" (Performance Steps) ให้ละเอียดและครบถ้วนที่สุดตามลำดับการทำงานจริง
      ${pool.length > 0 ? `2. **สำคัญมาก (การจับคู่รหัส Mapping ด้วยลักษณะงาน)**: นำ "ภาพรวมงานย่อย" และ "ขั้นตอนการปฏิบัติงาน" มาพิจารณาเปรียบเทียบกับพูลสมรรถนะวิชา: ${JSON.stringify(pool.map(t => ({ id: t.id, name: t.name })))} 
      - ให้จับคู่โดยพิจารณาจาก "ลักษณะการปฏิบัติงาน" และ "เป้าหมาย/สิ่งที่ถูกกระทำ" ประกอบกันเสมอ (เช่น "เปลี่ยนอุปกรณ์" ต้องคู่กับ "ซ่อม/แก้ไขอุปกรณ์" หรือ "ทำความสะอาด" คู่กับ "บำรุงรักษา") โดยอนุโลมให้กลุ่มคำต่อไปนี้สอดคล้องกัน:
        * แก้ปัญหา/ซ่อมบำรุง: แก้ไขข้อขัดข้อง, ตรวจซ่อม, ซ่อมบำรุง, ซ่อมแซม, ซ่อม, แก้ปัญหา, แก้ไข, ปรับปรุง, ปรับแต่ง, ปรับตั้ง, เปลี่ยนอุปกรณ์, เปลี่ยนอะไหล่
        * จัดการ/ตรวจสอบ: ตรวจสอบ, สอบทาน, เช็ค, ตรวจเช็ค, ทดสอบ, วิเคราะห์, จัดการ, บริหาร, คัดแยก, บรรจุ, ควบคุมคุณภาพ
        * การใช้และดูแลเครื่องมือ: เลือกใช้เครื่องมือ, เลือกเครื่องมือ, ใช้เครื่องมือ, บำรุงรักษา, ทำความสะอาด, ดูแล, เช็ด
        * วางแผน/สร้างสรรค์: ออกแบบ, วางแผน, วางโครงสร้าง, คิดค้น, ประดิษฐ์, กำหนด
        * ลงมือทำ/ดำเนินการ: ผลิต, ดำเนินการ, ปฏิบัติ, ประกอบ, ติดตั้ง, จัดทำ, จัดเตรียม, เตรียม, ตัด, เย็บ, ผัด, ปรุง, ตกแต่ง
        * ส่งเสริม/ขาย: จำหน่าย, ขาย, ประชาสัมพันธ์, โฆษณา, บริการ, ให้คำปรึกษา
      - หากภาพรวมงานย่อยสอดคล้องกับพูล ให้ระบุรหัสใน \`subjectTaskId\` ของงานย่อย
      - หาก "ขั้นตอนการปฏิบัติงาน (step)" ใด มีลักษณะคล้ายคลึงกับงานใดในพูลวิชา ให้ระบุรหัสนั้นลงใน \`subjectTaskId\` ของขั้นตอนนั้นๆ ทันที
      - **กฎเหล็กเรื่องรหัส (subjectTaskId)**: ต้องตอบเป็นรหัสงานย่อยตามข้อมูลในพูลวิชาเท่านั้น (เช่น A1-1 หรือ B2-2) **ห้ามตอบรหัสงานหลักแบบกว้างๆ (เช่น A1)** ห้ามมีข้อความอื่นปนมาเด็ดขาด` : `2. ไม่มีข้อมูลพูลสมรรถนะ ให้สร้างรหัส Mapping สมมติขึ้นมาเอง`}
      3. กำหนดระดับ (1-3) K,S,A,Ap ตามมาตรฐาน v5.0
      4. การเขียน "จุดประสงค์เชิงพฤติกรรม" (objectives) สำหรับ K, S, A, Ap ต้องใช้ "คำกริยาที่วัดผลได้" ห้ามใช้คำว่า รู้จัก, เข้าใจ, ทราบ, รู้
      5. **กฎเหล็กการตั้งชื่องาน**: ชื่องานย่อย (\`workplaceName\`) และ ขั้นตอนการปฏิบัติงาน (\`step_text\`) **ต้องเป็นชื่อการปฏิบัติงานและขึ้นต้นด้วยคำกริยา (Action Verb) เสมอ** (เช่น เตรียม, ผัด, ปรุง, จัดตกแต่ง, ประกอบ, ตรวจสอบ, บำรุงรักษา)
         - **ห้าม** ตั้งชื่องานเป็นสถานที่, พื้นที่, หรือคำนามเฉยๆ เด็ดขาด (เช่น ห้ามตอบ "ห้องครัว", "พื้นที่เตรียมอาหาร", "อุปกรณ์")
         - **ห้าม** มีคำว่า "การ", "ความ", "ศึกษา", "เรียนรู้", "ทฤษฎี"
      6. งานปฏิบัติการ ต้องมีขั้นตอนแรกคือ "จัดเตรียมเครื่องมือ/วัตถุดิบ" และขั้นตอนสุดท้ายคือ "จัดเก็บและทำความสะอาด" เสมอ
      7. ระบุ "สื่อ/อุปกรณ์" (equipment) ที่ต้องใช้ในแต่ละขั้นตอน`;
      const generationConfig = { responseSchema: { type: "OBJECT", properties: { subTasks: { type: "ARRAY", items: { type: "OBJECT", properties: { subjectTaskId: { type: "STRING" }, workplaceName: { type: "STRING" }, detailed_steps: { type: "ARRAY", items: { type: "OBJECT", properties: { subjectTaskId: { type: "STRING" }, step_text: { type: "STRING" }, objectives: { type: "OBJECT", properties: { k: { type: "STRING" }, s: { type: "STRING" }, a: { type: "STRING" }, ap: { type: "STRING" } } }, levels: { type: "OBJECT", properties: { k: { type: "INTEGER" }, s: { type: "INTEGER" }, a: { type: "INTEGER" }, ap: { type: "INTEGER" } } }, equipment: { type: "STRING" } } } } } } } } } };

      const result = await callAI({ contents: [{ parts: [{ text: `วิเคราะห์งานปฏิบัติสำหรับ: ${taskToAnalyze.name}` }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig });

      const newSubTasks = (result.subTasks || []).map((st, i) => {
        const safeSubTaskId = extractValidTaskIds(st.subjectTaskId);
        return {
          ...st, id: safeSubTaskId || `W${tIdx}-${i + 1}`,
          name: cleanTaskName(pool.find(p => p.id === safeSubTaskId)?.name || st.workplaceName),
          workplaceName: cleanTaskName(st.workplaceName),
          subjectId: safeSubTaskId ? safeSubTaskId.split('-')[0] : 'W',
          hours: 10,
          detailed_steps: (st.detailed_steps || []).map(step => ({ ...step, subjectTaskId: extractValidTaskIds(step.subjectTaskId) }))
        };
      });

      setWorkplaceMainTasks(prev => prev.map(t => t.id === taskId ? { ...t, subTasks: newSubTasks, isAnalyzing: false } : t));
      showStatus("วิเคราะห์งานสถานประกอบการสำเร็จ");
    } catch (e) {
      showStatus("ขัดข้อง: " + e.message);
      setWorkplaceMainTasks(prev => prev.map(t => t.id === taskId ? { ...t, isAnalyzing: false } : t));
    }
  };
  const analyzeSingleWorkplaceSubtask = async (mIdx, sIdx) => {
    const activeKey = config.aiProvider === 'openai' ? config.openaiApiKey : config.aiProvider === 'claude' ? config.claudeApiKey : config.aiProvider === 'deepseek' ? config.deepseekApiKey : (config.userApiKey || apiKey);
    if (!activeKey?.trim() && config.aiProvider !== 'gemini') return showStatus(`กรุณาใส่ API Key ของ ${config.aiProvider} ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน`);
    if (config.aiProvider === 'gemini' && !config.userApiKey?.trim() && !apiKey) return showStatus("กรุณาใส่ Gemini API Key ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน");

    const mainTask = workplaceMainTasks[mIdx];
    const subTask = mainTask.subTasks[sIdx];
    if (!subTask.workplaceName) return showStatus("กรุณาระบุชื่องานย่อยก่อนวิเคราะห์ขั้นตอน");

    // เปิดโหมดโหลดหมุนๆ เฉพาะปุ่มของงานย่อยนี้
    setWorkplaceMainTasks(prev => {
      const next = [...prev];
      next[mIdx].subTasks[sIdx].isAnalyzing = true;
      return next;
    });

    const analyzed = subjectsRef.current.filter(s => s.isAnalyzed);
    const pool = analyzed.flatMap(s => (s.mainTasks || []).flatMap(mt => mt.subTasks || []));

    try {
      const systemPrompt = `วิเคราะห์งานย่อย: "${subTask.workplaceName}" (ซึ่งเป็นส่วนหนึ่งของงานหลัก: "${mainTask.name}")
      หน้าที่ของคุณคือเขียน "ขั้นตอนการปฏิบัติงาน" (Performance Steps) ให้ละเอียดและครบถ้วนที่สุดตามลำดับการทำงานจริง (ประมาณ 3-7 ขั้นตอน) พร้อมกำหนดจุดประสงค์ K,S,A,Ap
      ${pool.length > 0 ? `**สำคัญมาก (การจับคู่รหัส Mapping ด้วยลักษณะงาน)**: นำ "ขั้นตอนการปฏิบัติงาน" มาพิจารณาเปรียบเทียบกับพูลสมรรถนะวิชา: ${JSON.stringify(pool.map(t => ({ id: t.id, name: t.name })))}
      - หาก "ขั้นตอนการปฏิบัติงาน (step)" ใด มีลักษณะคล้ายคลึงกับงานใดในพูลวิชา ให้ระบุรหัสนั้นลงใน \`subjectTaskId\` ของขั้นตอนนั้นๆ ทันที
      - ต้องตอบเป็นรหัสงานย่อยตามข้อมูลในพูลวิชาเท่านั้น (เช่น A1-1 หรือ B2-2) ห้ามตอบรหัสงานหลักกว้างๆ` : `ไม่มีข้อมูลพูลสมรรถนะ ให้สร้างรหัส Mapping สมมติขึ้นมาเอง`}
      - กำหนดระดับ (1-3) K,S,A,Ap ตามมาตรฐาน v5.0
      - การเขียน "จุดประสงค์เชิงพฤติกรรม" (objectives) สำหรับ K, S, A, Ap ต้องใช้ "คำกริยาที่วัดผลได้" ห้ามใช้คำว่า รู้จัก, เข้าใจ, ทราบ, รู้
      - ชื่องานย่อย/ขั้นตอน ต้องขึ้นต้นด้วยคำกริยา ห้ามมีคำว่า "การ", "ความ", "ศึกษา", "เรียนรู้", "ทฤษฎี" และห้ามเป็นสถานที่
      - งานปฏิบัติการ ต้องมีขั้นตอนแรกคือ "จัดเตรียมเครื่องมือ/วัตถุดิบ" และขั้นตอนสุดท้ายคือ "จัดเก็บและทำความสะอาด" เสมอ
      - ระบุ "สื่อ/อุปกรณ์" (equipment) ที่ต้องใช้ในแต่ละขั้นตอน`;

      const generationConfig = {
        responseSchema: {
          type: "OBJECT",
          properties: {
            detailed_steps: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  subjectTaskId: { type: "STRING" },
                  step_text: { type: "STRING" },
                  objectives: { type: "OBJECT", properties: { k: { type: "STRING" }, s: { type: "STRING" }, a: { type: "STRING" }, ap: { type: "STRING" } } },
                  levels: { type: "OBJECT", properties: { k: { type: "INTEGER" }, s: { type: "INTEGER" }, a: { type: "INTEGER" }, ap: { type: "INTEGER" } } },
                  equipment: { type: "STRING" }
                }
              }
            }
          }
        }
      };

      const result = await callAI({ contents: [{ parts: [{ text: `วิเคราะห์ขั้นตอนปฏิบัติงานและจุดประสงค์สำหรับงานย่อย: ${subTask.workplaceName}` }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig });

      setWorkplaceMainTasks(prev => {
        const next = [...prev];
        // นำขั้นตอนใหม่ที่ AI คิดมาใส่แทนที่เดิมทั้งหมด
        next[mIdx].subTasks[sIdx].detailed_steps = (result.detailed_steps || []).map(step => ({
          ...step,
          subjectTaskId: extractValidTaskIds(step.subjectTaskId)
        }));
        next[mIdx].subTasks[sIdx].isAnalyzing = false;
        return next;
      });
      showStatus("วิเคราะห์จุดประสงค์และขั้นตอนของงานย่อยสำเร็จ");
    } catch (e) {
      showStatus("ขัดข้อง: " + e.message);
      setWorkplaceMainTasks(prev => {
        const next = [...prev];
        next[mIdx].subTasks[sIdx].isAnalyzing = false;
        return next;
      });
    }
  };
  const updateWorkplaceSubtask = (mIdx, sIdx, field, value) => setWorkplaceMainTasks(prev => { const next = [...prev]; next[mIdx].subTasks[sIdx][field] = value; return next; });
  const removeWorkplaceSubtask = (mIdx, sIdx) => { if (!window.confirm("ต้องการลบงานย่อยนี้ใช่หรือไม่?")) return; setWorkplaceMainTasks(prev => { const next = [...prev]; next[mIdx].subTasks.splice(sIdx, 1); return next; }); };
  const addWorkplaceSubtaskLocal = (mIdx) => {
    setWorkplaceMainTasks(prev => {
      const next = [...prev]; const tIdx = mIdx + 1; const existingSubTasks = next[mIdx].subTasks || [];
      let maxSuffix = 0;
      existingSubTasks.forEach(st => { const parts = String(st.id).split('-'); if (parts.length > 1) { const suffix = parseInt(parts[parts.length - 1], 10); if (!isNaN(suffix)) maxSuffix = Math.max(maxSuffix, suffix); } });
      const newSuffix = maxSuffix + 1;
      next[mIdx].subTasks.push({ id: `W${tIdx}-${newSuffix}`, workplaceName: '', name: '-', subjectId: 'W', hours: 10, detailed_steps: [], isAnalyzing: false });
      next[mIdx].isConfirmed = false; return next;
    });
  };

  const updateWorkplaceStepField = (mIdx, sIdx, stepIdx, field, value) => setWorkplaceMainTasks(prev => { const next = [...prev]; next[mIdx].subTasks[sIdx].detailed_steps[stepIdx][field] = value; return next; });
  const removeWorkplaceStep = (mIdx, sIdx, stepIdx) => setWorkplaceMainTasks(prev => { const next = [...prev]; next[mIdx].subTasks[sIdx].detailed_steps.splice(stepIdx, 1); return next; });
  const addWorkplaceStepLocal = (mIdx, sIdx) => {
    setWorkplaceMainTasks(prev => {
      const next = [...prev];
      if (!next[mIdx].subTasks[sIdx].detailed_steps) next[mIdx].subTasks[sIdx].detailed_steps = [];
      next[mIdx].subTasks[sIdx].detailed_steps.push({ step_text: '', objectives: { k: 'ระบุพฤติกรรม', s: 'ระบุพฤติกรรม', a: 'ระบุพฤติกรรม', ap: 'ระบุพฤติกรรม' }, levels: { k: 1, s: 1, a: 1, ap: 1 }, equipment: 'ของจริง / คู่มือ', isAnalyzing: false });
      next[mIdx].isConfirmed = false; return next;
    });
  };

  const analyzeSingleWorkplaceStep = async (mIdx, sIdx, stepIdx) => {
    const activeKey = config.aiProvider === 'openai' ? config.openaiApiKey : config.aiProvider === 'claude' ? config.claudeApiKey : config.aiProvider === 'deepseek' ? config.deepseekApiKey : (config.userApiKey || apiKey);
    if (!activeKey?.trim() && config.aiProvider !== 'gemini') return showStatus(`กรุณาใส่ API Key ของ ${config.aiProvider} ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน`);
    if (config.aiProvider === 'gemini' && !config.userApiKey?.trim() && !apiKey) return showStatus("กรุณาใส่ Gemini API Key ในหน้า '๑. ตั้งค่า' ก่อนใช้งาน");

    const step = workplaceMainTasks[mIdx].subTasks[sIdx].detailed_steps[stepIdx];
    if (!step.step_text) return showStatus("กรุณาระบุขั้นตอนการทำงานก่อนวิเคราะห์");

    setWorkplaceMainTasks(prev => { const n = [...prev]; n[mIdx].subTasks[sIdx].detailed_steps[stepIdx].isAnalyzing = true; return n; });

    try {
      const systemPrompt = `วิเคราะห์ขั้นตอนการทำงาน: "${step.step_text}"
      กำหนดจุดประสงค์เชิงพฤติกรรม (K, S, A, Ap) ด้วย Action Verbs และระดับความสามารถ (1-3)
      **กฎเหล็ก**: "จุดประสงค์เชิงพฤติกรรม" ทุกข้อต้องขึ้นต้นด้วยคำกริยาที่วัดผลได้ ห้ามใช้คำว่า "รู้จัก", "เข้าใจ", "ทราบ", "รู้" โดยเด็ดขาด
      - K (ความรู้): เช่น บอก, ระบุ, อธิบาย, บรรยาย, คำนวณ
      - S (ทักษะ): เช่น ปฏิบัติ, สาธิต, สร้าง, ประกอบ, ถอด, ตรวจสอบ, วัดขนาด
      - A (เจตคติ): เช่น ยอมรับ, ให้ความร่วมมือ, ระมัดระวัง, รับผิดชอบ, ดูแลรักษา
      - Ap (ประยุกต์): เช่น ประยุกต์ใช้, แก้ปัญหา, วางแผน, ปรับปรุง, ตัดสินใจ
      - ระบุ "สื่อ/อุปกรณ์" (equipment) ที่ต้องใช้ในขั้นตอนนี้ให้ชัดเจน เขียนเป็นข้อๆ คั่นด้วย (,)`;

      const generationConfig = { responseSchema: { type: "OBJECT", properties: { objectives: { type: "OBJECT", properties: { k: { type: "STRING" }, s: { type: "STRING" }, a: { type: "STRING" }, ap: { type: "STRING" } } }, levels: { type: "OBJECT", properties: { k: { type: "INTEGER" }, s: { type: "INTEGER" }, a: { type: "INTEGER" }, ap: { type: "INTEGER" } } }, equipment: { type: "STRING" } } } };

      const result = await callAI({ contents: [{ parts: [{ text: `วิเคราะห์ขั้นตอน: ${step.step_text}` }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig });

      setWorkplaceMainTasks(prev => {
        const next = [...prev];
        next[mIdx].subTasks[sIdx].detailed_steps[stepIdx].objectives = result.objectives || step.objectives;
        next[mIdx].subTasks[sIdx].detailed_steps[stepIdx].levels = result.levels || step.levels;
        next[mIdx].subTasks[sIdx].detailed_steps[stepIdx].equipment = result.equipment || step.equipment || 'ของจริง / คู่มือ';
        next[mIdx].subTasks[sIdx].detailed_steps[stepIdx].isAnalyzing = false;
        return next;
      });
      showStatus("วิเคราะห์ขั้นตอนสำเร็จ");
    } catch (e) {
      showStatus("ขัดข้อง: " + e.message);
      setWorkplaceMainTasks(prev => { const n = [...prev]; n[mIdx].subTasks[sIdx].detailed_steps[stepIdx].isAnalyzing = false; return n; });
    }
  };

  const toggleConfirmWorkplaceTask = (mIdx) => {
    setWorkplaceMainTasks(prev => { const next = [...prev]; next[mIdx].isConfirmed = !next[mIdx].isConfirmed; return next; });
    if (!workplaceMainTasks[mIdx].isConfirmed) showStatus("ยืนยันข้อมูลเรียบร้อย นำไปจัดทำรายงานได้");
  };

  const totalTrainingHours = useMemo(() => {
    return (Number(config.hoursPerDay) || 0) * (Number(config.daysPerWeek) || 0) * (Number(config.weeks) || 0);
  }, [config.hoursPerDay, config.daysPerWeek, config.weeks]);

  const trainingDuration = useMemo(() => {
    if (!config.startDate || !config.endDate) return null;
    const start = new Date(config.startDate); const end = new Date(config.endDate);
    if (isNaN(start) || isNaN(end) || end <= start) return null;
    const diffMs = end - start; const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7); const days = totalDays % 7;
    return { weeks, days, totalDays };
  }, [config.startDate, config.endDate]);

  const trainingWeeksWarning = useMemo(() => {
    if (!trainingDuration) return null;
    const isPvs = config.level.includes('ปวส'); const isPvc = config.level.includes('ปวช');
    const minWeeks = isPvs ? 15 : isPvc ? 18 : null;
    if (minWeeks && trainingDuration.weeks < minWeeks) {
      return `ระยะเวลาฝึกไม่ครบตามเกณฑ์! ระดับ${isPvs ? 'ปวส.' : 'ปวช.'} ต้องไม่น้อยกว่า ${minWeeks} สัปดาห์ (ปัจจุบัน ${trainingDuration.weeks} สัปดาห์ ${trainingDuration.days} วัน)`;
    }
    return null;
  }, [trainingDuration, config.level]);

  const workplaceTasksFlat = useMemo(() => {
    return workplaceMainTasks.flatMap((m, mIdx) => (m.subTasks || []).map((s, sIdx) => ({
      ...s, parentMainTaskName: cleanTaskName(m.name), mainTaskIndex: mIdx + 1, subTaskIndex: `${mIdx + 1}.${sIdx + 1}`
    })));
  }, [workplaceMainTasks]);

  const unmappedTasks = useMemo(() => {
    const allSubTasks = subjects.filter(s => s.isAnalyzed).flatMap(s => (s.mainTasks || []).flatMap(mt => (mt.subTasks || []).map(st => ({
      ...st, subjectId: s.id, subjectName: s.name, mainTaskName: cleanTaskName(mt.name), mainTaskId: mt.id
    }))));

    const mappedIdsSet = new Set();
    workplaceTasksFlat.forEach(wt => {
      if (wt.id) String(wt.id).split(',').forEach(id => mappedIdsSet.add(id.trim().toUpperCase()));
      if (wt.detailed_steps) {
        wt.detailed_steps.forEach(step => { if (step.subjectTaskId) String(step.subjectTaskId).split(',').forEach(id => mappedIdsSet.add(id.trim().toUpperCase())); });
      }
    });

    return allSubTasks.filter(st => !mappedIdsSet.has(String(st.id).trim().toUpperCase()));
  }, [subjects, workplaceTasksFlat]);

  const analyzedSubjectNames = useMemo(() => {
    const names = subjects.filter(s => s.isAnalyzed).map(s => `${s.code} ${s.name}`);
    return names.length > 0 ? names.join(', ') : '................';
  }, [subjects]);

  const exportToWord = (elementId, filename) => {
    const content = document.getElementById(elementId);
    if (!content) return;
    const isLandscape = content.classList.contains('Section2');
    const sectionClass = isLandscape ? 'Section2' : 'Section1';
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        @page Section1 { size: 21.0cm 29.7cm; margin: 1.2cm; }
        @page Section2 { size: 29.7cm 21.0cm; margin: 1.0cm; mso-page-orientation: landscape; }
        div.Section1 { page: Section1; }
        div.Section2 { page: Section2; }
        body, p, div, span, td, th { font-family: 'TH Sarabun PSK', 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; }
        table { border-collapse: collapse; width: 100%; border: 1px solid black; margin-bottom: 10px; font-size: 16pt; }
        th, td { border: 1px solid black; padding: 4px; vertical-align: top; }
        .text-center { text-align: center; } .font-bold { font-weight: bold; }
        .page-break { page-break-after: always; }
        .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; height: 140px; text-align: left; padding: 5px; font-weight: bold; }
        .report-header { line-height: 1.6; margin-bottom: 15px; }
        h2 { font-size: 18pt; font-weight: bold; }
      </style></head><body><div class="${sectionClass}">`;
    const footer = "</div></body></html>";
    const html = header + content.innerHTML + footer;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename + '.doc'; link.click();
  };
  const formatNumberedText = (text) => {
    if (!text) return '................................................................................................\n................................................................................................';
    // แยกข้อความเมื่อเจอตัวเลข 1-2 หลักที่ตามด้วยจุด (เช่น 1., 2., 10.) เพื่อบังคับขึ้นบรรทัดใหม่
    const parts = text.split(/(?=\d{1,2}\.)/g).filter(p => p.trim());
    if (parts.length <= 1) return <div className="whitespace-pre-line">{text}</div>;
    return (
      <div className="space-y-1.5 mt-1">
        {parts.map((part, index) => <div key={index} className="text-left">{part.trim()}</div>)}
      </div>
    );
  };

  // ค้นหา const setupFields = [ ... ]; และเปลี่ยนเป็นแบบนี้:
  const isWorkplaceTrainer = currentUserRole === 'ครูฝึกในสถานประกอบการ';
  const setupFields = [
    { k: 'collegeName', l: 'ชื่อวิทยาลัย', i: Building2, hideForTrainer: true },
    { k: 'companyName', l: 'ชื่อสถานประกอบการ', i: Briefcase },
    { k: 'level', l: 'ระดับชั้น', i: User },
    { k: 'fieldOfStudy', l: 'แผนกวิชา', i: BookOpen, hideForTrainer: true },
    { k: 'group', l: 'กลุ่มอาชีพ', i: User, hideForTrainer: true },
    { k: 'major', l: 'สาขาวิชา', i: BookOpen, hideForTrainer: true },
    { k: 'academicYear', l: 'ปีการศึกษา', i: Calendar },
    { k: 'startDate', l: 'วันเริ่มฝึก (ฝอ.1)', i: Clock },
    { k: 'endDate', l: 'วันสิ้นสุดฝึก (ฝอ.1)', i: Clock },
    { k: 'trainerName', l: 'ชื่อ-สกุล ครูฝึก', i: User },
    { k: 'trainerPosition', l: 'ตำแหน่งครูฝึก', i: Briefcase },
    { k: 'occupation', l: 'อาชีพ / ตำแหน่งงาน', i: HardHat },
    { k: 'department', l: 'ส่วนงาน / จุดฝึก', i: Building2 }
  ].filter(f => !(isWorkplaceTrainer && f.hideForTrainer)); // กรองฟิลด์ที่ไม่ต้องการออกถ้าเป็นครูฝึก

  // --- Dynamic Navigation Items (Role Based) ---
  const isAdminUser = isDeveloper || currentUserRole === 'admin' || currentUserEmail.toLowerCase() === 'sukritpol.ch@gmail.com';

  const navItems = [
    { id: 'setup', baseLabel: 'ตั้งค่า', i: Settings },
    ...(!isWorkplaceTrainer ? [
      { id: 'findsubject', baseLabel: 'ค้นหาวิชา', href: 'https://tools.kruarm.net/find-subject.html', i: FileSearch },
      { id: 'subjects', baseLabel: 'วิเคราะห์รายวิชา', i: GraduationCap }
    ] : []),
    { id: 'workplace', baseLabel: 'งานบริษัท', i: Building2 },
    { id: 'reports', baseLabel: 'รายงาน', i: FileText },
    { id: 'evaluation', baseLabel: 'แบบประเมิน', i: ClipboardCheck },
    { id: 'share', baseLabel: 'แชร์แผนฝึก', i: UploadCloud },
    { id: 'cloud', baseLabel: 'คลังงาน', i: Cloud },
    { id: 'feedback', baseLabel: 'ประเมินระบบ', i: Star },
    ...(isAdminUser ? [{ id: 'admin', baseLabel: 'จัดการผู้ใช้', i: Users }] : [])
  ].map((item, index) => ({
    ...item,
    l: item.href || item.id === 'admin' ? item.baseLabel : `${['๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙', '๑๐', '๑๑'][index] || index + 1}. ${item.baseLabel}`
  }));
  // ==========================================
  // VIEW RENDERS
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center font-serif p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-500 z-10 relative">
          <div className="flex justify-center mb-6">
            <img src="https://lh3.googleusercontent.com/d/1-VA1x7tJnIeT9gTyeID5jgcaKgGaz2Z9" alt="Logo" className="h-24 w-auto object-contain drop-shadow-xl" />
          </div>

          <h2 className="text-3xl font-black text-center text-indigo-900 mb-1 uppercase tracking-tighter">ระบบจัดทำแผนฝึกอาชีพ <span className="text-indigo-600">(ทวิภาคี)</span></h2>
          <p className="text-center text-slate-500 text-[11px] mb-6 font-bold tracking-widest uppercase">ระบบจัดทำแผนฝึกระบบทวิภาคีออนไลน์</p>

          <div className="flex justify-between text-[11px] text-indigo-700 mb-8 bg-indigo-50 border border-indigo-100 p-3 rounded-2xl font-bold shadow-inner">
            <div className="flex items-center gap-1.5"><User size={14} /> ผู้ใช้งานทั้งหมด:<span className="text-sm font-black ml-1">{isLoadingData ? '...' : stats.total}</span></div>
            <div className="flex items-center gap-1.5 text-blue-700"><Clock size={14} /> วันนี้:<span className="text-sm font-black ml-1">{isLoadingData ? '...' : stats.today}</span></div>
          </div>

          {loginMode === 'login' && (
            <form onSubmit={submitLogin} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="อีเมล (Email)" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm" value={authData.email} onChange={(e) => handleAuthChange('email', e.target.value)} />
                </div>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" placeholder="รหัสผ่าน (Password)" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm" value={authData.password} onChange={(e) => handleAuthChange('password', e.target.value)} />
                </div>
              </div>

              <div className="text-right">
                <button type="button" onClick={() => { setLoginMode('forgot_password'); setLoginError(''); }} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">ลืมรหัสผ่าน?</button>
              </div>

              {loginError && <p className="text-red-500 text-xs text-center font-bold animate-pulse bg-red-50 p-2 rounded-xl border border-red-100">{loginError}</p>}

              <button type="submit" disabled={isLoadingData} className={`w-full text-white py-3.5 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider mt-6 ${isLoadingData ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}>
                {isLoadingData ? <Loader2 className="animate-spin" size={18} /> : 'เข้าสู่ระบบ'} {!isLoadingData && <ChevronRight size={18} />}
              </button>
              <div className="text-center mt-6">
                <button type="button" onClick={() => { setLoginMode('register'); setLoginError(''); }} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">ยังไม่มีบัญชีผู้ใช้งาน? <span className="underline">ลงทะเบียนที่นี่</span></button>
              </div>
            </form>
          )}

          {loginMode === 'register' && (
            <form onSubmit={submitRegister} className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-xs font-black text-indigo-800 border-b pb-2 mb-2 uppercase">ข้อมูลบัญชี</p>
              <input type="email" placeholder="อีเมล (Email)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={authData.email} onChange={(e) => handleAuthChange('email', e.target.value)} required />
              <input type="password" placeholder="รหัสผ่าน (Password)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={authData.password} onChange={(e) => handleAuthChange('password', e.target.value)} required />

              <p className="text-xs font-black text-indigo-800 border-b pb-2 pt-4 mb-2 uppercase">ข้อมูลส่วนตัว</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="ชื่อ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={authData.firstName} onChange={(e) => handleAuthChange('firstName', e.target.value)} required />
                <input type="text" placeholder="นามสกุล" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={authData.lastName} onChange={(e) => handleAuthChange('lastName', e.target.value)} required />
              </div>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs text-slate-600" value={authData.role} onChange={(e) => handleAuthChange('role', e.target.value)}>
                <option value="ครู">ตำแหน่ง: ครู</option>
                <option value="ครูฝึกในสถานประกอบการ">ตำแหน่ง: ครูฝึกในสถานประกอบการ</option>
                <option value="ผู้บริหาร">ตำแหน่ง: ผู้บริหาร</option>
                <option value="เจ้าหน้าที่">ตำแหน่ง: เจ้าหน้าที่</option>
                <option value="ศึกษานิเทศก์">ตำแหน่ง: ศึกษานิเทศก์</option>
              </select>

              {authData.role === 'ครูฝึกในสถานประกอบการ' ? (
                <input type="text" placeholder="ชื่อสถานประกอบการ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={authData.companyName} onChange={(e) => handleAuthChange('companyName', e.target.value)} required />
              ) : (
                <input type="text" placeholder="วิทยาลัย" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={authData.college} onChange={(e) => handleAuthChange('college', e.target.value)} required />
              )}

              <input type="text" placeholder="แผนกวิชา (ถ้ามี)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs" value={authData.department} onChange={(e) => handleAuthChange('department', e.target.value)} />

              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs text-slate-600" value={authData.province} onChange={(e) => handleAuthChange('province', e.target.value)} required>
                <option value="">-- เลือกจังหวัด --</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <div className="bg-indigo-50 p-4 rounded-xl mt-4 border border-indigo-100">
                <p className="text-[11px] font-bold text-indigo-900 mb-3">ท่านได้ผ่านการอบรมหรือพัฒนาการใช้ระบบวิเคราะห์แล้วหรือไม่? <span className="text-red-500">*</span></p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="trained" className="w-4 h-4 text-indigo-600" checked={authData.hasTrained === true} onChange={() => handleAuthChange('hasTrained', true)} />
                    <span className="text-xs font-bold text-slate-700">ใช่ ผ่านการอบรมแล้ว</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="trained" className="w-4 h-4 text-indigo-600" checked={authData.hasTrained === false} onChange={() => handleAuthChange('hasTrained', false)} />
                    <span className="text-xs font-bold text-slate-700">ยังไม่เคยอบรม</span>
                  </label>
                </div>
              </div>

              {loginError && <p className="text-red-500 text-xs text-center font-bold mt-2 bg-red-50 p-2 rounded-xl">{loginError}</p>}

              <button type="submit" disabled={isLoadingData} className={`w-full text-white py-3.5 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider mt-6 ${isLoadingData ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}>
                {isLoadingData ? <Loader2 className="animate-spin" size={18} /> : <BadgeCheck size={18} />} ยืนยันการลงทะเบียน
              </button>
              <div className="text-center mt-4 pb-2">
                <button type="button" onClick={() => { setLoginMode('login'); setLoginError(''); }} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"><ChevronRight size={14} className="inline" /> มีบัญชีอยู่แล้ว กลับไปหน้าล็อกอิน</button>
              </div>
            </form>
          )}

          {loginMode === 'forgot_password' && (
            <form onSubmit={submitForgotPassword} className="space-y-4">
              <p className="text-sm font-black text-indigo-800 border-b pb-2 mb-2 uppercase text-center">กู้คืนรหัสผ่าน</p>
              <p className="text-[11px] text-slate-500 text-center font-bold mb-4 px-4 leading-relaxed">ระบบจะทำการค้นหาและส่งรหัสผ่านไปยังอีเมลที่คุณใช้ลงทะเบียน</p>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" placeholder="กรอกอีเมล (Email)..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm" value={authData.email} onChange={(e) => handleAuthChange('email', e.target.value)} required />
              </div>

              {loginError && <p className="text-red-500 text-xs text-center font-bold animate-pulse bg-red-50 p-2 rounded-xl border border-red-100">{loginError}</p>}

              <button type="submit" disabled={isLoadingData} className={`w-full text-white py-3.5 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider mt-6 ${isLoadingData ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}>
                {isLoadingData ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                {isLoadingData ? 'กำลังส่งข้อมูล...' : 'ส่งรหัสผ่านไปยังอีเมล'}
              </button>

              <div className="text-center mt-4">
                <button type="button" onClick={() => { setLoginMode('login'); setLoginError(''); }} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                  <ChevronRight size={14} className="inline" /> กลับไปหน้าล็อกอิน
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2 z-20">
          <img src="https://lh3.googleusercontent.com/d/1ztoak1L8nYG92dXgKrU0XiCUMrAzPQPe" alt="นายสุกฤษฏิ์พล โชติอรรฐพล" className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-2xl self-center" />
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-2xl text-right shadow-lg max-w-[240px] border border-slate-100">
            <p className="text-xs font-black text-slate-800 leading-tight whitespace-nowrap">นายสุกฤษฏิ์พล โชติอรรฐพล</p>
            <p className="text-[10px] text-indigo-700 font-bold leading-tight mt-0.5">ศึกษานิเทศก์ชำนาญการพิเศษ</p>
            <p className="text-[10px] text-slate-600 leading-tight whitespace-nowrap">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคเหนือ</p>
          </div>
        </div>

        <div className="mt-10 text-center text-slate-500 text-[10px] flex flex-col items-center gap-1 opacity-80 z-10 relative">
          <p className="font-bold">© 2026 สุกฤษฏิ์พล โชติอรรฐพล. All Rights Reserved.</p>
          <p>พัฒนาโดย <span className="text-indigo-900 font-black text-xs">นายสุกฤษฏิ์พล โชติอรรฐพล</span></p>
          <p>ศึกษานิเทศก์ชำนาญการพิเศษ ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคเหนือ</p>
          <button type="button" onClick={() => setShowTermsModal(true)} className="text-indigo-600 underline hover:text-indigo-800 mt-1 font-bold cursor-pointer">ข้อตกลงและเงื่อนไข (Terms of Service)</button>
        </div>

        {showTermsModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 text-left">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-300 border-t-8 border-indigo-600">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-black text-indigo-900 uppercase">ข้อตกลงและเงื่อนไข (Terms of Service)</h3>
                <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-serif">
                <div className="bg-indigo-50 p-4 rounded-xl text-center font-black text-indigo-800">© 2026 สุกฤษฏิ์พล โชติอรรฐพล. All Rights Reserved.</div>
                <p>เนื้อหา ซอร์สโค้ด กราฟิก โลโก้ และซอฟต์แวร์ทั้งหมดในเว็บไซต์นี้ เป็นทรัพย์สินของผู้พัฒนาแต่เพียงผู้เดียว และได้รับความคุ้มครองตามกฎหมายลิขสิทธิ์</p>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-2 border-l-4 border-indigo-500 pl-3">ข้อห้าม</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>ห้ามคัดลอก (Copy), ทำซ้ำ (Reproduce) หรือดัดแปลง (Modify)</strong> ส่วนใดส่วนหนึ่งของระบบ</li>
                    <li><strong>ห้ามทำวิศวกรรมย้อนกลับ (Reverse Engineering)</strong> เพื่อดูซอร์สโค้ด</li>
                    <li><strong>ห้ามนำไปเผยแพร่ต่อ (Distribute)</strong> เพื่อหวังผลกำไรโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-2 border-l-4 border-indigo-500 pl-3">สิทธิ์การใช้งาน</h4>
                  <p>ผู้พัฒนาอนุญาตให้ผู้ใช้เข้าถึงและใช้งานระบบเพื่อวัตถุประสงค์ <strong>ในการจัดทำแผนฝึกอาชีพและฝึกประสบการณ์สมรรถนะอาชีพเท่านั้น</strong> โดยเป็นการอนุญาตแบบจำกัด และไม่สามารถโอนสิทธิ์ให้ผู้อื่นได้</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-2 border-l-4 border-indigo-500 pl-3">การจำกัดความรับผิดชอบ</h4>
                  <p>ผู้พัฒนาจะไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการใช้งานระบบ หรือการที่ไม่สามารถเข้าใช้งานระบบได้ในบางช่วงเวลา</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-2 border-l-4 border-indigo-500 pl-3">การละเมิดข้อตกลง</h4>
                  <p>หากตรวจพบการละเมิดข้อตกลง เช่น การพยายามคัดลอกระบบ ผู้พัฒนามีสิทธิ์ระงับการเข้าใช้งานทันทีโดยไม่ต้องแจ้งให้ทราบล่วงหน้า และจะดำเนินคดีตามกฎหมายจนถึงที่สุด</p>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200 text-center">
                <button onClick={() => setShowTermsModal(false)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase">ปิดหน้าต่าง</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans text-slate-900 pb-20 font-serif transition-colors duration-500 ${activeTab === 'cloud' ? 'bg-slate-800' : 'bg-slate-50'}`}>

      {/* Security Alert Overlay */}
      {showSecurityAlert && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-red-700 text-white font-serif select-none">
          <div className="text-center px-8 max-w-lg w-full">
            <div className="text-8xl mb-4">🚨</div>
            <h1 className="text-3xl font-black uppercase tracking-widest mb-3 animate-pulse">ตรวจพบการละเมิดความปลอดภัย</h1>
            <p className="text-lg font-bold mb-2 text-red-100">ตรวจพบการพยายามเข้าถึงซอร์สโค้ดของระบบ</p>
            <p className="text-sm text-red-200 mb-8">หากท่านเป็นผู้พัฒนาระบบ กรุณากรอก <strong>รหัสผู้พัฒนา</strong> เพื่อยกเลิกการออกจากระบบ</p>

            <input
              type="password"
              placeholder="กรอกรหัสผู้พัฒนา..."
              value={securityDevCode}
              onChange={(e) => {
                const val = e.target.value;
                setSecurityDevCode(val);
                if (val === '@Sukritpol2528') {
                  if (securityTimerRef.current) clearInterval(securityTimerRef.current);
                  violationCountRef.current = 0;
                  setShowSecurityAlert(false);
                  setIsDeveloper(true);
                  setSecurityDevCode('');
                }
              }}
              className="w-full px-4 py-3 rounded-xl text-slate-900 text-center text-lg font-bold bg-white border-4 border-red-300 focus:outline-none focus:border-white mb-6 shadow-lg"
              autoFocus
            />
            <div className="text-6xl font-black mb-2 tabular-nums">{securityCountdown}</div>
            <p className="text-red-200 text-sm font-bold">ออกจากระบบอัตโนมัติในอีก <span className="text-white font-black text-lg">{securityCountdown}</span> วินาที</p>
            <div className="mt-8 w-full bg-red-900 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${(securityCountdown / 3) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* แถบชื่อระบบ */}
      <div className="bg-indigo-700 text-white py-3 px-4 text-center text-base md:text-lg font-black shadow-md font-serif z-[70] relative flex items-center justify-center gap-2">
        <ClipboardCheck size={22} className="shrink-0" />
        <span>ระบบวิเคราะห์และจัดทำแผนฝึกอาชีพ(ทวิภาคี)</span>
        {(isDeveloper || currentUserRole === 'admin') && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shrink-0 ml-2"><Code size={10} /> DEV/ADMIN MODE</span>}      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 min-h-[64px] py-2 flex items-center justify-between px-2 md:px-4 shadow-sm overflow-visible gap-4">

        <div className="hidden lg:flex flex-1 gap-2 bg-slate-100 p-1.5 rounded-2xl flex-wrap">
          {navItems.map(t => (
            <button key={t.id} onClick={() => t.href ? window.open(t.href, '_blank', 'noopener,noreferrer') : setActiveTab(t.id)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${activeTab === t.id ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-500 hover:text-indigo-600'}`}>
              <t.i size={16} /> {t.l}
            </button>
          ))}
        </div>

        {/* ใส่ flex-shrink-0 เพื่อป้องกันไม่ให้ปุ่มฝั่งขวาถูกบีบ */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <input type="file" accept=".dvedata,.jobcompany" ref={fileInputRef} onChange={handleFileUploadLocal} className="hidden" />
            <button onClick={() => fileInputRef.current.click()} className="p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 transition duration-300 flex items-center gap-1 text-xs font-bold bg-emerald-50 rounded-full px-3 md:px-4 border border-emerald-100" title="อัปโหลดไฟล์งานเดิมจากเครื่อง">
              <Upload size={16} />
              <span className="hidden xl:inline">โหลดงาน</span>
            </button>
            <button onClick={saveDataLocally} className="p-2 text-indigo-600 hover:text-white hover:bg-indigo-600 transition duration-300 flex items-center gap-1 text-xs font-bold bg-indigo-50 rounded-full px-3 md:px-4 border border-indigo-100" title="บันทึกงานลงเครื่อง">
              <Save size={16} />
              <span className="hidden xl:inline">เซฟงาน</span>
            </button>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 text-slate-400 hover:text-indigo-600 transition active:rotate-180 duration-500 bg-slate-100 rounded-full" title="รีเฟรชหน้าจอ"><RotateCcw size={16} /></button>
          <button onClick={initiateLogout} className="p-2 text-red-400 hover:text-white hover:bg-red-500 transition duration-300 flex items-center gap-1 text-xs font-bold bg-red-50 rounded-full px-3 md:px-4" title="ออกจากระบบ">
            <LogOut size={16} />
            <span className="hidden xl:inline">ออกจากระบบ</span>
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] bg-indigo-900 text-white px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 flex items-center gap-3">
          <Sparkles className="text-indigo-400" size={18} />
          <span className="text-sm font-bold">{statusMessage}</span>
        </div>
      )}

      {/* Modal Welcome */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300 border-t-8 border-indigo-600">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-4 rounded-full text-indigo-600"><Sparkles size={40} /></div>
            </div>
            <h3 className="text-xl font-black text-center text-indigo-900 mb-4 uppercase tracking-wider">ประกาศแจ้งการใช้งาน</h3>
            <div className="text-center text-sm text-slate-600 mb-8 font-bold leading-relaxed space-y-2">
              <p>ระบบนี้ถูกพัฒนาขึ้นเพื่อลดภาระงานของท่าน</p>
              <p>การวิเคราะห์ข้อมูลที่เกิดขึ้นจากระบบเป็นการวิเคราะห์ที่สร้างขึ้นจากข้อมูลที่ระบบได้รับ ภายใต้ข้อกำหนดที่ผู้พัฒนาสร้างขึ้น <span className="text-red-500 underline">ขอให้ท่านตรวจสอบ ก่อนนำไปใช้</span></p>
              <p className="text-indigo-700">หวังเป็นอย่างยิ่งว่าระบบนี้จะเป็นประโยชน์ต่อท่าน ขอขอบคุณ มา ณ โอกาสนี้</p>
            </div>
            <button onClick={() => setShowWelcomeModal(false)} className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase tracking-wider">
              รับทราบและเข้าสู่ระบบ
            </button>
          </div>
        </div>
      )}

      {/* Modal ยืนยันแจ้งลบข้อมูล */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteModalItem(null)}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-red-600 flex items-center gap-2"><Trash2 /> {isDeveloper ? 'ลบข้อมูลถาวร' : 'แจ้งลบข้อมูล'}</h3>
              <button onClick={() => setDeleteModalItem(null)} className="text-slate-400 hover:text-red-500 bg-slate-100 p-2 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <p className="text-sm font-bold text-slate-600 mb-4 leading-relaxed">
              {isDeveloper ? 'คุณกำลังจะลบข้อมูลของบริษัทต่อไปนี้ออกจากคลังกลางอย่างถาวร:' : 'คุณต้องการส่งคำขอเพื่อแจ้งลบข้อมูลของบริษัท:'} <br />
              <span className="text-red-600 text-base">{deleteModalItem.companyName}</span>
            </p>

            {!isDeveloper && (
              <textarea
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-serif focus:ring-2 focus:ring-red-500 outline-none mb-6 shadow-inner"
                rows="3" placeholder="กรุณาระบุเหตุผลที่ต้องการลบ (เช่น ข้อมูลซ้ำ, ข้อมูลผิดพลาด หรืออื่นๆ)..."
                value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
              ></textarea>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={submitDeleteRequest} disabled={isDeleting} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-black shadow-lg hover:bg-red-700 disabled:bg-slate-300 flex justify-center items-center gap-2 transition-all active:scale-95 text-sm">
                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />} {isDeveloper ? 'ยืนยันการลบถาวร' : 'ยืนยันการแจ้งลบ'}
              </button>
              <button onClick={() => setDeleteModalItem(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-black hover:bg-slate-200 transition-all text-sm">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Survey */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-center text-indigo-900 mb-2 uppercase">แบบประเมินความพึงพอใจ</h3>
            <p className="text-center text-sm text-slate-500 mb-6 font-bold">กรุณาให้คะแนนความพึงพอใจในการใช้งานระบบและข้อเสนอแนะเพื่อการพัฒนาต่อไป</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setSurveyRating(star)} className={`p-2 transition-all transform hover:scale-110 ${surveyRating >= star ? 'text-yellow-400' : 'text-slate-200'}`}>
                  <Star size={40} fill={surveyRating >= star ? "currentColor" : "none"} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            <textarea className="w-full p-4 border border-slate-200 rounded-2xl text-sm font-bold bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 mb-6 resize-none h-24" placeholder="ข้อเสนอแนะเพิ่มเติมเพื่อการพัฒนาระบบ (ไม่บังคับ)..." value={surveyFeedback} onChange={(e) => setSurveyFeedback(e.target.value)}></textarea>
            <div className="flex flex-col gap-3">
              <button onClick={finalizeLogoutAndSubmitSurvey} disabled={isSubmittingSurvey || surveyRating === 0} className={`w-full py-3.5 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase ${isSubmittingSurvey || surveyRating === 0 ? 'bg-indigo-300 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}>
                {isSubmittingSurvey ? <Loader2 className="animate-spin" /> : <ShieldCheck />} ส่งแบบประเมินและออกจากระบบ
              </button>
              <button onClick={skipSurveyAndLogout} className="w-full py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm">
                ข้ามการประเมินและออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal จัดการความซ้อนทับของข้อมูล */}
      {showDveConflictModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-300 border-t-8 border-amber-500">
            <div className="flex justify-center mb-4"><AlertCircle size={48} className="text-amber-500" /></div>
            <h3 className="text-xl font-black text-center text-slate-800 mb-2">พบข้อมูลงานสถานประกอบการซ้อนทับ</h3>
            <p className="text-center text-sm text-slate-500 mb-6 font-bold leading-relaxed">ท่านมีข้อมูลงานที่กำลังวิเคราะห์ค้างอยู่ และในไฟล์เซฟงานที่กำลังโหลดก็มีข้อมูลงานเช่นกัน<br />โปรดเลือกวิธีจัดการข้อมูล:</p>
            <div className="space-y-3">
              <button onClick={() => executeApplyDveData(pendingDveData, 'merge')} className="w-full py-3 px-4 bg-indigo-600 text-white rounded-2xl font-black shadow-md hover:bg-indigo-700 transition-all text-sm text-left flex flex-col items-start gap-1">
                <span className="flex items-center gap-2"><ListChecks size={16} /> 1. นำข้อมูลของท่านกับสถานประกอบการรวมกัน</span>
                <span className="text-[10px] font-normal opacity-80 pl-6 text-indigo-200">งานที่ทับซ้อนกันจะแสดงข้อความว่า "สอดคล้องกับ..." ต่อท้ายชื่อ</span>
              </button>
              <button onClick={() => executeApplyDveData(pendingDveData, 'overwrite')} className="w-full py-3 px-4 bg-slate-800 text-white rounded-2xl font-black shadow-md hover:bg-slate-900 transition-all text-sm text-left flex flex-col items-start gap-1">
                <span className="flex items-center gap-2"><FileDown size={16} /> 2. ใช้ข้อมูลงานในสถานประกอบการ (ไฟล์ใหม่)</span>
                <span className="text-[10px] font-normal opacity-80 pl-6 text-slate-300">ลบข้อมูลงานที่ทำค้างไว้บนหน้าจอ และใช้ข้อมูลจากไฟล์ที่อัปโหลดแทน</span>
              </button>
              <button onClick={() => executeApplyDveData(pendingDveData, 'keep_current')} className="w-full py-3 px-4 bg-emerald-600 text-white rounded-2xl font-black shadow-md hover:bg-emerald-700 transition-all text-sm text-left flex flex-col items-start gap-1">
                <span className="flex items-center gap-2"><Save size={16} /> 3. ใช้ข้อมูลเฉพาะของฉัน (ข้อมูลเดิม)</span>
                <span className="text-[10px] font-normal opacity-80 pl-6 text-emerald-200">โหลดเฉพาะข้อมูลอื่นๆ (วิชา/การตั้งค่า) และไม่แก้ไขข้อมูลงานบนหน้าจอ</span>
              </button>
              <button onClick={() => { setShowDveConflictModal(false); setPendingDveData(null); }} className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm text-center mt-2">
                ยกเลิกการโหลดไฟล์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันก่อนดาวน์โหลดรายงาน */}
      {showDownloadConfirm && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDownloadConfirm(null)}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {['eval_workplace', 'eval_supervision', 'dve1102'].includes(showDownloadConfirm) && workplaceTasksFlat.length === 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowDownloadConfirm(null)} className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 font-bold text-sm transition-colors"><X size={18} /> ยกเลิก</button>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">แบบประเมิน</span>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Upload size={36} /></div>
                  <div>
                    <p className="text-base font-black text-emerald-900 mb-1">ยังไม่มีข้อมูลแบบประเมิน</p>
                    <p className="text-xs font-bold text-emerald-700 mb-4">อัปโหลดไฟล์งานที่บันทึกไว้ หรือทำการวิเคราะห์งานใหม่</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <button onClick={() => setShowDownloadConfirm(null)} className="text-slate-400 hover:text-red-500 transition-colors" title="ยกเลิก"><X size={22} /></button>
                </div>
                <div className="flex justify-center mb-4"><div className="bg-amber-100 p-4 rounded-full text-amber-600"><AlertCircle size={40} /></div></div>
                <h3 className="text-xl font-black text-center text-slate-800 mb-2 uppercase">แจ้งเตือน</h3>
                <p className="text-center text-sm text-slate-500 mb-6 font-bold leading-relaxed">ขอให้คุณครูตรวจสอบความถูกต้อง<br />ของข้อมูลอีกครั้งครับ</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (showDownloadConfirm === 'reports') {
                        exportToWord('dve-all-area', isWorkplaceTrainer ? 'DVE_Reports_Workplace_Only' : 'DVE_Reports_Complete');
                      } else if (showDownloadConfirm === 'dve0402') exportToWord('dve-0402-area', 'DVE-04-02_วิเคราะห์งาน');
                      else if (showDownloadConfirm === 'dve0403') exportToWord('dve-0403-area', 'DVE-04-03_วิเคราะห์เทียบรายวิชา');
                      else if (showDownloadConfirm === 'dve0404') exportToWord('dve-0404-area', 'DVE-04-04_รายวิชาฝึก');
                      else if (showDownloadConfirm === 'dve0405') exportToWord('dve-0405-area', 'DVE-04-05_แผนฝึกตลอดหลักสูตร');
                      else if (showDownloadConfirm === 'dve0406') exportToWord('dve-0406-area', 'DVE-04-06_แผนฝึกรายหน่วย');
                      else if (showDownloadConfirm === 'eval_workplace') exportToWord('dve-eval-workplace-area', 'DVE_Eval_Workplace');
                      else if (showDownloadConfirm === 'eval_supervision') exportToWord('dve-supervision-area', 'DVE_Supervision');
                      else if (showDownloadConfirm === 'dve1102') exportToWord('dve-11-02-area', 'DVE_11_02_Summary');
                      setShowDownloadConfirm(null);
                    }}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase"
                  >
                    รับทราบและดาวน์โหลด
                  </button>
                  <button onClick={() => setShowDownloadConfirm(null)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 active:scale-95 transition-all text-sm">
                    ยกเลิก
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ADMIN TAB */}
        {activeTab === 'admin' && (isDeveloper || currentUserRole === 'admin') && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 font-serif">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-indigo-900 flex items-center gap-3"><ShieldCheck className="text-indigo-600" /> ระบบจัดการผู้ใช้งาน (Admin Panel)</h2>
                  <p className="text-xs text-slate-500 mt-1 font-bold">อนุมัติและลบผู้ใช้งานที่ลงทะเบียนในระบบ</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm border border-indigo-100">ผู้ใช้งานทั้งหมด: {dbUsers.length} คน</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-600 font-bold text-sm">
                      <th className="p-4 rounded-tl-xl">ชื่อ-สกุล</th>
                      <th className="p-4">อีเมล</th>
                      <th className="p-4">หน่วยงาน/วิทยาลัย</th>
                      <th className="p-4">ผ่านการอบรม?</th>
                      <th className="p-4 text-center">สถานะ</th>
                      <th className="p-4 text-center rounded-tr-xl">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbUsers.map((u, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{u.firstName} {u.lastName}</td>
                        <td className="p-4 text-slate-500 text-sm">{u.email}</td>
                        <td className="p-4 text-slate-600 text-sm">
                          {u.role === 'ครูฝึกในสถานประกอบการ' ? u.companyName : u.college}
                          <div className="text-[10px] text-slate-400 font-bold mt-1">{u.role}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${u.hasTrained === 'ใช่' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {u.hasTrained || 'ไม่ได้ระบุ'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.status === 'approved' ? 'bg-green-100 text-green-700' :
                            u.status?.toLowerCase() === 'hacker' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {u.status === 'approved' ? 'ใช้งานได้' : u.status?.toLowerCase() === 'hacker' ? 'Hacker (ระงับ)' : 'รออนุมัติ'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {u.status !== 'approved' && (
                              <button onClick={() => handleApproveUser(u.email)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">อนุมัติ</button>
                            )}
                            <button onClick={() => handleDeleteUser(u.email)} className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-200 hover:border-red-500">ลบ</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {dbUsers.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold">ไม่มีข้อมูลผู้ใช้งาน</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 font-serif">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black mb-8 text-indigo-700 underline underline-offset-8 uppercase font-serif">การตั้งค่าและกำหนดข้อมูลพื้นฐาน</h2>

              <div className="mb-8 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2"><Wand2 size={18} /> กรอก API Key ลงในช่อง</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-2"><Settings size={12} /> เลือกผู้ให้บริการ API Key </label>
                    <select
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm bg-white shadow-sm"
                      value={config.aiProvider || 'gemini'} onChange={e => setConfig({ ...config, aiProvider: e.target.value })}
                    >
                      <option value="gemini">Google Gemini (แนะนำ)</option>
                      <option value="openai">ChatGPT (OpenAI)</option>
                      <option value="claude">Claude (Anthropic)</option>
                      <option value="deepseek">DeepSeek</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-2"><Key size={12} /> API Key สำหรับ {config.aiProvider === 'openai' ? 'ChatGPT' : config.aiProvider === 'claude' ? 'Claude' : config.aiProvider === 'deepseek' ? 'DeepSeek' : 'Gemini'}</label>
                    {(!config.aiProvider || config.aiProvider === 'gemini') && (
                      <input type="password" placeholder="วาง Gemini API Key ที่นี่..." className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition font-bold shadow-inner text-sm font-serif bg-red-50 border-red-200 focus:ring-red-500 text-red-900 placeholder-red-300" value={config.userApiKey || ''} onChange={e => setConfig({ ...config, userApiKey: e.target.value })} />
                    )}
                    {config.aiProvider === 'openai' && (
                      <input type="password" placeholder="วาง OpenAI API Key (sk-...) ที่นี่..." className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition font-bold shadow-inner text-sm font-serif bg-emerald-50 border-emerald-200 focus:ring-emerald-500 text-emerald-900 placeholder-emerald-300" value={config.openaiApiKey || ''} onChange={e => setConfig({ ...config, openaiApiKey: e.target.value })} />
                    )}
                    {config.aiProvider === 'claude' && (
                      <input type="password" placeholder="วาง Anthropic API Key ที่นี่..." className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition font-bold shadow-inner text-sm font-serif bg-orange-50 border-orange-200 focus:ring-orange-500 text-orange-900 placeholder-orange-300" value={config.claudeApiKey || ''} onChange={e => setConfig({ ...config, claudeApiKey: e.target.value })} />
                    )}
                    {config.aiProvider === 'deepseek' && (
                      <input type="password" placeholder="วาง DeepSeek API Key ที่นี่..." className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition font-bold shadow-inner text-sm font-serif bg-blue-50 border-blue-200 focus:ring-blue-500 text-blue-900 placeholder-blue-300" value={config.deepseekApiKey || ''} onChange={e => setConfig({ ...config, deepseekApiKey: e.target.value })} />
                    )}

                    {(!config.aiProvider || config.aiProvider === 'gemini') && (
                      <div className="mt-2 text-right">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline font-bold inline-flex items-center justify-end gap-1 font-serif transition-colors">
                          <Sparkles size={12} /> คลิกขอรับ API Key ฟรี
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 font-serif"><MapPin size={12} /> จังหวัดที่ตั้งสถานประกอบการ</label>
                  <select
                    className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold shadow-inner text-sm font-serif bg-slate-50"
                    value={config.province || ''} onChange={e => setConfig({ ...config, province: e.target.value })}
                  >
                    <option value="">-- เลือกจังหวัด --</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {setupFields.map(f => {
                  return (
                    <div key={f.k}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 font-serif"><f.i size={12} /> {f.l}</label>
                      {f.k === 'level' ? (
                        <select className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold shadow-inner text-sm font-serif bg-slate-50"
                          value={config.level || ''} onChange={e => setConfig({ ...config, level: e.target.value })}>
                          <option value="ปวช.">ปวช.</option>
                          <option value="ปวส.">ปวส.</option>
                          <option value="ปวช. และ ปวส.">ปวช. และ ปวส.</option>
                          <option value="ปริญญาตรี">ปริญญาตรี</option>
                        </select>
                      ) : (
                        <input
                          type={f.k === 'startDate' || f.k === 'endDate' ? 'date' : 'text'}
                          className={`w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold shadow-inner text-sm font-serif bg-slate-50`}
                          value={config[f.k] || ''}
                          onChange={e => {
                            const newConfig = { ...config, [f.k]: e.target.value };
                            if (f.k === 'startDate' || f.k === 'endDate') {
                              const s = f.k === 'startDate' ? e.target.value : newConfig.startDate;
                              const en = f.k === 'endDate' ? e.target.value : newConfig.endDate;
                              if (s && en) {
                                const diff = Math.floor((new Date(en) - new Date(s)) / (1000 * 60 * 60 * 24));
                                if (diff > 0) newConfig.weeks = Math.floor(diff / 7);
                              }
                            }
                            setConfig(newConfig);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
                {trainingDuration && (
                  <div className="md:col-span-2 bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-800">ระยะเวลาฝึก: {trainingDuration.weeks} สัปดาห์ {trainingDuration.days > 0 ? `${trainingDuration.days} วัน` : ''} (รวม {trainingDuration.totalDays} วัน)</span>
                  </div>
                )}
                {trainingWeeksWarning && (
                  <div className="md:col-span-2 bg-red-50 border border-red-300 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-red-700">{trainingWeeksWarning}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-indigo-600 p-10 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-center text-center font-serif">
              <h3 className="font-bold flex items-center justify-center gap-2 mb-6 text-indigo-100 uppercase tracking-widest font-serif"><Clock /> เวลาฝึกปฏิบัติรวม</h3>
              <p className="text-7xl font-black tracking-tighter">{totalTrainingHours} <span className="text-xl font-normal opacity-50 uppercase font-serif">ชม.</span></p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[9px] font-bold opacity-50 uppercase">ชั่วโมง/วัน</p><input type="number" className="bg-transparent text-center text-xl font-black outline-none w-full font-serif" value={config.hoursPerDay} onChange={e => setConfig({ ...config, hoursPerDay: e.target.value })} /></div>
                <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[9px] font-bold opacity-50 uppercase">วัน/สัปดาห์</p><input type="number" min="1" max="7" className="bg-transparent text-center text-xl font-black outline-none w-full font-serif" value={config.daysPerWeek} onChange={e => setConfig({ ...config, daysPerWeek: e.target.value })} /></div>
                <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[9px] font-bold opacity-50 uppercase">สัปดาห์</p><input type="number" className="bg-transparent text-center text-xl font-black outline-none w-full font-serif" value={config.weeks} onChange={e => setConfig({ ...config, weeks: e.target.value })} />{trainingDuration && <p className="text-[8px] opacity-60 mt-1">(คำนวณจากวันฝึก)</p>}</div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10"><Clock size={240} /></div>
            </div>
          </div>
        )}

        {/* SUBJECTS TAB */}
        {activeTab === 'subjects' && !isWorkplaceTrainer && (
          <div className="space-y-6 font-serif">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
              <div>
                <h2 className="text-xl font-black text-indigo-700 uppercase tracking-tight flex items-center gap-3 font-serif"><FileSearch /> วิเคราะห์รายวิชาอ้างอิง (A - AD)</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic mt-1 font-serif">วิเคราะห์งานหลักและงานย่อยทุกรายวิชาด้วยการคลิกเพียงครั้งเดียว</p>
              </div>
              <button onClick={analyzeAllSubjects} disabled={isAnalyzingSubject} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl transition-all flex items-center gap-3 active:scale-95 disabled:bg-slate-300 font-serif">
                {isAnalyzingSubject ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} วิเคราะห์ทุกวิชาที่มีข้อมูล (A-AD)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-serif">
              {subjects.map((sub, idx) => (
                <div key={sub.id} className={`p-6 rounded-3xl border-2 transition-all duration-500 shadow-sm ${sub.isAnalyzed ? 'bg-green-50 border-green-500 opacity-95' : 'bg-white border-slate-100 hover:border-indigo-300'}`}>
                  <div className="flex items-center gap-4 mb-6 font-serif">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md transition-all ${sub.isAnalyzed ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{sub.id}</div>
                    <div className="flex-1 font-serif">
                      <input className={`w-full font-black text-sm bg-transparent outline-none border-b-2 transition-colors font-serif ${sub.isAnalyzed ? 'border-green-300 text-green-900' : 'border-slate-50 focus:border-indigo-500'}`} placeholder="ชื่อรายวิชา..." value={sub.name || ''} onChange={e => { const n = [...subjects]; n[idx].name = e.target.value; setSubjects(n); }} />
                    </div>
                    {sub.isAnalyzed && <CheckSquare className="text-green-600 animate-in zoom-in duration-500" />}
                  </div>
                  <div className="space-y-4 font-serif">
                    <div className="flex gap-2">
                      <input className="w-1/3 px-4 py-3 text-[11px] font-bold bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-serif" placeholder="ท-ป-น (เช่น 0-6-2)" value={sub.credits || ''} onChange={e => { const n = [...subjects]; n[idx].credits = e.target.value; setSubjects(n); }} />
                      <textarea className="w-2/3 h-12 p-3 text-[11px] bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-serif leading-tight resize-none" placeholder="สมรรถนะรายวิชา..." value={sub.competencies || ''} onChange={e => { const n = [...subjects]; n[idx].competencies = e.target.value; setSubjects(n); }} />
                    </div>

                    {sub.isAnalyzed && (
                      <div className="space-y-2 p-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl">
                        <div>
                          <label className="text-[9px] font-bold text-indigo-800 ml-1">อ้างอิงมาตรฐาน</label>
                          <textarea className="w-full h-12 p-2 text-[11px] bg-white border border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-serif leading-tight resize-none" value={sub.standards || ''} onChange={e => { const n = [...subjects]; n[idx].standards = e.target.value; setSubjects(n); }} />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-indigo-800 ml-1">ผลลัพธ์การเรียนรู้ระดับรายวิชา</label>
                          <textarea className="w-full h-12 p-2 text-[11px] bg-white border border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-serif leading-tight resize-none" value={sub.learningOutcomes || ''} onChange={e => { const n = [...subjects]; n[idx].learningOutcomes = e.target.value; setSubjects(n); }} />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-indigo-800 ml-1">จุดประสงค์รายวิชา</label>
                          <textarea className="w-full h-12 p-2 text-[11px] bg-white border border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-serif leading-tight resize-none" value={sub.objectives || ''} onChange={e => { const n = [...subjects]; n[idx].objectives = e.target.value; setSubjects(n); }} />
                        </div>
                      </div>
                    )}

                    <input type="file" id={`f-${idx}`} className="hidden" accept="image/*" onChange={e => handleFileUpload('subject', idx, e)} />
                    <label htmlFor={`f-${idx}`} className={`flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-white transition-all ${sub.uploadedFile ? 'border-green-400 bg-green-50/20 shadow-inner' : 'border-slate-200'}`}>
                      {sub.previewUrl ? <CheckCircle2 className="text-green-600" /> : <Upload className="text-slate-300" />}
                      <span className={`text-[10px] font-black uppercase ${sub.uploadedFile ? 'text-green-700 font-bold' : 'text-slate-400'} text-center font-serif`}>
                        {sub.uploadedFile ? 'เปลี่ยนไฟล์รายวิชา' : 'อัปโหลดภาพคำอธิบาย (OCR)'}
                      </span>
                    </label>
                    <textarea className={`w-full h-24 p-4 text-[11px] bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-serif`} placeholder="วางข้อมูลรายวิชา..." value={sub.description || ''} onChange={e => { const n = [...subjects]; n[idx].description = e.target.value; setSubjects(n); }} />

                    {sub.isAnalyzed && (
                      <div className="p-4 bg-white rounded-2xl border border-green-200 shadow-sm max-h-64 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-[10px] font-black text-green-700 flex items-center gap-1"><ListChecks size={12} /> ผลวิเคราะห์งาน (แก้ไข/เพิ่ม/ลบ ได้)</p>
                          <button onClick={() => addSubjectMainTaskLocal(idx)} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"><Plus size={12} /> เพิ่มงานหลัก</button>
                        </div>
                        {(sub.mainTasks || []).map((mt, mIdx) => (
                          <div key={mt.id || mIdx} className="mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-slate-500 w-6">{mt.id}</span>
                              <input className="text-xs font-bold w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200" placeholder="ชื่องานหลัก..." value={mt.name} onChange={(e) => {
                                const n = [...subjects]; n[idx].mainTasks[mIdx].name = e.target.value; setSubjects(n);
                              }} />
                              <button onClick={() => addSubjectSubTaskLocal(idx, mIdx)} className="text-green-500 hover:text-green-700 p-1" title="เพิ่มงานย่อย"><Plus size={14} /></button>
                              <button onClick={() => removeSubjectMainTaskLocal(idx, mIdx)} className="text-red-300 hover:text-red-500 p-1" title="ลบงานหลัก"><Trash2 size={14} /></button>
                            </div>
                            {(mt.subTasks || []).map((st, sIdx) => (
                              <div key={st.id || sIdx} className="flex items-center gap-2 mt-1.5 ml-8">
                                <span className="text-[9px] font-bold text-slate-400 w-8">{st.id}</span>
                                <input className="text-[11px] w-full bg-transparent border-b border-dashed border-slate-200 px-1 py-0.5 outline-none focus:border-green-500 text-slate-600" placeholder="ชื่องานย่อย..." value={st.name} onChange={(e) => {
                                  const n = [...subjects]; n[idx].mainTasks[mIdx].subTasks[sIdx].name = e.target.value; setSubjects(n);
                                }} />
                                <button onClick={() => removeSubjectSubTaskLocal(idx, mIdx, sIdx)} className="text-red-200 hover:text-red-500 p-1" title="ลบงานย่อย"><X size={12} /></button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    <button onClick={() => analyzeSubject(idx)} disabled={isAnalyzingSubject} className={`w-full py-3 rounded-2xl text-[11px] font-black shadow-lg transition-all flex items-center justify-center gap-2 font-serif ${sub.isAnalyzed ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                      {isAnalyzingSubject && currentIdx === idx ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />} {sub.isAnalyzed ? 'วิเคราะห์ข้อมูลใหม่อีกครั้ง' : `เริ่มวิเคราะห์วิชา ${sub.id}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKPLACE TAB */}
        {activeTab === 'workplace' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500 font-serif">
            {isDeveloper && editingCloudId && (
              <div className="bg-amber-100 border border-amber-300 text-amber-800 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldAlert size={20} className="text-amber-600" />
                  โหมดแอดมิน: คุณกำลังแก้ไขข้อมูลรหัส {editingCloudId.substring(0, 8)}... ของบริษัท {config.companyName}
                </div>
                <button onClick={() => setEditingCloudId(null)} className="text-xs font-black bg-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                  ยกเลิกการแก้ไข
                </button>
              </div>
            )}
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm font-serif">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 border-b pb-6 gap-6">
                <div>
                  <h2 className="text-2xl font-black text-indigo-900 uppercase flex items-center gap-3 font-serif"><HardHat /> งานในสถานประกอบการ ({workplaceMainTasks.length}/100)</h2>
                  <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest italic">วิเคราะห์งานทุกลำดับให้ละเอียดครบถ้วนด้วยระบบ AI</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <input type="file" accept=".jobcompany" ref={jobCompanyInputRef} onChange={handleJobCompanyUpload} className="hidden" />
                  <button onClick={() => jobCompanyInputRef.current.click()} className="bg-orange-500 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-orange-600 transition flex items-center gap-2 active:scale-95 font-serif shadow-sm">
                    <Upload size={18} /> โหลดไฟล์ .jobcompany
                  </button>
                  <button onClick={remapAllWorkplaceTasks} disabled={isRemapping || subjects.filter(s => s.isAnalyzed).length === 0} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-emerald-700 transition flex items-center gap-2 active:scale-95 disabled:bg-slate-300 font-serif">
                    {isRemapping ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />} จับคู่งานอีกครั้ง
                  </button>
                  <button onClick={addWorkplaceMainTask} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-indigo-700 transition flex items-center gap-3 active:scale-95 font-serif">
                    <Plus size={18} /> เพิ่มงานหลัก
                  </button>
                </div>
              </div>
              <div className="space-y-10">
                {workplaceMainTasks.map((main, mIdx) => (
                  <div key={main.id} className={`bg-slate-50 p-8 rounded-[40px] border shadow-inner relative group font-serif transition-colors ${main.isConfirmed ? 'border-green-200' : 'border-slate-100'}`}>
                    <div className={`flex flex-col md:flex-row gap-8 font-serif ${collapsedWorkplaceTasks.has(main.id) ? 'mb-0' : 'mb-10'}`}>
                      <div className="flex-1 space-y-5">
                        <div>
                          <div className="flex items-center justify-between mb-0">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-serif">งานหลักที่คุณครูฝึกสอนในบริษัท (งานที่ {mIdx + 1})</label>
                            {(main.subTasks || []).length > 0 && (
                              <button
                                type="button"
                                onClick={() => setCollapsedWorkplaceTasks(prev => { const s = new Set(prev); s.has(main.id) ? s.delete(main.id) : s.add(main.id); return s; })}
                                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
                              >
                                {collapsedWorkplaceTasks.has(main.id) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                {collapsedWorkplaceTasks.has(main.id) ? 'แสดง' : 'ซ่อน'}ข้อมูล
                              </button>
                            )}
                          </div>
                          <input className={`w-full mt-2 bg-white px-6 py-4 rounded-3xl border font-black text-base outline-none focus:ring-4 focus:ring-indigo-100 shadow-sm font-serif ${main.isConfirmed ? 'border-transparent text-slate-700' : 'border-slate-100 text-slate-900'}`} placeholder="พิมพ์งานที่ฝึกจริง..." value={main.name || ''} onChange={e => { const n = [...workplaceMainTasks]; n[mIdx].name = e.target.value; setWorkplaceMainTasks(n); }} readOnly={main.isConfirmed} />
                        </div>
                        <button onClick={() => analyzeWorkplaceMainTask(main.id)} disabled={main.isAnalyzing || !main.name || main.isConfirmed} className="w-full py-4 bg-indigo-600 text-white rounded-3xl text-sm font-black hover:bg-indigo-700 shadow-2xl transition flex items-center justify-center gap-3 active:scale-95 font-serif disabled:bg-slate-300 disabled:shadow-none">
                          {main.isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles />} วิเคราะห์งานย่อยและขั้นตอน (ทุกลำดับงาน)
                        </button>
                      </div>
                      {!main.isConfirmed && (
                        <button onClick={() => removeWorkplaceMainTask(main.id)} className="p-3 text-slate-300 hover:text-red-500 transition self-start font-serif"><Trash2 size={24} /></button>
                      )}
                    </div>
                    <div className={`space-y-4 pl-6 md:pl-12 border-l-4 ml-2 font-serif transition-colors ${main.isConfirmed ? 'border-green-300' : 'border-indigo-200'} ${collapsedWorkplaceTasks.has(main.id) ? 'hidden' : ''}`}>
                      {(main.subTasks || []).map((sub, sIdx) => (
                        <div key={sIdx} className={`bg-white p-6 rounded-[30px] border shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 font-serif transition-all duration-300 ${main.isConfirmed ? 'border-green-100 bg-green-50/20' : 'border-slate-100 hover:border-indigo-400'}`}>
                          <div className="flex-1 font-serif w-full">
                            <div className="flex items-center justify-between gap-2 mb-2 font-serif w-full">
                              <div className="flex items-center gap-2 flex-1">
                                <span className={`px-3 py-1 rounded-full font-black text-[10px] shadow-inner font-serif ${main.isConfirmed ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>{sub.id}</span>
                                <input
                                  className={`font-black text-base mt-1 font-serif bg-transparent border-b border-dashed outline-none focus:border-indigo-500 w-full lg:w-2/3 ${main.isConfirmed ? 'border-transparent text-slate-700' : 'border-slate-300 text-slate-800'}`}
                                  value={sub.workplaceName || ''}
                                  onChange={(e) => updateWorkplaceSubtask(mIdx, sIdx, 'workplaceName', e.target.value)}
                                  placeholder="ชื่องานย่อย..." readOnly={main.isConfirmed}
                                />
                                {!main.isConfirmed && (
                                  <button type="button" onClick={() => analyzeSingleWorkplaceSubtask(mIdx, sIdx)} disabled={sub.isAnalyzing || !sub.workplaceName} className="text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 p-1 transition-colors" title="วิเคราะห์ขั้นตอนของงานย่อยนี้">
                                    {sub.isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {(sub.detailed_steps || []).length > 0 && (
                                  <button onClick={() => setCollapsedWorkplaceSubTasks(prev => { const s = new Set(prev); s.has(sub.id) ? s.delete(sub.id) : s.add(sub.id); return s; })} className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
                                    {collapsedWorkplaceSubTasks.has(sub.id) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                    {collapsedWorkplaceSubTasks.has(sub.id) ? 'แสดงขั้นตอน' : 'ซ่อนขั้นตอน'}
                                  </button>
                                )}
                                {!main.isConfirmed && (
                                  <button onClick={() => removeWorkplaceSubtask(mIdx, sIdx)} className="text-red-300 hover:text-red-500 p-2 transition-colors" title="ลบงานย่อย"><Trash2 size={16} /></button>
                                )}
                              </div>
                            </div>

                            <div className={`mt-3 space-y-2 font-serif ${collapsedWorkplaceSubTasks.has(sub.id) ? 'hidden' : 'block'}`}>
                              <p className={`text-[10px] font-black uppercase border-b pb-1 font-serif ${main.isConfirmed ? 'text-green-600 border-green-100' : 'text-indigo-400 border-indigo-50'}`}>ขั้นตอนการปฏิบัติงาน:</p>
                              {sub.detailed_steps?.map((step, si) => (
                                <div key={si} className="flex items-start gap-2 text-[11px] text-slate-600 pl-2 border-l-2 border-slate-100 leading-relaxed font-serif group">
                                  <span className="mt-1.5 font-bold">{si + 1}.</span>
                                  <div className="flex-1 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <input
                                        className={`w-16 bg-indigo-50/50 text-indigo-700 text-[10px] font-bold px-1.5 py-1 rounded border border-indigo-100 outline-none focus:border-indigo-400 font-serif ${main.isConfirmed ? 'bg-transparent border-transparent' : ''}`}
                                        value={step.subjectTaskId || ''} onChange={(e) => updateWorkplaceStepField(mIdx, sIdx, si, 'subjectTaskId', e.target.value)}
                                        placeholder="รหัสอ้างอิง..." readOnly={main.isConfirmed} title="จับคู่รหัสงานจากรายวิชา (ถ้ามี)"
                                      />
                                      <input
                                        className={`w-full bg-transparent border-b border-dashed outline-none focus:border-indigo-500 py-1 ${main.isConfirmed ? 'border-transparent text-slate-600' : 'border-slate-200'}`}
                                        value={step.step_text || ''} onChange={(e) => updateWorkplaceStepField(mIdx, sIdx, si, 'step_text', e.target.value)}
                                        placeholder="ระบุขั้นตอนการทำงาน (ขึ้นต้นด้วยคำกริยา)..." readOnly={main.isConfirmed}
                                      />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                                      <Briefcase size={10} className="text-slate-400" />
                                      <input
                                        className={`w-full bg-transparent border-b border-dashed outline-none focus:border-indigo-500 py-0.5 text-[10px] text-slate-500 ${main.isConfirmed ? 'border-transparent' : 'border-slate-200'}`}
                                        value={step.equipment || ''} onChange={(e) => updateWorkplaceStepField(mIdx, sIdx, si, 'equipment', e.target.value)}
                                        placeholder="สื่อ/อุปกรณ์ที่ใช้..." readOnly={main.isConfirmed}
                                      />
                                    </div>
                                  </div>
                                  {!main.isConfirmed && (
                                    <button type="button" onClick={() => analyzeSingleWorkplaceStep(mIdx, sIdx, si)} disabled={step.isAnalyzing || !step.step_text} className="text-indigo-500 hover:text-indigo-700 disabled:text-slate-300 p-1 mt-0.5 transition-colors" title="วิเคราะห์จุดประสงค์ขั้นตอนนี้">
                                      {step.isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                    </button>
                                  )}
                                  <span className="mt-1.5 text-[9px] font-bold text-slate-400 uppercase font-serif whitespace-nowrap">(K{step.levels?.k} S{step.levels?.s} A{step.levels?.a} Ap{step.levels?.ap})</span>
                                  {!main.isConfirmed && (
                                    <button onClick={() => removeWorkplaceStep(mIdx, sIdx, si)} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-opacity mt-1.5" title="ลบขั้นตอนนี้"><X size={14} /></button>
                                  )}
                                </div>
                              ))}
                              {!main.isConfirmed && (
                                <button onClick={() => addWorkplaceStepLocal(mIdx, sIdx)} className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1 mt-2 pl-2 py-1"><Plus size={12} /> เพิ่มขั้นตอน</button>
                              )}
                            </div>
                          </div>
                          <div className="bg-slate-100 p-3 rounded-2xl border flex items-center gap-3 font-serif">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">เวลา (ชม.)</label>
                            <input type="number" className="w-16 text-center bg-white py-1 rounded-lg font-black border text-indigo-600 focus:ring-2 focus:ring-indigo-300 shadow-inner font-serif" value={sub.hours || 0} onChange={e => updateWorkplaceSubtask(mIdx, sIdx, 'hours', Number(e.target.value))} readOnly={main.isConfirmed} />
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                        <div>
                          {!main.isConfirmed && (
                            <button onClick={() => addWorkplaceSubtaskLocal(mIdx)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2 py-1"><Plus size={14} /> เพิ่มงานย่อยด้วยตนเอง</button>
                          )}
                        </div>
                        <button onClick={() => toggleConfirmWorkplaceTask(mIdx)} className={`px-6 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all flex items-center gap-2 ${main.isConfirmed ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200' : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'}`}>
                          {main.isConfirmed ? <><Settings size={16} /> ปลดล็อกเพื่อแก้ไข</> : <><CheckCircle2 size={16} /> ยืนยันข้อมูลงานนี้</>}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-12 max-w-7xl mx-auto font-serif text-[11pt] animate-in fade-in duration-700">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl overflow-x-auto font-serif">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 border-b pb-4 gap-4 font-serif">
                <h3 className="text-xl font-black text-indigo-700 uppercase font-serif tracking-widest flex items-center gap-3"><FileSpreadsheet /> พิมพ์รายงานแผนการฝึกวิชาชีพ</h3>
                <div className="flex flex-wrap sm:flex-row gap-2 w-full lg:w-auto">
                  {!isWorkplaceTrainer && (
                    <>
                      <button onClick={() => setActiveReportView('dve0402')} className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap ${activeReportView === 'dve0402' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'}`}>DVE-04-02</button>
                      <button onClick={() => setActiveReportView('dve0403')} className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap ${activeReportView === 'dve0403' ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 border border-teal-200 hover:bg-teal-50'}`}>DVE-04-03</button>
                      <button onClick={() => setActiveReportView('dve0404')} className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap ${activeReportView === 'dve0404' ? 'bg-amber-600 text-white' : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'}`}>DVE-04-04</button>
                    </>
                  )}
                  <button onClick={() => setActiveReportView('dve0405')} className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap ${activeReportView === 'dve0405' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'}`}>DVE-04-05 (ฝอ.1)</button>
                  <button onClick={() => setActiveReportView('dve0406')} className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap ${activeReportView === 'dve0406' ? 'bg-rose-600 text-white' : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'}`}>DVE-04-06 (ฝอ.2)</button>
                  <div className="hidden sm:block border-l border-slate-200 mx-1"></div>
                  <button onClick={() => setShowDownloadConfirm(activeReportView)} className="bg-green-600 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black hover:bg-green-700 shadow-md active:scale-95 flex items-center gap-1.5 transition-all font-serif whitespace-nowrap"><FileDown size={14} /> โหลดหน้านี้</button>
                  <button onClick={() => setShowDownloadConfirm('reports')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black hover:bg-indigo-700 shadow-lg active:scale-95 flex items-center gap-1.5 transition-all font-serif border-2 border-indigo-400 whitespace-nowrap"><FileDown size={14} /> โหลดทั้งหมด</button>
                </div>
              </div>

              <div id="dve-all-area" className="font-serif">

                {/* DVE-04-02 */}
                <div id="dve-0402-area" className={`Section2 ${activeReportView !== 'dve0402' ? 'hidden' : ''}`}>
                  {subjects.filter(s => s.isAnalyzed).map((sub, idx) => {
                    let totalSubTasks = 0;
                    const mainTaskRows = [];
                    (sub.mainTasks || []).forEach(mt => {
                      const subs = mt.subTasks || [];
                      const subCount = subs.length > 0 ? subs.length : 1;
                      totalSubTasks += subCount;
                      mainTaskRows.push({ ...mt, rowSpan: subCount, subTasksList: subs.length > 0 ? subs : [{ id: '', name: '-' }] });
                    });
                    if (totalSubTasks === 0) totalSubTasks = 1;

                    const isPvc = config.level.includes('ปวช');
                    const isPvs = config.level.includes('ปวส');
                    const isDegree = config.level.includes('ปริญญา');

                    return (
                      <div key={`dve0402-${sub.id}`} className="page-break mb-20 font-serif">
                        <div className="text-right text-[10pt] mb-1 border-2 border-black p-1 px-3 w-fit ml-auto font-bold">DVE-04-02</div>
                        <div className="text-center mb-6 font-serif">
                          <h2 className="text-[14pt] font-bold mb-3">ตารางวิเคราะห์งานจากรายวิชา</h2>
                          <div className="text-[11pt] flex flex-wrap justify-center gap-x-6 gap-y-2 mb-3">
                            <span>ระดับ</span>
                            <span>{isPvc ? '☑' : '☐'} ประกาศนียบัตรวิชาชีพ (ปวช.)</span>
                            <span>{isPvs ? '☑' : '☐'} ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)</span>
                            <span>{isDegree ? '☑' : '☐'} ปริญญาตรีสายเทคโนโลยีหรือสายปฏิบัติการ</span>
                          </div>
                          <div className="text-[11pt] space-y-1">
                            <p>แผนกวิชา {config.fieldOfStudy || '..........................'} สาขาวิชา {config.major || '..........................'}</p>
                            <p>รหัสวิชา {sub.code || '................'} ชื่อวิชา {sub.name || '..................................................'}</p>
                          </div>
                        </div>
                        <table className="w-full text-[10pt] border-collapse border-2 border-black font-serif">
                          <thead>
                            <tr className="bg-slate-100 font-bold text-center">
                              <th className="border border-black p-2" colSpan="3">หลักสูตรสถานศึกษา</th>
                              <th className="border border-black p-2" colSpan="3">วิเคราะห์งานจากรายวิชาในหลักสูตร</th>
                            </tr>
                            <tr className="bg-slate-50 font-bold text-center">
                              <th className="border border-black p-2 w-16">ท-ป-น</th>
                              <th className="border border-black p-2 w-1/5">สมรรถนะรายวิชา</th>
                              <th className="border border-black p-2 w-1/5">คำอธิบายรายวิชา</th>
                              <th className="border border-black p-2 w-1/6">อาชีพ/ตำแหน่งงาน</th>
                              <th className="border border-black p-2 w-1/5">งานหลัก</th>
                              <th className="border border-black p-2 w-1/5">งานย่อย</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mainTaskRows.length > 0 ? mainTaskRows.map((mt, mtIdx) => (
                              mt.subTasksList.map((st, stIdx) => (
                                <tr key={`${mtIdx}-${stIdx}`} className="align-top">
                                  {mtIdx === 0 && stIdx === 0 && (
                                    <>
                                      <td rowSpan={totalSubTasks} className="border border-black p-2 text-center align-top">{sub.credits || '-'}</td>
                                      <td rowSpan={totalSubTasks} className="border border-black p-2 align-top whitespace-pre-line leading-relaxed">{sub.competencies || '-'}</td>
                                      <td rowSpan={totalSubTasks} className="border border-black p-2 align-top whitespace-pre-line leading-relaxed">{sub.isAnalyzed ? (sub.description && sub.description !== sub.competencies ? sub.description : '-') : (sub.description || '-')}</td>
                                      <td rowSpan={totalSubTasks} className="border border-black p-2 align-top">{sub.id} {config.occupation || 'ช่างเทคนิค'}</td>
                                    </>
                                  )}
                                  {stIdx === 0 && (
                                    <td rowSpan={mt.rowSpan} className="border border-black p-2 align-top">{mt.id} {cleanTaskName(mt.name)}</td>
                                  )}
                                  <td className="border border-black p-2 align-top">{st.id} {cleanTaskName(st.name)}</td>
                                </tr>
                              ))
                            )) : (
                              <tr><td colSpan="6" className="border border-black p-4 text-center text-slate-400">ยังไม่มีข้อมูลการวิเคราะห์งาน</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>

                {/* DVE-04-03 */}
                <div id="dve-0403-area" className={`Section2 ${activeReportView !== 'dve0403' ? 'hidden' : ''}`}>
                  <div className="page-break mb-20 font-serif">
                    <div className="text-right text-[10pt] mb-1 border p-1 w-fit ml-auto italic">DVE-04-03</div>
                    <div className="text-center mb-8 font-serif font-bold">
                      <h2 className="text-[14pt] font-bold uppercase mb-4">แบบวิเคราะห์งานเทียบกับรายวิชาของผู้เรียนระบบทวิภาคี</h2>
                      <div className="text-[11pt] space-y-1 font-serif text-left">
                        <p>วิทยาลัย: {config.collegeName || '................'} สถานประกอบการ: {config.companyName || '................'}</p>
                        <p>สาขาวิชา {config.major || '................'} ระดับ {config.level || '................'} ปีการศึกษา {config.academicYear || '................'}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 border-2 border-black border-b-0 p-2 text-center font-bold uppercase font-serif">๑. รายการงานที่สอดคล้องและจัดฝึกปฏิบัติจริงในสถานประกอบการ</div>

                    {(() => {
                      const leftList = [];
                      subjects.filter(s => s.isAnalyzed).forEach(sub => {
                        leftList.push({ level: 0, text: `${sub.id} ${sub.name}` });
                        (sub.mainTasks || []).forEach(mt => {
                          leftList.push({ level: 1, text: `${mt.id} ${cleanTaskName(mt.name)}` });
                          (mt.subTasks || []).forEach(st => {
                            leftList.push({ level: 2, text: `${st.id} ${cleanTaskName(st.name)}` });
                          });
                        });
                      });

                      const rightList = [];
                      workplaceMainTasks.forEach((mt, mIdx) => {
                        rightList.push({ level: 0, text: `${mIdx + 1}. ${cleanTaskName(mt.name)}` });
                        (mt.subTasks || []).forEach((st, sIdx) => {
                          // ดึงรหัสทั้งจากตัวงานย่อย และขั้นตอนย่อยๆ (Steps) มารวมกัน
                          let allIds = [];
                          if (st.id) allIds.push(...String(st.id).split(','));
                          if (st.detailed_steps) {
                            st.detailed_steps.forEach(step => {
                              if (step.subjectTaskId) allIds.push(...String(step.subjectTaskId).split(','));
                            });
                          }
                          const uniqueIds = [...new Set(allIds.map(i => i.trim().toUpperCase()))].filter(Boolean).join(', ');

                          rightList.push({
                            level: 1,
                            text: `${mIdx + 1}.${sIdx + 1} ${cleanTaskName(st.workplaceName)}`,
                            hours: st.hours,
                            mappedSubjectId: uniqueIds
                          });
                        });
                      });
                      const maxRows = Math.max(leftList.length, rightList.length);
                      const activeSubjects = subjects.filter(s => s.isAnalyzed);

                      return (
                        <table className="w-full text-[10pt] border-collapse border-2 border-black font-serif">
                          <thead>
                            <tr className="bg-slate-100 font-bold text-center font-serif">
                              <th className="border border-black p-2 w-[35%] align-middle">งานจากรายวิชา</th>
                              <th className="border border-black p-2 w-[35%] align-middle">งานในสถานประกอบการ</th>
                              <th className="border border-black p-2 text-center w-12 p-0 align-middle">
                                <div className="vertical-text mx-auto text-[9pt]">เวลาฝึก (วัน/ชั่วโมง)</div>
                              </th>
                              {activeSubjects.map((s, i) => (
                                <th key={s.id} className="border border-black p-2 font-bold w-12 p-0 align-bottom">
                                  <div className="vertical-text mx-auto text-[9pt]">{s.code || s.id} - {s.name}</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: maxRows }).map((_, i) => {
                              const left = leftList[i];
                              const right = rightList[i];
                              return (
                                <tr key={i} className="font-serif align-top">
                                  <td className="border border-black p-1 px-3">
                                    {left && (
                                      <div className={`${left.level === 0 ? 'font-bold' : ''} ${left.level === 1 ? 'ml-4 font-semibold' : ''} ${left.level === 2 ? 'ml-8 text-slate-700' : ''}`}>
                                        {left.text}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border border-black p-1 px-3">
                                    {right && (
                                      <div className={`${right.level === 0 ? 'font-bold' : 'ml-4 text-slate-700'}`}>
                                        {right.text}
                                      </div>
                                    )}
                                  </td>
                                  <td className="border border-black p-1 text-center font-bold">
                                    {right?.hours || ''}
                                  </td>
                                  {activeSubjects.map(s => {
                                    const matchedIds = right && right.mappedSubjectId
                                      ? String(right.mappedSubjectId).split(',').map(id => id.trim()).filter(id => id.toUpperCase().startsWith(s.id.toUpperCase()))
                                      : [];
                                    return (
                                      <td key={s.id} className="border border-black p-1 text-center font-black text-indigo-700">
                                        {matchedIds.length > 0 ? matchedIds.join(', ') : ''}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      );
                    })()}

                    <div className="bg-red-50 border-2 border-black border-t-0 p-2 text-center font-bold uppercase text-red-800 font-serif mt-6">๒. งานที่ไม่ได้จัดฝึกเนื่องจากไม่ตรงกับงานในสถานประกอบการ</div>
                    <table className="w-full text-[10pt] border-collapse border-2 border-black font-serif">
                      <thead><tr className="bg-red-50 font-bold text-center font-serif"><th className="border border-black p-2">งานรายวิชา</th><th className="border border-black p-2">งานหลักรายวิชา</th><th className="border border-black p-2 w-24">วิชา</th></tr></thead>
                      <tbody>
                        {unmappedTasks.map((st, i) => (
                          <tr key={i} className="opacity-50 italic text-[9pt] font-serif">
                            <td className="border border-black p-2 pl-8">{st.id} {st.name}</td>
                            <td className="border border-black p-2">{st.mainTaskName}</td>
                            <td className="border border-black p-2 text-center">{st.subjectId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* DVE-04-04 (รายวิชาที่นำไปฝึกในสถานประกอบการ) */}
                <div id="dve-0404-area" className={activeReportView !== 'dve0404' ? 'hidden' : ''}>
                  {subjects.filter(s => s.isAnalyzed).map((sub, idx) => (
                    <div key={`dve0404-${sub.id}`} className="page-break mb-20 font-serif">
                      <div className="text-right mb-2">
                        <span className="border border-black p-1 px-3 font-bold text-[12pt]">DVE-04-04</span>
                      </div>
                      <div className="text-center font-bold mb-6">
                        <h2 className="text-[16pt] mb-2 uppercase">รายวิชาที่นำไปฝึกในสถานประกอบการ</h2>
                        <p className="text-[14pt]">
                          รหัสวิชา {sub.code || '................'} ชื่อวิชา {sub.name || '................................'} ท-ป-น {sub.credits || '........'}
                        </p>
                      </div>

                      <div className="space-y-4 text-[12pt] leading-relaxed text-left">
                        <div>
                          <p className="font-bold bg-slate-100 inline-block px-2">อ้างอิงมาตรฐาน</p>
                          <div className="pl-6">{formatNumberedText(sub.standards)}</div>
                        </div>
                        <div>
                          <p className="font-bold bg-slate-100 inline-block px-2">ผลลัพธ์การเรียนรู้ระดับรายวิชา</p>
                          <div className="pl-6">{formatNumberedText(sub.learningOutcomes)}</div>
                        </div>
                        <div>
                          <p className="font-bold bg-slate-100 inline-block px-2">จุดประสงค์รายวิชา</p>
                          <div className="pl-6">{formatNumberedText(sub.objectives)}</div>
                        </div>
                        <div>
                          <p className="font-bold bg-slate-100 inline-block px-2">สมรรถนะรายวิชา</p>
                          <div className="pl-6">{formatNumberedText(sub.competencies)}</div>
                        </div>
                        <div>
                          <p className="font-bold bg-slate-100 inline-block px-2">คำอธิบายรายวิชา</p>
                          <div className="pl-6">{formatNumberedText(sub.description)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ฝอ.1 */}
                <div id="dve-0405-area" className={activeReportView !== 'dve0405' ? 'hidden' : ''}>
                  <div className="page-break mb-20 font-serif border-t-2 pt-10 border-dashed border-slate-300">
                    <div className="text-right text-[10pt] mb-2 border p-1 w-fit ml-auto italic font-serif">DVE-04-05 (ฝอ.1)</div>
                    <div className="report-header font-serif text-[11pt] space-y-1.5">
                      <h2 className="text-center font-bold underline uppercase mb-6 font-serif">แผนการฝึกอาชีพตลอดหลักสูตรร่วมกับ {config.companyName || '................'}</h2>
                      <p>ผู้เข้ารับการฝึกระบบทวิภาคี วิทยาลัย {config.collegeName || '................'} ระดับชั้น {config.level || '................'} กลุ่มอาชีพ {config.group || '................'} สาขาวิชา {config.major || '................'}</p>
                      <p>ฝึกงานปีการศึกษา {config.academicYear || '.........'} ระหว่างวันที่ {config.startDate || '.........'} ถึง วันที่ {config.endDate || '.........'} เวลาฝึก {totalTrainingHours} วัน/ชั่วโมง</p>
                      {!isWorkplaceTrainer && <p>ผลลัพธ์การเรียนรู้ (ของวิชาที่นำไปฝึกในสถานประกอบการ): <span className="font-bold">{analyzedSubjectNames || '................'}</span></p>}
                    </div>
                    <div className="font-bold text-[12pt] mb-3 uppercase underline font-serif">๑. รายการงานที่จัดฝึกปฏิบัติจริง</div>
                    <table className="w-full border-collapse border-2 border-black mb-8 text-[10pt] font-serif">
                      <thead>
                        <tr className="bg-slate-50 font-bold text-center font-serif">
                          <th className="border border-black p-2">อาชีพ / ตำแหน่งงานที่ฝึก</th>
                          <th className="border border-black p-2">งานหลักในสถานประกอบการ</th>
                          <th className="border border-black p-2">งานย่อยในสถานประกอบการ</th>
                          <th className="border border-black p-2">ชื่อ-สกุล ครูฝึก</th>
                          <th className="border border-black p-2 w-28">เวลาฝึก (วัน/ชม.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workplaceTasksFlat.map((t, i) => (
                          <tr key={i} className="font-serif">
                            <td className="border border-black p-2 text-center">{config.occupation || '-'}</td>
                            <td className="border border-black p-2">{cleanTaskName(t.parentMainTaskName)}</td>
                            <td className="border border-black p-2 font-bold">{cleanTaskName(t.workplaceName)}</td>
                            <td className="border border-black p-2 text-center">{config.trainerName || '-'}</td>
                            <td className="border border-black p-2 text-center font-bold">
                              {Number((t.hours / (config.hoursPerDay || 8)).toFixed(1))} วัน<br /><span className="text-[8pt] text-slate-600">({t.hours} ชม.)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ฝอ.2 */}
                <div id="dve-0406-area" className={activeReportView !== 'dve0406' ? 'hidden' : ''}>
                  <div className="page-break font-serif">
                    {workplaceTasksFlat.map((task, idx) => (
                      <div key={idx} className="mb-20 border-2 border-black p-6 font-serif">
                        <div className="text-right text-[10pt] mb-1 border p-1 w-fit ml-auto italic font-serif">DVE-04-06 (ฝอ.๒)</div>

                        <div className="report-header font-serif text-[11pt] space-y-1.5">
                          <h2 className="text-center font-black text-[14pt] underline mb-6 uppercase font-serif">แผนการฝึกอาชีพรายหน่วยสถานประกอบการ {config.companyName || '................'}</h2>
                          <p>ผู้เข้ารับการฝึกระบบทวิภาคี วิทยาลัย {config.collegeName || '................'} ระดับชั้น {config.level || '................'}</p>
                          <p>อาชีพ / ตำแหน่งงานที่ฝึก {config.occupation || '................'}</p>
                          <p className="mt-2 font-bold font-serif">งานหลัก {task.mainTaskIndex}. {cleanTaskName(task.parentMainTaskName) || '................'}</p>
                          <p className="font-bold text-indigo-700 font-serif">งานย่อย {task.subTaskIndex}. {cleanTaskName(task.workplaceName) || '................'} เวลาฝึก: {Number((task.hours / (config.hoursPerDay || 8)).toFixed(1))} วัน /{task.hours} ชั่วโมง</p>
                          {!isWorkplaceTrainer && <p>ผลลัพธ์การเรียนรู้: <span className="font-bold font-serif">{cleanTaskName(task.name) || '................'}</span></p>}                          <p>ชื่อ-สกุล ครูฝึก {config.trainerName || '................'} ตำแหน่ง {config.trainerPosition || '................'}</p>
                        </div>

                        <table className="w-full text-[9pt] border-collapse border-2 border-black font-serif">
                          <thead>
                            <tr className="bg-slate-100 font-bold text-center font-serif">
                              <th className="border border-black p-1 w-8" rowSpan="2">ที่</th>
                              <th className="border border-black p-1 w-1/4" rowSpan="2">ขั้นตอนการปฏิบัติงาน</th>
                              <th className="border border-black p-1 w-1/4" rowSpan="2">จุดประสงค์เชิงพฤติกรรม</th>
                              <th className="border border-black p-1" colSpan="4">ระดับความสามารถที่ต้องการ</th>
                              <th className="border border-black p-1" rowSpan="2">วิธีสอน</th>
                              <th className="border border-black p-1" rowSpan="2">สื่อ / อุปกรณ์</th>
                              <th className="border border-black p-1" rowSpan="2">การประเมิน</th>
                            </tr>
                            <tr className="bg-slate-50 font-bold text-center text-[7pt] font-serif">
                              <th className="border border-black w-7">K</th>
                              <th className="border border-black w-7">S</th>
                              <th className="border border-black w-7">A</th>
                              <th className="border border-black w-8">Ap</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(task.detailed_steps || []).map((step, si) => (
                              <tr key={si} className="align-top leading-tight font-serif">
                                <td className="border border-black p-1 text-center font-bold">{si + 1}</td>
                                <td className="border border-black p-1 font-bold leading-relaxed">{step.step_text}</td>
                                <td className="border border-black p-1 space-y-1 text-[8pt] font-serif">
                                  <p><b>K:</b> {step.objectives?.k || '-'}</p>
                                  <p><b>S:</b> {step.objectives?.s || '-'}</p>
                                  <p><b>A:</b> {step.objectives?.a || '-'}</p>
                                  <p><b>Ap:</b> {step.objectives?.ap || '-'}</p>
                                </td>
                                <td className="border border-black p-1 text-center font-bold text-blue-900">K{step.levels?.k || 1}</td>
                                <td className="border border-black p-1 text-center font-bold text-green-900">S{step.levels?.s || 1}</td>
                                <td className="border border-black p-1 text-center font-bold text-amber-900">A{step.levels?.a || 1}</td>
                                <td className="border border-black p-1 text-center font-bold text-purple-900">Ap{step.levels?.ap || 1}</td>
                                <td className="border border-black p-1 text-[8pt] text-center">สาธิต/ปฏิบัติ</td>
                                <td className="border border-black p-1 text-[8pt] text-left leading-relaxed">{step.equipment || 'ของจริง / คู่มือ'}</td>
                                <td className="border border-black p-1 text-[8pt] text-center">สังเกตพฤติกรรม</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* EVALUATIONS TAB */}
        {activeTab === 'evaluation' && (
          <div className="space-y-12 max-w-7xl mx-auto font-serif text-[11pt] animate-in fade-in duration-700">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl font-serif">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 border-b pb-4 gap-4 font-serif">
                <h3 className="text-xl font-black text-indigo-700 uppercase font-serif tracking-widest flex items-center gap-3"><ClipboardCheck /> แบบประเมินและสรุปผล</h3>
                <div className="flex flex-wrap sm:flex-row gap-2 w-full lg:w-auto">
                  {/* ปุ่มที่ 1: ประเมินปฏิบัติงานย่อย (เห็นทุกคน) */}
                  <button
                    onClick={() => setActiveEvalView('eval_workplace')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all whitespace-nowrap ${activeEvalView === 'eval_workplace' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'}`}
                  >
                    <FileText size={16} /> 1. ประเมินปฏิบัติงาน (ย่อย)
                  </button>

                  {/* ปุ่มที่ 2: แบบนิเทศ (ซ่อนเฉพาะครูฝึกในสถานประกอบการ) */}
                  {currentUserRole !== 'ครูฝึกในสถานประกอบการ' && (
                    <button
                      onClick={() => setActiveEvalView('eval_supervision')}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all whitespace-nowrap ${activeEvalView === 'eval_supervision' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'}`}
                    >
                      <FileText size={16} /> 2. แบบนิเทศติดตาม (รายวิชา)
                    </button>
                  )}

                  {/* ปุ่มที่ 3: สรุปผลการเรียนรู้ (ซ่อนเฉพาะครูฝึกในสถานประกอบการ) */}
                  {currentUserRole !== 'ครูฝึกในสถานประกอบการ' && (
                    <button
                      onClick={() => setActiveEvalView('dve1102')}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all whitespace-nowrap ${activeEvalView === 'dve1102' ? 'bg-amber-500 text-white' : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'}`}
                    >
                      <FileText size={16} /> 3. สรุปผลการเรียนรู้รายวิชา
                    </button>
                  )}

                  <div className="hidden sm:block border-l border-slate-200 mx-1"></div>

                  {/* ส่วน Switch สำหรับ Admin (ปรากฏเมื่อเป็น Admin และอยู่ในหน้าประเมินย่อยหรือนิเทศ) */}
                  {isDeveloper && (activeEvalView === 'eval_workplace' || activeEvalView === 'eval_supervision') && (
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setCurrentUserRole('ครู')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${currentUserRole !== 'ครูฝึกในสถานประกอบการ' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        มุมมองครูนิเทศก์
                      </button>
                      <button
                        onClick={() => setCurrentUserRole('ครูฝึกในสถานประกอบการ')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${currentUserRole === 'ครูฝึกในสถานประกอบการ' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        มุมมองครูฝึก
                      </button>
                    </div>
                  )}
                </div>

                <div className="hidden sm:block border-l border-slate-200 mx-1"></div>

                <button
                  onClick={() => setShowDownloadConfirm(activeEvalView)}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-2xl text-xs font-bold hover:bg-green-700 shadow-md active:scale-95 flex items-center gap-2 transition-all whitespace-nowrap"
                >
                  <FileDown size={18} /> ดาวน์โหลดเอกสารนี้
                </button>
              </div>
            </div>

            {/* การตั้งค่าแบบประเมิน */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
              <h4 className="text-sm font-bold text-slate-700 mb-4 border-b pb-2">ตั้งค่ารูปแบบการประเมินติดตาม</h4>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <label className="text-xs font-bold text-slate-500 block mb-2">เลือกรูปแบบมาตราส่วน (Rating Scale)</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="evalType" checked={evalFormType === 'checklist'} onChange={() => setEvalFormType('checklist')} className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm">แบบเช็คลิสต์ (ทำได้ / ทำไม่ได้)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="evalType" checked={evalFormType === '5'} onChange={() => setEvalFormType('5')} className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm">แบบประเมิน 5 ระดับ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="evalType" checked={evalFormType === '4'} onChange={() => setEvalFormType('4')} className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm">แบบประเมิน 4 ระดับ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="evalType" checked={evalFormType === '3'} onChange={() => setEvalFormType('3')} className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm">แบบประเมิน 3 ระดับ</span>
                    </label>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <label className="text-xs font-bold text-slate-500 block mb-2">เลือกรายการประเมิน ด้านกิจนิสัย</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BEHAVIOR_OPTIONS.map(beh => (
                      <label key={beh} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedBehaviors.includes(beh)} onChange={() => handleBehaviorToggle(beh)} className="text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                        <span className="text-[11px] text-slate-700">{beh}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* พื้นที่สำหรับสร้างเอกสาร แบบประเมินปฏิบัติงาน (รายงานย่อย ขั้นตอนการปฏิบัติงาน) */}
            {activeEvalView === 'eval_workplace' && (
              <div id="dve-eval-workplace-area" className="font-serif">
                {workplaceTasksFlat.map((task, idx) => {
                  let colCount = 4;
                  if (evalFormType === '5') colCount = 7;
                  if (evalFormType === '4') colCount = 6;
                  if (evalFormType === '3') colCount = 5;

                  return (
                    <div key={`eval-wp-${idx}`} className="page-break mb-20 font-serif">
                      <div className="text-right text-[10pt] mb-2 font-bold italic font-serif border-2 border-black p-1 w-fit ml-auto">แบบประเมินปฏิบัติงาน</div>
                      <div className="text-center font-bold mb-6">
                        <h2 className="text-[18pt] uppercase mb-2">แบบประเมินการปฏิบัติงานในสถานประกอบการ</h2>
                      </div>

                      <div className="text-[14pt] mb-6 space-y-1">
                        <p><b>ชื่อนักเรียน:</b> .................................................................... <b>สาขา:</b> {config.major || '....................................................................'}</p>
                        <p><b>สถานประกอบการ:</b> {config.companyName || '....................................................................'} <b>อาชีพที่ฝึก:</b> {config.occupation || '....................................................................'}</p>
                        <p><b>งานหลัก:</b> {task.mainTaskIndex}. {cleanTaskName(task.parentMainTaskName) || '........................................................................................'}</p>
                        <p><b>งานย่อยที่ปฏิบัติ:</b> {task.subTaskIndex}. {cleanTaskName(task.workplaceName) || '........................................................................................'}</p>
                      </div>

                      <p className="mb-2 font-bold text-[14pt]">คำชี้แจง โปรดทำเครื่องหมาย ✓ลงในช่องที่เห็นว่าตรงกับความเป็นจริงมากที่สุด</p>

                      <table className="w-full text-[12pt] border-collapse border-2 border-black font-serif mb-4">
                        <thead>
                          <tr className="bg-slate-100 font-bold text-center">
                            <th className="border border-black p-2 w-[40%] align-middle text-center">หัวข้อประเมิน (งานย่อย)</th>
                            {evalFormType === 'checklist' && (
                              <>
                                <th className="border border-black p-2 w-20 align-middle">ทำได้</th>
                                <th className="border border-black p-2 w-20 align-middle">ทำไม่ได้</th>
                              </>
                            )}
                            {evalFormType === '5' && (
                              <>
                                <th className="border border-black p-2 w-12 align-middle">5</th>
                                <th className="border border-black p-2 w-12 align-middle">4</th>
                                <th className="border border-black p-2 w-12 align-middle">3</th>
                                <th className="border border-black p-2 w-12 align-middle">2</th>
                                <th className="border border-black p-2 w-12 align-middle">1</th>
                              </>
                            )}
                            {evalFormType === '4' && (
                              <>
                                <th className="border border-black p-2 w-12 align-middle">4</th>
                                <th className="border border-black p-2 w-12 align-middle">3</th>
                                <th className="border border-black p-2 w-12 align-middle">2</th>
                                <th className="border border-black p-2 w-12 align-middle">1</th>
                              </>
                            )}
                            {evalFormType === '3' && (
                              <>
                                <th className="border border-black p-2 w-12 align-middle">3</th>
                                <th className="border border-black p-2 w-12 align-middle">2</th>
                                <th className="border border-black p-2 w-12 align-middle">1</th>
                              </>
                            )}
                            <th className="border border-black p-2 align-middle">ข้อเสนอแนะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-slate-50 font-bold">
                            <td colSpan={colCount} className="border border-black p-2 pl-4">ส่วนที่ 1 การปฏิบัติงานย่อย</td>
                          </tr>
                          {task.detailed_steps?.length > 0 ? task.detailed_steps.map((step, i) => (
                            <tr key={i} className="align-top">
                              <td className="border border-black p-2 pl-4 text-left">{task.subTaskIndex}.{i + 1} {step.step_text}</td>
                              {Array.from({ length: colCount - 2 }).map((_, j) => <td key={j} className="border border-black p-2"></td>)}
                              <td className="border border-black p-2"></td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={colCount} className="border border-black p-2 text-center text-slate-400">ไม่มีขั้นตอนการปฏิบัติงาน</td>
                            </tr>
                          )}

                          {selectedBehaviors.length > 0 && (
                            <React.Fragment>
                              <tr className="bg-slate-50 font-bold">
                                <td colSpan={colCount} className="border border-black p-2 pl-4">ส่วนที่ 2 ด้านกิจนิสัย</td>
                              </tr>
                              {selectedBehaviors.map((beh, i) => (
                                <tr key={`beh-${i}`} className="align-top">
                                  <td className="border border-black p-2 pl-4 text-left">{i + 1}. {beh}</td>
                                  {Array.from({ length: colCount - 2 }).map((_, j) => <td key={j} className="border border-black p-2"></td>)}
                                  <td className="border border-black p-2"></td>
                                </tr>
                              ))}
                            </React.Fragment>
                          )}
                        </tbody>
                      </table>

                      <div className="mb-6 text-[12pt] leading-relaxed">
                        <b>เกณฑ์การให้คะแนน (Rubric):</b><br />
                        {evalFormType === '5' && "5 = ปฏิบัติได้ดีมาก/ถูกต้องสมบูรณ์, 4 = ปฏิบัติได้ดี/มีข้อผิดพลาดเล็กน้อย, 3 = ปฏิบัติได้ปานกลาง/ต้องได้รับคำแนะนำบ้าง, 2 = ปฏิบัติได้พอใช้/ต้องคอยกำกับดูแล, 1 = ต้องปรับปรุง/ไม่สามารถปฏิบัติได้"}
                        {evalFormType === '4' && "4 = ปฏิบัติได้ดีมาก/ถูกต้องสมบูรณ์, 3 = ปฏิบัติได้ดี/มีข้อผิดพลาดเล็กน้อย, 2 = ปฏิบัติได้พอใช้/ต้องคอยกำกับดูแล, 1 = ต้องปรับปรุง/ไม่สามารถปฏิบัติได้"}
                        {evalFormType === '3' && "3 = ปฏิบัติได้ดี/ถูกต้องสมบูรณ์, 2 = ปฏิบัติได้พอใช้/ต้องคอยกำกับดูแล, 1 = ต้องปรับปรุง/ไม่สามารถปฏิบัติได้"}
                        {evalFormType === 'checklist' && "ทำได้ = สามารถปฏิบัติงานได้ตามจุดประสงค์การประเมิน, ทำไม่ได้ = ไม่สามารถปฏิบัติงานได้ตามจุดประสงค์การประเมิน"}
                      </div>

                      <div className="mb-8 text-[14pt]">
                        <p>ความคิดเห็นเพิ่มเติม/ข้อเสนอแนะ..........................................................................................................................................</p>
                        <p>.......................................................................................................................................................................................</p>
                      </div>

                      <div className="flex justify-between mt-12 text-[14pt] px-10">
                        <div className="text-center">
                          <p className="mb-6">ลงชื่อ..................................................................</p>
                          <p>(..............................................................)</p>
                          <p>ผู้รับการประเมิน (นักเรียน)</p>
                        </div>
                        <div className="text-center">
                          <p className="mb-6">ลงชื่อ..................................................................</p>
                          <p>({config.trainerName || '..............................................................'})</p>
                          <p>ผู้ประเมิน (ครูฝึก/ผู้ควบคุมงาน)</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* พื้นที่สำหรับสร้างเอกสาร แบบนิเทศติดตามประเมินผล (ตามรายวิชา) */}
            {activeEvalView === 'eval_supervision' && currentUserRole !== 'ครูฝึกในสถานประกอบการ' && (
              <div id="dve-supervision-area" className="font-serif">

                {/* 🔴 เพิ่มส่วนแจ้งเตือน: ถ้ายังไม่มีวิชา ให้แสดงกล่องข้อความแทนการปล่อยจอโล่ง */}
                {subjects.filter(s => s.isAnalyzed).length === 0 ? (
                  <div className="text-center p-12 bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl mt-4">
                    <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-amber-800">ยังไม่พบข้อมูลรายวิชา</h3>
                    <p className="text-amber-700 mt-2 font-bold">กรุณาไปที่แท็บ "วิเคราะห์รายวิชา" เพื่อทำการวิเคราะห์<br />หรือโหลดไฟล์เซฟงานเดิมก่อน ระบบจึงจะสร้างแบบนิเทศได้ครับ</p>
                  </div>
                ) : (
                  subjects.filter(s => s.isAnalyzed).map(sub => {
                    // ดึงงานย่อยอย่างปลอดภัย ป้องกันจอขาว
                    const allSubTasks = (sub.mainTasks || []).flatMap(mt => mt?.subTasks || []);

                    const mappedTasksForThisSubject = allSubTasks.filter(st => {
                      if (!st || !st.id) return false;
                      return workplaceTasksFlat.some(wt => {
                        let allTargetIds = [];
                        if (wt?.id) allTargetIds.push(...String(wt.id).split(','));
                        if (wt?.detailed_steps && Array.isArray(wt.detailed_steps)) {
                          wt.detailed_steps.forEach(step => {
                            if (step?.subjectTaskId) allTargetIds.push(...String(step.subjectTaskId).split(','));
                          });
                        }
                        const cleanTargetIds = allTargetIds.map(i => String(i).trim().toUpperCase());
                        const stId = String(st.id).trim().toUpperCase();
                        // เปลี่ยนจาก .includes เป็นการเช็คด้วย .startsWith() ทั้งสองทาง เพื่อให้ยืดหยุ่นขึ้นเมื่อ AI ส่งรหัสไม่ครบ
                        return cleanTargetIds.some(targetId =>
                          targetId.startsWith(stId) || stId.startsWith(targetId)
                        );
                      }); // <-- เพิ่มปิดวงเล็บของ workplaceTasksFlat.some ตรงนี้
                    }); // <-- เพิ่มปิดวงเล็บของ allSubTasks.filter ตรงนี้
                    let colCount = 4;
                    if (evalFormType === '5') colCount = 7;
                    if (evalFormType === '4') colCount = 6;
                    if (evalFormType === '3') colCount = 5;

                    return (
                      <div key={`supervision-${sub.id}`} className="page-break mb-20 font-serif">
                        <div className="text-center font-bold mb-6">
                          <h2 className="text-[18pt] mb-2">แบบนิเทศติดตามประเมินผลการฝึกอาชีพ</h2>
                          <p className="text-[16pt] font-normal">ระหว่างวิทยาลัย....................................................... กับบริษัท {config.companyName || '.......................................................'}</p>
                          <p className="text-[16pt] font-normal">รหัสวิชา {sub.code || '.........................'} รายวิชา {sub.name || '..................................................................'}</p>
                          <p className="text-[16pt] font-normal">ประจำเดือน.......................................................</p>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '15px', fontSize: '14pt' }}>
                          <tbody>
                            <tr>
                              <td style={{ width: '50%', border: '1px solid black', padding: '10px', verticalAlign: 'top', lineHeight: '1.8' }}>
                                ชื่อ....................................................... นามสกุล...................................................<br />
                                แผนกวิชา {config.fieldOfStudy || '.............................................'} ระดับชั้น {config.level || '........................'}<br />
                                ภาคเรียนที่................................... ปีการศึกษา {config.academicYear || '....................................'}<br />
                                ฝึกอาชีพระหว่างวันที่...................... เดือน............................................. พ.ศ. .........<br />
                                ถึงวันที่...................... เดือน............................................. พ.ศ. .........<br />
                              </td>
                              <td style={{ width: '50%', border: '1px solid black', padding: '10px', verticalAlign: 'top', lineHeight: '1.8' }}>
                                สถิติการฝึกอาชีพ<br />
                                ระยะเวลาที่ประเมินตั้งแต่ วันที่........... เดือน................................... พ.ศ. .........<br />
                                ถึงวันที่........... เดือน................................... พ.ศ. .........<br />
                                <div className="flex justify-between pr-4 md:pr-12">
                                  <span>(  ) สาย...................ครั้ง</span>
                                  <span>(  ) ขาดงาน...........วัน</span>
                                </div>
                                <div className="flex justify-between pr-4 md:pr-12">
                                  <span>(  ) ลาป่วย...........วัน</span>
                                  <span>(  ) ลากิจ...........วัน</span>
                                </div>
                                วันที่ประเมิน.....................................................................................
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p className="mb-2 font-bold text-[14pt]">คำชี้แจง โปรดทำเครื่องหมาย ✓ลงในช่องที่เห็นว่าตรงกับความเป็นจริงมากที่สุด</p>

                        <table className="w-full text-[12pt] border-collapse border-2 border-black font-serif mb-4">
                          <thead>
                            <tr className="bg-slate-100 font-bold text-center">
                              <th className="border border-black p-2 w-[40%] align-middle text-center">หัวข้อประเมิน (งานย่อย)</th>
                              {evalFormType === 'checklist' && (
                                <><th className="border border-black p-2 w-20 align-middle">ทำได้</th><th className="border border-black p-2 w-20 align-middle">ทำไม่ได้</th></>
                              )}
                              {evalFormType === '5' && (
                                <><th className="border border-black p-2 w-12 align-middle">5</th><th className="border border-black p-2 w-12 align-middle">4</th><th className="border border-black p-2 w-12 align-middle">3</th><th className="border border-black p-2 w-12 align-middle">2</th><th className="border border-black p-2 w-12 align-middle">1</th></>
                              )}
                              {evalFormType === '4' && (
                                <><th className="border border-black p-2 w-12 align-middle">4</th><th className="border border-black p-2 w-12 align-middle">3</th><th className="border border-black p-2 w-12 align-middle">2</th><th className="border border-black p-2 w-12 align-middle">1</th></>
                              )}
                              {evalFormType === '3' && (
                                <><th className="border border-black p-2 w-12 align-middle">3</th><th className="border border-black p-2 w-12 align-middle">2</th><th className="border border-black p-2 w-12 align-middle">1</th></>
                              )}
                              <th className="border border-black p-2 align-middle">ข้อเสนอแนะ</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-slate-50 font-bold"><td colSpan={colCount} className="border border-black p-2 pl-4">ส่วนที่ 1 การปฏิบัติงานย่อย</td></tr>
                            {mappedTasksForThisSubject.length > 0 ? mappedTasksForThisSubject.map((st, i) => (
                              <tr key={i} className="align-top">
                                <td className="border border-black p-2 pl-4 text-left">{st.id} {cleanTaskName(st.name)}</td>
                                {Array.from({ length: colCount - 2 }).map((_, j) => <td key={j} className="border border-black p-2"></td>)}
                                <td className="border border-black p-2"></td>
                              </tr>
                            )) : (
                              <tr><td colSpan={colCount} className="border border-black p-2 text-center text-slate-400">ไม่มีงานย่อยที่สอดคล้องกับสถานประกอบการ</td></tr>
                            )}

                            {selectedBehaviors.length > 0 && (
                              <React.Fragment>
                                <tr className="bg-slate-50 font-bold"><td colSpan={colCount} className="border border-black p-2 pl-4">ส่วนที่ 2 ด้านกิจนิสัย</td></tr>
                                {selectedBehaviors.map((beh, i) => (
                                  <tr key={`beh-${i}`} className="align-top">
                                    <td className="border border-black p-2 pl-4 text-left">{i + 1}. {beh}</td>
                                    {Array.from({ length: colCount - 2 }).map((_, j) => <td key={j} className="border border-black p-2"></td>)}
                                    <td className="border border-black p-2"></td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            )}
                          </tbody>
                        </table>

                        <div className="mb-6 text-[12pt] leading-relaxed">
                          <b>เกณฑ์การให้คะแนน (Rubric):</b><br />
                          {evalFormType === '5' && "5 = ปฏิบัติได้ดีมาก/ถูกต้องสมบูรณ์, 4 = ปฏิบัติได้ดี/มีข้อผิดพลาดเล็กน้อย, 3 = ปฏิบัติได้ปานกลาง/ต้องได้รับคำแนะนำบ้าง, 2 = ปฏิบัติได้พอใช้/ต้องคอยกำกับดูแล, 1 = ต้องปรับปรุง/ไม่สามารถปฏิบัติได้"}
                          {evalFormType === '4' && "4 = ปฏิบัติได้ดีมาก/ถูกต้องสมบูรณ์, 3 = ปฏิบัติได้ดี/มีข้อผิดพลาดเล็กน้อย, 2 = ปฏิบัติได้พอใช้/ต้องคอยกำกับดูแล, 1 = ต้องปรับปรุง/ไม่สามารถปฏิบัติได้"}
                          {evalFormType === '3' && "3 = ปฏิบัติได้ดี/ถูกต้องสมบูรณ์, 2 = ปฏิบัติได้พอใช้/ต้องคอยกำกับดูแล, 1 = ต้องปรับปรุง/ไม่สามารถปฏิบัติได้"}
                          {evalFormType === 'checklist' && "ทำได้ = สามารถปฏิบัติงานได้ตามจุดประสงค์การประเมิน, ทำไม่ได้ = ไม่สามารถปฏิบัติงานได้ตามจุดประสงค์การประเมิน"}
                        </div>

                        <div className="flex justify-between mt-12 text-[14pt] px-10">
                          <div className="text-center">
                            <p className="mb-6">ลงชื่อ..................................................................</p>
                            <p>(..............................................................)</p>
                            <p>ผู้รับการประเมิน</p>
                          </div>
                          <div className="text-center">
                            <p className="mb-6">ลงชื่อ..................................................................</p>
                            <p>({config.trainerName || '..............................................................'})</p>
                            <p>ผู้ประเมิน</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* พื้นที่สำหรับสร้างเอกสาร สรุปภาพรวมการฝึกงาน */}
            {activeEvalView === 'dve1102' && !isWorkplaceTrainer && (
              <div id="dve-11-02-area" className="font-serif">
                {subjects.filter(s => s.isAnalyzed).map(sub => {
                  const mappedTasksForThisSubject = workplaceTasksFlat.filter(wt => {
                    let isMatched = false;
                    if (wt.id) {
                      const ids = String(wt.id).split(',').map(id => id.trim().toUpperCase());
                      if (ids.some(id => id.startsWith(sub.id.toUpperCase()))) isMatched = true;
                    }
                    if (!isMatched && wt.detailed_steps) {
                      wt.detailed_steps.forEach(step => {
                        if (step.subjectTaskId) {
                          const ids = String(step.subjectTaskId).split(',').map(id => id.trim().toUpperCase());
                          if (ids.some(id => id.startsWith(sub.id.toUpperCase()))) isMatched = true;
                        }
                      });
                    }
                    return isMatched;
                  });
                  const unmappedTasksForThisSubject = unmappedTasks.filter(st => st.subjectId === sub.id);

                  return (
                    <div key={`dve1102-${sub.id}`} className="page-break mb-20 font-serif">
                      <div className="text-right text-[10pt] mb-1 font-bold font-serif border border-black p-1 w-fit ml-auto">DVE-11-02</div>
                      <div className="text-center font-bold mb-4">
                        <h2 className="text-[18pt] mb-2">แบบสรุปผลการเรียนรู้รายวิชา</h2>
                      </div>

                      <div className="text-[12pt] mb-4 leading-relaxed">
                        รหัสวิชา {sub.code || '................'} ชื่อวิชา {sub.name || '........................................................'} หน่วยกิต {sub.credits || '........'}<br />
                        <table className="w-full mt-2" style={{ border: 'none', marginBottom: '0' }}>
                          <tbody>
                            <tr>
                              <td style={{ border: 'none', padding: '0', width: '60%' }}>ชื่อ-สกุล ..........................................................................................</td>
                              <td style={{ border: 'none', padding: '0' }}>รหัสผู้เรียน ...........................................................</td>
                            </tr>
                          </tbody>
                        </table>
                        ชื่อสถานประกอบการ {config.companyName || '............................................................................................................'}
                      </div>

                      <table className="w-full text-[12pt] border-collapse border border-black font-serif">
                        <thead>
                          <tr className="bg-slate-100 text-center font-bold">
                            <th className="border border-black p-2 align-middle text-left" rowSpan="2" style={{ width: '40%' }}>ชื่องานในสถานประกอบการ (งานหลัก)</th>
                            <th className="border border-black p-2 align-middle" colSpan="2" style={{ width: '12%' }}>จำนวน</th>
                            <th className="border border-black p-2" colSpan="4">สถานประกอบการ (70%)</th>
                            <th className="border border-black p-2" colSpan="2">ครูนิเทศก์ (30%)</th>
                            <th className="border border-black p-2 align-middle bg-yellow-100" rowSpan="2" style={{ width: '8%' }}>รวม</th>
                          </tr>
                          <tr className="bg-slate-50 text-center font-bold text-[11pt]">
                            <th className="border border-black p-1" colSpan="2">คะแนน</th>
                            <th className="border border-black p-1 w-10">ครั้งที่ 1</th>
                            <th className="border border-black p-1 w-10">ครั้งที่ 2</th>
                            <th className="border border-black p-1 w-10">ครั้งที่ 3</th>
                            <th className="border border-black p-1 w-14">ร้อยละ 70</th>
                            <th className="border border-black p-1 w-12">คะแนน</th>
                            <th className="border border-black p-1 w-14">ร้อยละ 30</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-slate-50">
                            <td colSpan="10" className="border border-black p-2 font-bold text-left">
                              ส่วนที่ 1 การปฏิบัติงาน (เรียงตามรหัสงานรายวิชา {sub.id})
                            </td>
                          </tr>

                          {(() => {
                            // 1. ดึงงานย่อยทั้งหมดจากพูล (Pool) ของรายวิชานี้
                            const subjectSubTasks = sub.mainTasks?.flatMap(mt => mt.subTasks || []) || [];

                            // 2. กรองเฉพาะงานย่อยที่ถูกนำมาจับคู่ (Mapped) กับงานในสถานประกอบการแล้ว
                            const filteredTasks = subjectSubTasks.filter(st => {
                              return workplaceTasksFlat.some(wt => {
                                const ids = String(wt.id || '').split(',').map(i => i.trim().toUpperCase());
                                const stepIds = (wt.detailed_steps || []).flatMap(s => String(s.subjectTaskId || '').split(',').map(i => i.trim().toUpperCase()));
                                return ids.includes(st.id.toUpperCase()) || stepIds.includes(st.id.toUpperCase());
                              });
                            });

                            // 3. แสดงผลเรียงตามรหัสงานย่อยรายวิชา (เช่น A1-1, A1-2) โดยไม่มีเลขลำดับ 1. 2. 3. นำหน้า
                            return filteredTasks.length > 0 ? filteredTasks.map((st) => (
                              <tr key={st.id} className="align-top">
                                <td className="border border-black p-2 pl-4 text-left font-serif">
                                  <span className="font-bold">{st.id}</span> {cleanTaskName(st.name)}
                                </td>
                                <td className="border border-black p-1 w-10"></td>
                                <td className="border border-black p-1 text-center text-[10pt] align-middle text-slate-700">คะแนน</td>
                                <td className="border border-black p-2"></td>
                                <td className="border border-black p-2"></td>
                                <td className="border border-black p-2"></td>
                                <td className="border border-black p-2 bg-blue-50/50"></td>
                                <td className="border border-black p-2"></td>
                                <td className="border border-black p-2 bg-blue-50/50"></td>
                                <td className="border border-black p-2"></td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan="10" className="border border-black p-2 text-center text-slate-400 italic">
                                  -- ไม่พบงานย่อยของรายวิชา {sub.id} ที่สอดคล้องกับการฝึก --
                                </td>
                              </tr>
                            );
                          })()}
                          {unmappedTasksForThisSubject.length > 0 && (
                            <>
                              <tr className="bg-red-50">
                                <td colSpan="10" className="border border-black p-2 font-bold text-left text-red-800">
                                  สมรรถนะที่จัดการเรียนการสอนเพิ่มเติม (ไม่สอดคล้องกับสถานประกอบการ)
                                </td>
                              </tr>
                              {unmappedTasksForThisSubject.map((st) => (
                                <tr key={`unmap-${st.id}`} className="align-top bg-red-50/30">
                                  <td className="border border-black p-2 pl-4 text-left font-serif opacity-70">
                                    <span className="font-bold">{st.id}</span> {cleanTaskName(st.name)}
                                  </td>
                                  <td colSpan="9" className="border border-black p-2 text-center text-red-600 text-[9pt] italic align-middle">
                                    * จัดการเรียนการสอนและประเมินผลเพิ่มเติม ณ สถานศึกษา
                                  </td>
                                </tr>
                              ))}
                            </>
                          )}
                          {/* ส่วนที่ 2 ด้านกิจนิสัย */}
                          <tr className="bg-blue-100/30">
                            <td colSpan="10" className="border border-black p-2 font-bold pl-6">ส่วนที่ 2 ด้านกิจนิสัย</td>
                          </tr>
                          {selectedBehaviors.map((beh, idx) => (
                            <tr key={`beh-${idx}`} className="align-top">
                              <td className="border border-black p-2 pl-4 text-left">{idx + 1}. {beh}</td>
                              <td className="border border-black p-1 w-10"></td>
                              <td className="border border-black p-1 text-center text-[10pt] align-middle text-slate-700">คะแนน</td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2 bg-blue-50/50"></td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2 bg-blue-50/50"></td>
                              <td className="border border-black p-2"></td>
                            </tr>
                          ))}

                          {/* ส่วนสรุปคะแนน */}
                          <tr className="font-bold">
                            <td className="border border-black p-2 text-center">รวมคะแนนฝึกในสถานประกอบการ</td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1 text-center font-bold text-[10pt] align-middle text-slate-700">คะแนน</td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2 bg-gray-200"></td>
                            <td className="border border-black p-2 bg-gray-200"></td>
                            <td className="border border-black p-2 bg-gray-200"></td>
                            <td className="border border-black p-2 bg-yellow-200"></td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="flex justify-between mt-12 text-[14pt] px-10">
                        <div className="text-center">
                          <p className="mb-6">ลงชื่อ..................................................................</p>
                          <p>(..............................................................)</p>
                          <p>ผู้รับการประเมิน</p>
                        </div>
                        <div className="text-center">
                          <p className="mb-6">ลงชื่อ..................................................................</p>
                          <p>({config.trainerName || '..............................................................'})</p>
                          <p>ผู้ประเมิน</p>
                        </div>
                      </div>
                    </div>
                  ); // ปิดส่วน return ของการ map()
                })}
              </div> // ปิด div id="dve-11-02-area"
            )}
          </div>
        )}

        {/* SHARE TAB (แชร์แผนฝึก) */}
        {activeTab === 'share' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500 font-serif">
            <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-black flex items-center gap-2"><UploadCloud /> {isDeveloper && editingCloudId ? 'บันทึกการแก้ไขทับข้อมูลเดิม' : 'แชร์แผนฝึกนี้เข้าสู่คลังกลาง'}</h2>
                <p className="text-indigo-200 text-sm">
                  {isDeveloper && editingCloudId
                    ? 'สิทธิ์แอดมิน: คุณสามารถบันทึกข้อมูลเพื่ออัปเดตทับข้อมูลเดิมในคลังกลางได้'
                    : 'เมื่อทำแผนฝึกของบริษัทเสร็จแล้ว คุณสามารถแชร์ขึ้นคลังข้อมูล เพื่อให้คุณครูท่านอื่นนำไปใช้ต่อได้'}
                </p>
                <div className="bg-indigo-700/50 p-4 rounded-xl mt-4 border border-indigo-500/50">
                  <p className="text-xs font-bold mb-2 flex items-center gap-1"><AlertCircle size={14} /> ข้อมูลที่จะถูกแชร์/อัปเดต:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside pl-4 text-indigo-100">
                    <li>ชื่อสถานประกอบการ: {config.companyName || '-'}</li>
                    <li>จังหวัด: {config.province || '-'}</li>
                    <li>ระดับชั้น: {config.level || '-'}</li>
                    <li>ชื่อผู้แชร์ (ครูฝึก): {config.trainerName || '-'}</li>
                    <li>จำนวนงานหลัก: {workplaceMainTasks.length} งาน</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={shareToCloud}
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-50 shadow-lg active:scale-95 transition-all w-full md:w-auto flex items-center justify-center gap-2"
              >
                {isDeveloper && editingCloudId ? <><Edit size={20} /> อัปเดตทับข้อมูลเดิม</> : <><Cloud size={20} /> ยืนยันการแชร์ข้อมูล</>}
              </button>
            </div>
          </div>
        )
        }

        {/* CLOUD TAB (คลังแผนฝึกอาชีพส่วนกลาง) */}
        {
          activeTab === 'cloud' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500 font-serif">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm font-serif">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                      <Cloud className="text-indigo-500" /> คลังแผนฝึกอาชีพส่วนกลาง
                      {isDeveloper && <span className="ml-2 bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-md">โหมดผู้ดูแลระบบ</span>}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">เลือกดาวน์โหลดหรือนำเข้าแผนฝึกของสถานประกอบการต่างๆ ที่เพื่อนครูจัดทำไว้</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select
                        className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        value={filterProvince}
                        onChange={(e) => setFilterProvince(e.target.value)}
                      >
                        <option value="">ทุกจังหวัด</option>
                        {PROVINCES.map(p => <option key={`filter-${p}`} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="ค้นหาสถานประกอบการ..."
                        className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cloudData.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 font-bold flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin mb-2" size={32} />
                      กำลังเชื่อมต่อคลังข้อมูล... หรือยังไม่มีข้อมูลในระบบ
                    </div>
                  ) : (
                    cloudData.filter(item => {
                      const matchProv = filterProvince === '' || item.province === filterProvince;
                      const matchQuery = searchQuery === '' || item.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
                      return matchProv && matchQuery;
                    }).map((item, idx) => (
                      <div key={item.id || idx} className={`bg-slate-50 border rounded-2xl p-5 hover:shadow-md transition-shadow group flex flex-col h-full relative ${item.deleteRequest ? 'border-orange-300 bg-orange-50/50' : 'border-slate-200'}`}>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-black text-indigo-900 text-lg leading-tight line-clamp-2 pr-6" title={item.companyName}>{item.companyName || 'ไม่ระบุชื่อบริษัท'}</h3>
                            <button
                              onClick={() => setDeleteModalItem(item)}
                              className="absolute top-5 right-4 text-slate-300 hover:text-red-500 p-1 flex-shrink-0 transition-colors"
                              title={isDeveloper ? "ลบข้อมูล (Admin)" : "แจ้งลบข้อมูล"}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="space-y-2 mb-6">
                            <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><MapPin size={14} className="text-rose-500" /> {item.province || 'ไม่ระบุจังหวัด'}</p>
                            <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><User size={14} className="text-indigo-500" /> ระดับ: {item.level || item.config?.level || 'ไม่ระบุ'}</p>
                            <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><User size={14} className="text-blue-500" /> จัดทำโดย: {item.creatorName || 'ไม่ระบุ'}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-2"><Clock size={12} /> อัปโหลดเมื่อ: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('th-TH') : 'ไม่ระบุ'}</p>

                            {item.deleteRequest && (
                              <div className="mt-3 bg-orange-100 border border-orange-200 text-orange-800 text-[10px] p-2 rounded-xl font-bold flex flex-col gap-2">
                                <div className="flex items-start gap-1.5">
                                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-orange-600" />
                                  <span>แจ้งลบ: {item.deleteRequest}</span>
                                </div>
                                {isDeveloper && (
                                  <button onClick={() => handleAdminCancelDelete(item.id)} className="w-full bg-white text-orange-600 py-1.5 rounded-lg hover:bg-orange-50 border border-orange-200 transition-colors">
                                    ยกเลิกคำขอลบ (คืนสถานะ)
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-200">
                          <button
                            onClick={() => loadFromCloudItem(item)}
                            className="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2 rounded-xl text-xs font-black transition-colors flex justify-center items-center gap-1"
                            title={isDeveloper ? "นำเข้าเพื่อแก้ไขทับข้อมูลเดิม" : "นำเข้าเพื่อแก้ไข"}
                          >
                            {isDeveloper ? <Edit size={14} /> : <Wand2 size={14} />} {isDeveloper ? 'แก้ไขข้อมูล' : 'นำเข้า'}
                          </button>
                          <button
                            onClick={() => downloadCloudItemAsFile(item)}
                            className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-2 rounded-xl text-xs font-black transition-colors flex justify-center items-center gap-1"
                          >
                            <DownloadCloud size={14} /> โหลดไฟล์
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* FEEDBACK TAB (ประเมินระบบ) */}
        {
          activeTab === 'feedback' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500 font-serif">
              <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 border-b pb-6 gap-6">
                  <div>
                    <h2 className="text-2xl font-black text-indigo-900 uppercase flex items-center gap-3"><Star /> ๗. ประเมินการใช้งานระบบ</h2>
                    <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest italic">ความคิดเห็นของคุณช่วยให้เราพัฒนาระบบให้ดียิ่งขึ้น</p>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  {[
                    { key: 'ux', label: '1. ความสะดวกและง่ายต่อการใช้งานระบบ' },
                    { key: 'ai', label: '2. ความแม่นยำและคุณภาพของระบบในการวิเคราะห์งาน' },
                    { key: 'ture', label: '3. ความถูกต้องในการจับคู่งานจากรายวิชาและงานในสถานประกอบการ' },
                    { key: 'reports', label: '4. ความถูกต้องและครบถ้วนของรูปแบบรายงานที่ได้ (ฝอ.1, ฝอ.2, แบบประเมิน)' },
                    { key: 'overall', label: '5. ประโยชน์ภาพรวมที่ได้รับจากการใช้งานระบบนี้' },
                    { key: 'time', label: '6. ช่วยลดระยะเวลาที่ใช้ในการจัดทำแผนฝึกให้กับครูนิเทศก์' },
                    { key: 'student', label: '7. ประโยชน์ที่นักศึกษาจะได้รับจากการแผนฝึกอาชีพ' },
                    { key: 'college', label: '8. เหมาะสมกับการจัดการเรียนการสอนของสถานศึกษา' }
                  ].map((q, idx) => (
                    <div key={q.key} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="font-bold text-slate-800 mb-4">{q.label}</p>
                      <div className="flex flex-wrap gap-2 md:gap-4">
                        {[5, 4, 3, 2, 1].map(score => (
                          <label key={score} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${systemFeedback[q.key] === score ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm scale-105' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                            <input type="radio" name={q.key} value={score} checked={systemFeedback[q.key] === score} onChange={() => setSystemFeedback({ ...systemFeedback, [q.key]: score })} className="hidden" />
                            <span className="text-xl font-black mb-1">{score}</span>
                            <span className="text-[10px] text-center">
                              {score === 5 ? 'ดีมาก' : score === 4 ? 'ดี' : score === 3 ? 'ปานกลาง' : score === 2 ? 'พอใช้' : 'ปรับปรุง'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MessageSquare size={18} /> ข้อเสนอแนะเพิ่มเติมเพื่อการพัฒนา</p>
                    <textarea
                      className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                      rows="4"
                      placeholder="พิมพ์ข้อเสนอแนะ ปัญหาที่พบ หรือฟีเจอร์ที่อยากให้มีเพิ่มเติม..."
                      value={systemFeedback.suggestion}
                      onChange={e => setSystemFeedback({ ...systemFeedback, suggestion: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={submitFeedback} disabled={isSubmittingFeedback} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg active:scale-95 transition-all flex items-center gap-3 disabled:bg-slate-300">
                    {isSubmittingFeedback ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} บันทึกการประเมิน
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </main >

      <footer className={`text-center text-[10px] py-8 border-t mt-8 pb-24 lg:pb-8 font-serif transition-colors duration-500 ${activeTab === 'cloud' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <p className="font-bold">© 2026 สุกฤษฏิ์พล โชติอรรฐพล. All Rights Reserved.</p>
        <p className="mt-1">ระบบวิเคราะห์และจัดทำแผนฝึกอาชีพ(ทวิภาคี)</p>
      </footer>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-start gap-2 z-50 shadow-2xl font-serif px-4 overflow-x-auto whitespace-nowrap scroll-smooth">
        {navItems.map(nav => (
          <button key={nav.id} onClick={() => nav.href ? window.open(nav.href, '_blank', 'noopener,noreferrer') : setActiveTab(nav.id)} className={`flex flex-col items-center justify-center gap-1 min-w-[72px] px-1 flex-shrink-0 h-full ${activeTab === nav.id ? 'text-indigo-600 border-t-2 border-indigo-600 -mt-[1px]' : 'text-slate-400'}`}>
            <nav.i size={18} className={activeTab === nav.id ? 'mt-1' : ''} /><span className="text-[9px] font-bold font-serif">{nav.baseLabel}</span>
          </button>
        ))}
      </nav>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div >
  );
};

export default App;
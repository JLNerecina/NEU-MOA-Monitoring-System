import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, addDoc, deleteDoc, where } from 'firebase/firestore';
import { UserProfile, MOA, UserRole, MOAStatus, IndustryType, Activity, AppNotification } from './types';
import { Layout, GlassCard } from './components/Layout';
import { LogIn, LogOut, Shield, FileText, Users, Search, Plus, Eye, Trash2, LayoutDashboard, Building2, UserCircle, Sun, Moon, Settings, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, X, Check, UserPlus, Lock, Download, EyeOff, Key, History, Bell, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO,
  isValid
} from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const COLLEGES = [
  'College of Accountancy',
  'College of Agriculture',
  'College of Arts and Sciences',
  'College of Business Administration',
  'College of Communication',
  'College of Informatics and Computing Studies',
  'College of Criminology',
  'College of Education',
  'College of Engineering & Architecture',
  'College of Law',
  'College of Medical Technology',
  'College of Medicine',
  'College of Midwifery',
  'College of Music',
  'College of Nursing',
  'College of Physical Therapy',
  'College of Respiratory Therapy',
  'School of International Relations',
  'School of Graduate Studies',
  'Integrated School'
];

function Calendar({ value, onChange, theme }: { value: Date | null, onChange: (date: Date) => void, theme: 'light' | 'dark' }) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const start = startOfWeek(startOfMonth(currentMonth));
  const end = endOfWeek(endOfMonth(currentMonth));
  
  const calendarDays = eachDayOfInterval({ start, end });

  return (
    <div className="w-[300px] p-5 select-none">
      <div className="flex items-center justify-between mb-4">
        <h4 className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <div className="flex gap-1">
          <button 
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className={cn("p-1 rounded-lg transition-colors", theme === 'dark' ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-600")}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className={cn("p-1 rounded-lg transition-colors", theme === 'dark' ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-600")}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div key={day} className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-tighter">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const isSelected = value && isSameDay(day, value);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(day)}
              className={cn(
                "h-8 w-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center",
                !isCurrentMonth && "opacity-20",
                isSelected 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold" 
                  : theme === 'dark'
                    ? "text-slate-300 hover:bg-white/10"
                    : "text-slate-700 hover:bg-slate-100",
                isToday && !isSelected && "border border-blue-500/50 text-blue-500"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DatePicker({ value, onChange, theme, placeholder, alignRight }: { value: string, onChange: (val: string) => void, theme: 'light' | 'dark', placeholder?: string, alignRight?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dateValue = value ? parseISO(value) : null;

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full border rounded-xl px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-all",
          theme === 'dark' ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
          isOpen && "ring-2 ring-blue-500/20 border-blue-500/50"
        )}
      >
        <span className={cn(!value && "text-slate-500")}>
          {value && isValid(dateValue) ? format(dateValue!, 'MMM dd, yyyy') : placeholder || 'Select date'}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute top-full mt-2 z-50 shadow-2xl rounded-3xl border backdrop-blur-2xl overflow-hidden",
                alignRight ? "right-0" : "left-0",
                theme === 'dark' ? "bg-slate-900/90 border-white/10" : "bg-white/90 border-slate-200"
              )}
            >
              <Calendar 
                value={dateValue} 
                theme={theme}
                onChange={(date) => {
                  onChange(format(date, 'yyyy-MM-dd'));
                  setIsOpen(false);
                }} 
              />
              <div className={cn("p-2 border-t flex justify-between", theme === 'dark' ? "border-white/5" : "border-slate-100")}>
                <button 
                  type="button"
                  onClick={() => { onChange(''); setIsOpen(false); }}
                  className="px-3 py-1 text-[10px] font-bold uppercase text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  Clear
                </button>
                <button 
                  type="button"
                  onClick={() => { onChange(format(new Date(), 'yyyy-MM-dd')); setIsOpen(false); }}
                  className="px-3 py-1 text-[10px] font-bold uppercase text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  Today
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [moas, setMoas] = useState<MOA[]>([]);
  const [viewingMoa, setViewingMoa] = useState<MOA | null>(null);
  const [view, setView] = useState<'dashboard' | 'partners' | 'account'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserAdmin, setShowUserAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    if (!profile) return;

    const unsubscribe = onSnapshot(collection(db, 'moas'), (snapshot) => {
      const moaData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MOA));
      setMoas(moaData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'moas');
    });
    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const userData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setUsers(userData);
      });
      return () => unsubscribe();
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    
    // Admins see all activities, others see only their own
    const q = profile.role === 'admin' 
      ? query(collection(db, 'activities'))
      : query(collection(db, 'activities'), where('userId', '==', profile.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activityData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activityData);
    });
    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    // Admins can see all notifications (to filter for SYSTEM_ALERTs), others see only their own
    const q = profile.role === 'admin'
      ? query(collection(db, 'notifications'))
      : query(collection(db, 'notifications'), where('userId', '==', profile.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification))
        .filter(n => n.userId === profile.uid || (profile.role === 'admin' && n.category === 'SYSTEM_ALERT'))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setNotifications(notifData);
    });
    return () => unsubscribe();
  }, [profile]);

  const logActivity = async (action: string, details: string, targetId?: string, targetType?: Activity['targetType']) => {
    if (!profile) return;
    const activity: any = {
      userId: profile.uid,
      userName: profile.displayName,
      userRole: profile.role,
      action,
      details,
      timestamp: new Date().toISOString(),
    };

    if (profile.college) activity.userCollege = profile.college;
    if (targetId) activity.targetId = targetId;
    if (targetType) activity.targetType = targetType;

    try {
      await addDoc(collection(db, 'activities'), activity);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const createNotification = async (userId: string, title: string, message: string, type: AppNotification['type'], category: AppNotification['category']) => {
    const notification: AppNotification = {
      userId,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      category
    };
    try {
      await addDoc(collection(db, 'notifications'), notification);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const trackAction = (moa: any, action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RECOVER' | 'AUTO_UPDATE') => {
    const entry = {
      userId: profile?.uid || 'unknown',
      userName: profile?.displayName || 'Unknown User',
      timestamp: new Date().toISOString(),
      action
    };
    return {
      ...moa,
      auditTrail: [...(moa.auditTrail || []), entry]
    };
  };

  const handleSoftDelete = async (moa: MOA) => {
    if (!moa.id) return;
    try {
      const { id, ...data } = moa;
      const updatedMoa = trackAction({ ...data, isDeleted: true }, 'DELETE');
      await setDoc(doc(db, 'moas', id), updatedMoa);
      await logActivity('DELETE_MOA', `Deleted MOA for ${moa.Company}`, id, 'MOA');
      
      // Notify students of the same college
      const studentsToNotify = users.filter(u => u.role === 'student' && u.college === moa.college);
      for (const student of studentsToNotify) {
        await createNotification(student.uid, 'MOA Deleted', `An MOA for ${moa.Company} in your college was deleted.`, 'WARNING', 'MOA_UPDATE');
      }

      // Notify faculty (the one who made the change)
      if (profile.role === 'faculty') {
        await createNotification(profile.uid, 'Action Recorded', `You deleted the MOA for ${moa.Company}`, 'WARNING', 'USER_ACTION');
      }

      // Notify admins
      const admins = users.filter(u => u.role === 'admin');
      for (const admin of admins) {
        await createNotification(admin.uid, 'System Activity', `${profile.displayName} deleted MOA for ${moa.Company}`, 'WARNING', 'SYSTEM_ACTIVITY');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `moas/${moa.id}`);
    }
  };

  const handleRecover = async (moa: MOA) => {
    if (!moa.id) return;
    try {
      const { id, ...data } = moa;
      const updatedMoa = trackAction({ ...data, isDeleted: false }, 'RECOVER');
      await setDoc(doc(db, 'moas', id), updatedMoa);
      await logActivity('RECOVER_MOA', `Recovered MOA for ${moa.Company}`, id, 'MOA');

      // Notify faculty
      if (profile.role === 'faculty') {
        await createNotification(profile.uid, 'Action Recorded', `You recovered the MOA for ${moa.Company}`, 'SUCCESS', 'USER_ACTION');
      }

      // Notify admins
      const admins = users.filter(u => u.role === 'admin');
      for (const admin of admins) {
        await createNotification(admin.uid, 'System Activity', `${profile.displayName} recovered MOA for ${moa.Company}`, 'INFO', 'SYSTEM_ACTIVITY');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `moas/${moa.id}`);
    }
  };

  const handleUpdate = async (moa: MOA) => {
    if (!moa.id) return;
    try {
      const { id, ...data } = moa;
      const updatedMoa = trackAction(data, 'UPDATE');
      await setDoc(doc(db, 'moas', id), updatedMoa);
      await logActivity('UPDATE_MOA', `Updated MOA for ${moa.Company}`, id, 'MOA');

      // Notify students of the same college
      const studentsToNotify = users.filter(u => u.role === 'student' && u.college === moa.college);
      for (const student of studentsToNotify) {
        await createNotification(student.uid, 'MOA Updated', `The status of MOA for ${moa.Company} was updated to: ${moa.Status}`, 'INFO', 'MOA_UPDATE');
      }

      // Notify faculty
      if (profile.role === 'faculty') {
        await createNotification(profile.uid, 'Action Recorded', `You updated the MOA for ${moa.Company}`, 'SUCCESS', 'USER_ACTION');
      }

      // Notify admins
      const admins = users.filter(u => u.role === 'admin');
      for (const admin of admins) {
        await createNotification(admin.uid, 'System Activity', `${profile.displayName} updated MOA for ${moa.Company}`, 'INFO', 'SYSTEM_ACTIVITY');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `moas/${moa.id}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.email?.endsWith('@neu.edu.ph') && firebaseUser.email !== 'johnliannerecina@gmail.com') {
          await signOut(auth);
          alert('Access restricted to @neu.edu.ph accounts.');
          setLoading(false);
          return;
        }

        setUser(firebaseUser);
        
        // Fetch or create profile
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (data.email === 'johnliannerecina@gmail.com') {
              data.role = 'admin';
            }
            if (data.isBlocked) {
              await signOut(auth);
              alert('Your account has been blocked. Please contact the administrator.');
              setLoading(false);
              return;
            }
            setProfile(data);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              role: firebaseUser.email === 'johnliannerecina@gmail.com' ? 'admin' : 'student',
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL || '',
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (user && profile && (profile.role === 'faculty' || profile.role === 'admin')) {
      const checkExpirations = async () => {
        const now = new Date();
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(now.getDate() + 60);

        for (const moa of moas) {
          if (!moa.EffectivityDate || moa.isDeleted || moa.Status === 'Expired: No renewal done') continue;

          // Skip if manually updated
          const lastAction = moa.auditTrail && moa.auditTrail.length > 0 ? moa.auditTrail[moa.auditTrail.length - 1].action : null;
          if (lastAction === 'UPDATE') continue;

          const expiryDate = new Date(moa.EffectivityDate);
          let newStatus: MOA['Status'] | null = null;

          if (expiryDate < now) {
            newStatus = 'Expired: No renewal done';
          } else if (expiryDate < sixtyDaysFromNow && moa.Status !== 'Expiring: Two months before expiration of date') {
            newStatus = 'Expiring: Two months before expiration of date';
          }

          if (newStatus && moa.id) {
            try {
              const { id, ...data } = moa;
              const updatedMoa = trackAction({ ...data, Status: newStatus }, 'AUTO_UPDATE');
              await setDoc(doc(db, 'moas', id), updatedMoa);
            } catch (error) {
              console.error(`Error updating status for ${moa.Company}:`, error);
            }
          }
        }
      };

      const timer = setTimeout(checkExpirations, 5000); // Run after 5s to allow data to settle
      return () => clearTimeout(timer);
    }
  }, [moas, user, profile]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <Layout theme={theme}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) {
    return (
      <Layout theme={theme}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <GlassCard theme={theme} className="p-10 max-w-md w-full text-center space-y-6">
            <div className={cn(
              "w-32 h-32 rounded-3xl flex items-center justify-center mx-auto overflow-hidden p-2",
              theme === 'dark' ? "bg-white/10" : "bg-slate-100"
            )}>
              <img src="/NEU Logo.svg" alt="NEU Logo" className="w-full h-full object-contain scale-110" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-2">
              <h1 className={cn("text-3xl font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>MOA Monitor</h1>
              <p className={theme === 'dark' ? "text-slate-400" : "text-slate-500"}>NEU Monitoring System</p>
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20"
            >
              <LogIn className="w-5 h-5" />
              Sign in with NEU Email
            </button>
            <div className="flex items-center justify-center gap-4 pt-4">
              <button 
                onClick={toggleTheme}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  theme === 'dark' ? "bg-white/5 text-yellow-400 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            <p className={cn("text-xs italic", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>Restricted to @neu.edu.ph accounts</p>
          </GlassCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout theme={theme}>
      <div className="max-w-7xl mx-auto p-3 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 md:gap-4 text-center lg:text-left">
            <div className={cn(
              "w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center overflow-hidden p-1 shrink-0",
              theme === 'dark' ? "bg-white/10" : "bg-white shadow-sm border border-slate-200"
            )}>
              <img src="/NEU Logo.svg" alt="NEU Logo" className="w-full h-full object-contain scale-110" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className={cn("text-xl md:text-3xl font-bold tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>MOA Monitoring</h1>
              <p className={cn("text-[10px] md:text-sm font-medium uppercase tracking-widest", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>
                {profile.role.toUpperCase()} DASHBOARD • {view.toUpperCase()} VIEW
              </p>
            </div>
          </div>
          
          <nav className={cn(
            "backdrop-blur-xl border p-1.5 md:p-2 rounded-2xl md:rounded-3xl flex items-center gap-1 md:gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar",
            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white/70 border-slate-200 shadow-sm"
          )}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'partners', label: 'Partners', icon: Building2 },
              { id: 'account', label: 'Account', icon: UserCircle },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={cn(
                  "px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 flex-1 lg:flex-none justify-center",
                  view === item.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : theme === 'dark' 
                      ? "text-slate-400 hover:text-white hover:bg-white/5" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className={cn("flex items-center gap-3 md:gap-4 pl-0 lg:pl-4 border-l-0 lg:border-l w-full lg:w-auto justify-center lg:justify-end", theme === 'dark' ? "border-white/10" : "border-slate-200")}>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "p-2 md:p-2.5 rounded-xl transition-all relative",
                  theme === 'dark' ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={cn(
                        "fixed sm:absolute top-20 sm:top-full left-4 right-4 sm:left-auto sm:right-0 z-50 sm:w-80 shadow-2xl rounded-3xl border backdrop-blur-2xl overflow-hidden",
                        theme === 'dark' ? "bg-slate-900/95 border-white/10" : "bg-white/95 border-slate-200"
                      )}
                    >
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-slate-900")}>Notifications</h3>
                        <button 
                          onClick={() => notifications.forEach(n => !n.read && markNotificationAsRead(n.id!))}
                          className="text-[10px] font-bold text-blue-500 hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-20" />
                            <p className="text-xs text-slate-500">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => markNotificationAsRead(notif.id!)}
                              className={cn(
                                "p-4 border-b border-white/5 cursor-pointer transition-colors",
                                !notif.read && (theme === 'dark' ? "bg-blue-500/5" : "bg-blue-50"),
                                theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-50"
                              )}
                            >
                              <div className="flex gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                  notif.type === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-500" :
                                  notif.type === 'WARNING' ? "bg-amber-500/10 text-amber-500" :
                                  notif.type === 'ERROR' ? "bg-rose-500/10 text-rose-500" :
                                  "bg-blue-500/10 text-blue-500"
                                )}>
                                  {notif.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> :
                                   notif.type === 'WARNING' ? <AlertTriangle className="w-4 h-4" /> :
                                   notif.type === 'ERROR' ? <AlertCircle className="w-4 h-4" /> :
                                   <Info className="w-4 h-4" />}
                                </div>
                                <div className="space-y-1">
                                  <p className={cn("text-xs font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{notif.title}</p>
                                  <p className="text-[10px] text-slate-500 leading-relaxed">{notif.message}</p>
                                  <p className="text-[8px] text-slate-600">{format(new Date(notif.timestamp), 'MMM dd, HH:mm')}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={toggleTheme}
              className={cn(
                "p-2 md:p-2.5 rounded-xl transition-all",
                theme === 'dark' ? "bg-white/5 text-yellow-400 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="text-right hidden md:block">
              <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{profile.displayName}</p>
              <p className={cn("text-[10px] uppercase tracking-widest", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>{profile.role}</p>
            </div>
            <img src={profile.photoURL} alt="Profile" className={cn("w-8 h-8 md:w-10 md:h-10 rounded-full border-2", theme === 'dark' ? "border-white/10" : "border-slate-200")} />
            <button onClick={handleLogout} className={cn("p-2 transition-colors", theme === 'dark' ? "text-slate-400 hover:text-rose-400" : "text-slate-500 hover:text-rose-600")}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {view === 'dashboard' && (
          <DashboardView 
            profile={profile} 
            moas={moas} 
            onSoftDelete={handleSoftDelete} 
            onRecover={handleRecover} 
            theme={theme}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            collegeFilter={collegeFilter}
            setCollegeFilter={setCollegeFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            viewingMoa={viewingMoa}
            setViewingMoa={setViewingMoa}
          />
        )}

        {view === 'partners' && (
          <PartnersView 
            profile={profile} 
            moas={moas} 
            onSoftDelete={handleSoftDelete} 
            onRecover={handleRecover} 
            onUpdate={handleUpdate} 
            trackAction={trackAction} 
            theme={theme} 
            viewingMoa={viewingMoa} 
            setViewingMoa={setViewingMoa}
            logActivity={logActivity}
            createNotification={createNotification}
            users={users}
          />
        )}

        {view === 'account' && (
          <div className="space-y-8">
            <AccountView profile={profile} theme={theme} moas={moas} activities={activities} />
            {profile.role === 'admin' && (
              <>
                <UserAdminView users={users} theme={theme} />
                <SystemActivityView activities={activities} theme={theme} />
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function DashboardView({ 
  profile, 
  moas, 
  onSoftDelete, 
  onRecover, 
  theme,
  searchQuery,
  setSearchQuery,
  collegeFilter,
  setCollegeFilter,
  dateRange,
  setDateRange,
  viewingMoa,
  setViewingMoa
}: { 
  profile: UserProfile, 
  moas: MOA[], 
  onSoftDelete: (moa: MOA) => void, 
  onRecover: (moa: MOA) => void, 
  theme: 'light' | 'dark',
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  collegeFilter: string,
  setCollegeFilter: (c: string) => void,
  dateRange: { start: string, end: string },
  setDateRange: (r: { start: string, end: string }) => void,
  viewingMoa: MOA | null,
  setViewingMoa: (moa: MOA | null) => void
}) {
  const filteredMoas = moas.filter(moa => {
    // Role based visibility
    if (profile.role === 'student') {
      if (moa.isDeleted || !moa.Status.startsWith('Approved')) return false;
    }
    if (profile.role === 'faculty') {
      if (moa.isDeleted) return false;
    }

    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || [
      moa.Company,
      moa.Address,
      moa.ContactPerson,
      moa.college,
      moa.IndustryType,
      moa.Status
    ].some(field => field?.toLowerCase().includes(searchLower));

    // College filter
    const matchesCollege = collegeFilter === 'All' || moa.college === collegeFilter;

    // Date range filter
    const moaDate = moa.EffectivityDate ? new Date(moa.EffectivityDate) : null;
    const matchesDate = (!dateRange.start || (moaDate && moaDate >= new Date(dateRange.start))) &&
                        (!dateRange.end || (moaDate && moaDate <= new Date(dateRange.end)));

    return matchesSearch && matchesCollege && matchesDate;
  });

  const stats = [
    { 
      label: 'Active Agreements', 
      value: moas.filter(m => !m.isDeleted && m.Status.startsWith('Approved')).length, 
      icon: Shield, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/20' 
    },
    { 
      label: 'Total Contributions', 
      value: moas.filter(m => !m.isDeleted).length, 
      icon: FileText, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20' 
    },
    { 
      label: 'Processing', 
      value: moas.filter(m => !m.isDeleted && m.Status.startsWith('Processing')).length, 
      icon: Users, 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/20' 
    },
    { 
      label: 'Expired', 
      value: moas.filter(m => !m.isDeleted && m.Status.startsWith('Expired')).length, 
      icon: AlertCircle, 
      color: 'text-rose-400', 
      bg: 'bg-rose-500/20' 
    },
  ];

  const colleges = ['All', ...COLLEGES];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <GlassCard key={i} theme={theme} className="p-6 flex items-center gap-6 group hover:scale-[1.02] transition-all duration-300">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", 
              stat.bg, stat.color
            )}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>{stat.label}</p>
              <h3 className={cn("text-3xl font-bold tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>{stat.value}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Total Records</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <GlassCard theme={theme} className="p-5 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Search Database</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-white border-slate-200 focus:border-blue-500"
                )} 
                placeholder="Company, ID, Person..." 
              />
            </div>
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">College Department</label>
            <select 
              value={collegeFilter}
              onChange={e => setCollegeFilter(e.target.value)}
              className={cn(
                "w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]",
                theme === 'dark' 
                  ? "bg-slate-800/50 border-white/10 text-white focus:border-blue-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]" 
                  : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]"
              )}
            >
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">From Date</label>
              <DatePicker 
                value={dateRange.start}
                onChange={val => setDateRange({ ...dateRange, start: val })}
                theme={theme}
                placeholder="Start date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">To Date</label>
              <DatePicker 
                value={dateRange.end}
                onChange={val => setDateRange({ ...dateRange, end: val })}
                theme={theme}
                placeholder="End date"
                alignRight
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Table Section */}
      <section className="space-y-4 relative z-10">
        <div className="flex items-end justify-between px-2">
          <div>
            <h3 className={cn("text-xl font-bold tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Agreement Records</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Master Database View</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              theme === 'dark' ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
            )}>
              {filteredMoas.length} Results Found
            </span>
          </div>
        </div>
        
        {/* Desktop Table */}
        <GlassCard theme={theme} className="overflow-hidden hidden md:block border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={cn("border-b", theme === 'dark' ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/50")}>
                  <th className={cn("px-6 py-5 text-[10px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>Partner Institution</th>
                  {profile.role !== 'student' && (
                    <th className={cn("px-6 py-5 text-[10px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>Status Indicator</th>
                  )}
                  <th className={cn("px-6 py-5 text-[10px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>Primary Contact</th>
                  {profile.role !== 'student' && (
                    <th className={cn("px-6 py-5 text-[10px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>Effectivity</th>
                  )}
                  {profile.role === 'admin' && (
                    <th className={cn("px-6 py-5 text-[10px] font-bold uppercase tracking-widest", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>Recent Activity</th>
                  )}
                  <th className={cn("px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-right", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme === 'dark' ? "divide-white/5" : "divide-slate-200")}>
                {filteredMoas.length === 0 ? (
                  <tr>
                    <td colSpan={profile.role === 'admin' ? 6 : profile.role === 'student' ? 3 : 5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Search className="w-8 h-8" />
                        <p className="text-sm italic">No records matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMoas.map((moa) => (
                    <tr key={moa.id} className={cn(
                      "transition-all duration-200 group", 
                      theme === 'dark' ? "hover:bg-white/[0.04]" : "hover:bg-blue-50/30",
                      moa.isDeleted && "opacity-40 grayscale-[0.5]"
                    )}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-sm transition-transform group-hover:scale-110",
                            theme === 'dark' ? "bg-gradient-to-br from-white/10 to-white/5 text-white" : "bg-white border border-slate-200 text-slate-600"
                          )}>
                            {moa.Company.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className={cn("font-bold text-sm block truncate", theme === 'dark' ? "text-white" : "text-slate-900")}>{moa.Company}</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight truncate max-w-[200px] block">{moa.Address}</span>
                            {moa.isDeleted && <span className="mt-1 inline-block px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-tighter">Deleted</span>}
                          </div>
                        </div>
                      </td>
                      {profile.role !== 'student' && (
                        <td className="px-6 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all group-hover:px-4",
                            moa.Status.startsWith('Approved') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            moa.Status.startsWith('Processing') ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          )}>
                            {moa.Status}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <p className={cn("text-xs font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>{moa.ContactPerson}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{moa.Email}</p>
                        </div>
                      </td>
                      {profile.role !== 'student' && (
                        <td className={cn("px-6 py-5 text-xs font-mono font-bold", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>
                          {moa.EffectivityDate ? new Date(moa.EffectivityDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '--'}
                        </td>
                      )}
                      {profile.role === 'admin' && (
                        <td className="px-6 py-5">
                          <div className={cn("max-h-20 overflow-y-auto text-[9px] space-y-1.5", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>
                            {moa.auditTrail?.slice(-2).map((entry, idx) => (
                              <div key={idx} className="flex flex-col border-l-2 border-blue-500/30 pl-2 pb-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-black text-blue-400/80">{entry.action}</span>
                                  <span className="opacity-50">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                </div>
                                <span className="opacity-60 italic">by {entry.userName}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setViewingMoa(moa)}
                            className={cn("p-2 rounded-lg transition-all hover:scale-110", theme === 'dark' ? "text-slate-400 hover:text-blue-400 hover:bg-blue-500/10" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50")} 
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {profile.role === 'admin' && moa.isDeleted && (
                            <button 
                              onClick={() => onRecover(moa)}
                              className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all hover:scale-110" 
                              title="Recover"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          {profile.role !== 'student' && !moa.isDeleted && (
                            <button 
                              onClick={() => onSoftDelete(moa)}
                              className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all hover:scale-110" 
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredMoas.length === 0 ? (
            <GlassCard theme={theme} className="p-10 text-center text-slate-500 italic">No records found.</GlassCard>
          ) : (
            filteredMoas.map((moa) => (
              <GlassCard key={moa.id} theme={theme} className={cn("p-5 space-y-4", moa.isDeleted && "opacity-50")}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
                      theme === 'dark' ? "bg-white/10" : "bg-slate-100 text-slate-600"
                    )}>
                      {moa.Company.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className={cn("font-bold text-base truncate", theme === 'dark' ? "text-white" : "text-slate-900")}>{moa.Company}</h4>
                      <p className="text-xs text-slate-500 truncate">{moa.Address}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setViewingMoa(moa)}
                      className={cn("p-2 transition-colors", theme === 'dark' ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900")}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {profile.role !== 'student' && !moa.isDeleted && (
                      <button onClick={() => onSoftDelete(moa)} className="p-2 text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {profile.role !== 'student' && (
                  <div className="flex flex-wrap gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      moa.Status.startsWith('Approved') ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                      moa.Status.startsWith('Processing') ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                      "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    )}>
                      {moa.Status}
                    </span>
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", theme === 'dark' ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600")}>
                      {moa.IndustryType}
                    </span>
                  </div>
                )}

                <div className={cn("grid grid-cols-2 gap-4 pt-4 border-t", theme === 'dark' ? "border-white/5" : "border-slate-100")}>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Contact</p>
                    <p className={cn("text-xs font-medium truncate", theme === 'dark' ? "text-slate-300" : "text-slate-700")}>{moa.ContactPerson}</p>
                    <p className="text-[10px] text-slate-500 truncate">{moa.Email}</p>
                  </div>
                  {profile.role !== 'student' && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Effectivity</p>
                      <p className={cn("text-xs font-mono", theme === 'dark' ? "text-slate-400" : "text-slate-600")}>{moa.EffectivityDate || '--'}</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </section>

      {viewingMoa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <GlassCard theme={theme} className="p-8 border-blue-500/20 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
              <h3 className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Partner Profile</h3>
              <button onClick={() => setViewingMoa(null)} className="text-slate-500 hover:text-slate-400">Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Company Name</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.Company}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">HTE ID</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.HTEID}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">College</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.college}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Industry Type</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.IndustryType}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Address</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.Address}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact Person</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.ContactPerson}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.Email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Effectivity Date</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.EffectivityDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.Status}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function PartnersView({ 
  profile, 
  moas, 
  onSoftDelete, 
  onRecover, 
  onUpdate, 
  trackAction, 
  theme, 
  viewingMoa, 
  setViewingMoa,
  logActivity,
  createNotification,
  users
}: { 
  profile: UserProfile, 
  moas: MOA[], 
  onSoftDelete: (moa: MOA) => void, 
  onRecover: (moa: MOA) => void, 
  onUpdate: (moa: MOA) => void, 
  trackAction: any, 
  theme: 'light' | 'dark', 
  viewingMoa: MOA | null, 
  setViewingMoa: (moa: MOA | null) => void,
  logActivity: (action: string, details: string, targetId?: string, targetType?: Activity['targetType']) => Promise<void>,
  createNotification: (userId: string, title: string, message: string, type: AppNotification['type'], category: AppNotification['category']) => Promise<void>,
  users: UserProfile[]
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingMoa, setEditingMoa] = useState<MOA | null>(null);
  const [newMoa, setNewMoa] = useState<Partial<MOA>>({
    HTEID: '', 
    Company: '', 
    Address: '', 
    ContactPerson: '', 
    Email: '', 
    IndustryType: 'Private Sector', 
    EffectivityDate: '', 
    Status: 'Processing: Awaiting signature of the MOA draft by HTE partner',
    college: ''
  });

  const filteredMoas = moas.filter(moa => {
    // Role based visibility
    if (profile.role === 'student') {
      if (moa.isDeleted || !moa.Status.startsWith('Approved')) return false;
    }
    if (profile.role === 'faculty') {
      if (moa.isDeleted) return false;
    }
    
    return true;
  });

  const seedSampleData = async () => {
    const sampleMoas: MOA[] = [
      {
        HTEID: 'HTE-2026-001',
        Company: 'Tech Solutions Inc.',
        Address: '123 Tech Ave, Makati',
        ContactPerson: 'Juan Dela Cruz',
        Email: 'juan@techsolutions.com',
        IndustryType: 'Private Sector',
        EffectivityDate: '2026-01-01',
        Status: 'Approved: Signed by President',
        college: 'College of Informatics and Computing Studies'
      },
      {
        HTEID: 'HTE-2026-002',
        Company: 'Global Health Corp.',
        Address: '456 Health St, Manila',
        ContactPerson: 'Maria Santos',
        Email: 'maria@globalhealth.com',
        IndustryType: 'Private Sector',
        EffectivityDate: '2026-02-15',
        Status: 'Processing: MOA draft sent to Legal Office for Review',
        college: 'College of Nursing'
      }
    ];

    for (const moa of sampleMoas) {
      await addDoc(collection(db, 'moas'), { ...moa, isDeleted: false, auditTrail: [{ userId: profile?.uid, userName: profile?.displayName, timestamp: new Date().toISOString(), action: 'CREATE' }] });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const moaWithAudit = trackAction({
        ...newMoa,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedBy: profile.uid
      }, 'CREATE');
      
      const docRef = await addDoc(collection(db, 'moas'), moaWithAudit);
      await logActivity('CREATE_MOA', `Created MOA for ${newMoa.Company}`, docRef.id, 'MOA');

      // Notify faculty
      if (profile.role === 'faculty') {
        await createNotification(profile.uid, 'Action Recorded', `You created a new MOA for ${newMoa.Company}`, 'SUCCESS', 'USER_ACTION');
      }

      // Notify admins
      const admins = users.filter(u => u.role === 'admin');
      for (const admin of admins) {
        await createNotification(admin.uid, 'System Activity', `${profile.displayName} created a new MOA for ${newMoa.Company}`, 'SUCCESS', 'SYSTEM_ACTIVITY');
      }

      setShowAdd(false);
      setNewMoa({ 
        HTEID: '', Company: '', Address: '', ContactPerson: '', Email: '', 
        IndustryType: 'Private Sector', EffectivityDate: '', 
        Status: 'Processing: Awaiting signature of the MOA draft by HTE partner',
        college: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'moas');
    }
  };

  const statuses: MOAStatus[] = [
    'Approved: Signed by President',
    'Approved: On-going notarization',
    'Approved: No notarization needed',
    'Processing: Awaiting signature of the MOA draft by HTE partner',
    'Processing: MOA draft sent to Legal Office for Review',
    'Processing: MOA draft and Opinion of Legal Office sent to VPPA/OP for approval',
    'Expired: No renewal done',
    'Expiring: Two months before expiration of date'
  ];

  const industries: IndustryType[] = [
    'Government',
    'Private Sector',
    'Non-Profit Organization',
    'Educational Institution',
    'International Organization',
    'Others'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={cn("text-2xl font-bold tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Partner Companies</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">External Collaboration Network</p>
        </div>
        {profile.role === 'admin' && moas.length === 0 && (
          <button 
            onClick={seedSampleData}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Seed Sample Data
          </button>
        )}
        {profile.role !== 'student' && (
          <button 
            onClick={() => setShowAdd(true)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Agreement
          </button>
        )}
      </div>

      {(showAdd || editingMoa) && (
        <GlassCard theme={theme} className="p-8 border-blue-500/20 shadow-2xl relative z-20">
          <div className="mb-6">
            <h3 className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>
              {editingMoa ? 'Edit Partner' : 'Register New Partner'}
            </h3>
            <p className="text-xs text-slate-500">
              {editingMoa ? 'Update the details of the memorandum of agreement.' : 'Enter the details of the new memorandum of agreement.'}
            </p>
          </div>
          <form onSubmit={editingMoa ? (e) => { e.preventDefault(); onUpdate(editingMoa); setEditingMoa(null); } : handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Company Name</label>
              <input 
                className={cn(
                  "w-full border rounded-xl p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-white border-slate-200 focus:border-blue-500"
                )} 
                value={editingMoa ? editingMoa.Company : newMoa.Company} 
                onChange={e => editingMoa ? setEditingMoa({...editingMoa, Company: e.target.value}) : setNewMoa({...newMoa, Company: e.target.value})} 
                required 
                placeholder="e.g. Google Philippines"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">HTE ID</label>
              <input 
                className={cn(
                  "w-full border rounded-xl p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-white border-slate-200 focus:border-blue-500"
                )} 
                value={editingMoa ? editingMoa.HTEID : newMoa.HTEID} 
                onChange={e => editingMoa ? setEditingMoa({...editingMoa, HTEID: e.target.value}) : setNewMoa({...newMoa, HTEID: e.target.value})} 
                required 
                placeholder="ID-2024-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">College</label>
              <select 
                className={cn(
                  "w-full border rounded-xl p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]",
                  theme === 'dark' 
                    ? "bg-slate-800/50 border-white/10 text-white focus:border-blue-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]" 
                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]"
                )} 
                value={editingMoa ? editingMoa.college : newMoa.college} 
                onChange={e => editingMoa ? setEditingMoa({...editingMoa, college: e.target.value}) : setNewMoa({...newMoa, college: e.target.value})} 
                required
              >
                <option value="" disabled>Select College</option>
                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Industry Type</label>
              <select 
                className={cn(
                  "w-full border rounded-xl p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]",
                  theme === 'dark' 
                    ? "bg-slate-800/50 border-white/10 text-white focus:border-blue-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]" 
                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]"
                )} 
                value={editingMoa ? editingMoa.IndustryType : newMoa.IndustryType} 
                onChange={e => editingMoa ? setEditingMoa({...editingMoa, IndustryType: e.target.value as any}) : setNewMoa({...newMoa, IndustryType: e.target.value as any})}
              >
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Company Address</label>
              <input 
                className={cn(
                  "w-full border rounded-xl p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-white border-slate-200 focus:border-blue-500"
                )} 
                value={editingMoa ? editingMoa.Address : newMoa.Address} 
                onChange={e => editingMoa ? setEditingMoa({...editingMoa, Address: e.target.value}) : setNewMoa({...newMoa, Address: e.target.value})} 
                placeholder="Full business address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Contact Person</label>
              <input 
                className={cn(
                  "w-full border rounded-xl p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-white border-slate-200 focus:border-blue-500"
                )} 
                value={editingMoa ? editingMoa.ContactPerson : newMoa.ContactPerson} 
                onChange={e => editingMoa ? setEditingMoa({...editingMoa, ContactPerson: e.target.value}) : setNewMoa({...newMoa, ContactPerson: e.target.value})} 
                placeholder="Name of representative"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Contact Email</label>
              <input 
                type="email" 
                className={cn(
                  "w-full border rounded-xl p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/20",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50" : "bg-white border-slate-200 focus:border-blue-500"
                )} 
                value={editingMoa ? editingMoa.Email : newMoa.Email} 
                onChange={e => editingMoa ? setEditingMoa({...editingMoa, Email: e.target.value}) : setNewMoa({...newMoa, Email: e.target.value})} 
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Effectivity Date</label>
              <DatePicker 
                value={editingMoa ? editingMoa.EffectivityDate : newMoa.EffectivityDate}
                onChange={val => editingMoa ? setEditingMoa({...editingMoa, EffectivityDate: val}) : setNewMoa({...newMoa, EffectivityDate: val})}
                theme={theme}
                placeholder="Select date"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setShowAdd(false)} className={cn(
                "px-8 py-3 rounded-xl font-bold transition-all",
                theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}>Cancel</button>
              <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">Create Record</button>
            </div>
          </form>
        </GlassCard>
      )}

      {viewingMoa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <GlassCard theme={theme} className="p-8 border-blue-500/20 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
              <h3 className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Partner Profile</h3>
              <button onClick={() => setViewingMoa(null)} className="text-slate-500 hover:text-slate-400">Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Company Name</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.Company}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">HTE ID</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.HTEID}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">College</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.college}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Industry Type</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.IndustryType}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Address</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.Address}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact Person</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.ContactPerson}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.Email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Effectivity Date</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.EffectivityDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{viewingMoa.Status}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMoas.map((moa) => (
          <GlassCard key={moa.id} theme={theme} className={cn(
            "p-6 transition-all duration-300 group relative overflow-hidden", 
            theme === 'dark' ? "hover:bg-white/[0.08]" : "hover:bg-white hover:shadow-xl",
            moa.isDeleted && "opacity-50 grayscale"
          )}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20 group-hover:rotate-3 transition-transform">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={cn("text-lg font-bold truncate transition-colors", theme === 'dark' ? "group-hover:text-blue-400" : "text-slate-900 group-hover:text-blue-600")}>{moa.Company}</h3>
                </div>
                <p className={cn("text-xs font-medium mt-0.5", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>{moa.HTEID}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                {profile.role !== 'student' && !moa.isDeleted ? (
                  <select
                    value={moa.Status}
                    onChange={(e) => onUpdate({ ...moa, Status: e.target.value as MOAStatus })}
                    className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border cursor-pointer",
                      moa.Status.startsWith('Approved') ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                      moa.Status.startsWith('Processing') ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                      "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    )}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                    moa.Status.startsWith('Approved') ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    moa.Status.startsWith('Processing') ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  )}>
                    {moa.Status}
                  </span>
                )}
                {moa.isDeleted && <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black uppercase tracking-widest">Deleted</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter">Department</p>
                  <p className={cn("text-xs font-bold truncate", theme === 'dark' ? "text-slate-300" : "text-slate-700")}>{moa.college || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter">Industry</p>
                  <p className={cn("text-xs font-bold truncate", theme === 'dark' ? "text-slate-300" : "text-slate-700")}>{moa.IndustryType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter">Representative</p>
                  <p className={cn("text-xs font-bold truncate", theme === 'dark' ? "text-slate-300" : "text-slate-700")}>{moa.ContactPerson}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter">Validity</p>
                  <p className={cn("text-xs font-mono font-bold", theme === 'dark' ? "text-blue-400" : "text-blue-600")}>{moa.EffectivityDate || 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => setViewingMoa(moa)}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/10 active:scale-95"
                >
                  View Full Profile
                </button>
                <div className="flex gap-1">
                  {profile.role !== 'student' && !moa.isDeleted && (
                    <button 
                      onClick={() => setEditingMoa(moa)}
                      className="p-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {profile.role !== 'student' && !moa.isDeleted && (
                    <button 
                      onClick={() => onSoftDelete(moa)}
                      className="p-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {profile.role === 'admin' && moa.isDeleted && (
                    <button 
                      onClick={() => onRecover(moa)}
                      className="p-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-xl transition-all"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}

      </div>
    </div>
  );
}

function SystemActivityView({ activities, theme }: { activities: Activity[], theme: 'light' | 'dark' }) {
  return (
    <GlassCard theme={theme} className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <h3 className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>System Activities</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activities.length} Total Logs</span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">User</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Details</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                      {activity.userName.charAt(0)}
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{activity.userName}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{activity.userRole}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    activity.action.includes('CREATE') ? "bg-emerald-500/20 text-emerald-400" :
                    activity.action.includes('DELETE') ? "bg-rose-500/20 text-rose-400" :
                    "bg-blue-500/20 text-blue-400"
                  )}>
                    {activity.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-slate-400 max-w-xs truncate">{activity.details}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[10px] text-slate-500 font-mono">{format(new Date(activity.timestamp), 'MMM dd, HH:mm:ss')}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
function UserAdminView({ users, theme }: { users: UserProfile[], theme: 'light' | 'dark' }) {
  const handleToggleBlock = async (user: UserProfile) => {
    try {
      await setDoc(doc(db, 'users', user.uid), { ...user, isBlocked: !user.isBlocked });
    } catch (error) {
      console.error('Error toggling user block:', error);
    }
  };

  const handleChangeRole = async (user: UserProfile, role: UserRole) => {
    try {
      await setDoc(doc(db, 'users', user.uid), { ...user, role });
    } catch (error) {
      console.error('Error changing user role:', error);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', displayName: '', role: 'student' as UserRole });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Note: This creates a user document, but doesn't create the auth user.
      // Firebase Auth user creation requires a backend or specific client-side setup.
      // For this app, we'll just create the profile doc.
      await setDoc(doc(db, 'users', newUser.email), {
        uid: newUser.email,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        photoURL: ''
      });
      setShowAddUser(false);
      setNewUser({ email: '', displayName: '', role: 'student' });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>User Management</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-500">{users.length} Total Users</span>
          <button 
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard theme={theme} className="w-full max-w-md p-6">
            <h3 className={cn("text-lg font-bold mb-4", theme === 'dark' ? "text-white" : "text-slate-900")}>Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="email" placeholder="Email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full p-2 rounded-lg border bg-transparent" />
              <input type="text" placeholder="Display Name" required value={newUser.displayName} onChange={e => setNewUser({...newUser, displayName: e.target.value})} className="w-full p-2 rounded-lg border bg-transparent" />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full p-2 rounded-lg border bg-transparent">
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 rounded-lg bg-slate-500/20">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Add</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Desktop Table View */}
      <GlassCard theme={theme} className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn("border-b", theme === 'dark' ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/50")}>
                <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-wider", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>User</th>
                <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-wider", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Role</th>
                <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-wider", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Status</th>
                <th className={cn("px-6 py-4 text-xs font-bold uppercase tracking-wider text-right", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Actions</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", theme === 'dark' ? "divide-white/5" : "divide-slate-200")}>
              {users.map((u) => (
                <tr key={u.uid} className={cn("transition-colors", theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.photoURL} className="w-8 h-8 rounded-full" alt="" />
                      <div>
                        <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{u.displayName}</p>
                        <p className="text-[10px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.role}
                      onChange={e => handleChangeRole(u, e.target.value as UserRole)}
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider border rounded-lg px-2 py-1 appearance-none bg-no-repeat bg-[right_0.4rem_center] bg-[length:0.8em_0.8em] pr-6",
                        theme === 'dark' 
                          ? "bg-slate-800/50 border-white/10 text-blue-400 focus:border-blue-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2360a5fa%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]" 
                          : "bg-white border-slate-200 text-blue-600 focus:border-blue-500 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%232563eb%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]"
                      )}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      u.isBlocked ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleToggleBlock(u)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                        u.isBlocked 
                          ? "bg-emerald-600 text-white hover:bg-emerald-500" 
                          : "bg-rose-600 text-white hover:bg-rose-500"
                      )}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.uid)}
                      className="p-2 rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((u) => (
          <GlassCard key={u.uid} theme={theme} className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <img src={u.photoURL} className="w-12 h-12 rounded-xl" alt="" />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-bold truncate", theme === 'dark' ? "text-white" : "text-slate-900")}>{u.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                u.isBlocked ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
              )}>
                {u.isBlocked ? 'Blocked' : 'Active'}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
              <div className="flex-1">
                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-1">User Role</label>
                <select 
                  value={u.role}
                  onChange={e => handleChangeRole(u, e.target.value as UserRole)}
                  className={cn(
                    "w-full text-xs font-bold uppercase tracking-wider border rounded-lg px-2 py-2 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em_1em]",
                    theme === 'dark' 
                      ? "bg-slate-800/50 border-white/10 text-blue-400 focus:border-blue-500/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2360a5fa%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]" 
                      : "bg-white border-slate-200 text-blue-600 focus:border-blue-500 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%232563eb%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]"
                  )}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="shrink-0 pt-4">
                <button 
                  onClick={() => handleToggleBlock(u)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    u.isBlocked 
                      ? "bg-emerald-600 text-white hover:bg-emerald-500" 
                      : "bg-rose-600 text-white hover:bg-rose-500"
                  )}
                >
                  {u.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function AccountView({ profile, theme, moas, activities }: { profile: UserProfile, theme: 'light' | 'dark', moas: MOA[], activities: Activity[] }) {
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  // Real stats calculation
  const userMoas = profile.role === 'admin' 
    ? moas.filter(m => !m.isDeleted)
    : moas.filter(m => m.college === profile.college && !m.isDeleted);
  const totalContributions = userMoas.length;
  const activeAgreements = userMoas.filter(m => m.Status.startsWith('Approved')).length;
  const pendingReview = userMoas.filter(m => m.Status.startsWith('Processing')).length;
  
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const contributionsThisMonth = userMoas.filter(m => {
    const createdDate = m.createdAt?.toDate ? m.createdAt.toDate() : new Date(m.createdAt || Date.now());
    return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
  }).length;

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      const data = JSON.stringify({ profile, moas: userMoas, activities: activities.filter(a => a.userId === profile.uid) }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neu-moa-profile-${profile.uid}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 1500);
  };

  const userLogs = activities
    .filter(a => a.userId === profile.uid)
    .slice(0, 5)
    .map(a => ({
      action: a.action.replace('_', ' '),
      date: format(new Date(a.timestamp), 'yyyy-MM-dd HH:mm'),
      status: 'Success'
    }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Sidebar */}
        <div className="w-full md:w-80 space-y-6">
          <GlassCard theme={theme} className="p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            <div className="relative inline-block">
              <img 
                src={profile.photoURL} 
                alt="Avatar" 
                className={cn(
                  "w-32 h-32 rounded-3xl mx-auto shadow-2xl shadow-blue-900/30 group-hover:scale-105 transition-transform duration-500 border-4",
                  theme === 'dark' ? "border-white/10" : "border-slate-200"
                )} 
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-emerald-500 border-4 border-slate-900 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>{profile.displayName}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{profile.role}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                Edit Profile
              </button>
              <button 
                onClick={() => auth.signOut()}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                  theme === 'dark' ? "bg-white/5 hover:bg-rose-500/10 text-rose-400" : "bg-slate-100 hover:bg-rose-50 text-rose-600"
                )}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </GlassCard>

          <GlassCard theme={theme} className="p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Account Verified</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Database Connection</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Last Login</span>
                <span className="text-[10px] font-mono text-slate-500">Today, {format(new Date(), 'HH:mm')}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassCard theme={theme} className="p-6 border-l-4 border-l-blue-600">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Contributions</p>
              <p className={cn("text-3xl font-black", theme === 'dark' ? "text-white" : "text-slate-900")}>{totalContributions}</p>
              <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                <Plus className="w-3 h-3" /> {contributionsThisMonth} this month
              </p>
            </GlassCard>
            <GlassCard theme={theme} className="p-6 border-l-4 border-l-indigo-600">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Active Agreements</p>
              <p className={cn("text-3xl font-black", theme === 'dark' ? "text-white" : "text-slate-900")}>{activeAgreements}</p>
              <p className="text-[10px] text-blue-400 font-bold mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> {pendingReview} pending review
              </p>
            </GlassCard>
          </div>

          <GlassCard theme={theme} className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Account Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <div className={cn(
                  "p-4 rounded-xl border font-medium",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                )}>
                  {profile.displayName}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className={cn(
                  "p-4 rounded-xl border font-medium flex items-center justify-between",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                )}>
                  <span className="truncate">{profile.email}</span>
                  <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">Verified</div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Access Level</label>
                <div className={cn(
                  "p-4 rounded-xl border font-bold uppercase tracking-widest text-xs flex items-center gap-3",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-blue-400" : "bg-slate-50 border-slate-200 text-blue-600"
                )}>
                  <Shield className="w-4 h-4" />
                  {profile.role}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Organization</label>
                <div className={cn(
                  "p-4 rounded-xl border font-medium",
                  theme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                )}>
                  New Era University
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={cn("font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Security & Privacy</h4>
                  <p className="text-xs text-slate-500 mt-1">Manage your account security and data preferences.</p>
                </div>
                <button 
                  onClick={() => setShowSecurityModal(true)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
                    theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  )}
                >
                  Manage Security
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {showSecurityModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSecurityModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden",
                theme === 'dark' ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
              )}
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Security Settings</h3>
                    <p className="text-xs text-slate-500">Protect your account and manage your data.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSecurityModal(false)}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Security Status */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Account Protection</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={cn("p-4 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-blue-500" />
                          <span className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Two-Factor Auth</span>
                        </div>
                        <button 
                          onClick={() => setTwoFactor(!twoFactor)}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors",
                            twoFactor ? "bg-blue-600" : "bg-slate-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                            twoFactor ? "left-6" : "left-1"
                          )} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">Add an extra layer of security to your account.</p>
                    </div>
                    <div className={cn("p-4 rounded-2xl border", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-emerald-500" />
                        <span className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Password</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Managed via your Google Workspace account.</p>
                    </div>
                  </div>
                </section>

                {/* Privacy & Data */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Privacy & Data</h4>
                  <div className="space-y-3">
                    <button 
                      onClick={handleExportData}
                      disabled={isExporting}
                      className={cn(
                        "w-full p-4 rounded-2xl border flex items-center justify-between group transition-all",
                        theme === 'dark' ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <div className="text-left">
                          <span className={cn("text-sm font-bold block", theme === 'dark' ? "text-white" : "text-slate-900")}>
                            {isExporting ? 'Preparing Export...' : 'Download My Data'}
                          </span>
                          <span className="text-[10px] text-slate-500">Get a copy of your profile and activity logs.</span>
                        </div>
                      </div>
                      {isExporting && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>

                    <div className={cn("p-4 rounded-2xl border flex items-center justify-between", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                      <div className="flex items-center gap-3">
                        <EyeOff className="w-5 h-5 text-slate-400" />
                        <div className="text-left">
                          <span className={cn("text-sm font-bold block", theme === 'dark' ? "text-white" : "text-slate-900")}>Profile Visibility</span>
                          <span className="text-[10px] text-slate-500">Only administrators can see your full profile.</span>
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-widest">Restricted</div>
                    </div>
                  </div>
                </section>

                {/* Activity Log */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent Security Activity</h4>
                    <History className="w-3 h-3 text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    {userLogs.map((log, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className={cn("text-xs font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-700")}>{log.action}</p>
                          <p className="text-[10px] text-slate-500">{log.date}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{log.status}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-4 border-t border-white/5 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Danger Zone</h4>
                  <button className="w-full p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 transition-all group text-left">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-rose-500" />
                      <div>
                        <span className="text-sm font-bold block text-rose-500">Request Account Deletion</span>
                        <span className="text-[10px] text-rose-500/60 text-slate-500">Permanently remove your account and all associated data.</span>
                      </div>
                    </div>
                  </button>
                </section>
              </div>

              <div className="p-8 bg-slate-950/30 flex justify-end">
                <button 
                  onClick={() => setShowSecurityModal(false)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

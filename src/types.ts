export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL: string;
  isBlocked?: boolean;
  college?: string;
}

export interface AuditEntry {
  userId: string;
  userName?: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RECOVER' | 'AUTO_UPDATE';
}

export type MOAStatus = 
  | 'Approved: Signed by President'
  | 'Approved: On-going notarization'
  | 'Approved: No notarization needed'
  | 'Processing: Awaiting signature of the MOA draft by HTE partner'
  | 'Processing: MOA draft sent to Legal Office for Review'
  | 'Processing: MOA draft and Opinion of Legal Office sent to VPPA/OP for approval'
  | 'Expired: No renewal done'
  | 'Expiring: Two months before expiration of date';

export type IndustryType = 
  | 'Government' 
  | 'Private Sector' 
  | 'Non-Profit Organization' 
  | 'Educational Institution' 
  | 'International Organization' 
  | 'Others';

export interface MOA {
  id?: string;
  HTEID: string;
  Company: string;
  Address: string;
  ContactPerson: string;
  Email: string;
  IndustryType: IndustryType;
  EffectivityDate: string;
  Status: MOAStatus;
  college: string;
  isDeleted?: boolean;
  auditTrail?: AuditEntry[];
  createdAt?: any;
  updatedBy?: string;
}

export interface Activity {
  id?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userCollege?: string;
  action: string;
  details: string;
  timestamp: string;
  targetId?: string;
  targetType?: 'MOA' | 'USER' | 'SYSTEM';
}

export interface AppNotification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category: 'MOA_UPDATE' | 'SYSTEM_ALERT' | 'USER_ACTION' | 'SYSTEM_ACTIVITY';
}

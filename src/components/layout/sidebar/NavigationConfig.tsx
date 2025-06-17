
import { 
  Home, 
  Users, 
  User, 
  Briefcase, 
  Calendar, 
  Settings,
  CreditCard,
  FileText,
  Building,
  MessageSquare
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const superAdminNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/super-admin', icon: Home },
  { name: 'Firms', href: '/firms', icon: Building },
  { name: 'Attorneys', href: '/attorneys', icon: User },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const firmAdminNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/firm-admin', icon: Home },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Attorneys', href: '/attorneys', icon: User },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const caseManagerNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/case-manager', icon: Home },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const attorneyNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/attorney', icon: Home },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const clientNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/client', icon: Home },
  { name: 'Cases', href: '/cases', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

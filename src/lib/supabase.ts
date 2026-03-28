import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'supplier' | 'machine_user';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: string;
  api_key: string;
  notes: string;
  rating: number;
  total_orders: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  price: number;
  status: string;
  description: string;
  specifications: Record<string, unknown>;
  image_url: string;
  supplier_id: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  stage: string;
  value: number;
  machine_interest: string;
  assigned_to: string | null;
  notes: string;
  priority: string;
  last_contact: string | null;
  created_at: string;
}

export interface SalesTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  lead_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Quotation {
  id: string;
  quote_number: string;
  lead_id: string | null;
  items: unknown[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  valid_until: string | null;
  notes: string;
  created_by: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  machine_id: string | null;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  status: string;
  scheduled_date: string | null;
  completed_date: string | null;
  notes: string;
  cost: number;
  assigned_to: string | null;
  created_at: string;
}

export interface BuddyConversation {
  id: string;
  user_id: string | null;
  title: string;
  messages: unknown[];
  created_at: string;
}

export interface SalesSequence {
  id: string;
  name: string;
  description: string;
  steps: unknown[];
  status: string;
  leads_enrolled: number;
  conversion_rate: number;
  created_by: string | null;
  created_at: string;
}

export interface DemoSchedule {
  id: string;
  lead_id: string | null;
  machine_id: string | null;
  scheduled_date: string;
  duration_minutes: number;
  status: string;
  location: string;
  notes: string;
  assigned_to: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  category: string;
  message: string;
  status: string;
  response: string;
  created_at: string;
}

export interface MarketingContent {
  id: string;
  title: string;
  content_type: string;
  body: string;
  status: string;
  target_audience: string;
  campaign: string;
  created_by: string | null;
  created_at: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: string;
  variables: unknown[];
  usage_count: number;
  created_by: string | null;
  created_at: string;
}

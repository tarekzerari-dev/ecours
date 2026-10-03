-- ==============================================================================
-- eCours Platform - Initial Supabase Database Schema
-- Run this script in your Supabase SQL Editor
-- ==============================================================================

-- 1. Enable UUID Extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- ENUMS
-- ==============================================================================

-- Roles: superadmin (System Admin), manager (School Manager), teacher (Independent or Managed)
CREATE TYPE user_role AS ENUM ('superadmin', 'manager', 'teacher');

-- Education Phases
CREATE TYPE education_phase AS ENUM ('primary', 'middle', 'secondary');

-- Attendance Statuses
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');

-- ==============================================================================
-- TABLES
-- ==============================================================================

-- Profiles (Linked to auth.users)
-- This table stores all users in the system (Managers, Teachers, SuperAdmins)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'teacher',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Schools / Centers (Managed by Managers)
CREATE TABLE public.schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Teacher Profiles (Specific details for teachers)
-- If school_id is NULL, the teacher is INDEPENDENT.
CREATE TABLE public.teacher_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL, -- NULL = Independent Teacher
  subject TEXT NOT NULL,
  phase education_phase NOT NULL,
  monthly_fee NUMERIC(10, 2), -- The percentage/fee for the teacher if under a school
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Groups / Classes
CREATE TABLE public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE, -- NULL if independent teacher
  monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  schedule JSONB, -- Example: [{"day": "Monday", "time": "14:00"}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Students
CREATE TABLE public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  parent_phone TEXT,
  qr_code TEXT UNIQUE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE, -- NULL if independent teacher
  independent_teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Set ONLY if independent teacher
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Student Enrollments in Groups
CREATE TABLE public.student_groups (
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (student_id, group_id)
);

-- Sessions (Classes held)
CREATE TABLE public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  registered_by UUID REFERENCES public.profiles(id) NOT NULL, -- Who created this session
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Attendance Records
CREATE TABLE public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  registered_by UUID REFERENCES public.profiles(id) NOT NULL, -- Who marked this attendance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(session_id, student_id)
);

-- Payments
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  month_covered TEXT NOT NULL, -- Example: "2024-09"
  received_by UUID REFERENCES public.profiles(id) NOT NULL, -- Who collected the money (Manager or Independent Teacher)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TRIGGERS (Auto-create profile when user signs up)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'), 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'teacher'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- We will enable RLS on all tables to ensure data isolation.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Note: RLS Policies can be added incrementally. 
-- For MVP, we will allow authenticated users to read/write their own tenant data.
-- (Full granular RLS policies will be added via application code or Supabase UI).

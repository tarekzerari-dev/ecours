import { useQuery } from "@tanstack/react-query";
import { api } from "../supabase/api";

export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: () => api.getTeachers(),
  });
}

export function useGroups(teacherId?: string) {
  return useQuery({
    queryKey: ["groups", teacherId],
    queryFn: () => api.getGroups(teacherId),
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ["group", groupId],  // distinct from ["groups", teacherId]
    queryFn: () => api.getGroupById(groupId),
    enabled: !!groupId,
  });
}

export function useStudents(groupId?: string) {
  return useQuery({
    queryKey: ["students", groupId],
    queryFn: () => api.getStudents(groupId),
  });
}

export function useSessions(groupId?: string) {
  return useQuery({
    queryKey: ["sessions", groupId],
    queryFn: () => api.getSessions(groupId),
  });
}

export function useAttendance(sessionId: string, refetchInterval: number | false = false) {
  return useQuery({
    queryKey: ["attendance", sessionId],
    queryFn: () => api.getAttendanceBySession(sessionId),
    enabled: !!sessionId,
    refetchInterval,
  });
}

export function usePayments(groupId?: string) {
  return useQuery({
    queryKey: ["payments", groupId],
    queryFn: () => api.getPayments(groupId),
  });
}

// ==============================================================================
// --- SUPER ADMIN HOOKS ---
// ==============================================================================
export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => api.getAdminOverview(),
  });
}

export function useAdminSchools() {
  return useQuery({
    queryKey: ["admin", "schools"],
    queryFn: () => api.getAdminSchools(),
  });
}

export function useAdminTeachers() {
  return useQuery({
    queryKey: ["admin", "teachers"],
    queryFn: () => api.getAdminTeachers(),
  });
}

export function useAdminGroups() {
  return useQuery({
    queryKey: ["admin", "groups"],
    queryFn: () => api.getAdminGroups(),
  });
}

export function useAdminStudents() {
  return useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => api.getAdminStudents(),
  });
}

export function useAdminBilling() {
  return useQuery({
    queryKey: ["admin", "billing"],
    queryFn: () => api.getAdminBilling(),
  });
}


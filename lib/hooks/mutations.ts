import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../supabase/api";
import type { Group, Student, Session, AttendanceRecord, StudentPayment } from "../types";

export function useAddGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (group: Partial<Group>) => api.addGroup(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useAddStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ student, groupId }: { student: Partial<Student>; groupId: string }) => 
      api.addStudent(student, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] }); // count changes
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] }); // count changes
    },
  });
}

export function useAddSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ session, registeredBy }: { session: Partial<Session>; registeredBy: string }) => 
      api.addSession(session, registeredBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ records, registeredBy }: { records: Partial<AttendanceRecord>[]; registeredBy: string }) => 
      api.recordAttendance(records, registeredBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payment, receivedBy }: { payment: any; receivedBy: string }) => 
      api.addPayment(payment, receivedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

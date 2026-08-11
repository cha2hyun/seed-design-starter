import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { fetchSession, getSessionSnapshot, login, logout } from "../api/session-api";
import type { LoginCredentials, Session } from "./types";

export function sessionQuery() {
  return queryOptions({
    queryKey: queryKeys.session.current,
    queryFn: fetchSession,
    initialData: getSessionSnapshot,
  });
}

export function useSessionQuery() {
  return useQuery(sessionQuery());
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<Session, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.session.current, session);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<null, Error>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.session.current, null);
    },
  });
}

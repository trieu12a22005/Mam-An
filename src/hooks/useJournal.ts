import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalService } from '../services/journal.service';
import { MoodLevel, MoodJournal } from '../types/journal.type';

export const useJournal = () => {
  const qc = useQueryClient();

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: journalService.getMyJournals,
    staleTime: 30_000,
  });

  const { mutateAsync: createJournal, isPending: isCreating } = useMutation({
    mutationFn: ({ mood, note }: { mood: MoodLevel; note: string }) =>
      journalService.createJournal(mood, note),
    onSuccess: (newJournal) => {
      // Prepend to cache instantly
      qc.setQueryData<MoodJournal[]>(['journals'], (prev = []) => [
        newJournal,
        ...prev,
      ]);
    },
  });

  return { journals, isLoading, isCreating, createJournal };
};

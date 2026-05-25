import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { LoadingView } from '../src/components/common/LoadingView';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingView message="Đang khởi động..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/login" />;
}

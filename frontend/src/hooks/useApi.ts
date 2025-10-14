import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Eliminate 40+ duplicate React Query patterns across frontend
export function useApiQuery<T = any>(
  queryKey: string[],
  endpoint: string,
  options?: {
    params?: Record<string, any>;
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get(endpoint, { params: options?.params });
      return data.data as T;
    },
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

export function useApiMutation<TData = any, TVariables extends Record<string, any> = any>(
  endpoint: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: any) => void;
    invalidateKeys?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const { data } = await api[method](endpoint, variables);
      return data.data as TData;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
    onError: options?.onError,
  });
}

// Replace duplicate loading state patterns
export function useLoadingState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setErrorMessage = useCallback((message: string | null) => {
    setError(message);
    setLoading(false);
  }, []);

  const executeWithLoading = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    startLoading();
    try {
      const result = await operation();
      stopLoading();
      return result;
    } catch (error: any) {
      setErrorMessage(error.message || 'Operation failed');
      return null;
    }
  }, [startLoading, stopLoading, setErrorMessage]);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setErrorMessage,
    executeWithLoading,
  };
}

// Replace duplicate form state patterns
export function useFormState<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  }, [errors]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setMultipleErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const isValid = Object.values(errors).every(error => !error);

  return {
    values,
    errors,
    handleChange,
    setFieldError,
    setMultipleErrors,
    reset,
    isValid,
  };
}

// Replace duplicate auth patterns
export function useAuthenticatedApi() {
  const query = useApiQuery(['user'], '/user/me', {
    enabled: !!localStorage.getItem('accessToken')
  });

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/';
  }, []);

  return {
    user: query.data,
    isAuthenticated: !!query.data,
    isLoading: query.isLoading,
    logout,
  };
}

// Replace duplicate CRUD patterns
export function useCrudOperations<T>(
  endpoint: string,
  queryKey: string[]
) {
  const create = useApiMutation(endpoint, 'post', {
    invalidateKeys: [queryKey]
  });

  const update = useApiMutation<T>(`${endpoint}/:id`, 'put', {
    invalidateKeys: [queryKey]
  });

  const remove = useApiMutation(`${endpoint}/:id`, 'delete', {
    invalidateKeys: [queryKey]
  });

  return {
    create,
    update,
    remove,
  };
}

// Replace duplicate filtering/sorting patterns
export function useDataFilters<T>(
  data: T[],
  options?: {
    searchFields?: (keyof T)[];
    sortField?: keyof T;
    sortDirection?: 'asc' | 'desc';
  }
) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<keyof T | undefined>(options?.sortField);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(options?.sortDirection || 'desc');

  const filteredData = data.filter(item => {
    if (!search || !options?.searchFields) return true;

    return options.searchFields.some(field => {
      const value = item[field];
      return typeof value === 'string' &&
             value.toLowerCase().includes(search.toLowerCase());
    });
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;

    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  return {
    data: sortedData,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
}

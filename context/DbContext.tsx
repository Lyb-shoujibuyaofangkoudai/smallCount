import { db, DbType } from '@/db/db';
import { useSystemInit } from '@/hooks/use-system-init';
import React, { createContext, useContext, useMemo } from 'react';

type DatabaseStage = 'MIGRATING' | 'SEEDING' | 'READY';

type DatabaseContextType = {
  // 数据库实例
  db: DbType;
  // 数据库状态（基于useSystemInit的状态）
  status: 'initializing' | 'ready' | 'error';
  // 错误信息
  error: Error | null;
  // 检查数据库是否已初始化
  isInitialized: boolean;
  // 系统初始化阶段
  stage: DatabaseStage;
   
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 使用现有的系统初始化Hook
  const { isReady, error, stage } = useSystemInit();

  // 基于useSystemInit的状态计算数据库状态
  const databaseStatus = useMemo(() => {
    if (error) return 'error';
    if (isReady) return 'ready';
    return 'initializing';
  }, [isReady, error]);

  const contextValue: DatabaseContextType = useMemo(() => ({
    db,
    status: databaseStatus,
    error,
    isInitialized: isReady,
    stage
  }), [db, databaseStatus, error, isReady, stage]);

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Hook for using database context
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

// Hook for checking if database is ready
export const useDatabaseReady = () => {
  const { status, isInitialized, stage } = useDatabase();
  return {
    isReady: isInitialized,
    isLoading: status === 'initializing',
    hasError: status === 'error',
    stage
  };
};

// Hook for database operations with error handling
export const useDatabaseOperation = <T,>() => {
  const { db, status, error } = useDatabase();
  
  const execute = async (operation: (db: DbType) => Promise<T>) => {
    if (status !== 'ready') {
      throw new Error(`Database is not ready. Current status: ${status}`);
    }
    
    try {
      return await operation(db);
    } catch (err: any) {
      console.error('Database operation failed:', err);
      throw err;
    }
  };

  return {
    execute,
    isReady: status === 'ready',
    error
  };
};

// Hook for conditional database operations (不会抛出错误)
export const useConditionalDatabaseOperation = <T,>() => {
  const { db, status, error } = useDatabase();
  
  const execute = async (operation: (db: DbType) => Promise<T>) => {
    if (status !== 'ready') {
      console.warn('Database operation skipped: database is not ready');
      return null;
    }
    
    try {
      return await operation(db);
    } catch (err: any) {
      console.error('Database operation failed:', err);
      return null;
    }
  };

  return {
    execute,
    isReady: status === 'ready',
    error
  };
};
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { registerInitialValues } from '@/lib/constants';
import {
  userDataSchema,
  UserDataSchema,
  UserSignInSchema,
} from '@/lib/schemas/auth-schemas';

type UserSignInContextType = {
  userSignInData: UserDataSchema;
  updateUserDetails: (userDetails: Partial<UserSignInSchema>) => void;
  dataLoaded: boolean;
  resetLocalStorage: () => void;
  resetUserSignInData: () => void;
};

const LOCAL_STORAGE_KEY = 'multi-page-form-user-sign-in';

export const UserSignInContext = createContext<UserSignInContextType | null>(
  null
);

export const UserSignInContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userSignInData, setUserSignInData] = useState<UserDataSchema>(
    registerInitialValues
  );

  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    readFromLocalStorage();
    setDataLoaded(true);
  }, [setDataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      saveDataToLocalStorage(userSignInData);
    }
  }, [userSignInData, dataLoaded]);

  const saveDataToLocalStorage = (currentDealData: UserDataSchema) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentDealData));
  };

  const readFromLocalStorage = () => {
    const loadedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!loadedDataString) return setUserSignInData(registerInitialValues);
    const validated = userDataSchema.safeParse(JSON.parse(loadedDataString));

    if (validated.success) {
      setUserSignInData(validated.data);
    } else {
      setUserSignInData(registerInitialValues);
    }
  };

  const updateUserDetails = (userDetails: Partial<UserSignInSchema>) => {
    setUserSignInData((prevData) => ({
      ...prevData,
      ...userDetails,
    }));
  };

  const resetLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUserSignInData(registerInitialValues);
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(registerInitialValues)
    );
    // Add any additional reset logic here if needed
  };

  const resetUserSignInData = () => {
    setUserSignInData(registerInitialValues);
  };

  const contextValue = useMemo(
    () => ({
      userSignInData,
      updateUserDetails,
      dataLoaded,
      resetLocalStorage,
      resetUserSignInData,
    }),
    [userSignInData, dataLoaded, updateUserDetails, resetUserSignInData]
  );

  return (
    <UserSignInContext.Provider value={contextValue}>
      {children}
    </UserSignInContext.Provider>
  );
};

export function useSignInContext() {
  const context = useContext(UserSignInContext);
  if (!context) {
    throw new Error(
      'useSignInContext must be used within an UserSignInContext'
    );
  }

  return context;
}

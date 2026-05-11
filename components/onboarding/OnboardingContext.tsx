"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type OnboardingData = {
  matricNumber: string;
  department: string;
  faculty: string;
  yearOfEntry: string;
  username: string;
  displayName: string;
  bio: string;
  admissionLetterUrl: string;
};

type OnboardingContextType = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    matricNumber: "",
    department: "",
    faculty: "",
    yearOfEntry: "",
    username: "",
    displayName: "",
    bio: "",
    admissionLetterUrl: "",
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

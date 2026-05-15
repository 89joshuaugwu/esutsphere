"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type OnboardingRole = "student" | "lecturer";

type OnboardingData = {
  // Role
  role: OnboardingRole;
  // Student fields
  matricNumber: string;
  department: string;
  faculty: string;
  yearOfEntry: string;
  // Lecturer fields
  staffId: string;
  coursesTaught: string[];
  qualification: string;
  // Profile (shared)
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  // Document upload
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
    role: "student",
    matricNumber: "",
    department: "",
    faculty: "",
    yearOfEntry: "",
    staffId: "",
    coursesTaught: [],
    qualification: "",
    username: "",
    displayName: "",
    bio: "",
    profilePicture: "",
    admissionLetterUrl: "",
  });

  // Hydrate role from signup page sessionStorage
  useEffect(() => {
    const savedRole = sessionStorage.getItem("esutsphere_signup_role") as OnboardingRole | null;
    const savedName = sessionStorage.getItem("esutsphere_signup_name");
    if (savedRole) {
      setData(prev => ({ ...prev, role: savedRole }));
      sessionStorage.removeItem("esutsphere_signup_role");
    }
    if (savedName) {
      setData(prev => ({ ...prev, displayName: savedName }));
      sessionStorage.removeItem("esutsphere_signup_name");
    }
  }, []);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

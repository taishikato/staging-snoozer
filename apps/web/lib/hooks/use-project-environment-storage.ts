"use client";

import { useState, useEffect } from "react";

export type SelectedProjectEnvironment = {
  projectId: string;
  projectName: string;
  environmentId: string;
  environmentName: string;
};

const STORAGE_KEY = "staging-snoozer-selected";

export function useProjectEnvironmentStorage() {
  const [selected, setSelected] = useState<SelectedProjectEnvironment | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SelectedProjectEnvironment;
        setSelected(parsed);
      }
    } catch (error) {
      console.error("Failed to load selection from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSelection = (newSelection: SelectedProjectEnvironment | null) => {
    setSelected(newSelection);

    if (newSelection) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSelection));
      } catch (error) {
        console.error("Failed to save selection to localStorage:", error);
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to remove selection from localStorage:", error);
      }
    }
  };

  return {
    selected,
    updateSelection,
    isLoaded,
  };
}

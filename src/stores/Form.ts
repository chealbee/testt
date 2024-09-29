import { create } from "zustand";

interface IUseForm {
  formData: {
    name: string;
    difficulty: number;
    droneSpeed: number;
    wallHight: number;
    saveLost: boolean;
  };

  setFormData: (formData: {
    name: string;
    difficulty: number;
    droneSpeed: number;
    wallHight: number;
    saveLost: boolean;
  }) => void;
}

export const useForm = create<IUseForm>((set) => ({
  formData: {
    name: "",
    difficulty: 1,
    droneSize: 40,
    droneSpeed: 7,
    wallHight: 10,
    saveLost: false,
  },
  setFormData: (formData: {
    name: string;
    difficulty: number;
    droneSpeed: number;
    wallHight: number;
    saveLost: boolean;
  }) => {
    set({ formData: { ...formData } });
  },
}));

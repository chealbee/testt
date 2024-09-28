import { create } from "zustand";

interface IUseForm {
  name: string;
  difficulty: number;

  setFormData: (name: string, difficulty: number) => void;
}
export const useForm = create<IUseForm>((set) => ({
  name: "",
  difficulty: 1,
  setFormData: (name, difficulty) => {
    set({ name, difficulty });
  },
}));


export interface User {
  id: number;
  name: string;
  primaryEmail: string;
  additionalEmails: string[];
}

export type ListUser = Omit<User, "additionalEmails">;

import { UserRole } from '../enums/UserRole';

export type TypeUser = {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  role: UserRole,
  rating: number | null,
} | null
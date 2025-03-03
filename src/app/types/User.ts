export interface User {
  userId: number;
  username: string;
  password?: string;
  email: string;
  fullName: string;
  phone: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  status: number;
  roles: {
    [x: string]: any; name: string 
}[];
}

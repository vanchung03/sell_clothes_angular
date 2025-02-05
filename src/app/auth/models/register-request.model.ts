export class RegisterRequest {

    username: string;
    password: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: number = 1;
  
    constructor(
      username: string = '',
      password: string = '',
      fullName: string = '',
      email: string = '',
      phone?: string,
      avatar?: string,
      status: number = 1
    ) {

      this.username = username;
      this.password = password;
      this.fullName = fullName;
      this.email = email;
      this.phone = phone;
      this.avatar = avatar;
      this.status = status;
    }
  }
  
export class RegisterRequest {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar: string="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkn4MQj0v--Ku2CsK_xS1JOJZEkTMFFIFrg4EpQFMNCUcqsrmZ_4XWE6BeILEiAug3J8A&usqp=CAU";
    status: number = 1;
  
    constructor(
      username: string = '',
      password: string = '',
      fullName: string = '',
      email: string = '',
      phone?: string,
      avatar: string='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkn4MQj0v--Ku2CsK_xS1JOJZEkTMFFIFrg4EpQFMNCUcqsrmZ_4XWE6BeILEiAug3J8A&usqp=CAU',
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
  
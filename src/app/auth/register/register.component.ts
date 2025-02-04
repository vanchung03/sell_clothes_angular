import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: '../register/register.component.html',
  styleUrls: ['../register/register.component.scss']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';   
  password: string = ''; 
  fullName: string = '';
  phone: string='';

  constructor() {}

  onRegister() {
  
  }
}
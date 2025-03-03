
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  email: string = '';

  onSubscribe() {
    // Implement newsletter subscription logic here
    if (this.email) {
      console.log('Subscribing email:', this.email);
      // Reset form
      this.email = '';
    }
  }
}
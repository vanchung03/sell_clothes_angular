import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  settings = {
    notifications: true,
    pushNotifications: false,
    timezone: 'GMT+7',
    language: 'Tiếng Việt'
  };

  timezones = ['GMT-8', 'GMT-5', 'GMT+0', 'GMT+7', 'GMT+9'];
  languages = ['English', 'Tiếng Việt', 'Français', 'Español'];
  currentVersion = '1.0.0';

  changePassword() {
    alert('Chức năng đổi mật khẩu đang phát triển.');
  }

  enable2FA() {
    alert('Xác thực hai lớp sẽ được bật.');
  }

  checkForUpdates() {
    alert('Bạn đang sử dụng phiên bản mới nhất.');
  }

  onBannerChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Banner selected:', file.name);
    }
  }

  uploadBanner() {
    alert('Banner đã được tải lên.');
  }
}
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { UtilService } from '../shared/services/util.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isEmailModalOpen = false;
  userEmail: string;
  userEmailRegex;

  constructor(private authService: AuthService, private util: UtilService) {
    this.userEmailRegex = this.util.emailPattern;
  }

  ngOnInit() {}

  loginWithMagicLink() {
    // this.userEmailRegex = this.util.emailPattern;
    this.isEmailModalOpen = true;
  }

  loginWithMetamask() {
    this.authService.loginWithMetamask();
  }

  loginWithWalletConnect() {
    this.authService.loginWithWalletConnect();
  }

  confirmEmailModal() {
    if (this.util.isEmailAddressValid(this.userEmail.toLowerCase())) {
      // console.log(this.userEmail);
      this.authService.loginWithMagicLink(this.userEmail.toLowerCase());
      this.isEmailModalOpen = false;
    } else {
      alert('Please enter a valid email!');
    }
  }

  closeEmailModal() {
    this.isEmailModalOpen = false;
  }
}

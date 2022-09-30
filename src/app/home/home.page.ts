import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { UtilService } from '../shared/services/util.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isLoading = true;
  userHandle = '';
  connectedWallets = [];
  connectedEmails = [];
  showEmailModal = false;
  userEmailRegex;
  userEmail: string;

  constructor(private authService: AuthService, private util: UtilService) {
    this.userEmailRegex = this.util.emailPattern;
  }

  async ngOnInit(): Promise<void> {
    await this.fetchUserData();
  }

  logOut() {
    // this.authService.sampleLogOut();
    this.authService.logOut();
  }

  async fetchUserData() {
    try {
      this.isLoading = true;
      await this.util.showLoading();
      this.userHandle = await this.authService.getCurrentUserHandle();
      this.connectedWallets = await this.authService.getConnectedWallets();
      this.connectedEmails = await this.authService.getConnectedEmails();
    } catch (error) {
      console.log('Error in home ngOnInit:', error);
    } finally {
      this.isLoading = false;
      await this.util.hideLoading();
    }
  }

  async connectMetamaskWallet() {
    await this.authService.connectAnotherMetamaskWallet();
    await this.fetchUserData();
  }

  async connectWalletConnectWallet() {
    await this.authService.connectAnotherWalletConnectWallet();
    await this.fetchUserData();
  }

  connectMagicLinkEmail() {
    this.showEmailModal = true;
  }

  closeEmailModal() {
    this.showEmailModal = false;
  }

  async confirmEmailModal() {
    if (this.util.isEmailAddressValid(this.userEmail.toLowerCase())) {
      // console.log(this.userEmail);
      this.showEmailModal = false;
      await this.authService.connectAnotherMagicLinkEmail(
        this.userEmail.toLowerCase()
      );
      await this.fetchUserData();
    } else {
      alert('Please enter a valid email!');
    }
  }
}

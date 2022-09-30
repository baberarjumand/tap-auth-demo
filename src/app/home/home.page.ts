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

  constructor(private authService: AuthService, private util: UtilService) {}

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
}

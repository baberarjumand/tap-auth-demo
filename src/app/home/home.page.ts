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

  constructor(private authService: AuthService, private util: UtilService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading = true;
      await this.util.showLoading();
      this.userHandle = await this.authService.getCurrentUserHandle();
    } catch (error) {
      console.log('Error in home ngOnInit:', error);
    } finally {
      this.isLoading = false;
      await this.util.hideLoading();
    }
  }

  logOut() {
    // this.authService.sampleLogOut();
    this.authService.logOut();
  }
}

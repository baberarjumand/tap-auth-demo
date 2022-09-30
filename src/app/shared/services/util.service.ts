import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  loadingRef: HTMLIonLoadingElement;
  emailPattern = new RegExp(
    // eslint-disable-next-line max-len
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/
  );

  constructor(private loadingCtrl: LoadingController) {}

  async showLoading(msg = 'Loading...') {
    this.loadingRef = await this.loadingCtrl.create({
      message: msg,
      // duration: 3000,
    });

    this.loadingRef.present();
  }

  async hideLoading() {
    if (this.loadingRef) {
      await this.loadingRef.dismiss();
    }
  }

  isEmailAddressValid(email: string): boolean {
    return this.emailPattern.test(email);
  }
}

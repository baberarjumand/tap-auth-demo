import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  loadingRef: HTMLIonLoadingElement;

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
}

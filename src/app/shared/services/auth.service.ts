import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

// eslint-disable-next-line @typescript-eslint/naming-convention
import Moralis from 'moralis-v1';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated$ = new BehaviorSubject(false);
  isProfileComplete$ = new BehaviorSubject(false);
  currentUserHandle = '';
  connectedWallets = [];

  constructor(private router: Router, private util: UtilService) {
    this.initializeMoraslis();
  }

  async initializeMoraslis() {
    try {
      await this.util.showLoading();

      const serverUrl = environment.moralisServerURL;
      const appId = environment.moraliseAppID;
      Moralis.start({ serverUrl, appId });

      // console.log('Current User:', Moralis.User.current());
      if (Moralis.User.current()) {
        this.isAuthenticated$.next(true);

        if (Moralis.User.current().has('handle')) {
          this.isProfileComplete$.next(true);
          this.router.navigate(['']);
        } else {
          this.isProfileComplete$.next(false);
          this.router.navigate(['setup-profile']);
        }
      }

      this.util.hideLoading();
    } catch (error) {
      console.error('Error in initializeMoraslis:', error);
      this.util.hideLoading();
    }
  }

  // if profile is complete, then go to home page
  // if profile is incomplete, then go to setup-profile page
  sampleLogin() {
    this.isAuthenticated$.next(true);
    this.router.navigate(['setup-profile']);
  }

  sampleLogOut() {
    this.isAuthenticated$.next(false);
    this.isProfileComplete$.next(false);
    this.router.navigate(['login']);
  }

  sampleSignUp() {
    this.isAuthenticated$.next(true);
    this.router.navigate(['']);
  }

  sampleSubmitUserHandleForm() {
    this.isProfileComplete$.next(true);
    this.router.navigate(['']);
  }

  isUserHandleUnique(handle: string) {
    return new Promise(async (res, reject) => {
      try {
        const USER_HANDLE = Moralis.Object.extend('UserHandle');
        const query = new Moralis.Query(USER_HANDLE);
        query.equalTo('handle', handle.toLowerCase());
        const object = await query.first();

        if (object) {
          res(false);
        } else {
          res(true);
        }
      } catch (err) {
        console.error('Error in isUserHandleUnique:', err);
        reject(err);
      }
    });
  }

  async createNewUserHandle(handle: string) {
    try {
      await this.util.showLoading();

      const currentUserObj = Moralis.User.current();

      // create new user handle obj and save to db
      const USER_HANDLE = Moralis.Object.extend('UserHandle');
      const userHandleObj = new USER_HANDLE();

      userHandleObj.set('handle', handle.toLowerCase());

      const connectedUsersArr = [];
      // connectedUsersArr.push(currentUserObj.id);
      connectedUsersArr.push(currentUserObj);
      userHandleObj.set('connectedUsers', connectedUsersArr);

      userHandleObj.set('handleClaimed', true);

      await userHandleObj.save();

      // associate newly created handle with current user obj
      currentUserObj.set('handle', userHandleObj);
      await currentUserObj.save();

      this.isProfileComplete$.next(true);
      this.router.navigate(['']);
    } catch (error) {
      console.error('Error in submitUserHandleForm:', error);
      this.isProfileComplete$.next(false);
    } finally {
      await this.util.hideLoading();
    }
  }

  async loginWithMetamask() {
    try {
      await this.util.showLoading('Logging in with Metamask...');

      const authResponse = await Moralis.authenticate({
        signingMessage: 'Log in to Tap Auth Demo using Metamask',
      });
      // console.log('Sign In With Metamask successful!:', authResponse);
      this.isAuthenticated$.next(true);

      await this.postSuccessfulLogin();
    } catch (err) {
      this.isAuthenticated$.next(false);

      if (err.message === 'Non ethereum enabled browser') {
        alert('Please install the Metamask Extension');
      } else if (err.code === 4001) {
        alert('Please try logging in again with Metamask.');
      } else {
        console.error('Error logging in Metamask:', err);
      }
    } finally {
      await this.util.hideLoading();
    }
  }

  async connectAnotherMetamaskWallet() {
    try {
      await this.util.showLoading('Connecting Another Metamask Wallet...');

      const authResponse = await Moralis.authenticate({
        signingMessage: 'Log in to Tap Auth Demo using Metamask',
      });

      await this.postSuccessfulConnection();
    } catch (error) {
      console.error('Error in connectAnotherMetamaskWallet:', error);
      alert(
        'There was an error connecting another Metamask Wallet. Please login again.'
      );
      this.logOut();
    } finally {
      await this.util.hideLoading();
    }
  }

  postSuccessfulLogin() {
    return new Promise((res, reject) => {
      try {
        const currentUser = Moralis.User.current();

        if (currentUser.has('handle')) {
          this.isProfileComplete$.next(true);
          this.router.navigate(['']);
          res(null);
          this.getCurrentUserHandle();
        } else {
          this.isProfileComplete$.next(false);
          this.router.navigate(['setup-profile']);
          res(null);
        }
      } catch (error) {
        console.error('Error in postSuccessfulLogin:', error);
        this.isProfileComplete$.next(false);
        reject(error);
      }
    });
  }

  async postSuccessfulConnection() {
    try {
      const currentUserObj = Moralis.User.current();

      // upon succesful auth, store userHandle pointer in User object
      const USER_HANDLE = Moralis.Object.extend('UserHandle');
      const query = new Moralis.Query(USER_HANDLE);
      query.equalTo('handle', this.currentUserHandle);
      const userHandleObj = await query.first();
      currentUserObj.set('handle', userHandleObj);
      await currentUserObj.save();

      // upon succesful auth, add new user obj to array of connectedUsers in userHandle object
      const connectedUsersArr = userHandleObj.get('connectedUsers');
      connectedUsersArr.push(currentUserObj);
      userHandleObj.set('connectedUsers', connectedUsersArr);
      await userHandleObj.save();
    } catch (error) {
      console.error('Error in postSuccessfulConnection:', error);
      throw error;
    }
  }

  async logOut() {
    try {
      await this.util.showLoading('Logging Out...');
      await Moralis.User.logOut();

      this.isAuthenticated$.next(false);
      this.isProfileComplete$.next(false);
      this.currentUserHandle = '';

      this.router.navigate(['login']);
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      await this.util.hideLoading();
    }
  }

  async getCurrentUserHandle(): Promise<string> {
    try {
      if (
        this.currentUserHandle.length === 0 ||
        this.currentUserHandle === ''
      ) {
        const currentUserHandleObj = Moralis.User.current().get('handle');

        if (!currentUserHandleObj.isDataAvailable()) {
          await currentUserHandleObj.fetch();
        }

        this.currentUserHandle = currentUserHandleObj.get('handle');
      }
      return this.currentUserHandle;
    } catch (error) {
      console.error('Error in getCurrentUserHandle:', error);
    }
  }

  async getConnectedWallets(): Promise<string[]> {
    try {
      if (this.currentUserHandle.length > 0) {
        const currentUserHandleObj = Moralis.User.current().get('handle');

        if (!currentUserHandleObj.isDataAvailable()) {
          await currentUserHandleObj.fetch();
        }

        const walletsArr = await Moralis.Cloud.run('getUsersConnectedWallets', {
          userHandle: currentUserHandleObj.get('handle'),
        });

        this.connectedWallets = walletsArr;
        return this.connectedWallets;
      }
    } catch (error) {
      console.error('Error in getConnectedWallets:', error);
    }
  }
}

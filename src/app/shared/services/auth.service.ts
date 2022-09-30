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
  connectedEmails = [];

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
      connectedUsersArr.push(currentUserObj.id);

      if (currentUserObj.has('email')) {
        userHandleObj.set('connectedEmailUsers', connectedUsersArr);
      } else {
        // connectedUsersArr.push(currentUserObj);
        userHandleObj.set('connectedWalletUsers', connectedUsersArr);
      }

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
        // alert('Please try logging in again with Metamask.');
        console.log('User denied Metamask signature request');
      } else {
        console.error('Error logging in Metamask:', err);
      }
    } finally {
      await this.util.hideLoading();
    }
  }

  async loginWithWalletConnect() {
    try {
      await this.util.showLoading('Logging in with WalletConnect...');

      const authResponse = await Moralis.authenticate({
        provider: 'walletconnect',
        signingMessage: 'Log in to Tap Auth Demo using WalletConnect',
      });
      // console.log('Sign In With Metamask successful!:', authResponse);
      this.isAuthenticated$.next(true);

      await this.postSuccessfulLogin();
    } catch (err) {
      this.isAuthenticated$.next(false);

      if (err.message === 'Non ethereum enabled browser') {
        alert('Please install the WalletConnect Extension');
      } else if (err.code === 4001) {
        alert('Please try logging in again with WalletConnect.');
      } else if (err.message === 'User closed modal') {
        // alert('WalletConnect modal dismissed by user.');
        console.log('WalletConnect modal dismissed by user.');
      } else {
        console.error('Error logging in WalletConnect:', err);
      }
    } finally {
      await this.util.hideLoading();
    }
  }

  async loginWithMagicLink(email: string) {
    try {
      await this.util.showLoading('Logging in with Magic Link...');

      const userObj = await Moralis.authenticate({
        provider: 'magicLink',
        email: email.toLowerCase(),
        apiKey: environment.magicLinkApiKey,
        network: 'mainnet',
      });

      userObj.set('email', email);
      await userObj.save();

      // console.log('Sign In With Metamask successful!:', authResponse);
      this.isAuthenticated$.next(true);

      await this.postSuccessfulLogin();
    } catch (err) {
      this.isAuthenticated$.next(false);

      if (err.message === 'Non ethereum enabled browser') {
        alert('Please install the WalletConnect Extension');
      } else if (err.code === 4001) {
        alert('Please try logging in again with WalletConnect.');
      } else {
        console.error('Error logging in WalletConnect:', err);
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

      await this.postSuccessfulWalletConnection();
    } catch (error) {
      if (error.code === 4001) {
        alert('Metamask Signature Request Denied. Please log in again.');
        console.log('User denied Metamask signature request');
        this.logOut();
      } else {
        console.error('Error in connectAnotherMetamaskWallet:', error);
        alert(
          'There was an error connecting another Metamask Wallet. Please login again.'
        );
        this.logOut();
      }
    } finally {
      await this.util.hideLoading();
    }
  }

  async connectAnotherWalletConnectWallet() {
    try {
      await this.util.showLoading('Connecting Another WalletConnect Wallet...');

      const authResponse = await Moralis.authenticate({
        provider: 'walletconnect',
        signingMessage: 'Log in to Tap Auth Demo using WalletConnect',
      });

      await this.postSuccessfulWalletConnection();
    } catch (error) {
      if (error.message === 'User closed modal') {
        console.log('WalletConnect modal dismissed by user.');
        alert('WalletConnect modal dismissed by user. Please log in again.');
        this.logOut();
      } else {
        console.error('Error in connectAnotherWalletConnectWallet:', error);
        alert(
          'There was an error connecting another WalletConnect Wallet. Please login again.'
        );
        this.logOut();
      }
    } finally {
      await this.util.hideLoading();
    }
  }

  async connectAnotherMagicLinkEmail(email: string) {
    try {
      await this.util.showLoading('Connecting Another Email via Magic Link...');

      // await Moralis.enableWeb3();
      await Moralis.User.logOut();

      const userObj = await Moralis.authenticate({
        provider: 'magicLink',
        email: email.toLowerCase(),
        apiKey: environment.magicLinkApiKey,
        network: 'mainnet',
      });

      userObj.set('email', email);
      await userObj.save();

      // console.log('Sign In With Metamask successful!:', authResponse);
      this.isAuthenticated$.next(true);

      await this.postSuccessfulEmailConnection();
    } catch (error) {
      console.error('Error in connectAnotherMagicLinkEmail:', error);
      alert(
        'There was an error connecting another Email with Magic Link. Please login again.'
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

  async postSuccessfulWalletConnection() {
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
      const connectedUsersArr = userHandleObj.get('connectedWalletUsers');
      connectedUsersArr.push(currentUserObj.id);
      // connectedUsersArr.push(currentUserObj);

      // remove duplicate user ids if present from array
      userHandleObj.set('connectedWalletUsers', [
        ...new Set(connectedUsersArr),
      ]);

      await userHandleObj.save();
    } catch (error) {
      console.error('Error in postSuccessfulConnection:', error);
      throw error;
    }
  }

  async postSuccessfulEmailConnection() {
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
      const connectedUsersArr = userHandleObj.get('connectedEmailUsers');
      connectedUsersArr.push(currentUserObj.id);
      // connectedUsersArr.push(currentUserObj);

      // remove duplicate user ids if present from array
      userHandleObj.set('connectedEmailUsers', [...new Set(connectedUsersArr)]);

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
      this.connectedWallets = [];
      this.connectedEmails = [];

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

  async getConnectedEmails(): Promise<string[]> {
    try {
      if (this.currentUserHandle.length > 0) {
        const currentUserHandleObj = Moralis.User.current().get('handle');

        if (!currentUserHandleObj.isDataAvailable()) {
          await currentUserHandleObj.fetch();
        }

        const emailsArr = await Moralis.Cloud.run('getUsersConnectedEmails', {
          userHandle: currentUserHandleObj.get('handle'),
        });

        this.connectedEmails = emailsArr;
        return this.connectedEmails;
      }
    } catch (error) {
      console.error('Error in getConnectedWallets:', error);
    }
  }
}

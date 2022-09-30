import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';
import { UniqueUserHandleValidator } from '../shared/validators/unique-handle-validator';

@Component({
  selector: 'app-setup-profile',
  templateUrl: './setup-profile.page.html',
  styleUrls: ['./setup-profile.page.scss'],
})
export class SetupProfilePage implements OnInit, OnDestroy {
  userHandle: string;
  userHandleInput: FormControl = new FormControl(
    '',
    [Validators.required, Validators.minLength(5)],
    // TODO add validation to detect spaces in input
    [this.userHandleValidator.validate.bind(this.userHandleValidator)]
  );
  userHandleInputSub: Subscription;

  constructor(
    private authService: AuthService,
    private userHandleValidator: UniqueUserHandleValidator
  ) {}

  ngOnInit() {
    // this.userHandleInputSub = this.userHandleInput.valueChanges
    //   .pipe(debounceTime(2000), distinctUntilChanged())
    //   .subscribe((val) => {
    //     // console.log(val);
    //     // console.log('Errors:', this.userHandleInput.errors);
    //   });
  }

  ngOnDestroy(): void {
    if (this.userHandleInputSub) {
      this.userHandleInputSub.unsubscribe();
    }
  }

  submitUserHandleForm() {
    if (this.userHandleInput.valid) {
      // this.authService.sampleSubmitUserHandleForm();
      this.authService.createNewUserHandle(this.userHandleInput.value);
    } else {
      alert('Please enter a valid Handle!');
    }
  }

  logOut() {
    // this.authService.sampleLogOut();
    this.authService.logOut();
  }
}

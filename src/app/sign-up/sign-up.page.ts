import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';
import { UniqueUserHandleValidator } from '../shared/validators/unique-handle-validator';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit, OnDestroy {
  userHandle: string;
  userHandleInput: FormControl = new FormControl(
    '',
    [Validators.required, Validators.minLength(5)],
    [this.userHandleValidator.validate.bind(this.userHandleValidator)]
  );
  userHandleInputSub: Subscription;

  constructor(
    private authService: AuthService,
    private userHandleValidator: UniqueUserHandleValidator
  ) {}

  ngOnInit() {
    this.userHandleInputSub = this.userHandleInput.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe((val) => {
        // console.log(val);
        // console.log('Errors:', this.userHandleInput.errors);
      });
  }

  ngOnDestroy(): void {
    if (this.userHandleInputSub) {
      this.userHandleInputSub.unsubscribe();
    }
  }

  signUp() {
    if (this.userHandleInput.valid) {
      this.authService.signUp();
    } else {
      alert('Please enter a valid Handle!');
    }
  }

  // userHandleInputChanged() {
  //   console.log(this.userHandle);
  // }
}

import { Injectable } from '@angular/core';
import {
  AsyncValidator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class UniqueUserHandleValidator implements AsyncValidator {
  constructor(private authService: AuthService) {} // private heroesService: HeroesService

  validate(
    control: AbstractControl
  ): Observable<ValidationErrors | null> | Promise<ValidationErrors | null> {
    // return this.heroesService.isAlterEgoTaken(control.value).pipe(
    //   map((isTaken) => (isTaken ? { uniqueAlterEgo: true } : null)),
    //   catchError(() => of(null))
    // );

    // return new Promise((resolve, reject) => {
    //   resolve(null);
    // });

    // return this.authService.isUserHandleUnique(control.value);

    return new Promise(async (resolve, reject) => {
      const isHandleUnique = await this.authService.isUserHandleUnique(
        control.value
      );
    //   console.log('isHandleUnique: ' + isHandleUnique);

      if (isHandleUnique) {
        resolve(null);
      } else {
        resolve({ uniqueHandleError: true });
      }
    });
  }
}

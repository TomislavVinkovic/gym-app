import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
    
export const equivalentValidator = (firstControlName: string, secondControlName: string): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
        const firstControl = control.get(firstControlName)!;
        const secondControl = control.get(secondControlName)!;

        if (secondControl.value && secondControl.value !== firstControl.value) {
            secondControl.setErrors({ notEqual: true });
        }

        return null;
    };
};
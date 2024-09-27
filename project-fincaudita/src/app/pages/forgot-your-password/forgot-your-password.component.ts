import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-your-password',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbTypeaheadModule],
  templateUrl: './forgot-your-password.component.html',
  styleUrl: './forgot-your-password.component.css'
})
export class ForgotYourPasswordComponent {
  currentStep: number = 1;
  email: string = '';
  verificationCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  timeLeft: number = 30; // Tiempo de espera para reenviar el código
  timer: any;
  showModal: boolean = true;  
  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

  // Método para pasar al siguiente paso
  nextStep(): void {
    if (this.currentStep === 1 && !this.validateEmail()) {
      Swal.fire('Error', 'Por favor, ingrese un correo electrónico válido.', 'error');
      return;
    }
    
    if (this.currentStep === 2 && !this.validateCode()) {
      Swal.fire('Error', 'Por favor, ingrese el código de verificación correctamente.', 'error');
      return;
    }

    if (this.currentStep === 3 && !this.validatePasswords()) {
      Swal.fire('Error', 'Las contraseñas no coinciden o están vacías.', 'error');
      return;
    }

    if (this.currentStep < 3) {
      this.currentStep++;
    } else {
      this.submitPassword();
    }
  }

  // Método para regresar al paso anterior
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Validación del correo electrónico
  validateEmail(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.email);
  }

  // Validación del código de verificación
  validateCode(): boolean {
    return this.verificationCode.length === 6; // Código de 6 dígitos
  }

  // Validación de las contraseñas
  validatePasswords(): boolean {
    return !!this.newPassword && !!this.confirmPassword && this.newPassword === this.confirmPassword;
  }
  

  // Reenviar código de verificación con temporizador
  resendCode(): void {
    if (this.timeLeft === 0) {
      this.timeLeft = 30; // Reinicia el contador a 30 segundos

      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft === 0) {
          clearInterval(this.timer);
        }
      }, 1000);
    }
  }

  // Confirmar salir y perder datos
  confirmExit(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si sales, perderás los datos ingresados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']); // Redirigir al inicio de sesión si se confirma
      }
    });
  }

  // Confirmar al ir atrás en el segundo paso
  confirmExitToStep1(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Perderás el código ingresado si retrocedes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, regresar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.currentStep = 1; // Volver al paso 1
      }
    });
  }

  // Confirmar al ir atrás en el tercer paso
  confirmExitToStep2(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Perderás las contraseñas ingresadas si retrocedes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, regresar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.currentStep = 2; // Volver al paso 2
      }
    });
  }

  // Enviar la nueva contraseña (solo validación por ahora)
  submitPassword(): void {
    if (this.validatePasswords()) {
      Swal.fire('¡Éxito!', 'Contraseña cambiada con éxito.', 'success');
      this.router.navigate(['/login']); // Redirige al inicio de sesión
    }
  }
}

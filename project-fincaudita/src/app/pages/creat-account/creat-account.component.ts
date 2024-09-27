import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-creat-account',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule, RouterModule],
  templateUrl: './creat-account.component.html',
  styleUrls: ['./creat-account.component.css']
})
export class CreatAccountComponent implements OnInit {
  currentStep: number = 1;

  person: any = {
    first_name: '', 
    last_name: '', 
    type_document: '', 
    document: '', 
    phone: '', 
    email: '', 
    birth_of_date: '',
    cityId: 0,
    addres: ''
  };

  user: any = {
    username: '',
    password: '',
    roles: []
  };

  citys: any[] = [];
  showModal: boolean = true;  

  private personApiUrl = 'http://localhost:9191/api/Person';
  private userApiUrl = 'http://localhost:9191/api/User';
  private citysUrl = 'http://localhost:9191/api/City';
  
  private personId: number | null = null;
  
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  searchCitys = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.citys.filter(city => city.name.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  formatCity = (city: any) => city.name;

  onCitySelect(event: any): void {
    const selectedCity = event.item;
    this.person.cityId = selectedCity.id;
  }

  ngOnInit(): void {
    this.getCitys();
  }

  getCitys(): void {
    this.http.get<any[]>(this.citysUrl).subscribe(
      (citys) => {
        this.citys = citys;
      },
      (error) => {
        console.error('Error fetching cities:', error);
      }
    );
  }

  getCityName(cityId: number): string {
    const city = this.citys.find(c => c.id === cityId);
    return city ? city.name : 'Unknown';
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.validateStep1()) {
      this.currentStep++;
    } else if (this.currentStep === 2 && this.validateStep2()) {
      this.currentStep++;
    } else if (this.currentStep === 3) {
      this.onSubmit();
    }
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const icon = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon?.classList.remove('fa-eye');
      icon?.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon?.classList.remove('fa-eye-slash');
      icon?.classList.add('fa-eye');
    }
  }
  

  validateStep1(): boolean {
    if (!this.person.first_name || !this.person.last_name || !this.person.type_document || 
        !this.person.document || !this.person.phone || !this.person.birth_of_date) {
      Swal.fire({
        title: '¡Error!',
        text: 'Todos los campos del primer paso son obligatorios.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#ffffff', // Fondo blanco
        color: '#721c24', // Color del texto
        padding: '20px', // Espaciado interno
        showClass: {
          popup: 'animate__animated animate__fadeInDown' // Animación al aparecer
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp' // Animación al desaparecer
        },
        customClass: {
          title: 'swal-title',
          popup: 'swal-popup'
        }
      });
      return false;
    }
    return true;
  }
  
  validateStep2(): boolean {
    if (!this.person.cityId || !this.person.addres || !this.person.email || !this.validateEmail(this.person.email)) {
      Swal.fire({
        title: '¡Error!',
        text: 'Todos los campos del segundo paso son obligatorios y el correo debe ser válido.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#ffffff', // Fondo blanco
        color: '#721c24', // Color del texto
        padding: '20px', // Espaciado interno
        showClass: {
          popup: 'animate__animated animate__fadeInDown' // Animación al aparecer
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp' // Animación al desaparecer
        },
        customClass: {
          title: 'swal-title',
          popup: 'swal-popup'
        }
      });
      return false;
    }
    return true;
  }
  

  validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  confirmExit(): void {
    Swal.fire({
      title: '<strong>¿Estás seguro?</strong>',
      html: `
        <p>Si sales, perderás todos los datos ingresados.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-check-circle"></i> Sí, salir',
      cancelButtonText: '<i class="fa fa-times-circle"></i> Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#44E32A', // Color del botón de confirmación (verde)
      cancelButtonColor: '#ff0000', // Color del botón de cancelación (verde)
      timer: 10000, 
      timerProgressBar: true, 
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      customClass: {
        confirmButton: 'custom-confirm-btn',
        cancelButton: 'custom-cancel-btn',
        popup: 'custom-popup',
        title: 'custom-title',
        htmlContainer: 'custom-html'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']);
      }
    });
  }

  onSubmit(): void {
    if (!this.person.cityId) {
      Swal.fire('Error', 'Debe seleccionar una ciudad válida.', 'error');
      return;
    }

    this.person.birth_of_date = new Date(this.person.birth_of_date).toISOString();
    this.person.document = this.person.document.toString();

    this.http.post<any>(this.personApiUrl, this.person).subscribe({
      next: (response) => {
        this.personId = response.id;
        console.log('Datos de la persona enviados con éxito, ID:', this.personId);
        this.submitUserData();
      },
      error: () => {
        Swal.fire('Error', 'Hubo un problema al enviar los datos de la persona', 'error');
      }
    });
  }

  private submitUserData(): void {
    if (this.personId === null) {
      Swal.fire('Error', 'No se pudo obtener el ID de la persona.', 'error');
      return;
    }

    const userData = {
      username: this.user.username,
      password: this.user.password,
      roles: [{ id: 1 }],
      personId: this.personId
    };

    this.http.post(this.userApiUrl, userData).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Cuenta creada con éxito', 'success');
        this.router.navigate(['/login']);
      },
      error: () => {
        Swal.fire('Error', 'Hubo un problema al enviar los datos del usuario', 'error');
      }
    });
  }
}

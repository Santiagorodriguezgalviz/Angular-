import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  countries: any[] = [];
  country: any = { id: 0, name: '', description: '', code: '', state: false };
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/Country';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getCountries();
  }

  getCountries(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (countries) => {
        this.countries = countries;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  onSubmit(form: NgForm): void {
    if (this.country.id === 0) {
      this.http.post(this.apiUrl, this.country).subscribe(() => {
        this.getCountries();
        this.closeModal();
        Swal.fire('Éxito', 'País creado con éxito.', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.country).subscribe(() => {
        this.getCountries();
        this.closeModal();
        Swal.fire('Éxito', 'País actualizado con éxito.', 'success');
      });
    }
  }

  editCountry(country: any): void {
    this.country = { ...country };
    this.openModal();
  }

  deleteCountry(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getCountries();
          Swal.fire('Eliminado', 'El país ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.country = { id: 0, name: '', description: '', code: '', state: false };
  }
}

import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule],
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {
  cities: any[] = [];
  city: any = { id: 0, name: '', description: '', code: '', departamentId: 0, state: false };
  departaments: any[] = [];
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/City';
  private departamentsUrl = 'http://localhost:9191/api/departament';  

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  searchdepartaments = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.departaments.filter(departament => departament.name?.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  formatdepartament = (departament: any) => departament.name;

  ondepartamentSelect(event: any): void {
    const selecteddepartament = event.item;
    this.city.departamentId = selecteddepartament.id;
  }

  ngOnInit(): void {
    this.getCities();
    this.getdepartaments();
  }

  getCities(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (cities) => {
        this.cities = cities;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching cities:', error);
      }
    );
  }

  getdepartaments(): void {
    this.http.get<any[]>(this.departamentsUrl).subscribe(
      (departaments) => {
        this.departaments = departaments;
      },
      (error) => {
        console.error('Error fetching departaments:', error);
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
    if (!this.city.departamentId) {
      Swal.fire('Error', 'Debe seleccionar un departamento válido.', 'error');
      return;
    }
  
    if (this.city.id === 0) {
      this.http.post(this.apiUrl, this.city).subscribe(() => {
        this.getCities();
        this.closeModal();
        Swal.fire('Éxito', 'Ciudad creada con éxito.', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.city).subscribe(() => {
        this.getCities();
        this.closeModal();
        Swal.fire('Éxito', 'Ciudad actualizada con éxito.', 'success');
      });
    }
  }

  editCity(city: any): void {
    this.city = { ...city };
    this.openModal();
  }

  deleteCity(id: number): void {
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
          this.getCities();
          Swal.fire('Eliminado', 'La ciudad ha sido eliminada.', 'success');
        });
      }
    });
  }

  getdepartamentName(id: number): string {
    const departament = this.departaments.find(c => c.id === id);
    return departament ? departament.name : '';
  }

  resetForm(): void {
    this.city = { id: 0, name: '', description: '', code: '', departamentId: 0, state: false };
  }
}

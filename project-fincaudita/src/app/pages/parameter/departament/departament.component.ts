import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-departament',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule],
  templateUrl: './departament.component.html',
  styleUrl: './departament.component.css'
})
export class DepartamentComponent {

  departaments: any[] = [];
  departament: any = { id: 0, name: '', description: '', code: '', countryId: 0, state: false };
  countrys: any[] = [];
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/departament';
  private countrysUrl = 'http://localhost:9191/api/country';  

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  searchcountrys = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.countrys.filter(country => country.name?.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  formatcountry = (country: any) => country.name;

  oncountrySelect(event: any): void {
    const selectedcountry = event.item;
    this.departament.countryId = selectedcountry.id;
  }

  ngOnInit(): void {
    this.getdepartaments();
    this.getcountrys();
  }

  getdepartaments(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (departaments) => {
        this.departaments = departaments;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener los departamentos:', error);
      }
    );
  }

  getcountrys(): void {
    this.http.get<any[]>(this.countrysUrl).subscribe(
      (countrys) => {
        this.countrys = countrys;
      },
      (error) => {
        console.error('Error al obtener los países:', error);
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
    if (!this.departament.countryId) {
      Swal.fire('Error', 'Debe seleccionar un país válido.', 'error');
      return;
    }
  
    if (this.departament.id === 0) {
      this.http.post(this.apiUrl, this.departament).subscribe(() => {
        this.getdepartaments();
        this.closeModal();
        Swal.fire('Éxito', '¡Departamento creado con éxito!', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.departament).subscribe(() => {
        this.getdepartaments();
        this.closeModal();
        Swal.fire('Éxito', '¡Departamento actualizado con éxito!', 'success');
      });
    }
  }

  editdepartament(departament: any): void {
    this.departament = { ...departament };
    this.openModal();
  }

  deletedepartament(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, ¡borrar!',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getdepartaments();
          Swal.fire('¡Borrado!', 'El departamento ha sido eliminado.', 'success');
        });
      }
    });
  }

  getcountryName(id: number): string {
    const country = this.countrys.find(c => c.id === id);
    return country ? country.name : '';
  }

  resetForm(): void {
    this.departament = { id: 0, name: '', description: '', code: '', countryId: 0, state: false };
  }
}

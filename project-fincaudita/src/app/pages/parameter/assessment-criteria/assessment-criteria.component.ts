import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assessment-criteria',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule],
  templateUrl: './assessment-criteria.component.html',
  styleUrls: ['./assessment-criteria.component.css']
})
export class AssessmentCriteriaComponent implements OnInit {
  assesments: any[] = [];
  assesment: any = { id: 0, name: '', type_criterian: '', rating_range: 0, state: false };
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/AssesmentCriteria';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getassesments();
  }

  getassesments(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (assesments) => {
        this.assesments = assesments;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching assesments:', error);
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
    if (this.assesment.id === 0) {
      this.http.post(this.apiUrl, this.assesment).subscribe(() => {
        this.getassesments();
        this.closeModal();
        Swal.fire('Éxito', 'Criterio de evaluación creado con éxito.', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.assesment).subscribe(() => {
        this.getassesments();
        this.closeModal();
        Swal.fire('Éxito', 'Criterio de evaluación actualizado con éxito.', 'success');
      });
    }
  }

  editassesment(assesment: any): void {
    this.assesment = { ...assesment };
    this.openModal();
  }

  deleteassesment(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, elimínalo',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getassesments();
          Swal.fire('Eliminado', 'El criterio de evaluación ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.assesment = { id: 0, name: '', type_criterian: '', rating_range: 0, state: false };
  }
}

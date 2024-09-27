import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-evidence',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule],
  templateUrl: './evidence.component.html',
  styleUrls: ['./evidence.component.css']
})
export class EvidenceComponent implements OnInit {
  evidences: any[] = [];
  evidence: any = { id: 0, code: '', document: '', reviewId: 0, state: false };
  reviews: any[] = [];  // Lista de revisiones
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/evidence';
  private reviewsUrl = 'http://localhost:9191/api/ReviewTechnical';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  searchReviewIds = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.reviews.filter(review => review.id.toString().indexOf(term) > -1).slice(0, 10))
    );

  formatReviewId = (review: any) => review.id;

  onReviewIdSelect(event: any): void {
    const selectedReview = event.item;
    this.evidence.reviewId = selectedReview.id;  // Asigna el ID de la revisión seleccionada
  }

  ngOnInit(): void {
    this.getEvidences();
    this.getReviews();  // Cargar las revisiones al iniciar
  }

  getEvidences(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (evidences) => {
        this.evidences = evidences;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching evidences:', error);
      }
    );
  }

  getReviews(): void {
    this.http.get<any[]>(this.reviewsUrl).subscribe(
      (reviews) => {
        this.reviews = reviews;
      },
      (error) => {
        console.error('Error fetching reviews:', error);
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
    if (!this.evidence.reviewId) {
      Swal.fire('Error', 'Debe seleccionar una revisión válida.', 'error');
      return;
    }

    if (this.evidence.id === 0) {
      this.http.post(this.apiUrl, this.evidence).subscribe(() => {
        this.getEvidences();
        this.closeModal();
        Swal.fire('Éxito', 'Evidencia creada exitosamente.', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.evidence).subscribe(() => {
        this.getEvidences();
        this.closeModal();
        Swal.fire('Éxito', 'Evidencia actualizada exitosamente.', 'success');
      });
    }
  }

  editEvidences(evidence: any): void {
    this.evidence = { ...evidence };
    this.openModal();
  }

  deleteEvidences(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminarlo',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getEvidences();
          Swal.fire('¡Eliminado!', 'La evidencia ha sido eliminada.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.evidence = { id: 0, code: '', document: '', reviewId: 0, state: false };
  }
}

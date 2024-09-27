import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-technical',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './review-technical.component.html',
  styleUrls: ['./review-technical.component.css']
})
export class ReviewTechnicalComponent {

  review = {
    id:'',
    date_review: '',
    technician: '',
    state: '',
    farm: '',
    crop_code: '',
    producer: '',
    observations: '',
    checklists: {
      qualifications: [
        { observation: 'Tiene desinfección de calzado activa', qualification_criteria: 0, calification: 0, observations: '' },
        { observation: 'Cultivos libres de plantas muertas', qualification_criteria: 0, calification: 0, observations: '' },
        // Agrega más ítems aquí según tu lista de chequeo
      ]
    }
  };

  reviews: any[] = []; // Para almacenar la lista de revisiones
  isModalOpen = false; // Estado del modal
  isEditMode = false; // Modo de edición
  currentReviewId: number | null = null; // ID de la revisión actual

  constructor(private http: HttpClient) {}

  onSubmit(form: any): void {
    if (this.isEditMode) {
      this.updateReview();
    } else {
      this.addReview();
    }
    this.closeModal(); // Cerrar el modal después de agregar o editar
  }

  addReview(): void {
    // Lógica para agregar una nueva revisión
    this.reviews.push({ ...this.review, id: this.reviews.length + 1 }); // Simulación de ID
    console.log('Agregada nueva revisión:', this.review);
    this.resetForm();
  }

  updateReview(): void {
    const index = this.reviews.findIndex((r) => r.id === this.currentReviewId);
    if (index !== -1) {
      this.reviews[index] = { ...this.review, id: this.currentReviewId };
      console.log('Revisión actualizada:', this.review);
      this.resetForm();
    }
  }

  editReview(review: any): void {
    this.isEditMode = true;
    this.currentReviewId = review.id;
    this.review = { ...review }; // Cargar los datos de la revisión en el formulario
    this.openModal(); // Abrir el modal para editar
  }

  deleteReview(id: number): void {
    this.reviews = this.reviews.filter((r) => r.id !== id);
    console.log('Revisión eliminada con ID:', id);
  }

  resetForm(): void {
    this.review = {
      id: '',
      date_review: '',
      technician: '',
      state: '',
      farm: '',
      crop_code: '',
      producer: '',
      observations: '',
      checklists: {
        qualifications: [
          { observation: 'Tiene desinfección de calzado activa', qualification_criteria: 0, calification: 0, observations: '' },
          { observation: 'Cultivos libres de plantas muertas', qualification_criteria: 0, calification: 0, observations: '' },
          // Agrega más ítems aquí según tu lista de chequeo
        ]
      }
    };
    this.isEditMode = false;
    this.currentReviewId = null;
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm(); // Resetear el formulario al cerrar el modal
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    console.log(file);
    // Lógica para manejar la carga de archivos
  }

  onCancel(): void {
    this.closeModal(); // Lógica para manejar la cancelación
  }
}

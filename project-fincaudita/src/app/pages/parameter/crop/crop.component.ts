import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crop',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './crop.component.html',
  styleUrls: ['./crop.component.css']  // Corregido de styleUrl a styleUrls
})
export class CropComponent implements OnInit {
  crops: any[] = [];
  crop: any = { id: 0, name: '', description: '', code: '', state: false };
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/Crop';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getCrops();
  }

  getCrops(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (crops) => {
        this.crops = crops;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener los cultivos:', error);
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
    if (this.crop.id === 0) {
      this.http.post(this.apiUrl, this.crop).subscribe(() => {
        this.getCrops();
        this.closeModal();
        Swal.fire('Éxito', 'Cultivo creado con éxito.', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.crop).subscribe(() => {
        this.getCrops();
        this.closeModal();
        Swal.fire('Éxito', 'Cultivo actualizado con éxito.', 'success');
      });
    }
  }

  editCrop(crop: any): void {
    this.crop = { ...crop };
    this.openModal();
  }

  deleteCrop(id: number): void {
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
          this.getCrops();
          Swal.fire('Eliminado', 'El cultivo ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.crop = { id: 0, name: '', description: '', code: '', state: false };
  }
}

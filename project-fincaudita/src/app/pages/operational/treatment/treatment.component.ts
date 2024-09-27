import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-treatment',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, MultiSelectModule],
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.css']
})
export class TreatmentComponent implements OnInit {
  treatments: any[] = [];
  treatment: any = {
    id: 0,
    dateTreatment: new Date().toISOString().slice(0, 10),
    typeTreatment: '',
    quantityMix: '',
    state: true,
    lotList: [],
    supplieList: []
  };
  lots: any[] = [];
  supplies: any[] = [];
  selectedLots: any[] = [];
  selectedSupplies: any[] = [];
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/Treatment';
  private apiUrlLots = 'http://localhost:9191/api/Lot';
  private apiUrlSupplies = 'http://localhost:9191/api/Supplies';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getTreatments();
    this.getLots();
    this.getSupplies();
  }

  // Obtener los tratamientos existentes
  getTreatments(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (treatments) => {
        this.treatments = treatments.map(treatment => ({
          ...treatment,
          dateTreatment: new Date(treatment.dateTreatment).toISOString().slice(0, 10)
        }));
      },
      (error) => {
        let message = 'Hubo un problema al obtener los tratamientos.';
        if (error.status === 404) {
          message = 'No se encontraron tratamientos.';
        } else if (error.status === 500) {
          message = 'Error en el servidor, intenta más tarde.';
        }
        Swal.fire('Error', message, 'error');
      }
    );
  }

  // Obtener lotes para el multiselect
  getLots(): void {
    this.http.get<any[]>(this.apiUrlLots).subscribe(
      (lots) => {
        this.lots = lots.map(lot => ({
          lotId: lot.id,
          lotName: lot.crop ? lot.crop.name : 'Desconocido'  // Verifica que crop exista
        }));
        this.cdr.detectChanges();  // Asegurarse de detectar cambios
      },
      (error) => {
        console.error('Error fetching lots:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los lotes.', 'error');
      }
    );
  }

  // Obtener suministros
  getSupplies(): void {
    this.http.get<any[]>(this.apiUrlSupplies).subscribe(
      (supplies) => {
        this.supplies = supplies;
        this.cdr.detectChanges();  // Asegurarse de detectar cambios
      },
      (error) => {
        console.error('Error fetching supplies:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los suministros.', 'error');
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
    const lotList = this.selectedLots.map(lot => ({
      lotId: lot.lotId
      
    }));

    const supplieList = this.selectedSupplies.map(supply => ({
      suppliesId: supply.suppliesId,
      dose: supply.dose ? supply.dose.toString() : ''  // Convertir la dosis a string si existe
    }));

    const treatmentToSave = {
      ...this.treatment,
      lotList: lotList.length > 0 ? lotList : null,
      supplieList: supplieList.length > 0 ? supplieList : null
    };

    if (!form.valid || !lotList.length || !supplieList.length) {
      Swal.fire('Advertencia', 'Por favor completa todos los campos y selecciona lotes y suministros.', 'warning');
      return;
    }

    if (this.treatment.id === 0) {
      // POST request para crear un nuevo tratamiento
      this.http.post(this.apiUrl, treatmentToSave).subscribe({
        next: () => {
          this.getTreatments();
          this.resetForm();
          Swal.fire('Éxito', '¡Tratamiento creado exitosamente!', 'success');
          this.getTreatments(); 
        },
        error: (error) => {
          console.error('Error al crear tratamiento:', error);
          Swal.fire('Error', 'Hubo un problema al crear el tratamiento.', 'error');
        }
      });
    } else {
      // PUT request para actualizar el tratamiento
      this.http.put(`${this.apiUrl}/${this.treatment.id}`, treatmentToSave).subscribe({
        next: () => {
          this.getTreatments();
          this.resetForm();
          Swal.fire('Éxito', '¡Tratamiento actualizado exitosamente!', 'success');
        },
        error: (error) => {
          console.error('Error al actualizar tratamiento:', error);
          Swal.fire('Error', 'Hubo un problema al actualizar el tratamiento.', 'error');
        }
      });
    }
  }

  editTreatment(treatment: any): void {
    this.treatment = {
      ...treatment,
      details: treatment.details || [],
    };
    this.selectedLots = treatment.lotList || [];
    this.selectedSupplies = treatment.supplieList || [];
    this.openModal();  // Abrir el modal para editar
  }

  deleteTreatment(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, ¡elimínalo!',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getTreatments();
          Swal.fire('¡Eliminado!', 'El tratamiento ha sido eliminado.', 'success');
        }, (error) => {
          console.error('Error eliminando tratamiento:', error);
          Swal.fire('Error', 'Hubo un problema al eliminar el tratamiento.', 'error');
        });
      }
    });
  }

  // Reseteo del formulario
  resetForm(): void {
    this.treatment = {
      id: 0,
      dateTreatment: new Date().toISOString().slice(0, 10),
      typeTreatment: '',
      quantityMix: '',
      state: true,
      lotList: [],
      supplieList: []
    };
    this.selectedLots = [];
    this.selectedSupplies = [];
    this.cdr.detectChanges();
  }
}
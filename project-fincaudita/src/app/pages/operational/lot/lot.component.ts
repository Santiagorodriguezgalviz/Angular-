import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lot',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule],
  templateUrl: './lot.component.html',
  styleUrls: ['./lot.component.css']
})
export class LotComponent implements OnInit {
  lots: any[] = [];
  lot: any = { id: 0, cropId: 0, farmId: 0, num_hectareas: 0, state: true };
  farms: any[] = [];
  crops: any[] = [];
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/lot';
  private farmsUrl = 'http://localhost:9191/api/Farm';
  private cropsUrl = 'http://localhost:9191/api/crop';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  searchFarms = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.farms.filter(farm => farm.name.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  formatFarm = (farm: any) => farm.name;

  onFarmSelect(event: any): void {
    const selectedFarm = event.item;
    this.lot.farmId = selectedFarm.id;
    this.cdr.detectChanges(); // Forzar la actualización del componente
  }

  searchCrops = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.crops.filter(crop => crop.name.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  formatCrop = (crop: any) => crop.name;

  onCropSelect(event: any): void {
    const selectedCrop = event.item;
    this.lot.cropId = selectedCrop.id;
    this.cdr.detectChanges(); // Forzar la actualización del componente
  }

  ngOnInit(): void {
    this.getLots();
    this.getFarms();
    this.getCrops();
  }

  getLots(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (lots) => {
        this.lots = lots;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching lots:', error);
      }
    );
  }

  getFarms(): void {
    this.http.get<any[]>(this.farmsUrl).subscribe(
      (farms) => {
        this.farms = farms;
      },
      (error) => {
        console.error('Error fetching farms:', error);
      }
    );
  }

  getCrops(): void {
    this.http.get<any[]>(this.cropsUrl).subscribe(
      (crops) => {
        this.crops = crops;
      },
      (error) => {
        console.error('Error fetching crops:', error);
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
    if (!this.lot.cropId || !this.lot.farmId) {
      Swal.fire('Error', 'Debe seleccionar un cultivo y una finca válidos.', 'error');
      return;
    }
  
    this.lot.num_hectareas = +this.lot.num_hectareas; // Convertir num_hectareas a número entero
  
    if (this.lot.id === 0) {
      this.http.post(this.apiUrl, this.lot).subscribe({
        next: () => {
          this.getLots();
          this.closeModal();
          Swal.fire('Éxito', 'Lote creado exitosamente!', 'success');
        },
        error: (err) => {
          console.error('Error creating lot:', err);
          Swal.fire('Error', 'Error al crear el lote.', 'error');
        }
      });
    } else {
      this.http.put(this.apiUrl, this.lot).subscribe({
        next: () => {
          this.getLots();
          this.closeModal();
          Swal.fire('Éxito', 'Lote actualizado exitosamente!', 'success');
        },
        error: (err) => {
          console.error('Error updating lot:', err);
          Swal.fire('Error', 'Error al actualizar el lote.', 'error');
        }
      });
    }
  }

  editLot(lot: any): void {
    this.lot = { ...lot };
    this.openModal();
  }

  deleteLot(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, ¡elimínalo!',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getLots();
          Swal.fire('¡Eliminado!', 'El lote ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.lot = { id: 0, cropId: 0, farmId: 0, num_hectareas: 0, state: true };
  }

  getFarmName(farmId: number): string {
    const farm = this.farms.find(f => f.id === farmId);
    return farm ? farm.name : 'Desconocido';
  }

  getCropName(cropId: number): string {
    const crop = this.crops.find(c => c.id === cropId);
    return crop ? crop.name : 'Desconocido';
  }
}

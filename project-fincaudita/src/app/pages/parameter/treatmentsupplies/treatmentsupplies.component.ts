import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-treatmentsupplies',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule],
  templateUrl: './treatmentsupplies.component.html',
  styleUrl: './treatmentsupplies.component.css'
})
export class TreatmentsuppliesComponent implements OnInit {
  TreatmentsuppliesComponents: any[] = [];
  TreatmentsuppliesComponent: any = { id: 0, dose: '', suppliesId: 0, treatmentId: 0, state: true };
  SuppliesComponent: any[] = [];
  TreatmentComponent: any[] = [];
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/Treatmentsupplies';
  private suppliesUrl = 'http://localhost:9191/api/Supplies';
  private treatmentUrl = 'http://localhost:9191/api/Treatment';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  searchSupplies = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.SuppliesComponent.filter(supply => supply.name.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  searchTreatments = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.TreatmentComponent.filter(treatment => treatment.typeTreatment.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

    formatSupply = (supply: any) => supply.name;
    formatTreatment = (treatment: any) => treatment.typeTreatment;

    onSuppliesSelect(event: any): void {
      const selectedSupply = event.item;
      this.TreatmentsuppliesComponent.suppliesId = selectedSupply.id;
    }
  
    onTreatmentSelect(event: any): void {
      const selectedTreatment = event.item;
      this.TreatmentsuppliesComponent.treatmentId = selectedTreatment.id;
    }

    ngOnInit(): void {
      this.getTreatmentsupplies();
      this.getSupplies();
      this.getTreatments();
    }
  

    getTreatmentsupplies(): void {
      this.http.get<any[]>(this.apiUrl).subscribe(
        (treatmentsupplies) => {
          this.TreatmentsuppliesComponents = treatmentsupplies;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching Treatmentsupplies:', error);
        }
      );
    }
    
    getSupplies(): void {
      this.http.get<any[]>(this.suppliesUrl).subscribe(
        (supplies) => {
          this.SuppliesComponent = supplies;
        },
        (error) => {
          console.error('Error fetching Supplies:', error);
        }
      );
    }
    
    getTreatments(): void {
      this.http.get<any[]>(this.treatmentUrl).subscribe(
        (treatments) => {
          this.TreatmentComponent = treatments;
        },
        (error) => {
          console.error('Error fetching Treatments:', error);
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
    if (!this.TreatmentsuppliesComponent.suppliesId || !this.TreatmentsuppliesComponent.treatmentId) {
      Swal.fire('Error', 'Debe seleccionar un suministro y un tratamiento válidos.', 'error');
      return;
    }

    if (this.TreatmentsuppliesComponent.id === 0) {
      this.http.post(this.apiUrl, this.TreatmentsuppliesComponent).subscribe(() => {
        this.getTreatmentsupplies();
        this.closeModal();
        Swal.fire('Success', 'Tratamiento y suministro creados exitosamente!', 'success');
      });
    } else {
      this.http.put(this.apiUrl, this.TreatmentsuppliesComponent).subscribe(() => {
        this.getTreatmentsupplies();
        this.closeModal();
        Swal.fire('Success', 'Tratamiento y suministro actualizados exitosamente!', 'success');
      });
    }
  }

  editTreatmentsupplies(item: any): void {
    this.TreatmentsuppliesComponent = { ...item };
    this.openModal();
  }

  deleteTreatmentsupplies(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getTreatmentsupplies();
          Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.TreatmentsuppliesComponent = { id: 0, dose: '', suppliesId: 0, treatmentId: 0, state: true };
  }

  getSupplyName(suppliesId: number): string {
    const supply = this.SuppliesComponent.find(sup => sup.id === suppliesId);
    return supply ? supply.name : 'Desconocido';
  }

  getTreatmentName(treatmentId: number): string {
    const treatment = this.TreatmentComponent.find(treat => treat.id === treatmentId);
    return treatment ? treatment.typeTreatment : 'Desconocido';
  }
}
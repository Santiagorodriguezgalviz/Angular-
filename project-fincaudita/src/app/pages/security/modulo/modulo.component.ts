import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { DataTableSettingsCustom } from './interface'; // Adjust the path as necessary
import { Modulo } from './interface-modulo'; // Import the Modulo interface

@Component({
  selector: 'app-modulo',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, DataTablesModule],
  templateUrl: './modulo.component.html',
  styleUrls: ['./modulo.component.css']
})
export class ModuloComponent implements OnInit, AfterViewInit {
  modulos: Modulo[] = []; // Use the Modulo type for modulos
  modulo: Modulo = { id: 0, name: '', description: '', position: 0, state: true, selected: false }; // Initialize modulo with Modulo type
  isModalOpen = false;
  dtOptions: DataTableSettingsCustom = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtInstance: any; // Variable to hold DataTable instance

  private apiUrl = 'http://localhost:9191/api/Modulo';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      searching: true,
      ordering: true,
      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros",
        info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "No hay registros disponibles",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        }
      }
    };
    this.getModulos();
  }

  ngAfterViewInit(): void {
    // Initialize DataTable here
    this.dtTrigger.subscribe(() => {
      // Initialize the DataTable
      this.dtInstance = (window as any).$(`#DataTables_Table_0`).DataTable(this.dtOptions);
    });
  }

  ngOnDestroy(): void {
    // Clean up DataTable
    if (this.dtInstance) {
      this.dtInstance.destroy(true);
    }
    this.dtTrigger.unsubscribe();
  }

  getModulos(): void {
    this.http.get<Modulo[]>(this.apiUrl).subscribe( // Specify the expected type for the response
      (modulos) => {
        this.modulos = modulos.map(modulo => ({ ...modulo, selected: false }));
        if (this.dtInstance) {
          // If DataTable instance exists, clear and update the data
          this.dtInstance.clear();
          this.dtInstance.rows.add(this.modulos);
          this.dtInstance.draw();
        } else {
          this.dtTrigger.next(null); // Notifica a DataTables que los datos han cambiado
        }
      },
      (error) => {
        console.error('Error fetching modules:', error);
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
  if (this.modulo.id === 0) {
    // Create new modulo
    this.http.post<Modulo>(this.apiUrl, this.modulo).subscribe((newModulo) => {
      // Update the DataTable and the modulos array
      this.modulos.push({ ...newModulo, selected: false });
      if (this.dtInstance) {
        // Clear the current DataTable and redraw it with the new data
        this.dtInstance.clear();
        this.dtInstance.rows.add(this.modulos);
        this.dtInstance.draw();
      }
      this.closeModal();
      Swal.fire('Éxito', '¡Módulo creado exitosamente!', 'success');
    });
  } else {
    // Update existing modulo
    this.http.put(this.apiUrl, this.modulo).subscribe(() => {
      this.getModulos(); // Refresh the module list
      this.closeModal();
      Swal.fire('Éxito', '¡Módulo actualizado exitosamente!', 'success');
    });
  }
}

  editModulo(modulo: Modulo): void {
    this.modulo = { ...modulo };
    this.openModal();
  }

  deleteModulo(id: number): void {
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
        // Remove the deleted module from the array
        this.modulos = this.modulos.filter(modulo => modulo.id !== id);
        
        if (this.dtInstance) {
          // Update the DataTable to reflect the changes
          this.dtInstance.clear();
          this.dtInstance.rows.add(this.modulos);
          this.dtInstance.draw();
        }
        
        Swal.fire('¡Eliminado!', 'Tu módulo ha sido eliminado.', 'success');
      });
    }
  });
}
  selectAll(event: any): void {
    const checked = event.target.checked;
    this.modulos.forEach(modulo => (modulo.selected = checked));
  }

  areAllSelected(): boolean {
    return this.modulos.length > 0 && this.modulos.every(modulo => modulo.selected);
  }

  hasSelected(): boolean {
    return this.modulos.some(modulo => modulo.selected);
  }

  deleteSelected(): void {
    const selectedIds = this.modulos.filter(modulo => modulo.selected).map(modulo => modulo.id);

    if (selectedIds.length > 0) {
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
          const deleteRequests = selectedIds.map(id => this.http.delete(`${this.apiUrl}/${id}`).toPromise());

          Promise.all(deleteRequests).then(() => {
            this.getModulos();
            Swal.fire('¡Eliminados!', 'Los módulos seleccionados han sido eliminados.', 'success');
          });
        }
      });
    }
  }

  resetForm(): void {
    this.modulo = { id: 0, name: '', description: '', position: 0, state: false, selected: false };
  }
}

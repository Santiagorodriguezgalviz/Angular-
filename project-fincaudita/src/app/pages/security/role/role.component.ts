import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MultiSelectModule } from 'primeng/multiselect';


@Component({
  selector: 'app-role',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, MultiSelectModule],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  roles: any[] = [];
  role: any = { id: 0, name: '', description: '', viewString: null, views: [], state: true };
  views: any[] = [];
  isModalOpen = false;
  private apiUrl = 'http://localhost:9191/api/Role';
  private apiUrlViews = 'http://localhost:9191/api/View';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getRoles();
    this.getViews();
  }

  getRoles(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (roles) => {
        this.roles = roles;
        this.processRoles();
        console.log('Roles loaded:', this.roles);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener roles:', error);
      }
    );
  }

  getViews(): void {
    this.http.get<any[]>(this.apiUrlViews).subscribe(
      (views) => {
        this.views = views;
        console.log('Views loaded:', this.views);
      },
      (error) => {
        console.error('Error al obtener vistas:', error);
      }
    );
  }

  processRoles(): void {
    this.roles.forEach(role => {
      role.viewString = role.views.map((view: any) => view.textoMostrar || view.name).join(', ');
    });
  }
  
  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  onSubmit(form: NgForm): void {
    if (!this.role.views || this.role.views.length === 0) {
      Swal.fire('Error', 'Debe seleccionar vistas válidas.', 'error');
      return;
    }
    const roleToSave = {
      ...this.role,
      views: this.role.views.map((view: any) => ({
        id: view.id,
        textoMostrar: view.textoMostrar || view.name  // Envía el texto correcto al backend
      }))
    };
    
    if (this.role.id === 0) {
      this.http.post(this.apiUrl, roleToSave).subscribe({
        next: () => {
          this.getRoles();
          this.closeModal();
          Swal.fire('Éxito', '¡Rol creado exitosamente!', 'success');
        },
        error: (error) => {
          console.error('Error al crear rol:', error);
          Swal.fire('Error', 'Hubo un problema al crear el rol.', 'error');
        }
      });
    } else {
      this.http.put(this.apiUrl, roleToSave).subscribe({
        next: () => {
          this.getRoles();
          this.closeModal();
          Swal.fire('Éxito', '¡Rol actualizado correctamente!', 'success');
        },
        error: (error) => {
          console.error('Error al actualizar rol:', error);
          Swal.fire('Error', 'Hubo un problema al actualizar el rol.', 'error');
        }
      });
    }
  }

  editRole(role: any): void {
    // Clone the role object and make sure views are correctly mapped
    this.role = { ...role, views: role.views.map((view: any) => {
      // Ensure view has id and display text (name or textoMostrar)
      return { id: view.id, name: view.name || view.textoMostrar };
    })};
  
    // Ensure the selected views are updated in the modal's multiselect
    const selectedRoleIds = this.role.views.map((view: any) => view.id);
    this.role.views = this.views.filter((view: any) => selectedRoleIds.includes(view.id));
  
    this.openModal();
  }
  
  

  deleteRole(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¡No podrá revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Sí, elimínelo!',
      cancelButtonText: '¡No, cancele!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getRoles();
          Swal.fire('Eliminado', 'Su rol ha sido eliminado.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.role = { id: 0, name: '', description: '', views: [], state: true };
  }
}
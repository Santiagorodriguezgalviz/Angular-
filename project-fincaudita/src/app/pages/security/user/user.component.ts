import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';  
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap'; 
import Swal from 'sweetalert2';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule, MultiSelectModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  users: any[] = [];
  user: any = { id: 0, username: '', password: '',  personId: 0, state: true };
  persons: any[] = []; 
  roles: any[] = [];
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/User';
  private personsUrl = 'http://localhost:9191/api/Person';
  private rolesUrl = 'http://localhost:9191/api/Role';
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  searchPersons= (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.persons.filter(person => person.first_name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    );

  formatPerson = (person: any) => person.first_name;  // Formato de los resultados mostrados en el autocompletado

  onPersonSelect(event: any): void {
    const selectedPerson = event.item;
    this.user.personId = selectedPerson.id;  // Asigna el ID del módulo seleccionado
  }

  ngOnInit(): void {
    this.getUsers();
    this.getPersons();  // Cargar los módulos al iniciar
    this.getRoles();
  }

  getUsers(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (users) => {
        this.users = users;
        
        this.processUsers(); 
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  getRoles(): void {
    this.http.get<any[]>(this.rolesUrl).subscribe(
      (roles) => {
        this.roles = roles;
        console.log('Roles loaded:', this.roles);
      },
      (error) => {
        console.error('Error fetching roles:', error);
      }
    );
  }

  processUsers(): void {
    this.users.forEach(user => {
      user.roleString = user.roles.map((role: any) => role.textoMostrar).join(', ');
    });
  }

  getPersons(): void {
    this.http.get<any[]>(this.personsUrl).subscribe(
      (persons) => {
        this.persons = persons;
      },
      (error) => {
        console.error('Error fetching persons:', error);
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
    if (!this.user.personId) {
      Swal.fire('Error', 'Debe seleccionar una persona válida.', 'error');
      return;
    }

    if (!this.user.roles || this.user.roles.length === 0) {
      Swal.fire('Error', 'Debe seleccionar al menos un rol.', 'error');
      return;
    }

    const userToSave = {
      ...this.user,
      roles: this.user.roles.map((role: any) => ({
        id: role.id,
        textoMostrar: role.textoMostrar
      }))
    };

    if (this.user.id === 0) {
      this.http.post(this.apiUrl, userToSave).subscribe(() => {
        this.getUsers();
        this.closeModal();
        Swal.fire('Success', 'Usuario creado exitosamente!', 'success');
      });
    } else {
      this.http.put(this.apiUrl, userToSave).subscribe(() => {
        this.getUsers();
        this.closeModal();
        Swal.fire('Success', 'Usuario actualizado exitosamente!', 'success');
      });
    }
}

  editUsers(user: any): void {
    this.user = { ...user, roles: user.roles.map((role: any) => ({ id: role.id, textoMostrar: role.textoMostrar })) };

    // Asegúrate de que los roles seleccionados se vinculen correctamente
    const selectedRoleIds = this.user.roles.map((role: any) => role.id);
    this.user.roles = this.roles.filter((role: any) => selectedRoleIds.includes(role.id));
  
    this.openModal();
}


  deleteUsers(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.getUsers();
          Swal.fire(
            'Deleted!',
            'Your view has been deleted.',
            'success'
          );
        });
      }
    });
  }

  resetForm(): void {
    this.user = { id: 0, username: '', password: '',  personId: 0, state: true };
  }

  getPersonName(personId: number): string {
    const person = this.persons.find(per => per.id === personId);
    return person ? person.first_name : 'Unknown';
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements OnInit {
  username: string = '';
  password: string = '';
  private apiUrl = 'http://localhost:9191/login'; 
  private updatePasswordUrl = 'http://localhost:9191/api/user';
  profileImageUrl: string | ArrayBuffer | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Cargar la URL de la imagen desde localStorage
    this.profileImageUrl = localStorage.getItem('profileImageUrl') || '../../assets/Avatar.png';
    this.loadUserData(); // Cargar los datos del usuario
  }

  loadUserData() {
    this.username = localStorage.getItem('UserId') || ''; 
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result;
        localStorage.setItem('profileImageUrl', this.profileImageUrl as string);
      };
      reader.readAsDataURL(file);
    }
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const icon = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon?.classList.remove('fa-eye');
      icon?.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon?.classList.remove('fa-eye-slash');
      icon?.classList.add('fa-eye');
    }
  }

  saveChanges() {
    const userId = localStorage.getItem('userId'); 
    const updatedData = {
        userId: userId, 
        newPassword: this.password,
        profileImageUrl: this.profileImageUrl
    };

    const apiUrl = `http://localhost:9191/api/user/${userId}`;

    this.http.put(apiUrl, updatedData).subscribe(
        (response: any) => {
            Swal.fire({
                title: 'Éxito',
                text: 'La contraseña se actualizó correctamente.',
                icon: 'success',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        },
        (error: any) => {
            Swal.fire({
                title: 'Error',
                text: 'Error al actualizar la contraseña: ' + error.message,
                icon: 'error',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    );
  }
}

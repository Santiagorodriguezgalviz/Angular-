import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-farm',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule, MultiSelectModule],
  templateUrl: './farm.component.html',
  styleUrls: ['./farm.component.css']

  
})

export class FarmComponent implements OnInit {
  
  farms: any[] = [];
  farm: any = { id: 0, name: '', cityId: 0, userId: 0, lots: [], addres: '', dimension: 0, state: false };
  cities: any[] = [];
  users: any[] = [];
  crops: any[] = [];
  selectedCropId: number[] = [];
  hectares: number | null = null;
  isModalOpen = false;

  private apiUrl = 'http://localhost:9191/api/Farm';
  private citiesUrl = 'http://localhost:9191/api/City';
  private usersUrl = 'http://localhost:9191/api/User';
  private cropsUrl = 'http://localhost:9191/api/Crop';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getFarms();
    this.getCities();
    this.getUsers();
    this.getCrops();
  }

  searchCities = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.cities
        .filter(city => city.name?.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  searchUsers = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.users
        .filter(user => user.username?.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  formatCity = (city: any) => city.name;
  formatUser = (user: any) => user.username;

  onCitySelect(event: any): void {
    const selectedCity = event.item;
    this.farm.cityId = selectedCity.id;
  }

  onUserSelect(event: any): void {
    const selectedUser = event.item;
    this.farm.userId = selectedUser.id;
  }

  getFarms(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (farms) => {
        this.farms = farms;
        this.processFarms();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching farms:', error);
      }
    );
  }

  getCities(): void {
    this.http.get<any[]>(this.citiesUrl).subscribe(
      (cities) => {
        this.cities = cities;
      },
      (error) => {
        console.error('Error fetching cities:', error);
      }
    );
  }

  getUsers(): void {
    this.http.get<any[]>(this.usersUrl).subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  getCrops(): void {
    this.http.get<any[]>(this.cropsUrl).subscribe(
      (crops) => {
        this.crops = crops;
        console.log(this.crops); 
      },
      (error) => {
        console.error('Error fetching crops:', error);
      }
    );
  }

  processFarms(): void {
    this.farms.forEach(farm => {
      farm.lotString = (farm.lots && Array.isArray(farm.lots))
        ? farm.lots.map((lot: any) => `${this.getCropName(lot.cropId)} - ${lot.num_hectareas} ha`).join(', ')
        : 'Ninguno';
    });
  }


  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  addLot(cropIds: number[], hectares: number | null): void {
    if (cropIds.length > 0 && hectares !== null) {
        cropIds.forEach(cropId => {
            this.farm.lots.push({ cropId: cropId, num_hectareas: hectares });
        });
        this.selectedCropId = [];
        this.hectares = null;
    } else {
        Swal.fire('Error', 'Debe seleccionar al menos un cultivo y un número de hectáreas válidos.', 'error');
    }
}



  onSubmit(form: NgForm): void {
    if (!this.farm.cityId || !this.farm.userId) {
      Swal.fire('Error', 'Debe seleccionar una ciudad y un usuario válidos.', 'error');
      return;
    }

    if (!this.farm.lots || this.farm.lots.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un lote válido.', 'error');
      return;
    }

      // Asegúrate de que cada lot tenga la estructura correcta
      console.log('Farm lots:', this.farm.lots); // Verifica la estructura

    // Asegúrate de que cada lot tenga la estructura correcta
    const farmToSave = {
        ...this.farm,
        lots: this.farm.lots.map((lot: { cropId: { id: any; }; num_hectareas: any; }) => ({
            cropId: lot.cropId.id, // Asegúrate de que cropId tenga el ID correcto
            num_hectareas: lot.num_hectareas
        }))
    };

    if (this.farm.id === 0) {
      this.http.post(this.apiUrl, farmToSave).subscribe({
        next: () => {
          this.getFarms();
          this.closeModal();
          Swal.fire('Éxito', '¡Finca creada exitosamente!', 'success');
        },
        error: (error) => {
          console.error('Error al crear finca:', error);
          Swal.fire('Error', 'Hubo un problema al crear la finca.', 'error');
        }
      });
    } else {
      this.http.put(this.apiUrl, farmToSave).subscribe({
        next: () => {
          this.getFarms();
          this.closeModal();
          Swal.fire('Éxito', '¡Finca actualizada correctamente!', 'success');
        },
        error: (error) => {
          console.error('Error al actualizar finca:', error);
          Swal.fire('Error', 'Hubo un problema al actualizar la finca.', 'error');
        }
      });
    }
  }

  editFarm(farm: any): void {
    this.farm = {
      ...farm,
      lots: farm.lots || [],
    };
    this.openModal();
  }

  deleteFarm(id: number): void {
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
          this.getFarms();
          Swal.fire('¡Eliminado!', 'La finca ha sido eliminada.', 'success');
        });
      }
    });
  }
  
  resetForm(): void {
    this.farm = { id: 0, name: '', cityId: 0, userId: 0, lots: [], addres: '', dimension: 0, state: false };
    this.selectedCropId = [];
    this.hectares = null;
  }

  getCityName(id: number): string {
    const city = this.cities.find(c => c.id === id);
    return city ? city.name : 'Desconocido';
  }

  getUserName(id: number): string {
    const user = this.users.find(u => u.id === id);
    return user ? user.username : 'Desconocido';
  }

  getCropName(cropId: number): string {
    const crop = this.crops.find(cr => cr.id === cropId);
    return crop ? crop.name : 'Desconocido';
  }
}
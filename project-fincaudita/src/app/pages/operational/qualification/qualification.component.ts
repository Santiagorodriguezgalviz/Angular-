import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qualification',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, NgbTypeaheadModule],
  templateUrl: './qualification.component.html',
  styleUrls: ['./qualification.component.css']
})
export class QualificationComponent implements OnInit {
  califications: any[] = [];
  calification: any = { id: 0, observation: '', qualification_criteria: 0, assesmentCriteriaId: 0, checklistId: 0, state: false };
  assessmentCriteria: any[] = [];
  checklists: any[] = [];
  isModalOpen = false;

  private calificationsUrl = 'http://localhost:9191/api/qualification';
  private assessmentCriteriaUrl = 'http://localhost:9191/api/AssesmentCriteria';
  private checklistsUrl = 'http://localhost:9191/api/checklist';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getCalifications();
    this.getAssessmentCriteria();
    this.getChecklists();
  }

  getCalifications(): void {
    this.http.get<any[]>(this.calificationsUrl).subscribe(
      (califications) => {
        this.califications = califications;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching califications:', error);
      }
    );
  }

  getAssessmentCriteria(): void {
    this.http.get<any[]>(this.assessmentCriteriaUrl).subscribe(
      (criteria) => {
        this.assessmentCriteria = criteria;
      },
      (error) => {
        console.error('Error fetching assessment criteria:', error);
      }
    );
  }

  getChecklists(): void {
    this.http.get<any[]>(this.checklistsUrl).subscribe(
      (checklists) => {
        this.checklists = checklists;
      },
      (error) => {
        console.error('Error fetching checklists:', error);
      }
    );
  }

  searchAssessmentCriteria = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.assessmentCriteria
        .filter(criteria => criteria.name?.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  searchChecklists = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.checklists
        .filter(checklist => checklist.calification_total?.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  formatAssessmentCriteria = (criteria: any) => criteria.name;
  formatChecklist = (checklist: any) => checklist.calification_total;

  onAssessmentCriteriaSelect(event: any): void {
    this.calification.assesmentCriteriaId = event.item.id;
  }

  onChecklistSelect(event: any): void {
    this.calification.checklistId = event.item.id;
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  onSubmit(form: NgForm): void {
    if (this.calification.id === 0) {
      this.http.post(this.calificationsUrl, this.calification).subscribe(() => {
        this.getCalifications();
        this.closeModal();
        Swal.fire('Éxito', 'La calificación ha sido creada con éxito.', 'success');
      });
    } else {
      this.http.put(this.calificationsUrl, this.calification).subscribe(() => {
        this.getCalifications();
        this.closeModal();
        Swal.fire('Éxito', 'La calificación ha sido actualizada con éxito.', 'success');
      });
    }
  }

  editCalification(calification: any): void {
    this.calification = { ...calification };
    this.openModal();
  }

  deleteCalification(id: number): void {
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
        this.http.delete(`${this.calificationsUrl}/${id}`).subscribe(() => {
          this.getCalifications();
          Swal.fire('Eliminado!', 'La calificación ha sido eliminada.', 'success');
        });
      }
    });
  }

  resetForm(): void {
    this.calification = { id: 0, observation: '', qualification_criteria: 0, assesmentCriteriaId: 0, checklistId: 0, state: false };
  }

  getAssessmentCriteriaName(id: number): string {
    const criteria = this.assessmentCriteria.find(c => c.id === id);
    return criteria ? criteria.name : '';
  }

  getChecklistName(id: number): string {
    const checklist = this.checklists.find(c => c.id === id);
    return checklist ? checklist.calification_total : '';
  }
}

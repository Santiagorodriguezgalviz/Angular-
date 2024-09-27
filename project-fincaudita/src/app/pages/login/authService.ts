import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


    authentication(): boolean{
        const storedMenu = localStorage.getItem("menu");
        if(storedMenu){
            return true
        }else{
            return false
        }
    }
    
}
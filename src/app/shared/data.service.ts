import { Injectable } from '@angular/core';
import { collection, getDocs, Firestore, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore:Firestore ) {}

  async getAllCustomers(){
    const collectionInstance = collection(this.firestore, 'users')
    return await getDocs(collectionInstance)
  }
}

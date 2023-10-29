import { Component, ViewChild } from '@angular/core';
import { MatSort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from 'src/app/shared/data.service';
import { FormControl, FormGroup} from '@angular/forms';
import { Customer } from 'src/app/model/customer';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent{
  
  dataSource!: any;
  customers: any[] = []
  displayedColumns = ['id','name','age']
 
  public min_age = this.getFromStorage('min_age')
  public max_age = this.getFromStorage('max_age')
  public id = this.getFromStorage('id')
  public name = this.getFromStorage('name')
  public searchForm !: FormGroup;



  @ViewChild(MatSort) sort !: MatSort;

  constructor(private service: DataService, private snackBar: MatSnackBar){}

  ngOnInit(){
    this.searchFormInit();
    this.getCustomers();
    
  }
  

  async getCustomers(){
    const snapshot:any = await this.service.getAllCustomers();
    snapshot.forEach((doc: any) => {
      this.customers.push(doc.data())
    })
    this.dataSource = new MatTableDataSource(this.customers)
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.getFilterPredicate();
    this.apply();
  }
  
  searchFormInit(){
    this.searchForm = new FormGroup({
      min_age: new FormControl('') ,
      max_age: new FormControl(''),
      name: new FormControl(''),
      id: new FormControl('')
    })
  }

  getFilterPredicate(){
    return (row: Customer, filters: string) =>{

      const filterArray = filters.split('$');
  
      const id = filterArray[0] ? filterArray[0]: '';
      const name = filterArray[1] ? filterArray[1] : '';
      const min_age = filterArray[2] !== '' ? filterArray[2] : '0'
      const max_age = filterArray[3] !== '' ? filterArray[3] : '500';

      const matchFilter = [];
      const columnAge = row.age;
      const columnId = row.id;
      const columnName = row.name

      // verify fetching data by our searching values
      const customFilterAge= parseInt(columnAge) >= parseInt(min_age) 
        && parseInt(columnAge) <= parseInt(max_age);
      const customFilterId = columnId.toLowerCase().includes(id);
      const customFilterName = columnName.toLowerCase().includes(name);

      matchFilter.push(customFilterAge);
      matchFilter.push(customFilterId);
      matchFilter.push(customFilterName);

      return matchFilter.every(Boolean)
        
    }
  }

  applyFilter() {
    
    const id = this.searchForm.get('id')?.value;
    const min_age = this.searchForm.get('min_age')?.value;
    const max_age = this.searchForm.get('max_age')?.value;
    const name = this.searchForm.get('name')?.value;
    
    this.id = id === null ? '': id;
    this.min_age = min_age === null ? '' : min_age;
    this.max_age = max_age === null ? '' : max_age;
    this.name = name === null ? '' : name;

    // create string of our searching values and split if by '$'
    const filterValue = this.id + '$' + this.name + '$' + this.min_age + '$' + this.max_age;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
  }


  apply(){
    // Saving filters to localStorage
    this.addToStorage('name', this.name);
    this.addToStorage('id',this.id);
    this.addToStorage('min_age', this.min_age);
    this.addToStorage('max_age',this.max_age)


    // Apply filter using stored values
    this.searchForm.get('name')?.setValue(this.getFromStorage('name'));
    this.searchForm.get('min_age')?.setValue(this.getFromStorage('min_age'));
    this.searchForm.get('max_age')?.setValue(this.getFromStorage('max_age'));
    this.searchForm.get('id')?.setValue(this.getFromStorage('id'));
    
    this.applyFilter();
    this.openSnackBar('Filters applied.')
    

  }

  addToStorage(key : string, val:string){
    localStorage.setItem(key, val);
  }

  getFromStorage(key: string){
    return localStorage.getItem(key) ?? ''
  }
  
  clearFilters(){
    this.searchForm.get('id')?.setValue('');
    this.searchForm.get('name')?.setValue('');
    this.searchForm.get('min_age')?.setValue('');
    this.searchForm.get('max_age')?.setValue('');

    localStorage.clear()
    this.dataSource.filter = '';
    this.openSnackBar('Filters cleared.')
  }

  openSnackBar(message: string){
    this.snackBar.open(message,'',{
      duration: 3000
    })
  }

  
}


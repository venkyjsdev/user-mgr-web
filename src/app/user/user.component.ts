import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { AppService } from '../app.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'roleType', 'status' , 'action'];
  dataSource: any = new MatTableDataSource([]);
  animal: string;
  name: string;

  constructor(public dialog: MatDialog, public _service : AppService) {}
  ngOnInit() {

    this._getUsers()
  }

  _getUsers(){
    this._service._get('/users').subscribe(res =>{
      console.log(res)
      this.dataSource.data = res.data
    },err=>{
      console.log(err)
    })
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  deleteUser(id){
    this._service._delete(`/users/${id}`).subscribe(res =>{
      this._getUsers()
    },err=>{
      console.log(err)
    })
  }

  openDialog(action,user): void {
    const dialogRef = this.dialog.open(entry, {
      width: '500px',
      data: {action: action, user : user}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if(result){
          let _userBody = {
            "data":[{
                "name": result.data.name,
                "email": result.data.email,
                "role": result.data.role,
                "mobile": result.data.mobile
           }]
        }
          if(result.action == "add"){
            this._service._post('/users',_userBody).subscribe(res =>{
              console.log(res)
              this._getUsers()
            },err=>{
              console.log(err)
            })
          }else if(result.action == "edit"){
            this._service._put(`/users/${result.data.id}`,_userBody).subscribe(res =>{
              console.log(res)
              this._getUsers()
            },err=>{
              console.log(err)
            })
          }
      }


    });
  }

}

@Component({
  selector: 'entry',
  templateUrl: 'entry.html',
})
export class entry {
  user : FormGroup
  tital :  string = "Add User"
  constructor(
    public dialogRef: MatDialogRef<entry>, private fb : FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) {
     this.tital = this.data.action == "add" ? "Add User" : "Edit User" ;
      this.user = this.fb.group({
          id : [null],
        name : [null,Validators.required],
         email : [null,Validators.required] ,
         role : [null,Validators.required],
         mobile : [null]
      })

      if(this.data.user){
        this.user.patchValue({
          id : this.data.user._id,
          name : this.data.user.name,
          email :  this.data.user.email,
          role : this.data.user.role,
          mobile : this.data.user.mobile
        })
      }
    }
  submit(): void {
      this.dialogRef.close({action:this.data.action,data:this.user.value})
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}

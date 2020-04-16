import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DbService } from './../services/db.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  editForm: FormGroup;
  id: any;

  constructor(
    private db: DbService,
    private router: Router,
    public formBuilder: FormBuilder,
    private actRoute: ActivatedRoute
  ) {
    this.id = this.actRoute.snapshot.paramMap.get('id');

    this.db.getUser(this.id).then(res => {
      this.editForm.setValue({
        nombre: res['user_nombre'],
        apellido: res['user_apellido'],
        telefono: res['user_telefono'],
        correo: res['user_correo'],
        fecha_nacimiento: res['user_fecha_nacimiento'],
        genero: res['user_genero']
      });
    });
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      nombre: [''],
      apellido: [''],
      telefono: [''],
      correo: [''],
      fecha_nacimiento: [''],
      genero: ['']
    });
  }

  saveForm() {
    this.db.updateUser(this.id, this.editForm.value)
    .then( (res) => {
      console.log(res)
      this.router.navigate(['/home']);
    });
  }
}

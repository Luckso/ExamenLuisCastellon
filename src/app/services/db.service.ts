import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { User } from './user';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})

export class DbService {
  private storage: SQLiteObject;
  usersList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
  ) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'other_db.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          this.storage = db;
          this.getDataFal();
        });
    });
  }

  dbState() {
    return this.isDbReady.asObservable();
  }

  fetchUsers(): Observable<User[]> {
    return this.usersList.asObservable();
  }

  getDataFal() {
    this.httpClient.get(
      'assets/dump.sql',
      { responseType: 'text' }
    ).subscribe(data => {
      this.sqlPorter.importSqlToDb(this.storage, data)
        .then(_ => {
          this.getUsers();
          this.isDbReady.next(true);
        })
        .catch(error => console.error(error));
    });
  }

  getUsers() {
    return this.storage.executeSql('SELECT * FROM usertable ORDER BY apellido', []).then(res => {
      const items: User[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            id: res.rows.item(i).id,
            nombre: res.rows.item(i).user_nombre,
            apellido: res.rows.item(i).user_apellido,
            telefono: res.rows.item(i).user_telefono,
            correo: res.rows.item(i).user_correo,
            fecha_nacimiento: res.rows.item(i).user_fecha_nacimiento,
            genero: res.rows.item(i).user_genero,
          });
        }
      }
      this.usersList.next(items);
    });
  }

  // tslint:disable-next-line: variable-name
  addUser(user_nombre, user_apellido, user_telefono, user_correo, user_fecha_nacimiento, user_genero) {
    const data = [user_nombre, user_apellido, user_telefono, user_correo, user_fecha_nacimiento, user_genero];
    // tslint:disable-next-line: max-line-length
    return this.storage.executeSql('INSERT INTO usertable (user_nombre, user_apellido, user_telefono, user_correo, user_fecha_nacimiento, user_genero) VALUES (?, ?, ?, ?, ?, ?)', data)
      .then(res => {
        this.getUsers();
      });
  }

  getUser(id): Promise<User> {
    return this.storage.executeSql('SELECT * FROM usertable WHERE id = ?', [id]).then(res => {
      return {
        id: res.rows.item(0).id,
        nombre: res.rows.item(0).user_nombre,
        apellido: res.rows.item(0).user_apellido,
        telefono: res.rows.item(0).user_telefono,
        correo: res.rows.item(0).user_correo,
        fecha_nacimiento: res.rows.item(0).user_fecha_nacimiento,
        genero: res.rows.item(0).user_genero,
      };
    });
  }

  updateUser(id, user: User) {
    let data = [user.nombre, user.apellido, user.telefono, user.correo, user.fecha_nacimiento, user.genero];
    // tslint:disable-next-line: max-line-length
    return this.storage.executeSql(`UPDATE usertable SET user_nombre = ?, user_apellido = ?, user_telefono = ?, user_correo = ?, user_fecha_nacimiento = ?, user_genero = ?  WHERE id = ${id}`, data)
      .then(data => {
        this.getUsers();
      })
  }

  deleteUser(id) {
    return this.storage.executeSql('DELETE FROM usertable WHERE id = ?', [id])
      .then(_ => {
        this.getUsers();
      });
  }
}
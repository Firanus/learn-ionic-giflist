import { Injectable } from '@angular/core';
import { Storage, SqlStorage } from 'ionic-angular';

/*
  Generated class for the Data provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Data {

  storage: Storage;

  constructor() {
    this.storage = new Storage(SqlStorage, {name:'giflist-settings'});
  }

  getData(): Promise<any> {
    return this.storage.get("settings");
  }

  save(data): void {
    let newData = JSON.stringify(data);
    this.storage.set("settings", newData);
  }

}

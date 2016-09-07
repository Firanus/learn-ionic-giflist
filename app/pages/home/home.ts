import { Component } from '@angular/core';
import { ModalController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { SettingsPage } from '../settings/settings';
import { Data } from '../../providers/data/data';
import { FORM_DIRECTIVES, Control } from '@angular/common';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [Data]
})
export class HomePage {

  settings: any;
  loading: boolean = false;
  posts: any = []
  subreddit: string = 'gifs';
  page: number = 1;
  perPage: number = 15;
  after: string;
  stopIndex: number;
  sort: string = "hot";
  moreCount: number = 0;
  subredditValue: string;

  subredditControl: Control;

  constructor(public http: Http, public dataService: Data, public modalCtrl: ModalController, public alertCtrl: AlertController) {

    this.subredditControl = new Control();

    //valueChanges is an observable
    this.subredditControl.valueChanges.debounceTime(1500).distinctUntilChanged().subscribe(subreddit => {

      if(subreddit != '' && subreddit){
        this.subreddit = subreddit;
        this.changeSubreddit();
      }

    })

    this.loadSettings();
  }

  fetchData(): void{
    console.log("TODO: Implement fetchData()");
  }

  loadSettings(): void{
    console.log("TODO: Implement loadSettings()");
  }

  showComments(post): void{
    console.log("TODO: Implement showComments()");
  }

  openSettings(): void{
    console.log("TODO: Implement openSettings()");
  }

  playVideo(): void{
    console.log("TODO: Implement playVideo()");
  }

  changeSubreddit(): void{
    console.log("TODO: Implement changeSubreddit()");
  }

  loadMore(): void{
    console.log("TODO: Implement loadMore()");
  }
}

import { Component } from '@angular/core';
import { ModalController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { SettingsPage } from '../settings/settings';
import { Data } from '../../providers/data/data';
import { FORM_DIRECTIVES, Control } from '@angular/common';
import { InAppBrowser } from 'ionic-native';
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

      if (subreddit != '' && subreddit) {
        this.subreddit = subreddit;
        this.changeSubreddit();
      }

    })

    this.loadSettings();
  }

  fetchData(): void {
    //Build the URL that will access the API based on the user's peferences
    let url = "https://www.reddit.com/r/" + this.subreddit + "/" + this.sort + "/.json?limit=" + this.perPage;

    //If we aren't on the first page, we'll need an after parameter to ensure we only get new results
    //It basically says, "give me results that come AFTER this post

    if (this.after) {
      url += "&after=" + this.after;
    }

    //We're now fetching data, so set the loading attribute to true';
    this.loading = true;

    //Make an Http request to the URL and subscribe to the response
    this.http.get(url).map(res => res.json()).subscribe(data => {
      let stopIndex = this.posts.length;
      this.posts = this.posts.concat(data.data.children);

      //Loop through all new posts in (in reverse, as we are removing some items)
      for (let i = this.posts.length - 1; i >= stopIndex; i--) {

        let post = this.posts[i];

        //Add a new property that will later be used to toggle a loafing animation for individual posts
        post.showLoader = false;

        //Add a NSFW thumbnail to NSFW posts
        if (post.data.thumbnail == "nsfw") {
          this.posts[i].data.thumbnail = "images/nsfw.pmg";
        }

        /*
          Remove all posts that are not in the .gifv or .webm format and convert
          the ones that are to .mp4 files.
        */

        if (post.data.url.indexOf(".gifv") > -1 || post.data.url.indexOf(".webm") > -1) {
          this.posts[i].data.url = post.data.url.replace(".gifv", ".mp4");
          this.posts[i].data.url = post.data.url.replace(".gifv", ".mp4");

          //if a preview image is available, assign it to the post as 'snapshot'
          if (typeof (post.data.preview) != "undefined") {
            this.posts[i].data.snapshot = post.data.preview.images[0].source.url.replace(/&amp;/g, "&");

            //if a snapshot is undefined, change it to be blank so it doesn't use a broken images
            if (this.posts[i].data.snapshot == "undefined") {
              this.posts[i].data.snapshot = "";
            }
          }
          else {
            this.posts[i].data.snapshot = "";
          }
        }
        else {
          this.posts.splice(i, 1)
        }
      }

      //We are done loading now so change the loading variable back
      this.loading = false;

      /*
      Keep fetching more GIFs if we didn't retrieve enough to fill a page but give up
      after 20 tries if we still don't have enough
      */
      if (data.data.children.length === 0 || this.moreCount > 20) {

        let alert = this.alertCtrl.create({
          title: 'Oops!',
          subTitle: "Having trouble finding GIFs - try another subreddit, sort order, or increase the page size in you settings.",
          buttons: ['Ok']
        });

        alert.present();

        this.moreCount = 0;
      }

      else {
        this.after = data.data.children[data.data.children.length - 1].data.name;

        if (this.posts.length < this.perPage * this.page) {
          this.fetchData();
          this.moreCount++;
        }
        else {
          this.moreCount = 0;
        }
      }

    }, (err) => {
      //Fail silently, in this case the loading spinner will just continue to display
      console.log("subreddit doesn't exist!");
    })
  }

  loadSettings(): void {

    this.dataService.getData().then((settings) => {

      if(typeof(settings) != "undefined"){

        this.settings = JSON.parse(settings);

        if(this.settings.length != 0){
          this.sort = this.settings.sort;
          this.perPage = this.settings.perPage;
          this.subreddit = this.settings.subreddit;
        }
      }

      this.changeSubreddit();

    })
  }

  showComments(post): void {
    InAppBrowser.open("http://reddit.com" + post.data.permalink, "_system", "location=yes");
  }

  openSettings(): void {

    let settingsModal = this.modalCtrl.create(SettingsPage, {
      perPage: this.perPage,
      sort: this.sort,
      subreddit: this.subreddit
    });

    settingsModal.onDidDismiss(settings => {

      if(settings){
        this.perPage = settings.perPage;
        this.sort = settings.sort;
        this.subreddit = settings.subreddit;

        this.dataService.save(settings);
        this.changeSubreddit();
      }
    });

    settingsModal.present();
  }

  playVideo(e, post): void {

    //Create a reference to the video
    let video = e.target;

    //Set the loader animation in the right position
    post.loaderOffset = e.target.offsetTop + 20 + "px";

    //Toggle the video playing
    if(video.paused){

      //Show the loader gif
      post.showLoader = true;
      video.play();

      //Once the video starts playing, remove the loader gifs
      video.addEventListener("playing", function(e){
        post.showLoader = false;
      });

    } else {
      video.pause();
    }
  }

  changeSubreddit(): void {
    this.page = 1;
    this.posts = [];
    this.after = null;
    this.fetchData();
  }

  loadMore(): void {
    this.page++;
    this.fetchData();
  }
}

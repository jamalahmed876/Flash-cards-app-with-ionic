import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AlertController } from 'ionic-angular';
import { HomePage } from '../home/home'

/**
 * Generated class for the CardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-card',
  templateUrl: 'card.html',
})
export class CardPage {

  cardHeight: any;
  wordsToShow: any[];
  showingWord: boolean;
  showing: any;
  numwords: number;
  currIndex: number;
  progress: string;
  wordMargin: string;
  hasExtraInfo: boolean;
  selectedNum: string;
  startNumber: string = "";
  finishNumber: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public sqlite: SQLite, public alertcntrl: AlertController) {
    this.cardHeight = this.navParams.get("cardHeight");
    this.wordsToShow = this.navParams.get("wordsToShow");
    this.showingWord = true;
    this.showing = this.wordsToShow[0];
    this.numwords = this.navParams.get("numwords");
    this.currIndex = 0;
    this.progress = this.navParams.get("progress");
    this.wordMargin = this.navParams.get("wordMargin");
    this.hasExtraInfo = this.navParams.get("hasExtraInfo");
    this.selectedNum = this.navParams.get("selectedNum");
    this.startNumber = this.navParams.get("startNumber");
    this.finishNumber = this.navParams.get("finishNumber");
  }

  showOKAlert (heading, message) {
    let alert = this.alertcntrl.create({
      title: heading,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  showYNAlert (heading, message) {
    let alert = this.alertcntrl.create({
      title: heading,
      subTitle: message,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let tout = setTimeout(()=>{this.navCtrl.push(HomePage, {}, {animate: false});}, 100);
          }
        }, 'No'
      ]
    });
    alert.present();
  }

  makeProgressString () {
    if(this.selectedNum == "no") {
      //this.progress = "Doing " + this.startNumber + "-" + this.finishNumber + ". Currently on: "  + (Number(this.startNumber) + Number(this.currIndex));
      this.progress = "    Word: " + (Number(this.startNumber) + Number(this.currIndex));
    } else {
      this.progress = (this.currIndex + 1) + "/" + this.selectedNum;
    }
  }

  cardTap () {
    if (this.showingWord) {
      this.showingWord = false;
    } else {
      if (this.currIndex < this.numwords-1) {
        this.currIndex = this.currIndex+1;
        this.showingWord = true;
        this.showing = this.wordsToShow[this.currIndex];
      } else {
        this.showOKAlert ("Congratulations!","You have completed your set of words!")
        this.navCtrl.push(HomePage, {}, {animate: false});
      }
    }
    this.makeProgressString();
  }

  goBack() {
    this.showYNAlert('Confirmation!', 'Are you sure you want to quit revision and go back to home page?');
  }

}

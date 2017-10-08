import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {CardPage} from '../card/card';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  listsArr: any[];
  nums: any[];
  selectedList: string;
  selectedNum: string;
  listFunction: string;
  showLogIn: boolean;
  showFirstRadio: boolean;
  showSecondRadio: boolean;
  showCards: boolean;
  cardHeight: any;
  halfHeight: any;
  wordsToShow: any[];
  showingWord: boolean;
  showing: any;
  numwords: number;
  currIndex: number;
  inputWidth: any;
  inputWidth2: any;
  inputDisplay: string = "none";
  startNumber: string = "";
  finishNumber: string = "";
  listSize: number;
  progress: string;
  wordMargin: string;
  hasExtraInfo: boolean;
  email_address: string = "";


  constructor(public navCtrl: NavController, public platform: Platform, public sqlite: SQLite, public alertcntrl: AlertController, public storage: Storage, public http: Http) {
    this.inputWidth = this.platform.width() / 2 - 30;
    this.inputWidth = this.inputWidth as string;
    this.inputWidth = this.inputWidth + "px";
    this.cardHeight = this.platform.height() - 157 - 20;
    this.halfHeight = this.cardHeight / 2 - 50;
    this.cardHeight = this.cardHeight as string;
    this.halfHeight = this.halfHeight as string;
    this.cardHeight = this.cardHeight + "px";
    this.halfHeight = this.halfHeight + "px";
    this.wordMargin = "18px";
    this.inputWidth2 = this.platform.width() - 50;
    this.inputWidth2 = this.inputWidth2 + "px";

    this.nums = [];
    this.nums.push({text:"50", checked:"false"});
    this.nums.push({text:"25", checked:"false"});
    //this.nums.push({text:"10", checked:"false"});
    this.nums[0].checked = "true";
    this.storage.get("user").then(data => {
      if (data == null) {
        this.showLogIn = true;
        this.showFirstRadio = false;
      } else {
        this.showLogIn = false;
        this.showFirstRadio = true;
      }
    })

    this.showSecondRadio = false;
    this.showCards = false;
    this.listsArr = [];
    this.listsArr.push({text:"Greatest Hits 1", val:"hits1", checked:"false"});
    this.listsArr.push({text:"Greatest Hits 2", val:"hits2", checked:"false"});
    this.listsArr.push({text:"GRE Wordlist", val:"gre", checked:"false"});
    this.listsArr[0].checked = "true";
    this.defaultNumAndList();

    /*this.http.get("http://jamalahmed-com.stackstaging.com/fcapp/getdata.php?email=jamal@connect.hku.hk")
    .map(res => res.json())
    .subscribe(data => {alert(data)})*/

    platform.registerBackButtonAction(() => {
      this.goBack();
    });
  }

  defaultNumAndList () {
    this.selectedNum = this.nums[0].text;
    this.selectedList = this.listsArr[0].val;
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
            if (this.showCards){
              this.showCards = false;
              let tout = setTimeout(()=>{this.showFirstRadio = true; this.defaultNumAndList();}, 100);
            } else if(this.showFirstRadio) {
              this.platform.exitApp();
            }
          }
        }, 'No'
      ]
    });
    alert.present();
  }

  setSelectedList(item) {
    this.selectedList = item.val;
  }

  setSelectedNum(item) {
    this.selectedNum = item;
    if (item=="no") {
      this.inputDisplay = "block";
    } else {
      this.inputDisplay = "none";
    }
  }

  showPage2(event) {
    this.showFirstRadio = false;
    this.showSecondRadio = true;
  }

  start(event) {
    this.showSecondRadio = false;
    this.showCards = true;
  }

  checkListExists () {
    this.sqlite.create({
      name: "wordlists.db",
      location: "default"
    }).then ((db: SQLiteObject) => {
      db.executeSql("SELECT count(*) as myCount FROM " + this.selectedList, {})
        .then((res)=>{
          this.listSize = Number(res.rows.item(0).myCount);
          this.showFirstRadio = false;
          this.showSecondRadio = true;
          this.inputDisplay = "none";
          if (this.selectedList == "hits1" || this.selectedList == "gre") {
            this.hasExtraInfo = true;
            this.wordMargin = "20px";
          } else {
            this.hasExtraInfo = false;
            this.wordMargin = "30px";
          }
          this.storage.get(this.selectedList+"start").then((val)=>{
            if (val != null) {
              this.startNumber = val;
            }
          });
          this.storage.get(this.selectedList+"finish").then((val)=>{
            if (val != null) {
              this.finishNumber = val;
            }
          });
        })
        .catch(e => this.showOKAlert("Error!","Could not open list. Try again later!"));

      /*db.executeSql("SELECT word FROM " + this.selectedList + " ORDER BY RANDOM() LIMIT 1", {})
        .then((res) => {

        })
        .catch(e => alert(e.message));*/
    }).catch(e => this.showOKAlert("Error!", "Something went terribly wrong. Please try re-installing the app."));
  }

  startShowing () {
    this.showSecondRadio = false;
    this.showCards = true;
    this.showingWord = true;
    this.currIndex = 0;
    this.showing = this.wordsToShow[0];
    this.makeProgressString();
    this.navCtrl.push(CardPage, {
      cardHeight: this.cardHeight,
      wordsToShow: this.wordsToShow,
      numwords: this.numwords,
      progress: this.progress,
      wordMargin: this.wordMargin,
      hasExtraInfo: this.hasExtraInfo,
      selectedNum: this.selectedNum,
      startNumber: this.startNumber,
      finishNumber: this.finishNumber
    }, {animate: false});
  }

  getTheWords() {
    this.wordsToShow =  [];
    if (this.selectedNum != "no") {
      this.numwords = Number(this.selectedNum);
    }
    this.sqlite.create({
      name: "wordlists.db",
      location: "default"
    }).then ((db: SQLiteObject) => {
      if (this.selectedNum != "no") {
        db.executeSql("SELECT * FROM " + this.selectedList + " ORDER BY RANDOM() LIMIT " + this.selectedNum, {})
          .then((res)=>{
            /*for (let i=0; i<this.numwords; i++) {
              this.wordsToShow.push({word: res.rows.item(i).word, meaning: res.rows.item(i).meaning});
            }*/
            this.storeWords(res);
            this.startShowing();
          }).catch(e => alert('error'));
      } else {
        if (this.finishNumber == "" || this.startNumber == "") {
          this.showOKAlert('Error!', 'One or both of the inputs are empty.')
        }
        else if (Number(this.startNumber)==0) {
          this.showOKAlert('Error!', 'Please start from 1!')
        }
        else if (Number(this.finishNumber)<=Number(this.startNumber) || Number(this.finishNumber)>this.listSize){
          this.showOKAlert('Error!', 'Please make sure finish number is greater than start number and that both numbers are less than list size.')
        } else {
          this.storage.set(this.selectedList+"start", this.startNumber);
          this.storage.set(this.selectedList+"finish", this.finishNumber);

          db.executeSql("Select * FROM " + this.selectedList + " WHERE id BETWEEN " + this.startNumber + " AND " + this.finishNumber, {})
            .then((res)=>{
              this.numwords = Number(this.finishNumber) - Number(this.startNumber) + 1;
              /*for (let i=0; i<this.numwords; i++) {
                this.wordsToShow.push({word: res.rows.item(i).word, meaning: res.rows.item(i).meaning});
              }*/
              this.storeWords(res);
              this.startShowing();
            }).catch(e => alert('error'));
        }
      }
    });
  }

  storeWords (res) {
    for (let i=0; i<this.numwords; i++) {
      if (this.hasExtraInfo) {
        this.wordsToShow.push({word: res.rows.item(i).word, meaning: res.rows.item(i).meaning, pos: res.rows.item(i).pos, example: res.rows.item(i).example});
      } else {
        this.wordsToShow.push({word: res.rows.item(i).word, meaning: res.rows.item(i).meaning});
      }
    }
  }

  /*testdb () {
    this.sqlite.create({
    name: 'wordlists7.db',
    location: 'default'
    })
    .then((db: SQLiteObject) => {


      db.executeSql('select * from hits1', {})
        .then(() => alert('Executed SQL'))
        .catch(e => alert(e.message));


    })
  }*/

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
        this.showCards = false;
        this.showFirstRadio = true;
        this.defaultNumAndList();
      }
    }
    this.makeProgressString();
  }

  goBack() {
    if (this.showCards) {
      this.showYNAlert('Confirmation!', 'Are you sure you want to quit revision and go back to home page?');
    } if (this.showSecondRadio) {
      this.showSecondRadio = false;
      let tout = setTimeout(()=>{this.showFirstRadio = true; this.defaultNumAndList();}, 100);

    } if (this.showFirstRadio) {
      this.showYNAlert('Want to exit?', 'Are you sure you want to exit the app?');
    }
  }

  checkEmail() {
    if(this.email_address=="") {
      this.showOKAlert("Error!", "Please enter an email address");
    } else {
      //var mydata = JSON.stringify({accesskey: "74f56399c89f4bd03ff5e85b6bf4e85f", email: this.email_address})
      this.http.get("http://aneeshussain.com/fcapp/getdata.php?accesskey=74f56399c89f4bd03ff5e85b6bf4e85f&email="+this.email_address)
      .map(res => res.json())
      .subscribe(data => {
        if(data==50) {
          this.showOKAlert("Error!", "The email address has not been validated.");
        } else if (data==30) {
          this.showOKAlert("Error!", "You have already registered the maximum number of devices.");
        } else if (data==20) {
          this.showOKAlert("Error!", "The email adress has not been registered.")
        } else if (data==10) {
          this.showOKAlert("Error!", "Invalid email address.")
        } else {
          this.storage.set("user", this.email_address);
          this.showOKAlert("Logged In!", "Log in successful! You will not be asked to log in again.")
          this.showLogIn = false;
          this.showFirstRadio = true;
        }
      }, err => {
        this.showOKAlert("Error!", "An error occured. Please check your connection or try again later.")
      });
    }
  }


  test() {
    alert('test');
  }

}

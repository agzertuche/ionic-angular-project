import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../services/places.service';
import {
  NavController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { Place } from '../../services/place.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  placeId: string;
  form: FormGroup;
  isLoading = false;
  private PlaceSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private navCtrl: NavController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private altertCtrl: AlertController,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      this.placeId = paramMap.get('placeId');
      if (!this.placeId) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.isLoading = true;
      this.PlaceSub = this.placesService.getPlace(this.placeId).subscribe(
        place => {
          this.place = place;
          this.form = new FormGroup({
            title: new FormControl(this.place.title, {
              updateOn: 'blur',
              validators: [Validators.required],
            }),
            description: new FormControl(this.place.description, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.maxLength(180)],
            }),
          });
          this.isLoading = false;
        },
        error => {
          this.altertCtrl
            .create({
              header: 'An error ocurred',
              message: 'Please try again later',
              buttons: [
                {
                  text: 'Okay',
                  handler: () => {
                    this.router.navigate(['/places/tabs/offers']);
                  },
                },
              ],
            })
            .then(alertElem => alertElem.present());
        },
      );
    });
  }

  ngOnDestroy() {
    if (this.PlaceSub) {
      this.PlaceSub.unsubscribe();
    }
  }

  onOfferUpdated() {
    if (!this.form.valid) {
      return;
    }

    this.loadingCtrl
      .create({
        message: 'Updating place...',
      })
      .then(loadingelem => {
        loadingelem.present();
        this.placesService
          .updatePlace(
            this.place.id,
            this.form.value.title,
            this.form.value.description,
          )
          .subscribe(() => {
            loadingelem.dismiss();
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
  }
}
